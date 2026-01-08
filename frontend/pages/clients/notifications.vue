<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '~/stores/notifications'
import { useRouter } from 'vue-router'

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

const getIcon = (type: string) => {
  const icons: any = {
    case_update: '',
    message_received: '',
    document_uploaded: '',
    appointment_reminder: '',
    offer: ''
  }
  return icons[type] || ''
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
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4">
      
      <NuxtLink 
        to="/dashboard" 
        class="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 mb-4 transition-colors group"
      >
        <span class="mr-2 transition-transform group-hover:-translate-x-1">←</span>
        Retour au tableau de bord
      </NuxtLink>

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Notifications 🔔</h1>
        <button v-if="notificationStore.notifications.length > 0" @click="notificationStore.markAllAsRead" class="text-sm text-blue-600 hover:underline font-bold uppercase tracking-tighter">
          Tout marquer comme lu
        </button>
      </div>

      <div class="flex space-x-1 bg-gray-200 p-1 rounded-xl mb-6 w-fit">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeFilter = tab.id"
          :class="[
            'px-4 py-2 text-xs font-black uppercase rounded-lg transition-all',
            activeFilter === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab.label }} ({{ getCount(tab.id) }})
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="notificationStore.loading" class="p-12 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="filteredNotifications.length === 0" class="p-12 text-center text-gray-400 italic">
          Aucune notification dans cette catégorie.
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div 
            v-for="notif in filteredNotifications" 
            :key="notif.id"
            class="p-6 hover:bg-gray-50 transition relative"
            :class="{'border-l-4 border-blue-500 bg-blue-50/30': !notif.is_read}"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl shadow-inner">
                {{ getIcon(notif.type) }}
              </div>

              <div class="flex-1">
                <div class="flex justify-between items-start mb-1">
                  <div>
                    <h3 class="font-black text-gray-900 uppercase text-xs tracking-wide">{{ notif.title }}</h3>
                    <p class="text-[10px] font-bold text-blue-500 uppercase">{{ notif.category }}</p>
                  </div>
                  <span class="text-[10px] text-gray-400 font-bold uppercase">Reçu le {{ notif.time }}</span>
                </div>
                
                <p class="text-sm text-gray-600 mt-2 leading-relaxed">
                  {{ notif.message }}
                </p>

                <div class="mt-4 flex gap-2">
                  <template v-if="notif.type === 'case_update'">
                    <button
                      @click="handleNotificationClick(notif)"
                      class="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition shadow-md active:scale-95"
                    >
                      Voir le dossier
                    </button>
                  </template>
                  
                  <template v-else-if="notif.type === 'message_received'">
                    <button
                      @click="handleNotificationClick(notif)"
                      class="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                      Répondre
                    </button>
                  </template>

                  <template v-else-if="notif.type === 'document_uploaded'">
                    <button
                      @click="handleNotificationClick(notif)"
                      class="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                      Voir le document
                    </button>
                  </template>

                  <template v-else-if="notif.type === 'offer'">
                    <button
                      @click="router.push('/clients/requests')"
                      class="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition shadow-md active:scale-95"
                    >
                      Voir les demandes
                    </button>
                  </template>

                  <button 
                    v-if="!notif.is_read"
                    @click="markAsRead(notif.id)"
                    class="px-4 py-2 border border-gray-200 text-gray-500 text-[10px] font-black uppercase rounded-lg hover:bg-gray-100 transition active:scale-95"
                  >
                    Marquer lu
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

