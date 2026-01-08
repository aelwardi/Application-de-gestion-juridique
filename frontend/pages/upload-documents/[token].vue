<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();
const token = route.params.token as string;

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const documentRequest = ref<any>(null);
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const uploadSuccess = ref(false);

const uploadForm = ref({
  title: '',
  document_type: 'other'
});

const loadDocumentRequest = async () => {
  try {
    loading.value = true;
    const response = await $fetch<any>(`http://localhost:3000/api/document-requests/token/${token}`);

    if (response.success) {
      documentRequest.value = response.data;
    } else {
      error.value = true;
      errorMessage.value = response.message || 'Demande non trouvée';
    }
  } catch (err: any) {
    error.value = true;
    if (err.status === 404) {
      errorMessage.value = 'Cette demande n\'existe pas';
    } else if (err.status === 410 || err.data?.expired) {
      errorMessage.value = 'Cette demande a expiré';
    } else {
      errorMessage.value = err.data?.message || 'Une erreur est survenue';
    }
  } finally {
    loading.value = false;
  }
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    if (!uploadForm.value.title) {
      uploadForm.value.title = target.files[0].name.split('.')[0];
    }
  }
};

const handleUpload = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('title', uploadForm.value.title);
    formData.append('document_type', uploadForm.value.document_type);

    const response = await $fetch<any>(
        `http://localhost:3000/api/document-requests/upload/${token}`,
        {
          method: 'POST',
          body: formData
        }
    );

    if (response.success) {
      uploadSuccess.value = true;
      toast.success('Document envoyé avec succès !');
    } else {
      toast.error(response.message || 'Erreur lors de l\'envoi');
    }
  } catch (err: any) {
    console.error('Upload error:', err);
    toast.error(err.data?.message || 'Erreur lors de l\'envoi du document');
  } finally {
    uploading.value = false;
  }
};

const resetForm = () => {
  uploadSuccess.value = false;
  selectedFile.value = null;
  uploadForm.value = {
    title: '',
    document_type: 'other'
  };
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getDocumentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    contract: 'Contrat',
    evidence: 'Preuve',
    invoice: 'Facture',
    identity: 'Pièce d\'identité',
    certificate: 'Certificat',
    other: 'Autre'
  };
  return labels[type] || type;
};

onMounted(() => {
  loadDocumentRequest();
});
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
    <div class="max-w-3xl mx-auto">
      <div v-if="loading" class="text-center py-20">
        <div class="inline-flex items-center justify-center">
          <div class="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
        <p class="text-gray-600 mt-4 font-medium">Chargement...</p>
      </div>

      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8">
        <div class="text-center">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
          <a href="http://localhost:3001" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Retour à l'accueil
          </a>
        </div>
      </div>

      <div v-else-if="uploadSuccess" class="bg-white rounded-2xl shadow-xl border-2 border-green-200 p-8">
        <div class="text-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Document envoyé avec succès !</h2>
          <p class="text-gray-600 mb-6">Votre document a été transmis à votre avocat.</p>
          <button
            @click="resetForm"
            class="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
          >
            Envoyer un autre document
          </button>
        </div>
      </div>

      <div v-else-if="documentRequest" class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold">Demande de Documents</h1>
              <p class="text-white/90 text-sm">{{ documentRequest.case_title }}</p>
            </div>
          </div>
        </div>

        <div class="p-8">
          <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-bold text-amber-900">{{ documentRequest.title }}</p>
                <p v-if="documentRequest.description" class="text-sm text-amber-800 mt-1">{{ documentRequest.description }}</p>
                <p class="text-xs text-amber-700 mt-2">
                  <strong>Avocat :</strong> Me {{ documentRequest.lawyer_first_name }} {{ documentRequest.lawyer_last_name }}
                </p>
                <p class="text-xs text-amber-700">
                  <strong>Date limite :</strong> {{ formatDate(documentRequest.expires_at) }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="documentRequest.document_types && documentRequest.document_types.length > 0" class="mb-6">
            <h3 class="text-sm font-bold text-gray-700 mb-2">Documents demandés :</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="type in documentRequest.document_types"
                :key="type"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {{ getDocumentTypeLabel(type) }}
              </span>
            </div>
          </div>

          <form @submit.prevent="handleUpload" class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Document à envoyer *</label>
              <div class="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-amber-500 transition cursor-pointer bg-gray-50 hover:bg-amber-50">
                <input
                  type="file"
                  @change="onFileChange"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                  required
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div v-if="!selectedFile" class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="text-gray-600 font-medium mb-1">Cliquez pour sélectionner un fichier</p>
                  <p class="text-xs text-gray-500">PDF, Word, Excel, Images (Max 10MB)</p>
                </div>
                <div v-else class="flex items-center justify-center gap-3">
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-gray-900 font-bold">{{ selectedFile.name }}</p>
                    <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Titre du document *</label>
              <input
                v-model="uploadForm.title"
                type="text"
                required
                placeholder="Ex: Contrat de travail"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Type de document</label>
              <select
                v-model="uploadForm.document_type"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              >
                <option value="contract">Contrat</option>
                <option value="evidence">Preuve</option>
                <option value="invoice">Facture</option>
                <option value="identity">Pièce d'identité</option>
                <option value="certificate">Certificat</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="uploading || !selectedFile"
                class="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-bold hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="!uploading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ uploading ? 'Envoi en cours...' : 'Envoyer le document' }}
              </button>
            </div>
          </form>

          <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p class="text-sm text-blue-900">
                <strong>Sécurité garantie :</strong> Vos documents sont transmis de manière sécurisée et confidentielle à votre avocat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

