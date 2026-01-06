<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header avec actions -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mes Documents
            </h1>
            <p class="text-gray-600 mt-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Gérez et partagez vos pièces juridiques avec vos clients
            </p>
          </div>
          
          <button
            @click="showUploadModal = true"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:-translate-y-0.5"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Uploader un document
          </button>
        </div>
      </div>

      <!-- Filtres avancés -->
      <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6 border border-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres & Recherche
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Nom du document..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                @input="debouncedSearch"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select v-model="filters.type" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all" @change="loadDocuments">
              <option value="">Tous les types</option>
              <option value="contract">Contrat</option>
              <option value="evidence">Preuve</option>
              <option value="court_decision">Décision tribunal</option>
              <option value="letter">Courrier</option>
              <option value="other">Autre</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Dossier lié</label>
            <select v-model="filters.caseId" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all" @change="loadDocuments">
              <option value="">� Tous les dossiers</option>
              <option v-for="c in cases" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Visibilité</label>
            <select v-model="filters.confidential" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all" @change="loadDocuments">
              <option value="">Tous</option>
              <option value="false">Partagés avec le client</option>
              <option value="true">Privés (Interne)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Cards avec animations -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-gray-300 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Total Documents</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
              <p class="text-xs text-gray-500 mt-2">Fichiers stockés</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-red-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Fichiers PDF</p>
              <p class="text-3xl font-bold text-red-600">{{ stats.pdf }}</p>
              <p class="text-xs text-gray-500 mt-2">Documents PDF</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-blue-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Images</p>
              <p class="text-3xl font-bold text-blue-600">{{ stats.images }}</p>
              <p class="text-xs text-gray-500 mt-2">Fichiers image</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-purple-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Espace utilisé</p>
              <p class="text-3xl font-bold text-purple-600">{{ stats.totalSize }}</p>
              <p class="text-xs text-gray-500 mt-2">Stockage total</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-flex items-center justify-center">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <p class="text-gray-600 mt-4 font-medium">Synchronisation de vos pièces...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="documents.length === 0" class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm text-center py-16 border border-gray-200">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun document</h3>
          <p class="text-gray-600 mb-6">
            {{ filters.caseId ? 'Ce dossier ne contient pas encore de pièces' : 'Commencez par uploader un premier document' }}
          </p>
          <button
            @click="showUploadModal = true"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 font-medium transition-all mx-auto shadow-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Uploader un document
          </button>
        </div>
      </div>

      <!-- Documents Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white overflow-hidden flex flex-col transform hover:-translate-y-2"
          @click="viewDocument(doc)"
        >
          <!-- Preview Image/Icon -->
          <div class="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
            <img 
              v-if="doc.file_type?.includes('image')" 
              :src="getDownloadUrl(doc.file_url)" 
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div v-else-if="doc.file_type?.includes('pdf')" class="flex flex-col items-center">
              <svg class="w-20 h-20 text-red-500 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              <span class="text-xs font-bold text-red-600 mt-2 uppercase tracking-wide">PDF Document</span>
            </div>
            <div v-else class="flex flex-col items-center">
              <svg class="w-20 h-20 text-gray-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span class="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wide">Document</span>
            </div>
            
            <!-- Badges -->
            <div class="absolute top-3 left-3 flex gap-2">
              <span v-if="doc.is_confidential" class="px-3 py-1 bg-gray-900/90 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm shadow-lg">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                PRIVÉ
              </span>
              <span v-else class="px-3 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm shadow-lg">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                CLIENT
              </span>
            </div>
          </div>

          <!-- Document Info -->
          <div class="p-5 flex-1 flex flex-col">
            <div class="mb-4 flex-1">
              <h3 class="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                {{ doc.title || doc.file_name }}
              </h3>
              <p class="text-xs text-gray-400 mt-1 font-mono truncate">{{ doc.file_name }}</p>
            </div>

            <div class="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-500 font-medium flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Type
                </span>
                <span class="font-semibold text-gray-900">{{ getDocumentTypeLabel(doc.document_type) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 font-medium flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Taille
                </span>
                <span class="font-medium text-gray-700">{{ formatFileSize(doc.file_size) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-5 flex gap-2">
              <button
                @click.stop="downloadDoc(doc)"
                class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ouvrir
              </button>
              <button
                @click.stop="confirmDelete(doc)"
                class="px-4 py-2.5 bg-white text-red-600 rounded-lg hover:bg-red-50 border border-red-200 transition-all shadow-sm hover:shadow-md"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
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
                <option value="contract">Contrat</option>
                <option value="evidence">Preuve</option>
                <option value="court_decision">Décision de justice</option>
                <option value="letter">Courrier</option>
                <option value="other">Autre</option>
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
                    <svg v-if="uploadForm.is_confidential" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
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
    if (casesRes.success && casesRes.data) cases.value = casesRes.data;
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
  if (!uploadForm.value.file || !authStore.user?.id) return;
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('file', uploadForm.value.file);
    fd.append('title', uploadForm.value.title);
    fd.append('document_type', uploadForm.value.document_type);
    fd.append('is_confidential', String(uploadForm.value.is_confidential));
    if (uploadForm.value.case_id) fd.append('case_id', uploadForm.value.case_id);
    fd.append('uploaded_by', authStore.user.id);

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
  const size = Number((bytes / Math.pow(1024, i)).toFixed(2));
  return size + ' ' + ['B', 'KB', 'MB', 'GB'][i];
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>