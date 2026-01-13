
<script setup lang="ts">
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/vue/24/outline';

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
});

const { apiFetch } = useApi();
const toast = useToast();
const feedbacks = ref<any[]>([]);
const stats = ref<any>(null);
const loading = ref(true);
const replyingTo = ref<string | null>(null);
const submittingReply = ref(false);

const replyForm = ref({
  response: ''
});

const filters = ref({
  status: '',
  userRole: '',
  rating: '',
  category: ''
});

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const loadFeedbacks = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
    });

    if (filters.value.status) params.append('status', filters.value.status);
    if (filters.value.userRole) params.append('userRole', filters.value.userRole);
    if (filters.value.rating) params.append('rating', filters.value.rating);
    if (filters.value.category) params.append('category', filters.value.category);

    const response = await apiFetch<any>(`/feedback?${params}`, { method: 'GET' });

    if (response.success) {
      feedbacks.value = response.data;
      pagination.value = { ...pagination.value, ...response.pagination };
    }
  } catch (error) {
    console.error('Erreur chargement feedbacks:', error);
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await apiFetch<any>('/feedback/stats', { method: 'GET' });
    if (response.success) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error('Erreur chargement stats:', error);
  }
};

const startReply = (feedbackId: string) => {
  replyingTo.value = feedbackId;
  replyForm.value.response = '';
};

const cancelReply = () => {
  replyingTo.value = null;
  replyForm.value.response = '';
};

const submitReply = async (feedbackId: string) => {
  if (!replyForm.value.response.trim()) {
    toast.warning('Veuillez saisir une réponse');
    return;
  }

  submittingReply.value = true;
  try {
    const response = await apiFetch(`/feedback/${feedbackId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ response: replyForm.value.response })
    });

    if (response.success) {
      toast.success('Réponse envoyée ! L\'utilisateur a reçu une notification');
      await loadFeedbacks();
      await loadStats();
      cancelReply();
    }
  } catch (error) {
    console.error('Erreur envoi réponse:', error);
    toast.error('Erreur lors de l\'envoi de la réponse');
  } finally {
    submittingReply.value = false;
  }
};

const updateStatus = async (feedbackId: string, status: string) => {
  try {
    const response = await apiFetch(`/feedback/${feedbackId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });

    if (response.success) {
      await loadFeedbacks();
      await loadStats();
      toast.success('Statut mis à jour avec succès');
    }
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    toast.error('Erreur lors de la mise à jour du statut');
  }
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadFeedbacks();
};

const visiblePages = computed(() => {
  const total = pagination.value.totalPages;
  const current = pagination.value.page;
  const pages = [];

  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i);
  }

  return pages;
});

const viewDetails = (feedback: any) => {
  toast.info(`Détails du feedback - ID: ${feedback.id} - Utilisateur: ${feedback.user_first_name} ${feedback.user_last_name} (${feedback.user_email})`);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getRoleIcon = (role: string) => {
  if (role === 'avocat' || role === 'lawyer') return '';
  if (role === 'client') return '';
  return '';
};

const getRoleLabel = (role: string) => {
  if (role === 'avocat' || role === 'lawyer') return 'Avocat';
  if (role === 'client') return 'Client';
  return role;
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    interface: 'Interface',
    usability: 'Utilisation',
    features: 'Fonctionnalités',
    lawyers: 'Avocats',
    support: 'Support',
    security: 'Sécurité',
    pricing: 'Tarifs',
    other: 'Autre'
  };
  return labels[category] || category;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    reviewed: 'Consulté',
    replied: 'Répondu',
    archived: 'Archivé'
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getBorderColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'border-yellow-500',
    reviewed: 'border-blue-500',
    replied: 'border-green-500',
    archived: 'border-gray-400'
  };
  return colors[status] || 'border-gray-300';
};

const getRatingText = (rating: number) => {
  if (rating <= 3) return 'Insatisfait';
  if (rating <= 5) return 'Moyen';
  if (rating <= 7) return 'Satisfait';
  if (rating <= 9) return 'Très satisfait';
  return 'Excellent';
};

const getRatingBadgeClass = (rating: number) => {
  if (rating <= 3) return 'bg-red-100 text-red-800';
  if (rating <= 5) return 'bg-orange-100 text-orange-800';
  if (rating <= 7) return 'bg-yellow-100 text-yellow-800';
  if (rating <= 9) return 'bg-green-100 text-green-800';
  return 'bg-purple-100 text-purple-800';
};

onMounted(() => {
  loadFeedbacks();
  loadStats();
});
</script>



<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <!-- Header avec statistiques -->
    <div class="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-4xl font-black text-gray-900 flex items-center gap-3">
              <span class="text-4xl">⭐</span>
              Avis des Utilisateurs
            </h1>
            <p class="mt-2 text-gray-600">Gestion et réponses aux feedbacks</p>
          </div>
          <button
            @click="loadFeedbacks"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>

        <!-- Stats Cards -->
        <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm font-medium">Total des avis</p>
                <p class="text-3xl font-black mt-1">{{ stats.total }}</p>
              </div>
              <div class="text-5xl opacity-20"></div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-yellow-100 text-sm font-medium">En attente</p>
                <p class="text-3xl font-black mt-1">{{ stats.pending }}</p>
              </div>
              <div class="text-5xl opacity-20"></div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm font-medium">Répondus</p>
                <p class="text-3xl font-black mt-1">{{ stats.replied }}</p>
              </div>
              <div class="text-5xl opacity-20"></div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm font-medium">Note moyenne</p>
                <p class="text-3xl font-black mt-1">{{ stats.average_rating.toFixed(1) }}/10</p>
              </div>
              <div class="text-5xl opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtres
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              v-model="filters.status"
              @change="loadFeedbacks"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="reviewed">Consulté</option>
              <option value="replied">Répondu</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rôle utilisateur</label>
            <select
              v-model="filters.userRole"
              @change="loadFeedbacks"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="avocat">Avocats</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <select
              v-model="filters.rating"
              @change="loadFeedbacks"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les notes</option>
              <option v-for="n in 10" :key="n" :value="n">{{ n }}/10</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              v-model="filters.category"
              @change="loadFeedbacks"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes</option>
              <option value="interface">Interface</option>
              <option value="usability">Utilisation</option>
              <option value="features">Fonctionnalités</option>
              <option value="lawyers">⚖Avocats</option>
              <option value="support">Support</option>
              <option value="security">Sécurité</option>
              <option value="pricing">Tarifs</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="feedback in feedbacks"
          :key="feedback.id"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4"
          :class="getBorderColor(feedback.status)"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex gap-0.5">
                    <component
                      :is="n <= feedback.rating ? StarIconSolid : StarIconOutline"
                      v-for="n in 10"
                      :key="n"
                      :class="n <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'"
                      class="h-5 w-5"
                    />
                  </div>
                  <span class="text-2xl font-black text-gray-900">{{ feedback.rating }}/10</span>
                  <span :class="getRatingBadgeClass(feedback.rating)" class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ getRatingText(feedback.rating) }}
                  </span>
                </div>

                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{{ getRoleIcon(feedback.user_role) }}</span>
                    <span class="font-semibold">{{ feedback.user_first_name }} {{ feedback.user_last_name }}</span>
                    <span class="text-gray-400">({{ getRoleLabel(feedback.user_role) }})</span>
                  </div>
                  <span class="text-gray-400">•</span>
                  <span>{{ formatDate(feedback.created_at) }}</span>
                  <span v-if="feedback.category" class="text-gray-400">•</span>
                  <span v-if="feedback.category" class="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                    {{ getCategoryLabel(feedback.category) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span :class="getStatusBadgeClass(feedback.status)" class="px-3 py-1 rounded-full text-xs font-bold">
                  {{ getStatusLabel(feedback.status) }}
                </span>
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="feedback.comment" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p class="text-sm font-medium text-gray-700 mb-2">Commentaire :</p>
                <p class="text-gray-800">{{ feedback.comment }}</p>
              </div>

              <div v-if="feedback.suggestions" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p class="text-sm font-medium text-blue-700 mb-2">Suggestions :</p>
                <p class="text-gray-800">{{ feedback.suggestions }}</p>
              </div>

              <!-- Réponse admin existante -->
              <div v-if="feedback.admin_response" class="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-green-600 font-bold text-sm">Réponse de l'administrateur</span>
                  <span v-if="feedback.admin_first_name" class="text-xs text-gray-600">
                    ({{ feedback.admin_first_name }} {{ feedback.admin_last_name }})
                  </span>
                </div>
                <p class="text-gray-800">{{ feedback.admin_response }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ formatDate(feedback.responded_at) }}</p>
              </div>

              <div v-if="replyingTo === feedback.id" class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <label class="block text-sm font-medium text-purple-900 mb-2">
                  Votre réponse à l'utilisateur :
                </label>
                <textarea
                  v-model="replyForm.response"
                  rows="4"
                  placeholder="Écrivez votre réponse ici... L'utilisateur recevra une notification."
                  class="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                ></textarea>
                <div class="flex gap-3 mt-3">
                  <button
                    @click="submitReply(feedback.id)"
                    :disabled="!replyForm.response || submittingReply"
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
                  >
                    <svg v-if="!submittingReply" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {{ submittingReply ? 'Envoi...' : 'Envoyer la réponse' }}
                  </button>
                  <button
                    @click="cancelReply"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                v-if="!feedback.admin_response"
                @click="startReply(feedback.id)"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Répondre
              </button>

              <select
                :value="feedback.status"
                @change="updateStatus(feedback.id, ($event.target as HTMLSelectElement).value)"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">En attente</option>
                <option value="reviewed">Consulté</option>
                <option value="replied">Répondu</option>
                <option value="archived">Archivé</option>
              </select>

              <button
                @click="viewDetails(feedback)"
                class="ml-auto px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium text-sm"
              >
                Voir détails
              </button>
            </div>
          </div>
        </div>

        <div v-if="feedbacks.length === 0" class="bg-white shadow rounded-xl p-12 text-center">
          <div class="text-6xl mb-4"></div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun avis trouvé</h3>
          <p class="text-gray-600">Aucun feedback ne correspond aux filtres sélectionnés.</p>
        </div>
      </div>

      <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center">
        <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
              page === pagination.page
                ? 'z-10 bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
