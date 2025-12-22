<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        @click.stop
      >
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">Notifications</h3>
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            Tout marquer comme lu
          </button>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="loading" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>

          <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="mt-2 text-sm">Aucune notification</p>
          </div>

          <div v-else>
            <div
              v-for="notification in notifications.slice(0, 5)"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              :class="[
                'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                !notification.is_read ? 'bg-blue-50' : ''
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                    getNotificationColor(notification.notification_type)
                  ]"
                >
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="getNotificationIcon(notification.notification_type)"
                    />
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                  <p class="text-sm text-gray-600 truncate">{{ notification.message }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatTime(notification.created_at) }}</p>
                </div>

                <div v-if="!notification.is_read" class="flex-shrink-0">
                  <span class="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200">
          <NuxtLink
            to="/notifications"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
            @click="isOpen = false"
          >
            Voir toutes les notifications →
          </NuxtLink>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false);
const loading = ref(false);
const notifications = ref<any[]>([]);

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

onMounted(() => {
  loadNotifications();
  setInterval(loadNotifications, 30000);
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    loadNotifications();
  }
};

const loadNotifications = async () => {
  try {
    loading.value = true;

    notifications.value = [
      {
        id: '1',
        notification_type: 'appointment_reminder',
        title: 'Rappel de rendez-vous',
        message: 'Rendez-vous demain à 10h00',
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
    ];
  } catch (error) {
    console.error('Error loading notifications:', error);
  } finally {
    loading.value = false;
  }
};

const markAllAsRead = () => {
  notifications.value.forEach(n => n.is_read = true);
  // TODO: API call to mark all as read
};

const handleNotificationClick = (notification: any) => {
  notification.is_read = true;
  isOpen.value = false;

  if (notification.data?.action_url) {
    navigateTo(notification.data.action_url);
  }

  // TODO: API call to mark as read
};

const formatTime = (date: Date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;

  return notifDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
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

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (isOpen.value) {
      isOpen.value = false;
    }
  });
});
</script>