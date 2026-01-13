<script setup lang="ts">
import type { Lawyer, CreateLawyerRequestInput } from '~/types/lawyer';

const props = defineProps<{
  lawyer: Lawyer | null;
  specialties: any[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit'): void;
}>();

const { createLawyerRequest } = useLawyer();

const formData = ref<CreateLawyerRequestInput>({
  lawyer_id: props.lawyer?.id || '',
  title: '',
  description: '',
  case_type: '',
  urgency: 'medium',
  budget_min: undefined,
  budget_max: undefined,
  preferred_date: undefined,
});

const loading = ref(false);
const error = ref('');

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const isFormValid = computed(() => {
  return (
      formData.value.title.trim() !== '' &&
      formData.value.description.trim() !== '' &&
      formData.value.case_type.trim() !== '' &&
      formData.value.description.length <= 1000
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = '';

  try {
    await createLawyerRequest({
      ...formData.value,
      lawyer_id: props.lawyer!.id,
    });

    alert('Votre demande a été envoyée avec succès !');
    emit('submit');
  } catch (err: any) {
    console.error('Error sending request:', err);
    error.value = err.message || 'Une erreur est survenue lors de l\'envoi de la demande';
  } finally {
    loading.value = false;
  }
};

watch(
    () => props.lawyer,
    (newLawyer) => {
      if (newLawyer) {
        formData.value.lawyer_id = newLawyer.id;
      }
    },
    { immediate: true }
);
</script>




<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="$emit('close')"
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

        <div
          class="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6"
        >
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">
                Envoyer une demande
              </h3>
              <p class="mt-1 text-sm text-gray-600">
                Contactez {{ lawyer?.firstName }} {{ lawyer?.lastName }} pour votre dossier
              </p>
            </div>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-500 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <img
                :src="lawyer?.profilePictureUrl || '/images/default-avatar.png'"
                :alt="`${lawyer?.firstName} ${lawyer?.lastName}`"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p class="font-semibold text-gray-900">
                  {{ lawyer?.firstName }} {{ lawyer?.lastName }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ lawyer?.specialties?.join(', ') }}
                </p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Titre de votre demande <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                placeholder="Ex: Besoin d'un avocat pour divorce"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Type de dossier <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.case_type"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un type</option>
                <option v-for="specialty in specialties" :key="specialty.name" :value="specialty.name">
                  {{ specialty.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="formData.description"
                required
                rows="5"
                placeholder="Décrivez votre situation et vos besoins juridiques..."
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">
                {{ formData.description.length }} / 1000 caractères
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'urgence
              </label>
              <select
                v-model="formData.urgency"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Budget minimum (€)
                </label>
                <input
                  v-model.number="formData.budget_min"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Ex: 500"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Budget maximum (€)
                </label>
                <input
                  v-model.number="formData.budget_max"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Ex: 2000"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date de rendez-vous souhaitée
              </label>
              <input
                v-model="formData.preferred_date"
                type="date"
                :min="minDate"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition font-medium"
                :disabled="loading"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="loading || !isFormValid"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
                <span v-else>Envoyer la demande</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

