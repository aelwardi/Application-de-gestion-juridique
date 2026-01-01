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
          @click="handleNotificationClick(notification)"
          class="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
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
                  <div class="flex items-center gap-2 ml-4">
                    <span v-if="!notification.is_read" class="w-3 h-3 bg-blue-600 rounded-full"></span>
                    <button
                      @click.stop="deleteNotif(notification.id)"
                      class="text-gray-400 hover:text-red-600 transition"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p class="text-sm text-gray-700 mb-3">
                  {{ notification.message }}
                </p>

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
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/composables/useNotifications';

definePageMeta({
  middleware: ['auth'],
  layout: 'authenticated',
});

const { getUserNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
const authStore = useAuthStore();

const notifications = ref<Notification[]>([]);
const loading = ref(false);
const activeFilter = ref('all');

const filters = [
  { value: 'all', label: 'Toutes' },
  { value: 'unread', label: 'Non lues' },
  { value: 'appointment', label: 'Rendez-vous' },
  { value: 'case', label: 'Dossiers' },
  { value: 'message', label: 'Messages' },
];

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value;
  if (activeFilter.value === 'unread') return notifications.value.filter(n => !n.is_read);
  return notifications.value.filter(n => n.type === activeFilter.value);
});

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

onMounted(() => {
  loadNotifications();
});

const loadNotifications = async () => {
  if (!authStore.user?.id) return;

  loading.value = true;
  try {
    const response = await getUserNotifications(authStore.user.id, 100);
    notifications.value = response.data;
  } catch (error) {
    console.error('Error loading notifications:', error);
  } finally {
    loading.value = false;
  }
};

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.is_read) {
    try {
      await markAsRead(notification.id);
      notification.is_read = true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  if (notification.related_entity_type && notification.related_entity_id) {
    switch (notification.related_entity_type) {
      case 'appointment':
        navigateTo(`/appointments/${notification.related_entity_id}`);
        break;
      case 'case':
        navigateTo(`/cases/${notification.related_entity_id}`);
        break;
      case 'message':
        navigateTo(`/messages`);
        break;
    }
  }
};

const markAllRead = async () => {
  if (!authStore.user?.id) return;

  try {
    await markAllAsRead(authStore.user.id);
    notifications.value.forEach(n => n.is_read = true);
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const deleteNotif = async (notificationId: string) => {
  if (!confirm('Supprimer cette notification ?')) return;

  try {
    await deleteNotification(notificationId);
    notifications.value = notifications.value.filter(n => n.id !== notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
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
    appointment: 'Rendez-vous',
    case: 'Dossier',
    message: 'Message',
    system: 'Système',
    reminder: 'Rappel',
  };
  return labels[type] || type;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;

  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>