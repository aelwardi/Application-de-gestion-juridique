<script setup lang="ts">
import type { AppointmentSuggestion } from '~/types/suggestion';

definePageMeta({
  middleware: ['auth'],
  layout: 'authenticated',
})

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();
const confirmModal = useConfirm();
const { getAppointmentById, confirmAppointment, cancelAppointment } = useAppointment();
const { getAppointmentSuggestions, acceptSuggestion, rejectSuggestion } = useSuggestion();

const appointment = ref<any>(null);
const suggestions = ref<AppointmentSuggestion[]>([]);
const loading = ref(true);

const isAppointmentExpired = computed(() => {
  if (!appointment.value?.end_time) return false;
  const endTime = new Date(appointment.value.end_time);
  const now = new Date();
  return endTime < now;
});

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

const handleAction = async (action: 'confirm' | 'cancel') => {
  if (!appointment.value) return;

  const endTime = new Date(appointment.value.end_time);
  const now = new Date();

  if (endTime < now) {
    toast.warning('Ce rendez-vous est déjà passé et a été automatiquement marqué comme terminé.\n\nVous ne pouvez plus modifier son statut.');
    await loadData();
    return;
  }

  const confirmed = await confirmModal.confirm({
    title: action === 'cancel' ? 'Annuler le rendez-vous' : 'Confirmer le rendez-vous',
    message: action === 'cancel' ? 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?' : 'Confirmer ce rendez-vous ?',
    confirmText: action === 'cancel' ? 'Annuler' : 'Confirmer',
    cancelText: 'Retour',
  });

  if (!confirmed) return;

  try {
    let res;

    if (action === 'confirm') res = await confirmAppointment(appointment.value.id);
    if (action === 'cancel') res = await cancelAppointment(appointment.value.id);

    if (res?.success) {
      await loadData();
      const messages: Record<string, string> = {
        confirm: 'Rendez-vous confirmé avec succès',
        cancel: 'Rendez-vous annulé'
      };
      toast.success(messages[action] || 'Action effectuée');
    }
  } catch (err) {
    console.error('Erreur action:', err);
    toast.error('Action échouée');
  }
};

const acceptSuggestionAction = async (suggestionId: string) => {
  if (appointment.value) {
    const endTime = new Date(appointment.value.end_time);
    const now = new Date();

    if (endTime < now) {
      toast.warning('Ce rendez-vous est déjà passé.\n\nVous ne pouvez plus accepter de propositions pour ce rendez-vous.');
      await loadData();
      return;
    }
  }

  const confirmed = await confirmModal.confirm({
    title: 'Accepter la proposition',
    message: 'Accepter cette proposition ? Cela modifiera la date du rendez-vous.',
    confirmText: 'Accepter',
    cancelText: 'Annuler',
  });

  if (!confirmed) return;

  try {
    const response = await acceptSuggestion(suggestionId);
    if (response.success) {
      toast.success('Proposition acceptée ! Le rendez-vous a été mis à jour.');
      await loadData();
    }
  } catch (error) {
    console.error('Erreur acceptation:', error);
    toast.error('Erreur lors de l\'acceptation');
  }
};

const rejectSuggestionAction = async (suggestionId: string) => {
  const reason = prompt('Raison du refus (optionnel) :');
  if (reason === null) return;

  try {
    const response = await rejectSuggestion(suggestionId, reason || undefined);
    if (response.success) {
      toast.success('Proposition refusée');
      await loadData();
    }
  } catch (error) {
    console.error('Erreur refus:', error);
    toast.error('Erreur lors du refus');
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

const formatDate = (d: any) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatTime = (d: any) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const getDuration = (s: any, e: any) => {
  const diff = Math.floor((new Date(e).getTime() - new Date(s).getTime()) / 60000);
  return diff >= 60 ? `${Math.floor(diff/60)}h${diff%60 || ''}` : `${diff} min`;
};
const getStatusClass = (s: string) => ({ 'pending': 'bg-blue-100 text-blue-700', 'confirmed': 'bg-green-100 text-green-700', 'completed': 'bg-gray-100 text-gray-700', 'cancelled': 'bg-red-100 text-red-700', 'no_show': 'bg-orange-100 text-orange-700' }[s] || 'bg-gray-100');
const getStatusLabel = (s: string) => ({ pending: 'En attente', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé', no_show: 'Absent' }[s] || s);
const getLocationTypeLabel = (t: string) => ({ office: 'Au Cabinet', online: 'En Visioconférence', court: 'Au Tribunal', other: 'Autre' }[t] || t);

onMounted(loadData);
</script>



<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
      <button @click="$router.back()" class="group flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 transition-all hover:gap-3 font-medium">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Retour à la liste
      </button>

      <div v-if="loading" class="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p class="text-gray-600 font-medium">Chargement des détails du rendez-vous...</p>
      </div>

      <div v-else-if="appointment" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 transition-all hover:shadow-xl">
          <div class="flex justify-between items-start mb-8">
            <div class="flex-1">
              <span :class="getStatusClass(appointment.status)" class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block shadow-sm">
                {{ getStatusLabel(appointment.status) }}
              </span>
              <h1 class="text-4xl font-extrabold text-gray-900 mb-3">
                {{ appointment.title }}
              </h1>
              <p class="text-gray-600 mt-2 flex items-center gap-2 text-lg">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span class="font-medium">{{ formatDate(appointment.start_time) }}</span>
                <span class="text-indigo-600 font-bold">•</span>
                <span class="font-semibold text-indigo-600">{{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}</span>
              </p>
            </div>
            
            <div class="flex gap-3 flex-wrap">
              <button
                v-if="!isAppointmentExpired && appointment.status === 'pending' && authStore.user?.role === 'client'"
                @click="handleAction('confirm')"
                class="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Confirmer le RDV
              </button>
              <button
                v-if="!isAppointmentExpired && appointment.status !== 'cancelled' && appointment.status !== 'completed'"
                @click="handleAction('cancel')"
                class="group flex items-center gap-2 bg-white border-2 border-red-200 text-red-600 px-6 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                Annuler
              </button>

              <div v-if="isAppointmentExpired && appointment.status !== 'completed' && appointment.status !== 'cancelled'" class="flex items-center gap-3 bg-orange-50 border-2 border-orange-200 px-4 py-2.5 rounded-xl">
                <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-bold text-orange-700">Rendez-vous expiré</span>
              </div>

              <div v-if="appointment.status === 'completed'" class="flex items-center gap-3 bg-green-50 border-2 border-green-200 px-4 py-2.5 rounded-xl">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-bold text-green-700">Rendez-vous terminé</span>
              </div>

              <div v-if="appointment.status === 'cancelled'" class="flex items-center gap-3 bg-red-50 border-2 border-red-200 px-4 py-2.5 rounded-xl">
                <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-bold text-red-700">Rendez-vous annulé</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t-2 border-gray-100">
            <div class="group p-4 rounded-xl bg-indigo-50/80 hover:shadow-md transition-all">
              <p class="text-xs text-indigo-600 uppercase font-bold mb-2 tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
                Type de RDV
              </p>
              <p class="font-bold text-gray-900 text-lg capitalize">{{ appointment.appointment_type }}</p>
            </div>
            <div class="group p-4 rounded-xl bg-purple-50/80 hover:shadow-md transition-all">
              <p class="text-xs text-purple-600 uppercase font-bold mb-2 tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                Mode
              </p>
              <p class="font-bold text-gray-900 text-lg">{{ getLocationTypeLabel(appointment.location_type) }}</p>
            </div>
            <div class="group p-4 rounded-xl bg-blue-50/80 hover:shadow-md transition-all">
              <p class="text-xs text-blue-600 uppercase font-bold mb-2 tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
                Durée
              </p>
              <p class="font-bold text-gray-900 text-lg">{{ getDuration(appointment.start_time, appointment.end_time) }}</p>
            </div>
          </div>
        </div>

        <div v-if="isAppointmentExpired && appointment.status !== 'completed' && appointment.status !== 'cancelled'" class="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-6 shadow-md animate-fadeIn">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <svg class="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-orange-900 font-bold text-xl mb-2">Rendez-vous expiré</p>
              <p class="text-orange-800 text-sm leading-relaxed">
                Ce rendez-vous est déjà passé. Il sera automatiquement marqué comme terminé.
                Vous ne pouvez plus modifier son statut ni accepter de nouvelles propositions.
              </p>
            </div>
          </div>
        </div>

        <div v-if="appointment.status === 'confirmed'" class="bg-green-50 border-l-4 border-green-500 rounded-xl p-6 shadow-md animate-fadeIn">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <svg class="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-green-900 font-bold text-xl mb-2">Rendez-vous confirmé</p>
              <p class="text-green-800 text-sm leading-relaxed">Ce rendez-vous est confirmé et validé par toutes les parties. Vous recevrez un rappel avant la date prévue.</p>
            </div>
          </div>
        </div>

        <div v-if="appointment.status === 'pending'" class="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-6 shadow-md animate-fadeIn">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <svg class="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-blue-900 font-bold text-xl mb-2">Rendez-vous en attente</p>
              <p class="text-blue-800 text-sm leading-relaxed">En attente de confirmation définitive. Vous pouvez encore proposer des modifications.</p>
            </div>
          </div>
        </div>

        <div v-if="appointment.status === 'cancelled'" class="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 shadow-md animate-fadeIn">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <svg class="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-red-900 font-bold text-xl mb-2">Rendez-vous annulé</p>
              <p class="text-red-800 text-sm leading-relaxed">Ce rendez-vous a été annulé. Aucune action supplémentaire n'est requise.</p>
            </div>
          </div>
        </div>

        <div v-if="appointment.status === 'completed'" class="bg-gray-50 border-l-4 border-gray-500 rounded-xl p-6 shadow-md animate-fadeIn">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <svg class="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-gray-900 font-bold text-xl mb-2">Rendez-vous terminé</p>
              <p class="text-gray-800 text-sm leading-relaxed">Ce rendez-vous a été effectué avec succès. Merci pour votre collaboration.</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b-2 border-indigo-100">
              <div class="p-2 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Client & Dossier
            </h3>
            <div class="space-y-5">
              <div class="p-4 bg-indigo-50/70 rounded-xl">
                <p class="text-xs text-indigo-600 uppercase font-bold mb-2 tracking-wider">Client</p>
                <p class="font-bold text-gray-900 text-lg">{{ appointment.client_first_name }} {{ appointment.client_last_name }}</p>
                <a :href="`mailto:${appointment.client_email}`" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 mt-2 group">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {{ appointment.client_email }}
                </a>
              </div>
              <div v-if="appointment.case_id" class="p-4 bg-green-50/70 rounded-xl border-2 border-green-100">
                <p class="text-xs text-green-600 uppercase font-bold mb-2 tracking-wider">Dossier lié</p>
                <NuxtLink :to="`/cases/${appointment.case_id}`" class="group flex items-center gap-2 font-bold text-green-700 hover:text-green-800 transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {{ appointment.case_title || 'Voir le dossier' }}
                  <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b-2 border-purple-100">
              <div class="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Localisation
            </h3>
            <div v-if="appointment.location_type === 'online'" class="p-5 bg-blue-50/70 rounded-xl border-2 border-blue-100">
              <p class="text-xs text-blue-600 uppercase font-bold mb-3 tracking-wider">Lien de visioconférence</p>
              <a v-if="appointment.meeting_url" :href="appointment.meeting_url" target="_blank" class="inline-flex items-center gap-3 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Rejoindre la réunion
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
              <p v-else class="text-gray-500 italic text-sm font-medium">Aucun lien de visioconférence configuré</p>
            </div>
            <div v-else class="p-5 bg-purple-50/70 rounded-xl border-2 border-purple-100">
              <p class="text-xs text-purple-600 uppercase font-bold mb-3 tracking-wider">Adresse physique</p>
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                <p class="font-bold text-gray-900 text-lg">{{ appointment.location_address || 'Au cabinet' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="suggestions.length > 0" class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-fadeIn">
          <div class="flex items-center justify-between mb-6 pb-4 border-b-2 border-indigo-100">
            <h3 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              Propositions de créneaux
            </h3>
            <span class="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full text-sm font-bold shadow-md">
              {{ suggestions.length }} proposition{{ suggestions.length > 1 ? 's' : '' }}
            </span>
          </div>

          <div class="space-y-4">
            <div
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              class="border-l-4 rounded-r-xl p-5 transition-all hover:shadow-lg"
              :class="getSuggestionBorderClass(suggestion.status)"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3 flex-wrap">
                    <span :class="getSuggestionBadgeClass(suggestion.status)" class="px-3 py-1.5 text-xs rounded-full font-bold shadow-sm">
                      {{ getSuggestionStatusLabel(suggestion.status) }}
                    </span>
                    <span class="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                      {{ formatRelativeTime(suggestion.created_at) }}
                    </span>
                  </div>

                  <p class="text-sm text-gray-700 font-medium mb-3 leading-relaxed">
                    <span v-if="authStore.user?.id === suggestion.suggested_by_user_id">
                      Vous avez proposé un nouveau créneau à
                      <strong class="text-indigo-700">{{ suggestion.suggested_to_first_name }} {{ suggestion.suggested_to_last_name }}</strong>
                    </span>
                    <span v-else>
                      <strong class="text-indigo-700">{{ suggestion.suggested_by_first_name }} {{ suggestion.suggested_by_last_name }}</strong>
                      vous a proposé un nouveau créneau
                    </span>
                  </p>

                  <div class="bg-indigo-50/80 rounded-xl p-4 inline-block border-2 border-indigo-100">
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p class="text-sm font-bold text-gray-900">
                          {{ formatDate(suggestion.suggested_start_time) }}
                        </p>
                      </div>
                      <div class="h-6 w-px bg-indigo-200"></div>
                      <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                        <p class="text-sm text-indigo-700 font-bold">
                          {{ formatTime(suggestion.suggested_start_time) }} - {{ formatTime(suggestion.suggested_end_time) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p v-if="suggestion.notes" class="text-sm text-gray-600 mt-3 italic bg-gray-50 p-3 rounded-lg border-l-2 border-gray-300">
                    "{{ suggestion.notes }}"
                  </p>
                </div>

                <div v-if="suggestion.status === 'pending' && authStore.user?.id === suggestion.suggested_to_user_id" class="flex flex-col gap-3 ml-4">
                  <button
                    @click="acceptSuggestionAction(suggestion.id)"
                    class="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 whitespace-nowrap"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    Accepter
                  </button>
                  <button
                    @click="rejectSuggestionAction(suggestion.id)"
                    class="group flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-200 text-red-700 rounded-xl hover:bg-red-50 hover:border-red-300 text-sm font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

[class*="border-l-4"] {
  transition: all 0.3s ease;
}

[class*="border-l-4"]:hover {
  transform: translateX(4px);
}
</style>

