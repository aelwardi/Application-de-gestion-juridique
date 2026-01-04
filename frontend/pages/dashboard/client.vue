<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Titre -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p class="text-gray-600 mt-2">Bienvenue {{ authStore.user?.firstName }}</p>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Dossiers Actifs</p>
              <p class="text-3xl font-bold text-blue-600">{{ stats?.activeCases || 0 }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Dossiers</p>
              <p class="text-3xl font-bold text-green-600">{{ stats?.totalCases || 0 }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Rendez-vous à Venir</p>
              <p class="text-3xl font-bold text-purple-600">{{ stats?.upcomingAppointments || 0 }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Documents</p>
              <p class="text-3xl font-bold text-orange-600">{{ stats?.totalDocuments || 0 }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">Mes Dossiers</h2>
              <NuxtLink to="/cases" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Voir tous →
              </NuxtLink>
            </div>
            <div class="p-6">
              <div v-if="loadingCases" class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <div v-else-if="cases.length === 0" class="text-center py-8 text-gray-500">
                Aucun dossier pour le moment
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="caseItem in cases"
                  :key="caseItem.id"
                  class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  @click="navigateTo(`/cases/${caseItem.id}`)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900">{{ caseItem.title }}</h3>
                      <p class="text-sm text-gray-600 mt-1">{{ caseItem.case_number }}</p>
                      <div class="flex items-center gap-2 mt-2">
                        <span
                          class="px-2 py-1 text-xs rounded-full"
                          :class="getCaseStatusClass(caseItem.status)"
                        >
                          {{ getCaseStatusLabel(caseItem.status) }}
                        </span>
                        <span
                          class="px-2 py-1 text-xs rounded-full"
                          :class="getCasePriorityClass(caseItem.priority)"
                        >
                          {{ getPriorityLabel(caseItem.priority) }}
                        </span>
                      </div>
                    </div>
                    <div v-if="caseItem.lawyer_first_name" class="text-right ml-4">
                      <p class="text-sm text-gray-600">Avocat</p>
                      <p class="font-medium text-gray-900">
                        {{ caseItem.lawyer_first_name }} {{ caseItem.lawyer_last_name }}
                      </p>
                    </div>
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
              <NuxtLink to="/appointments" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Voir tous →
              </NuxtLink>
            </div>
            <div class="p-6">
              <div v-if="loadingAppointments" class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <div v-else-if="appointments.length === 0" class="text-center py-8 text-gray-500">
                Aucun rendez-vous à venir
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="appointment in appointments"
                  :key="appointment.id"
                  class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <h3 class="font-semibold text-gray-900 text-sm">{{ appointment.title }}</h3>
                  <p class="text-xs text-gray-600 mt-1">
                    {{ formatDate(appointment.start_time) }}
                  </p>
                  <p class="text-xs text-gray-600">
                    {{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}
                  </p>
                  <div v-if="appointment.lawyer_first_name" class="mt-2">
                    <p class="text-xs text-gray-500">
                      Avec {{ appointment.lawyer_first_name }} {{ appointment.lawyer_last_name }}
                    </p>
                  </div>
                  <span
                    class="inline-block mt-2 px-2 py-1 text-xs rounded-full"
                    :class="getAppointmentStatusClass(appointment.status)"
                  >
                    {{ getAppointmentStatusLabel(appointment.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Documents Récents</h2>
          <NuxtLink to="/documents" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Voir tous →
          </NuxtLink>
        </div>
        <div class="p-6">
          <div v-if="loadingDocuments" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <div v-else-if="documents.length === 0" class="text-center py-8 text-gray-500">
            Aucun document
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="document in documents"
              :key="document.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 bg-gray-100 rounded">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ document.fileName }}</p>
                  <p class="text-xs text-gray-500">{{ document.caseTitle }} • {{ formatDate(document.createdAt) }}</p>
                </div>
              </div>
              <button class="text-blue-600 hover:text-blue-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClientStats } from '~/types/client';

definePageMeta({
  middleware: ['auth', 'client'],
  layout: 'authenticated',
});

const { getClientStats } = useClient();
const { getAllCases } = useCase();
const { getAllAppointments } = useAppointment();
const authStore = useAuthStore();

const stats = ref<ClientStats | null>(null);
const cases = ref<any[]>([]);
const appointments = ref<any[]>([]);
const documents = ref<any[]>([]);

const loadingCases = ref(true);
const loadingAppointments = ref(true);
const loadingDocuments = ref(true);

onMounted(async () => {
  if (!authStore.user) return;

  try {
    // Charger les stats
    stats.value = await getClientStats(authStore.user.id);

    // Charger les dossiers
    loadingCases.value = true;
    const casesResponse = await getAllCases({
      client_id: authStore.user.id,
      limit: 5
    });
    cases.value = casesResponse.data || [];
    loadingCases.value = false;

    // Charger les rendez-vous
    loadingAppointments.value = true;
    const appointmentsResponse = await getAllAppointments({
      client_id: authStore.user.id,
      limit: 5
    });
    appointments.value = (appointmentsResponse.data || []).filter((apt: any) => new Date(apt.start_time) > new Date());
    loadingAppointments.value = false;

    // Documents - à implémenter si nécessaire
    loadingDocuments.value = false;
  } catch (error) {
    console.error('Error loading client dashboard:', error);
    loadingCases.value = false;
    loadingAppointments.value = false;
    loadingDocuments.value = false;
  }
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCaseStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    on_hold: 'bg-gray-100 text-gray-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getCaseStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Accepté',
    in_progress: 'En cours',
    on_hold: 'En pause',
    resolved: 'Résolu',
    closed: 'Fermé',
    rejected: 'Rejeté',
  };
  return labels[status] || status;
};

const getCasePriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente',
  };
  return labels[priority] || priority;
};

const getAppointmentStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    no_show: 'bg-orange-100 text-orange-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getAppointmentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: 'Programmé',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
    no_show: 'Absent',
  };
  return labels[status] || status;
};
</script>