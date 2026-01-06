<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
    <div class="mb-8">
      <h1 class="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Trouver un avocat</h1>
      <p class="text-gray-600">Consultez les experts du barreau et lancez votre procédure.</p>
    </div>

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

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="lawyer in filteredLawyers" :key="lawyer.id"
           class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">

        <!-- Header avec badges -->
        <div class="relative h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4">
          <div class="absolute top-3 right-3 flex flex-wrap gap-2 justify-end">
            <!-- Badge de vérification - PROMINENT -->
            <span v-if="lawyer.verified_by_admin" class="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-black flex items-center gap-1 shadow-lg animate-pulse">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              ✓ VÉRIFIÉ
            </span>
            <span v-else class="px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-black flex items-center gap-1">
              ⚠️ NON VÉRIFIÉ
            </span>

            <!-- Statut de disponibilité -->
            <span class="px-2 py-1 rounded-full text-xs font-bold" :class="{
              'bg-green-500 text-white': lawyer.availability_status === 'available',
              'bg-yellow-500 text-white': lawyer.availability_status === 'busy',
              'bg-red-500 text-white': lawyer.availability_status === 'unavailable'
            }">
              {{ lawyer.availability_status === 'available' ? '🟢 Disponible' : lawyer.availability_status === 'busy' ? '🟡 Occupé' : '🔴 Indisponible' }}
            </span>
          </div>

          <!-- Badge IS ACTIVE -->
          <div class="absolute bottom-3 left-3">
            <span v-if="lawyer.is_active" class="px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs font-bold">
              ✅ Compte actif
            </span>
            <span v-else class="px-2 py-1 bg-red-500/80 backdrop-blur-sm text-white rounded-lg text-xs font-bold">
              ⛔ Compte inactif
            </span>
          </div>
        </div>

        <!-- Avatar -->
        <div class="relative -mt-12 px-6 mb-3">
          <div class="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white">
            <div class="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span class="text-3xl font-black text-white">
                {{ lawyer.first_name?.[0] }}{{ lawyer.last_name?.[0] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Contenu détaillé -->
        <div class="px-6 pb-6 flex-1 flex flex-col">
          <!-- Nom et localisation -->
          <div class="mb-3">
            <h3 class="text-xl font-black text-gray-900 mb-1">
              Me {{ lawyer.first_name }} {{ lawyer.last_name }}
            </h3>
            <p class="text-blue-600 font-semibold text-sm">Barreau n° {{ lawyer.bar_number }}</p>
            <div v-if="lawyer.office_city" class="flex items-center gap-1 text-gray-600 text-sm mt-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              {{ lawyer.office_city }}{{ lawyer.office_postal_code ? ` (${lawyer.office_postal_code})` : '' }}
            </div>
          </div>

          <!-- Stats en 3 colonnes -->
          <div class="grid grid-cols-3 gap-2 mb-3">
            <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-2 text-center border border-yellow-100">
              <div class="text-lg">⭐</div>
              <p class="text-lg font-black text-gray-900">{{ lawyer.rating?.toFixed(1) || '5.0' }}</p>
              <p class="text-xs text-gray-600">{{ lawyer.total_reviews || 0 }} avis</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 text-center border border-blue-100">
              <div class="text-lg">💼</div>
              <p class="text-lg font-black text-gray-900">{{ lawyer.experience_years || 0 }}</p>
              <p class="text-xs text-gray-600">ans</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 text-center border border-purple-100">
              <div class="text-lg">📁</div>
              <p class="text-lg font-black text-gray-900">{{ lawyer.total_cases || 0 }}</p>
              <p class="text-xs text-gray-600">dossiers</p>
            </div>
          </div>

          <!-- Spécialités -->
          <div class="mb-3">
            <p class="text-xs font-bold text-gray-500 uppercase mb-2">⚖️ Spécialités</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="spec in formatSpecs(lawyer.specialties).slice(0, 3)"
                :key="spec"
                class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
              >
                {{ spec }}
              </span>
              <span
                v-if="formatSpecs(lawyer.specialties).length > 3"
                class="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold"
              >
                +{{ formatSpecs(lawyer.specialties).length - 3 }}
              </span>
            </div>
          </div>

          <!-- Tarif (toujours visible) -->
          <div v-if="lawyer.hourly_rate" class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-green-700 font-bold uppercase">Tarif horaire</p>
                <p class="text-xl font-black text-green-700">{{ lawyer.hourly_rate }}€<span class="text-sm">/h</span></p>
              </div>
              <div class="text-2xl">💰</div>
            </div>
          </div>

          <!-- Bouton "Voir plus de détails" -->
          <button
            @click.stop="toggleCardExpansion(lawyer.id)"
            class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-all mb-3 flex items-center justify-between"
          >
            <span>{{ expandedCards.has(lawyer.id) ? '▲ Masquer les détails' : '▼ Voir plus de détails' }}</span>
            <svg
              class="w-5 h-5 transition-transform"
              :class="{ 'rotate-180': expandedCards.has(lawyer.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Section détails CACHÉE par défaut -->
          <div
            v-if="expandedCards.has(lawyer.id)"
            class="space-y-3 mb-3 animate-fadeIn"
          >
            <!-- Langues -->
            <div v-if="lawyer.languages && formatSpecs(lawyer.languages).length > 0" class="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <p class="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                <span>🌍</span> Langues parlées
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="lang in formatSpecs(lawyer.languages)"
                  :key="lang"
                  class="px-2 py-1 bg-purple-200 text-purple-800 rounded-lg text-xs font-semibold"
                >
                  {{ lang }}
                </span>
              </div>
            </div>

            <!-- Description complète -->
            <div v-if="lawyer.description" class="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p class="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                <span>📝</span> Présentation
              </p>
              <p class="text-sm text-gray-700 italic">
                "{{ lawyer.description }}"
              </p>
            </div>

            <!-- Contact -->
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p class="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                <span>📞</span> Coordonnées complètes
              </p>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-xs">
                  <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span class="text-gray-700 font-medium truncate">{{ lawyer.email }}</span>
                </div>
                <div v-if="lawyer.phone" class="flex items-center gap-2 text-xs">
                  <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span class="text-gray-700 font-medium">{{ lawyer.phone }}</span>
                </div>
                <div v-if="lawyer.office_address" class="flex items-start gap-2 text-xs">
                  <svg class="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-700">{{ lawyer.office_address }}</span>
                </div>
              </div>
            </div>

            <!-- Dossiers actifs -->
            <div v-if="lawyer.active_cases > 0" class="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-indigo-700 font-bold uppercase">Dossiers en cours</p>
                  <p class="text-lg font-black text-indigo-700">{{ lawyer.active_cases }} actifs</p>
                </div>
                <div class="text-2xl">📂</div>
              </div>
            </div>

            <!-- Informations vérification -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p class="text-xs font-bold text-gray-700 uppercase mb-2">ℹ️ Informations de vérification</p>
              <div class="space-y-1 text-xs text-gray-600">
                <div class="flex justify-between">
                  <span>Statut de vérification:</span>
                  <span class="font-bold" :class="lawyer.verified_by_admin ? 'text-green-600' : 'text-orange-600'">
                    {{ lawyer.verified_by_admin ? '✓ Vérifié par admin' : '⚠️ En attente de vérification' }}
                  </span>
                </div>
                <div v-if="lawyer.verified_at" class="flex justify-between">
                  <span>Date de vérification:</span>
                  <span class="font-medium">{{ new Date(lawyer.verified_at).toLocaleDateString('fr-FR') }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Compte:</span>
                  <span class="font-bold" :class="lawyer.is_active ? 'text-green-600' : 'text-red-600'">
                    {{ lawyer.is_active ? '✓ Actif' : '✗ Inactif' }}
                  </span>
                </div>
                <div v-if="lawyer.is_verified" class="flex justify-between">
                  <span>Email:</span>
                  <span class="font-bold text-green-600">✓ Vérifié</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="mt-auto">
            <button
              @click="selectedLawyer = lawyer"
              class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contacter cet avocat
            </button>
          </div>
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

          <h3 class="text-2xl font-black text-gray-900 uppercase italic">Me {{ lawyerDetails.firstName }} {{ lawyerDetails.lastName }}</h3>
          <p class="text-blue-600 font-bold text-sm italic mb-4">
            Barreau de {{ lawyerDetails.officeCity }} — Toque n°{{ lawyerDetails.barNumber }}
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
definePageMeta({
  middleware: ['auth', 'client'],
  layout: 'authenticated'
});

const { getLawyers } = useCase();
const lawyers = ref<any[]>([]);
const loadingLawyers = ref(true);
const selectedLawyer = ref<any>(null);
const lawyerDetails = ref<any>(null);
const activeFilter = ref('Tous');
const viewMode = ref<'grid' | 'list'>('grid');
const searchQuery = ref('');
const expandedCards = ref<Set<string>>(new Set());

const toggleCardExpansion = (lawyerId: string) => {
  if (expandedCards.value.has(lawyerId)) {
    expandedCards.value.delete(lawyerId);
  } else {
    expandedCards.value.add(lawyerId);
  }
};

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

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
