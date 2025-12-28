<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Demander un Avocat</h2>

    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Type de demande *</label>
        <select v-model="form.request_type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">Sélectionnez...</option>
          <option value="consultation">Consultation</option>
          <option value="new_case">Nouveau dossier</option>
          <option value="second_opinion">Second avis</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
        <input v-model="form.title" type="text" required placeholder="Ex: Divorce amiable" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
      </div>

      <div v-if="showLawyerSelect" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Choisir un avocat spécifique *</label>
        <select v-model="form.lawyer_id" required :disabled="loadingLawyers" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
          <option value="">{{ loadingLawyers ? 'Chargement...' : 'Sélectionnez un avocat...' }}</option>
          <option v-for="lawyer in lawyers" :key="lawyer.lawyerTableId" :value="lawyer.lawyerTableId">
            Maitre {{ lawyer.first_name }} {{ lawyer.last_name }}
          </option>
        </select>
        <p v-if="!loadingLawyers && lawyers.length === 0" class="text-xs text-red-500 mt-1">
          Aucun avocat trouvé dans la liste des utilisateurs.
        </p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie juridique</label>
        <select v-model="form.case_category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">Sélectionnez...</option>
          <option value="Droit pénal">Droit pénal</option>
          <option value="Droit civil">Droit civil</option>
          <option value="Droit de la famille">Droit de la famille</option>
          <option value="Droit du travail">Droit du travail</option>
          <option value="Droit commercial">Droit commercial</option>
          <option value="Droit immobilier">Droit immobilier</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea v-model="form.description" required rows="4" placeholder="Détails..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Budget min (€)</label>
          <input v-model.number="form.budget_min" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Budget max (€)</label>
          <input v-model.number="form.budget_max" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Date préférée</label>
        <input v-model="form.preferred_date" type="datetime-local" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
      </div>

      <div class="flex justify-end gap-4">
        <button type="button" @click="$emit('cancel')" class="px-6 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
        <button type="submit" :disabled="loading" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Envoi...' : 'Envoyer la demande' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['success', 'cancel']);
const props = defineProps({ showLawyerSelect: { type: Boolean, default: true } });

const authStore = useAuthStore();
const { getLawyers } = useCase();
const { apiFetch } = useApi();

const lawyers = ref<any[]>([]);

watch(lawyers, (val) => {
  console.log('[DEBUG] Liste des avocats pour le select:', val)
})
const loading = ref(false);
const loadingLawyers = ref(false);

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

const loadData = async () => {
  loadingLawyers.value = true;
  try {
    const data = await getLawyers();
    lawyers.value = data;
  } catch (e) {
    console.error("Erreur chargement:", e);
  } finally {
    loadingLawyers.value = false;
  }
};

const handleSubmit = async () => {
  if (!authStore.user) return;
  loading.value = true;
  try {
    const payload = {
      client_id: authStore.user.id,
      ...form.value,
      lawyer_id: form.value.lawyer_id || undefined,
    };
    console.log('[CLIENT] Envoi demande avec lawyer_id:', payload.lawyer_id);
    await apiFetch('/clients-extended/requests', { method: 'POST', body: JSON.stringify(payload) });
    emit('success');
  } catch (error) {
    alert("Erreur lors de l'envoi");
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>