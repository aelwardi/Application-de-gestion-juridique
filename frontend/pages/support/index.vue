
<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSupport } from '~/composables/useSupport'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated'
})

const router = useRouter()
const { createTicket, getMyTickets, addTicketMessage } = useSupport()
const authStore = useAuthStore()
const toast = useToast()

const showCreateModal = ref(false)
const submitting = ref(false)
const loadingTickets = ref(false)
const sendingMessage = ref(false)

const tickets = ref<any[]>([])
const selectedTicket = ref<any>(null)
const searchQuery = ref('')
const statusFilter = ref('all')
const messageText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const form = ref({
  subject: '',
  description: '',
  priority: 'medium',
  category: ''
})

const priorities = [
  { value: 'low', label: 'Basse', activeClass: 'border-gray-400 bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Moyenne', activeClass: 'border-blue-400 bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Haute', activeClass: 'border-orange-400 bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', activeClass: 'border-red-400 bg-red-100 text-red-800' }
]

const filteredTickets = computed(() => {
  return tickets.value.filter(ticket => {
    const matchesSearch =
        ticket.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
        statusFilter.value === 'all' ||
        ticket.status.toLowerCase() === statusFilter.value.toLowerCase()

    return matchesSearch && matchesStatus
  })
})

const loadTickets = async () => {
  loadingTickets.value = true
  try {
    const response = await getMyTickets()
    if (response.success) {
      tickets.value = response.data || []

      if (!selectedTicket.value && tickets.value.length > 0) {
        selectedTicket.value = tickets.value[0]
      }
    }
  } catch (error) {
    console.error('Error loading tickets:', error)
    toast.error('Erreur lors du chargement des tickets')
  } finally {
    loadingTickets.value = false
  }
}

const selectTicket = (ticket: any) => {
  selectedTicket.value = ticket
  nextTick(() => {
    scrollToBottom()
  })
}

const submitTicket = async () => {
  submitting.value = true
  try {
    const response = await createTicket(form.value)
    if (response.success) {
      showCreateModal.value = false
      resetForm()
      await loadTickets()

      const newTicket = tickets.value.find(t => t.id === response.data.id)
      if (newTicket) {
        selectedTicket.value = newTicket
      }
      toast.success('Ticket créé avec succès')
    }
  } catch (error) {
    console.error('Error creating ticket:', error)
    toast.error('Erreur lors de la création du ticket')
  } finally {
    submitting.value = false
  }
}

const sendMessage = async () => {
  if (!messageText.value.trim() || !selectedTicket.value) return

  sendingMessage.value = true
  try {
    await addTicketMessage(selectedTicket.value.id, messageText.value)
    messageText.value = ''

    await loadTickets()

    const updatedTicket = tickets.value.find(t => t.id === selectedTicket.value.id)
    if (updatedTicket) {
      selectedTicket.value = updatedTicket
    }

    nextTick(() => {
      scrollToBottom()
    })
    toast.success('Message envoyé avec succès')
  } catch (error) {
    console.error('Error sending message:', error)
    toast.error('Erreur lors de l\'envoi du message')
  } finally {
    sendingMessage.value = false
  }
}

const resetForm = () => {
  form.value = {
    subject: '',
    description: '',
    priority: 'medium',
    category: ''
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const canSendMessage = (ticket: any) => {
  return ticket && ticket.status !== 'closed'
}

const getUserInitials = () => {
  if (!authStore.user) return '?'
  const first = authStore.user.firstName?.charAt(0) || ''
  const last = authStore.user.lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }
  return classes[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Résolu',
    closed: 'Fermé'
  }
  return labels[status?.toLowerCase()] || status
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    technical: 'Technique',
    account: 'Compte',
    payment: 'Paiement',
    feature: 'Fonctionnalité',
    bug: 'Bug',
    other: 'Autre'
  }
  return labels[category] || category
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadTickets()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex flex-col">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-sm border-b border-white/20 px-4 py-4 shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-2 hover:bg-purple-50 rounded-lg transition-all text-gray-600 hover:text-purple-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Support</h1>
          </div>
        </div>
        <button
            @click="showCreateModal = true"
            class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold transform hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Nouveau Ticket</span>
        </button>
      </div>
    </div>

    <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div class="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 flex flex-col overflow-hidden">
          <div class="p-4 border-b border-gray-100 space-y-3 flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Rechercher..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                  v-model="statusFilter"
                  class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous</option>
                <option value="open">Ouverts</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolus</option>
                <option value="closed">Fermés</option>
              </select>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div v-if="loadingTickets" class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>

            <div v-else-if="filteredTickets.length === 0" class="text-center py-12 px-4">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-sm text-gray-600">Aucun ticket trouvé</p>
            </div>

            <div v-else class="divide-y divide-gray-200">
              <button
                  v-for="ticket in filteredTickets"
                  :key="ticket.id"
                  @click="selectTicket(ticket)"
                  :class="[
                  'w-full text-left p-4 hover:bg-gray-50 transition-colors',
                  selectedTicket?.id === ticket.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                ]"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="font-medium text-gray-900 text-sm line-clamp-1">
                    {{ ticket.subject }}
                  </h3>
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', getStatusClass(ticket.status)]">
                    {{ getStatusLabel(ticket.status) }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 line-clamp-2 mb-2">{{ ticket.description }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(ticket.created_at) }}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div v-if="selectedTicket" class="flex flex-col h-full">
            <div class="p-4 border-b border-gray-200 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">{{ selectedTicket.subject }}</h2>
                  <div class="flex items-center gap-3 mt-1">
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(selectedTicket.status)]">
                      {{ getStatusLabel(selectedTicket.status) }}
                    </span>
                    <span v-if="selectedTicket.category" class="text-xs text-gray-500">
                      {{ getCategoryLabel(selectedTicket.category) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {{ getUserInitials() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-gray-900 text-sm">Vous</span>
                      <span class="text-xs text-gray-500">
                        {{ formatDateTime(selectedTicket.created_at) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedTicket.description }}</p>
                  </div>
                </div>
              </div>

              <div
                  v-for="message in selectedTicket.messages || []"
                  :key="message.id"
                  :class="['flex items-start gap-3', message.is_admin ? '' : 'flex-row-reverse']"
              >
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0', message.is_admin ? 'bg-green-600' : 'bg-purple-600']">
                  {{ message.is_admin ? 'S' : getUserInitials() }}
                </div>
                <div :class="['flex-1 min-w-0', message.is_admin ? '' : 'text-right']">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-900 text-sm">
                      {{ message.is_admin ? 'Support' : 'Vous' }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatDateTime(message.created_at) }}
                    </span>
                  </div>
                  <div :class="['inline-block px-4 py-2 rounded-lg', message.is_admin ? 'bg-gray-100 text-gray-900' : 'bg-purple-600 text-white']">
                    <p class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="canSendMessage(selectedTicket)" class="p-4 border-t border-gray-200 flex-shrink-0">
              <form @submit.prevent="sendMessage" class="flex gap-2">
                <input
                    v-model="messageText"
                    type="text"
                    placeholder="Écrire un message..."
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    :disabled="sendingMessage"
                />
                <button
                    type="submit"
                    :disabled="sendingMessage || !messageText.trim()"
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
            <div v-else class="p-4 border-t border-gray-200 bg-gray-50 text-center flex-shrink-0">
              <p class="text-sm text-gray-600">Ce ticket est fermé</p>
            </div>
          </div>

          <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-gray-600">Sélectionnez un ticket pour voir la conversation</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">Créer un ticket</h2>
          <button @click="showCreateModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitTicket" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
            <select
                v-model="form.category"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Sélectionner...</option>
              <option value="technical">Problème technique</option>
              <option value="account">Compte & Profil</option>
              <option value="payment">Paiement</option>
              <option value="feature">Fonctionnalité</option>
              <option value="bug">Bug</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priorité *</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                  v-for="priority in priorities"
                  :key="priority.value"
                  type="button"
                  @click="form.priority = priority.value"
                  :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                  form.priority === priority.value
                    ? priority.activeClass
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ priority.label }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sujet *</label>
            <input
                v-model="form.subject"
                type="text"
                required
                placeholder="Ex: Impossible d'accéder à mes documents"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
                v-model="form.description"
                required
                rows="6"
                placeholder="Décrivez votre problème en détail..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button
                type="submit"
                :disabled="submitting"
                class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ submitting ? 'Envoi...' : 'Créer le ticket' }}
            </button>
            <button
                type="button"
                @click="showCreateModal = false"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
