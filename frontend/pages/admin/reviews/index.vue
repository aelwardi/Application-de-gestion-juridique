<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Modération des Avis</h1>
        <p class="mt-1 text-sm text-gray-500">{{ pagination.total }} avis en attente de modération</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="bg-white shadow rounded-lg p-6"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-4">
                <div class="flex items-center">
                  <svg
                    v-for="n in 5"
                    :key="n"
                    class="h-5 w-5"
                    :class="n <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ review.rating }}/5</span>
              </div>

              <div class="mb-4">
                <p class="text-sm text-gray-900">
                  <span class="font-medium">Client:</span> {{ review.client_name }}
                </p>
                <p class="text-sm text-gray-900">
                  <span class="font-medium">Avocat:</span> {{ review.lawyer_name }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Publié le {{ formatDate(review.created_at) }}
                </p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700">{{ review.comment || 'Aucun commentaire' }}</p>
              </div>
            </div>

            <div class="ml-6 flex flex-col space-y-2">
              <button
                @click="approveReview(review)"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Approuver
              </button>
              <button
                @click="rejectReview(review)"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rejeter
              </button>
            </div>
          </div>
        </div>

        <div v-if="reviews.length === 0" class="bg-white shadow rounded-lg p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun avis en attente</h3>
          <p class="mt-1 text-sm text-gray-500">Tous les avis ont été modérés</p>
        </div>
      </div>

      <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </nav>
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
const reviews = ref<any[]>([]);

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const fetchReviews = async () => {
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
    });

    const response = await apiFetch<any>(`/admin/reviews/pending?${params}`, { method: 'GET' });
    if (response.success) {
      reviews.value = response.data;
      pagination.value = { ...pagination.value, ...response.pagination };
    }
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
  }
};

const approveReview = async (review: any) => {
  if (!confirm('Approuver cet avis ?')) return;

  try {
    const response = await apiFetch(`/admin/reviews/${review.id}/approve`, { method: 'PATCH' });
    if (response.success) {
      reviews.value = reviews.value.filter(r => r.id !== review.id);
      pagination.value.total--;
    }
  } catch (error) {
    console.error('Failed to approve review:', error);
    alert('Erreur lors de l\'approbation');
  }
};

const rejectReview = async (review: any) => {
  if (!confirm('Rejeter cet avis ?')) return;

  try {
    const response = await apiFetch(`/admin/reviews/${review.id}/reject`, { method: 'PATCH' });
    if (response.success) {
      reviews.value = reviews.value.filter(r => r.id !== review.id);
      pagination.value.total--;
    }
  } catch (error) {
    console.error('Failed to reject review:', error);
    alert('Erreur lors du rejet');
  }
};

const changePage = (page: number) => {
  pagination.value.page = page;
  fetchReviews();
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

onMounted(() => {
  fetchReviews();
});
</script>