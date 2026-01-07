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

const showNewConversationModal = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchingUsers = ref(false)
const filterByRole = ref(true)
const conversationType = ref<'general' | 'case'>('general')
const selectedCaseId = ref<string>('')
const userCases = ref<any[]>([])
let searchTimeout: NodeJS.Timeout | null = null

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

const loadUserCases = async () => {
  try {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    const filters: any = {}
    if (authStore.user?.role === 'avocat') {
      filters.lawyer_id = authStore.user.id
    } else if (authStore.user?.role === 'client') {
      filters.client_id = authStore.user.id
    }

    const response = await $fetch<any>(`${config.public.apiBaseUrl}/cases`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      params: filters
    })

    if (response.success) {
      userCases.value = response.data || []
    }
  } catch (error) {
    console.error('Error loading cases:', error)
    userCases.value = []
  }
}

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

const selectConversation = (conv: any) => {
  selectedConversation.value = conv
  loadMessages(conv.id)
}

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

      loadConversations()
    }
  } catch (error) {
    console.error('Error sending message:', error)
    alert('Erreur lors de l\'envoi du message')
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

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

      const roleToSearch = authStore.user?.role === 'avocat' ? 'client' : 'avocat'

      const params: any = {
        query: searchQuery.value,
        limit: 10
      }

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

const startConversationWith = async (user: any) => {
  try {
    const caseId = conversationType.value === 'case' ? selectedCaseId.value : undefined

    const response = await createOrGetConversation(user.id, caseId)
    if (response.success) {
      showNewConversationModal.value = false
      searchQuery.value = ''
      searchResults.value = []
      conversationType.value = 'general'
      selectedCaseId.value = ''

      selectedConversation.value = response.data
      await loadMessages(response.data.id)
      await loadConversations()
    }
  } catch (error) {
    console.error('Error starting conversation:', error)
    alert('Erreur lors de la création de la conversation')
  }
}

const closeNewConversationModal = () => {
  showNewConversationModal.value = false
  searchQuery.value = ''
  searchResults.value = []
  conversationType.value = 'general'
  selectedCaseId.value = ''
}

const getInitials = (conv: any) => {
  if (!conv.other_participant) return '?'
  const participant = conv.other_participant
  return `${participant.first_name?.[0] || ''}${participant.last_name?.[0] || ''}`.toUpperCase() || '?'
}

const getConversationName = (conv: any) => {
  if (conv.case_info && conv.case_info.title) {
    return `${conv.case_info.case_number} - ${conv.case_info.title}`
  }

  if (!conv.other_participant) return 'Conversation'
  const participant = conv.other_participant
  return `${participant.first_name} ${participant.last_name}`
}

const getConversationRole = (conv: any) => {
  if (!conv.other_participant) return ''
  const participant = conv.other_participant

  if (conv.case_info && conv.case_info.title) {
    return `avec ${participant.first_name} ${participant.last_name}`
  }

  const roleLabels: Record<string, string> = {
    lawyer: 'Avocat',
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

onMounted(async () => {
  await loadConversations()
  await loadUserCases()

  const conversationId = route.query.conversationId as string
  if (conversationId) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      selectedConversation.value = conv
      await loadMessages(conv.id)
    }
    return
  }

  const recipientId = route.query.recipientId as string
  const caseId = route.query.caseId as string

  if (recipientId) {
    try {
      const response = await createOrGetConversation(recipientId, caseId)
      if (response.success) {
        selectedConversation.value = response.data
        await loadMessages(response.data.id)
        await loadConversations()
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }
})

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

watch(filterByRole, () => {
  if (searchQuery.value.trim()) {
    searchUsers()
  }
})
</script>




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
                    <!-- Badge pour conversation liée à un dossier -->
                    <span v-if="conv.case_info" class="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-bold flex-shrink-0 shadow-sm flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      Dossier
                    </span>
                    <span v-else class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-bold flex-shrink-0 shadow-sm flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Général
                    </span>
                    <span v-if="conv.unread_count > 0" class="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full flex-shrink-0 shadow-md animate-pulse">
                      {{ conv.unread_count }}
                    </span>
                  </div>
                  <p v-if="conv.other_participant" class="text-xs text-gray-500 mb-1 font-medium">
                    {{ conv.other_participant.first_name }} {{ conv.other_participant.last_name }}
                    <span v-if="conv.other_participant.role" class="text-gray-400 capitalize">
                      • {{ conv.other_participant.role === 'lawyer' ? 'Avocat' : 'Client' }}
                    </span>
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
            <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {{ getInitials(selectedConversation) }}
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900 text-lg">{{ getConversationName(selectedConversation) }}</h3>
                  <p class="text-xs text-gray-600 font-medium">{{ getConversationRole(selectedConversation) }}</p>
                </div>
                <!-- Badge type de conversation -->
                <span v-if="selectedConversation.case_info" class="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-bold shadow-sm flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  Dossier
                </span>
                <span v-else class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-bold shadow-sm flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Général
                </span>
              </div>
            </div>

            <div v-if="selectedConversation.case_info" class="bg-gradient-to-r from-purple-50 via-purple-100 to-indigo-50 border-l-4 border-purple-500 p-4">
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-bold text-purple-900">{{ selectedConversation.case_info.title }}</h4>
                    <span class="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-200 text-purple-800">
                      {{ selectedConversation.case_info.case_number }}
                    </span>
                  </div>
                  <p class="text-sm text-purple-700">Cette conversation est liée à ce dossier</p>
                </div>
                <NuxtLink
                    :to="`/cases/${selectedConversation.case_info.id}`"
                    class="px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm border border-purple-200"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Voir le dossier
                </NuxtLink>
              </div>
            </div>

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
                class="border-2 border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-200"
            >
              <div class="p-4 flex items-center gap-3">
                <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {{ user.first_name?.[0] }}{{ user.last_name?.[0] }}
                </div>
                <div class="flex-1">
                  <p class="font-bold text-gray-900">{{ user.first_name }} {{ user.last_name }}</p>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
                <span class="px-3 py-1 text-xs rounded-full font-bold shadow-sm"
                      :class="user.role === 'avocat' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
                  {{ user.role === 'avocat' ? 'Avocat' : 'Client' }}
                </span>
              </div>

              <div class="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-2 block">Type de conversation</label>
                  <div class="flex gap-2">
                    <button
                        @click="conversationType = 'general'"
                        :class="conversationType === 'general'
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
                        class="flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Général
                    </button>
                    <button
                        @click="conversationType = 'case'"
                        :class="conversationType === 'case'
                        ? 'bg-purple-100 text-purple-700 border-purple-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
                        class="flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      Dossier
                    </button>
                  </div>
                </div>

                <div v-if="conversationType === 'case'">
                  <label class="text-sm font-semibold text-gray-700 mb-2 block">Choisir un dossier</label>
                  <select
                      v-model="selectedCaseId"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Sélectionner un dossier...</option>
                    <option v-for="caseItem in userCases" :key="caseItem.id" :value="caseItem.id">
                      {{ caseItem.case_number }} - {{ caseItem.title }}
                    </option>
                  </select>
                </div>

                <button
                    @click="startConversationWith(user)"
                    :disabled="conversationType === 'case' && !selectedCaseId"
                    class="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Démarrer la conversation
                </button>
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
