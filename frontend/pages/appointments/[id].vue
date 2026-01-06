<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <button @click="$router.back()" class="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Retour à la liste
      </button>

      <div v-if="loading" class="bg-white rounded-xl p-12 text-center shadow-sm">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500">Chargement des détails...</p>
      </div>

      <div v-else-if="appointment" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div class="flex justify-between items-start mb-6">
            <div>
              <span :class="getStatusClass(appointment.status)" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                {{ getStatusLabel(appointment.status) }}
              </span>
              <h1 class="text-3xl font-extrabold text-gray-900">{{ appointment.title }}</h1>
              <p class="text-gray-500 mt-2 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {{ formatDate(appointment.start_time) }} • {{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}
              </p>
            </div>
            
            <div class="flex gap-2">
              <button
                v-if="appointment.status === 'scheduled' && authStore.user?.role === 'client'"
                @click="handleAction('confirm')"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
              >
                Confirmer
              </button>
              <button
                v-if="appointment.status !== 'completed' && appointment.status !== 'cancelled'"
                @click="handleAction('complete')"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
              >
                Terminer
              </button>
              <button
                v-if="appointment.status !== 'cancelled' && appointment.status !== 'completed'"
                @click="handleAction('cancel')"
                class="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-semibold"
              >
                Annuler
              </button>

              <!-- Message si rendez-vous terminé ou annulé -->
              <div v-if="appointment.status === 'completed'" class="flex items-center gap-2 text-gray-600 italic">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">Rendez-vous terminé</span>
              </div>

              <div v-if="appointment.status === 'cancelled'" class="flex items-center gap-2 text-gray-600 italic">
                <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">Rendez-vous annulé</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-400 uppercase font-bold mb-1">Type de RDV</p>
              <p class="font-semibold text-gray-900 capitalize">{{ appointment.appointment_type }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase font-bold mb-1">Mode</p>
              <p class="font-semibold text-gray-900">{{ getLocationTypeLabel(appointment.location_type) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase font-bold mb-1">Durée</p>
              <p class="font-semibold text-gray-900">{{ getDuration(appointment.start_time, appointment.end_time) }}</p>
            </div>
          </div>
        </div>

        <!-- Statut visuel détaillé -->
        <div v-if="appointment.status === 'confirmed'" class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-green-900 font-bold text-lg">✅ Rendez-vous confirmé</p>
              <p class="text-green-700 text-sm">Ce rendez-vous est confirmé et validé par toutes les parties</p>
            </div>
          </div>
        </div>

        <div v-if="appointment.status === 'scheduled'" class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-blue-900 font-bold text-lg">📅 Rendez-vous programmé</p>
              <p class="text-blue-700 text-sm">En attente de confirmation</p>
            </div>
          </div>
        </div>

        <div v-if="appointment.status === 'cancelled'" class="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-red-900 font-bold text-lg">❌ Rendez-vous annulé</p>
              <p class="text-red-700 text-sm">Ce rendez-vous a été annulé</p>
            </div>
          </div>
        </div>

        <div v-if="appointment.status === 'completed'" class="bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500 rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-gray-900 font-bold text-lg">✔️ Rendez-vous terminé</p>
              <p class="text-gray-700 text-sm">Ce rendez-vous a été effectué avec succès</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span class="mr-2">👤</span> Client & Dossier
            </h3>
            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-500">Client</p>
                <p class="font-medium">{{ appointment.client_first_name }} {{ appointment.client_last_name }}</p>
                <p class="text-sm text-blue-600">{{ appointment.client_email }}</p>
              </div>
              <div v-if="appointment.case_id" class="pt-4 border-t">
                <p class="text-sm text-gray-500">Dossier lié</p>
                <NuxtLink :to="`/cases/${appointment.case_id}`" class="font-medium text-blue-600 hover:underline">
                  {{ appointment.case_title || 'Voir le dossier' }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span class="mr-2">📍</span> Localisation
            </h3>
            <div v-if="appointment.location_type === 'online'">
              <p class="text-sm text-gray-500 mb-2">Lien de visioconférence</p>
              <a v-if="appointment.meeting_url" :href="appointment.meeting_url" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 break-all">
                Rejoindre la réunion
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
              <p v-else class="text-gray-400 italic text-sm">Aucun lien configuré</p>
            </div>
            <div v-else>
              <p class="text-sm text-gray-500">Adresse physique</p>
              <p class="font-medium">{{ appointment.location_address || 'Au cabinet' }}</p>
            </div>
          </div>
        </div>

        <!-- Section Propositions de créneaux -->
        <div v-if="suggestions.length > 0" class="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span class="mr-2">💬</span> Propositions de créneaux
            <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{{ suggestions.length }}</span>
          </h3>

          <div class="space-y-3">
            <div
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              class="border-l-4 rounded-r-lg p-4 transition-all"
              :class="getSuggestionBorderClass(suggestion.status)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span :class="getSuggestionBadgeClass(suggestion.status)" class="px-2 py-1 text-xs rounded-full font-bold">
                      {{ getSuggestionStatusLabel(suggestion.status) }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatRelativeTime(suggestion.created_at) }}
                    </span>
                  </div>

                  <p class="text-sm text-gray-700 font-medium mb-1">
                    <span v-if="authStore.user?.id === suggestion.suggested_by_user_id">
                      Vous avez proposé à
                      <strong>{{ suggestion.suggested_to_first_name }} {{ suggestion.suggested_to_last_name }}</strong>
                    </span>
                    <span v-else>
                      <strong>{{ suggestion.suggested_by_first_name }} {{ suggestion.suggested_by_last_name }}</strong> vous a proposé
                    </span>
                  </p>

                  <div class="bg-gray-50 rounded-lg p-3 mt-2 inline-block">
                    <p class="text-sm font-bold text-gray-900">
                      📅 {{ formatDate(suggestion.suggested_start_time) }}
                    </p>
                    <p class="text-sm text-blue-600 font-semibold">
                      🕐 {{ formatTime(suggestion.suggested_start_time) }} - {{ formatTime(suggestion.suggested_end_time) }}
                    </p>
                  </div>

                  <p v-if="suggestion.notes" class="text-xs text-gray-600 mt-2 italic">
                    "{{ suggestion.notes }}"
                  </p>
                </div>

                <!-- Actions pour les contre-propositions reçues (client ou avocat) -->
                <div v-if="suggestion.status === 'pending' && authStore.user?.id === suggestion.suggested_to_user_id" class="flex flex-col gap-2 ml-4">
                  <button
                    @click="acceptSuggestionAction(suggestion.id)"
                    class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-semibold whitespace-nowrap"
                  >
                    ✓ Accepter
                  </button>
                  <button
                    @click="rejectSuggestionAction(suggestion.id)"
                    class="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs font-semibold whitespace-nowrap"
                  >
                    ✗ Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppointmentSuggestion } from '~/types/suggestion';

const route = useRoute();
const authStore = useAuthStore();
const { getAppointmentById, confirmAppointment, cancelAppointment, completeAppointment } = useAppointment();
const { getAppointmentSuggestions, acceptSuggestion, rejectSuggestion } = useSuggestion();

const appointment = ref<any>(null);
const suggestions = ref<AppointmentSuggestion[]>([]);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    const [aptRes, sugRes] = await Promise.all([
      getAppointmentById(route.params.id as string),
      getAppointmentSuggestions(route.params.id as string)
    ]);

    if (aptRes.success) appointment.value = aptRes.data;
    if (sugRes.success) suggestions.value = sugRes.data;
  } finally {
    loading.value = false;
  }
};

const handleAction = async (action: 'confirm' | 'cancel' | 'complete') => {
  if (!appointment.value) return;
  
  if (action === 'cancel' && !confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
  if (action === 'confirm' && !confirm('Confirmer ce rendez-vous ?')) return;
  if (action === 'complete' && !confirm('Marquer ce rendez-vous comme terminé ?')) return;

  try {
    let res;

    if (action === 'confirm') res = await confirmAppointment(appointment.value.id);
    if (action === 'cancel') res = await cancelAppointment(appointment.value.id);
    if (action === 'complete') res = await completeAppointment(appointment.value.id);
    
    if (res?.success) {
      await loadData();
      const messages: Record<string, string> = {
        confirm: '✅ Rendez-vous confirmé avec succès',
        cancel: '❌ Rendez-vous annulé',
        complete: '✔️ Rendez-vous marqué comme terminé'
      };
      alert(messages[action]);
    }
  } catch (err) {
    console.error('Erreur action:', err);
    alert('❌ Action échouée');
  }
};

const acceptSuggestionAction = async (suggestionId: string) => {
  if (!confirm('Accepter cette proposition ? Cela modifiera la date du rendez-vous.')) return;

  try {
    const response = await acceptSuggestion(suggestionId);
    if (response.success) {
      alert('✅ Proposition acceptée ! Le rendez-vous a été mis à jour.');
      await loadData();
    }
  } catch (error) {
    console.error('Erreur acceptation:', error);
    alert('❌ Erreur lors de l\'acceptation');
  }
};

const rejectSuggestionAction = async (suggestionId: string) => {
  const reason = prompt('Raison du refus (optionnel) :');
  if (reason === null) return;

  try {
    const response = await rejectSuggestion(suggestionId, reason || undefined);
    if (response.success) {
      alert('Proposition refusée');
      await loadData();
    }
  } catch (error) {
    console.error('Erreur refus:', error);
    alert('❌ Erreur lors du refus');
  }
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

const getSuggestionStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    countered: 'Contre-proposée'
  };
  return labels[status] || status;
};

const getSuggestionBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    countered: 'bg-blue-100 text-blue-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getSuggestionBorderClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'border-yellow-400 bg-yellow-50',
    accepted: 'border-green-400 bg-green-50',
    rejected: 'border-red-400 bg-red-50',
    countered: 'border-blue-400 bg-blue-50'
  };
  return classes[status] || 'border-gray-400 bg-gray-50';
};

// Utils (mêmes que la page index)
const formatDate = (d: any) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatTime = (d: any) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const getDuration = (s: any, e: any) => {
  const diff = Math.floor((new Date(e).getTime() - new Date(s).getTime()) / 60000);
  return diff >= 60 ? `${Math.floor(diff/60)}h${diff%60 || ''}` : `${diff} min`;
};
const getStatusClass = (s: string) => ({ 'scheduled': 'bg-blue-100 text-blue-700', 'confirmed': 'bg-green-100 text-green-700', 'completed': 'bg-gray-100 text-gray-700', 'cancelled': 'bg-red-100 text-red-700' }[s] || 'bg-gray-100');
const getStatusLabel = (s: string) => ({ scheduled: 'Prévu', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé' }[s] || s);
const getLocationTypeLabel = (t: string) => ({ office: 'Au Cabinet', online: 'En Visioconférence', court: 'Au Tribunal', other: 'Autre' }[t] || t);

onMounted(loadData);
</script>