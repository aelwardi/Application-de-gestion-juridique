<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-6">
        <button
          @click="router.back()"
          class="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-600">
          <h1 class="text-2xl font-bold text-white flex items-center gap-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Contacter le Support
          </h1>
          <p class="text-blue-100 mt-1">Créer un ticket pour obtenir de l'aide</p>
        </div>

        <!-- Tabs -->
        <div class="flex border-b">
          <button
            @click="activeTab = 'new'"
            :class="[
              'flex-1 px-6 py-3 text-sm font-medium transition',
              activeTab === 'new'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            ]"
          >
            📝 Nouveau Ticket
          </button>
          <button
            @click="activeTab = 'my-tickets'"
            :class="[
              'flex-1 px-6 py-3 text-sm font-medium transition',
              activeTab === 'my-tickets'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            ]"
          >
            📋 Mes Tickets
            <span v-if="tickets.length > 0" class="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {{ tickets.length }}
            </span>
          </button>
        </div>

        <!-- Nouveau Ticket -->
        <div v-if="activeTab === 'new'" class="p-6">
          <form @submit.prevent="submitTicket" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Catégorie <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.category"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="technical">🔧 Problème technique</option>
                <option value="account">👤 Compte & Profil</option>
                <option value="payment">💳 Paiement & Facturation</option>
                <option value="feature">✨ Demande de fonctionnalité</option>
                <option value="bug">🐛 Rapport de bug</option>
                <option value="other">❓ Autre</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Priorité <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-4 gap-3">
                <button
                  v-for="priority in priorities"
                  :key="priority.value"
                  type="button"
                  @click="form.priority = priority.value"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition',
                    form.priority === priority.value
                      ? priority.activeClass
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ priority.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sujet <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.subject"
                type="text"
                required
                placeholder="Ex: Impossible d'accéder à mes documents"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.description"
                required
                rows="6"
                placeholder="Décrivez votre problème en détail..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Plus vous donnez de détails, plus nous pourrons vous aider rapidement
              </p>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                :disabled="submitting"
                class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
              >
                <span v-if="submitting" class="animate-spin">⏳</span>
                {{ submitting ? 'Envoi en cours...' : 'Envoyer le ticket' }}
              </button>
              <button
                type="button"
                @click="resetForm"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>

        <!-- Mes Tickets -->
        <div v-else class="p-6">
          <div v-if="loadingTickets" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-gray-500 mt-4">Chargement...</p>
          </div>

          <div v-else-if="tickets.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-gray-500 font-medium">Aucun ticket pour le moment</p>
            <p class="text-sm text-gray-400 mt-1">Créez votre premier ticket pour obtenir de l'aide</p>
            <button
              @click="activeTab = 'new'"
              class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Créer un ticket
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="ticket in tickets"
              :key="ticket.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
              @click="viewTicket(ticket.id)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-semibold text-gray-900">{{ ticket.subject }}</h3>
                    <span
                      :class="getStatusClass(ticket.status)"
                      class="px-2 py-1 text-xs rounded-full font-medium"
                    >
                      {{ getStatusLabel(ticket.status) }}
                    </span>
                    <span
                      :class="getPriorityClass(ticket.priority)"
                      class="px-2 py-1 text-xs rounded-full font-medium"
                    >
                      {{ getPriorityLabel(ticket.priority) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 line-clamp-2">{{ ticket.description }}</p>
                  <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>📅 {{ formatDate(ticket.created_at) }}</span>
                    <span v-if="ticket.category">📂 {{ getCategoryLabel(ticket.category) }}</span>
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupport } from '~/composables/useSupport'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated'
})

const router = useRouter()
const { createTicket, getMyTickets } = useSupport()

const activeTab = ref('new')
const submitting = ref(false)
const loadingTickets = ref(false)
const tickets = ref<any[]>([])

const form = ref({
  subject: '',
  description: '',
  priority: 'medium',
  category: ''
})

const priorities = [
  { value: 'low', label: '⬇️ Basse', activeClass: 'bg-gray-200 text-gray-800' },
  { value: 'medium', label: '➡️ Moyenne', activeClass: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: '⬆️ Haute', activeClass: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: '🔥 Urgente', activeClass: 'bg-red-100 text-red-800' }
]

const submitTicket = async () => {
  submitting.value = true
  try {
    const response = await createTicket(form.value)
    if (response.success) {
      alert('✅ Votre ticket a été créé avec succès ! Notre équipe vous répondra rapidement.')
      resetForm()
      activeTab.value = 'my-tickets'
      await loadTickets()
    }
  } catch (error) {
    alert('❌ Erreur lors de la création du ticket. Veuillez réessayer.')
  } finally {
    submitting.value = false
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

const loadTickets = async () => {
  loadingTickets.value = true
  try {
    const response = await getMyTickets()
    if (response.success) {
      tickets.value = response.data || []
    }
  } catch (error) {
    console.error('Error loading tickets:', error)
  } finally {
    loadingTickets.value = false
  }
}

const viewTicket = (ticketId: string) => {
  router.push(`/support/tickets/${ticketId}`)
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
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  loadTickets()
})
</script>

