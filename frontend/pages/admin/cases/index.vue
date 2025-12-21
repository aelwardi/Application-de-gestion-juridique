<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Dossiers</h1>
        <p class="mt-1 text-sm text-gray-500">{{ pagination.total }} dossiers au total</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg p-5">
          <div class="text-sm font-medium text-gray-500">Total</div>
          <div class="text-2xl font-semibold text-gray-900">{{ stats?.total || 0 }}</div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg p-5">
          <div class="text-sm font-medium text-gray-500">En attente</div>
          <div class="text-2xl font-semibold text-yellow-600">{{ stats?.pending || 0 }}</div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg p-5">
          <div class="text-sm font-medium text-gray-500">En cours</div>
          <div class="text-2xl font-semibold text-blue-600">{{ stats?.in_progress || 0 }}</div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg p-5">
          <div class="text-sm font-medium text-gray-500">Résolus</div>
          <div class="text-2xl font-semibold text-green-600">{{ stats?.resolved || 0 }}</div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              v-model="filters.status"
              @change="fetchCases"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolus</option>
              <option value="closed">Fermés</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
            <select
              v-model="filters.priority"
              @change="fetchCases"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Dossier</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avocat</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="caseItem in cases" :key="caseItem.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ caseItem.case_number }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ caseItem.title }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ caseItem.client_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ caseItem.lawyer_name || 'Non assigné' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(caseItem.status)">
                  {{ getStatusLabel(caseItem.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getPriorityClass(caseItem.priority)">
                  {{ getPriorityLabel(caseItem.priority) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="cases.length === 0" class="text-center py-12">
          <p class="text-gray-500">Aucun dossier trouvé</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
});

const { apiFetch } = useApi();
const cases = ref<any[]>([]);
const stats = ref<any>(null);

const filters = ref({
  status: '',
  priority: '',
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const fetchCases = async () => {
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.priority && { priority: filters.value.priority }),
    });

    const response = await apiFetch<any>(`/admin/cases?${params}`, { method: 'GET' });
    if (response.success) {
      cases.value = response.data;
      pagination.value = { ...pagination.value, ...response.pagination };
    }
  } catch (error) {
    console.error('Failed to fetch cases:', error);
  }
};

const fetchStats = async () => {
  try {
    const response = await apiFetch<any>('/admin/stats/comprehensive', { method: 'GET' });
    if (response.success) {
      stats.value = response.data.cases;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};

const resetFilters = () => {
  filters.value = { status: '', priority: '' };
  pagination.value.page = 1;
  fetchCases();
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    resolved: 'Résolu',
    closed: 'Fermé',
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente',
  };
  return labels[priority] || priority;
};

onMounted(() => {
  fetchCases();
  fetchStats();
});
</script>