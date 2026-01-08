<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'client'],
  layout: 'authenticated',
});

const authStore = useAuthStore();
const { apiFetch } = useApi();
const toast = useToast();
const confirmModal = useConfirm();

const requests = ref<any[]>([]);
const loading = ref(true);
const showRequestForm = ref(false);
const editingRequest = ref<any>(null);

const stats = computed(() => {
  const total = requests.value.length;
  const pending = requests.value.filter(r => r.status === 'pending').length;
  const accepted = requests.value.filter(r => r.status === 'accepted').length;
  const rejected = requests.value.filter(r => r.status === 'rejected').length;
  return { total, pending, accepted, rejected };
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

const handleEdit = (request: any) => {
  editingRequest.value = request;
  showRequestForm.value = true;
};

const closeForm = () => {
  showRequestForm.value = false;
  editingRequest.value = null;
};

const handleRequestSuccess = () => {
  closeForm();
  loadRequests();
};

const cancelRequest = async (id: string) => {
  const confirmed = await confirmModal.confirm({
    title: 'Annuler la demande',
    message: 'Êtes-vous sûr de vouloir annuler cette demande ?',
    confirmText: 'Annuler la demande',
    cancelText: 'Retour',
  });

  if (!confirmed) return;

  try {
    await apiFetch(`/clients-extended/requests/${id}/cancel`, { method: 'PUT' });
    toast.success('Demande annulée');
    loadRequests();
  } catch (error) {
    console.error('Error canceling request:', error);
    toast.error('Erreur lors de l\'annulation');
  }
};

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

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Mes demandes d'avocat
              </h1>
              <p class="text-gray-600 mt-1">Suivez l'état de vos demandes envoyées aux avocats</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-600 uppercase">Total</p>
              <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-600 uppercase">En attente</p>
              <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">{{ stats.pending }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-600 uppercase">Acceptées</p>
              <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{{ stats.accepted }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-600 uppercase">Rejetées</p>
              <p class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">{{ stats.rejected }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showRequestForm" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white/95 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-indigo-600">
            <h2 class="text-2xl font-bold text-white">
              {{ editingRequest ? 'Modifier la demande' : 'Nouvelle demande' }}
            </h2>
          </div>
          <div class="p-6">
            <ClientsClientRequestForm
              :initial-data="editingRequest"
              @success="handleRequestSuccess"
              @cancel="closeForm"
            />
          </div>
        </div>
      </div>

      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div v-if="loading" class="text-center py-16">
          <div class="relative inline-flex">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0"></div>
          </div>
          <p class="text-gray-600 mt-4 font-medium">Chargement des demandes...</p>
        </div>

        <div v-else-if="requests.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Aucune demande</h3>
          <p class="text-gray-500 mt-2">Commencez par créer une nouvelle demande</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="request in requests"
            :key="request.id"
            class="p-6 hover:bg-blue-50/50 transition-all"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3 flex-wrap">
                  <h3 class="text-lg font-bold text-gray-900">{{ request.title }}</h3>
                  <span
                    class="px-3 py-1.5 text-xs font-bold uppercase rounded-lg shadow-sm"
                    :class="getStatusClass(request.status)"
                  >
                    {{ getStatusLabel(request.status) }}
                  </span>
                  <span
                    class="px-3 py-1.5 text-xs font-bold uppercase rounded-lg shadow-sm"
                    :class="getUrgencyClass(request.urgency)"
                  >
                    {{ getUrgencyLabel(request.urgency) }}
                  </span>
                </div>

                <p class="text-sm text-gray-600 mb-4 leading-relaxed">{{ request.description }}</p>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold text-gray-500">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="text-gray-900">{{ getRequestTypeLabel(request.request_type) }}</span>
                  </div>
                  <div v-if="request.case_category" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span class="text-gray-900">{{ request.case_category }}</span>
                  </div>
                  <div v-if="request.budget_min" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-gray-900">{{ request.budget_min }}€ - {{ request.budget_max }}€</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-gray-900">{{ formatDate(request.created_at) }}</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2 min-w-[120px]">
                <button
                  v-if="request.status === 'pending'"
                  @click="handleEdit(request)"
                  class="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Modifier
                </button>
                <button
                  v-if="request.status === 'pending'"
                  @click="cancelRequest(request.id)"
                  class="w-full px-4 py-2 border-2 border-red-200 text-red-600 text-xs font-bold uppercase rounded-lg hover:bg-red-50 transition-all"
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

