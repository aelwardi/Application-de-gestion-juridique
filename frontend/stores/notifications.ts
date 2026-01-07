import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/auth';

// On définit une interface plus complète pour correspondre à ton UI
export interface Notification {
  id: string;
  type: string;        // 'offer', 'message', etc.
  category: string;    // 'Nouveau Dossier ⚖️', 'Communication 💬'
  title: string;
  message: string;
  is_read: boolean;
  time: string;        // Date formatée pour l'affichage
  created_at: string;  // Date brute pour le tri si besoin
  data?: any;          // Données additionnelles (case_id, conversation_id, etc.)
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
    formatRelativeTime(dateString: string): string {
      if (!dateString) return 'À l\'instant';

      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) {
        return 'À l\'instant';
      } else if (diffMinutes < 60) {
        return `il y a ${diffMinutes} min`;
      } else if (diffHours < 24) {
        return `il y a ${diffHours}h`;
      } else if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays < 7) {
        return `il y a ${diffDays}j`;
      } else {
        return date.toLocaleDateString('fr-FR', {
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

          if (apiResponse.success && apiResponse.data) {
            allNotifs = apiResponse.data.map((notif: any) => ({
              id: notif.id,
              type: notif.type,
              category: notif.category,
              title: notif.title,
              message: notif.message,
              is_read: notif.is_read,
              time: notif.time,
              created_at: notif.created_at,
              data: notif.data
            }));
          }
        } catch (error) {
          console.error('Erreur API notifications:', error);
        }

        // 2. Pour les AVOCATS : ajouter les offres en attente
        if (authStore.isLawyer) {
          try {
            const offers = await getPendingOffers(authStore.user.id);
            const offersList = Array.isArray(offers) ? offers : [];

            // Conversion des offres en format "Notification"
            const offerNotifs = offersList.map((o: any) => ({
              id: o.id,
              type: 'offer',
              category: 'Nouveau Dossier ⚖️',
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
        // En cas d'erreur API, on marque quand même en local pour l'UX
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
    }
  }
});