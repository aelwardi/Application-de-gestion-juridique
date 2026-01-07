<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div class="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp">
      <!-- Header compact -->
      <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3.5 rounded-t-xl z-10">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 class="text-lg font-bold">Proposer un créneau</h2>
          </div>
          <button
            @click="$emit('close')"
            class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5 space-y-4">
        <!-- Alerte si lawyerId manquant -->
        <div v-if="!props.lawyerId" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-800 font-medium">
              Erreur : L'ID de l'avocat est manquant. Impossible de charger les créneaux disponibles.
            </p>
          </div>
        </div>

        <!-- Sélecteur de date -->
        <div v-if="props.lawyerId">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Sélectionner une date</label>
          <input
            v-model="selectedDate"
            type="date"
            :min="minDate"
            @change="loadAvailableSlots"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          >
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
          <p class="text-gray-600 mt-2 text-sm">Chargement des disponibilités...</p>
        </div>

        <!-- Calendrier des créneaux disponibles -->
        <div v-else-if="availableSlots.length > 0">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg mb-3">
            <p class="text-xs text-blue-800 font-medium flex items-center">
              <svg class="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ availableSlots.length }} créneaux disponibles le {{ formatDateFr(selectedDate) }}
            </p>
          </div>

          <div class="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
            <button
              v-for="(slot, index) in availableSlots"
              :key="index"
              @click="selectSlot(slot)"
              :class="[
                'p-3 rounded-lg border-2 transition-all duration-200 text-left',
                selectedSlot?.start === slot.start
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
              ]"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div :class="selectedSlot?.start === slot.start ? 'text-white' : 'text-gray-900'" class="font-bold text-sm">
                    {{ formatTime(slot.start) }}
                  </div>
                  <div :class="selectedSlot?.start === slot.start ? 'text-blue-100' : 'text-gray-500'" class="text-xs">
                    {{ formatTime(slot.end) }}
                  </div>
                </div>
                <svg
                  v-if="selectedSlot?.start === slot.start"
                  class="w-5 h-5 text-white flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Aucun créneau disponible -->
        <div v-else-if="!loading && selectedDate" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-600 font-medium text-sm">Aucun créneau disponible pour cette date</p>
          <p class="text-gray-400 text-xs mt-1">Essayez une autre date ou contactez directement l'avocat</p>
        </div>

        <!-- Notes optionnelles -->
        <div v-if="selectedSlot">
          <label class="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Message (optionnel)</label>
          <textarea
            v-model="notes"
            rows="2"
            placeholder="Ajoutez un message pour l'avocat..."
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
          ></textarea>
        </div>

        <!-- Récapitulatif -->
        <div v-if="selectedSlot" class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <p class="text-xs font-semibold text-blue-900 mb-1.5 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Créneau sélectionné
          </p>
          <div class="bg-white rounded-lg p-2.5 border border-blue-100">
            <p class="font-semibold text-gray-900 text-sm">{{ formatDateFr(selectedDate) }}</p>
            <p class="text-blue-600 font-semibold text-sm">{{ formatTime(selectedSlot.start) }} - {{ formatTime(selectedSlot.end) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-3 border-t">
          <button
            @click="$emit('close')"
            class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold text-sm"
          >
            Annuler
          </button>
          <button
            @click="submitSuggestion"
            :disabled="!selectedSlot || submitting"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
          >
            {{ submitting ? 'Envoi...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AvailableSlot } from '~/types/suggestion';

const props = defineProps<{
  isOpen: boolean;
  lawyerId: string;
  appointmentId?: string;
}>();

const emit = defineEmits<{
  close: [];
  submitted: [];
}>();

const { getAvailableSlots, createSuggestion } = useSuggestion();

const selectedDate = ref('');
const availableSlots = ref<AvailableSlot[]>([]);
const selectedSlot = ref<AvailableSlot | null>(null);
const notes = ref('');
const loading = ref(false);
const submitting = ref(false);

// Date minimale = demain
const minDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});

// Initialiser avec demain
onMounted(() => {
  if (minDate.value) {
    selectedDate.value = minDate.value;
    loadAvailableSlots();
  }
});

const loadAvailableSlots = async () => {
  if (!selectedDate.value) return;

  if (!props.lawyerId) {
    console.error('lawyerId est requis pour charger les créneaux disponibles');
    availableSlots.value = [];
    return;
  }

  loading.value = true;
  selectedSlot.value = null;

  try {
    const response = await getAvailableSlots(props.lawyerId, selectedDate.value, 60);
    if (response.success) {
      availableSlots.value = response.data;
    }
  } catch (error) {
    console.error('Erreur chargement créneaux:', error);
    availableSlots.value = [];
  } finally {
    loading.value = false;
  }
};

const selectSlot = (slot: AvailableSlot) => {
  selectedSlot.value = slot;
};

const submitSuggestion = async () => {
  if (!selectedSlot.value) return;

  submitting.value = true;
  try {
    const response = await createSuggestion({
      appointment_id: props.appointmentId,
      suggested_to_user_id: props.lawyerId,
      suggested_start_time: selectedSlot.value.start,
      suggested_end_time: selectedSlot.value.end,
      notes: notes.value || undefined
    });

    if (response.success) {
      alert('✅ Proposition envoyée avec succès !');
      emit('submitted');
      emit('close');
    }
  } catch (error) {
    console.error('Erreur envoi proposition:', error);
    alert('❌ Erreur lors de l\'envoi de la proposition');
  } finally {
    submitting.value = false;
  }
};

const formatDateFr = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Recharger les créneaux quand le modal s'ouvre
watch(() => props.isOpen, (newVal) => {
  if (newVal && minDate.value) {
    selectedDate.value = minDate.value;
    loadAvailableSlots();
  }
});
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

