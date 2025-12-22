<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
          <p class="text-gray-600 mt-2">Restez informé de toutes vos activités</p>
        </div>
        <button
          v-if="hasUnread"
          @click="markAllAsRead"
          class="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-4 mb-8">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in filters"
            :key="filter.id"
            @click="activeFilter = filter.id"
            :class="[
              activeFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              'px-4 py-2 rounded-lg transition-colors text-sm font-medium'
            ]"
          >
            {{ filter.label }}
            <span v-if="filter.count > 0" class="ml-2 px-2 py-0.5 rounded-full text-xs" :class="activeFilter === filter.id ? 'bg-blue-700' : 'bg-gray-200'">
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="loading" class="bg-white rounded-lg shadow p-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="filteredNotifications.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
          <p class="mt-1 text-sm text-gray-500">Vous êtes à jour !</p>
        </div>

        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :class="[
            'bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer',
            !notification.is_read ? 'border-l-4 border-blue-600' : ''
          ]"
          @click="markAsRead(notification)"
        >
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div
                :class="[
                  'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                  getNotificationColor(notification.notification_type)
                ]"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="getNotificationIcon(notification.notification_type)"
                  />
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-base font-semibold text-gray-900">{{ notification.title }}</h3>
                    <p class="mt-1 text-sm text-gray-600">{{ notification.message }}</p>
                  </div>
                  <span
                    v-if="notification.priority === 'urgent' || notification.priority === 'high'"
                    :class="[
                      'ml-2 px-2 py-1 text-xs rounded-full',
                      notification.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    ]"
                  >
                    {{ notification.priority === 'urgent' ? 'Urgent' : 'Important' }}
                  </span>
                </div>

                <div class="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatTime(notification.created_at) }}
                  </span>
                  <span class="px-2 py-1 bg-gray-100 rounded text-xs">
                    {{ getNotificationTypeLabel(notification.notification_type) }}
                  </span>
                </div>

                <div v-if="notification.data?.action_url" class="mt-4">
                  <button
                    @click.stop="handleAction(notification)"
                    class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir les détails →
                  </button>
                </div>
              </div>

              <button
                v-if="!notification.is_read"
                @click.stop="markAsRead(notification)"
                class="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg"
                title="Marquer comme lu"
              >
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const notifications = ref<any[]>([]);
const loading = ref(true);
const activeFilter = ref('all');

const filters = computed(() => [
  { id: 'all', label: 'Toutes', count: notifications.value.length },
  { id: 'unread', label: 'Non lues', count: notifications.value.filter(n => !n.is_read).length },
  { id: 'appointments', label: 'Rendez-vous', count: notifications.value.filter(n => n.notification_type === 'appointment_reminder').length },
  { id: 'cases', label: 'Dossiers', count: notifications.value.filter(n => n.notification_type === 'case_update').length },
  { id: 'messages', label: 'Messages', count: notifications.value.filter(n => n.notification_type === 'message_received').length },
]);

const hasUnread = computed(() => notifications.value.some(n => !n.is_read));

const filteredNotifications = computed(() => {
  let filtered = notifications.value;

  if (activeFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.is_read);
  } else if (activeFilter.value === 'appointments') {
    filtered = filtered.filter(n => n.notification_type === 'appointment_reminder');
  } else if (activeFilter.value === 'cases') {
    filtered = filtered.filter(n => n.notification_type === 'case_update');
  } else if (activeFilter.value === 'messages') {
    filtered = filtered.filter(n => n.notification_type === 'message_received');
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

onMounted(() => {
  loadNotifications();
});

const loadNotifications = async () => {
  try {
    loading.value = true;

    notifications.value = [
      {
        id: '1',
        notification_type: 'appointment_reminder',
        title: 'Rappel de rendez-vous',
        message: 'Vous avez un rendez-vous demain à 10h00 avec Me. Dupont',
        priority: 'high',
        is_read: false,
        created_at: new Date('2025-12-22T09:00:00'),
        data: { action_url: '/appointments/1' },
      },
      {
        id: '2',
        notification_type: 'message_received',
        title: 'Nouveau message',
        message: 'Marie Martin vous a envoyé un message',
        priority: 'normal',
        is_read: false,
        created_at: new Date('2025-12-22T08:30:00'),
        data: { action_url: '/messages' },
      },
      {
        id: '3',
        notification_type: 'case_update',
        title: 'Mise à jour du dossier',
        message: 'Le dossier "Divorce Dupont" a été mis à jour',
        priority: 'normal',
        is_read: true,
        created_at: new Date('2025-12-21T15:00:00'),
        data: { action_url: '/cases/1' },
      },
      {
        id: '4',
        notification_type: 'document_uploaded',
        title: 'Nouveau document',
        message: 'Un nouveau document a été ajouté à votre dossier',
        priority: 'normal',
        is_read: true,
        created_at: new Date('2025-12-20T14:00:00'),
        data: { action_url: '/documents' },
      },
    ];
  } catch (error) {
    console.error('Error loading notifications:', error);
  } finally {
    loading.value = false;
  }
};

const markAsRead = (notification: any) => {
  notification.is_read = true;
  // TODO: API call to mark as read
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.is_read = true);
  // TODO: API call to mark all as read
};

const handleAction = (notification: any) => {
  if (notification.data?.action_url) {
    navigateTo(notification.data.action_url);
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return notifDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });
};

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    appointment_reminder: 'bg-blue-500',
    message_received: 'bg-green-500',
    case_update: 'bg-purple-500',
    document_uploaded: 'bg-orange-500',
    payment_received: 'bg-teal-500',
  };
  return colors[type] || 'bg-gray-500';
};

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    appointment_reminder: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    message_received: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    case_update: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    document_uploaded: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    payment_received: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  };
  return icons[type] || 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
};

const getNotificationTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    appointment_reminder: 'Rendez-vous',
    message_received: 'Message',
    case_update: 'Dossier',
    document_uploaded: 'Document',
    payment_received: 'Paiement',
  };
  return labels[type] || 'Notification';
};
</script>