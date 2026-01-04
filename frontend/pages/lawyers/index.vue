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