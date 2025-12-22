<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Demandes</h1>
          <p class="text-gray-600 mt-2">Suivez vos demandes aux avocats</p>
        </div>
        <button
          @click="showRequestForm = true"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle demande
        </button>
      </div>

      <div v-if="showRequestForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <ClientRequestForm @success="handleRequestSuccess" @cancel="showRequestForm = false" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Total</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">En attente</p>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Acceptées</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.accepted }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Rejetées</p>
          <p class="text-3xl font-bold text-red-600">{{ stats.rejected }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="requests.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
          <p class="mt-1 text-sm text-gray-500">Commencez par créer une nouvelle demande</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="request in requests"
            :key="request.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ request.title }}</h3>
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusClass(request.status)"
                  >
                    {{ getStatusLabel(request.status) }}
                  </span>
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getUrgencyClass(request.urgency)"
                  >
                    {{ getUrgencyLabel(request.urgency) }}
                  </span>
                </div>

                <p class="text-sm text-gray-600 mb-3">{{ request.description }}</p>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Type:</span>
                    <span class="ml-1 font-medium">{{ getRequestTypeLabel(request.request_type) }}</span>
                  </div>
                  <div v-if="request.case_category">
                    <span class="text-gray-500">Catégorie:</span>
                    <span class="ml-1 font-medium">{{ request.case_category }}</span>
                  </div>
                  <div v-if="request.budget_min || request.budget_max">
                    <span class="text-gray-500">Budget:</span>
                    <span class="ml-1 font-medium">
                      {{ request.budget_min ? `${request.budget_min}€` : '?' }} -
                      {{ request.budget_max ? `${request.budget_max}€` : '?' }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500">Date:</span>
                    <span class="ml-1 font-medium">{{ formatDate(request.created_at) }}</span>
                  </div>
                </div>

                <div v-if="request.lawyer_first_name" class="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p class="text-sm text-gray-700">
                    <span class="font-medium">Avocat:</span>
                    {{ request.lawyer_first_name }} {{ request.lawyer_last_name }}
                    <span class="text-gray-500">({{ request.lawyer_email }})</span>
                  </p>
                </div>

                <div v-if="request.lawyer_response" class="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm font-medium text-gray-700 mb-1">Réponse de l'avocat:</p>
                  <p class="text-sm text-gray-600">{{ request.lawyer_response }}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ formatDate(request.responded_at) }}
                  </p>
                </div>
              </div>

              <div class="ml-4">
                <button
                  v-if="request.status === 'pending'"
                  @click="cancelRequest(request.id)"
                  class="text-red-600 hover:text-red-700 text-sm font-medium"
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
import ClientRequestForm from '~/components/clients/ClientRequestForm.vue';

definePageMeta({
  middleware: ['auth', 'client'],
  layout: 'authenticated',
});

const authStore = useAuthStore();
const { apiFetch } = useApi();

const requests = ref<any[]>([]);
const loading = ref(true);
const showRequestForm = ref(false);

const stats = computed(() => {
  return {
    total: requests.value.length,
    pending: requests.value.filter(r => r.status === 'pending' || r.status === 'viewed').length,
    accepted: requests.value.filter(r => r.status === 'accepted' || r.status === 'completed').length,
    rejected: requests.value.filter(r => r.status === 'rejected' || r.status === 'cancelled').length,
  };
});

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

const handleRequestSuccess = () => {
  showRequestForm.value = false;
  loadRequests();
};

const cancelRequest = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;

  try {
    await apiFetch(`/clients-extended/requests/${id}`, {
      method: 'DELETE',
    });
    loadRequests();
  } catch (error) {
    console.error('Error cancelling request:', error);
    alert('Erreur lors de l\'annulation de la demande');
  }
};

const formatDate = (date: Date) => {
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