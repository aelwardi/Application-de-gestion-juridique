<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <button @click="$router.back()" class="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement...</p>
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
          <p class="text-red-800">{{ error }}</p>
        </div>

        <div v-else-if="caseData">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ caseData.title }}</h1>
              <p class="text-gray-600 mt-2">{{ caseData.case_number }}</p>
            </div>
            <div class="flex gap-3 items-center">
              <div class="relative">
                <select 
                  :value="caseData.status"
                  @change="handleStatusChange($event)"
                  :disabled="statusUpdating"
                  class="block w-full pl-3 pr-10 py-2 text-sm font-semibold border-none rounded-full cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-sm"
                  :class="getStatusClass(caseData.status)"
                >
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="on_hold">En pause</option>
                  <option value="closed">Fermé</option>
                  <option value="archived">Archivé</option>
                </select>
                <div v-if="statusUpdating" class="absolute -right-6 top-2">
                   <div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              </div>

              <span :class="getPriorityClass(caseData.priority)" class="px-4 py-2 text-sm font-semibold rounded-full h-fit">
                {{ getPriorityLabel(caseData.priority) }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Type de dossier</h3>
              <p class="text-lg font-semibold text-gray-900">{{ caseData.case_type }}</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500 mb-2">Date d'ouverture</h3>
              <p class="text-lg font-semibold text-gray-900">
                {{ formatDate(caseData.opening_date) }}
              </p>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 mt-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Informations du client</h2>
              <div class="flex gap-3">
                <button 
                  @click="scheduleAppointment"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Programmer un RDV
                </button>

                <NuxtLink 
                  :to="`/messages?clientId=${caseData.client_id}`"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contacter le client
                </NuxtLink>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500 mb-1">Nom complet</p>
                <p class="text-lg font-medium text-gray-900">
                  {{ caseData.client_first_name }} {{ caseData.client_last_name }}
                </p>
              </div>
              <div v-if="caseData.client_email">
                <p class="text-sm text-gray-500 mb-1">Email</p>
                <a 
                  :href="`mailto:${caseData.client_email}`"
                  class="text-lg text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {{ caseData.client_email }}
                </a>
              </div>
              <div v-if="caseData.client_phone">
                <p class="text-sm text-gray-500 mb-1">Téléphone</p>
                <a 
                  :href="`tel:${caseData.client_phone}`"
                  class="text-lg text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {{ caseData.client_phone }}
                </a>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 mt-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p class="text-gray-700 whitespace-pre-wrap">{{ caseData.description || 'Aucune description disponible' }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Informations juridiques</h2>
              <div class="space-y-3">
                <div v-if="caseData.court_name">
                  <p class="text-sm text-gray-500">Tribunal</p>
                  <p class="text-gray-900">{{ caseData.court_name }}</p>
                </div>
                <div v-if="caseData.judge_name">
                  <p class="text-sm text-gray-500">Juge</p>
                  <p class="text-gray-900">{{ caseData.judge_name }}</p>
                </div>
                <div v-if="caseData.next_hearing_date">
                  <p class="text-sm text-gray-500">Prochaine audience</p>
                  <p class="text-gray-900">{{ formatDate(caseData.next_hearing_date) }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Dates importantes</h2>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Date de création</p>
                  <p class="text-gray-900">{{ formatDate(caseData.created_at) }}</p>
                </div>
                <div v-if="caseData.closing_date">
                  <p class="text-sm text-gray-500">Date de clôture</p>
                  <p class="text-gray-900">{{ formatDate(caseData.closing_date) }}</p>
                </div>
                <div v-if="caseData.estimated_duration_months">
                  <p class="text-sm text-gray-500">Durée estimée</p>
                  <p class="text-gray-900">{{ caseData.estimated_duration_months }} mois</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Documents -->
          <div class="bg-white rounded-lg shadow p-6 mt-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Documents du dossier</h2>
              <button
                @click="showUploadModal = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Ajouter un document
              </button>
            </div>

            <div v-if="loadingDocuments" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-600">Chargement des documents...</p>
            </div>

            <div v-else-if="documents.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
              <p class="mt-1 text-sm text-gray-500">Commencez par télécharger un document</p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom du document</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléchargé par</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-900">{{ doc.file_name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {{ getDocumentTypeLabel(doc.document_type) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatFileSize(doc.file_size) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(doc.uploaded_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ doc.uploader_name || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        @click="downloadDocument(doc)"
                        class="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        @click="deleteDocument(doc.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Upload Document -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="text-xl font-black text-gray-900 tracking-tight italic uppercase">Dépôt de pièce</h2>
          <button @click="cancelUpload" class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500">✕</button>
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
            <button type="button" @click="cancelUpload" class="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Annuler</button>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCase } from '~/composables/useCase'
import { useDocument } from '~/composables/useDocument'
import { useAuthStore } from '~/stores/auth'
import type { CaseWithDetails } from '~/types/case'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { getCaseById, updateCase } = useCase()
const { getDocumentsByCase, uploadDocument, deleteDocument: deleteDoc, getDownloadUrl } = useDocument()

const caseData = ref<CaseWithDetails | null>(null)
const documents = ref<any[]>([])
const loading = ref(true)
const loadingDocuments = ref(false)
const statusUpdating = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const showUploadModal = ref(false)

const uploadForm = ref({
  title: '',
  document_type: 'other',
  is_confidential: false,
  file: null as File | null
})

const loadCase = async () => {
  loading.value = true
  error.value = null
  
  try {
    const caseId = route.params.id as string
    const response = await getCaseById(caseId)
    
    if (response.success && response.data) {
      caseData.value = response.data
      await loadDocuments()
    } else {
      error.value = 'Dossier non trouvé'
    }
  } catch (err: any) {
    console.error('Error loading case:', err)
    error.value = 'Erreur lors du chargement du dossier'
  } finally {
    loading.value = false
  }
}

const loadDocuments = async () => {
  loadingDocuments.value = true
  try {
    const caseId = route.params.id as string
    const response = await getDocumentsByCase(caseId)

    if (Array.isArray(response)) {
      documents.value = response
    } else if (response && (response as any).success && (response as any).data) {
      documents.value = (response as any).data
    } else {
      documents.value = []
    }
  } catch (err) {
    console.error('Error loading documents:', err)
    documents.value = []
  } finally {
    loadingDocuments.value = false
  }
}

const onFileChange = (e: any) => {
  const file = e.target.files[0]
  if (file) {
    uploadForm.value.file = file
    if (!uploadForm.value.title) {
      uploadForm.value.title = file.name.split('.')[0]
    }
  }
}

const handleUpload = async () => {
  if (!uploadForm.value.file || !caseData.value) return

  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', uploadForm.value.file)
    fd.append('title', uploadForm.value.title)
    fd.append('document_type', uploadForm.value.document_type)
    fd.append('is_confidential', String(uploadForm.value.is_confidential))
    fd.append('case_id', caseData.value.id)
    fd.append('uploaded_by', authStore.user?.id || '')

    await uploadDocument(fd)

    // Réinitialiser le formulaire
    showUploadModal.value = false
    uploadForm.value = {
      title: '',
      document_type: 'other',
      is_confidential: false,
      file: null
    }

    // Recharger les documents
    await loadDocuments()
  } catch (err) {
    console.error('Upload error:', err)
    alert("Erreur lors de l'upload du document")
  } finally {
    uploading.value = false
  }
}

const cancelUpload = () => {
  showUploadModal.value = false
  uploadForm.value = {
    title: '',
    document_type: 'other',
    is_confidential: false,
    file: null
  }
}

const scheduleAppointment = () => {
  if (!caseData.value) return
  router.push({
    path: '/appointments',
    query: { 
      create: 'true',
      caseId: caseData.value.id,
      clientId: caseData.value.client_id
    }
  })
}

const handleStatusChange = async (event: Event) => {
  const newStatus = (event.target as HTMLSelectElement).value as any
  if (!caseData.value || newStatus === caseData.value.status) return

  statusUpdating.value = true
  try {
    const caseId = route.params.id as string
    const response = await updateCase(caseId, { status: newStatus })
    
    if (response.success) {
      caseData.value.status = newStatus
      if (newStatus === 'closed') {
        caseData.value.closing_date = new Date().toISOString()
      }
    } else {
      alert("Erreur lors de la mise à jour du statut")
    }
  } catch (err) {
    console.error('Update status error:', err)
    alert("Une erreur est survenue")
  } finally {
    statusUpdating.value = false
  }
}

const downloadDocument = (doc: any) => {
  const url = getDownloadUrl(doc.file_url)
  window.open(url, '_blank')
}

const deleteDocument = async (docId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return

  try {
    await deleteDoc(docId)
    documents.value = documents.value.filter(d => d.id !== docId)
  } catch (err) {
    console.error('Delete error:', err)
    alert('Erreur lors de la suppression du document')
  }
}

// ...existing code (utility functions)...

const getDocumentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    contract: 'Contrat',
    pleading: 'Plaidoirie',
    evidence: 'Preuve',
    correspondence: 'Correspondance',
    judgment: 'Jugement',
    other: 'Autre'
  }
  return labels[type] || type
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    on_hold: 'bg-gray-100 text-gray-800',
    closed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-200 text-gray-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente'
  }
  return labels[priority] || priority
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadCase()
})
</script>