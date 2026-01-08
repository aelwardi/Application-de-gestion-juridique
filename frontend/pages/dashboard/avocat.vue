<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCase } from '~/composables/useCase'
import { useAppointment } from '~/composables/useAppointment'
import { useDocument } from '~/composables/useDocument'

definePageMeta({ middleware: ['auth', 'lawyer'], layout: 'authenticated' })

const authStore = useAuthStore()
const { getCaseStats } = useCase()
const { getAllAppointments, getAppointmentStats } = useAppointment()
const { getRecentDocuments, getDownloadUrl } = useDocument()
const config = useRuntimeConfig()

const user = computed(() => authStore.user)
const loading = ref(false)
const recentCases = ref<any[]>([])
const displayApt = ref<any>(null)
const isUpcoming = ref(true)
const documents = ref<any[]>([])
const stats = ref({ activeCases: 0, closedCases: 0, todayAppointments: 0 })

const loadDashboardData = async () => {
  if (!user.value) return
  loading.value = true

  try {
    const userId = user.value.id;

    const [statsRes, aptStatsRes, docsRes] = await Promise.all([
      getCaseStats(userId),
      getAppointmentStats(userId),
      getRecentDocuments(userId)
    ])

    const s: any = statsRes?.data || statsRes
    stats.value.activeCases = (Number(s.in_progress) || 0) + (Number(s.open) || 0)
    stats.value.closedCases = Number(s.closed) || 0
    stats.value.todayAppointments = aptStatsRes?.data?.today || 0

    documents.value = docsRes?.data || (Array.isArray(docsRes) ? docsRes : [])

    const casesRes: any = await $fetch(`${config.public.apiBaseUrl}/cases`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` },
      params: { lawyer_id: userId }
    })
    const dataCases = Array.isArray(casesRes) ? casesRes : (casesRes?.data || [])
    const sortedCases = dataCases.sort((a: any, b: any) =>
        new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
    )
    recentCases.value = sortedCases.length > 0 ? [sortedCases[0]] : []

    const aptRes = await getAllAppointments({ lawyer_id: userId })
    const allApts = aptRes.success ? (aptRes.data || []) : []

    if (allApts && allApts.length > 0) {
      const now = new Date().getTime()
      const upcoming = allApts
          .filter((a: any) => new Date(a.start_time).getTime() > now)
          .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

      if (upcoming.length > 0) {
        displayApt.value = upcoming[0]
        isUpcoming.value = true
      } else {
        const past = allApts
            .filter((a: any) => new Date(a.start_time).getTime() <= now)
            .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        displayApt.value = past[0] || null
        isUpcoming.value = false
      }
    }

  } catch (error) {
    console.error('Erreur dashboard:', error)
  } finally {
    loading.value = false
  }
}

const getCaseStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    on_hold: 'bg-gray-100 text-gray-800',
    closed: 'bg-green-100 text-green-800',
    open: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getCaseStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    on_hold: 'En pause',
    closed: 'Fermé',
    open: 'Ouvert'
  }
  return labels[status] || status
}

const formatDate = (date: string) => {
  if (!date) return '...'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const formatDateFull = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const openDocument = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(getDownloadUrl(url), '_blank')
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-blue-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Dossiers Actifs</p>
              <p class="text-3xl font-bold text-blue-600">{{ stats.activeCases }}</p>
              <p class="text-xs text-gray-500 mt-2">En cours de traitement</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-green-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Dossiers Fermés</p>
              <p class="text-3xl font-bold text-green-600">{{ stats.closedCases }}</p>
              <p class="text-xs text-gray-500 mt-2">Traités avec succès</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-purple-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">RDV Aujourd'hui</p>
              <p class="text-3xl font-bold text-purple-600">{{ stats.todayAppointments }}</p>
              <p class="text-xs text-gray-500 mt-2">Consultations prévues</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-orange-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Documents</p>
              <p class="text-3xl font-bold text-orange-600">{{ documents.length }}</p>
              <p class="text-xs text-gray-500 mt-2">Fichiers récents</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm h-full border border-white">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Dernier Dossier
              </h2>
              <NuxtLink to="/cases" class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors flex items-center gap-1">
                Voir tous
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NuxtLink>
            </div>
            <div class="p-6">
              <div v-if="loading" class="text-center py-12">
                <div class="inline-flex items-center justify-center">
                  <div class="relative">
                    <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                </div>
                <p class="text-gray-600 mt-4 font-medium">Chargement...</p>
              </div>
              <div v-else-if="recentCases.length === 0" class="text-center py-16">
                <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p class="text-gray-500 font-medium">Aucun dossier pour le moment</p>
              </div>
              <div v-else class="space-y-4">
                <div 
                  v-for="caseItem in recentCases" 
                  :key="caseItem.id"
                  @click="navigateTo(`/cases/${caseItem.id}`)"            
                  class="group bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-blue-100 hover:border-blue-300 relative overflow-hidden"
                >
                  <div class="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16"></div>
                  <div class="relative flex justify-between items-center">
                    <div class="flex-1">
                      <h3 class="font-bold text-2xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{{ caseItem.title }}</h3>
                      <div class="flex items-center gap-2 mb-3">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <p class="text-sm text-gray-600 font-medium">{{ caseItem.case_number }}</p>
                      </div>
                      <div class="flex items-center gap-4">
                        <span :class="getCaseStatusClass(caseItem.status)" class="px-4 py-1.5 text-xs rounded-full font-bold shadow-sm">
                          {{ getCaseStatusLabel(caseItem.status) }}
                        </span>
                        <span class="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Mis à jour le {{ formatDate(caseItem.updated_at || caseItem.opening_date) }}
                        </span>
                      </div>
                    </div>
                    <div class="bg-white p-4 rounded-full shadow-md group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-200 group-hover:scale-110">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm h-full border border-white">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Prochain RDV
              </h2>
              <NuxtLink to="/appointments" class="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium transition-colors flex items-center gap-1">
                Voir tous
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </NuxtLink>
            </div>
            <div class="p-6">
              <div v-if="loading" class="text-center py-12">
                <div class="inline-flex items-center justify-center">
                  <div class="relative">
                    <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                </div>
                <p class="text-gray-600 mt-4 font-medium">Chargement...</p>
              </div>
              
              <div v-else-if="displayApt" class="space-y-4">
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 p-5 rounded-r-xl shadow-sm">
                  <div class="flex items-center gap-3 mb-3">
                    <span class="px-3 py-1 bg-white/80 backdrop-blur-sm text-purple-700 rounded-full text-xs font-bold shadow-sm">
                      {{ isUpcoming ? 'À venir' : 'Dernier RDV' }}
                    </span>
                  </div>
                  <p class="text-xs text-purple-600 font-medium mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDateFull(displayApt.start_time) }}
                  </p>
                  <h4 class="font-bold text-lg text-gray-900 mb-2">{{ displayApt.title }}</h4>
                  <div class="flex items-center gap-2 text-purple-700 font-bold mb-4">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ formatTime(displayApt.start_time) }} - {{ formatTime(displayApt.end_time) }}</span>
                  </div>
                  <div class="pt-4 border-t border-purple-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {{ displayApt.client_first_name?.[0] || '?' }}
                      </div>
                      <span class="text-sm text-gray-700 font-medium">{{ displayApt.client_first_name }} {{ displayApt.client_last_name }}</span>
                    </div>
                    <button @click="navigateTo(`/appointments/${displayApt.id}`)" class="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-bold transition-colors shadow-sm">
                      Détails
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-16">
                <div class="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p class="text-gray-500 font-medium text-sm">Aucun rendez-vous enregistré</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Documents Récents
          </h2>
          <NuxtLink to="/documents" class="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium transition-colors flex items-center gap-1">
            Voir tous
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-12">
            <div class="inline-flex items-center justify-center">
              <div class="relative">
                <div class="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
            </div>
            <p class="text-gray-600 mt-4 font-medium">Chargement...</p>
          </div>
          <div v-else-if="documents.length === 0" class="text-center py-16">
            <div class="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-gray-500 font-medium">Aucun document récent</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              v-for="doc in documents.slice(0, 3)" 
              :key="doc.id" 
              class="group bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
              @click="openDocument(doc.file_url)"
            >
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <img v-if="doc.file_type?.includes('image')" :src="getDownloadUrl(doc.file_url)" class="w-full h-full object-cover" />
                  <svg v-else-if="doc.file_type?.includes('pdf')" class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="overflow-hidden flex-1">
                  <h4 class="font-bold text-sm text-gray-900 truncate group-hover:text-orange-600 transition-colors">{{ doc.title || doc.file_name }}</h4>
                  <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(doc.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

