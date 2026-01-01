<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Mes demandes d'avocat</h1>
        <p class="mt-2 text-sm text-gray-600">
          Suivez l'état de vos demandes envoyées aux avocats
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total || 0 }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">En attente</p>
              <p class="text-2xl font-bold text-orange-600">{{ stats.pending || 0 }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Acceptées</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.accepted || 0 }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Rejetées</p>
              <p class="text-2xl font-bold text-red-600">{{ stats.rejected || 0 }}</p>
            </div>
            <div class="p-3 bg-red-100 rounded-full">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Filtrer par statut:</label>
          <div class="flex gap-2">
            <button
              v-for="status in statusOptions"
              :key="status.value"
              @click="filterStatus = status.value"
              class="px-4 py-2 rounded-md text-sm font-medium transition"
              :class="filterStatus === status.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              {{ status.label }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Chargement de vos demandes...</p>
      </div>

      <div v-else-if="filteredRequests.length > 0" class="space-y-4">
        <ClientRequestCard
          v-for="request in filteredRequests"
          :key="request.id"
          :request="request"
          @cancel="handleCancel"
          @view="handleView"
        />
      </div>

      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Aucune demande</h3>
        <p class="mt-1 text-sm text-gray-500">
          Vous n'avez pas encore envoyé de demande aux avocats
        </p>
        <div class="mt-6">
          <NuxtLink
            to="/lawyers"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Trouver un avocat
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LawyerRequest, LawyerRequestStats } from '~/types/lawyer';

definePageMeta({
  middleware: ['auth', 'client'],
  layout: 'authenticated',
});

const { getClientRequests, getClientRequestStats, cancelRequest } = useLawyer();
const authStore = useAuthStore();

const requests = ref<LawyerRequest[]>([]);
const stats = ref<LawyerRequestStats>({
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0,
  cancelled: 0,
});
const loading = ref(false);
const filterStatus = ref('all');

const statusOptions = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'rejected', label: 'Rejetées' },
  { value: 'cancelled', label: 'Annulées' },
];

const filteredRequests = computed(() => {
  if (filterStatus.value === 'all') return requests.value;
  return requests.value.filter(req => req.status === filterStatus.value);
});

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  if (!authStore.user?.id) return;

  loading.value = true;
  try {
    const [requestsData, statsData] = await Promise.all([
      getClientRequests(authStore.user.id),
      getClientRequestStats(authStore.user.id),
    ]);

    requests.value = requestsData.data;
    stats.value = statsData;
  } catch (error) {
    console.error('Error loading requests:', error);
  } finally {
    loading.value = false;
  }
};

const handleCancel = async (requestId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;

  try {
    await cancelRequest(requestId);
    await loadData();
  } catch (error) {
    console.error('Error cancelling request:', error);
    alert('Erreur lors de l\'annulation de la demande');
  }
};

const handleView = (request: LawyerRequest) => {
  navigateTo(`/clients/requests/${request.id}`);
};
</script>