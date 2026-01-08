<script setup lang="ts">
import type { Client, ClientStats } from '~/types/client';

definePageMeta({
  middleware: ['auth', 'lawyer'],
  layout: 'authenticated',
});

const route = useRoute();
const { getClientById, getClientStats, getClientCases, getClientAppointments, getClientDocuments } = useClient();
const toast = useToast();
const { getAvatarUrl } = useAvatar();

const client = ref<Client | null>(null);
const stats = ref<ClientStats | null>(null);
const cases = ref<any[]>([]);
const appointments = ref<any[]>([]);
const documents = ref<any[]>([]);

const loading = ref(true);
const loadingCases = ref(false);
const loadingAppointments = ref(false);
const loadingDocuments = ref(false);
const isEditing = ref(false);
const activeTab = ref('info');

const tabs = [
  { id: 'info', name: 'Informations' },
  { id: 'cases', name: 'Dossiers' },
  { id: 'appointments', name: 'Rendez-vous' },
  { id: 'documents', name: 'Documents' },
];

const loadClientData = async () => {
  const clientId = route.params.id as string;

  try {
    loading.value = true;
    client.value = await getClientById(clientId);

    if (client.value && client.value.id) {
      stats.value = await getClientStats(client.value.id);
    }
  } catch (error) {
    console.error('Error loading client:', error);
    toast.error('Erreur lors du chargement des informations du client');
  } finally {
    loading.value = false;
  }
};

watch(activeTab, async (newTab) => {
  if (!client.value) return;

  if (newTab === 'cases' && cases.value.length === 0) {
    try {
      loadingCases.value = true;
      const result = await getClientCases(client.value.id, 20, 0);
      cases.value = result.data;
    } catch (error) {
      console.error('Error loading cases:', error);
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      loadingCases.value = false;
    }
  } else if (newTab === 'appointments' && appointments.value.length === 0) {
    try {
      loadingAppointments.value = true;
      const result = await getClientAppointments(client.value.id, 20, 0);
      appointments.value = result.data;
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      loadingAppointments.value = false;
    }
  } else if (newTab === 'documents' && documents.value.length === 0) {
    try {
      loadingDocuments.value = true;
      const result = await getClientDocuments(client.value.id, 20, 0);
      documents.value = result.data;
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      loadingDocuments.value = false;
    }
  }
});

const getInitials = (firstName: string, lastName: string) => {
  if (!firstName || !lastName) return '??';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const formatDate = (date: Date | string) => {
  if (!date) return 'Date non disponible';
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    return 'Date invalide';
  }
};

const formatTime = (date: Date | string) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'open': 'Ouvert',
    'in_progress': 'En cours',
    'pending': 'En attente',
    'closed': 'Fermé',
    'archived': 'Archivé',
    'on_hold': 'En suspens'
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'open': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'pending': 'bg-orange-100 text-orange-800',
    'closed': 'bg-gray-100 text-gray-800',
    'archived': 'bg-gray-100 text-gray-600',
    'on_hold': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'low': 'Basse',
    'medium': 'Moyenne',
    'high': 'Haute',
    'urgent': 'Urgente'
  };
  return labels[priority] || priority;
};

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  loadClientData();
});
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="relative inline-flex">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0"></div>
      </div>
    </div>

    <div v-else-if="!client" class="flex items-center justify-center min-h-screen">
      <div class="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Client non trouvé</h2>
        <p class="text-gray-600 mb-6">Le client que vous recherchez n'existe pas ou a été supprimé</p>
        <NuxtLink to="/clients" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la liste des clients
        </NuxtLink>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <NuxtLink
          to="/clients"
          class="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 mb-6 transition-all group"
        >
          <svg class="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la liste des clients
        </NuxtLink>

        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-6">
              <div
                v-if="client.profilePictureUrl"
                class="h-24 w-24 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 ring-4 ring-white shadow-lg"
                :style="`background-image: url('${getAvatarUrl(client.profilePictureUrl)}'); background-size: cover; background-position: center;`"
              ></div>
              <div
                v-else
                class="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg"
              >
                {{ getInitials(client.firstName, client.lastName) }}
              </div>
              <div>
                <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                  {{ client.firstName }} {{ client.lastName }}
                </h1>
                <p class="text-gray-600 font-medium flex items-center gap-2 mb-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ client.email }}
                </p>
                <div class="flex items-center gap-2">
                  <span
                    v-if="client.isActive"
                    class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Actif
                  </span>
                  <span
                    v-if="client.isVerified"
                    class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Vérifié
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Dossiers Actifs</p>
              <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">{{ stats?.activeCases || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Total Dossiers</p>
              <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{{ stats?.totalCases || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">RDV à Venir</p>
              <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700">{{ stats?.upcomingAppointments || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium">Documents</p>
              <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-700">{{ stats?.totalDocuments || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8 overflow-hidden">
        <div class="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
          <nav class="-mb-px flex space-x-2 px-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-600 bg-white/80 text-blue-600 shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50',
                'whitespace-nowrap py-4 px-6 border-b-2 font-bold text-sm rounded-t-lg transition-all'
              ]"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="p-8">
          <div v-if="activeTab === 'info'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Téléphone</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ client.phone || 'Non renseigné' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Adresse</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ client.address || 'Non renseignée' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Ville</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ client.city || 'Non renseignée' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Code Postal</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ client.postalCode || 'Non renseigné' }}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Contact d'Urgence</h3>
                <dl class="space-y-3">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Nom</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ client.emergencyContactName || 'Non renseigné' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Téléphone</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ client.emergencyContactPhone || 'Non renseigné' }}</dd>
                  </div>
                </dl>
                <div v-if="client.notes" class="mt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ client.notes }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'cases'">
            <div v-if="loadingCases" class="text-center py-12">
              <div class="relative inline-flex">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-600 absolute top-0"></div>
              </div>
              <p class="text-gray-600 mt-4 font-medium">Chargement des dossiers...</p>
            </div>
            <div v-else-if="cases.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="text-gray-500 text-lg">Aucun dossier</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="caseItem in cases"
                :key="caseItem.id"
                class="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50"
                @click="navigateTo(`/cases/${caseItem.id}`)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-lg">{{ caseItem.title }}</h3>
                    <p class="text-sm text-gray-600 mt-1 font-medium">{{ caseItem.case_number || caseItem.caseNumber }}</p>
                    <div class="flex items-center gap-2 mt-3">
                      <span :class="getStatusClass(caseItem.status)" class="px-3 py-1.5 text-xs rounded-lg font-bold shadow-sm">
                        {{ getStatusLabel(caseItem.status) }}
                      </span>
                      <span :class="getPriorityClass(caseItem.priority)" class="px-3 py-1.5 text-xs rounded-lg font-bold shadow-sm">
                        {{ getPriorityLabel(caseItem.priority) }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-sm text-gray-500 font-medium">
                      {{ formatDate(caseItem.created_at || caseItem.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'appointments'">
            <div v-if="loadingAppointments" class="text-center py-12">
              <div class="relative inline-flex">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-purple-600 absolute top-0"></div>
              </div>
              <p class="text-gray-600 mt-4 font-medium">Chargement des rendez-vous...</p>
            </div>
            <div v-else-if="appointments.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-gray-500 text-lg">Aucun rendez-vous</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="appointment in appointments"
                :key="appointment.id"
                class="border-2 border-gray-100 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-purple-50/30"
              >
                <h3 class="font-bold text-gray-900 text-lg">{{ appointment.title }}</h3>
                <p class="text-sm text-gray-600 mt-2 flex items-center gap-2 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(appointment.startTime) }} • {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
                </p>
                <span class="inline-block mt-3 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold shadow-sm">
                  {{ appointment.status }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'documents'">
            <div v-if="loadingDocuments" class="text-center py-12">
              <div class="relative inline-flex">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-orange-600 absolute top-0"></div>
              </div>
              <p class="text-gray-600 mt-4 font-medium">Chargement des documents...</p>
            </div>
            <div v-else-if="documents.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="text-gray-500 text-lg">Aucun document</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="document in documents"
                :key="document.id"
                class="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-orange-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-orange-50/30"
              >
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-sm">{{ document.fileName }}</p>
                    <p class="text-xs text-gray-500 font-medium mt-1">{{ document.caseTitle }} • {{ formatDate(document.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isEditing" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-white/20 p-8 max-w-2xl w-full mx-4 transform transition-all">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Modifier le client</h2>
            <p class="text-gray-600 mt-1">Fonctionnalité en cours de développement</p>
          </div>
        </div>
        <div class="bg-blue-50/50 border-l-4 border-blue-600 p-4 rounded-lg mb-6">
          <p class="text-sm text-blue-800 font-medium">Cette fonctionnalité sera bientôt disponible.</p>
        </div>
        <button
          class="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          @click="isEditing = false"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

