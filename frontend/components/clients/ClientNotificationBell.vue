
<script setup lang="ts">
import { ref, computed } from 'vue'

const isOpen = ref(false)

const notifications = ref([
  {
    id: 'notif-1',
    type: 'offer_accepted',
    title: 'Dossier Accepté !',
    message: 'Me Boss Boss a accepté votre demande. Vous pouvez maintenant prendre rendez-vous.',
    read: false,
    createdAt: new Date(),
    data: { lawyerId: 'lawyer-123' }
  },
  {
    id: 'notif-2',
    type: 'info',
    title: 'Bienvenue',
    message: 'Votre profil a été complété avec succès.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const getIcon = (type: string) => {
  if (type === 'offer_accepted') return ''
  return ''
}

const getIconBg = (type: string) => {
  if (type === 'offer_accepted') return 'bg-blue-600'
  return 'bg-gray-400'
}

const formatTimeAgo = (date: Date) => {
  return "À l'instant"
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  isOpen.value = false
}

const goToAppointment = (lawyerId: string) => {
  console.log("Redirection vers le calendrier de l'avocat:", lawyerId)
  isOpen.value = false
}
</script>





<template>
  <div class="relative">
    <button 
      @click="isOpen = !isOpen"
      class="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none rounded-full transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span v-if="unreadCount > 0" class="absolute top-1 right-1 flex h-4 w-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[10px] text-white items-center justify-center font-bold">
          {{ unreadCount }}
        </span>
      </span>
    </button>

    <div 
      v-if="isOpen"
      class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
    >
      <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-sm font-black text-gray-900 uppercase italic">Notifications</h3>
        <span class="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">Client</span>
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-8 text-center">
          <p class="text-gray-400 text-sm italic">Aucune nouvelle notification</p>
        </div>
        
        <div v-else class="divide-y divide-gray-50">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            :class="{ 'bg-blue-50/50': !notification.read }"
          >
            <div class="flex gap-3">
              <div class="flex-shrink-0 mt-1">
                <div :class="getIconBg(notification.type)" class="w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                  <span class="text-white text-xs">{{ getIcon(notification.type) }}</span>
                </div>
              </div>
              <div class="flex-1">
                <p class="text-xs font-black text-gray-900 uppercase mb-1">{{ notification.title }}</p>
                <p class="text-xs text-gray-600 leading-tight mb-2">{{ notification.message }}</p>
                
                <button 
                  v-if="notification.type === 'offer_accepted'"
                  @click.stop="goToAppointment(notification.data?.lawyerId)"
                  class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase rounded-lg transition shadow-md"
                >
                  Choisir un créneau
                </button>
                
                <p class="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">
                  {{ formatTimeAgo(notification.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="notifications.length > 0" class="p-3 border-t border-gray-100 text-center bg-gray-50/30">
        <button @click="markAllAsRead" class="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">
          Tout marquer comme lu
        </button>
      </div>
    </div>

    <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-40"></div>
  </div>
</template>
