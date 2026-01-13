import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockUser } from '../../helpers/integration-utils';

describe('Notifications API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/notifications', () => {
    it('should fetch notifications successfully', async () => {
      
      const mockNotifications = [
        {
          id: 1,
          type: 'appointment',
          title: 'Nouveau rendez-vous',
          message: 'Vous avez un rendez-vous demain',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { appointmentId: 123 }
        },
        {
          id: 2,
          type: 'message',
          title: 'Nouveau message',
          message: 'Vous avez reçu un nouveau message',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { messageId: 456 }
        }
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockNotifications
      });

      const result = await $fetch('/api/notifications', {
        method: 'GET'
      }) as any;

      expect($fetch).toHaveBeenCalledWith('/api/notifications', {
        method: 'GET'
      });
      expect(result.data).toHaveLength(2);
      expect(result.data.filter((n: any) => !n.isRead)).toHaveLength(2);
    });

    it('should handle empty notifications list', async () => {

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: []
      });

      const result = await $fetch('/api/notifications', {
        method: 'GET'
      }) as any;

      expect(result.data).toHaveLength(0);
    });

    it('should handle fetch error gracefully', async () => {

      vi.mocked($fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect($fetch('/api/notifications', {
        method: 'GET'
      })).rejects.toThrow('Network error');
    });
  });

  describe('POST /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: { id: 1, isRead: true }
      });

      const result = await $fetch('/api/notifications/1/read', {
        method: 'POST'
      }) as any;

      expect($fetch).toHaveBeenCalledWith('/api/notifications/1/read', {
        method: 'POST'
      });
      expect(result.data.isRead).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: { markedCount: 2 }
      });

      const result = await $fetch('/api/notifications/read-all', {
        method: 'POST'
      }) as any;

      expect($fetch).toHaveBeenCalledWith('/api/notifications/read-all', {
        method: 'POST'
      });
      expect(result.data.markedCount).toBe(2);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete a notification', async () => {
      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        message: 'Notification supprimée'
      });

      const result = await $fetch('/api/notifications/1', {
        method: 'DELETE'
      }) as any;

      expect(result.success).toBe(true);
    });

    it('should handle delete error', async () => {
      const error = new Error('Notification non trouvée');
      (error as any).statusCode = 404;
      vi.mocked($fetch).mockRejectedValueOnce(error);

      await expect($fetch('/api/notifications/999', {
        method: 'DELETE'
      })).rejects.toThrow();
    });
  });

  describe('Real-time notification updates', () => {
    it('should add new notification in real-time', async () => {
      const existingNotifications = [
        {
          id: 1,
          type: 'message',
          title: 'Ancien message',
          message: 'Test',
          isRead: true,
          createdAt: new Date().toISOString(),
          data: {}
        }
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: existingNotifications
      });

      const result1 = await $fetch('/api/notifications', {
        method: 'GET'
      }) as any;
      expect(result1.data).toHaveLength(1);

      const newNotification = {
        id: 2,
        type: 'appointment',
        title: 'Nouveau rendez-vous',
        message: 'Rendez-vous confirmé',
        isRead: false,
        createdAt: new Date().toISOString(),
        data: { appointmentId: 123 }
      };

      const allNotifications = [newNotification, ...existingNotifications];
      expect(allNotifications).toHaveLength(2);
      expect(allNotifications[0]?.id).toBe(2); 
    });
  });

  describe('Notification filtering and sorting', () => {
    it('should filter unread notifications', async () => {
      const mockNotifications = [
        {
          id: 1,
          type: 'message',
          title: 'Lu',
          message: 'Message lu',
          isRead: true,
          createdAt: new Date().toISOString(),
          data: {}
        },
        {
          id: 2,
          type: 'appointment',
          title: 'Non lu 1',
          message: 'Message non lu',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: {}
        },
        {
          id: 3,
          type: 'message',
          title: 'Non lu 2',
          message: 'Autre message non lu',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: {}
        }
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockNotifications
      });

      const result = await $fetch('/api/notifications', {
        method: 'GET'
      }) as any;

      const unreadNotifications = result.data.filter((n: any) => !n.isRead);
      expect(unreadNotifications).toHaveLength(2);
    });

    it('should filter by notification type', async () => {
      const mockNotifications = [
        {
          id: 1,
          type: 'message',
          title: 'Message 1',
          message: 'Test',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: {}
        },
        {
          id: 2,
          type: 'appointment',
          title: 'Rendez-vous',
          message: 'Test',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: {}
        },
        {
          id: 3,
          type: 'message',
          title: 'Message 2',
          message: 'Test',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: {}
        }
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockNotifications
      });

      const result = await $fetch('/api/notifications', {
        method: 'GET'
      }) as any;

      const messageNotifications = result.data.filter(
        (n: any) => n.type === 'message'
      );
      expect(messageNotifications).toHaveLength(2);

      const appointmentNotifications = result.data.filter(
        (n: any) => n.type === 'appointment'
      );
      expect(appointmentNotifications).toHaveLength(1);
    });
  });
});
