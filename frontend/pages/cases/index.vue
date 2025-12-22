<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Dossiers</h1>
          <p class="text-gray-600 mt-2">Gérez vos dossiers juridiques</p>
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Titre ou numéro..."
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
              <option value="accepted">Accepté</option>
              <option value="in_progress">En cours</option>
              <option value="on_hold">En pause</option>
              <option value="resolved">Résolu</option>
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              v-model="filters.category"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="loadCases"
            >
              <option value="">Toutes</option>
              <option value="Droit pénal">Droit pénal</option>
              <option value="Droit civil">Droit civil</option>
              <option value="Droit de la famille">Droit de la famille</option>
              <option value="Droit du travail">Droit du travail</option>
              <option value="Droit commercial">Droit commercial</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Total</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">En cours</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats.inProgress }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">En attente</p>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Résolus</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.resolved }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="cases.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun dossier</h3>
          <p class="mt-1 text-sm text-gray-500">Commencez par créer un nouveau dossier</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="caseItem in cases"
            :key="caseItem.id"
            class="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="navigateTo(`/cases/${caseItem.id}`)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ caseItem.title }}</h3>
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
                    {{ caseItem.priority }}
                  </span>
                </div>

                <p class="text-sm text-gray-600 mb-3">{{ caseItem.description }}</p>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Numéro:</span>
                    <span class="ml-1 font-medium">{{ caseItem.case_number }}</span>
                  </div>
                  <div v-if="caseItem.category">
                    <span class="text-gray-500">Catégorie:</span>
                    <span class="ml-1 font-medium">{{ caseItem.category }}</span>
                  </div>
                  <div v-if="caseItem.court_reference">
                    <span class="text-gray-500">Référence tribunal:</span>
                    <span class="ml-1 font-medium">{{ caseItem.court_reference }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Créé le:</span>
                    <span class="ml-1 font-medium">{{ formatDate(caseItem.created_at) }}</span>
                  </div>
                </div>

                <div v-if="caseItem.next_hearing_date" class="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p class="text-sm text-gray-700">
                    <span class="font-medium">Prochaine audience:</span>
                    {{ formatDateTime(caseItem.next_hearing_date) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Affichage de {{ (pagination.page - 1) * pagination.limit + 1 }} à
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} sur
              {{ pagination.total }} dossiers
            </div>
            <div class="flex gap-2">
              <button
                :disabled="pagination.page === 1"
                @click="changePage(pagination.page - 1)"
                class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                :disabled="pagination.page === pagination.totalPages"
                @click="changePage(pagination.page + 1)"
                class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
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
const { apiFetch } = useApi();

const cases = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);

const filters = ref({
  search: '',
  status: '',
  priority: '',
  category: '',
});

const pagination = ref({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
});

const stats = computed(() => {
  return {
    total: cases.value.length,
    inProgress: cases.value.filter(c => c.status === 'in_progress').length,
    pending: cases.value.filter(c => c.status === 'pending' || c.status === 'accepted').length,
    resolved: cases.value.filter(c => c.status === 'resolved' || c.status === 'closed').length,
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

    cases.value = [
      {
        id: '1',
        case_number: 'CASE-2025-001',
        title: 'Divorce à l\'amiable',
        description: 'Procédure de divorce par consentement mutuel',
        category: 'Droit de la famille',
        status: 'in_progress',
        priority: 'high',
        court_reference: 'TGI-2025-123',
        next_hearing_date: new Date('2025-12-30T10:00:00'),
        created_at: new Date('2025-11-15'),
      },
      {
        id: '2',
        case_number: 'CASE-2025-002',
        title: 'Litige commercial',
        description: 'Contentieux avec fournisseur',
        category: 'Droit commercial',
        status: 'pending',
        priority: 'medium',
        created_at: new Date('2025-12-01'),
      },
    ];

    pagination.value.total = cases.value.length;
  } catch (error) {
    console.error('Error loading cases:', error);
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadCases();
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusClass = (status: string) => {
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

const getStatusLabel = (status: string) => {
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

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  loadCases();
});

onBeforeUnmount(() => {
  clearTimeout(searchTimeout);
});
</script>