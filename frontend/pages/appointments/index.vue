<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
          <p class="text-gray-600 mt-2">Gérez vos rendez-vous et consultations</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau rendez-vous
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-4 mb-8">
        <div class="flex gap-2">
          <button
            @click="viewMode = 'list'"
            :class="[
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              'px-4 py-2 rounded-lg transition-colors'
            ]"
          >
            <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Liste
          </button>
          <button
            @click="viewMode = 'calendar'"
            :class="[
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              'px-4 py-2 rounded-lg transition-colors'
            ]"
          >
            <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendrier
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Aujourd'hui</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats.today }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Cette semaine</p>
          <p class="text-3xl font-bold text-purple-600">{{ stats.thisWeek }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">À venir</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.upcoming }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Complétés</p>
          <p class="text-3xl font-bold text-gray-600">{{ stats.completed }}</p>
        </div>
      </div>

      <div v-if="viewMode === 'list'" class="bg-white rounded-lg shadow">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="appointments.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun rendez-vous</h3>
          <p class="mt-1 text-sm text-gray-500">Créez votre premier rendez-vous</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="appointment in appointments"
            :key="appointment.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex gap-4 flex-1">
                <div class="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span class="text-2xl font-bold text-blue-600">{{ getDay(appointment.start_time) }}</span>
                  <span class="text-xs text-blue-600 uppercase">{{ getMonth(appointment.start_time) }}</span>
                </div>

                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900">{{ appointment.title }}</h3>
                    <span
                      class="px-2 py-1 text-xs rounded-full"
                      :class="getStatusClass(appointment.status)"
                    >
                      {{ getStatusLabel(appointment.status) }}
                    </span>
                    <span
                      class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800"
                    >
                      {{ getTypeLabel(appointment.appointment_type) }}
                    </span>
                  </div>

                  <p v-if="appointment.description" class="text-sm text-gray-600 mb-3">
                    {{ appointment.description }}
                  </p>

                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}</span>
                    </div>
                    <div v-if="appointment.location" class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{{ appointment.location }}</span>
                    </div>
                    <div v-if="appointment.case_title" class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{{ appointment.case_title }}</span>
                    </div>
                  </div>

                  <div v-if="appointment.notes" class="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">{{ appointment.notes }}</p>
                  </div>
                </div>
              </div>

              <div class="ml-4">
                <button
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  @click="viewAppointment(appointment.id)"
                >
                  Détails
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-lg shadow p-6">
        <div class="text-center py-12">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Vue Calendrier</h3>
          <p class="mt-2 text-sm text-gray-500">
            Intégration calendrier en cours de développement
          </p>
          <p class="text-sm text-gray-500">
            FullCalendar sera intégré prochainement
          </p>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 class="text-2xl font-bold mb-4">Nouveau Rendez-vous</h2>
        <p class="text-gray-600">Fonctionnalité en cours de développement...</p>
        <button
          @click="showCreateModal = false"
          class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const authStore = useAuthStore();

const appointments = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const viewMode = ref<'list' | 'calendar'>('list');

const stats = computed(() => {
  const now = new Date();
  const today = appointments.value.filter(apt => {
    const aptDate = new Date(apt.start_time);
    return aptDate.toDateString() === now.toDateString();
  }).length;

  const thisWeek = appointments.value.filter(apt => {
    const aptDate = new Date(apt.start_time);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return aptDate >= now && aptDate <= weekFromNow;
  }).length;

  const upcoming = appointments.value.filter(apt => {
    return new Date(apt.start_time) > now && apt.status === 'scheduled';
  }).length;

  const completed = appointments.value.filter(apt => {
    return apt.status === 'completed';
  }).length;

  return { today, thisWeek, upcoming, completed };
});

onMounted(() => {
  loadAppointments();
});

const loadAppointments = async () => {
  try {
    loading.value = true;

    appointments.value = [
      {
        id: '1',
        title: 'Consultation divorce',
        description: 'Première consultation pour divorce à l\'amiable',
        appointment_type: 'consultation',
        start_time: new Date('2025-12-23T10:00:00'),
        end_time: new Date('2025-12-23T11:00:00'),
        location: 'Cabinet - 123 Rue de la Paix, Paris',
        status: 'scheduled',
        case_title: 'Divorce Dupont',
        notes: 'Client très motivé, apporter documents',
      },
      {
        id: '2',
        title: 'Audience tribunal',
        description: 'Audience pour litige commercial',
        appointment_type: 'court',
        start_time: new Date('2025-12-26T14:00:00'),
        end_time: new Date('2025-12-26T16:00:00'),
        location: 'Tribunal de Commerce de Paris',
        status: 'confirmed',
        case_title: 'Litige Commercial SAS Martin',
      },
    ];
  } catch (error) {
    console.error('Error loading appointments:', error);
  } finally {
    loading.value = false;
  }
};

const getDay = (date: Date) => {
  return new Date(date).getDate();
};

const getMonth = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short' });
};

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    no_show: 'bg-orange-100 text-orange-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: 'Programmé',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
    no_show: 'Absent',
  };
  return labels[status] || status;
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    consultation: 'Consultation',
    court: 'Tribunal',
    meeting: 'Réunion',
    phone: 'Téléphone',
    video: 'Visio',
  };
  return labels[type] || type;
};

const viewAppointment = (id: string) => {
  navigateTo(`/appointments/${id}`);
};
</script>