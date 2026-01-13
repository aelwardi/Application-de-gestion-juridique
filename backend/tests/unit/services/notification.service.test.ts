import { NotificationService } from '../../../src/services/notification.service';
import { pool } from '../../../src/config/database.config';

jest.mock('../../../src/config/database.config');

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const mockNotification = {
        id: 'notif-123',
        user_id: 'user-123',
        notification_type: 'message_received',
        title: 'New Message',
        message: 'You have a new message',
        data: { messageId: 'msg-123' },
        is_read: false,
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockNotification] });

      const result = await notificationService.createNotification({
        user_id: 'user-123',
        notification_type: 'message_received',
        title: 'New Message',
        message: 'You have a new message',
        data: { messageId: 'msg-123' },
      });

      expect(result).toEqual(mockNotification);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should create notification without data', async () => {
      const mockNotification = {
        id: 'notif-123',
        user_id: 'user-123',
        notification_type: 'appointment_reminder',
        title: 'Appointment Reminder',
        message: 'You have an appointment tomorrow',
        data: null,
        is_read: false,
        created_at: new Date(),
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockNotification] });

      const result = await notificationService.createNotification({
        user_id: 'user-123',
        notification_type: 'appointment_reminder',
        title: 'Appointment Reminder',
        message: 'You have an appointment tomorrow',
      });

      expect(result).toEqual(mockNotification);
    });
  });

  describe('getUserNotifications', () => {
    it('should get user notifications with pagination', async () => {
      const mockNotifications = [
        { id: 'notif-1', title: 'Notification 1' },
        { id: 'notif-2', title: 'Notification 2' },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: mockNotifications });

      const result = await notificationService.getUserNotifications('user-123', 20, 0);

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.total).toBe(10);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('should use default limit and offset', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [] });

      await notificationService.getUserNotifications('user-123');

      expect(pool.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUnreadNotifications', () => {
    it('should get unread notifications', async () => {
      const mockNotifications = [
        { id: 'notif-1', is_read: false },
        { id: 'notif-2', is_read: false },
      ];

      (pool.query as jest.Mock).mockResolvedValue({ rows: mockNotifications });

      const result = await notificationService.getUnreadNotifications('user-123');

      expect(result).toEqual(mockNotifications);
      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'notif-123',
        is_read: true,
      };

      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockNotification] });

      const result = await notificationService.markAsRead('notif-123');

      expect(result).toEqual(mockNotification);
      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 5 });

      await notificationService.markAllAsRead('user-123');

      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await notificationService.deleteNotification('notif-123');

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should return false if notification not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const result = await notificationService.deleteNotification('nonexistent');

      expect(result).toBe(false);
    });

    it('should handle null rowCount', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: null });

      const result = await notificationService.deleteNotification('notif-123');

      expect(result).toBe(false);
    });
  });

  describe('countUnread', () => {
    it('should count unread notifications', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ count: '7' }],
      });

      const result = await notificationService.countUnread('user-123');

      expect(result).toBe(7);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should return 0 if no unread notifications', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ count: '0' }],
      });

      const result = await notificationService.countUnread('user-123');

      expect(result).toBe(0);
    });
  });

  describe('cleanOldNotifications', () => {
    it('should clean old read notifications', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 15 });

      const result = await notificationService.cleanOldNotifications();

      expect(result).toBe(15);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should return 0 if no notifications to clean', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const result = await notificationService.cleanOldNotifications();

      expect(result).toBe(0);
    });

    it('should handle null rowCount', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rowCount: null });

      const result = await notificationService.cleanOldNotifications();

      expect(result).toBe(0);
    });
  });
});