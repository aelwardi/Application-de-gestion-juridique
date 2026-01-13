import * as autoCompleteJob from '../../../src/jobs/auto-complete-appointments.job';
import { pool } from '../../../src/config/database.config';

jest.mock('../../../src/config/database.config');

describe('AutoCompleteAppointmentsJob', () => {
  const mockPool = pool as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('autoCompleteAppointments', () => {
    it('should mark appointments as completed successfully', async () => {
      const mockAppointments = [
        { id: 'apt-1' },
        { id: 'apt-2' },
        { id: 'apt-3' },
      ];

      mockPool.query.mockResolvedValue({
        rows: mockAppointments,
        rowCount: 3,
      } as any);

      const result = await autoCompleteJob.autoCompleteAppointments();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointments')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'completed'")
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE status IN ('pending', 'confirmed')")
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND end_date < NOW()')
      );
      expect(result).toBe(3);
    });

    it('should return 0 when no appointments to complete', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as any);

      const result = await autoCompleteJob.autoCompleteAppointments();

      expect(mockPool.query).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should handle null rowCount', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: null,
      } as any);

      const result = await autoCompleteJob.autoCompleteAppointments();

      expect(result).toBe(0);
    });

    it('should throw error when database query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection lost'));

      await expect(autoCompleteJob.autoCompleteAppointments()).rejects.toThrow(
        'Database connection lost'
      );
    });

    it('should mark only pending and confirmed appointments', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ id: 'apt-1' }],
        rowCount: 1,
      } as any);

      await autoCompleteJob.autoCompleteAppointments();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("status IN ('pending', 'confirmed')")
      );
    });

    it('should only mark appointments with end_date in the past', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ id: 'apt-1' }],
        rowCount: 1,
      } as any);

      await autoCompleteJob.autoCompleteAppointments();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('end_date < NOW()')
      );
    });
  });

  describe('getAppointmentsToComplete', () => {
    it('should retrieve appointments to complete successfully', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          title: 'Consultation',
          end_time: new Date('2024-01-10T10:00:00Z'),
          status: 'confirmed',
          client_first_name: 'John',
          client_last_name: 'Doe',
          lawyer_first_name: 'Jane',
          lawyer_last_name: 'Smith',
        },
        {
          id: 'apt-2',
          title: 'Follow-up',
          end_time: new Date('2024-01-09T14:00:00Z'),
          status: 'pending',
          client_first_name: 'Alice',
          client_last_name: 'Johnson',
          lawyer_first_name: 'Bob',
          lawyer_last_name: 'Williams',
        },
      ];

      mockPool.query.mockResolvedValue({
        rows: mockAppointments,
        rowCount: 2,
      } as any);

      const result = await autoCompleteJob.getAppointmentsToComplete();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM appointments a')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN users c ON a.client_id = c.id')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN users l ON a.lawyer_id = l.id')
      );
      expect(result).toEqual(mockAppointments);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no appointments to complete', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as any);

      const result = await autoCompleteJob.getAppointmentsToComplete();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should order appointments by end_date ascending', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
      } as any);

      await autoCompleteJob.getAppointmentsToComplete();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY a.end_date ASC')
      );
    });

    it('should throw error when database query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Query execution failed'));

      await expect(autoCompleteJob.getAppointmentsToComplete()).rejects.toThrow(
        'Query execution failed'
      );
    });

    it('should include all necessary appointment details', async () => {
      const mockAppointment = {
        id: 'apt-1',
        title: 'Legal Consultation',
        end_time: new Date('2024-01-10T10:00:00Z'),
        status: 'confirmed',
        client_first_name: 'John',
        client_last_name: 'Doe',
        lawyer_first_name: 'Jane',
        lawyer_last_name: 'Smith',
      };

      mockPool.query.mockResolvedValue({
        rows: [mockAppointment],
        rowCount: 1,
      } as any);

      const result = await autoCompleteJob.getAppointmentsToComplete();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('end_time');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('client_first_name');
      expect(result[0]).toHaveProperty('client_last_name');
      expect(result[0]).toHaveProperty('lawyer_first_name');
      expect(result[0]).toHaveProperty('lawyer_last_name');
    });
  });
});