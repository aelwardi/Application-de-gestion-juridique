<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord Avocat</h1>
            <p class="mt-1 text-sm text-gray-600">Bienvenue, {{ user?.firstName }} {{ user?.lastName }}</p>
          </div>
          <NotificationDropdown />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500">Dossiers Actifs</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.activeCases }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500">Dossiers Fermés</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.closedCases }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500">RDV Aujourd'hui</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.todayAppointments }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-5">
              <p class="text-sm font-medium text-gray-500">RDV Cette Semaine</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.weekAppointments }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Dossiers par Statut (Pie Chart) -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Dossiers par Statut</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <div v-else class="relative h-64">
              <canvas ref="caseStatusChartRef"></canvas>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div v-for="(item, index) in casesByStatus" :key="index" class="flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: item.color }"></div>
                <span class="text-sm text-gray-700">{{ item.label }}: {{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Rendez-vous par Mois (Line Chart) -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Rendez-vous par Mois</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <div v-else class="relative h-64">
              <canvas ref="appointmentsChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Prochains Rendez-vous (2/3) -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">Prochains Rendez-vous</h2>
            <NuxtLink to="/appointments" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tous →
            </NuxtLink>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-4">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <div v-else-if="upcomingAppointments.length === 0" class="text-center py-8">
              <p class="text-gray-500">Aucun rendez-vous prévu</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="appointment in upcomingAppointments"
                :key="appointment.id"
                class="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 rounded-r transition-colors"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">{{ appointment.title }}</p>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ appointment.client_first_name }} {{ appointment.client_last_name }}
                    </p>
                    <div class="flex items-center gap-3 mt-2">
                      <span class="text-sm text-gray-500">
                        <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatDateTime(appointment.start_time) }}
                      </span>
                      <span class="text-sm text-gray-500">
                        <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ appointment.location_type || 'Bureau' }}
                      </span>
                    </div>
                  </div>
                  <span :class="getStatusBadgeClass(appointment.status)" class="px-3 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusLabel(appointment.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activité Récente (1/3) -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Activité Récente</h2>
          </div>
          <div class="p-6">
            <div v-if="loading" class="text-center py-4">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <div v-else-if="recentActivities.length === 0" class="text-center py-8">
              <p class="text-gray-500 text-sm">Aucune activité récente</p>
            </div>
            <ul v-else class="space-y-4">
              <li v-for="activity in recentActivities" :key="activity.id" class="flex gap-3">
                <div class="flex-shrink-0">
                  <div :class="getActivityIconClass(activity.type)" class="w-8 h-8 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="activity.type === 'case'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      <path v-else-if="activity.type === 'appointment'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      <path v-else-if="activity.type === 'document'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatTimeAgo(activity.createdAt) }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Dossiers Récents -->
      <div class="mt-8 bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Dossiers Récents</h2>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-4">
            <p class="text-gray-500">Chargement...</p>
          </div>
          <div v-else-if="recentCases.length === 0" class="text-center py-8">
            <p class="text-gray-500">Aucun dossier récent</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="caseItem in recentCases" :key="caseItem.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ caseItem.case_number }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ caseItem.title }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ caseItem.client_first_name }} {{ caseItem.client_last_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ caseItem.case_type }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getCaseStatusClass(caseItem.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getStatusLabel(caseItem.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getPriorityClass(caseItem.priority)" class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getPriorityLabel(caseItem.priority) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <NuxtLink :to="`/cases/${caseItem.id}`" class="text-blue-600 hover:text-blue-800">
                      Voir détails
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-4">
            <NuxtLink to="/cases" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tous les dossiers →
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCase } from '~/composables/useCase'
import { useAppointment } from '~/composables/useAppointment'
import { Chart, registerables } from 'chart.js'
import type { CaseWithDetails } from '~/types/case'
import type { AppointmentWithDetails } from '~/types/appointment'

Chart.register(...registerables)

definePageMeta({
  middleware: ['auth', 'lawyer'],
  layout: 'authenticated'
})

const authStore = useAuthStore()
const { getCaseStats, getCasesByLawyer, getUpcomingHearings } = useCase()
const { getAppointmentsByLawyer, getTodayAppointments, getUpcomingAppointments, getAppointmentStats } = useAppointment()
const user = computed(() => authStore.user)
const loading = ref(true)

const caseStatusChartRef = ref<HTMLCanvasElement | null>(null)
const appointmentsChartRef = ref<HTMLCanvasElement | null>(null)
let caseStatusChart: Chart | null = null
let appointmentsChart: Chart | null = null

const stats = ref({
  activeCases: 0,
  closedCases: 0,
  todayAppointments: 0,
  weekAppointments: 0
})

const casesByStatus = ref([
  { label: 'En attente', count: 0, color: '#FCD34D' },
  { label: 'Accepté', count: 0, color: '#60A5FA' },
  { label: 'En cours', count: 0, color: '#818CF8' },
  { label: 'Résolu', count: 0, color: '#34D399' },
  { label: 'Fermé', count: 0, color: '#9CA3AF' }
])

const appointmentsByMonth = ref({
  labels: [] as string[],
  data: [] as number[]
})

const upcomingAppointments = ref<AppointmentWithDetails[]>([])
const recentActivities = ref<any[]>([])
const recentCases = ref<CaseWithDetails[]>([])

const loadDashboardData = async () => {
  loading.value = true
  try {
    // Récupérer l'ID de l'avocat depuis le user connecté
    const lawyerId = user.value?.lawyerId
    
    if (!lawyerId) {
      console.error('Lawyer ID not found in user profile')
      console.log('User:', user.value)
      return
    }
    
    console.log('Loading dashboard for lawyer ID:', lawyerId)

    // 1. Récupérer les statistiques des dossiers
    const statsResponse = await getCaseStats(lawyerId)
    if (statsResponse.success && statsResponse.data) {
      const caseStats = statsResponse.data
      
      // Calculer les dossiers actifs (tous sauf closed et archived)
      stats.value.activeCases = caseStats.in_progress + caseStats.accepted + caseStats.pending
      stats.value.closedCases = caseStats.closed + caseStats.archived

      // Mettre à jour les données du graphique par statut
      casesByStatus.value = [
        { label: 'En attente', count: caseStats.pending, color: '#FCD34D' },
        { label: 'Accepté', count: caseStats.accepted, color: '#60A5FA' },
        { label: 'En cours', count: caseStats.in_progress, color: '#818CF8' },
        { label: 'Résolu', count: caseStats.resolved, color: '#34D399' },
        { label: 'Fermé', count: caseStats.closed, color: '#9CA3AF' }
      ]
    }

    // 2. Récupérer les statistiques des rendez-vous
    const appointmentStatsResponse = await getAppointmentStats(lawyerId)
    if (appointmentStatsResponse.success && appointmentStatsResponse.data) {
      const appointmentStats = appointmentStatsResponse.data
      stats.value.todayAppointments = appointmentStats.today || 0
      stats.value.weekAppointments = appointmentStats.this_week || 0
    }

    // 3. Récupérer les prochains rendez-vous
    const upcomingResponse = await getUpcomingAppointments(lawyerId)
    if (upcomingResponse.success && upcomingResponse.data) {
      upcomingAppointments.value = upcomingResponse.data.slice(0, 5)
    }

    // 4. Récupérer tous les rendez-vous pour le graphique mensuel
    const allAppointmentsResponse = await getAppointmentsByLawyer(lawyerId)
    if (allAppointmentsResponse.success && allAppointmentsResponse.data) {
      const monthlyData = calculateMonthlyAppointments(allAppointmentsResponse.data)
      appointmentsByMonth.value = monthlyData
    }

    // 5. Récupérer les dossiers récents (tous les statuts)
    const casesResponse = await getCasesByLawyer(lawyerId, { 
      limit: 10
    })
    if (casesResponse.success && casesResponse.data) {
      recentCases.value = casesResponse.data
      
      // Créer des activités récentes basées sur les dossiers
      recentActivities.value = casesResponse.data.slice(0, 4).map((caseItem: CaseWithDetails, index: number) => ({
        id: caseItem.id,
        type: 'case',
        description: `Dossier ${caseItem.title} - ${caseItem.status}`,
        createdAt: new Date(caseItem.created_at)
      }))
    }

    await nextTick()
    initCharts()
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error)
  } finally {
    loading.value = false
  }
}

// Fonction pour calculer les rendez-vous par mois (2 passés + mois actuel + 9 à venir)
const calculateMonthlyAppointments = (appointments: AppointmentWithDetails[]) => {
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Créer un tableau pour les 12 mois (2 passés + mois actuel + 9 à venir)
  const months: string[] = []
  const data: number[] = []
  
  // De -2 à +9 (12 mois au total)
  for (let i = -2; i <= 9; i++) {
    const date = new Date(currentYear, currentMonth + i, 1)
    const monthIndex = date.getMonth()
    months.push(monthNames[monthIndex])
    data.push(0)
  }
  
  // Compter les rendez-vous par mois
  appointments.forEach((appointment) => {
    if (appointment.start_time) {
      const appointmentDate = new Date(appointment.start_time)
      const monthDiff = (appointmentDate.getFullYear() - currentYear) * 12 + (appointmentDate.getMonth() - currentMonth)
      
      // Si le rendez-vous est dans la plage de -2 à +9 mois
      if (monthDiff >= -2 && monthDiff <= 9) {
        const index = monthDiff + 2 // Décalage car on commence à -2
        if (index >= 0 && index < data.length) {
          data[index]++
        }
      }
    }
  })
  
  return { labels: months, data }
}

const initCharts = () => {
  // Pie Chart - Dossiers par Statut
  if (caseStatusChartRef.value) {
    const ctx = caseStatusChartRef.value.getContext('2d')
    if (ctx) {
      if (caseStatusChart) caseStatusChart.destroy()
      
      caseStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: casesByStatus.value.map(item => item.label),
          datasets: [{
            data: casesByStatus.value.map(item => item.count),
            backgroundColor: casesByStatus.value.map(item => item.color),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              callbacks: {
                label: function(context: any) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      })
    }
  }

  // Line Chart - Rendez-vous par Mois
  if (appointmentsChartRef.value) {
    const ctx = appointmentsChartRef.value.getContext('2d')
    if (ctx) {
      if (appointmentsChart) appointmentsChart.destroy()
      
      appointmentsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: appointmentsByMonth.value.labels,
          datasets: [{
            label: 'Rendez-vous',
            data: appointmentsByMonth.value.data,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#2563EB',
            pointHoverBorderColor: '#ffffff',
            segment: {
              borderColor: (ctx: any) => {
                // Ligne pointillée pour les mois futurs (après l'index 2 qui est le mois actuel)
                return ctx.p0DataIndex >= 2 ? '#93C5FD' : '#3B82F6'
              },
              borderDash: (ctx: any) => {
                return ctx.p0DataIndex >= 2 ? [5, 5] : []
              }
            }
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              callbacks: {
                label: function(context: any) {
                  const index = context.dataIndex
                  const label = index === 2 ? 'Rendez-vous (mois actuel)' : 
                                index < 2 ? 'Rendez-vous (passés)' : 
                                'Rendez-vous (à venir)'
                  return `${label}: ${context.parsed.y}`
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                font: {
                  size: 12
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              ticks: {
                font: {
                  size: 12
                },
                color: (context: any) => {
                  // Mettre en évidence le mois actuel (index 2)
                  return context.index === 2 ? '#3B82F6' : '#6B7280'
                }
              },
              grid: {
                display: false
              }
            }
          }
        }
      })
    }
  }
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(date))
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${days}j`
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    'confirmed': 'bg-green-100 text-green-800',
    'scheduled': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-red-100 text-red-800',
    'completed': 'bg-gray-100 text-gray-800'
  }
  return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'confirmed': 'Confirmé',
    'scheduled': 'Programmé',
    'cancelled': 'Annulé',
    'completed': 'Terminé',
    'pending': 'En attente',
    'accepted': 'Accepté',
    'in_progress': 'En cours',
    'on_hold': 'En suspens',
    'resolved': 'Résolu',
    'closed': 'Fermé',
    'rejected': 'Rejeté',
    'archived': 'Archivé'
  }
  return labels[status.toLowerCase()] || status
}

const getCaseStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-indigo-100 text-indigo-800',
    'on_hold': 'bg-orange-100 text-orange-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800',
    'rejected': 'bg-red-100 text-red-800',
    'archived': 'bg-gray-100 text-gray-600'
  }
  return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  }
  return classes[priority.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'low': 'Faible',
    'medium': 'Moyenne',
    'high': 'Haute',
    'urgent': 'Urgente'
  }
  return labels[priority.toLowerCase()] || priority
}

const getActivityIconClass = (type: string) => {
  const classes = {
    'case': 'bg-blue-500',
    'appointment': 'bg-purple-500',
    'document': 'bg-green-500',
    'message': 'bg-yellow-500'
  }
  return classes[type] || 'bg-gray-500'
}

onMounted(() => {
  loadDashboardData()
})

onBeforeUnmount(() => {
  if (caseStatusChart) caseStatusChart.destroy()
  if (appointmentsChart) appointmentsChart.destroy()
})
</script>