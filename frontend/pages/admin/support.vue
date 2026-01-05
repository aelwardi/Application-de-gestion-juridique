<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Tickets Support</h1>
        <p class="text-gray-600 mt-2">Gérez tous les tickets de support des utilisateurs</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm text-gray-600">Total</div>
          <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
        </div>
        <div class="bg-blue-50 rounded-lg shadow p-6">
          <div class="text-sm text-blue-600">Ouverts</div>
          <div class="text-2xl font-bold text-blue-900">{{ stats.open }}</div>
        </div>
        <div class="bg-yellow-50 rounded-lg shadow p-6">
          <div class="text-sm text-yellow-600">En cours</div>
          <div class="text-2xl font-bold text-yellow-900">{{ stats.in_progress }}</div>
        </div>
        <div class="bg-green-50 rounded-lg shadow p-6">
          <div class="text-sm text-green-600">Résolus</div>
          <div class="text-2xl font-bold text-green-900">{{ stats.resolved }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tous les statuts</option>
            <option value="open">Ouverts</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolus</option>
            <option value="closed">Fermés</option>
          </select>
          <select
            v-model="priorityFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
          <button
            @click="loadTickets"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Rafraîchir
          </button>
        </div>
      </div>

      <!-- Tickets List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ ticket.subject }}</div>
                <div class="text-sm text-gray-500">{{ ticket.category }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ ticket.user_name }}</div>
                <div class="text-sm text-gray-500">{{ ticket.user_email }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(ticket.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="getPriorityClass(ticket.priority)" class="px-2 py-1 text-xs rounded-full">
                  {{ getPriorityLabel(ticket.priority) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(ticket.created_at) }}
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="openTicket(ticket)"
                  class="text-purple-600 hover:text-purple-900 font-medium"
                >
                  Répondre
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Ticket Modal -->
    <div v-if="selectedTicket" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ selectedTicket.subject }}</h2>
            <p class="text-sm text-gray-600 mt-1">Par {{ selectedTicket.user_name }}</p>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <!-- Initial message -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-2">Message initial</div>
            <p class="text-gray-900">{{ selectedTicket.description }}</p>
            <div class="text-xs text-gray-500 mt-2">{{ formatDateTime(selectedTicket.created_at) }}</div>
          </div>

          <!-- Messages -->
          <div
            v-for="message in selectedTicket.messages || []"
            :key="message.id"
            :class="['rounded-lg p-4', message.is_admin ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200']"
          >
            <div class="flex items-center gap-2 mb-2">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold', message.is_admin ? 'bg-green-600' : 'bg-purple-600']">
                {{ message.is_admin ? 'A' : 'U' }}
              </div>
              <div>
                <div class="text-sm font-medium">{{ message.is_admin ? 'Admin' : selectedTicket.user_name }}</div>
                <div class="text-xs text-gray-500">{{ formatDateTime(message.created_at) }}</div>
              </div>
            </div>
            <p class="text-gray-900">{{ message.message }}</p>
          </div>
        </div>

        <!-- Input -->
        <div class="p-6 border-t border-gray-200">
          <form @submit.prevent="sendResponse" class="space-y-4">
            <textarea
              v-model="responseText"
              rows="4"
              placeholder="Votre réponse..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            ></textarea>
            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="sending"
                class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {{ sending ? 'Envoi...' : 'Envoyer la réponse' }}
              </button>
              <select
                v-model="newStatus"
                class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'authenticated'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

const tickets = ref<any[]>([])
const selectedTicket = ref<any>(null)
const loading = ref(false)
const sending = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const responseText = ref('')
const newStatus = ref('in_progress')

const stats = computed(() => {
  return {
    total: tickets.value.length,
    open: tickets.value.filter(t => t.status === 'open').length,
    in_progress: tickets.value.filter(t => t.status === 'in_progress').length,
    resolved: tickets.value.filter(t => t.status === 'resolved').length
  }
})

const filteredTickets = computed(() => {
  return tickets.value.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ticket.user_name?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = !statusFilter.value || ticket.status === statusFilter.value
    const matchesPriority = !priorityFilter.value || ticket.priority === priorityFilter.value

    return matchesSearch && matchesStatus && matchesPriority
  })
})

const loadTickets = async () => {
  loading.value = true
  try {
    const response = await $fetch<any>(`${config.public.apiBaseUrl}/support/tickets`, {
      headers: authStore.getAuthHeaders()
    })

    if (response.success) {
      tickets.value = response.data.tickets || response.data || []
    }
  } catch (error) {
    console.error('Error loading tickets:', error)
  } finally {
    loading.value = false
  }
}

const openTicket = async (ticket: any) => {
  try {
    const response = await $fetch<any>(`${config.public.apiBaseUrl}/support/tickets/${ticket.id}`, {
      headers: authStore.getAuthHeaders()
    })

    if (response.success) {
      selectedTicket.value = response.data.ticket || response.data
      newStatus.value = selectedTicket.value.status
    }
  } catch (error) {
    console.error('Error loading ticket details:', error)
  }
}

const sendResponse = async () => {
  if (!responseText.value.trim() || !selectedTicket.value) return

  sending.value = true
  try {
    // Envoyer le message
    await $fetch(`${config.public.apiBaseUrl}/support/tickets/${selectedTicket.value.id}/messages`, {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: { message: responseText.value }
    })

    // Mettre à jour le statut si changé
    if (newStatus.value !== selectedTicket.value.status) {
      await $fetch(`${config.public.apiBaseUrl}/support/tickets/${selectedTicket.value.id}/status`, {
        method: 'PATCH',
        headers: authStore.getAuthHeaders(),
        body: { status: newStatus.value }
      })
    }

    responseText.value = ''
    await loadTickets()
    await openTicket(selectedTicket.value)
  } catch (error) {
    console.error('Error sending response:', error)
    alert('Erreur lors de l\'envoi de la réponse')
  } finally {
    sending.value = false
  }
}

const closeModal = () => {
  selectedTicket.value = null
  responseText.value = ''
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Résolu',
    closed: 'Fermé'
  }
  return labels[status] || status
}

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  }
  return classes[priority] || 'bg-gray-100 text-gray-700'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente'
  }
  return labels[priority] || priority
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
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

