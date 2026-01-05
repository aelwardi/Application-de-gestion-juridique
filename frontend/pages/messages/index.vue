<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <!-- Liste des conversations -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Conversations</h2>
            <button
              @click="showNewConversationModal = true"
              class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouveau
            </button>
          </div>

          <div v-if="loadingConversations" class="flex-1 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <div v-else-if="conversations.length === 0" class="flex-1 flex items-center justify-center p-6">
            <div class="text-center text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-sm">Aucune conversation</p>
            </div>
          </div>

          <div v-else class="flex-1 overflow-y-auto">
            <div
              v-for="conv in conversations"
              :key="conv.id"
              @click="selectConversation(conv)"
              class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              :class="{ 'bg-blue-50': selectedConversation?.id === conv.id }"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {{ getInitials(conv) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-sm font-semibold text-gray-900 truncate">
                      {{ getConversationName(conv) }}
                    </p>
                    <span v-if="conv.unread_count > 0" class="ml-2 px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">
                      {{ conv.unread_count }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-600 truncate">
                    {{ conv.last_message?.message_text || 'Nouvelle conversation' }}
                  </p>
                  <p v-if="conv.last_message?.created_at" class="text-xs text-gray-400 mt-1">
                    {{ formatDate(conv.last_message.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Zone de messages -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
          <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center">
            <div class="text-center text-gray-500">
              <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p class="text-lg font-medium">Sélectionnez une conversation</p>
              <p class="text-sm mt-2">Choisissez une conversation pour commencer à échanger</p>
            </div>
          </div>

          <template v-else>
            <!-- Header conversation -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {{ getInitials(selectedConversation) }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ getConversationName(selectedConversation) }}</h3>
                  <p class="text-xs text-gray-500">{{ getConversationRole(selectedConversation) }}</p>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
              <div v-if="loadingMessages" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                class="flex"
                :class="message.sender_id === authStore.user?.id ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[70%] rounded-lg p-3"
                  :class="message.sender_id === authStore.user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'"
                >
                  <p class="text-sm whitespace-pre-wrap break-words">{{ message.message_text }}</p>
                  <p
                    class="text-xs mt-1"
                    :class="message.sender_id === authStore.user?.id ? 'text-blue-100' : 'text-gray-500'"
                  >
                    {{ formatTime(message.created_at) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Input message -->
            <div class="p-4 border-t border-gray-200">
              <form @submit.prevent="sendNewMessage" class="flex gap-2">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Tapez votre message..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  :disabled="sending"
                />
                <button
                  type="submit"
                  :disabled="!newMessage.trim() || sending"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {{ sending ? 'Envoi...' : 'Envoyer' }}
                </button>
              </form>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Modal Nouvelle Conversation -->
    <div v-if="showNewConversationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Nouvelle conversation</h3>
          <button @click="closeNewConversationModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Toggle filtre de rôle -->
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">
              Rechercher uniquement {{ authStore.user?.role === 'avocat' ? 'les clients' : 'les avocats' }}
            </span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="filterByRole" type="checkbox" class="sr-only peer" checked>
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <!-- Recherche d'utilisateurs -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rechercher un {{ authStore.user?.role === 'avocat' ? 'client' : 'avocat' }}
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom ou email..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              @input="searchUsers"
            />
          </div>

          <!-- Liste des résultats -->
          <div v-if="searchingUsers" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>

          <div v-else-if="searchResults.length === 0 && searchQuery" class="text-center py-4 text-gray-500">
            Aucun résultat trouvé
          </div>

          <div v-else-if="searchResults.length > 0" class="max-h-60 overflow-y-auto space-y-2">
            <div
              v-for="user in searchResults"
              :key="user.id"
              @click="startConversationWith(user)"
              class="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {{ user.first_name?.[0] }}{{ user.last_name?.[0] }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ user.first_name }} {{ user.last_name }}</p>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  {{ user.role === 'avocat' ? 'Avocat' : 'Client' }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-sm">Recherchez pour commencer une conversation</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from '~/composables/useMessage'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated'
})

const route = useRoute()
const authStore = useAuthStore()
const { getConversations, getMessages, createOrGetConversation, sendMessage } = useMessage()

const conversations = ref<any[]>([])
const selectedConversation = ref<any>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const loadingConversations = ref(true)
const loadingMessages = ref(false)
const sending = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// Nouvelle conversation
const showNewConversationModal = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchingUsers = ref(false)
const filterByRole = ref(true)
let searchTimeout: NodeJS.Timeout | null = null

// Charger les conversations
const loadConversations = async () => {
  loadingConversations.value = true
  try {
    const response = await getConversations()
    if (response.success) {
      conversations.value = response.data
    }
  } catch (error) {
    console.error('Error loading conversations:', error)
  } finally {
    loadingConversations.value = false
  }
}

// Charger les messages d'une conversation
const loadMessages = async (conversationId: string) => {
  loadingMessages.value = true
  try {
    const response = await getMessages(conversationId)
    if (response.success) {
      messages.value = response.data
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    loadingMessages.value = false
  }
}

// Sélectionner une conversation
const selectConversation = (conv: any) => {
  selectedConversation.value = conv
  loadMessages(conv.id)
}

// Envoyer un message
const sendNewMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value || sending.value) return

  sending.value = true
  try {
    const response = await sendMessage(selectedConversation.value.id, newMessage.value.trim())
    if (response.success) {
      messages.value.push(response.data)
      newMessage.value = ''
      await nextTick()
      scrollToBottom()

      // Recharger les conversations pour mettre à jour last_message
      loadConversations()
    }
  } catch (error) {
    console.error('Error sending message:', error)
    alert('Erreur lors de l\'envoi du message')
  } finally {
    sending.value = false
  }
}

// Scroll to bottom
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Recherche d'utilisateurs
const searchUsers = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    searchingUsers.value = true
    try {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()

      // Déterminer le rôle à rechercher (opposé de l'utilisateur actuel)
      const roleToSearch = authStore.user?.role === 'avocat' ? 'client' : 'avocat'

      // Paramètres de recherche
      const params: any = {
        query: searchQuery.value,
        limit: 10
      }

      // Ajouter le filtre de rôle uniquement si activé
      if (filterByRole.value) {
        params.role = roleToSearch
      }

      console.log('🔍 Recherche utilisateurs:', {
        query: searchQuery.value,
        userRole: authStore.user?.role,
        filterByRole: filterByRole.value,
        searchingFor: filterByRole.value ? roleToSearch : 'tous'
      })

      const response = await $fetch<any>(`${config.public.apiBaseUrl}/users/search`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json'
        },
        params
      })

      console.log('✅ Réponse API:', response)

      if (response.success) {
        searchResults.value = response.data || []
        console.log('📋 Résultats:', searchResults.value.length, 'utilisateur(s) trouvé(s)')
      }
    } catch (error: any) {
      console.error('❌ Error searching users:', error)
      console.error('Détails erreur:', error.data || error.message)
      searchResults.value = []
    } finally {
      searchingUsers.value = false
    }
  }, 300)
}

// Démarrer une conversation avec un utilisateur
const startConversationWith = async (user: any) => {
  try {
    const response = await createOrGetConversation(user.id)
    if (response.success) {
      showNewConversationModal.value = false
      searchQuery.value = ''
      searchResults.value = []

      selectedConversation.value = response.data
      await loadMessages(response.data.id)
      await loadConversations()
    }
  } catch (error) {
    console.error('Error starting conversation:', error)
    alert('Erreur lors de la création de la conversation')
  }
}

// Fermer le modal
const closeNewConversationModal = () => {
  showNewConversationModal.value = false
  searchQuery.value = ''
  searchResults.value = []
}

// Helper functions
const getInitials = (conv: any) => {
  if (!conv.other_participants || conv.other_participants.length === 0) return '?'
  const participant = conv.other_participants[0]
  return `${participant.first_name?.[0] || ''}${participant.last_name?.[0] || ''}`.toUpperCase() || '?'
}

const getConversationName = (conv: any) => {
  if (!conv.other_participants || conv.other_participants.length === 0) return 'Conversation'
  const participant = conv.other_participants[0]
  return `${participant.first_name} ${participant.last_name}`
}

const getConversationRole = (conv: any) => {
  if (!conv.other_participants || conv.other_participants.length === 0) return ''
  const participant = conv.other_participants[0]
  const roleLabels: Record<string, string> = {
    avocat: 'Avocat',
    client: 'Client',
    admin: 'Administrateur'
  }
  return roleLabels[participant.role] || participant.role
}

const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 24) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } else if (hours < 48) {
    return 'Hier'
  } else {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Initialisation
onMounted(async () => {
  await loadConversations()

  // Si recipientId est passé en query param, créer/ouvrir la conversation
  const recipientId = route.query.recipientId as string
  const caseId = route.query.caseId as string

  if (recipientId) {
    try {
      const response = await createOrGetConversation(recipientId, caseId)
      if (response.success) {
        selectedConversation.value = response.data
        await loadMessages(response.data.id)
        // Recharger les conversations pour inclure la nouvelle
        await loadConversations()
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }
})

// Auto-refresh conversations toutes les 30 secondes
let intervalId: NodeJS.Timeout
onMounted(() => {
  intervalId = setInterval(() => {
    if (!sending.value) {
      loadConversations()
      if (selectedConversation.value) {
        loadMessages(selectedConversation.value.id)
      }
    }
  }, 30000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

// Watcher sur le toggle de filtre
watch(filterByRole, () => {
  if (searchQuery.value.trim()) {
    searchUsers()
  }
})
</script>

