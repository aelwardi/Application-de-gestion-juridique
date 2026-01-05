<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Dossiers</h1>
          <p class="text-gray-600 mt-2">
            {{ authStore.user?.role === 'avocat' ? 'Dossiers regroupés par client' : 'Dossiers regroupés par avocat' }}
          </p>
        </div>
        <button
          v-if="authStore.user?.role === 'avocat'"
          @click="showCreateModal = true"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau dossier
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Client ou dossier..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="loadCases"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="on_hold">En pause</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
            <select
              v-model="filters.priority"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="loadCases"
            >
              <option value="">Toutes</option>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Total Dossiers</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">{{ authStore.user?.role === 'avocat' ? 'Clients' : 'Avocats' }}</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats.clients }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">En cours</p>
          <p class="text-3xl font-bold text-indigo-600">{{ stats.inProgress }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Fermés</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.closed }}</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>

      <div v-else-if="Object.keys(clientGroups).length === 0" class="bg-white rounded-lg shadow text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun dossier</h3>
        <p class="mt-1 text-sm text-gray-500">Commencez par créer un nouveau dossier</p>
      </div>

      <!-- Regroupement par client -->
      <div v-else class="space-y-6">
        <div
          v-for="(group, clientId) in clientGroups"
          :key="clientId"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <!-- En-tête du client/avocat -->
          <div
            @click="toggleClient(clientId)"
            class="p-6 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
            :class="group.isLawyer ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  :class="group.isLawyer ? 'bg-blue-600' : 'bg-green-600'"
                >
                  {{ getInitials(group.clientName) }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-bold text-gray-900">{{ group.clientName }}</h3>
                    <span
                      v-if="!group.isLawyer"
                      class="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800"
                    >
                      Avocat
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">{{ group.clientEmail }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <button
                  @click.stop="contactPerson(clientId, group.clientName)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contacter
                </button>
                <div class="text-right">
                  <p
                    class="text-2xl font-bold"
                    :class="group.isLawyer ? 'text-blue-600' : 'text-green-600'"
                  >
                    {{ group.cases.length }}
                  </p>
                  <p class="text-sm text-gray-600">{{ group.cases.length === 1 ? 'dossier' : 'dossiers' }}</p>
                </div>
                <svg
                  class="w-6 h-6 text-gray-400 transition-transform"
                  :class="{ 'rotate-180': expandedClients.has(clientId) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Liste des dossiers du client -->
          <div v-if="expandedClients.has(clientId)" class="divide-y divide-gray-200">
            <div
              v-for="caseItem in group.cases"
              :key="caseItem.id"
              class="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              @click="navigateTo(`/cases/${caseItem.id}`)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h4 class="text-lg font-semibold text-gray-900">{{ caseItem.title }}</h4>
                    <span
                      class="px-2 py-1 text-xs rounded-full"
                      :class="getStatusClass(caseItem.status)"
                    >
                      {{ getStatusLabel(caseItem.status) }}
                    </span>
                    <span
                      class="px-2 py-1 text-xs rounded-full"
                      :class="getPriorityClass(caseItem.priority)"
                    >
                      {{ getPriorityLabel(caseItem.priority) }}
                    </span>
                  </div>

                  <p class="text-sm text-gray-600 mb-3">{{ caseItem.description }}</p>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">Numéro:</span>
                      <span class="ml-1 font-medium">{{ caseItem.case_number }}</span>
                    </div>
                    <div v-if="caseItem.case_type">
                      <span class="text-gray-500">Type:</span>
                      <span class="ml-1 font-medium">{{ caseItem.case_type }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Créé le:</span>
                      <span class="ml-1 font-medium">{{ formatDate(caseItem.created_at) }}</span>
                    </div>
                    <div v-if="caseItem.next_hearing_date">
                      <span class="text-gray-500">Prochaine audience:</span>
                      <span class="ml-1 font-medium">{{ formatDate(caseItem.next_hearing_date) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 class="text-2xl font-bold mb-4">Nouveau Dossier</h2>
        <p class="text-gray-600">Fonctionnalité en cours de développement...</p>
        <button
          @click="showCreateModal = false"
          class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const authStore = useAuthStore();
const { getAllCases } = useCase();

const cases = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const expandedClients = ref<Set<string>>(new Set());

const filters = ref({
  search: '',
  status: '',
  priority: '',
});

const clientGroups = computed(() => {
  const groups: Record<string, any> = {};

  // Déterminer si on groupe par client (avocat) ou par avocat (client)
  const isLawyer = authStore.user?.role === 'avocat';

  cases.value.forEach(caseItem => {
    let groupId: string;
    let groupName: string;
    let groupEmail: string;

    if (isLawyer) {
      // Avocat : grouper par client
      groupId = caseItem.client_id;
      groupName = `${caseItem.client_first_name || ''} ${caseItem.client_last_name || ''}`.trim() || 'Client inconnu';
      groupEmail = caseItem.client_email || '';
    } else {
      // Client : grouper par avocat
      groupId = caseItem.lawyer_id || 'no-lawyer';
      groupName = `${caseItem.lawyer_first_name || ''} ${caseItem.lawyer_last_name || ''}`.trim() || 'Avocat non assigné';
      groupEmail = caseItem.lawyer_email || '';
    }

    if (!groups[groupId]) {
      groups[groupId] = {
        clientName: groupName,
        clientEmail: groupEmail,
        isLawyer,
        cases: []
      };
    }

    groups[groupId].cases.push(caseItem);
  });

  return groups;
});

const stats = computed(() => {
  return {
    total: cases.value.length,
    clients: Object.keys(clientGroups.value).length,
    inProgress: cases.value.filter(c => c.status === 'in_progress').length,
    closed: cases.value.filter(c => c.status === 'closed').length,
  };
});

let searchTimeout: any;

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadCases();
  }, 500);
};

const loadCases = async () => {
  if (!authStore.user) return;

  try {
    loading.value = true;

    const apiFilters: any = {};

    if (filters.value.status) apiFilters.status = filters.value.status;
    if (filters.value.priority) apiFilters.priority = filters.value.priority;
    if (filters.value.search) apiFilters.search = filters.value.search;

    if (authStore.user.role === 'avocat') {
      apiFilters.lawyer_id = authStore.user.id;
    } else if (authStore.user.role === 'client') {
      apiFilters.client_id = authStore.user.id;
    }

    const response = await getAllCases(apiFilters);

    if (response.success && response.data) {
      cases.value = response.data;
    }
  } catch (error) {
    console.error('Error loading cases:', error);
    cases.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleClient = (clientId: string) => {
  if (expandedClients.value.has(clientId)) {
    expandedClients.value.delete(clientId);
  } else {
    expandedClients.value.add(clientId);
  }
};

const contactPerson = (personId: string, personName: string) => {
  // Rediriger vers la page messages avec l'ID de la personne à contacter
  navigateTo(`/messages?recipientId=${personId}&recipientName=${encodeURIComponent(personName)}`);
};

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(p => p);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]?.substring(0, 2).toUpperCase() || '?';
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || '?';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    on_hold: 'bg-gray-100 text-gray-800',
    closed: 'bg-green-100 text-green-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    on_hold: 'En pause',
    closed: 'Fermé',
  };
  return labels[status] || status;
};

const getPriorityClass = (priority: string) => {
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

onMounted(() => {
  loadCases();
});

onBeforeUnmount(() => {
  clearTimeout(searchTimeout);
});
</script>