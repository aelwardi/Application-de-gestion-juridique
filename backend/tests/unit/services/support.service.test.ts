import * as supportService from '../../../src/services/support.service';
import * as supportQueries from '../../../src/database/queries/support.queries';
import { sendEmail } from '../../../src/utils/email.util';

jest.mock('../../../src/database/queries/support.queries');
jest.mock('../../../src/utils/email.util');

describe('SupportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a support ticket', async () => {
      const mockTicket = {
        id: 'ticket-123',
        user_id: 'user-123',
        subject: 'Help needed',
        description: 'I need assistance',
        status: 'open',
        created_at: new Date(),
      };

      (supportQueries.createTicket as jest.Mock).mockResolvedValue(mockTicket);

      const result = await supportService.createTicket(
        'user-123',
        'Help needed',
        'I need assistance',
        'high',
        'technical'
      );

      expect(supportQueries.createTicket).toHaveBeenCalledWith(
        'user-123',
        'Help needed',
        'I need assistance',
        'high',
        'technical'
      );
      expect(result).toEqual(mockTicket);
    });

    it('should create ticket with null category', async () => {
      const mockTicket = {
        id: 'ticket-123',
        user_id: 'user-123',
        subject: 'Help needed',
        description: 'I need assistance',
        status: 'open',
        created_at: new Date(),
      };

      (supportQueries.createTicket as jest.Mock).mockResolvedValue(mockTicket);

      const result = await supportService.createTicket(
        'user-123',
        'Help needed',
        'I need assistance',
        'medium',
        null
      );

      expect(result).toEqual(mockTicket);
    });
  });

  describe('getUserTickets', () => {
    it('should get user tickets with messages', async () => {
      const mockTickets = [
        { id: 'ticket-1', subject: 'Issue 1' },
        { id: 'ticket-2', subject: 'Issue 2' },
      ];

      const mockMessages = [
        { id: 'msg-1', message: 'Message 1' },
      ];

      (supportQueries.getUserTickets as jest.Mock).mockResolvedValue(mockTickets);
      (supportQueries.getTicketMessages as jest.Mock).mockResolvedValue(mockMessages);

      const result = await supportService.getUserTickets('user-123');

      expect(supportQueries.getUserTickets).toHaveBeenCalledWith('user-123');
      expect(supportQueries.getTicketMessages).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('messages');
    });
  });

  describe('getTicketDetails', () => {
    it('should get ticket details with messages', async () => {
      const mockTicket = {
        id: 'ticket-123',
        subject: 'Help needed',
      };

      const mockMessages = [
        { id: 'msg-1', message: 'Initial message' },
        { id: 'msg-2', message: 'Response' },
      ];

      (supportQueries.getTicketById as jest.Mock).mockResolvedValue(mockTicket);
      (supportQueries.getTicketMessages as jest.Mock).mockResolvedValue(mockMessages);

      const result = await supportService.getTicketDetails('ticket-123', false);

      expect(supportQueries.getTicketById).toHaveBeenCalledWith('ticket-123');
      expect(supportQueries.getTicketMessages).toHaveBeenCalledWith('ticket-123', false);
      expect(result).toEqual({
        ticket: mockTicket,
        messages: mockMessages,
      });
    });

    it('should throw error if ticket not found', async () => {
      (supportQueries.getTicketById as jest.Mock).mockResolvedValue(null);

      await expect(
        supportService.getTicketDetails('ticket-123', false)
      ).rejects.toThrow('Ticket not found');
    });
  });

  describe('updateStatus', () => {
    it('should update ticket status', async () => {
      const mockTicket = {
        id: 'ticket-123',
        status: 'resolved',
        user_email: 'user@example.com',
        subject: 'Help needed',
      };

      (supportQueries.updateTicketStatus as jest.Mock).mockResolvedValue(undefined);
      (supportQueries.getTicketById as jest.Mock).mockResolvedValue(mockTicket);
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      await supportService.updateStatus('ticket-123', 'resolved', 'admin-123');

      expect(supportQueries.updateTicketStatus).toHaveBeenCalledWith('ticket-123', 'resolved', 'admin-123');
    });

    it('should update status without sending email if not resolved', async () => {
      (supportQueries.updateTicketStatus as jest.Mock).mockResolvedValue(undefined);
      (supportQueries.getTicketById as jest.Mock).mockResolvedValue({ id: 'ticket-123' });

      await supportService.updateStatus('ticket-123', 'in_progress', 'admin-123');

      expect(supportQueries.updateTicketStatus).toHaveBeenCalledWith('ticket-123', 'in_progress', 'admin-123');
    });
  });

  describe('addMessage', () => {
    it('should add message to ticket', async () => {
      const mockMessage = {
        id: 'msg-123',
        ticket_id: 'ticket-123',
        user_id: 'admin-123',
        message: 'Here is the solution',
        is_internal: false,
        created_at: new Date(),
      };

      const mockTicket = {
        id: 'ticket-123',
        subject: 'Help needed',
      };

      (supportQueries.addTicketMessage as jest.Mock).mockResolvedValue(mockMessage);
      (supportQueries.getTicketById as jest.Mock).mockResolvedValue(mockTicket);

      const result = await supportService.addMessage(
        'ticket-123',
        'admin-123',
        'Here is the solution',
        false
      );

      expect(supportQueries.addTicketMessage).toHaveBeenCalledWith(
        'ticket-123',
        'admin-123',
        'Here is the solution',
        false
      );
      expect(result).toEqual(mockMessage);
    });

    it('should add internal message', async () => {
      const mockMessage = {
        id: 'msg-123',
        ticket_id: 'ticket-123',
        user_id: 'admin-123',
        message: 'Internal note',
        is_internal: true,
        created_at: new Date(),
      };

      (supportQueries.addTicketMessage as jest.Mock).mockResolvedValue(mockMessage);
      (supportQueries.getTicketById as jest.Mock).mockResolvedValue({ id: 'ticket-123' });

      const result = await supportService.addMessage(
        'ticket-123',
        'admin-123',
        'Internal note',
        true
      );

      expect(result).toEqual(mockMessage);
    });
  });

  describe('getAllTickets', () => {
    it('should get all tickets with filters', async () => {
      const mockResult = {
        data: [
          { id: 'ticket-1', status: 'open' },
          { id: 'ticket-2', status: 'open' },
        ],
        total: 2,
      };

      (supportQueries.getAllTickets as jest.Mock).mockResolvedValue(mockResult);

      const result = await supportService.getAllTickets(1, 20, 'open', 'high');

      expect(supportQueries.getAllTickets).toHaveBeenCalledWith(1, 20, 'open', 'high', undefined, undefined);
      expect(result).toEqual(mockResult);
    });

    it('should get all tickets with admin filter', async () => {
      const mockResult = {
        data: [],
        total: 0,
      };

      (supportQueries.getAllTickets as jest.Mock).mockResolvedValue(mockResult);

      const result = await supportService.getAllTickets(1, 20, undefined, undefined, true, 'admin-123');

      expect(supportQueries.getAllTickets).toHaveBeenCalledWith(1, 20, undefined, undefined, true, 'admin-123');
      expect(result).toEqual(mockResult);
    });
  });
});