<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl z-10">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-black">Proposer un créneau</h2>
          <button
            @click="$emit('close')"
            class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-blue-100 mt-2">Consultez les disponibilités de l'avocat et choisissez un créneau</p>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Sélecteur de date -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-gray-700 mb-2">Sélectionner une date</label>
          <input
            v-model="selectedDate"
            type="date"
            :min="minDate"
            @change="loadAvailableSlots"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p class="text-gray-600 mt-3">Chargement des disponibilités...</p>
        </div>

        <!-- Calendrier des créneaux disponibles -->
        <div v-else-if="availableSlots.length > 0" class="space-y-4">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
            <p class="text-sm text-blue-800 font-medium">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ availableSlots.length }} créneaux disponibles le {{ formatDateFr(selectedDate) }}
            </p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            <button
              v-for="(slot, index) in availableSlots"
              :key="index"
              @click="selectSlot(slot)"
              :class="[
                'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                selectedSlot?.start === slot.start
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105'
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
              ]"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div :class="selectedSlot?.start === slot.start ? 'text-white' : 'text-gray-900'" class="font-bold text-lg">
                    {{ formatTime(slot.start) }}
                  </div>
                  <div :class="selectedSlot?.start === slot.start ? 'text-blue-100' : 'text-gray-500'" class="text-xs">
                    {{ formatTime(slot.end) }}
                  </div>
                </div>
                <svg
                  v-if="selectedSlot?.start === slot.start"
                  class="w-6 h-6 text-white"
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
        <div v-else-if="!loading && selectedDate" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Aucun créneau disponible pour cette date</p>
          <p class="text-gray-400 text-sm mt-2">Essayez une autre date ou contactez directement l'avocat</p>
        </div>

        <!-- Notes optionnelles -->
        <div v-if="selectedSlot" class="mt-6">
          <label class="block text-sm font-bold text-gray-700 mb-2">Message (optionnel)</label>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="Ajoutez un message pour l'avocat..."
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Récapitulatif -->
        <div v-if="selectedSlot" class="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <p class="text-sm font-bold text-blue-900 mb-2">📅 Créneau sélectionné :</p>
          <div class="bg-white rounded-lg p-3 border border-blue-100">
            <p class="font-bold text-gray-900">{{ formatDateFr(selectedDate) }}</p>
            <p class="text-blue-600 font-semibold">{{ formatTime(selectedSlot.start) }} - {{ formatTime(selectedSlot.end) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mt-6 pt-6 border-t">
          <button
            @click="$emit('close')"
            class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
          >
            Annuler
          </button>
          <button
            @click="submitSuggestion"
            :disabled="!selectedSlot || submitting"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
          >
            {{ submitting ? '⏳ Envoi...' : '✓ Confirmer la proposition' }}
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

