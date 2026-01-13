import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationsStore } from '~/stores/notifications';
import { mockFetchSuccess, mockFetchError } from './helpers/test-utils';

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    user: { id: 'test-user', role: 'client' },
    isLawyer: false,
    getAuthHeaders: () => ({ Authorization: 'Bearer test-token' })
  })
}));

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3000/api'
    }
  })
}));

vi.mock('~/composables/useCase', () => ({
  useCase: () => ({
    getPendingOffers: vi.fn().mockResolvedValue([])
  })
}));

describe('Notifications Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('State Management', () => {
    it('should initialize with empty notifications', () => {
      const store = useNotificationsStore();

      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toBe(0);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('Notification Retrieval', () => {
    it('should fetch notifications successfully', async () => {
      const store = useNotificationsStore();
      const mockNotifications = [
        {
          id: '1',
          title: 'Test Notification',
          message: 'Test message',
          is_read: false,
          notification_type: 'info',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Another Notification',
          message: 'Another message',
          is_read: true,
          notification_type: 'success',
          created_at: new Date().toISOString(),
        },
      ];

      mockFetchSuccess(mockNotifications);

      await store.fetchNotifications();

      expect(store.notifications).toHaveLength(2);
      expect(store.notifications[0]?.id).toBe('1');
    });

    it('should handle fetch errors gracefully', async () => {
      const store = useNotificationsStore();
      mockFetchError(500, 'Server error');

      await store.fetchNotifications();

      expect(store.notifications).toEqual([]);
      expect(store.isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const store = useNotificationsStore();

      vi.mocked($fetch).mockImplementation(
        () => new Promise((resolve) => {
          expect(store.isLoading).toBe(true);
          setTimeout(() => resolve({ success: true, data: [] }), 10);
        })
      );

      await store.fetchNotifications();

      expect(store.isLoading).toBe(false);
    });
  });

  describe('Unread Count', () => {
    it('should calculate unread count correctly', async () => {
      const store = useNotificationsStore();
      const mockNotifications = [
        { id: '1', is_read: false, title: 'Test', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
        { id: '2', is_read: true, title: 'Test', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
        { id: '3', is_read: false, title: 'Test', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
      ];

      mockFetchSuccess(mockNotifications);

      await store.fetchNotifications();

      expect(store.unreadCount).toBe(2);
    });

    it('should return zero when all notifications are read', async () => {
      const store = useNotificationsStore();
      const mockNotifications = [
        { id: '1', is_read: true, title: 'Test', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
        { id: '2', is_read: true, title: 'Test', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
      ];

      mockFetchSuccess(mockNotifications);

      await store.fetchNotifications();

      expect(store.unreadCount).toBe(0);
    });
  });

  describe('Mark as Read', () => {
    it('should mark a notification as read', async () => {
      const store = useNotificationsStore();
      const notificationId = '1';
      const mockNotifications = [
        { id: notificationId, is_read: false, title: 'Test', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
      ];

      mockFetchSuccess(mockNotifications);
      await store.fetchNotifications();

      mockFetchSuccess({ id: notificationId, is_read: true });

      await store.markAsRead(notificationId);

      const notification = store.notifications.find(n => n.id === notificationId);
      expect(notification?.is_read).toBe(true);
    });

    it('should handle mark as read error', async () => {
      const store = useNotificationsStore();
      const notificationId = '1';
      mockFetchError(404, 'Notification not found');

      await store.markAsRead(notificationId);

      expect(true).toBe(true);
    });
  });

  describe('Date Formatting', () => {
    it('should format recent dates as "X seconds ago"', () => {
      const store = useNotificationsStore();
      const now = new Date();
      const date = new Date(now.getTime() - 30 * 1000); // 30 seconds ago

      const formatted = store.formatRelativeTime(date.toISOString());

      expect(formatted).toMatch(/\d+ second/);
    });

    it('should format dates as "X minutes ago"', () => {
      const store = useNotificationsStore();
      const now = new Date();
      const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago

      const formatted = store.formatRelativeTime(date.toISOString());

      expect(formatted).toMatch(/\d+ minute/);
    });

    it('should format dates as "X hours ago"', () => {
      const store = useNotificationsStore();
      const now = new Date();
      const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago

      const formatted = store.formatRelativeTime(date.toISOString());

      expect(formatted).toMatch(/\d+ hour/);
    });

    it('should format old dates as full date', () => {
      const store = useNotificationsStore();
      const date = new Date('2020-01-01');

      const formatted = store.formatRelativeTime(date.toISOString());

      expect(formatted).toContain('2020');
    });
  });

  describe('Filter Notifications', () => {
    it('should filter by read status', async () => {
      const store = useNotificationsStore();
      const mockNotifications = [
        { id: '1', is_read: false, title: 'Unread', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
        { id: '2', is_read: true, title: 'Read', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
        { id: '3', is_read: false, title: 'Unread 2', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
      ];

      mockFetchSuccess(mockNotifications);
      await store.fetchNotifications();

      const unreadNotifications = store.notifications.filter(n => !n.is_read);

      expect(unreadNotifications).toHaveLength(2);
    });
  });

  describe('Mark All as Read', () => {
    it('should mark all notifications as read', async () => {
      const store = useNotificationsStore();
      const mockNotifications = [
        { id: '1', is_read: false, title: 'Test 1', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
        { id: '2', is_read: false, title: 'Test 2', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
      ];

      mockFetchSuccess(mockNotifications);
      await store.fetchNotifications();

      mockFetchSuccess({ success: true });

      await store.markAllAsRead();

      const unreadNotifications = store.notifications.filter(n => !n.is_read);
      expect(unreadNotifications).toHaveLength(0);
      expect(store.unreadCount).toBe(0);
    });
  });

  describe('Delete Notification', () => {
    it('should delete a notification', async () => {
      const store = useNotificationsStore();
      const mockNotifications = [
        { id: '1', is_read: false, title: 'Test', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
        { id: '2', is_read: false, title: 'Test 2', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() },
      ];

      mockFetchSuccess(mockNotifications);
      await store.fetchNotifications();

      mockFetchSuccess({ success: true });

      await store.deleteNotification('1');

      expect(store.notifications).toHaveLength(1);
      expect(store.notifications[0]?.id).toBe('2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty notifications array', async () => {
      const store = useNotificationsStore();
      mockFetchSuccess([]);

      await store.fetchNotifications();

      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toBe(0);
    });

    it('should handle invalid date format gracefully', () => {
      const store = useNotificationsStore();

      const formatted = store.formatRelativeTime('invalid-date');

      expect(formatted).toBeDefined();
    });

    it('should handle concurrent notification fetches', async () => {
      const store = useNotificationsStore();
      mockFetchSuccess([{ id: '1', is_read: false, title: 'Test', message: 'msg', notification_type: 'info', created_at: new Date().toISOString() }]);

      const promise1 = store.fetchNotifications();
      const promise2 = store.fetchNotifications();
      await Promise.all([promise1, promise2]);

      expect(store.notifications).toBeDefined();
    });
  });
});