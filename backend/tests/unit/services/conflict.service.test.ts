import {
  checkConflicts,
  findAvailableSlots,
  isSlotAvailable,
} from '../../../src/services/conflict.service';
import { pool } from '../../../src/config/database.config';

jest.mock('../../../src/config/database.config');

describe('ConflictService', () => {
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkConflicts', () => {
    it('should find conflicting appointments', async () => {
      const mockConflicts = [
        {
          id: 'apt-1',
          title: 'Existing Meeting',
          start_time: '2026-01-20T10:00:00Z',
          end_time: '2026-01-20T11:00:00Z',
          client_name: 'John Doe',
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockConflicts });

      const result = await checkConflicts(
        'lawyer-1',
        '2026-01-20T10:30:00Z',
        '2026-01-20T11:30:00Z'
      );

      expect(result).toEqual(mockConflicts);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.lawyer_id = $1'),
        expect.arrayContaining(['lawyer-1', '2026-01-20T10:30:00Z', '2026-01-20T11:30:00Z'])
      );
    });

    it('should return empty array when no conflicts', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await checkConflicts(
        'lawyer-1',
        '2026-01-20T14:00:00Z',
        '2026-01-20T15:00:00Z'
      );

      expect(result).toEqual([]);
    });

    it('should check for overlapping start times', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await checkConflicts('lawyer-1', '2026-01-20T10:00:00Z', '2026-01-20T11:00:00Z');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('a.start_date >= $2 AND a.start_date < $3'),
        expect.any(Array)
      );
    });

    it('should check for overlapping end times', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await checkConflicts('lawyer-1', '2026-01-20T10:00:00Z', '2026-01-20T11:00:00Z');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('a.end_date > $2 AND a.end_date <= $3'),
        expect.any(Array)
      );
    });

    it('should check for containing appointments', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await checkConflicts('lawyer-1', '2026-01-20T10:00:00Z', '2026-01-20T11:00:00Z');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('a.start_date <= $2 AND a.end_date >= $3'),
        expect.any(Array)
      );
    });

    it('should only check pending and confirmed appointments', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await checkConflicts('lawyer-1', '2026-01-20T10:00:00Z', '2026-01-20T11:00:00Z');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("status IN ('pending', 'confirmed')"),
        expect.any(Array)
      );
    });

    it('should exclude specific appointment when provided', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await checkConflicts(
        'lawyer-1',
        '2026-01-20T10:00:00Z',
        '2026-01-20T11:00:00Z',
        'apt-exclude'
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND a.id != $4'),
        expect.arrayContaining(['apt-exclude'])
      );
    });

    it('should not exclude appointment when not provided', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await checkConflicts('lawyer-1', '2026-01-20T10:00:00Z', '2026-01-20T11:00:00Z');

      const query = mockQuery.mock.calls[0][0];
      expect(query).not.toContain('AND a.id != $4');
    });

    it('should order results by start date', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await checkConflicts('lawyer-1', '2026-01-20T10:00:00Z', '2026-01-20T11:00:00Z');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY a.start_date'),
        expect.any(Array)
      );
    });

    it('should include client information', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await checkConflicts('lawyer-1', '2026-01-20T10:00:00Z', '2026-01-20T11:00:00Z');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN users c ON a.client_id = c.id'),
        expect.any(Array)
      );
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(
        checkConflicts('lawyer-1', '2026-01-20T10:00:00Z', '2026-01-20T11:00:00Z')
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAvailableSlots', () => {
    it('should find available time slots', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await findAvailableSlots('lawyer-1', '2026-01-20', 60);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('start');
      expect(result[0]).toHaveProperty('end');
      expect(result[0]).toHaveProperty('label');
    });

    it('should exclude booked time slots', async () => {
      const mockBookedSlots = [
        {
          start_time: '2026-01-20T10:00:00Z',
          end_time: '2026-01-20T11:00:00Z',
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockBookedSlots });

      const result = await findAvailableSlots('lawyer-1', '2026-01-20', 60);

      const conflictingSlot = result.find(
        (slot) =>
          new Date(slot.start) >= new Date('2026-01-20T10:00:00Z') &&
          new Date(slot.start) < new Date('2026-01-20T11:00:00Z')
      );

      expect(conflictingSlot).toBeUndefined();
    });

    it('should respect work hours (9am to 6pm)', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await findAvailableSlots('lawyer-1', '2026-01-20', 60);

      result.forEach((slot) => {
        const startHour = new Date(slot.start).getUTCHours();
        const endHour = new Date(slot.end).getUTCHours();
        expect(startHour).toBeGreaterThanOrEqual(9);
        expect(endHour).toBeLessThanOrEqual(18);
      });
    });

    it('should generate 30-minute interval slots', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await findAvailableSlots('lawyer-1', '2026-01-20', 60);

      const firstTwoSlots = result.slice(0, 2);
      if (firstTwoSlots.length === 2) {
        const diff =
          new Date(firstTwoSlots[1].start).getTime() -
          new Date(firstTwoSlots[0].start).getTime();
        expect(diff).toBe(30 * 60 * 1000); // 30 minutes
      }
    });

    it('should use custom duration', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await findAvailableSlots('lawyer-1', '2026-01-20', 30);

      if (result.length > 0) {
        const firstSlot = result[0];
        const duration =
          new Date(firstSlot.end).getTime() - new Date(firstSlot.start).getTime();
        expect(duration).toBe(30 * 60 * 1000); // 30 minutes
      }
    });

    it('should use default duration of 60 minutes', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await findAvailableSlots('lawyer-1', '2026-01-20');

      if (result.length > 0) {
        const firstSlot = result[0];
        const duration =
          new Date(firstSlot.end).getTime() - new Date(firstSlot.start).getTime();
        expect(duration).toBe(60 * 60 * 1000); // 60 minutes
      }
    });

    it('should format slot labels correctly', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await findAvailableSlots('lawyer-1', '2026-01-20', 60);

      if (result.length > 0) {
        expect(result[0].label).toMatch(/^\d{1,2}:\d{2} - \d{1,2}:\d{2}$/);
      }
    });

    it('should query appointments for specific date', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await findAvailableSlots('lawyer-1', '2026-01-20', 60);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE lawyer_id = $1'),
        expect.arrayContaining(['lawyer-1'])
      );
    });

    it('should only consider pending and confirmed appointments', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await findAvailableSlots('lawyer-1', '2026-01-20', 60);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("status IN ('pending', 'confirmed')"),
        expect.any(Array)
      );
    });

    it('should not include slots that end after work hours', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await findAvailableSlots('lawyer-1', '2026-01-20', 120);

      result.forEach((slot) => {
        const endHour = new Date(slot.end).getUTCHours();
        expect(endHour).toBeLessThanOrEqual(18);
      });
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(findAvailableSlots('lawyer-1', '2026-01-20', 60)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('isSlotAvailable', () => {
    it('should return true when no conflicts', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await isSlotAvailable(
        'lawyer-1',
        '2026-01-20T14:00:00Z',
        '2026-01-20T15:00:00Z'
      );

      expect(result).toBe(true);
    });

    it('should return false when conflicts exist', async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            id: 'apt-1',
            title: 'Existing Meeting',
            start_time: '2026-01-20T14:00:00Z',
            end_time: '2026-01-20T15:00:00Z',
          },
        ],
      });

      const result = await isSlotAvailable(
        'lawyer-1',
        '2026-01-20T14:30:00Z',
        '2026-01-20T15:30:00Z'
      );

      expect(result).toBe(false);
    });

    it('should exclude specific appointment when checking', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await isSlotAvailable(
        'lawyer-1',
        '2026-01-20T14:00:00Z',
        '2026-01-20T15:00:00Z',
        'apt-exclude'
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['apt-exclude'])
      );
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(
        isSlotAvailable('lawyer-1', '2026-01-20T14:00:00Z', '2026-01-20T15:00:00Z')
      ).rejects.toThrow('Database error');
    });
  });
});