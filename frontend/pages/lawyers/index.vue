<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Trouver un avocat</h1>
        <p class="mt-2 text-sm text-gray-600">
          Recherchez et contactez des avocats spécialisés pour votre dossier
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Filtres de recherche</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Spécialité
            </label>
            <select
              v-model="filters.specialty"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            >
              <option value="">Toutes les spécialités</option>
              <option v-for="specialty in specialties" :key="specialty.name" :value="specialty.name">
                {{ specialty.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ville
            </label>
            <input
              v-model="filters.city"
              type="text"
              placeholder="Ex: Paris, Lyon..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="debouncedSearch"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Note minimale
            </label>
            <select
              v-model.number="filters.minRating"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            >
              <option :value="0">Toutes les notes</option>
              <option :value="3">3+ étoiles</option>
              <option :value="4">4+ étoiles</option>
              <option :value="4.5">4.5+ étoiles</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Disponibilité
            </label>
            <select
              v-model="filters.availability"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleSearch"
            >
              <option value="">Toutes</option>
              <option value="available">Disponible</option>
              <option value="busy">Occupé</option>
            </select>
          </div>
        </div>

        <div class="mt-4">
          <button
            @click="resetFilters"
            class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Chargement des avocats...</p>
      </div>

      <div v-else-if="error" class="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-red-900">Erreur de chargement</h3>
        <p class="mt-1 text-sm text-red-600">{{ error }}</p>
        <button @click="loadLawyers" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
          Réessayer
        </button>
      </div>

      <div v-else-if="lawyers.length > 0" class="space-y-4">
        <LawyerCard
          v-for="lawyer in lawyers"
          :key="lawyer.id"
          :lawyer="lawyer"
          @send-request="openRequestModal"
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Aucun avocat trouvé</h3>
        <p class="mt-1 text-sm text-gray-500">
          Essayez d'ajuster vos critères de recherche
        </p>
      </div>

      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <nav class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span class="px-4 py-2 text-sm text-gray-700">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </nav>
      </div>
    </div>

    <LawyerRequestModal
      v-if="showRequestModal"
      :lawyer="selectedLawyer"
      :specialties="specialties"
      @close="closeRequestModal"
      @submit="handleRequestSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { Lawyer, LawyerSearchFilters } from '~/types/lawyer';

definePageMeta({
  middleware: ['auth', 'client'],
  layout: 'authenticated',
});

const { searchLawyers, getSpecialties } = useLawyer();

const lawyers = ref<Lawyer[]>([]);
const specialties = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showRequestModal = ref(false);
const selectedLawyer = ref<Lawyer | null>(null);

const filters = ref<LawyerSearchFilters>({
  specialty: '',
  city: '',
  minRating: 0,
  availability: undefined,
  verified: true,
  limit: 12,
  offset: 0,
});

const currentPage = ref(1);
const totalPages = ref(1);
const total = ref(0);

watch(lawyers, (newLawyers) => {
  console.log('[Lawyers Page] Lawyers array updated:', {
    count: newLawyers.length,
    lawyers: newLawyers
  });
}, { deep: true });

onMounted(async () => {
  console.log('[Lawyers Page] Component mounted');
  try {
    console.log('[Lawyers Page] Loading specialties...');
    specialties.value = await getSpecialties();
    console.log('[Lawyers Page]  Specialties loaded:', specialties.value.length, specialties.value);
  } catch (error) {
    console.error('[Lawyers Page]  Error loading specialties:', error);
  }
  console.log('[Lawyers Page]  Loading lawyers...');
  loadLawyers();
});

const loadLawyers = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log('[Lawyers Page] Loading lawyers with filters:', filters.value);
    const response = await searchLawyers(filters.value);
    console.log('[Lawyers Page] Response received:', response);

    lawyers.value = response.data || [];
    total.value = response.total || 0;
    currentPage.value = response.page || 1;
    totalPages.value = response.totalPages || 1;

    console.log('[Lawyers Page] Loaded lawyers:', lawyers.value.length);
  } catch (err: any) {
    console.error('[Lawyers Page] Error loading lawyers:', err);
    error.value = err.message || 'Erreur lors du chargement des avocats';
    lawyers.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  filters.value.offset = 0;
  currentPage.value = 1;
  loadLawyers();
};

let searchTimeout: NodeJS.Timeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

const resetFilters = () => {
  filters.value = {
    specialty: '',
    city: '',
    minRating: 0,
    availability: undefined,
    verified: true,
    limit: 12,
    offset: 0,
  };
  handleSearch();
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  filters.value.offset = (page - 1) * (filters.value.limit || 12);
  currentPage.value = page;
  loadLawyers();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const openRequestModal = (lawyer: Lawyer) => {
  selectedLawyer.value = lawyer;
  showRequestModal.value = true;
};

const closeRequestModal = () => {
  showRequestModal.value = false;
  selectedLawyer.value = null;
};

const handleRequestSubmit = () => {
  closeRequestModal();
  navigateTo('/clients/requests');
};
</script>