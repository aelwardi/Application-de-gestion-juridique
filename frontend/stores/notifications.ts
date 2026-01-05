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
      const { getPendingOffers } = useCase();

      if (!authStore.isAuthenticated || !authStore.user) return;

      this.loading = true;
      try {
        const config = useRuntimeConfig();
        let allNotifs: Notification[] = [];

        // 1. Récupération des notifications depuis l'API (documents, messages, etc.)
        try {
          const apiResponse = await $fetch<any>(`${config.public.apiBaseUrl}/notifications`, {
            method: 'GET',
            headers: authStore.getAuthHeaders(),
          });

          if (apiResponse.success && apiResponse.data) {
            allNotifs = apiResponse.data;
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
              time: o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : 'À l\'instant',
              created_at: o.created_at || new Date().toISOString(),
              is_read: false
            }));

            allNotifs = [...allNotifs, ...offerNotifs];
          } catch (error) {
            console.error('Erreur récupération offres:', error);
          }
        }
        
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