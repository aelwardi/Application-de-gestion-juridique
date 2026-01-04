<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Mes Documents</h1>
          <p class="text-gray-600 mt-2">Gérez et partagez vos pièces juridiques avec vos clients.</p>
        </div>
        <button
          @click="showUploadModal = true"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all font-bold active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Uploader un document
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Rechercher</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nom du document..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Type</label>
            <select v-model="filters.type" class="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" @change="loadDocuments">
              <option value="">Tous les types</option>
              <option value="contract">📜 Contrat</option>
              <option value="evidence">🔍 Preuve</option>
              <option value="court_decision">⚖️ Décision tribunal</option>
              <option value="letter">📧 Courrier</option>
              <option value="other">📁 Autre</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Dossier lié</label>
            <select v-model="filters.caseId" class="w-full px-4 py-2 border border-gray-300 rounded-lg font-bold text-blue-600 outline-none" @change="loadDocuments">
              <option value="">📁 Tous les dossiers</option>
              <option v-for="c in cases" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Visibilité Client</label>
            <select v-model="filters.confidential" class="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" @change="loadDocuments">
              <option value="">Tous</option>
              <option value="false">👁️ Partagés avec le client</option>
              <option value="true">🔒 Privés (Interne)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
          <p class="text-sm text-gray-500 font-medium">Total Documents</p>
          <p class="text-3xl font-black text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <p class="text-sm text-gray-500 font-medium">Fichiers PDF</p>
          <p class="text-3xl font-black text-red-600">{{ stats.pdf }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <p class="text-sm text-gray-500 font-medium">Images</p>
          <p class="text-3xl font-black text-blue-600">{{ stats.images }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <p class="text-sm text-gray-500 font-medium">Espace utilisé</p>
          <p class="text-3xl font-black text-purple-600">{{ stats.totalSize }}</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600 border-r-4 border-transparent mx-auto"></div>
        <p class="mt-4 text-gray-500 font-medium italic">Synchronisation de vos pièces...</p>
      </div>

      <div v-else-if="documents.length === 0" class="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 text-center py-20">
        <div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Aucun document</h3>
        <p class="text-gray-500 max-w-xs mx-auto mt-2">
          {{ filters.caseId ? 'Ce dossier ne contient pas encore de pièces.' : 'Commencez par uploader un premier document.' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 overflow-hidden flex flex-col"
          @click="viewDocument(doc)"
        >
          <div class="h-44 bg-gray-50 flex items-center justify-center relative overflow-hidden border-b">
            <img 
              v-if="doc.file_type?.includes('image')" 
              :src="getDownloadUrl(doc.file_url)" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else-if="doc.file_type?.includes('pdf')" class="flex flex-col items-center">
                <svg class="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                <span class="text-[10px] font-black text-red-600 mt-1 uppercase">PDF Document</span>
            </div>
            
            <div class="absolute top-3 left-3 flex gap-2">
                <span v-if="doc.is_confidential" class="px-2 py-1 bg-gray-800/90 text-white text-[10px] font-bold rounded-md flex items-center gap-1 backdrop-blur-sm">
                   🔒 PRIVÉ
                </span>
                <span v-else class="px-2 py-1 bg-green-500/90 text-white text-[10px] font-bold rounded-md flex items-center gap-1 backdrop-blur-sm">
                   👁️ CLIENT
                </span>
            </div>
          </div>

          <div class="p-5 flex-1 flex flex-col">
            <div class="mb-4 flex-1">
                <h3 class="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{{ doc.title || doc.file_name }}</h3>
                <p class="text-[11px] text-gray-400 mt-1 font-mono italic truncate">{{ doc.file_name }}</p>
            </div>

            <div class="space-y-2 text-xs border-t pt-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-400 font-medium">Type</span>
                <span class="font-bold text-gray-700">{{ getDocumentTypeLabel(doc.document_type) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400 font-medium">Taille</span>
                <span class="text-gray-600">{{ formatFileSize(doc.file_size) }}</span>
              </div>
            </div>

            <div class="mt-5 flex gap-2">
              <button
                @click.stop="downloadDoc(doc)"
                class="flex-1 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white flex items-center justify-center gap-2 font-black text-[11px] transition-all uppercase tracking-wider"
              >
                Ouvrir
              </button>
              <button
                @click.stop="confirmDelete(doc)"
                class="px-3 py-2.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="text-xl font-black text-gray-900 tracking-tight italic uppercase">Dépôt de pièce</h2>
          <button @click="showUploadModal = false" class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500">✕</button>
        </div>
        
        <form @submit.prevent="handleUpload" class="p-6 space-y-5">
          <div class="group relative p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
            <input type="file" id="fileInput" required @change="onFileChange" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div v-if="!uploadForm.file">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round" /></svg>
              </div>
              <p class="text-sm font-bold text-gray-700">Cliquez pour parcourir</p>
              <p class="text-xs text-gray-400 mt-1">PDF, PNG, JPG (Max 10MB)</p>
            </div>
            <div v-else class="flex items-center justify-center gap-2">
              <span class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">✓</span>
              <div class="text-left">
                <p class="text-sm font-black text-gray-900 truncate max-w-[200px]">{{ uploadForm.file.name }}</p>
                <p class="text-[10px] text-gray-500">{{ formatFileSize(uploadForm.file.size) }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">Titre de la pièce</label>
            <input v-model="uploadForm.title" type="text" required class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" placeholder="Ex: Contrat de prestation">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black text-gray-500 uppercase mb-1">Type de document</label>
              <select v-model="uploadForm.document_type" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none font-medium">
                <option value="contract">📜 Contrat</option>
                <option value="evidence">🔍 Preuve</option>
                <option value="court_decision">⚖️ Décision</option>
                <option value="letter">📧 Courrier</option>
                <option value="other">📁 Autre</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-black text-gray-500 uppercase mb-1">Dossier cible</label>
              <select v-model="uploadForm.case_id" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-blue-600 outline-none">
                <option :value="null">❌ Aucun</option>
                <option v-for="c in cases" :key="c.id" :value="c.id">{{ c.title }}</option>
              </select>
            </div>
          </div>

          <div class="p-4 rounded-xl border-2 transition-all flex items-center justify-between" 
               :class="uploadForm.is_confidential ? 'bg-gray-50 border-gray-100' : 'bg-green-50/50 border-green-100'">
            <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="uploadForm.is_confidential ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-600'">
                    <span v-if="uploadForm.is_confidential">🔒</span>
                    <span v-else>👁️</span>
               </div>
               <div>
                  <p class="text-sm font-black" :class="uploadForm.is_confidential ? 'text-gray-700' : 'text-green-800'">
                    {{ uploadForm.is_confidential ? 'Document Privé' : 'Partagé avec le client' }}
                  </p>
                  <p class="text-[10px] text-gray-500">
                    {{ uploadForm.is_confidential ? 'Uniquement visible par le cabinet' : 'Le client recevra une notification' }}
                  </p>
               </div>
            </div>
            
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="uploadForm.is_confidential" class="sr-only peer">
              <div class="w-11 h-6 bg-green-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-400"></div>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showUploadModal = false" class="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Annuler</button>
            <button 
              type="submit" 
              :disabled="uploading"
              class="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-black shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
            >
              <span v-if="uploading" class="animate-spin text-lg">⏳</span>
              {{ uploading ? 'TRAITEMENT...' : 'CONFIRMER L\'ENVOI' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logic Script - Identique à ton fonctionnement avec intégration is_confidential
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCase } from '~/composables/useCase'
import { useDocument } from '~/composables/useDocument'

definePageMeta({ middleware: 'auth', layout: 'authenticated' });

const { getAllCases } = useCase();
const { uploadDocument, getDocumentsByCase, deleteDocument, getDownloadUrl, getRecentDocuments } = useDocument();
const authStore = useAuthStore();

const documents = ref<any[]>([]);
const cases = ref<any[]>([]);
const loading = ref(true);
const uploading = ref(false);
const showUploadModal = ref(false);

const filters = ref({
  search: '',
  type: '',
  caseId: '',
  confidential: '',
});

const uploadForm = ref({
  title: '',
  document_type: 'other',
  case_id: null as string | null,
  is_confidential: false, // Par défaut Partagé (is_confidential = false)
  file: null as File | null
});

// Stats computed
const stats = computed(() => {
  const pdf = documents.value.filter(d => d.file_type?.toLowerCase().includes('pdf')).length;
  const images = documents.value.filter(d => d.file_type?.toLowerCase().includes('image')).length;
  const totalBytes = documents.value.reduce((sum, d) => sum + (Number(d.file_size) || 0), 0);
  return {
    total: documents.value.length,
    pdf,
    images,
    totalSize: formatFileSize(totalBytes),
  };
});

onMounted(() => {
  loadInitialData();
});

const loadInitialData = async () => {
  try {
    loading.value = true;
    const casesRes = await getAllCases({ lawyer_id: authStore.user?.id });
    if (casesRes.success) cases.value = casesRes.data;
    await loadDocuments();
  } catch (error) {
    console.error("Erreur initialisation:", error);
  } finally {
    loading.value = false;
  }
};

const loadDocuments = async () => {
  loading.value = true;
  try {
    let res;
    if (filters.value.caseId) {
      res = await getDocumentsByCase(filters.value.caseId);
    } else {
      const userId = authStore.user?.id; 
      if (userId) res = await getRecentDocuments(userId);
    }
    
    let data = res?.data || (Array.isArray(res) ? res : []);

    // Filtres Frontend (Types, Confidentialité, Recherche)
    if (filters.value.type) data = data.filter((d: any) => d.document_type === filters.value.type);
    if (filters.value.confidential !== '') {
        const isConf = filters.value.confidential === 'true';
        data = data.filter((d: any) => d.is_confidential === isConf);
    }
    if (filters.value.search) {
      const s = filters.value.search.toLowerCase();
      data = data.filter((d: any) => (d.title?.toLowerCase().includes(s)) || (d.file_name?.toLowerCase().includes(s)));
    }

    documents.value = data;
  } catch (error) {
    documents.value = [];
  } finally {
    loading.value = false;
  }
};

const onFileChange = (e: any) => {
  const file = e.target.files[0];
  if (file) {
    uploadForm.value.file = file;
    if (!uploadForm.value.title) uploadForm.value.title = file.name.split('.')[0];
  }
};

const handleUpload = async () => {
  if (!uploadForm.value.file) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('file', uploadForm.value.file);
    fd.append('title', uploadForm.value.title);
    fd.append('document_type', uploadForm.value.document_type);
    fd.append('is_confidential', String(uploadForm.value.is_confidential));
    if (uploadForm.value.case_id) fd.append('case_id', uploadForm.value.case_id);
    fd.append('uploaded_by', authStore.user?.id);

    await uploadDocument(fd);
    showUploadModal.value = false;
    uploadForm.value = { title: '', document_type: 'other', case_id: null, is_confidential: false, file: null };
    await loadDocuments();
  } catch (err) {
    alert("Erreur lors de l'upload");
  } finally {
    uploading.value = false;
  }
};

const downloadDoc = (doc: any) => window.open(getDownloadUrl(doc.file_url), '_blank');

const confirmDelete = async (doc: any) => {
  if (confirm(`Supprimer "${doc.title || doc.file_name}" ?`)) {
    try {
      await deleteDocument(doc.id);
      documents.value = documents.value.filter(d => d.id !== doc.id);
    } catch (e) {
      alert("Erreur de suppression");
    }
  }
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB'][i];
};

const formatDate = (date: any) => date ? new Date(date).toLocaleDateString('fr-FR') : '-';

const getDocumentTypeLabel = (type: string) => {
  const labels: any = { contract: 'Contrat', evidence: 'Preuve', court_decision: 'Décision', letter: 'Courrier', other: 'Autre' };
  return labels[type] || type;
};

const viewDocument = (doc: any) => downloadDoc(doc);

let searchTimeout: any;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadDocuments(), 500);
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>