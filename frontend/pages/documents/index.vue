<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Documents</h1>
          <p class="text-gray-600 mt-2">Gérez vos documents juridiques</p>
        </div>
        <button
          @click="showUploadModal = true"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Uploader
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nom du document..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              v-model="filters.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="loadDocuments"
            >
              <option value="">Tous</option>
              <option value="contract">Contrat</option>
              <option value="evidence">Preuve</option>
              <option value="court_decision">Décision tribunal</option>
              <option value="letter">Courrier</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Dossier</label>
            <select
              v-model="filters.caseId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="loadDocuments"
            >
              <option value="">Tous les dossiers</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confidentialité</label>
            <select
              v-model="filters.confidential"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="loadDocuments"
            >
              <option value="">Tous</option>
              <option value="true">Confidentiel</option>
              <option value="false">Public</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Total Documents</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">PDF</p>
          <p class="text-3xl font-bold text-red-600">{{ stats.pdf }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Images</p>
          <p class="text-3xl font-bold text-blue-600">{{ stats.images }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600">Stockage</p>
          <p class="text-3xl font-bold text-purple-600">{{ stats.totalSize }}</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>

      <div v-else-if="documents.length === 0" class="bg-white rounded-lg shadow text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
        <p class="mt-1 text-sm text-gray-500">Commencez par uploader des documents</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewDocument(doc.id)"
        >
          <div class="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex items-center justify-center">
            <svg
              v-if="doc.file_type?.includes('pdf')"
              class="w-20 h-20 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <svg
              v-else-if="doc.file_type?.includes('image')"
              class="w-20 h-20 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <svg
              v-else
              class="w-20 h-20 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <div class="p-4">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-gray-900 text-sm truncate flex-1">{{ doc.file_name }}</h3>
              <span
                v-if="doc.is_confidential"
                class="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"
              >
                🔒
              </span>
            </div>

            <p v-if="doc.description" class="text-sm text-gray-600 mb-3 line-clamp-2">
              {{ doc.description }}
            </p>

            <div class="space-y-2 text-xs text-gray-500">
              <div class="flex items-center justify-between">
                <span>Type:</span>
                <span class="font-medium">{{ getDocumentTypeLabel(doc.document_type) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Taille:</span>
                <span class="font-medium">{{ formatFileSize(doc.file_size) }}</span>
              </div>
              <div v-if="doc.case_title" class="flex items-center justify-between">
                <span>Dossier:</span>
                <span class="font-medium truncate ml-2">{{ doc.case_title }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Date:</span>
                <span class="font-medium">{{ formatDate(doc.created_at) }}</span>
              </div>
            </div>

            <div class="mt-4 flex gap-2">
              <button
                @click.stop="downloadDocument(doc.id)"
                class="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger
              </button>
              <button
                @click.stop="shareDocument(doc.id)"
                class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 class="text-2xl font-bold mb-4">Upload de Documents</h2>
        <p class="text-gray-600 mb-4">Fonctionnalité en cours de développement...</p>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="mt-2 text-sm text-gray-600">Glissez vos fichiers ici ou cliquez pour sélectionner</p>
        </div>
        <button
          @click="showUploadModal = false"
          class="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const documents = ref<any[]>([]);
const loading = ref(true);
const showUploadModal = ref(false);

const filters = ref({
  search: '',
  type: '',
  caseId: '',
  confidential: '',
});

const stats = computed(() => {
  const pdf = documents.value.filter(d => d.file_type?.includes('pdf')).length;
  const images = documents.value.filter(d => d.file_type?.includes('image')).length;
  const totalBytes = documents.value.reduce((sum, d) => sum + (d.file_size || 0), 0);

  return {
    total: documents.value.length,
    pdf,
    images,
    totalSize: formatFileSize(totalBytes),
  };
});

let searchTimeout: any;

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadDocuments();
  }, 500);
};

const loadDocuments = async () => {
  try {
    loading.value = true;

    documents.value = [
      {
        id: '1',
        file_name: 'Contrat_Divorce_2025.pdf',
        file_type: 'application/pdf',
        file_size: 245760,
        document_type: 'contract',
        description: 'Contrat de divorce par consentement mutuel',
        is_confidential: true,
        case_title: 'Divorce Dupont',
        created_at: new Date('2025-12-15'),
      },
      {
        id: '2',
        file_name: 'Preuve_Email.pdf',
        file_type: 'application/pdf',
        file_size: 102400,
        document_type: 'evidence',
        description: 'Échanges email concernant le litige',
        is_confidential: true,
        case_title: 'Litige Commercial',
        created_at: new Date('2025-12-10'),
      },
      {
        id: '3',
        file_name: 'Photo_Accident.jpg',
        file_type: 'image/jpeg',
        file_size: 1536000,
        document_type: 'evidence',
        description: 'Photo des dégâts suite à l\'accident',
        is_confidential: false,
        case_title: 'Accident Route',
        created_at: new Date('2025-12-05'),
      },
    ];
  } catch (error) {
    console.error('Error loading documents:', error);
  } finally {
    loading.value = false;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getDocumentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    contract: 'Contrat',
    evidence: 'Preuve',
    court_decision: 'Décision',
    letter: 'Courrier',
    other: 'Autre',
  };
  return labels[type] || type;
};

const viewDocument = (id: string) => {
  console.log('View document:', id);
};

const downloadDocument = (id: string) => {
  console.log('Download document:', id);
};

const shareDocument = (id: string) => {
  console.log('Share document:', id);
};

onMounted(() => {
  loadDocuments();
});

onBeforeUnmount(() => {
  clearTimeout(searchTimeout);
});
</script>