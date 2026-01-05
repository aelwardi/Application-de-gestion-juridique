<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Client -->
      <div class="mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Mes Rendez-vous
              </h1>
              <p class="text-gray-600 mt-2 text-lg">Consultez et gérez vos rendez-vous avec vos avocats</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Vous êtes client</div>
              <div class="text-lg font-semibold text-gray-900">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons de vue -->
      <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-8 border border-white/20">
        <div class="flex gap-2">
          <button
            @click="viewMode = 'list'"
            :class="[
              viewMode === 'list'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              'px-4 py-2 rounded-xl transition-all duration-200 flex items-center font-semibold'
            ]"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Liste
          </button>
          <button
            @click="viewMode = 'calendar'"
            :class="[
              viewMode === 'calendar'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              'px-4 py-2 rounded-xl transition-all duration-200 flex items-center font-semibold'
            ]"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendrier
          </button>
          <button
            @click="viewMode = 'map'"
            :class="[
              viewMode === 'map'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              'px-4 py-2 rounded-xl transition-all duration-200 flex items-center font-semibold'
            ]"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Carte
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
          <p class="text-sm font-medium text-gray-600 mb-1">À venir</p>
          <p class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {{ stats.upcoming || 0 }}
          </p>
          <div class="mt-2 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-0 group-hover:w-full transition-all duration-300"></div>
        </div>
        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
          <p class="text-sm font-medium text-gray-600 mb-1">Cette semaine</p>
          <p class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
            {{ stats.thisWeek || 0 }}
          </p>
          <div class="mt-2 h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full w-0 group-hover:w-full transition-all duration-300"></div>
        </div>
        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-gray-400 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
          <p class="text-sm font-medium text-gray-600 mb-1">Complétés</p>
          <p class="text-4xl font-black text-gray-700">{{ stats.completed || 0 }}</p>
          <div class="mt-2 h-1 bg-gray-400 rounded-full w-0 group-hover:w-full transition-all duration-300"></div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0"></div>
        </div>
      </div>

      <div v-else>
        <!-- Vue Liste -->
        <div v-if="viewMode === 'list'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div v-if="appointments.length === 0" class="text-center py-20">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 text-lg">Aucun rendez-vous trouvé</p>
            <p class="text-gray-400 text-sm mt-2">Vos rendez-vous avec vos avocats apparaîtront ici</p>
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="apt in appointments"
              :key="apt.id"
              class="p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 flex items-center justify-between group"
            >
              <div class="flex gap-4 flex-1">
                <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex flex-col items-center justify-center border border-blue-200 shadow-sm group-hover:shadow-md transition-shadow">
                  <span class="text-xl font-bold text-blue-700">{{ getDay(apt.start_time) }}</span>
                  <span class="text-xs text-blue-600 uppercase font-semibold">{{ getMonth(apt.start_time) }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 class="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ apt.title }}</h3>
                    <span :class="getStatusClass(apt.status)" class="px-3 py-1 text-xs rounded-full font-semibold shadow-sm">
                      {{ getStatusLabel(apt.status) }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                    <span class="font-medium">⏰ {{ formatTime(apt.start_time) }} - {{ formatTime(apt.end_time) }}</span>
                    <span class="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-md font-semibold text-xs">
                      {{ getTypeLabel(apt.appointment_type) }}
                    </span>
                    <span v-if="apt.lawyer_first_name" class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Me {{ apt.lawyer_first_name }} {{ apt.lawyer_last_name }}
                    </span>
                    <span v-if="apt.location_address" class="flex items-center gap-1 text-xs">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {{ apt.location_address.split(',').slice(0, 2).join(',') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  v-if="canCancel(apt.start_time, apt.status)"
                  @click="openCancelModal(apt)"
                  class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm"
                  title="Annuler le rendez-vous"
                >
                  Annuler
                </button>
                <button
                  @click="viewAppointment(apt.id)"
                  class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold text-sm"
                >
                  Détails →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vue Calendrier -->
        <div v-else-if="viewMode === 'calendar'" class="space-y-6">
          <div v-if="appointments.length === 0" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 text-lg">Aucun rendez-vous à afficher</p>
          </div>
          <div v-else class="space-y-4">
            <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Agenda chronologique
            </h3>
            <div
              v-for="apt in sortedAppointments"
              :key="apt.id"
              class="bg-white/80 backdrop-blur-sm border-l-4 border-blue-500 rounded-r-xl shadow-lg p-4 flex items-center justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 group"
            >
              <div class="flex items-center gap-4 flex-1">
                <div class="text-center min-w-[60px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2">
                  <p class="text-xs uppercase text-blue-600 font-bold">{{ getMonth(apt.start_time) }}</p>
                  <p class="text-2xl font-black text-blue-700">{{ getDay(apt.start_time) }}</p>
                </div>
                <div class="h-10 w-[1px] bg-gradient-to-b from-blue-200 to-purple-200"></div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ apt.title }}</p>
                  <p class="text-xs text-gray-500 font-medium">{{ formatTime(apt.start_time) }} - {{ formatTime(apt.end_time) }}</p>
                  <p class="text-xs text-gray-600 mt-1">👨‍⚖️ Me {{ apt.lawyer_first_name }} {{ apt.lawyer_last_name }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg font-semibold shadow-sm">
                  {{ getTypeLabel(apt.appointment_type) }}
                </span>
                <button
                  @click="viewAppointment(apt.id)"
                  class="p-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all"
                >
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vue Carte -->
        <div v-else-if="viewMode === 'map'" class="h-[600px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <ClientOnly>
            <AppointmentMap
              :appointments="appointments"
              :selected-appointment-id="selectedAppointmentId || undefined"
              @select-appointment="handleSelectAppointment"
            />
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Modal d'annulation -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp">
        <div class="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-black">Annuler le rendez-vous</h2>
            <button
              @click="showCancelModal = false"
              class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-6">
            <p class="text-gray-700 mb-4">Êtes-vous sûr de vouloir annuler ce rendez-vous ?</p>
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p class="text-sm font-bold text-red-800">{{ appointmentToCancel?.title }}</p>
              <p class="text-xs text-red-600 mt-1">{{ formatDate(appointmentToCancel?.start_time) }} à {{ formatTime(appointmentToCancel?.start_time) }}</p>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">Raison de l'annulation (optionnel)</label>
            <textarea
              v-model="cancelReason"
              rows="3"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              placeholder="Pourquoi annulez-vous ce rendez-vous ?"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="showCancelModal = false"
              class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Retour
            </button>
            <button
              @click="confirmCancel"
              :disabled="cancelling"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {{ cancelling ? '⏳ Annulation...' : '✓ Confirmer l\'annulation' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppointmentMap from '~/components/appointments/AppointmentMap.vue'

definePageMeta({
  middleware: 'client',
  layout: 'authenticated'
});

const authStore = useAuthStore();
const { getAllAppointments, updateAppointment, getAppointmentStats } = useAppointment();
const config = useRuntimeConfig();

const appointments = ref<any[]>([]);
const stats = ref<any>({});
const loading = ref(true);
const viewMode = ref<'list' | 'calendar' | 'map'>('list');
const selectedAppointmentId = ref<string | null>(null);
const showCancelModal = ref(false);
const appointmentToCancel = ref<any>(null);
const cancelReason = ref('');
const cancelling = ref(false);

onMounted(() => fetchInitialData());

const fetchInitialData = async () => {
  loading.value = true;
  const userId = authStore.user?.id;
  try {
    const [aptRes, statsRes] = await Promise.all([
      getAllAppointments({ client_id: userId }),
      getAppointmentStats(undefined, userId)
    ]);

    if (aptRes.success && aptRes.data) appointments.value = aptRes.data;
    if (statsRes.success) stats.value = statsRes.data;
  } finally {
    loading.value = false;
  }
};

const sortedAppointments = computed(() => {
  return [...appointments.value].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
});

const canCancel = (startTime: string, status: string) => {
  if (status === 'cancelled' || status === 'completed') return false;
  const aptTime = new Date(startTime).getTime();
  const now = new Date().getTime();
  return (aptTime - now) >= (24 * 60 * 60 * 1000); // 24h avant
};

const openCancelModal = (apt: any) => {
  appointmentToCancel.value = apt;
  cancelReason.value = '';
  showCancelModal.value = true;
};

const confirmCancel = async () => {
  if (!appointmentToCancel.value) return;

  cancelling.value = true;
  try {
    const payload: any = {
      status: 'cancelled',
      notes: cancelReason.value ? `Annulé par le client: ${cancelReason.value}` : 'Annulé par le client'
    };

    const res = await updateAppointment(appointmentToCancel.value.id, payload);
    if (res.success) {
      await fetchInitialData();
      showCancelModal.value = false;
      alert('Rendez-vous annulé avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    alert('Erreur lors de l\'annulation du rendez-vous');
  } finally {
    cancelling.value = false;
  }
};

const getDay = (d: any) => new Date(d).getDate();
const getMonth = (d: any) => new Date(d).toLocaleDateString('fr-FR', { month: 'short' });
const formatTime = (d: any) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const formatDate = (d: any) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const getStatusClass = (s: string) => {
  const map: any = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  return map[s] || 'bg-gray-100';
};

const getStatusLabel = (s: string) => {
  const map: any = {
    scheduled: 'Prévu',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé'
  };
  return map[s] || s;
};

const getTypeLabel = (t: string) => {
  const map: any = {
    consultation: 'Consultation',
    court: 'Tribunal',
    meeting: 'Réunion',
    phone: 'Téléphone',
    video: 'Visio'
  };
  return map[t] || t;
};

const viewAppointment = (id: string) => navigateTo(`/appointments/${id}`);
const handleSelectAppointment = (id: string) => {
  selectedAppointmentId.value = id;
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
</style>