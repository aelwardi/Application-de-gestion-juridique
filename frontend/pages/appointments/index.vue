<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
          <p class="text-gray-600 mt-2">Gérez vos rendez-vous et consultations</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="openRouteOptimizer"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Optimiser
          </button>
          <button
            @click="openCreateModal"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nouveau rendez-vous
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div class="flex gap-2">
          <button
            @click="viewMode = 'list'"
            :class="[viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200', 'px-4 py-2 rounded-lg transition-colors flex items-center']"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            Liste
          </button>
          <button
            @click="viewMode = 'calendar'"
            :class="[viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200', 'px-4 py-2 rounded-lg transition-colors flex items-center']"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Calendrier
          </button>
          <button
            @click="viewMode = 'map'"
            :class="[viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200', 'px-4 py-2 rounded-lg transition-colors flex items-center']"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            Carte
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p class="text-sm text-gray-600">Aujourd'hui</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats.today || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p class="text-sm text-gray-600">Cette semaine</p>
          <p class="text-3xl font-bold text-purple-600">{{ stats.thisWeek || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p class="text-sm text-gray-600">À venir</p>
          <p class="text-3xl font-bold text-green-600">{{ stats.upcoming || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
          <p class="text-sm text-gray-600">Complétés</p>
          <p class="text-3xl font-bold text-gray-600">{{ stats.completed || 0 }}</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>

      <div v-else>
        <!-- Vue Liste -->
        <div v-if="viewMode === 'list'" class="bg-white rounded-lg shadow overflow-hidden">
          <div v-if="appointments.length === 0" class="text-center py-20 text-gray-500">
            Aucun rendez-vous trouvé.
          </div>
          <div v-else class="divide-y divide-gray-200">
            <div v-for="apt in appointments" :key="apt.id" class="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-16 h-16 bg-blue-50 rounded-lg flex flex-col items-center justify-center border border-blue-100">
                  <span class="text-xl font-bold text-blue-700">{{ getDay(apt.start_time) }}</span>
                  <span class="text-xs text-blue-600 uppercase">{{ getMonth(apt.start_time) }}</span>
                </div>
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-lg font-bold text-gray-900">{{ apt.title }}</h3>
                    <span :class="getStatusClass(apt.status)" class="px-2 py-0.5 text-xs rounded-full font-medium">
                      {{ getStatusLabel(apt.status) }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-x-4 text-sm text-gray-600">
                    <span>{{ formatTime(apt.start_time) }} - {{ formatTime(apt.end_time) }}</span>
                    <span class="text-blue-600 font-medium">{{ getTypeLabel(apt.appointment_type) }}</span>
                    <span v-if="apt.client_first_name">👤 {{ apt.client_first_name }} {{ apt.client_last_name }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <button 
                  v-if="!isLocked(apt.start_time)"
                  @click="openEditModal(apt)" 
                  class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Modifier"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <span v-else class="text-[10px] text-gray-400 italic">Verrouillé</span>
                
                <button @click="viewAppointment(apt.id)" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Détails →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vue Calendrier -->
        <div v-else-if="viewMode === 'calendar'" class="space-y-6">
          <div v-if="appointments.length === 0" class="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Aucun rendez-vous à afficher dans l'agenda.
          </div>
          <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
              <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">Agenda chronologique</h3>
              <div v-for="apt in sortedAppointments" :key="apt.id" class="bg-white border-l-4 border-blue-500 rounded-r-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                  <div class="text-center min-w-[60px]">
                    <p class="text-xs uppercase text-gray-500 font-bold">{{ getMonth(apt.start_time) }}</p>
                    <p class="text-2xl font-black text-gray-800">{{ getDay(apt.start_time) }}</p>
                  </div>
                  <div class="h-10 w-[1px] bg-gray-200"></div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ apt.title }}</p>
                    <p class="text-xs text-gray-500">{{ formatTime(apt.start_time) }} - {{ formatTime(apt.end_time) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                   <span class="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">{{ getTypeLabel(apt.appointment_type) }}</span>
                   <button @click="viewAppointment(apt.id)" class="p-2 hover:bg-gray-100 rounded-full">
                     <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                   </button>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-gray-800">Aujourd'hui</h3>
              <div class="bg-blue-600 rounded-xl p-6 text-white shadow-lg">
                <p class="text-blue-100 text-sm italic">Vous avez</p>
                <p class="text-4xl font-black">{{ stats.today || 0 }}</p>
                <p class="text-blue-100 text-sm">rendez-vous prévu(s)</p>
                <div class="mt-4 pt-4 border-t border-blue-500 text-xs">
                  {{ new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vue Carte -->
        <div v-else-if="viewMode === 'map'" class="h-[600px] bg-white rounded-lg shadow overflow-hidden">
          <ClientOnly>
            <AppointmentMap
              :appointments="appointments"
              :selected-appointment-id="selectedAppointmentId"
              @select-appointment="handleSelectAppointment"
            />
          </ClientOnly>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ isEditing ? 'Modifier le rendez-vous' : 'Programmer un rendez-vous' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Motif du rendez-vous *</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
              <select v-model="form.appointment_type" required class="w-full px-4 py-2 border rounded-lg">
                <option value="consultation">Consultation</option>
                <option value="court">Tribunal</option>
                <option value="meeting">Réunion</option>
                <option value="video">Visioconférence</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Lieu *</label>
              <select v-model="form.location_type" required class="w-full px-4 py-2 border rounded-lg">
                <option value="office">Cabinet</option>
                <option value="online">En ligne</option>
                <option value="court">Tribunal</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Dossier lié</label>
              <select v-model="form.case_id" class="w-full px-4 py-2 border rounded-lg" @change="onCaseChange">
                <option :value="null">Aucun dossier</option>
                <option v-for="c in cases" :key="c.id" :value="c.id">{{ c.title }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Client *</label>
              <select v-model="form.client_id" required class="w-full px-4 py-2 border rounded-lg">
                <option value="" disabled>Sélectionner un client</option>
                <option v-for="cl in clients" :key="cl.id" :value="cl.id">{{ cl.first_name }} {{ cl.last_name }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Début *</label>
              <input v-model="form.start_time" type="datetime-local" required class="w-full px-4 py-2 border rounded-lg">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Fin *</label>
              <input v-model="form.end_time" type="datetime-local" :min="form.start_time" required class="w-full px-4 py-2 border rounded-lg">
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8">
            <button type="button" @click="closeModal" class="px-6 py-2 border rounded-lg">Annuler</button>
            <button type="submit" :disabled="submitting" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold">
              {{ submitting ? 'Chargement...' : (isEditing ? 'Enregistrer les modifications' : 'Confirmer le RDV') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Conflict Modal -->
    <ConflictModal
      :is-open="showConflictModal"
      :conflicts="conflictData?.conflicts || []"
      :available-slots="conflictData?.availableSlots || []"
      :allow-force="true"
      @close="showConflictModal = false"
      @select-slot="handleSelectSlot"
      @force-create="handleForceCreate"
    />

    <!-- Route Optimizer Modal -->
    <div v-if="showRouteOptimizer" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <RouteOptimizer
        :lawyer-id="authStore.user?.id || ''"
        :date="new Date().toISOString().split('T')[0]"
        @close="showRouteOptimizer = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import AppointmentMap from '~/components/appointments/AppointmentMap.vue'
import ConflictModal from '~/components/appointments/ConflictModal.vue'
import RouteOptimizer from '~/components/appointments/RouteOptimizer.vue'

definePageMeta({ middleware: 'auth', layout: 'authenticated' });

const route = useRoute();
const authStore = useAuthStore();
const { getAllAppointments, createAppointment, updateAppointment, getAppointmentStats, getClients } = useAppointment();
const { getAllCases } = useCase();
const { checkConflicts, getAvailableSlots } = useConflict();

const appointments = ref<any[]>([]);
const cases = ref<any[]>([]);
const clients = ref<any[]>([]);
const stats = ref<any>({});
const loading = ref(true);
const submitting = ref(false);
const showCreateModal = ref(false);
const isEditing = ref(false);
const currentEditId = ref<string | null>(null);
const viewMode = ref<'list' | 'calendar' | 'map'>('list');
const selectedAppointmentId = ref<string | null>(null);
const showConflictModal = ref(false);
const conflictData = ref<any>(null);
const showRouteOptimizer = ref(false);

const form = ref({
  title: '',
  appointment_type: 'consultation',
  location_type: 'office',
  location_address: '',
  meeting_url: '',
  start_time: '',
  end_time: '',
  case_id: null,
  client_id: '',
  lawyer_id: ''
});

onMounted(() => fetchInitialData());

const fetchInitialData = async () => {
  loading.value = true;
  const userId = authStore.user?.id;
  try {
    const [aptRes, statsRes, casesRes, clientsRes] = await Promise.all([
      getAllAppointments({ lawyer_id: userId }),
      getAppointmentStats(userId),
      getAllCases({ lawyer_id: userId }),
      getClients()
    ]);
    if (aptRes.success) appointments.value = aptRes.data;
    if (statsRes.success) stats.value = statsRes.data;
    if (casesRes.success) cases.value = casesRes.data;
    clients.value = clientsRes;

    // LOGIQUE DE PRÉ-REMPLISSAGE AUTOMATIQUE
    if (route.query.create === 'true') {
      isEditing.value = false;
      resetForm();
      
      // On attend que le DOM se mette à jour avec les listes chargées
      await nextTick();
      
      if (route.query.caseId) form.value.case_id = route.query.caseId as any;
      if (route.query.clientId) form.value.client_id = route.query.clientId as string;
      
      form.value.title = "Consultation Dossier";
      showCreateModal.value = true;
    }
    
  } finally {
    loading.value = false;
  }
};

const sortedAppointments = computed(() => {
  return [...appointments.value].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
});

const openCreateModal = () => {
  isEditing.value = false;
  resetForm();
  showCreateModal.value = true;
};

const openEditModal = (apt: any) => {
  isEditing.value = true;
  currentEditId.value = apt.id;
  form.value = {
    ...apt,
    start_time: new Date(apt.start_time).toISOString().slice(0, 16),
    end_time: new Date(apt.end_time).toISOString().slice(0, 16),
  };
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  resetForm();
};

const resetForm = () => {
  form.value = {
    title: '', appointment_type: 'consultation', location_type: 'office',
    location_address: '', meeting_url: '', start_time: '', end_time: '',
    case_id: null, client_id: '', lawyer_id: authStore.user?.id || ''
  };
};

const isLocked = (startTime: string) => {
  const aptTime = new Date(startTime).getTime();
  const now = new Date().getTime();
  return (aptTime - now) < (24 * 60 * 60 * 1000);
};

const onCaseChange = () => {
  const selectedCase = cases.value.find(c => c.id === form.value.case_id);
  if (selectedCase) form.value.client_id = selectedCase.client_id;
};

const handleSubmit = async () => {
  const start = new Date(form.value.start_time).getTime();
  const end = new Date(form.value.end_time).getTime();
  if (end <= start) { alert("L'heure de fin doit être après l'heure de début."); return; }
  if (isEditing.value && isLocked(form.value.start_time)) { alert("Modification impossible à moins de 24h."); return; }

  // Vérifier les conflits
  const conflictCheck = await checkConflicts(
    form.value.lawyer_id || authStore.user?.id,
    new Date(form.value.start_time).toISOString(),
    new Date(form.value.end_time).toISOString(),
    isEditing.value ? currentEditId.value : undefined
  );

  if (conflictCheck.hasConflict) {
    // Récupérer les créneaux disponibles
    const dateStr = new Date(form.value.start_time).toISOString().split('T')[0];
    const slotsRes = await getAvailableSlots(
      form.value.lawyer_id || authStore.user?.id,
      dateStr,
      60
    );

    conflictData.value = {
      conflicts: conflictCheck.conflicts,
      availableSlots: slotsRes.success ? slotsRes.slots : []
    };
    showConflictModal.value = true;
    return;
  }

  await saveAppointment();
};

const saveAppointment = async () => {
  submitting.value = true;
  try {
    const payload = {
      ...form.value,
      start_time: new Date(form.value.start_time).toISOString(),
      end_time: new Date(form.value.end_time).toISOString(),
    };
    const res = isEditing.value ? await updateAppointment(currentEditId.value!, payload) : await createAppointment(payload);
    if (res.success) {
      await fetchInitialData();
      closeModal();
      alert(isEditing.value ? 'Rendez-vous mis à jour !' : 'Rendez-vous créé !');
    }
  } finally {
    submitting.value = false;
  }
};

const handleSelectSlot = (slot: any) => {
  form.value.start_time = new Date(slot.start).toISOString().slice(0, 16);
  form.value.end_time = new Date(slot.end).toISOString().slice(0, 16);
  showConflictModal.value = false;
};

const handleForceCreate = async () => {
  showConflictModal.value = false;
  await saveAppointment();
};

const openRouteOptimizer = () => {
  showRouteOptimizer.value = true;
};

const getDay = (d: any) => new Date(d).getDate();
const getMonth = (d: any) => new Date(d).toLocaleDateString('fr-FR', { month: 'short' });
const formatTime = (d: any) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const getStatusClass = (s: string) => {
  const map: any = { scheduled: 'bg-blue-100 text-blue-700', confirmed: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700' };
  return map[s] || 'bg-gray-100';
};
const getStatusLabel = (s: string) => {
  const map: any = { scheduled: 'Prévu', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé' };
  return map[s] || s;
};
const getTypeLabel = (t: string) => {
  const map: any = { consultation: 'Consultation', court: 'Tribunal', meeting: 'Réunion', video: 'Visio' };
  return map[t] || t;
};
const viewAppointment = (id: string) => navigateTo(`/appointments/${id}`);
const handleSelectAppointment = (id: string) => {
  selectedAppointmentId.value = id;
  // Optionnel: naviguer vers les détails
  // navigateTo(`/appointments/${id}`);
};
</script>