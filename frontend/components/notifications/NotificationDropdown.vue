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
            class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': !notification.read }"
            @click="markAsRead(notification.id)"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div :class="getIconClass(notification.type)" class="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="notification.type === 'info'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path v-else-if="notification.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path v-else-if="notification.type === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatTimeAgo(notification.createdAt) }}</p>
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
import { ref, computed } from 'vue'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: Date
}

const isOpen = ref(false)

// Mock notifications - à remplacer par de vraies données
const notifications = ref<Notification[]>([
  {
    id: '1',
    type: 'info',
    title: 'Nouveau dossier',
    message: 'Un nouveau dossier vous a été assigné',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: '2',
    type: 'warning',
    title: 'Audience à venir',
    message: 'Audience prévue demain à 14h00',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: '3',
    type: 'success',
    title: 'Dossier clôturé',
    message: 'Le dossier CASE-123 a été clôturé avec succès',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
])

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const getIconClass = (type: string) => {
  const classes: Record<string, string> = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }
  return classes[type] || 'bg-gray-500'
}

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'À l\'instant'
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`
  
  return date.toLocaleDateString('fr-FR')
}

const markAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  isOpen.value = false
}
</script>
