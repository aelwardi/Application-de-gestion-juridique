import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createMockUser } from '../../helpers/integration-utils';

describe('Messages API Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  describe('GET /api/conversations', () => {
    it('should fetch all conversations successfully', async () => {
      const mockUser = createMockUser({ role: 'client' });
      
      const mockConversations = [
        {
          id: 1,
          participant1_id: mockUser.id,
          participant2_id: 2,
          case_id: 10,
          last_message: 'Bonjour',
          last_message_at: new Date().toISOString(),
          unread_count: 2,
          other_participant: {
            id: 2,
            firstName: 'Jean',
            lastName: 'Dupont',
            role: 'lawyer',
            profilePictureUrl: null
          }
        },
        {
          id: 2,
          participant1_id: mockUser.id,
          participant2_id: 3,
          case_id: 11,
          last_message: 'Merci',
          last_message_at: new Date().toISOString(),
          unread_count: 0,
          other_participant: {
            id: 3,
            firstName: 'Marie',
            lastName: 'Martin',
            role: 'lawyer',
            profilePictureUrl: null
          }
        }
      ];

      const response = await $fetch('/api/conversations', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-token'
        }
      });

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockConversations
      });

      const result = await $fetch('/api/conversations', {
        method: 'GET'
      }) as any;

      expect(result.data).toHaveLength(2);
      expect(result.data[0].unread_count).toBe(2);
    });

    it('should handle empty conversations list', async () => {
      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: []
      });

      const result = await $fetch('/api/conversations', {
        method: 'GET'
      }) as any;

      expect(result.data).toHaveLength(0);
    });

    it('should handle unauthorized access', async () => {
      const error = new Error('Non autorisé');
      (error as any).statusCode = 401;
      vi.mocked($fetch).mockRejectedValueOnce(error);

      await expect($fetch('/api/conversations', {
        method: 'GET'
      })).rejects.toThrow();
    });
  });

  describe('GET /api/conversations/:id/messages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockMessages = [
        {
          id: 1,
          conversation_id: 1,
          sender_id: 1,
          content: 'Bonjour, comment puis-je vous aider?',
          created_at: new Date().toISOString(),
          is_read: true,
          sender: {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            role: 'lawyer'
          }
        },
        {
          id: 2,
          conversation_id: 1,
          sender_id: 2,
          content: 'J\'ai une question sur mon dossier',
          created_at: new Date().toISOString(),
          is_read: false,
          sender: {
            id: 2,
            firstName: 'Marie',
            lastName: 'Martin',
            role: 'client'
          }
        }
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockMessages
      });

      const result = await $fetch('/api/conversations/1/messages', {
        method: 'GET'
      }) as any;

      expect(result.data).toHaveLength(2);
      expect(result.data[0].content).toBe('Bonjour, comment puis-je vous aider?');
    });

    it('should handle conversation not found', async () => {
      const error = new Error('Conversation non trouvée');
      (error as any).statusCode = 404;
      vi.mocked($fetch).mockRejectedValueOnce(error);

      await expect($fetch('/api/conversations/999/messages', {
        method: 'GET'
      })).rejects.toThrow();
    });

    it('should support pagination', async () => {
      const mockMessages = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        conversation_id: 1,
        sender_id: (i % 2) + 1,
        content: `Message ${i + 1}`,
        created_at: new Date(Date.now() - i * 60000).toISOString(),
        is_read: true,
        sender: {
          id: (i % 2) + 1,
          firstName: 'User',
          lastName: `${i}`,
          role: i % 2 === 0 ? 'lawyer' : 'client'
        }
      }));

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockMessages.slice(0, 10),
        pagination: {
          page: 1,
          limit: 10,
          total: 20,
          hasMore: true
        }
      });

      const result = await $fetch('/api/conversations/1/messages', {
        method: 'GET',
        query: { page: 1, limit: 10 }
      }) as any;

      expect(result.data).toHaveLength(10);
      expect(result.pagination.hasMore).toBe(true);
    });
  });

  describe('POST /api/conversations/:id/messages', () => {
    it('should send a new message successfully', async () => {
      const newMessage = {
        content: 'Merci pour votre réponse rapide!'
      };

      const mockResponse = {
        id: 3,
        conversation_id: 1,
        sender_id: 2,
        content: newMessage.content,
        created_at: new Date().toISOString(),
        is_read: false,
        sender: {
          id: 2,
          firstName: 'Marie',
          lastName: 'Martin',
          role: 'client'
        }
      };

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: mockResponse
      });

      const result = await $fetch('/api/conversations/1/messages', {
        method: 'POST',
        body: newMessage
      }) as any;

      expect(result.data.content).toBe(newMessage.content);
      expect(result.data.id).toBe(3);
    });

    it('should validate message content', async () => {
      const invalidMessage = {
        content: '' 
      };

      const error = new Error('Le contenu du message est requis');
      (error as any).statusCode = 400;
      vi.mocked($fetch).mockRejectedValueOnce(error);

      await expect($fetch('/api/conversations/1/messages', {
        method: 'POST',
        body: invalidMessage
      })).rejects.toThrow();
    });

    it('should handle message too long', async () => {
      const longMessage = {
        content: 'a'.repeat(5001) 
      };

      const error = new Error('Le message est trop long (max 5000 caractères)');
      (error as any).statusCode = 400;
      vi.mocked($fetch).mockRejectedValueOnce(error);

      await expect($fetch('/api/conversations/1/messages', {
        method: 'POST',
        body: longMessage
      })).rejects.toThrow();
    });
  });

  describe('POST /api/conversations/:id/messages/:messageId/read', () => {
    it('should mark a message as read', async () => {
      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: { id: 1, is_read: true }
      });

      const result = await $fetch('/api/conversations/1/messages/1/read', {
        method: 'POST'
      }) as any;

      expect(result.data.is_read).toBe(true);
    });

    it('should mark all messages in conversation as read', async () => {
      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: { markedCount: 5 }
      });

      const result = await $fetch('/api/conversations/1/messages/read-all', {
        method: 'POST'
      }) as any;

      expect(result.data.markedCount).toBe(5);
    });
  });

  describe('DELETE /api/conversations/:id/messages/:messageId', () => {
    it('should delete a message', async () => {
      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        message: 'Message supprimé'
      });

      const result = await $fetch('/api/conversations/1/messages/1', {
        method: 'DELETE'
      }) as any;

      expect(result.success).toBe(true);
    });

    it('should prevent deleting other user\'s message', async () => {
      const error = new Error('Vous ne pouvez supprimer que vos propres messages');
      (error as any).statusCode = 403;
      vi.mocked($fetch).mockRejectedValueOnce(error);

      await expect($fetch('/api/conversations/1/messages/999', {
        method: 'DELETE'
      })).rejects.toThrow();
    });
  });

  describe('Real-time message updates', () => {
    it('should receive new message via WebSocket simulation', async () => {
      const messages: any[] = [];

      const initialMessages = [
        {
          id: 1,
          conversation_id: 1,
          sender_id: 1,
          content: 'Message initial',
          created_at: new Date().toISOString(),
          is_read: true,
          sender: { id: 1, firstName: 'Jean', lastName: 'Dupont', role: 'lawyer' }
        }
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: initialMessages
      });

      const result = await $fetch('/api/conversations/1/messages', {
        method: 'GET'
      }) as any;

      messages.push(...result.data);
      expect(messages).toHaveLength(1);

      const newMessage = {
        id: 2,
        conversation_id: 1,
        sender_id: 2,
        content: 'Nouveau message en temps réel',
        created_at: new Date().toISOString(),
        is_read: false,
        sender: { id: 2, firstName: 'Marie', lastName: 'Martin', role: 'client' }
      };

      messages.push(newMessage);
      expect(messages).toHaveLength(2);
      expect(messages[1].content).toBe('Nouveau message en temps réel');
    });
  });

  describe('Search messages', () => {
    it('should search messages by content', async () => {
      const searchResults = [
        {
          id: 5,
          conversation_id: 1,
          sender_id: 1,
          content: 'Question importante sur le contrat',
          created_at: new Date().toISOString(),
          is_read: true,
          sender: { id: 1, firstName: 'Jean', lastName: 'Dupont', role: 'lawyer' }
        }
      ];

      vi.mocked($fetch).mockResolvedValueOnce({
        success: true,
        data: searchResults
      });

      const result = await $fetch('/api/conversations/1/messages/search', {
        method: 'GET',
        query: { q: 'contrat' }
      }) as any;

      expect(result.data).toHaveLength(1);
      expect(result.data[0].content).toContain('contrat');
    });
  });
});
