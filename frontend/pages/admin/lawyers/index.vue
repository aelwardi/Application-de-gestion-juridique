<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
});

interface Lawyer {
  id: string;
  email: string;
  role: 'avocat';
  firstName?: string;
  lastName?: string;
  barNumber: string | null;
  specialties: string[];
  officeCity: string | null;
  verifiedByAdmin: boolean;
  rating?: number;
  totalCases?: number;
}

const { apiFetch } = useApi();
const toast = useToast();
const confirmModal = useConfirm();
const lawyers = ref<Lawyer[]>([]);
const specialties = ref<any[]>([]);
const stats = ref<any>(null);

const filters = ref({
  verified: '',
  city: '',
  specialty: '',
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const fetchLawyers = async () => {
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...(filters.value.verified && { verified: filters.value.verified }),
      ...(filters.value.city && { city: filters.value.city }),
      ...(filters.value.specialty && { specialty: filters.value.specialty }),
    });

    const response = await apiFetch<any>(`/admin/lawyers?${params}`, { method: 'GET' });

    if (response.success) {
      lawyers.value = response.data;
      pagination.value = { ...pagination.value, ...response.pagination };
    }
  } catch (error) {
    console.error('Failed to fetch lawyers:', error);
  }
};

const fetchSpecialties = async () => {
  try {
    const response = await apiFetch<any>('/admin/specialties', { method: 'GET' });

    if (response.success) {
      specialties.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch specialties:', error);
  }
};

const fetchStats = async () => {
  try {
    const response = await apiFetch<any>('/admin/stats/comprehensive', { method: 'GET' });

    if (response.success) {
      stats.value = response.data.lawyers;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
};

let searchTimeout: NodeJS.Timeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchLawyers();
  }, 500);
};

const resetFilters = () => {
  filters.value = { verified: '', city: '', specialty: '' };
  pagination.value.page = 1;
  fetchLawyers();
};

const verifyLawyer = async (lawyer: Lawyer) => {
  const confirmed = await confirmModal.confirm({
    title: 'Vérifier l\'avocat',
    message: `Voulez-vous vérifier l'avocat ${lawyer.firstName} ${lawyer.lastName} ?`,
    confirmText: 'Vérifier',
    cancelText: 'Annuler',
    type: 'info'
  });

  if (!confirmed) return;

  try {
    const response = await apiFetch(`/admin/lawyers/${lawyer.id}/verify`, { method: 'PATCH' });

    if (response.success) {
      lawyer.verifiedByAdmin = true;
      toast.success('Avocat vérifié avec succès');
      fetchStats();
    }
  } catch (error) {
    console.error('Failed to verify lawyer:', error);
    toast.error('Erreur lors de la vérification');
  }
};

onMounted(() => {
  fetchLawyers();
  fetchSpecialties();
  fetchStats();
});
</script>



<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Avocats</h1>
        <p class="mt-1 text-sm text-gray-500">{{ pagination.total }} avocats inscrits</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div class="bg-white overflow-hidden shadow rounded-lg p-5">
          <div class="text-sm font-medium text-gray-500">Total Avocats</div>
          <div class="text-2xl font-semibold text-gray-900">{{ stats?.total || 0 }}</div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg p-5">
          <div class="text-sm font-medium text-gray-500">Vérifiés</div>
          <div class="text-2xl font-semibold text-green-600">{{ stats?.verified || 0 }}</div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg p-5">
          <div class="text-sm font-medium text-gray-500">En attente</div>
          <div class="text-2xl font-semibold text-yellow-600">{{ stats?.pending_verification || 0 }}</div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              v-model="filters.verified"
              @change="fetchLawyers"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="true">Vérifiés</option>
              <option value="false">Non vérifiés</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ville</label>
            <input
              v-model="filters.city"
              @input="debouncedSearch"
              type="text"
              placeholder="Paris, Lyon..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
            <select
              v-model="filters.specialty"
              @change="fetchLawyers"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option v-for="spec in specialties" :key="spec.id" :value="spec.name">
                {{ spec.icon }} {{ spec.name }}
              </option>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avocat</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barreau</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialités</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="lawyer in lawyers" :key="lawyer.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-medium text-sm">
                        {{ lawyer.firstName?.charAt(0) }}{{ lawyer.lastName?.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ lawyer.firstName }} {{ lawyer.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ lawyer.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ lawyer.barNumber || 'N/A' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="specialty in (lawyer.specialties || []).slice(0, 2)"
                    :key="specialty"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
                  >
                    {{ specialty }}
                  </span>
                  <span v-if="(lawyer.specialties || []).length > 2" class="px-2 py-1 text-xs text-gray-500">
                    +{{ (lawyer.specialties || []).length - 2 }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ lawyer.officeCity || 'Non renseigné' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  v-if="lawyer.verifiedByAdmin"
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                >
                  ✓ Vérifié
                </span>
                <span
                  v-else
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"
                >
                  En attente
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    v-if="!lawyer.verifiedByAdmin"
                    @click="verifyLawyer(lawyer)"
                    class="text-green-600 hover:text-green-900"
                    title="Vérifier"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <NuxtLink
                    :to="`/admin/users?search=${lawyer.email}`"
                    class="text-blue-600 hover:text-blue-900"
                    title="Voir profil"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="lawyers.length === 0" class="text-center py-12">
          <p class="text-gray-500">Aucun avocat trouvé</p>
        </div>
      </div>
    </div>
  </div>
</template>

