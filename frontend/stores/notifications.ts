import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { useCase } from '~/composables/useCase';

export interface Notification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  time: string;
  created_at: string;
  data?: any;
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.is_read).length,
    isLoading: (state) => state.loading,
  },

  actions: {
    formatRelativeTime(dateString: string): string {
      if (!dateString) return 'Just now';

      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) {
        return `${diffSeconds} seconds ago`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    },

    async fetchNotifications() {
      const authStore = useAuthStore();
      const { getPendingOffers } = useCase();

      if (!authStore.isAuthenticated || !authStore.user) return;

      this.loading = true;
      try {
        const config = useRuntimeConfig();
        let allNotifs: Notification[] = [];

        try {
          const apiResponse = await $fetch<any>(`${config.public.apiBaseUrl}/notifications`, {
            method: 'GET',
            headers: authStore.getAuthHeaders(),
          });

          if (Array.isArray(apiResponse)) {
            allNotifs = apiResponse.map((notif: any) => ({
              id: notif.id,
              type: notif.type || notif.notification_type,
              category: notif.category,
              title: notif.title,
              message: notif.message,
              is_read: notif.is_read,
              time: notif.time || this.formatRelativeTime(notif.created_at),
              created_at: notif.created_at,
              data: notif.data
            }));
          } else if (apiResponse.success && apiResponse.data) {
            allNotifs = apiResponse.data.map((notif: any) => ({
              id: notif.id,
              type: notif.type || notif.notification_type,
              category: notif.category,
              title: notif.title,
              message: notif.message,
              is_read: notif.is_read,
              time: notif.time || this.formatRelativeTime(notif.created_at),
              created_at: notif.created_at,
              data: notif.data
            }));
          }
        } catch (error) {
          console.error('Erreur API notifications:', error);
        }

        if (authStore.isLawyer) {
          try {
            const offers = await getPendingOffers(authStore.user.id);
            const offersList = Array.isArray(offers) ? offers : [];

            const offerNotifs = offersList.map((o: any) => ({
              id: o.id,
              type: 'offer',
              category: 'Nouveau Dossier',
              title: 'Nouvelle demande client',
              message: `Dossier: ${o.title || 'Sans titre'}`,
              time: this.formatRelativeTime(o.created_at),
              created_at: o.created_at || new Date().toISOString(),
              is_read: false,
              data: { case_id: o.id, offer_id: o.id }
            }));

            allNotifs = [...allNotifs, ...offerNotifs];
          } catch (error) {
            console.error('Erreur récupération offres:', error);
          }
        }
        
        allNotifs.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        this.notifications = allNotifs;

      } catch (error) {
        console.error('Erreur globale notifications:', error);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id: string) {
      const authStore = useAuthStore();
      try {
        const config = useRuntimeConfig();
        await $fetch(`${config.public.apiBaseUrl}/notifications/${id}/read`, {
          method: 'PATCH',
          headers: authStore.getAuthHeaders(),
        });
        
        const notif = this.notifications.find(n => n.id === id);
        if (notif) notif.is_read = true;
      } catch (error) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) notif.is_read = true;
      }
    },

    async markAllAsRead() {
      const authStore = useAuthStore();
      try {
        const config = useRuntimeConfig();
        await $fetch(`${config.public.apiBaseUrl}/notifications/mark-all-read`, {
          method: 'PATCH',
          headers: authStore.getAuthHeaders(),
        });
        this.notifications.forEach(n => n.is_read = true);
      } catch (error) {
        console.error('Erreur markAllAsRead:', error);
        this.notifications.forEach(n => n.is_read = true);
      }
    },

    async deleteNotification(id: string) {
      const authStore = useAuthStore();
      try {
        const config = useRuntimeConfig();
        await $fetch(`${config.public.apiBaseUrl}/notifications/${id}`, {
          method: 'DELETE',
          headers: authStore.getAuthHeaders(),
        });
        this.notifications = this.notifications.filter(n => n.id !== id);
      } catch (error) {
        console.error('Erreur deleteNotification:', error);
        // Remove from local state even if API call fails
        this.notifications = this.notifications.filter(n => n.id !== id);
      }
    },

    formatDate(dateString: string): string {
      return this.formatRelativeTime(dateString);
    }
  }
});

export const useNotificationsStore = useNotificationStore;