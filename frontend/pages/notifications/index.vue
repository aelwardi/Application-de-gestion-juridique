
<script setup lang="ts">
import type { Notification } from '~/stores/notifications';

definePageMeta({
  middleware: ['auth'],
  layout: 'authenticated',
});

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const { acceptOffer: acceptOfferApi, declineOffer } = useCase();
const toast = useToast();
const confirmModal = useConfirm();

const loading = ref(false);
const activeFilter = ref('all');
const showOfferModal = ref(false);
const selectedOffer = ref<any>(null);

const canShowModal = computed(() => {
  return showOfferModal.value && selectedOffer.value && selectedOffer.value.id;
});

const filters = [
  { value: 'all', label: 'Toutes' },
  { value: 'unread', label: 'Non lues' },
  { value: 'offer', label: 'Offres/Dossiers' },
  { value: 'message', label: 'Messages' },
];

const notifications = computed(() => notificationStore.notifications);

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value;
  if (activeFilter.value === 'unread') return notifications.value.filter(n => !n.is_read);
  return notifications.value.filter(n => n.type === activeFilter.value);
});

const unreadCount = computed(() => notificationStore.unreadCount);

onMounted(() => {
  loadNotifications();
});

const loadNotifications = async () => {
  loading.value = true;
  try {
    await notificationStore.fetchNotifications();
  } catch (error) {
    console.error('Error loading notifications:', error);
  } finally {
    loading.value = false;
  }
};


const markAllRead = async () => {
  loading.value = true;
  try {
    await notificationStore.markAllAsRead();
  } catch (error) {
    console.error('Error marking all as read:', error);
  } finally {
    loading.value = false;
  }
};

const deleteNotif = async (notificationId: string) => {
  const confirmed = await confirmModal.confirm({
    title: 'Confirmer la suppression',
    message: 'Êtes-vous sûr de vouloir supprimer cette notification ?',
    confirmText: 'Supprimer',
    cancelText: 'Annuler',
  });

  if (!confirmed) return;

  await notificationStore.markAsRead(notificationId);
  toast.success('Notification supprimée');
  loadNotifications();
};

const showOfferDetails = async (notification: Notification) => {
  if (!notification.is_read) {
    await notificationStore.markAsRead(notification.id);
  }

  try {
    const { apiFetch } = useApi();
    const response = await apiFetch(`/clients-extended/requests/${notification.id}`) as any;
    selectedOffer.value = response.data || response;

    if (selectedOffer.value && selectedOffer.value.id) {
      showOfferModal.value = true;
    } else {
      console.error('Offre reçue sans ID valide:', selectedOffer.value);
      toast.error('Impossible de charger les détails de l\'offre');
    }
  } catch (error: any) {
    console.error('Erreur lors du chargement des détails:', error);
    const offerId = notification.data?.offer_id || notification.data?.case_id || notification.id;

    if (!offerId) {
      console.error('Impossible de déterminer l\'ID de l\'offre');
      toast.error('Impossible d\'identifier l\'offre');
      return;
    }

    selectedOffer.value = {
      id: offerId,
      title: notification.title || notification.message,
      message: notification.message,
      description: notification.message,
      ...notification.data,
    };
    showOfferModal.value = true;
  }
};

const acceptOffer = async (notification: Notification) => {
  const confirmed = await confirmModal.confirm({
    title: 'Accepter l\'offre',
    message: 'Êtes-vous sûr de vouloir accepter cette offre ?\n\nUn nouveau dossier sera automatiquement créé.',
    confirmText: 'Accepter',
    cancelText: 'Annuler',
  });

  if (!confirmed) return;

  loading.value = true;
  try {
    await acceptOfferApi(notification.id);
    await notificationStore.markAsRead(notification.id);
    await loadNotifications();
    toast.success('Offre acceptée avec succès ! Le dossier a été créé.');
  } catch (error) {
    console.error('Erreur lors de l\'acceptation:', error);
    toast.error('Erreur lors de l\'acceptation de l\'offre');
  } finally {
    loading.value = false;
  }
};

const rejectOffer = async (notification: Notification) => {
  const confirmed = await confirmModal.confirm({
    title: 'Refuser l\'offre',
    message: 'Êtes-vous sûr de vouloir refuser cette offre ?',
    confirmText: 'Refuser',
    cancelText: 'Annuler',
  });

  if (!confirmed) return;

  loading.value = true;
  try {
    await declineOffer(notification.id);
    await notificationStore.markAsRead(notification.id);
    await loadNotifications();
    toast.success('Offre refusée');
  } catch (error) {
    console.error('Erreur lors du refus:', error);
    toast.error('Erreur lors du refus de l\'offre');
  } finally {
    loading.value = false;
  }
};

const closeOfferModal = () => {
  showOfferModal.value = false;
  selectedOffer.value = null;
};

const handleOfferAcceptFromModal = async () => {
  if (!selectedOffer.value || !selectedOffer.value.id) {
    console.error('Pas d\'offre sélectionnée ou ID manquant');
    toast.error('Erreur : impossible d\'identifier l\'offre');
    return;
  }

  const offerId = selectedOffer.value.id;

  loading.value = true;
  try {
    await acceptOfferApi(offerId);
    closeOfferModal();
    await notificationStore.markAsRead(offerId);
    await loadNotifications();
    toast.success('Offre acceptée avec succès ! Le dossier a été créé.');
  } catch (error) {
    console.error('Erreur lors de l\'acceptation:', error);
    toast.error('Erreur lors de l\'acceptation de l\'offre');
  } finally {
    loading.value = false;
  }
};

const handleOfferRejectFromModal = async () => {
  if (!selectedOffer.value || !selectedOffer.value.id) {
    console.error('Pas d\'offre sélectionnée ou ID manquant');
    toast.error('Erreur : impossible d\'identifier l\'offre');
    return;
  }

  const offerId = selectedOffer.value.id;

  loading.value = true;
  try {
    await declineOffer(offerId);
    closeOfferModal();
    await notificationStore.markAsRead(offerId);
    await loadNotifications();
    toast.success('Offre refusée avec succès');
  } catch (error) {
    console.error('Erreur lors du refus:', error);
    toast.error('Erreur lors du refus de l\'offre');
  } finally {
    loading.value = false;
  }
};


const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    offer: 'bg-green-500',
    appointment: 'bg-blue-500',
    case: 'bg-green-500',
    message: 'bg-purple-500',
    system: 'bg-gray-500',
    reminder: 'bg-orange-500',
  };
  return colors[type] || 'bg-gray-500';
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    offer: 'Offre/Dossier',
    appointment: 'Rendez-vous',
    case: 'Dossier',
    message: 'Message',
    system: 'Système',
    reminder: 'Rappel',
  };
  return labels[type] || type;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
            <p class="mt-2 text-sm text-gray-600">
              Gérez toutes vos notifications
            </p>
          </div>
          <button
              v-if="unreadCount > 0"
              @click="markAllRead"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Filtrer:</label>
          <div class="flex gap-2">
            <button
                v-for="filter in filters"
                :key="filter.value"
                @click="activeFilter = filter.value"
                class="px-4 py-2 rounded-md text-sm font-medium transition"
                :class="activeFilter === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              {{ filter.label }}
              <span v-if="filter.value === 'unread' && unreadCount > 0" class="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs">
                {{ unreadCount }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Chargement des notifications...</p>
      </div>

      <div v-else-if="filteredNotifications.length > 0" class="space-y-3">
        <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="bg-white rounded-lg shadow hover:shadow-md transition"
            :class="!notification.is_read ? 'border-l-4 border-blue-500' : ''"
        >
          <div class="p-5">
            <div class="flex items-start gap-4">
              <div
                  class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  :class="getNotificationColor(notification.type)"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      v-if="notification.type === 'appointment'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                  <path
                      v-else-if="notification.type === 'case'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                      v-else-if="notification.type === 'message'"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                  <path
                      v-else
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>

              <div class="flex-grow min-w-0">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-base font-bold text-gray-900">
                    {{ notification.title }}
                  </h3>
                  <span v-if="!notification.is_read" class="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 ml-2"></span>
                </div>

                <p class="text-sm text-gray-700 mb-3">
                  {{ notification.message }}
                </p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ formatDate(notification.created_at) }}
                    </span>
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {{ getTypeLabel(notification.type) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                        v-if="notification.type === 'offer' && authStore.isLawyer"
                        @click.stop="showOfferDetails(notification)"
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Voir les détails"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                        v-if="notification.type === 'offer' && authStore.isLawyer"
                        @click.stop="acceptOffer(notification)"
                        class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Accepter l'offre"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>

                    <button
                        v-if="notification.type === 'offer' && authStore.isLawyer"
                        @click.stop="rejectOffer(notification)"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Refuser l'offre"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <button
                        @click.stop="deleteNotif(notification.id)"
                        class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Aucune notification</h3>
        <p class="mt-1 text-sm text-gray-500">
          Vous n'avez pas de notifications pour le moment
        </p>
      </div>
    </div>

    <NotificationsOfferDetailModal
      v-if="canShowModal"
      :show="showOfferModal"
      :offer="selectedOffer"
      @close="closeOfferModal"
      @accept="handleOfferAcceptFromModal"
      @reject="handleOfferRejectFromModal"
    />
  </div>
</template>
