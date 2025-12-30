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
          <div class="bg-white rounded-lg shadow">
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
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">Prochains RDV</h2>
              <NuxtLink to="/appointments" class="text-blue-600 hover:text-blue-700 text-sm font-medium">Voir tous →</NuxtLink>
            </div>
            <div class="p-6 text-center py-8 text-gray-500">
              Aucun rendez-vous à venir
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
          <div v-if="documents.length === 0" class="text-center py-8 text-gray-500 italic">Aucun document</div>
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

definePageMeta({ middleware: ['auth', 'lawyer'], layout: 'authenticated' })

const authStore = useAuthStore()
const { getCaseStats } = useCase()
const config = useRuntimeConfig()

const user = computed(() => authStore.user)
const loading = ref(false)
const recentCases = ref<any[]>([])
const documents = ref<any[]>([])
const stats = ref({ activeCases: 0, closedCases: 0, todayAppointments: 0 })

const loadDashboardData = async () => {
  if (!user.value) return
  loading.value = true

  try {
    const lawyerId = user.value.lawyer_id || user.value.lawyerId || user.value.id

    // 1. Stats
    const statsRes = await getCaseStats(lawyerId)
    const s = statsRes?.data || statsRes
    stats.value.activeCases = (Number(s.in_progress) || 0) + (Number(s.open) || 0)
    stats.value.closedCases = Number(s.closed) || 0

    // 2. Fetch du dernier dossier réel (Table cases)
    const casesRes: any = await $fetch(`${config.public.apiBaseUrl}/cases`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` },
      params: { lawyer_id: lawyerId }
    })

    const data = Array.isArray(casesRes) ? casesRes : (casesRes?.data || [])
    
    // On trie pour avoir le dernier modifié ou créé en premier
    const sorted = data.sort((a: any, b: any) => 
      new Date(b.opening_date || b.created_at).getTime() - new Date(a.opening_date || a.created_at).getTime()
    )

    recentCases.value = sorted.length > 0 ? [sorted[0]] : []

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

onMounted(() => {
  loadDashboardData()
})
</script>