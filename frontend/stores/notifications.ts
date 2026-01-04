import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/auth';

// On définit une interface plus complète pour correspondre à ton UI
interface Notification {
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
      const { getPendingOffers } = useCase(); // On utilise ton composable
      
      if (!authStore.isAuthenticated || !authStore.user) return;

      this.loading = true;
      try {
        const config = useRuntimeConfig();
        
        // 1. Récupération des notifications "système" via ton API existante
        const apiResponse = await $fetch<any>(`${config.public.apiBaseUrl}/notifications`, {
          method: 'GET',
          headers: authStore.getAuthHeaders(),
        }).catch(() => ({ success: true, data: [] })); // Fallback si la route n'existe pas encore

        let allNotifs: Notification[] = [];

        // 2. Logique spécifique pour les AVOCATS (Fusion des offres)
        if (authStore.isLawyer) {
          const id1 = authStore.user.id;
          const id2 = authStore.user.lawyerId;

          const [offers1, offers2] = await Promise.all([
            getPendingOffers(id1),
            id2 ? getPendingOffers(id2) : Promise.resolve([])
          ]);

          // Nettoyage et fusion des doublons
          const rawOffers = [...(Array.isArray(offers1) ? offers1 : []), ...(Array.isArray(offers2) ? offers2 : [])];
          const uniqueOffers = Array.from(new Map(rawOffers.map(o => [o.id, o])).values());

          // Conversion des offres en format "Notification"
          const offerNotifs = uniqueOffers.map((o: any) => ({
            id: o.id,
            type: 'offer',
            category: 'Nouveau Dossier ⚖️',
            title: 'Nouvelle demande client',
            message: `Dossier: ${o.title || 'Sans titre'}`,
            time: o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : 'À l’instant',
            created_at: o.created_at || new Date().toISOString(),
            is_read: false
          }));

          allNotifs = [...offerNotifs];
        } 
        
        // 3. Logique pour les CLIENTS (Exemples si ton API est vide)
        if (authStore.isClient && apiResponse.data?.length === 0) {
           allNotifs = [
            { id: 'c1', type: 'offer', category: 'Dossier Accepté ! ✅', title: 'Mise à jour dossier', message: 'Votre demande a été acceptée par l\'avocat.', time: 'À l’instant', created_at: new Date().toISOString(), is_read: false },
            { id: 'c2', type: 'message', category: 'Communication 💬', title: 'Nouveau message', message: 'Vous avez reçu un nouveau message.', time: 'Hier', created_at: new Date().toISOString(), is_read: false }
          ];
        } else if (apiResponse.data) {
          // Si l'API renvoie de vraies notifs, on les ajoute
          allNotifs = [...allNotifs, ...apiResponse.data];
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
        await $fetch(`${config.public.apiBaseUrl}/notifications/read-all`, {
          method: 'POST',
          headers: authStore.getAuthHeaders(),
        });
        this.notifications.forEach(n => n.is_read = true);
      } catch (error) {
        this.notifications.forEach(n => n.is_read = true);
      }
    }
  }
});