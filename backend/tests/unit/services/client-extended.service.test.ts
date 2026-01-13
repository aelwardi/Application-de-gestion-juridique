import { ClientExtendedService } from '../../../src/services/client-extended.service';
import { pool } from '../../../src/config/database.config';
import {
  clientRequestQueries,
  clientNoteQueries,
  clientPaymentQueries,
  clientCommunicationQueries,
} from '../../../src/database/queries/client-extended.queries';

jest.mock('../../../src/config/database.config');

describe('ClientExtendedService', () => {
  let service: ClientExtendedService;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    service = new ClientExtendedService();
    mockQuery = jest.fn();
    (pool.query as jest.Mock) = mockQuery;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Client Requests', () => {
    describe('createClientRequest', () => {
      it('should create a client request with all fields', async () => {
        const mockRequest = {
          id: 'req-1',
          client_id: 'client-1',
          lawyer_id: 'lawyer-1',
          request_type: 'consultation',
          title: 'Legal Consultation',
          description: 'Need legal advice',
          urgency: 'high',
        };

        mockQuery.mockResolvedValue({ rows: [mockRequest] });

        const input = {
          client_id: 'client-1',
          lawyer_id: 'lawyer-1',
          request_type: 'consultation' as const,
          title: 'Legal Consultation',
          description: 'Need legal advice',
          case_category: 'civil',
          urgency: 'high' as const,
          budget_min: 1000,
          budget_max: 5000,
          preferred_date: new Date('2026-01-20'),
        };

        const result = await service.createClientRequest(input);

        expect(result).toEqual(mockRequest);
        expect(mockQuery).toHaveBeenCalledWith(clientRequestQueries.create, [
          'client-1',
          'lawyer-1',
          'consultation',
          'Legal Consultation',
          'Need legal advice',
          'civil',
          'high',
          1000,
          5000,
          expect.any(Date),
        ]);
      });

      it('should create a client request with default urgency', async () => {
        const mockRequest = { id: 'req-1', urgency: 'medium' };
        mockQuery.mockResolvedValue({ rows: [mockRequest] });

        const input = {
          client_id: 'client-1',
          request_type: 'consultation' as const,
          title: 'Legal Consultation',
          description: 'Need legal advice',
        };

        const result = await service.createClientRequest(input);

        expect(result.urgency).toBe('medium');
      });

      it('should handle optional fields as null', async () => {
        const mockRequest = { id: 'req-1' };
        mockQuery.mockResolvedValue({ rows: [mockRequest] });

        const input = {
          client_id: 'client-1',
          request_type: 'consultation' as const,
          title: 'Legal Consultation',
          description: 'Need legal advice',
        };

        await service.createClientRequest(input);

        expect(mockQuery).toHaveBeenCalledWith(
          clientRequestQueries.create,
          expect.arrayContaining([null, null, null])
        );
      });
    });

    describe('getClientRequestById', () => {
      it('should return a client request by id', async () => {
        const mockRequest = { id: 'req-1', title: 'Test Request' };
        mockQuery.mockResolvedValue({ rows: [mockRequest] });

        const result = await service.getClientRequestById('req-1');

        expect(result).toEqual(mockRequest);
        expect(mockQuery).toHaveBeenCalledWith(clientRequestQueries.getById, ['req-1']);
      });

      it('should return null if request not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.getClientRequestById('non-existent');

        expect(result).toBeNull();
      });
    });

    describe('getClientRequestsByClientId', () => {
      it('should return paginated requests for a client', async () => {
        const mockRequests = [
          { id: 'req-1', client_id: 'client-1' },
          { id: 'req-2', client_id: 'client-1' },
        ];
        mockQuery
          .mockResolvedValueOnce({ rows: mockRequests })
          .mockResolvedValueOnce({ rows: [{ count: '5' }] });

        const result = await service.getClientRequestsByClientId('client-1', 10, 0);

        expect(result.requests).toEqual(mockRequests);
        expect(result.total).toBe(5);
        expect(mockQuery).toHaveBeenCalledTimes(2);
      });

      it('should use default pagination values', async () => {
        mockQuery
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({ rows: [{ count: '0' }] });

        await service.getClientRequestsByClientId('client-1');

        expect(mockQuery).toHaveBeenCalledWith(clientRequestQueries.getByClientId, [
          'client-1',
          20,
          0,
        ]);
      });
    });

    describe('getClientRequestsByLawyerId', () => {
      it('should return paginated requests for a lawyer', async () => {
        const mockRequests = [{ id: 'req-1', lawyer_id: 'lawyer-1' }];
        mockQuery
          .mockResolvedValueOnce({ rows: mockRequests })
          .mockResolvedValueOnce({ rows: [{ count: '3' }] });

        const result = await service.getClientRequestsByLawyerId('lawyer-1', 10, 0);

        expect(result.requests).toEqual(mockRequests);
        expect(result.total).toBe(3);
      });
    });

    describe('updateClientRequest', () => {
      it('should update a client request', async () => {
        const mockUpdated = { id: 'req-1', status: 'approved' };
        mockQuery.mockResolvedValue({ rows: [mockUpdated] });

        const updateData = { status: 'accepted' as const };
        const result = await service.updateClientRequest('req-1', updateData);

        expect(result).toEqual(mockUpdated);
      });

      it('should return current request if no fields to update', async () => {
        const mockRequest = { id: 'req-1' };
        mockQuery.mockResolvedValue({ rows: [mockRequest] });

        const result = await service.updateClientRequest('req-1', {});

        expect(result).toEqual(mockRequest);
        expect(mockQuery).toHaveBeenCalledWith(clientRequestQueries.getById, ['req-1']);
      });

      it('should return null if request not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.updateClientRequest('req-1', { status: 'accepted' as const });

        expect(result).toBeNull();
      });
    });

    describe('deleteClientRequest', () => {
      it('should delete a client request', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 'req-1' }] });

        const result = await service.deleteClientRequest('req-1');

        expect(result).toBe(true);
        expect(mockQuery).toHaveBeenCalledWith(clientRequestQueries.delete, ['req-1']);
      });

      it('should return false if request not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.deleteClientRequest('non-existent');

        expect(result).toBe(false);
      });
    });
  });

  describe('Client Notes', () => {
    describe('createClientNote', () => {
      it('should create a client note with all fields', async () => {
        const mockNote = {
          id: 'note-1',
          client_id: 'client-1',
          created_by: 'lawyer-1',
          note_type: 'important',
          title: 'Important Note',
          content: 'Client needs follow-up',
        };

        mockQuery.mockResolvedValue({ rows: [mockNote] });

        const input = {
          client_id: 'client-1',
          created_by: 'lawyer-1',
          note_type: 'important' as const,
          title: 'Important Note',
          content: 'Client needs follow-up',
          is_private: true,
          remind_at: new Date('2026-01-20'),
        };

        const result = await service.createClientNote(input);

        expect(result).toEqual(mockNote);
      });

      it('should use default values for optional fields', async () => {
        const mockNote = { id: 'note-1', note_type: 'general', is_private: true };
        mockQuery.mockResolvedValue({ rows: [mockNote] });

        const input = {
          client_id: 'client-1',
          created_by: 'lawyer-1',
          content: 'Test note',
        };

        await service.createClientNote(input);

        expect(mockQuery).toHaveBeenCalledWith(
          clientNoteQueries.create,
          expect.arrayContaining(['general', true])
        );
      });
    });

    describe('getClientNoteById', () => {
      it('should return a note by id', async () => {
        const mockNote = { id: 'note-1', content: 'Test note' };
        mockQuery.mockResolvedValue({ rows: [mockNote] });

        const result = await service.getClientNoteById('note-1');

        expect(result).toEqual(mockNote);
      });

      it('should return null if note not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.getClientNoteById('non-existent');

        expect(result).toBeNull();
      });
    });

    describe('getClientNotesByClientId', () => {
      it('should return paginated notes for a client', async () => {
        const mockNotes = [
          { id: 'note-1', client_id: 'client-1' },
          { id: 'note-2', client_id: 'client-1' },
        ];
        mockQuery
          .mockResolvedValueOnce({ rows: mockNotes })
          .mockResolvedValueOnce({ rows: [{ count: '10' }] });

        const result = await service.getClientNotesByClientId('client-1', 20, 0);

        expect(result.notes).toEqual(mockNotes);
        expect(result.total).toBe(10);
      });
    });

    describe('getPendingReminders', () => {
      it('should return pending reminders for a lawyer', async () => {
        const mockReminders = [
          { id: 'note-1', remind_at: '2026-01-15' },
          { id: 'note-2', remind_at: '2026-01-16' },
        ];
        mockQuery.mockResolvedValue({ rows: mockReminders });

        const result = await service.getPendingReminders('lawyer-1', new Date('2026-01-20'));

        expect(result).toEqual(mockReminders);
        expect(mockQuery).toHaveBeenCalledWith(clientNoteQueries.getReminders, [
          'lawyer-1',
          new Date('2026-01-20'),
        ]);
      });

      it('should use current date if not provided', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        await service.getPendingReminders('lawyer-1');

        expect(mockQuery).toHaveBeenCalled();
      });
    });

    describe('updateClientNote', () => {
      it('should update a note', async () => {
        const mockUpdated = { id: 'note-1', content: 'Updated content' };
        mockQuery.mockResolvedValue({ rows: [mockUpdated] });

        const result = await service.updateClientNote('note-1', { content: 'Updated content' });

        expect(result).toEqual(mockUpdated);
      });

      it('should return current note if no fields to update', async () => {
        const mockNote = { id: 'note-1' };
        mockQuery.mockResolvedValue({ rows: [mockNote] });

        const result = await service.updateClientNote('note-1', {});

        expect(result).toEqual(mockNote);
      });
    });

    describe('deleteClientNote', () => {
      it('should delete a note', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 'note-1' }] });

        const result = await service.deleteClientNote('note-1');

        expect(result).toBe(true);
      });

      it('should return false if note not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.deleteClientNote('non-existent');

        expect(result).toBe(false);
      });
    });
  });

  describe('Client Payments', () => {
    describe('createClientPayment', () => {
      it('should create a payment with all fields', async () => {
        const mockPayment = {
          id: 'payment-1',
          client_id: 'client-1',
          amount: 5000,
          payment_type: 'invoice',
          status: 'paid',
        };

        mockQuery.mockResolvedValue({ rows: [mockPayment] });

        const input = {
          client_id: 'client-1',
          case_id: 'case-1',
          amount: 5000,
          payment_type: 'consultation' as const,
          payment_method: 'transfer' as const,
          status: 'paid' as const,
          due_date: new Date('2026-01-31'),
          paid_date: new Date('2026-01-15'),
          invoice_number: 'INV-2026-001',
          description: 'Legal services',
          notes: 'Payment received',
          created_by: 'lawyer-1',
        };

        const result = await service.createClientPayment(input);

        expect(result).toEqual(mockPayment);
      });

      it('should use default status', async () => {
        const mockPayment = { id: 'payment-1', status: 'pending' };
        mockQuery.mockResolvedValue({ rows: [mockPayment] });

        const input = {
          client_id: 'client-1',
          amount: 5000,
          payment_type: 'consultation' as const,
        };

        await service.createClientPayment(input);

        expect(mockQuery).toHaveBeenCalledWith(
          clientPaymentQueries.create,
          expect.arrayContaining(['pending'])
        );
      });
    });

    describe('getClientPaymentById', () => {
      it('should return a payment by id', async () => {
        const mockPayment = { id: 'payment-1', amount: 5000 };
        mockQuery.mockResolvedValue({ rows: [mockPayment] });

        const result = await service.getClientPaymentById('payment-1');

        expect(result).toEqual(mockPayment);
      });

      it('should return null if payment not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.getClientPaymentById('non-existent');

        expect(result).toBeNull();
      });
    });

    describe('getClientPaymentsByClientId', () => {
      it('should return paginated payments for a client', async () => {
        const mockPayments = [
          { id: 'payment-1', client_id: 'client-1', amount: 5000 },
          { id: 'payment-2', client_id: 'client-1', amount: 3000 },
        ];
        mockQuery
          .mockResolvedValueOnce({ rows: mockPayments })
          .mockResolvedValueOnce({ rows: [{ count: '15' }] });

        const result = await service.getClientPaymentsByClientId('client-1', 20, 0);

        expect(result.payments).toEqual(mockPayments);
        expect(result.total).toBe(15);
      });
    });

    describe('getClientFinancialSummary', () => {
      it('should return financial summary for a client', async () => {
        const mockSummary = {
          total_billed: '10000',
          total_paid: '7000',
          total_pending: '2000',
          total_overdue: '1000',
        };
        const mockPayments = [{ id: 'payment-1', amount: 5000 }];

        mockQuery
          .mockResolvedValueOnce({ rows: [mockSummary] })
          .mockResolvedValueOnce({ rows: mockPayments });

        const result = await service.getClientFinancialSummary('client-1');

        expect(result).toEqual({
          total_billed: 10000,
          total_paid: 7000,
          total_pending: 2000,
          total_overdue: 1000,
          payment_history: mockPayments,
        });
      });

      it('should handle zero values', async () => {
        mockQuery
          .mockResolvedValueOnce({ rows: [{}] })
          .mockResolvedValueOnce({ rows: [] });

        const result = await service.getClientFinancialSummary('client-1');

        expect(result.total_billed).toBe(0);
        expect(result.total_paid).toBe(0);
        expect(result.total_pending).toBe(0);
        expect(result.total_overdue).toBe(0);
      });
    });

    describe('getOverduePayments', () => {
      it('should return overdue payments for a lawyer', async () => {
        const mockOverdue = [
          { id: 'payment-1', due_date: '2026-01-01', status: 'pending' },
          { id: 'payment-2', due_date: '2025-12-15', status: 'pending' },
        ];
        mockQuery.mockResolvedValue({ rows: mockOverdue });

        const result = await service.getOverduePayments('lawyer-1');

        expect(result).toEqual(mockOverdue);
        expect(mockQuery).toHaveBeenCalledWith(clientPaymentQueries.getOverduePayments, [
          'lawyer-1',
        ]);
      });
    });

    describe('updateClientPayment', () => {
      it('should update a payment', async () => {
        const mockUpdated = { id: 'payment-1', status: 'paid' };
        mockQuery.mockResolvedValue({ rows: [mockUpdated] });

        const result = await service.updateClientPayment('payment-1', {
          status: 'paid' as const,
          paid_date: new Date('2026-01-15'),
        });

        expect(result).toEqual(mockUpdated);
      });

      it('should return current payment if no fields to update', async () => {
        const mockPayment = { id: 'payment-1' };
        mockQuery.mockResolvedValue({ rows: [mockPayment] });

        const result = await service.updateClientPayment('payment-1', {});

        expect(result).toEqual(mockPayment);
      });
    });

    describe('deleteClientPayment', () => {
      it('should delete a payment', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 'payment-1' }] });

        const result = await service.deleteClientPayment('payment-1');

        expect(result).toBe(true);
      });

      it('should return false if payment not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.deleteClientPayment('non-existent');

        expect(result).toBe(false);
      });
    });
  });

  describe('Client Communications', () => {
    describe('createClientCommunication', () => {
      it('should create a communication record', async () => {
        const mockComm = {
          id: 'comm-1',
          client_id: 'client-1',
          communication_type: 'email',
          direction: 'outbound',
          subject: 'Case Update',
        };

        mockQuery.mockResolvedValue({ rows: [mockComm] });

        const input = {
          client_id: 'client-1',
          case_id: 'case-1',
          communication_type: 'email' as const,
          direction: 'outgoing' as const,
          subject: 'Case Update',
          summary: 'Updated client on case progress',
          duration_minutes: 15,
          outcome: 'successful',
          follow_up_required: true,
          follow_up_date: new Date('2026-01-20'),
          created_by: 'lawyer-1',
        };

        const result = await service.createClientCommunication(input);

        expect(result).toEqual(mockComm);
      });

      it('should use default value for follow_up_required', async () => {
        const mockComm = { id: 'comm-1', follow_up_required: false };
        mockQuery.mockResolvedValue({ rows: [mockComm] });

        const input = {
          client_id: 'client-1',
          communication_type: 'phone' as const,
          direction: 'incoming' as const,
          created_by: 'lawyer-1',
        };

        await service.createClientCommunication(input);

        expect(mockQuery).toHaveBeenCalledWith(
          clientCommunicationQueries.create,
          expect.arrayContaining([false])
        );
      });
    });

    describe('getClientCommunicationById', () => {
      it('should return a communication by id', async () => {
        const mockComm = { id: 'comm-1', subject: 'Test' };
        mockQuery.mockResolvedValue({ rows: [mockComm] });

        const result = await service.getClientCommunicationById('comm-1');

        expect(result).toEqual(mockComm);
      });

      it('should return null if communication not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.getClientCommunicationById('non-existent');

        expect(result).toBeNull();
      });
    });

    describe('getClientCommunicationsByClientId', () => {
      it('should return paginated communications for a client', async () => {
        const mockComms = [
          { id: 'comm-1', client_id: 'client-1' },
          { id: 'comm-2', client_id: 'client-1' },
        ];
        mockQuery
          .mockResolvedValueOnce({ rows: mockComms })
          .mockResolvedValueOnce({ rows: [{ count: '25' }] });

        const result = await service.getClientCommunicationsByClientId('client-1', 20, 0);

        expect(result.communications).toEqual(mockComms);
        expect(result.total).toBe(25);
      });
    });

    describe('getClientActivitySummary', () => {
      it('should return activity summary for a client', async () => {
        const mockSummary = {
          total_communications: '50',
          last_contact_date: '2026-01-13',
          pending_follow_ups: '3',
          email_count: '20',
          phone_count: '15',
          meeting_count: '10',
          sms_count: '3',
          video_call_count: '2',
          other_count: '0',
        };
        mockQuery.mockResolvedValue({ rows: [mockSummary] });

        const result = await service.getClientActivitySummary('client-1');

        expect(result).toEqual({
          total_communications: 50,
          last_contact_date: '2026-01-13',
          pending_follow_ups: 3,
          upcoming_reminders: 0,
          communication_breakdown: {
            email: 20,
            phone: 15,
            meeting: 10,
            sms: 3,
            video_call: 2,
            other: 0,
          },
        });
      });

      it('should handle null or zero values', async () => {
        mockQuery.mockResolvedValue({ rows: [{}] });

        const result = await service.getClientActivitySummary('client-1');

        expect(result.total_communications).toBe(0);
        expect(result.last_contact_date).toBeNull();
        expect(result.pending_follow_ups).toBe(0);
      });
    });

    describe('getPendingFollowUps', () => {
      it('should return pending follow-ups for a lawyer', async () => {
        const mockFollowUps = [
          { id: 'comm-1', follow_up_date: '2026-01-14', follow_up_required: true },
          { id: 'comm-2', follow_up_date: '2026-01-15', follow_up_required: true },
        ];
        mockQuery.mockResolvedValue({ rows: mockFollowUps });

        const result = await service.getPendingFollowUps('lawyer-1', new Date('2026-01-20'));

        expect(result).toEqual(mockFollowUps);
        expect(mockQuery).toHaveBeenCalledWith(
          clientCommunicationQueries.getPendingFollowUps,
          ['lawyer-1', new Date('2026-01-20')]
        );
      });

      it('should use current date if not provided', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        await service.getPendingFollowUps('lawyer-1');

        expect(mockQuery).toHaveBeenCalled();
      });
    });

    describe('deleteClientCommunication', () => {
      it('should delete a communication', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 'comm-1' }] });

        const result = await service.deleteClientCommunication('comm-1');

        expect(result).toBe(true);
      });

      it('should return false if communication not found', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        const result = await service.deleteClientCommunication('non-existent');

        expect(result).toBe(false);
      });
    });
  });
});