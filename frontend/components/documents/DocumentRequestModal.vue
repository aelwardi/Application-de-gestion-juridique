<script setup lang="ts">
import { ref, watch } from 'vue';
import useDocumentRequest from '~/composables/useDocumentRequest';

const props = defineProps<{
  show: boolean;
  caseId: string;
  clientId: string;
}>();

const emit = defineEmits<{
  close: [];
  success: [data: any];
}>();

const { createDocumentRequest } = useDocumentRequest();

const loading = ref(false);

const form = ref({
  title: '',
  description: '',
  document_types: [] as string[],
  expires_in_days: 30
});

const documentTypes = [
  { value: 'contract', label: 'Contrat' },
  { value: 'evidence', label: 'Preuve' },
  { value: 'invoice', label: 'Facture' },
  { value: 'identity', label: 'Pièce d\'identité' },
  { value: 'certificate', label: 'Certificat' },
  { value: 'court_decision', label: 'Décision de justice' },
  { value: 'letter', label: 'Courrier' },
  { value: 'other', label: 'Autre' }
];

const getExpirationDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    alert('Veuillez saisir un titre');
    return;
  }

  loading.value = true;
  try {
    const response = await createDocumentRequest({
      case_id: props.caseId,
      client_id: props.clientId,
      title: form.value.title,
      description: form.value.description || undefined,
      document_types: form.value.document_types.length > 0 ? form.value.document_types : undefined,
      expires_in_days: form.value.expires_in_days
    }) as any;

    if (response?.success) {
      emit('success', response.data);
      resetForm();
      close();
    } else {
      alert(response?.message || 'Erreur lors de la création de la demande');
    }
  } catch (error: any) {
    console.error('Error creating document request:', error);
    alert(error?.data?.message || 'Erreur lors de la création de la demande');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    document_types: [],
    expires_in_days: 30
  };
};

const close = () => {
  emit('close');
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});
</script>




<template>
  <div v-if="show" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold">Demander des documents</h2>
              <p class="text-white/90 text-sm">Envoi sécurisé au client</p>
            </div>
          </div>
          <button @click="close" class="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Titre de la demande *
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Ex: Documents d'identité et justificatifs de domicile"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="Précisez les détails de votre demande..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Types de documents demandés
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label
              v-for="type in documentTypes"
              :key="type.value"
              class="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition hover:border-amber-500"
              :class="form.document_types.includes(type.value) ? 'border-amber-500 bg-amber-50' : 'border-gray-200'"
            >
              <input
                type="checkbox"
                :value="type.value"
                v-model="form.document_types"
                class="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
              />
              <span class="text-sm font-medium text-gray-700">{{ type.label }}</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Délai pour envoyer les documents
          </label>
          <select
            v-model="form.expires_in_days"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
          >
            <option :value="7">7 jours</option>
            <option :value="14">14 jours</option>
            <option :value="30">30 jours</option>
            <option :value="60">60 jours</option>
            <option :value="90">90 jours</option>
          </select>
          <p class="text-xs text-gray-500 mt-2">
            Le lien expirera le {{ getExpirationDate(form.expires_in_days) }}
          </p>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-blue-900">
              <p class="font-bold mb-1">Email automatique</p>
              <p>Un email avec un lien sécurisé sera envoyé au client. Il pourra uploader les documents sans se connecter.</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t">
          <button
            type="button"
            @click="close"
            class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-bold hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ loading ? 'Envoi...' : 'Envoyer la demande' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

