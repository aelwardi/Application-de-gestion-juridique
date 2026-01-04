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
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Demandes</h1>
          <p class="text-gray-600 mt-2">Suivez vos demandes aux avocats</p>
        </div>
      </div>

      <div v-if="showRequestForm" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="p-6">
            <ClientRequestForm
              :initial-data="editingRequest"
              @success="handleRequestSuccess"
              @cancel="closeForm"
            />
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
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Total</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">En attente</p>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Acceptées</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.accepted }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest">Rejetées</p>
          <p class="text-3xl font-bold text-red-600">{{ stats.rejected }}</p>
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
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="requests.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
          <p class="mt-1 text-sm text-gray-500 text-[10px] uppercase font-bold">Commencez par créer une nouvelle demande</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="request in requests"
            :key="request.id"
            class="p-6 hover:bg-gray-50/50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-gray-900 uppercase italic">{{ request.title }}</h3>
                  <span
                    class="px-2 py-0.5 text-[10px] font-black uppercase rounded-full"
                    :class="getStatusClass(request.status)"
                  >
                    {{ getStatusLabel(request.status) }}
                  </span>
                  <span
                    class="px-2 py-0.5 text-[10px] font-black uppercase rounded-full"
                    :class="getUrgencyClass(request.urgency)"
                  >
                    {{ getUrgencyLabel(request.urgency) }}
                  </span>
                </div>

                <p class="text-sm text-gray-600 mb-4">{{ request.description }}</p>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] uppercase font-bold text-gray-500">
                  <div>TYPE: <span class="text-gray-900">{{ getRequestTypeLabel(request.request_type) }}</span></div>
                  <div v-if="request.case_category">CATÉGORIE: <span class="text-gray-900">{{ request.case_category }}</span></div>
                  <div v-if="request.budget_min">BUDGET: <span class="text-gray-900">{{ request.budget_min }}€ - {{ request.budget_max }}€</span></div>
                  <div>SOUMIS LE: <span class="text-gray-900">{{ formatDate(request.created_at) }}</span></div>
                </div>


              </div>

              <div class="flex flex-col gap-2 min-w-[120px]">
                <button
                  v-if="request.status === 'pending'"
                  @click="handleEdit(request)"
                  class="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-black uppercase rounded-lg transition"
                >
                  Modifier
                </button>
                <button
                  v-if="request.status === 'pending'"
                  @click="cancelRequest(request.id)"
                  class="w-full py-2 text-red-600 hover:bg-red-50 text-[10px] font-black uppercase rounded-lg transition border border-red-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LawyerRequest, LawyerRequestStats } from '~/types/lawyer';
import { ref, computed, onMounted } from 'vue';
import ClientRequestForm from '~/components/clients/ClientRequestForm.vue';

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
const requests = ref<any[]>([]);
const loading = ref(true);
const showRequestForm = ref(false);
const editingRequest = ref<any>(null); // Pour stocker la demande à modifier

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
const loadRequests = async () => {
  if (!authStore.user) return;
  try {
    loading.value = true;
    const response = await apiFetch(`/clients-extended/requests/client/${authStore.user.id}`) as any;
    requests.value = response.data;
  } catch (error) {
    console.error('Error loading requests:', error);
  } finally {
    loading.value = false;
  }
};

const handleCancel = async (requestId: string) => {
const handleEdit = (request: any) => {
  editingRequest.value = request; // On définit la demande à modifier
  showRequestForm.value = true;   // On ouvre la modale
};

const closeForm = () => {
  showRequestForm.value = false;
  editingRequest.value = null; // Important : on vide l'état pour la prochaine ouverture
};

const handleRequestSuccess = () => {
  closeForm();
  loadRequests();
};

const cancelRequest = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;
  try {
    await cancelRequest(requestId);
    await loadData();
  } catch (error) {
    alert('Erreur lors de l\'annulation');
  }
};

const handleView = (request: LawyerRequest) => {
  navigateTo(`/clients/requests/${request.id}`);
const formatDate = (date: any) => {
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
    viewed: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    completed: 'bg-purple-100 text-purple-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    viewed: 'Vue',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
    cancelled: 'Annulée',
    completed: 'Complétée',
  };
  return labels[status] || status;
};

const getUrgencyClass = (urgency: string) => {
  const classes: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600',
  };
  return classes[urgency] || 'bg-gray-100 text-gray-600';
};

const getUrgencyLabel = (urgency: string) => {
  const labels: Record<string, string> = {
    low: 'Faible',
    normal: 'Normal',
    high: 'Élevé',
    urgent: 'Urgent',
  };
  return labels[urgency] || urgency;
};

const getRequestTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    consultation: 'Consultation',
    new_case: 'Nouveau dossier',
    second_opinion: 'Second avis',
    urgent: 'Urgent',
  };
  return labels[type] || type;
};

onMounted(() => {
  loadRequests();
});
</script>