import {
  createRecurringAppointments,
  updateRecurringSeries,
  deleteRecurringSeries,
  getSeriesAppointments,
} from '../../../src/services/recurrence.service';
import { pool } from '../../../src/config/database.config';

jest.mock('../../../src/config/database.config');

describe('RecurrenceService', () => {
  let mockConnect: jest.Mock;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockConnect = jest.fn().mockResolvedValue(mockClient);
    (pool.connect as jest.Mock) = mockConnect;
    (pool.query as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRecurringAppointments', () => {
    it('should create daily recurring appointments', async () => {
      const mockSeries = { id: 'series-1' };
      const mockAppointment = {
        id: 'apt-1',
        title: 'Daily Meeting',
        start_time: '2026-01-15T10:00:00Z',
        end_time: '2026-01-15T11:00:00Z',
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockSeries] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        title: 'Daily Meeting',
        appointment_type: 'consultation',
        location_type: 'office',
        location_address: '123 Main St',
        start_time: '2026-01-15T10:00:00Z',
        duration: 60,
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        recurrence: {
          frequency: 'daily' as const,
          interval: 1,
          occurrences: 3,
        },
      };

      const result = await createRecurringAppointments(input);

      expect(result.success).toBe(true);
      expect(result.seriesId).toBe('series-1');
      expect(result.count).toBe(3);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should create weekly recurring appointments', async () => {
      const mockSeries = { id: 'series-2' };
      const mockAppointment = { id: 'apt-1', title: 'Weekly Meeting' };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockSeries] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        title: 'Weekly Meeting',
        appointment_type: 'consultation',
        location_type: 'video',
        meeting_url: 'https://meet.example.com',
        start_time: '2026-01-20T14:00:00Z',
        duration: 30,
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        recurrence: {
          frequency: 'weekly' as const,
          interval: 1,
          daysOfWeek: [1, 3], // Monday, Wednesday
          occurrences: 4,
        },
      };

      const result = await createRecurringAppointments(input);

      expect(result.success).toBe(true);
      expect(result.seriesId).toBe('series-2');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('appointment_series'),
        expect.arrayContaining(['weekly', 1, [1, 3]])
      );
    });

    it('should create monthly recurring appointments', async () => {
      const mockSeries = { id: 'series-3' };
      const mockAppointment = { id: 'apt-1' };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockSeries] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        title: 'Monthly Review',
        appointment_type: 'review',
        location_type: 'office',
        start_time: '2026-01-15T10:00:00Z',
        duration: 120,
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        recurrence: {
          frequency: 'monthly' as const,
          interval: 1,
          occurrences: 6,
        },
      };

      const result = await createRecurringAppointments(input);

      expect(result.success).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('appointment_series'),
        expect.arrayContaining(['monthly', 1])
      );
    });

    it('should create appointments with end date', async () => {
      const mockSeries = { id: 'series-4' };
      const mockAppointment = { id: 'apt-1' };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockSeries] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        title: 'Limited Series',
        appointment_type: 'consultation',
        location_type: 'office',
        start_time: '2026-01-15T10:00:00Z',
        duration: 60,
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        recurrence: {
          frequency: 'weekly' as const,
          interval: 1,
          endDate: '2026-02-15',
        },
      };

      const result = await createRecurringAppointments(input);

      expect(result.success).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('appointment_series'),
        expect.arrayContaining(['weekly', 1, null, '2026-02-15'])
      );
    });

    it('should include case_id if provided', async () => {
      const mockSeries = { id: 'series-5' };
      const mockAppointment = { id: 'apt-1', case_id: 'case-1' };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockSeries] })
        .mockResolvedValueOnce({ rows: [mockAppointment] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        title: 'Case Meeting',
        appointment_type: 'consultation',
        location_type: 'office',
        start_time: '2026-01-15T10:00:00Z',
        duration: 60,
        case_id: 'case-1',
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        recurrence: {
          frequency: 'weekly' as const,
          interval: 1,
          occurrences: 2,
        },
      };

      const result = await createRecurringAppointments(input);

      expect(result.success).toBe(true);
    });

    it('should rollback on error', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockRejectedValueOnce(new Error('Database error'));

      const input = {
        title: 'Test',
        appointment_type: 'consultation',
        location_type: 'office',
        start_time: '2026-01-15T10:00:00Z',
        duration: 60,
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        recurrence: {
          frequency: 'daily' as const,
          interval: 1,
          occurrences: 3,
        },
      };

      await expect(createRecurringAppointments(input)).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle large interval for daily recurrence', async () => {
      const mockSeries = { id: 'series-6' };
      const mockAppointment = { id: 'apt-1' };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockSeries] })
        .mockResolvedValueOnce({ rows: [{ ...mockAppointment, id: 'apt-1' }] })
        .mockResolvedValueOnce({ rows: [{ ...mockAppointment, id: 'apt-2' }] })
        .mockResolvedValueOnce({ rows: [{ ...mockAppointment, id: 'apt-3' }] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        title: 'Bi-weekly Meeting',
        appointment_type: 'consultation',
        location_type: 'office',
        start_time: '2026-01-15T10:00:00Z',
        duration: 60,
        client_id: 'client-1',
        lawyer_id: 'lawyer-1',
        recurrence: {
          frequency: 'daily' as const,
          interval: 14,
          occurrences: 3,
        },
      };

      const result = await createRecurringAppointments(input);

      expect(result.success).toBe(true);
    });
  });

  describe('updateRecurringSeries', () => {
    it('should update all future appointments in series', async () => {
      const mockUpdatedAppointments = [
        { id: 'apt-1', title: 'Updated Title' },
        { id: 'apt-2', title: 'Updated Title' },
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: mockUpdatedAppointments, rowCount: 2 })
        .mockResolvedValueOnce({ rows: [] });

      const updates = {
        title: 'Updated Title',
        appointment_type: 'review',
        location_type: 'video',
        meeting_url: 'https://new-url.com',
      };

      const result = await updateRecurringSeries('series-1', updates);

      expect(result.success).toBe(true);
      expect(result.updated).toBe(2);
      expect(result.appointments).toEqual(mockUpdatedAppointments);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should only update scheduled and confirmed appointments', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [] });

      const result = await updateRecurringSeries('series-1', { title: 'New Title' });

      expect(result.updated).toBe(0);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("status IN ('scheduled', 'confirmed')"),
        expect.any(Array)
      );
    });

    it('should only update future appointments', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [] });

      await updateRecurringSeries('series-1', { title: 'New Title' });

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('start_time >= NOW()'),
        expect.any(Array)
      );
    });

    it('should handle partial updates', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'apt-1' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [] });

      const result = await updateRecurringSeries('series-1', {
        title: 'New Title',
      });

      expect(result.success).toBe(true);
      expect(result.updated).toBe(1);
    });

    it('should rollback on error', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockRejectedValueOnce(new Error('Update failed'));

      await expect(updateRecurringSeries('series-1', { title: 'Test' })).rejects.toThrow(
        'Update failed'
      );

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('deleteRecurringSeries', () => {
    it('should cancel all future appointments in series', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'apt-1' }, { id: 'apt-2' }], rowCount: 2 })
        .mockResolvedValueOnce({ rows: [] });

      const result = await deleteRecurringSeries('series-1');

      expect(result.success).toBe(true);
      expect(result.cancelled).toBe(2);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should only cancel scheduled and confirmed appointments', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [] });

      const result = await deleteRecurringSeries('series-1');

      expect(result.cancelled).toBe(0);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("status IN ('scheduled', 'confirmed')"),
        expect.any(Array)
      );
    });

    it('should only cancel future appointments', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [] });

      await deleteRecurringSeries('series-1');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('start_time >= NOW()'),
        expect.any(Array)
      );
    });

    it('should set status to cancelled', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'apt-1' }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [] });

      await deleteRecurringSeries('series-1');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'cancelled'"),
        expect.any(Array)
      );
    });

    it('should rollback on error', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteRecurringSeries('series-1')).rejects.toThrow('Delete failed');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getSeriesAppointments', () => {
    it('should return all appointments in series', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          title: 'Meeting 1',
          start_time: '2026-01-15T10:00:00Z',
          end_time: '2026-01-15T11:00:00Z',
          client_name: 'John Doe',
        },
        {
          id: 'apt-2',
          title: 'Meeting 2',
          start_time: '2026-01-22T10:00:00Z',
          end_time: '2026-01-22T11:00:00Z',
          client_name: 'John Doe',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockAppointments });

      const result = await getSeriesAppointments('series-1');

      expect(result).toEqual(mockAppointments);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.series_id = $1'),
        ['series-1']
      );
    });

    it('should order appointments by start date', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await getSeriesAppointments('series-1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY a.start_date'),
        expect.any(Array)
      );
    });

    it('should include client information', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await getSeriesAppointments('series-1');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN users c ON a.client_id = c.id'),
        expect.any(Array)
      );
    });

    it('should return empty array if no appointments', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await getSeriesAppointments('series-1');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

      await expect(getSeriesAppointments('series-1')).rejects.toThrow('Query failed');
    });
  });
});