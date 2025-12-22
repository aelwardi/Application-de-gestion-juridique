<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Demander un Avocat</h2>

    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Type de demande *</label>
        <select
          v-model="form.request_type"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionnez...</option>
          <option value="consultation">Consultation</option>
          <option value="new_case">Nouveau dossier</option>
          <option value="second_opinion">Second avis</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
        <input
          v-model="form.title"
          type="text"
          required
          placeholder="Ex: Consultation pour divorce"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie juridique</label>
        <select
          v-model="form.case_category"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionnez...</option>
          <option value="Droit pénal">Droit pénal</option>
          <option value="Droit civil">Droit civil</option>
          <option value="Droit de la famille">Droit de la famille</option>
          <option value="Droit du travail">Droit du travail</option>
          <option value="Droit commercial">Droit commercial</option>
          <option value="Droit immobilier">Droit immobilier</option>
          <option value="Droit fiscal">Droit fiscal</option>
          <option value="Droit administratif">Droit administratif</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          v-model="form.description"
          required
          rows="5"
          placeholder="Décrivez votre situation en détail..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Niveau d'urgence</label>
        <div class="flex gap-4">
          <label class="flex items-center">
            <input v-model="form.urgency" type="radio" value="low" class="mr-2" />
            <span>Faible</span>
          </label>
          <label class="flex items-center">
            <input v-model="form.urgency" type="radio" value="normal" class="mr-2" checked />
            <span>Normal</span>
          </label>
          <label class="flex items-center">
            <input v-model="form.urgency" type="radio" value="high" class="mr-2" />
            <span>Élevé</span>
          </label>
          <label class="flex items-center">
            <input v-model="form.urgency" type="radio" value="urgent" class="mr-2" />
            <span>Urgent</span>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Budget minimum (€)</label>
          <input
            v-model.number="form.budget_min"
            type="number"
            step="50"
            min="0"
            placeholder="500"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Budget maximum (€)</label>
          <input
            v-model.number="form.budget_max"
            type="number"
            step="50"
            min="0"
            placeholder="2000"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Date préférée</label>
        <input
          v-model="form.preferred_date"
          type="datetime-local"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div v-if="showLawyerSelect" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Avocat spécifique (optionnel)</label>
        <select
          v-model="form.lawyer_id"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Aucun (recherche automatique)</option>
        </select>
      </div>

      <div class="flex justify-end gap-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Envoi...' : 'Envoyer la demande' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['success', 'cancel']);
const props = defineProps({
  showLawyerSelect: {
    type: Boolean,
    default: false,
  },
});

const authStore = useAuthStore();
const { apiFetch } = useApi();

const form = ref({
  request_type: '',
  title: '',
  case_category: '',
  description: '',
  urgency: 'normal',
  budget_min: null,
  budget_max: null,
  preferred_date: '',
  lawyer_id: '',
});

const loading = ref(false);

const handleSubmit = async () => {
  if (!authStore.user) return;

  try {
    loading.value = true;

    const payload = {
      client_id: authStore.user.id,
      ...form.value,
      lawyer_id: form.value.lawyer_id || undefined,
      budget_min: form.value.budget_min || undefined,
      budget_max: form.value.budget_max || undefined,
      preferred_date: form.value.preferred_date || undefined,
    };

    await apiFetch('/clients-extended/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    emit('success');

    form.value = {
      request_type: '',
      title: '',
      case_category: '',
      description: '',
      urgency: 'normal',
      budget_min: null,
      budget_max: null,
      preferred_date: '',
      lawyer_id: '',
    };
  } catch (error) {
    console.error('Error submitting request:', error);
    alert('Erreur lors de l\'envoi de la demande');
  } finally {
    loading.value = false;
  }
};
</script>