<template>
  <div class="bg-white rounded-lg">
    <div v-if="form.lawyer_id" class="mb-4 p-2 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
      <span class="text-green-600"></span>
      <p class="text-[10px] font-black text-green-700 uppercase">Avocat lié avec succès</p>
    </div>
    <div v-else class="mb-4 p-2 bg-orange-50 rounded-lg border border-orange-100 flex items-center gap-2">
      <span class="text-orange-600"></span>
      <p class="text-[10px] font-black text-orange-700 uppercase">Mode modification - Avocat: {{ initialData?.lawyer_id ? 'Déjà assigné' : 'Non assigné' }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-xs font-black uppercase text-gray-500 mb-1">Type de demande *</label>
        <select v-model="form.request_type" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option value="">Sélectionnez...</option>
          <option value="consultation">Consultation</option>
          <option value="new_case">Nouveau dossier</option>
          <option value="second_opinion">Second avis</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-black uppercase text-gray-500 mb-1">Titre *</label>
        <input v-model="form.title" type="text" required class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ex: Divorce amiable" />
      </div>

      <div>
        <label class="block text-xs font-black uppercase text-gray-500 mb-1">Catégorie juridique</label>
        <select v-model="form.case_category" class="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="">Sélectionnez...</option>
          <option value="Droit pénal">Droit pénal</option>
          <option value="Droit civil">Droit civil</option>
          <option value="Droit de la famille">Droit de la famille</option>
          <option value="Droit du travail">Droit du travail</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-black uppercase text-gray-500 mb-1">Description *</label>
        <textarea v-model="form.description" required rows="3" class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Détails de votre situation..."></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-black uppercase text-gray-500 mb-1">Budget min (€)</label>
          <input v-model.number="form.budget_min" type="number" class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label class="block text-xs font-black uppercase text-gray-500 mb-1">Budget max (€)</label>
          <input v-model.number="form.budget_max" type="number" class="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t">
        <button type="button" @click="$emit('cancel')" class="px-4 py-2 border rounded-lg text-xs font-bold uppercase hover:bg-gray-50 transition">
          Annuler
        </button>
        <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-700 disabled:opacity-50 transition">
          {{ loading ? 'Envoi...' : (initialData ? 'Enregistrer les modifications' : 'Envoyer la demande') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  initialData: { type: Object, default: null },
  preselectedLawyerId: { type: String, default: '' }
});

const emit = defineEmits(['success', 'cancel']);
const authStore = useAuthStore();
const { apiFetch } = useApi();
const loading = ref(false);

const emptyForm = {
  request_type: '',
  title: '',
  case_category: '',
  description: '',
  urgency: 'medium',
  budget_min: null,
  budget_max: null,
  lawyer_id: '', // Sera rempli par la prop
};

const form = ref({ ...emptyForm });

// Fonction pour synchroniser l'ID de l'avocat
const syncLawyerId = () => {
  if (props.preselectedLawyerId) {
    console.log("[DEBUG FORM] Injection du lawyer_id:", props.preselectedLawyerId);
    form.value.lawyer_id = props.preselectedLawyerId;
  }
};

const fillForm = () => {
  if (props.initialData) {
    form.value = {
      request_type: props.initialData.request_type || '',
      title: props.initialData.title || '',
      case_category: props.initialData.case_category || '',
      description: props.initialData.description || '',
      urgency: props.initialData.urgency || 'medium',
      budget_min: props.initialData.budget_min || null,
      budget_max: props.initialData.budget_max || null,
      lawyer_id: props.initialData.lawyer_id || '',
    };
  } else {
    form.value = { ...emptyForm };
    syncLawyerId(); // On injecte l'ID au démarrage
  }
};

// On surveille si la prop change (ex: fermeture/réouverture de modale)
watch(() => props.preselectedLawyerId, () => {
  if (!props.initialData) syncLawyerId();
}, { immediate: true });

const handleSubmit = async () => {
  if (!authStore.user) return;
  
  const isEdit = !!props.initialData;

  // En mode création, vérifier que lawyer_id est présent
  // En mode édition, on peut modifier sans changer l'avocat
  if (!isEdit && !form.value.lawyer_id) {
    alert("Erreur: L'ID de l'avocat est manquant. La demande ne peut pas être envoyée.");
    return;
  }

  loading.value = true;
  
  try {
    const payload = {
      client_id: authStore.user.id,
      ...form.value,
      lawyer_id: form.value.lawyer_id || null, // Convertir chaîne vide en null
    };

    console.log("[DEBUG SUBMIT] Envoi du payload:", payload);

    const url = isEdit
      ? `/clients-extended/requests/${props.initialData.id}` 
      : '/clients-extended/requests';
    
    await apiFetch(url, { 
      method: isEdit ? 'PUT' : 'POST', 
      body: JSON.stringify(payload) 
    });

    emit('success');
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
    alert("Impossible d'enregistrer la demande.");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fillForm();
});
</script>