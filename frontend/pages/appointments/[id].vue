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

        <div v-else-if="appointment">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ appointment.title }}</h1>
              <p class="text-gray-600 mt-2">{{ formatDate(appointment.start_time) }}</p>
            </div>
            <div class="flex gap-3">
              <span :class="getStatusClass(appointment.status)" class="px-4 py-2 text-sm font-semibold rounded-full">
                {{ getStatusLabel(appointment.status) }}
              </span>
              <span class="px-4 py-2 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                {{ getTypeLabel(appointment.appointment_type) }}
              </span>
            </div>
          </div>

          <!-- Appointment Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Horaires</h3>
              <div class="space-y-1">
                <p class="text-lg font-semibold text-gray-900">
                  {{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}
                </p>
                <p class="text-sm text-gray-600">
                  Durée: {{ getDuration(appointment.start_time, appointment.end_time) }}
                </p>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Type de lieu</h3>
              <p class="text-lg font-semibold text-gray-900">{{ getLocationTypeLabel(appointment.location_type) }}</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Rappel envoyé</h3>
              <p class="text-lg font-semibold" :class="appointment.reminder_sent ? 'text-green-600' : 'text-gray-900'">
                {{ appointment.reminder_sent ? 'Oui' : 'Non' }}
              </p>
            </div>
          </div>

          <!-- Client Information -->
          <div class="bg-white rounded-lg shadow p-6 mt-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Informations du client</h2>
              <NuxtLink 
                :to="`/messages?clientId=${appointment.client_id}`"
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
                  {{ appointment.client_first_name }} {{ appointment.client_last_name }}
                </p>
              </div>
              <div v-if="appointment.client_email">
                <p class="text-sm text-gray-500 mb-1">Email</p>
                <a 
                  :href="`mailto:${appointment.client_email}`"
                  class="text-lg text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {{ appointment.client_email }}
                </a>
              </div>
            </div>
          </div>

          <!-- Case Information (if linked) -->
          <div v-if="appointment.case_id" class="bg-white rounded-lg shadow p-6 mt-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Dossier lié</h2>
              <NuxtLink 
                :to="`/cases/${appointment.case_id}`"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
              >
                Voir le dossier
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-if="appointment.case_number">
                <p class="text-sm text-gray-500 mb-1">Numéro du dossier</p>
                <p class="text-lg font-medium text-gray-900">{{ appointment.case_number }}</p>
              </div>
              <div v-if="appointment.case_title">
                <p class="text-sm text-gray-500 mb-1">Titre du dossier</p>
                <p class="text-lg font-medium text-gray-900">{{ appointment.case_title }}</p>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="appointment.description" class="bg-white rounded-lg shadow p-6 mt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p class="text-gray-700 whitespace-pre-wrap">{{ appointment.description }}</p>
          </div>

          <!-- Location & Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Localisation</h2>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Type</p>
                  <p class="text-gray-900">{{ getLocationTypeLabel(appointment.location_type) }}</p>
                </div>
                <div v-if="appointment.location_address">
                  <p class="text-sm text-gray-500">Adresse</p>
                  <p class="text-gray-900">{{ appointment.location_address }}</p>
                </div>
                <div v-if="appointment.meeting_url">
                  <p class="text-sm text-gray-500 mb-1">Lien de visioconférence</p>
                  <a 
                    :href="appointment.meeting_url" 
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {{ appointment.meeting_url }}
                  </a>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Détails</h2>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Date de création</p>
                  <p class="text-gray-900">{{ formatDate(appointment.created_at) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Dernière modification</p>
                  <p class="text-gray-900">{{ formatDate(appointment.updated_at) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="appointment.notes" class="bg-white rounded-lg shadow p-6 mt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-gray-700 whitespace-pre-wrap">{{ appointment.notes }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-lg shadow p-6 mt-6">
            <div class="flex gap-4">
              <button
                v-if="appointment.status !== 'completed'"
                @click="markAsCompleted"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Marquer comme terminé
              </button>
              <button
                v-if="appointment.status !== 'cancelled'"
                @click="cancelAppointment"
                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler le rendez-vous
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppointmentWithDetails } from '~/types/appointment'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated'
})

const route = useRoute()
const { getAppointmentById, updateAppointment } = useAppointment()

const appointment = ref<AppointmentWithDetails | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const loadAppointment = async () => {
  loading.value = true
  error.value = null
  
  try {
    const appointmentId = route.params.id as string
    const response = await getAppointmentById(appointmentId)
    
    if (response.success && response.data) {
      appointment.value = response.data as AppointmentWithDetails
    } else {
      error.value = 'Rendez-vous non trouvé'
    }
  } catch (err: any) {
    console.error('Error loading appointment:', err)
    error.value = 'Erreur lors du chargement du rendez-vous'
  } finally {
    loading.value = false
  }
}

const markAsCompleted = async () => {
  if (!appointment.value) return
  
  try {
    const response = await updateAppointment(appointment.value.id, { status: 'completed' })
    if (response.success) {
      appointment.value.status = 'completed'
    }
  } catch (err) {
    console.error('Error updating appointment:', err)
  }
}

const cancelAppointment = async () => {
  if (!appointment.value) return
  
  if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
    try {
      const response = await updateAppointment(appointment.value.id, { status: 'cancelled' })
      if (response.success) {
        appointment.value.status = 'cancelled'
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err)
    }
  }
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    no_show: 'bg-orange-100 text-orange-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: 'Programmé',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
    no_show: 'Absent'
  }
  return labels[status] || status
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    consultation: 'Consultation',
    tribunal: 'Tribunal',
    rencontre_client: 'Rencontre client',
    expertise: 'Expertise',
    mediation: 'Médiation',
    signature: 'Signature',
    autre: 'Autre'
  }
  return labels[type] || type
}

const getLocationTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    office: 'Cabinet',
    court: 'Tribunal',
    client_location: 'Chez le client',
    online: 'En ligne',
    other: 'Autre'
  }
  return labels[type] || type
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDuration = (start: string | Date, end: string | Date) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  
  if (hours > 0) {
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
  }
  return `${mins} min`
}

onMounted(() => {
  loadAppointment()
})
</script>
