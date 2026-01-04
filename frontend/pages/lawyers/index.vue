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
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
    <div class="mb-8">
      <h1 class="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Trouver un avocat</h1>
      <p class="text-gray-600">Consultez les experts du barreau et lancez votre procédure.</p>
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
    <div class="mb-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeFilter = cat"
        :class="activeFilter === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'"
        class="px-5 py-2 rounded-xl border text-sm font-bold whitespace-nowrap transition-all shadow-sm"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="loadingLawyers" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="lawyer in filteredLawyers" :key="lawyer.id"
           class="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group">

        <div class="p-8 flex flex-col items-center text-center flex-1">
          <div class="relative mb-6">
            <div class="w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-3xl flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-lg">
                <span class="text-3xl font-black text-white uppercase -rotate-3 group-hover:rotate-0 transition-transform">
                  {{ lawyer.first_name?.[0] }}{{ lawyer.last_name?.[0] }}
                </span>
            </div>
            <div class="absolute -top-2 -right-2 bg-yellow-400 text-white px-2 py-1 rounded-lg shadow-md font-black text-[10px] flex items-center gap-1">
                ★ {{ lawyer.rating > 0 ? lawyer.rating.toFixed(1) : '5.0' }}
            </div>
          </div>

          <h2 class="text-xl font-black text-gray-900 uppercase italic">Me {{ lawyer.first_name }} {{ lawyer.last_name }}</h2>
          <p class="text-blue-600 text-[11px] font-bold uppercase tracking-widest mt-1 italic">
            Barreau de {{ lawyer.office_city || 'Paris' }}
          </p>
        </div>

        <div class="p-6 bg-gray-50 border-t flex items-center justify-between">
            <button @click="lawyerDetails = lawyer" class="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
              Profil & Avis
            </button>
            <button @click="selectedLawyer = lawyer" class="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-tighter hover:bg-blue-600 transition-all shadow-xl">
              Faire une demande
            </button>
        </div>
      </div>
    </div>

    <div v-if="lawyerDetails" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div class="h-32 bg-gradient-to-r from-blue-700 to-blue-500 relative">
          <button @click="lawyerDetails = null" class="absolute top-4 right-4 text-white hover:bg-white/20 w-8 h-8 rounded-full">✕</button>
        </div>

        <div class="px-8 pb-8">
          <div class="relative -mt-12 mb-6 flex justify-between items-end">
            <div class="w-24 h-24 bg-white rounded-2xl p-1 shadow-xl">
              <div class="w-full h-full bg-blue-100 rounded-xl flex items-center justify-center text-2xl font-black text-blue-600">
                {{ lawyerDetails.first_name?.[0] }}{{ lawyerDetails.last_name?.[0] }}
              </div>
            </div>
            <button @click="selectedLawyer = lawyerDetails; lawyerDetails = null" class="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all">
              Contacter le cabinet
            </button>
          </div>

          <h3 class="text-2xl font-black text-gray-900 uppercase italic">Me {{ lawyerDetails.first_name }} {{ lawyerDetails.last_name }}</h3>
          <p class="text-blue-600 font-bold text-sm italic mb-4">
            Barreau de {{ lawyerDetails.office_city }} — Toque n°{{ lawyerDetails.bar_number }}
          </p>

          <div class="p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-blue-100/50 flex items-center justify-between mb-6">
            <div>
              <h4 class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Note & Avis</h4>
              <div class="flex items-center gap-3">
                <span class="text-3xl font-black text-gray-900">{{ lawyerDetails.rating > 0 ? lawyerDetails.rating.toFixed(1) : '5.0' }}</span>
                <div>
                  <div class="flex text-yellow-400 text-xs">
                    <span v-for="i in 5" :key="i">
                      {{ i <= Math.round(lawyerDetails.rating || 5) ? '★' : '☆' }}
                    </span>
                  </div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase">
                    {{ lawyerDetails.review_count || 0 }} avis vérifiés
                  </p>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div v-if="(lawyerDetails.review_count || 0) > 10" class="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full">
                <span class="text-[9px] font-black uppercase tracking-tighter">Élite</span>
              </div>
              <div v-else class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                <span class="text-[9px] font-black uppercase italic">Vérifié</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div class="text-lg">📧</div>
              <p class="text-sm font-bold text-gray-800 break-all">{{ lawyerDetails.email }}</p>
            </div>
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div class="text-lg">📞</div>
              <p class="text-sm font-bold text-gray-800">{{ lawyerDetails.phone || 'Non renseigné' }}</p>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Présentation</h4>
              <p class="text-gray-600 leading-relaxed italic bg-blue-50/10 p-4 rounded-2xl border border-blue-50">
                "{{ lawyerDetails.description || 'Avocat dévoué à la défense de vos intérêts.' }}"
              </p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Spécialités</h4>
                <p class="text-sm font-bold text-gray-700">{{ formatSpecs(lawyerDetails.specialties).join(', ') }}</p>
              </div>
              <div>
                <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Expérience</h4>
                <p class="text-sm font-bold text-gray-700">{{ lawyerDetails.experience_years }} ans d'exercice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedLawyer" class="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">


            <div class="p-6 bg-blue-600 text-white flex items-center gap-4 relative">
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold border border-white/30">
                    {{ selectedLawyer.first_name?.[0] }}
                </div>
                <div>
                    <p class="text-[10px] font-bold uppercase opacity-80">Nouvelle demande pour</p>
                    <h3 class="text-lg font-black uppercase italic">Me {{ selectedLawyer.first_name }} {{ selectedLawyer.last_name }}</h3>
                </div>
                <button @click="selectedLawyer = null" class="absolute top-6 right-6 text-white hover:bg-white/10 w-8 h-8 rounded-full">✕</button>
            </div>

            <div class="p-8">
                <ClientsClientRequestForm
                  :preselected-lawyer-id="selectedLawyer.id"
                  @success="onDemandeSuccess"
                  @cancel="selectedLawyer = null"
                />
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lawyer, LawyerSearchFilters } from '~/types/lawyer';

definePageMeta({
  middleware: ['auth', 'client'],
  layout: 'authenticated',
definePageMeta({ middleware: 'auth', layout: 'authenticated' });

const { getLawyers } = useCase();
const lawyers = ref<any[]>([]);
const loadingLawyers = ref(true);
const selectedLawyer = ref<any>(null);
const lawyerDetails = ref<any>(null);
const activeFilter = ref('Tous');

const formatSpecs = (specs: any) => {
  if (!specs) return [];
  if (Array.isArray(specs)) return specs;
  return specs.replace(/[{}"]/g, '').split(',');
};

const categories = computed(() => {
  const specs = new Set(['Tous']);
  lawyers.value.forEach(l => {
    const s = formatSpecs(l.specialties);
    s.forEach((spec: string) => {
      if(spec.trim()) specs.add(spec.trim());
    });
  });
  return Array.from(specs);
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

const filteredLawyers = computed(() => {
  if (activeFilter.value === 'Tous') return lawyers.value;
  return lawyers.value.filter(l => {
    const s = formatSpecs(l.specialties);
    return s.some((spec: string) => spec.trim() === activeFilter.value);
  });
});

const loadLawyers = async () => {
  try {
    const data = await getLawyers();
    lawyers.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loadingLawyers.value = false;
  }
};

const onDemandeSuccess = () => {
  selectedLawyer.value = null;
  alert("Votre demande a été envoyée avec succès !");
};

onMounted(loadLawyers);
</script>

