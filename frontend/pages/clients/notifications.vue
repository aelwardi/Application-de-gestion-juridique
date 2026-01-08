<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '~/stores/notifications'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: ['auth'],
  layout: 'authenticated',
})

const notificationStore = useNotificationStore()
const router = useRouter()
const toast = useToast()

const activeFilter = ref('toutes')
const tabs = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'case_update', label: 'Dossiers' },
  { id: 'message_received', label: 'Messages' },
  { id: 'document_uploaded', label: 'Documents' }
]

const filteredNotifications = computed(() => {
  const all = notificationStore.notifications
  if (activeFilter.value === 'toutes') return all
  return all.filter(n => n.type === activeFilter.value)
})

const getCount = (tabId: string) => {
  if (tabId === 'toutes') return notificationStore.notifications.length
  return notificationStore.notifications.filter(n => n.type === tabId).length
}

const getIconClasses = (type: string) => {
  const classes: Record<string, string> = {
    case_update: 'bg-gradient-to-br from-blue-500 to-blue-600',
    message_received: 'bg-gradient-to-br from-green-500 to-green-600',
    document_uploaded: 'bg-gradient-to-br from-purple-500 to-purple-600',
    appointment_reminder: 'bg-gradient-to-br from-orange-500 to-orange-600',
    offer: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
  }
  return classes[type] || 'bg-gradient-to-br from-gray-500 to-gray-600'
}

const getCategoryLabel = (type: string) => {
  const labels: Record<string, string> = {
    case_update: 'Mise à jour de dossier',
    message_received: 'Nouveau message',
    document_uploaded: 'Document ajouté',
    appointment_reminder: 'Rappel de rendez-vous',
    offer: 'Nouvelle proposition'
  }
  return labels[type] || 'Notification'
}

const handleNotificationClick = async (notif: any) => {
  await notificationStore.markAsRead(notif.id)

  const data = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data

  if (notif.type === 'message_received') {
    if (data && data.conversation_id) {
      router.push(`/messages?conversationId=${data.conversation_id}`)
    } else {
      router.push('/messages')
    }
  } else if (notif.type === 'case_update') {
    if (data && data.case_id) {
      router.push(`/cases/${data.case_id}`)
    } else {
      router.push('/cases')
    }
  } else if (notif.type === 'document_uploaded') {
    if (data && data.case_id) {
      router.push(`/cases/${data.case_id}`)
    }
  }
}

const markAsRead = async (id: string) => {
  try {
    await notificationStore.markAsRead(id)
    toast.success('Notification marquée comme lue')
  } catch (error) {
    console.error('Error marking notification as read:', error)
    toast.error('Erreur lors du marquage de la notification')
  }
}

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    toast.success('Toutes les notifications ont été marquées comme lues')
  } catch (error) {
    console.error('Error marking all as read:', error)
    toast.error('Erreur lors du marquage des notifications')
  }
}

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="mb-8">
        <NuxtLink 
          to="/dashboard" 
          class="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 mb-4 transition-all group"
        >
          <svg class="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au tableau de bord
        </NuxtLink>

        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Notifications
              </h1>
              <p class="text-gray-600 mt-2 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Centre de notifications
              </p>
            </div>
            <button 
              v-if="notificationStore.notifications.length > 0" 
              @click="markAllAsRead" 
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-semibold"
            >
              Tout marquer comme lu
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-2 mb-6 inline-flex gap-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeFilter = tab.id"
          :class="[
            'px-5 py-2.5 text-sm font-semibold rounded-lg transition-all',
            activeFilter === tab.id 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ tab.label }} <span class="ml-1 opacity-75">({{ getCount(tab.id) }})</span>
        </button>
      </div>

      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div v-if="notificationStore.loading" class="p-16 text-center">
          <div class="relative inline-flex">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-600 absolute top-0"></div>
          </div>
        </div>

        <div v-else-if="filteredNotifications.length === 0" class="p-16 text-center">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p class="text-gray-500 text-lg">Aucune notification dans cette catégorie</p>
          <p class="text-gray-400 text-sm mt-2">Vos notifications apparaîtront ici</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div 
            v-for="notif in filteredNotifications" 
            :key="notif.id"
            class="p-6 hover:bg-blue-50/30 transition-all relative group"
            :class="{'border-l-4 border-blue-500 bg-blue-50/20': !notif.is_read}"
          >
            <div class="flex items-start gap-5">
              <div class="flex-shrink-0">
                <div :class="getIconClasses(notif.type)" class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="notif.type === 'case_update'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <path v-else-if="notif.type === 'message_received'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    <path v-else-if="notif.type === 'document_uploaded'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    <path v-else-if="notif.type === 'appointment_reminder'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>

              <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="font-bold text-gray-900 text-base">{{ notif.title }}</h3>
                    <p class="text-xs text-blue-600 font-semibold mt-0.5">{{ getCategoryLabel(notif.type) }}</p>
                  </div>
                  <span class="text-xs text-gray-500 font-medium">{{ notif.time }}</span>
                </div>
                
                <p class="text-sm text-gray-600 leading-relaxed mb-4">
                  {{ notif.message }}
                </p>

                <div class="flex gap-2 flex-wrap">
                  <template v-if="notif.type === 'case_update'">
                    <button
                      @click="handleNotificationClick(notif)"
                      class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Voir le dossier
                    </button>
                  </template>
                  
                  <template v-else-if="notif.type === 'message_received'">
                    <button
                      @click="handleNotificationClick(notif)"
                      class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Répondre
                    </button>
                  </template>

                  <template v-else-if="notif.type === 'document_uploaded'">
                    <button
                      @click="handleNotificationClick(notif)"
                      class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Voir le document
                    </button>
                  </template>

                  <template v-else-if="notif.type === 'offer'">
                    <button
                      @click="router.push('/clients/requests')"
                      class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Voir les demandes
                    </button>
                  </template>

                  <button 
                    v-if="!notif.is_read"
                    @click="markAsRead(notif.id)"
                    class="px-4 py-2 border-2 border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Marquer comme lu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>