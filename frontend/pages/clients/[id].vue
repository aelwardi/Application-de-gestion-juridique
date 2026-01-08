<script setup lang="ts">
import type { Client, ClientStats } from '~/types/client';

definePageMeta({
  middleware: ['auth', 'lawyer'],
  layout: 'authenticated',
});

const route = useRoute();
const { getClientById, getClientStats, getClientCases, getClientAppointments, getClientDocuments } = useClient();
const toast = useToast();

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
  <div class="min-h-screen bg-gray-50">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="!client" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900">Client non trouvé</h2>
        <NuxtLink to="/clients" class="mt-4 text-blue-600 hover:text-blue-700">
          Retour à la liste des clients
        </NuxtLink>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <button
          class="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          @click="navigateTo('/clients')"
        >
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <div
              v-if="client.profilePictureUrl"
              class="h-20 w-20 rounded-full bg-gray-200 mr-6"
              :style="`background-image: url('${client.profilePictureUrl}')`"
            ></div>
            <div
              v-else
              class="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold mr-6"
            >
              {{ getInitials(client.firstName, client.lastName) }}
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                {{ client.firstName }} {{ client.lastName }}
              </h1>
              <p class="text-gray-600 mt-1">{{ client.email }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span
                  v-if="client.isActive"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Actif
                </span>
                <span
                  v-if="client.isVerified"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Vérifié
                </span>
              </div>
            </div>
          </div>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            @click="isEditing = true"
          >
            Modifier
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Dossiers Actifs</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats?.activeCases || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Total Dossiers</p>
          <p class="text-3xl font-bold text-green-600">{{ stats?.totalCases || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Rendez-vous à Venir</p>
          <p class="text-3xl font-bold text-purple-600">{{ stats?.upcomingAppointments || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Documents</p>
          <p class="text-3xl font-bold text-orange-600">{{ stats?.totalDocuments || 0 }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="p-6">
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
            <div v-if="loadingCases" class="text-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <div v-else-if="cases.length === 0" class="text-center py-8 text-gray-500">
              Aucun dossier
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="caseItem in cases"
                :key="caseItem.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                @click="navigateTo(`/cases/${caseItem.id}`)"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ caseItem.title }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ caseItem.case_number || caseItem.caseNumber }}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <span :class="getStatusClass(caseItem.status)" class="px-2 py-1 text-xs rounded-full font-medium">
                        {{ getStatusLabel(caseItem.status) }}
                      </span>
                      <span :class="getPriorityClass(caseItem.priority)" class="px-2 py-1 text-xs rounded-full font-medium">
                        {{ getPriorityLabel(caseItem.priority) }}
                      </span>
                    </div>
                  </div>
                  <span class="text-sm text-gray-500">
                    {{ formatDate(caseItem.created_at || caseItem.createdAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'appointments'">
            <div v-if="loadingAppointments" class="text-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <div v-else-if="appointments.length === 0" class="text-center py-8 text-gray-500">
              Aucun rendez-vous
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="appointment in appointments"
                :key="appointment.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <h3 class="font-semibold text-gray-900">{{ appointment.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  {{ formatDate(appointment.startTime) }} • {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
                </p>
                <span class="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {{ appointment.status }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'documents'">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isEditing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 class="text-2xl font-bold mb-4">Modifier le client</h2>
        <p class="text-gray-600 mb-4">Fonctionnalité en cours de développement</p>
        <button
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          @click="isEditing = false"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

