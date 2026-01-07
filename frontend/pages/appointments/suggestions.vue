<script setup lang="ts">
import type { AppointmentSuggestion } from '~/types/suggestion';
import SuggestionModal from '~/components/appointments/SuggestionModal.vue';

definePageMeta({
  middleware: ['auth', 'lawyer'],
  layout: 'authenticated'
});

const authStore = useAuthStore();
const {
  getReceivedSuggestions,
  getSentSuggestions,
  acceptSuggestion,
  rejectSuggestion
} = useSuggestion();

const activeTab = ref<'received' | 'sent'>('received');
const receivedSuggestions = ref<AppointmentSuggestion[]>([]);
const sentSuggestions = ref<AppointmentSuggestion[]>([]);
const loading = ref(true);
const showCounterModal = ref(false);
const counterModalSuggestion = ref<AppointmentSuggestion | null>(null);

onMounted(() => loadSuggestions());

const loadSuggestions = async () => {
  loading.value = true;
  try {
    const [received, sent] = await Promise.all([
      getReceivedSuggestions(),
      getSentSuggestions()
    ]);

    if (received.success) receivedSuggestions.value = received.data;
    if (sent.success) sentSuggestions.value = sent.data;
  } finally {
    loading.value = false;
  }
};

const acceptSuggestionAction = async (suggestionId: string) => {
  if (!confirm('Accepter cette proposition et créer le rendez-vous ?')) return;

  try {
    const response = await acceptSuggestion(suggestionId);
    if (response.success) {
      alert('Proposition acceptée ! Le rendez-vous a été créé.');
      await loadSuggestions();
    }
  } catch (error) {
    console.error('Erreur acceptation:', error);
    alert('Erreur lors de l\'acceptation');
  }
};

const rejectSuggestionAction = async (suggestionId: string) => {
  const reason = prompt('Raison du refus (optionnel) :');
  if (reason === null) return;

  try {
    const response = await rejectSuggestion(suggestionId, reason || undefined);
    if (response.success) {
      alert('Proposition refusée');
      await loadSuggestions();
    }
  } catch (error) {
    console.error('Erreur refus:', error);
    alert('Erreur lors du refus');
  }
};

const openCounterModal = (suggestion: AppointmentSuggestion) => {
  counterModalSuggestion.value = suggestion;
  showCounterModal.value = true;
};

const handleCounterSubmitted = () => {
  showCounterModal.value = false;
  counterModalSuggestion.value = null;
  loadSuggestions();
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    countered: 'Contre-proposée'
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    countered: 'bg-blue-100 text-blue-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>




<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Propositions de créneaux
        </h1>
        <p class="text-gray-600 mt-2 text-lg">Gérez les demandes de rendez-vous de vos clients</p>
      </div>

      <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-8 border border-white/20">
        <div class="flex gap-2">
          <button
            @click="activeTab = 'received'"
            :class="[
              activeTab === 'received'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              'px-4 py-2 rounded-xl transition-all duration-200 flex items-center font-semibold'
            ]"
          >
            Reçues ({{ receivedSuggestions.length }})
          </button>
          <button
            @click="activeTab = 'sent'"
            :class="[
              activeTab === 'sent'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              'px-4 py-2 rounded-xl transition-all duration-200 flex items-center font-semibold'
            ]"
          >
            Mes contre-propositions ({{ sentSuggestions.length }})
          </button>
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
        <div v-if="activeTab === 'received'">
          <div v-if="receivedSuggestions.length === 0" class="text-center py-12 bg-white/80 rounded-2xl">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-500 text-lg">Aucune proposition reçue</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="suggestion in receivedSuggestions"
              :key="suggestion.id"
              class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-all"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span :class="getStatusBadgeClass(suggestion.status)" class="px-3 py-1 text-xs rounded-full font-bold uppercase">
                      {{ getStatusLabel(suggestion.status) }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ formatRelativeTime(suggestion.created_at) }}
                    </span>
                  </div>

                  <h3 class="text-lg font-bold text-gray-900 mb-1">
                    {{ suggestion.suggested_by_first_name }} {{ suggestion.suggested_by_last_name }}
                  </h3>

                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-3 border border-blue-100">
                    <div class="flex items-center gap-4">
                      <div>
                        <p class="text-xs text-gray-600 font-medium">Date proposée</p>
                        <p class="font-bold text-blue-700">{{ formatDate(suggestion.suggested_start_time) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-600 font-medium">Horaire</p>
                        <p class="font-bold text-blue-700">
                          {{ formatTime(suggestion.suggested_start_time) }} - {{ formatTime(suggestion.suggested_end_time) }}
                        </p>
                      </div>
                    </div>
                    <p v-if="suggestion.notes" class="text-sm text-gray-700 mt-3 italic">
                      "{{ suggestion.notes }}"
                    </p>
                  </div>
                </div>

                <div v-if="suggestion.status === 'pending'" class="flex flex-col gap-2 ml-4">
                  <button
                    @click="acceptSuggestionAction(suggestion.id)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold text-sm whitespace-nowrap"
                  >
                     Accepter
                  </button>
                  <button
                    @click="openCounterModal(suggestion)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm whitespace-nowrap"
                  >
                     Contre-proposer
                  </button>
                  <button
                    @click="rejectSuggestionAction(suggestion.id)"
                    class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm whitespace-nowrap"
                  >
                     Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'sent'">
          <div v-if="sentSuggestions.length === 0" class="text-center py-12 bg-white/80 rounded-2xl">
            <p class="text-gray-500 text-lg">Aucune contre-proposition envoyée</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="suggestion in sentSuggestions"
              :key="suggestion.id"
              class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <span :class="getStatusBadgeClass(suggestion.status)" class="px-3 py-1 text-xs rounded-full font-bold uppercase mb-2 inline-block">
                    {{ getStatusLabel(suggestion.status) }}
                  </span>

                  <h3 class="text-lg font-bold text-gray-900 mb-1">
                    Envoyé à : {{ suggestion.suggested_to_first_name }} {{ suggestion.suggested_to_last_name }}
                  </h3>

                  <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mt-3 border border-purple-100">
                    <p class="font-bold text-purple-700">
                      {{ formatDate(suggestion.suggested_start_time) }} •
                      {{ formatTime(suggestion.suggested_start_time) }} - {{ formatTime(suggestion.suggested_end_time) }}
                    </p>
                    <p v-if="suggestion.notes" class="text-sm text-gray-700 mt-2 italic">
                      "{{ suggestion.notes }}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SuggestionModal
      v-if="counterModalSuggestion"
      :is-open="showCounterModal"
      :lawyer-id="authStore.user?.id || ''"
      @close="showCounterModal = false"
      @submitted="handleCounterSubmitted"
    />
  </div>
</template>

