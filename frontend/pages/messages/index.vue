<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Messages
        </h1>
        <p class="text-gray-600 mt-2 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Communiquez avec vos clients et avocats
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        <!-- Liste des conversations -->
        <div class="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden flex flex-col border border-white">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Conversations
            </h2>
            <button
              @click="showNewConversationModal = true"
              class="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouveau
            </button>
          </div>

          <div v-if="loadingConversations" class="flex-1 flex items-center justify-center">
            <div class="relative">
              <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>

          <div v-else-if="conversations.length === 0" class="flex-1 flex items-center justify-center p-6">
            <div class="text-center text-gray-500">
              <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p class="text-sm font-medium">Aucune conversation</p>
              <p class="text-xs text-gray-400 mt-1">Commencez par créer une nouvelle conversation</p>
            </div>
          </div>

          <div v-else class="flex-1 overflow-y-auto">
            <div
              v-for="conv in conversations"
              :key="conv.id"
              @click="selectConversation(conv)"
              class="group p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200"
              :class="{ 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-600': selectedConversation?.id === conv.id }"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-200">
                  {{ getInitials(conv) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-bold text-gray-900 truncate flex-1 group-hover:text-blue-600 transition-colors">
                      {{ getConversationName(conv) }}
                    </p>
                    <span v-if="conv.case_info" class="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-bold flex-shrink-0 shadow-sm">
                      <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    </span>
                    <span v-if="conv.unread_count > 0" class="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full flex-shrink-0 shadow-md animate-pulse">
                      {{ conv.unread_count }}
                    </span>
                  </div>
                  <!-- Afficher le nom du participant si c'est un dossier -->
                  <p v-if="conv.case_info && conv.other_participants && conv.other_participants.length > 0" class="text-xs text-gray-500 mb-1 font-medium">
                    {{ conv.other_participants[0].first_name }} {{ conv.other_participants[0].last_name }}
                  </p>
                  <p class="text-xs text-gray-600 truncate">
                    {{ conv.last_message?.message_text || 'Nouvelle conversation' }}
                  </p>
                  <p v-if="conv.last_message?.created_at" class="text-xs text-gray-400 mt-1 font-medium">
                    {{ formatDate(conv.last_message.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Zone de messages -->
        <div class="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm flex flex-col border border-white">
          <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center">
            <div class="text-center text-gray-500">
              <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p class="text-lg font-bold text-gray-900 mb-2">Sélectionnez une conversation</p>
              <p class="text-sm text-gray-500">Choisissez une conversation pour commencer à échanger</p>
            </div>
          </div>

          <template v-else>
            <!-- Header conversation -->
            <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {{ getInitials(selectedConversation) }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">{{ getConversationName(selectedConversation) }}</h3>
                  <p class="text-xs text-gray-600 font-medium">{{ getConversationRole(selectedConversation) }}</p>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              <div v-if="loadingMessages" class="flex items-center justify-center py-8">
                <div class="relative">
                  <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                class="flex animate-fadeIn"
                :class="message.sender_id === authStore.user?.id ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[70%] rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg"
                  :class="message.sender_id === authStore.user?.id
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'"
                >
                  <p class="text-sm whitespace-pre-wrap break-words leading-relaxed">{{ message.message_text }}</p>
                  <p
                    class="text-xs mt-2 font-medium"
                    :class="message.sender_id === authStore.user?.id ? 'text-blue-100' : 'text-gray-400'"
                  >
                    {{ formatTime(message.created_at) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Input message -->
            <div class="p-4 border-t border-gray-100 bg-white">
              <form @submit.prevent="sendNewMessage" class="flex gap-3">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Tapez votre message..."
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  :disabled="sending"
                />
                <button
                  type="submit"
                  :disabled="!newMessage.trim() || sending"
                  class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200 disabled:transform-none"
                >
                  <span v-if="sending" class="flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi...
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Envoyer
                  </span>
                </button>
              </form>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Modal Nouvelle Conversation -->
    <div v-if="showNewConversationModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 transform transition-all">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle conversation
          </h3>
          <button @click="closeNewConversationModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Toggle filtre de rôle -->
          <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <span class="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {{ authStore.user?.role === 'avocat' ? 'Clients uniquement' : 'Avocats uniquement' }}
            </span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="filterByRole" type="checkbox" class="sr-only peer" checked>
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-sm"></div>
            </label>
          </div>

          <!-- Recherche d'utilisateurs -->
          <div>
            <label class="flex text-sm font-bold text-gray-700 mb-2 items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher un {{ authStore.user?.role === 'avocat' ? 'client' : 'avocat' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Nom ou email..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                @input="searchUsers"
              />
            </div>
          </div>

          <!-- Liste des résultats -->
          <div v-if="searchingUsers" class="text-center py-8">
            <div class="relative inline-block">
              <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p class="text-gray-600 mt-4 font-medium">Recherche en cours...</p>
          </div>

          <div v-else-if="searchResults.length === 0 && searchQuery" class="text-center py-8 text-gray-500">
            <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p class="font-medium">Aucun résultat trouvé</p>
          </div>

          <div v-else-if="searchResults.length > 0" class="max-h-60 overflow-y-auto space-y-2">
            <div
              v-for="user in searchResults"
              :key="user.id"
              @click="startConversationWith(user)"
              class="group p-4 border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-200">
                  {{ user.first_name?.[0] }}{{ user.last_name?.[0] }}
                </div>
                <div class="flex-1">
                  <p class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ user.first_name }} {{ user.last_name }}</p>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
                <span class="px-3 py-1 text-xs rounded-full font-bold shadow-sm"
                  :class="user.role === 'avocat' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
                  {{ user.role === 'avocat' ? 'Avocat' : 'Client' }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-500">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p class="text-sm font-medium">Recherchez pour commencer une conversation</p>
            <p class="text-xs text-gray-400 mt-1">Tapez un nom ou un email ci-dessus</p>
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

      console.log('Recherche utilisateurs:', {
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

      console.log('Réponse API:', response)

      if (response.success) {
        searchResults.value = response.data || []
        console.log('Résultats:', searchResults.value.length, 'utilisateur(s) trouvé(s)')
      }
    } catch (error: any) {
      console.error('Error searching users:', error)
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
  // Si la conversation est liée à un dossier, afficher le titre du dossier
  if (conv.case_info && conv.case_info.title) {
    return `Dossier: ${conv.case_info.title}`
  }

  // Sinon, afficher le nom du participant (conversation globale)
  if (!conv.other_participants || conv.other_participants.length === 0) return 'Conversation'
  const participant = conv.other_participants[0]
  return `${participant.first_name} ${participant.last_name}`
}

const getConversationRole = (conv: any) => {
  if (!conv.other_participants || conv.other_participants.length === 0) return ''
  const participant = conv.other_participants[0]

  // Si c'est un dossier, afficher le nom du participant
  if (conv.case_info && conv.case_info.title) {
    return `avec ${participant.first_name} ${participant.last_name}`
  }

  // Sinon, afficher le rôle (conversation globale)
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

  // Si conversationId est passé (depuis une notification), ouvrir directement la conversation
  const conversationId = route.query.conversationId as string
  if (conversationId) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      selectedConversation.value = conv
      await loadMessages(conv.id)
    }
    return
  }

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

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
