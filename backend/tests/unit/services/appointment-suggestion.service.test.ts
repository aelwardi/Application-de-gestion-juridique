import {
  createSuggestion,
  getUserSuggestions,
  acceptSuggestion,
  rejectSuggestion,
  counterSuggestion,
} from '../../../src/services/appointment-suggestion.service';
import { pool } from '../../../src/config/database.config';
import { NotificationService } from '../../../src/services/notification.service';
import { sendCustomEmail } from '../../../src/services/email.service';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../src/config/database.config');
jest.mock('../../../src/services/notification.service');
jest.mock('../../../src/services/email.service');
jest.mock('uuid');

describe('AppointmentSuggestionService', () => {
  let mockQuery: jest.Mock;
  let mockConnect: jest.Mock;
  let mockClient: any;
  let mockCreateNotification: jest.Mock;
  let mockSendEmail: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockConnect = jest.fn().mockResolvedValue(mockClient);
    (pool.query as jest.Mock) = mockQuery;
    (pool.connect as jest.Mock) = mockConnect;

    mockCreateNotification = jest.fn().mockResolvedValue({ id: 'notif-1' });
    (NotificationService as jest.Mock).mockImplementation(() => ({
      createNotification: mockCreateNotification,
    }));

    mockSendEmail = jest.fn().mockResolvedValue(true);
    (sendCustomEmail as jest.Mock) = mockSendEmail;

    (uuidv4 as jest.Mock).mockReturnValue('uuid-1234');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSuggestion', () => {
    it('should create a suggestion and send notifications', async () => {
      const mockSuggestion = {
        id: 'uuid-1234',
        suggested_by_user_id: 'client-1',
        suggested_to_user_id: 'lawyer-1',
        suggested_start_time: '2026-01-20T10:00:00Z',
        suggested_end_time: '2026-01-20T11:00:00Z',
        status: 'pending',
        notes: 'Test note',
      };

      const mockClient = {
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'client@test.com',
      };

      const mockLawyer = {
        first_name: 'Marie',
        last_name: 'Martin',
        email: 'lawyer@test.com',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockSuggestion] })
        .mockResolvedValueOnce({ rows: [mockClient] })
        .mockResolvedValueOnce({ rows: [mockLawyer] });

      const input = {
        suggested_by_user_id: 'client-1',
        suggested_to_user_id: 'lawyer-1',
        suggested_start_time: '2026-01-20T10:00:00Z',
        suggested_end_time: '2026-01-20T11:00:00Z',
        notes: 'Test note',
      };

      const result = await createSuggestion(input);

      expect(result).toEqual(mockSuggestion);
      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(mockCreateNotification).toHaveBeenCalledWith({
        user_id: 'lawyer-1',
        notification_type: 'appointment_suggestion',
        title: 'Nouvelle proposition de créneau',
        message: expect.stringContaining('Jean Dupont'),
        data: expect.objectContaining({
          suggestion_id: 'uuid-1234',
        }),
      });
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'lawyer@test.com',
        subject: expect.stringContaining('Jean Dupont'),
        html: expect.stringContaining('Marie'),
      });
    });

    it('should create suggestion with appointment_id', async () => {
      const mockSuggestion = { id: 'uuid-1234', appointment_id: 'apt-1' };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockSuggestion] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        appointment_id: 'apt-1',
        suggested_by_user_id: 'client-1',
        suggested_to_user_id: 'lawyer-1',
        suggested_start_time: '2026-01-20T10:00:00Z',
        suggested_end_time: '2026-01-20T11:00:00Z',
      };

      const result = await createSuggestion(input);

      expect(result.appointment_id).toBe('apt-1');
    });

    it('should handle notification errors gracefully', async () => {
      const mockSuggestion = { id: 'uuid-1234' };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockSuggestion] })
        .mockResolvedValueOnce({ rows: [{ first_name: 'Jean', last_name: 'Dupont', email: 'c@test.com' }] })
        .mockResolvedValueOnce({ rows: [{ first_name: 'Marie', last_name: 'Martin', email: 'l@test.com' }] });

      mockCreateNotification.mockRejectedValue(new Error('Notification failed'));
      mockSendEmail.mockRejectedValue(new Error('Email failed'));

      const input = {
        suggested_by_user_id: 'client-1',
        suggested_to_user_id: 'lawyer-1',
        suggested_start_time: '2026-01-20T10:00:00Z',
        suggested_end_time: '2026-01-20T11:00:00Z',
      };

      const result = await createSuggestion(input);

      expect(result).toEqual(mockSuggestion);
    });

    it('should not send notifications if users not found', async () => {
      const mockSuggestion = { id: 'uuid-1234' };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockSuggestion] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const input = {
        suggested_by_user_id: 'client-1',
        suggested_to_user_id: 'lawyer-1',
        suggested_start_time: '2026-01-20T10:00:00Z',
        suggested_end_time: '2026-01-20T11:00:00Z',
      };

      await createSuggestion(input);

      expect(mockCreateNotification).not.toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });

  describe('getUserSuggestions', () => {
    it('should get suggestions suggested by user', async () => {
      const mockSuggestions = [
        { id: 'sugg-1', suggested_by_user_id: 'user-1', status: 'pending' },
        { id: 'sugg-2', suggested_by_user_id: 'user-1', status: 'accepted' },
      ];

      mockQuery.mockResolvedValue({ rows: mockSuggestions });

      const result = await getUserSuggestions('user-1', 'suggested_by');

      expect(result).toEqual(mockSuggestions);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('suggested_by = $1'),
        ['user-1']
      );
    });

    it('should get suggestions suggested to user', async () => {
      const mockSuggestions = [
        { id: 'sugg-1', suggested_to_user_id: 'lawyer-1', status: 'pending' },
      ];

      mockQuery.mockResolvedValue({ rows: mockSuggestions });

      const result = await getUserSuggestions('lawyer-1', 'suggested_to');

      expect(result).toEqual(mockSuggestions);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('suggested_to = $1'),
        ['lawyer-1']
      );
    });

    it('should return empty array if no suggestions', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await getUserSuggestions('user-1', 'suggested_by');

      expect(result).toEqual([]);
    });
  });

  describe('acceptSuggestion', () => {
    it('should accept suggestion and update existing appointment', async () => {
      const mockSuggestion = {
        id: 'sugg-1',
        appointment_id: 'apt-1',
        suggested_by_user_id: 'client-1',
        suggested_to_user_id: 'lawyer-1',
        suggested_start_time: '2026-01-20T10:00:00Z',
        suggested_end_time: '2026-01-20T11:00:00Z',
        status: 'accepted',
      };

      const mockAppointment = {
        id: 'apt-1',
        start_time: '2026-01-20T10:00:00Z',
        end_time: '2026-01-20T11:00:00Z',
        status: 'pending',
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockSuggestion] }) // UPDATE suggestion
        .mockResolvedValueOnce({ rows: [mockAppointment] }) // UPDATE appointment
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const result = await acceptSuggestion('sugg-1', 'lawyer-1');

      expect(result.suggestion).toEqual(mockSuggestion);
      expect(result.appointment).toEqual(mockAppointment);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockCreateNotification).toHaveBeenCalledWith({
        user_id: 'client-1',
        notification_type: 'suggestion_accepted',
        title: 'Créneau accepté',
        message: expect.stringContaining('acceptée'),
        data: expect.any(Object),
      });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should accept suggestion and create new appointment', async () => {
      const mockSuggestion = {
        id: 'sugg-1',
        appointment_id: null,
        suggested_by_user_id: 'client-1',
        suggested_to_user_id: 'lawyer-1',
        suggested_start_time: '2026-01-20T10:00:00Z',
        suggested_end_time: '2026-01-20T11:00:00Z',
        status: 'accepted',
      };

      const mockNewAppointment = {
        id: 'apt-new',
        start_time: '2026-01-20T10:00:00Z',
        end_time: '2026-01-20T11:00:00Z',
        status: 'pending',
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockSuggestion] })
        .mockResolvedValueOnce({ rows: [mockNewAppointment] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await acceptSuggestion('sugg-1', 'lawyer-1');

      expect(result.suggestion).toEqual(mockSuggestion);
      expect(result.appointment).toEqual(mockNewAppointment);
    });

    it('should throw error if suggestion not found', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(acceptSuggestion('sugg-1', 'lawyer-1')).rejects.toThrow(
        'Suggestion not found or unauthorized'
      );

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(acceptSuggestion('sugg-1', 'lawyer-1')).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle notification error gracefully', async () => {
      const mockSuggestion = {
        id: 'sugg-1',
        appointment_id: 'apt-1',
        suggested_by_user_id: 'client-1',
        suggested_to_user_id: 'lawyer-1',
        suggested_start_time: '2026-01-20T10:00:00Z',
        suggested_end_time: '2026-01-20T11:00:00Z',
        status: 'accepted',
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockSuggestion] })
        .mockResolvedValueOnce({ rows: [{}] })
        .mockResolvedValueOnce({ rows: [] });

      mockCreateNotification.mockRejectedValue(new Error('Notification failed'));

      const result = await acceptSuggestion('sugg-1', 'lawyer-1');

      expect(result.suggestion).toEqual(mockSuggestion);
    });
  });

  describe('rejectSuggestion', () => {
    it('should reject suggestion with reason', async () => {
      const mockSuggestion = {
        id: 'sugg-1',
        suggested_by_user_id: 'client-1',
        status: 'rejected',
        notes: 'Not available',
      };

      mockQuery.mockResolvedValue({ rows: [mockSuggestion] });

      const result = await rejectSuggestion('sugg-1', 'lawyer-1', 'Not available');

      expect(result).toEqual(mockSuggestion);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['sugg-1', 'lawyer-1', 'Not available']
      );
      expect(mockCreateNotification).toHaveBeenCalledWith({
        user_id: 'client-1',
        notification_type: 'suggestion_rejected',
        title: 'Créneau refusé',
        message: expect.stringContaining('Not available'),
        data: expect.objectContaining({
          suggestion_id: 'sugg-1',
          reason: 'Not available',
        }),
      });
    });

    it('should reject suggestion without reason', async () => {
      const mockSuggestion = {
        id: 'sugg-1',
        suggested_by_user_id: 'client-1',
        status: 'rejected',
      };

      mockQuery.mockResolvedValue({ rows: [mockSuggestion] });

      const result = await rejectSuggestion('sugg-1', 'lawyer-1');

      expect(result).toEqual(mockSuggestion);
      expect(mockCreateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.not.stringContaining(':'),
        })
      );
    });

    it('should throw error if suggestion not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await expect(rejectSuggestion('sugg-1', 'lawyer-1')).rejects.toThrow(
        'Suggestion not found or unauthorized'
      );
    });

    it('should handle notification error gracefully', async () => {
      const mockSuggestion = { id: 'sugg-1', suggested_by_user_id: 'client-1' };
      mockQuery.mockResolvedValue({ rows: [mockSuggestion] });
      mockCreateNotification.mockRejectedValue(new Error('Notification failed'));

      const result = await rejectSuggestion('sugg-1', 'lawyer-1');

      expect(result).toEqual(mockSuggestion);
    });
  });

  describe('counterSuggestion', () => {
    it('should create counter-suggestion', async () => {
      const mockOriginal = {
        id: 'sugg-1',
        appointment_id: 'apt-1',
        suggested_by: 'client-1',
        suggested_to: 'lawyer-1',
        suggested_by_user_id: 'client-1',
      };

      const mockCounterSuggestion = {
        id: 'uuid-1234',
        appointment_id: 'apt-1',
        suggested_by_user_id: 'lawyer-1',
        suggested_to_user_id: 'client-1',
        suggested_start_time: '2026-01-21T14:00:00Z',
        suggested_end_time: '2026-01-21T15:00:00Z',
        status: 'pending',
        notes: 'Counter proposal',
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockOriginal] })
        .mockResolvedValueOnce({ rows: [mockCounterSuggestion] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await counterSuggestion(
        'sugg-1',
        'lawyer-1',
        '2026-01-21T14:00:00Z',
        '2026-01-21T15:00:00Z',
        'Counter proposal'
      );

      expect(result).toEqual(mockCounterSuggestion);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockCreateNotification).toHaveBeenCalledWith({
        user_id: mockOriginal.suggested_by_user_id,
        notification_type: 'suggestion_countered',
        title: 'Contre-proposition reçue',
        message: expect.stringContaining('autre créneau'),
        data: expect.objectContaining({
          suggestion_id: 'uuid-1234',
          original_suggestion_id: 'sugg-1',
        }),
      });
    });

    it('should use default notes if not provided', async () => {
      const mockOriginal = {
        id: 'sugg-1',
        appointment_id: null,
        suggested_by: 'client-1',
      };

      const mockCounter = { id: 'uuid-1234', notes: 'Contre-proposition de l\'avocat' };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockOriginal] })
        .mockResolvedValueOnce({ rows: [mockCounter] })
        .mockResolvedValueOnce({ rows: [] });

      await counterSuggestion('sugg-1', 'lawyer-1', '2026-01-21T14:00:00Z', '2026-01-21T15:00:00Z');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['Contre-proposition de l\'avocat'])
      );
    });

    it('should throw error if original suggestion not found', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await expect(
        counterSuggestion('sugg-1', 'lawyer-1', '2026-01-21T14:00:00Z', '2026-01-21T15:00:00Z')
      ).rejects.toThrow('Original suggestion not found');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should rollback on error', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        counterSuggestion('sugg-1', 'lawyer-1', '2026-01-21T14:00:00Z', '2026-01-21T15:00:00Z')
      ).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle notification error gracefully', async () => {
      const mockOriginal = { id: 'sugg-1', suggested_by: 'client-1', appointment_id: null };
      const mockCounter = { id: 'uuid-1234' };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockOriginal] })
        .mockResolvedValueOnce({ rows: [mockCounter] })
        .mockResolvedValueOnce({ rows: [] });

      mockCreateNotification.mockRejectedValue(new Error('Notification failed'));

      const result = await counterSuggestion(
        'sugg-1',
        'lawyer-1',
        '2026-01-21T14:00:00Z',
        '2026-01-21T15:00:00Z'
      );

      expect(result).toEqual(mockCounter);
    });
  });
});