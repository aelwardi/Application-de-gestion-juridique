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
              <button v-if="appointment.status === 'scheduled'" @click="handleAction('confirm')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold">
                Confirmer
              </button>
              <button v-if="appointment.status !== 'completed' && appointment.status !== 'cancelled'" @click="handleAction('complete')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                Terminer
              </button>
              <button v-if="appointment.status !== 'cancelled'" @click="handleAction('cancel')" class="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-semibold">
                Annuler
              </button>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { getAppointmentById, confirmAppointment, cancelAppointment, completeAppointment } = useAppointment();

const appointment = ref<any>(null);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getAppointmentById(route.params.id as string);
    if (res.success) appointment.value = res.data;
  } finally {
    loading.value = false;
  }
};

const handleAction = async (action: 'confirm' | 'cancel' | 'complete') => {
  if (!appointment.value) return;
  
  if (action === 'cancel' && !confirm('Annuler ce rendez-vous ?')) return;

  try {
    let res;
    if (action === 'confirm') res = await confirmAppointment(appointment.value.id);
    if (action === 'cancel') res = await cancelAppointment(appointment.value.id);
    if (action === 'complete') res = await completeAppointment(appointment.value.id);
    
    if (res?.success) await loadData();
  } catch (err) {
    alert('Action échouée');
  }
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