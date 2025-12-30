import { defineStore } from 'pinia';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  url?: string;
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.is_read).length,
  },

  actions: {
    async fetchNotifications() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const response = await $fetch<any>(`${config.public.apiBaseUrl}/notifications`, {
          method: 'GET',
          headers: authStore.getAuthHeaders(), // On réutilise tes headers d'auth !
        });

        if (response.success) {
          this.notifications = response.data;
        }
      } catch (error) {
        console.error('Erreur notifications:', error);
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
        console.error('Erreur marquage lu:', error);
      }
    },

    async markAllAsRead() {
        const authStore = useAuthStore();
        try {
          const config = useRuntimeConfig();
          await $fetch(`${config.public.apiBaseUrl}/notifications/read-all`, {
            method: 'POST',
            headers: authStore.getAuthHeaders(),
          });
          this.notifications.forEach(n => n.is_read = true);
        } catch (error) {
          console.error('Erreur marquage tout lu:', error);
        }
      }
  }
});