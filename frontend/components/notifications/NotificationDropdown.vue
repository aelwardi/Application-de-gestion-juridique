<template>
  <div class="relative">
    <button 
      @click="isOpen = !isOpen"
      class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span v-if="unreadCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
        {{ unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div 
      v-if="isOpen"
      @click.stop
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
          Aucune notification
        </div>
        <div v-else>
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50': !notification.is_read }"
            @click="markAsRead(notification.id)"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div :class="getIconClass(notification.notification_type)" class="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="notification.notification_type.includes('appointment')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    <path v-else-if="notification.notification_type.includes('case')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <path v-else-if="notification.notification_type.includes('message')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatTimeAgo(notification.created_at) }}</p>
              </div>
              <div v-if="!notification.is_read" class="ml-2">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 border-t border-gray-200 text-center">
        <button 
          @click="markAllAsRead"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Tout marquer comme lu
        </button>
      </div>
    </div>

    <!-- Overlay pour fermer le dropdown -->
    <div 
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Notification } from '~/composables/useNotifications'

const isOpen = ref(false)
const notifications = ref<Notification[]>([])
const authStore = useAuthStore()
const { getUnreadNotifications, markAsRead: markNotificationAsRead, markAllAsRead: markAllNotificationsAsRead } = useNotifications()

// Charger les notifications au montage et toutes les 30 secondes
const loadNotifications = async () => {
  if (!authStore.user?.id) return

  try {
    const data = await getUnreadNotifications(authStore.user.id)
    notifications.value = data
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error)
  }
}

onMounted(() => {
  loadNotifications()
  // Rafraîchir toutes les 30 secondes
  setInterval(loadNotifications, 30000)
})

// Recharger quand l'utilisateur change
watch(() => authStore.user?.id, () => {
  loadNotifications()
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length
})

const getIconClass = (type: string) => {
  const classes: Record<string, string> = {
    appointment_created: 'bg-blue-500',
    appointment_updated: 'bg-blue-500',
    appointment_cancelled: 'bg-red-500',
    appointment_reminder: 'bg-yellow-500',
    case_created: 'bg-green-500',
    case_updated: 'bg-blue-500',
    message_received: 'bg-purple-500',
    document_uploaded: 'bg-indigo-500',
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }
  return classes[type] || 'bg-gray-500'
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'À l\'instant'
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`
  
  return date.toLocaleDateString('fr-FR')
}

const markAsRead = async (id: string) => {
  try {
    await markNotificationAsRead(id)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.is_read = true
    }

    // Si la notification a un lien, naviguer
    const notif = notifications.value.find(n => n.id === id)
    if (notif?.data?.appointment_id) {
      navigateTo(`/appointments/${notif.data.appointment_id}`)
      isOpen.value = false
    }
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error)
  }
}

const markAllAsRead = async () => {
  if (!authStore.user?.id) return

  try {
    await markAllNotificationsAsRead(authStore.user.id)
    notifications.value.forEach(n => n.is_read = true)
    isOpen.value = false
  } catch (error) {
    console.error('Erreur lors du marquage des notifications:', error)
  }
}
</script>