<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Dossiers Actifs</p>
              <p class="text-3xl font-bold text-blue-600">{{ stats.activeCases }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Dossiers Fermés</p>
              <p class="text-3xl font-bold text-green-600">{{ stats.closedCases }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">RDV Aujourd'hui</p>
              <p class="text-3xl font-bold text-purple-600">{{ stats.todayAppointments }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Documents</p>
              <p class="text-3xl font-bold text-orange-600">{{ documents.length }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow h-full">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">Dernier Dossier</h2>
              <NuxtLink to="/cases" class="text-blue-600 hover:text-blue-700 text-sm font-medium">Voir tous →</NuxtLink>
            </div>
            <div class="p-6">
              <div v-if="loading" class="text-center py-8 italic text-gray-500">Chargement...</div>
              <div v-else-if="recentCases.length === 0" class="text-center py-8 text-gray-500">Aucun dossier pour le moment</div>
              <div v-else class="space-y-4">
                <div 
                  v-for="caseItem in recentCases" 
                  :key="caseItem.id"
                  @click="navigateTo(`/cases/${caseItem.id}`)"            
                  class="border-2 border-blue-50 bg-blue-50/30 rounded-xl p-6 hover:border-blue-300 transition-all cursor-pointer flex justify-between items-center group shadow-sm"
                >
                  <div>
                    <h3 class="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{{ caseItem.title }}</h3>
                    <p class="text-sm text-gray-500 font-mono mt-1">{{ caseItem.case_number }}</p>
                    <div class="flex items-center gap-4 mt-3">
                      <span :class="getCaseStatusClass(caseItem.status)" class="px-3 py-1 text-xs rounded-full uppercase font-black tracking-wider">
                        {{ caseItem.status }}
                      </span>
                      <span class="text-xs text-gray-400 font-medium italic">Mis à jour le {{ formatDate(caseItem.updated_at || caseItem.opening_date) }}</span>
                    </div>
                  </div>
                  <div class="bg-white p-3 rounded-full shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="bg-white rounded-lg shadow h-full">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">Prochain RDV</h2>
              <NuxtLink to="/appointments" class="text-blue-600 hover:text-blue-700 text-sm font-medium">Voir tous →</NuxtLink>
            </div>
            <div class="p-6">
              <div v-if="loading" class="text-center py-8 italic text-gray-500">Chargement...</div>
              
              <div v-else-if="displayApt" class="space-y-4">
                <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-xs font-bold uppercase px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {{ isUpcoming ? 'À venir' : 'Dernier RDV' }}
                    </span>
                    <span class="text-xs text-gray-500">{{ formatDateFull(displayApt.start_time) }}</span>
                  </div>
                  <h4 class="font-bold text-gray-900">{{ displayApt.title }}</h4>
                  <p class="text-sm text-purple-700 font-medium mt-1">
                    {{ formatTime(displayApt.start_time) }} - {{ formatTime(displayApt.end_time) }}
                  </p>
                  <div class="mt-4 pt-4 border-t border-purple-100 flex items-center justify-between">
                    <span class="text-xs text-gray-600 italic">👤 {{ displayApt.client_first_name }} {{ displayApt.client_last_name }}</span>
                    <button @click="navigateTo(`/appointments/${displayApt.id}`)" class="text-purple-600 text-xs font-bold hover:underline">
                      Détails
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500 italic text-sm">
                Aucun rendez-vous enregistré
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Documents Récents</h2>
          <NuxtLink to="/documents" class="text-blue-600 hover:text-blue-700 text-sm font-medium">Voir tous →</NuxtLink>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-8 italic text-gray-500">Chargement...</div>
          <div v-else-if="documents.length === 0" class="text-center py-8 text-gray-500 italic">Aucun document récent</div>
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              v-for="doc in documents.slice(0, 3)" 
              :key="doc.id" 
              class="border rounded-xl p-3 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              @click="window.open(getDownloadUrl(doc.file_url), '_blank')"
            >
              <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img v-if="doc.file_type?.includes('image')" :src="getDownloadUrl(doc.file_url)" class="w-full h-full object-cover" />
                <svg v-else-if="doc.file_type?.includes('pdf')" class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div class="overflow-hidden">
                <h4 class="font-bold text-sm text-gray-900 truncate">{{ doc.title || doc.file_name }}</h4>
                <p class="text-xs text-gray-500 mt-1 italic">{{ formatDate(doc.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

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
    const lawyerId = user.value.lawyer_id || user.value.lawyerId || user.value.id

    // 1. Stats & Documents & RDV
    const [statsRes, aptStatsRes, docsRes] = await Promise.all([
      getCaseStats(lawyerId),
      getAppointmentStats(lawyerId),
      getRecentDocuments(user.value.id) // On récupère les docs récents
    ])
    
    // Traitement Stats
    const s = statsRes?.data || statsRes
    stats.value.activeCases = (Number(s.in_progress) || 0) + (Number(s.open) || 0)
    stats.value.closedCases = Number(s.closed) || 0
    stats.value.todayAppointments = aptStatsRes?.data?.today || 0

    // Traitement Documents (on prend les 3 derniers)
    documents.value = docsRes?.data || (Array.isArray(docsRes) ? docsRes : [])

    // 2. Dossiers (Dernier dossier)
    const casesRes: any = await $fetch(`${config.public.apiBaseUrl}/cases`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` },
      params: { lawyer_id: lawyerId }
    })
    const dataCases = Array.isArray(casesRes) ? casesRes : (casesRes?.data || [])
    const sortedCases = dataCases.sort((a: any, b: any) => 
      new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
    )
    recentCases.value = sortedCases.length > 0 ? [sortedCases[0]] : []

    // 3. Rendez-vous
    const aptRes = await getAllAppointments({ lawyer_id: lawyerId })
    const allApts = aptRes.success ? aptRes.data : []
    
    if (allApts.length > 0) {
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
  if (status === 'closed') return 'bg-gray-100 text-gray-600 font-bold'
  return 'bg-green-100 text-green-700 font-bold'
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

onMounted(() => {
  loadDashboardData()
})
</script>