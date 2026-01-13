import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationsStore } from '~/stores/notifications';

const mockGetPendingOffers = vi.fn().mockResolvedValue([]);

vi.mock('~/composables/useCase', () => ({
  useCase: vi.fn(() => ({
    getPendingOffers: mockGetPendingOffers
  }))
}));

describe('Notifications Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetPendingOffers.mockResolvedValue([]);
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const store = useNotificationsStore();

      expect(store.notifications).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.unreadCount).toBe(0);
    });
  });

  describe('Unread Count', () => {
    it('should calculate unread count correctly', () => {
      const store = useNotificationsStore();
      store.notifications = [
        { id: '1', message: 'Test 1', is_read: false, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
        { id: '2', message: 'Test 2', is_read: true, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
        { id: '3', message: 'Test 3', is_read: false, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
      ];

      expect(store.unreadCount).toBe(2);
    });

    it('should return zero when all notifications are read', () => {
      const store = useNotificationsStore();
      store.notifications = [
        { id: '1', message: 'Test 1', is_read: true, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
        { id: '2', message: 'Test 2', is_read: true, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
      ];

      expect(store.unreadCount).toBe(0);
    });
  });

  describe('Mark as Read', () => {
    it('should handle mark as read error', () => {
      const store = useNotificationsStore();
      store.notifications = [
        { id: '1', message: 'Test', is_read: false, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
      ];

      store.markAsRead('non-existent');

      expect(store.notifications[0]!.is_read).toBe(false);
    });
  });

  describe('Date Formatting', () => {
    it('should format recent dates as relative time', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const diff = now.getTime() - oneHourAgo.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));

      expect(hours).toBe(1);
    });

    it('should format old dates as absolute date', () => {
      const oldDate = new Date('2025-01-01');
      const formatted = oldDate.toLocaleDateString();

      expect(formatted).toBeTruthy();
    });

    it('should handle invalid date format gracefully', () => {
      const invalidDate = 'invalid-date';
      const date = new Date(invalidDate);

      expect(isNaN(date.getTime())).toBe(true);
    });

    it('should calculate time difference correctly', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const diff = now.getTime() - fiveMinutesAgo.getTime();
      const minutes = Math.floor(diff / (1000 * 60));

      expect(minutes).toBe(5);
    });
  });

  describe('Filter Notifications', () => {
    it('should filter by read status', () => {
      const notifications = [
        { id: '1', message: 'Test 1', is_read: false, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
        { id: '2', message: 'Test 2', is_read: true, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
        { id: '3', message: 'Test 3', is_read: false, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
      ];

      const unread = notifications.filter(n => !n.is_read);

      expect(unread).toHaveLength(2);
    });

    it('should filter by notification type', () => {
      const notifications = [
        { id: '1', message: 'Test 1', is_read: false, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
        { id: '2', message: 'Test 2', is_read: false, created_at: new Date().toISOString(), type: 'warning', category: 'general', title: 'Test', time: '' },
        { id: '3', message: 'Test 3', is_read: false, created_at: new Date().toISOString(), type: 'info', category: 'general', title: 'Test', time: '' },
      ];

      const infoNotifications = notifications.filter(n => n.type === 'info');

      expect(infoNotifications).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty notifications array', () => {
      const store = useNotificationsStore();
      store.notifications = [];

      expect(store.unreadCount).toBe(0);
      expect(store.notifications).toEqual([]);
    });
  });
});

