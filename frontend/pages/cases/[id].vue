<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement...</p>
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <p class="text-red-800">{{ error }}</p>
        </div>

        <div v-else-if="caseData">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ caseData.title }}</h1>
              <p class="text-gray-600 mt-2">{{ caseData.case_number }}</p>
            </div>
            <div class="flex gap-3">
              <span :class="getStatusClass(caseData.status)" class="px-4 py-2 text-sm font-semibold rounded-full">
                {{ getStatusLabel(caseData.status) }}
              </span>
              <span :class="getPriorityClass(caseData.priority)" class="px-4 py-2 text-sm font-semibold rounded-full">
                {{ getPriorityLabel(caseData.priority) }}
              </span>
            </div>
          </div>

          <!-- Case Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Type de dossier</h3>
              <p class="text-lg font-semibold text-gray-900">{{ caseData.case_type }}</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Date d'ouverture</h3>
              <p class="text-lg font-semibold text-gray-900">
                {{ formatDate(caseData.opening_date) }}
              </p>
            </div>
          </div>

          <!-- Client Information -->
          <div class="bg-white rounded-lg shadow p-6 mt-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Informations du client</h2>
              <NuxtLink 
                :to="`/messages?clientId=${caseData.client_id}`"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contacter le client
              </NuxtLink>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500 mb-1">Nom complet</p>
                <p class="text-lg font-medium text-gray-900">
                  {{ caseData.client_first_name }} {{ caseData.client_last_name }}
                </p>
              </div>
              <div v-if="caseData.client_email">
                <p class="text-sm text-gray-500 mb-1">Email</p>
                <a 
                  :href="`mailto:${caseData.client_email}`"
                  class="text-lg text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {{ caseData.client_email }}
                </a>
              </div>
              <div v-if="caseData.client_phone">
                <p class="text-sm text-gray-500 mb-1">Téléphone</p>
                <a 
                  :href="`tel:${caseData.client_phone}`"
                  class="text-lg text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {{ caseData.client_phone }}
                </a>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-lg shadow p-6 mt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p class="text-gray-700 whitespace-pre-wrap">{{ caseData.description || 'Aucune description disponible' }}</p>
          </div>

          <!-- Additional Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Informations juridiques</h2>
              <div class="space-y-3">
                <div v-if="caseData.court_name">
                  <p class="text-sm text-gray-500">Tribunal</p>
                  <p class="text-gray-900">{{ caseData.court_name }}</p>
                </div>
                <div v-if="caseData.judge_name">
                  <p class="text-sm text-gray-500">Juge</p>
                  <p class="text-gray-900">{{ caseData.judge_name }}</p>
                </div>
                <div v-if="caseData.next_hearing_date">
                  <p class="text-sm text-gray-500">Prochaine audience</p>
                  <p class="text-gray-900">{{ formatDate(caseData.next_hearing_date) }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Dates importantes</h2>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Date de création</p>
                  <p class="text-gray-900">{{ formatDate(caseData.created_at) }}</p>
                </div>
                <div v-if="caseData.closing_date">
                  <p class="text-sm text-gray-500">Date de clôture</p>
                  <p class="text-gray-900">{{ formatDate(caseData.closing_date) }}</p>
                </div>
                <div v-if="caseData.estimated_duration_months">
                  <p class="text-sm text-gray-500">Durée estimée</p>
                  <p class="text-gray-900">{{ caseData.estimated_duration_months }} mois</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CaseWithDetails } from '~/types/case'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated'
})

const route = useRoute()
const { getCaseById } = useCase()

const caseData = ref<CaseWithDetails | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const loadCase = async () => {
  loading.value = true
  error.value = null
  
  try {
    const caseId = route.params.id as string
    const response = await getCaseById(caseId)
    
    if (response.success && response.data) {
      caseData.value = response.data
    } else {
      error.value = 'Dossier non trouvé'
    }
  } catch (err: any) {
    console.error('Error loading case:', err)
    error.value = 'Erreur lors du chargement du dossier'
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    on_hold: 'bg-gray-100 text-gray-800',
    closed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    on_hold: 'En pause',
    closed: 'Fermé',
    archived: 'Archivé'
  }
  return labels[status] || status
}

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente'
  }
  return labels[priority] || priority
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadCase()
})
</script>
