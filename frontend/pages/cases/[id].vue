<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <button 
          @click="$router.back()" 
          class="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 border border-gray-200"
        >
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">Retour aux dossiers</span>
        </button>
        
        <div v-if="loading" class="text-center py-20">
          <div class="inline-flex items-center justify-center">
            <div class="relative">
              <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <p class="text-gray-600 mt-4 font-medium">Chargement du dossier...</p>
        </div>

        <div v-else-if="error" class="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-red-800 font-semibold">{{ error }}</p>
          </div>
        </div>

        <div v-else-if="caseData">
          <!-- Header avec titre et badges -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 mb-6 border border-white">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {{ caseData.title }}
                    </h1>
                    <div class="flex items-center gap-2 mt-1">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <p class="text-gray-600 font-medium">{{ caseData.case_number }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-3 items-center">
                <div class="relative">
                  <select 
                    :value="caseData.status"
                    @change="handleStatusChange($event)"
                    :disabled="statusUpdating"
                    class="block w-full pl-4 pr-10 py-2.5 text-sm font-bold border-none rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                    :class="getStatusClass(caseData.status)"
                  >
                    <option value="pending">En attente</option>
                    <option value="in_progress">En cours</option>
                    <option value="on_hold">En pause</option>
                    <option value="closed">Fermé</option>
                    <option value="archived">Archivé</option>
                  </select>
                  <div v-if="statusUpdating" class="absolute -right-8 top-1/2 -translate-y-1/2">
                    <div class="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                </div>

                <span :class="getPriorityClass(caseData.priority)" class="px-4 py-2.5 text-sm font-bold rounded-lg shadow-sm">
                  {{ getPriorityLabel(caseData.priority) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-indigo-200 cursor-default transform hover:-translate-y-1">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Type de dossier</h3>
              </div>
              <p class="text-xl font-bold text-gray-900">{{ caseData.case_type || 'Non spécifié' }}</p>
            </div>
            
            <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-blue-200 cursor-default transform hover:-translate-y-1">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wide">Date d'ouverture</h3>
              </div>
              <p class="text-xl font-bold text-gray-900">
                {{ formatDate(caseData.opening_date) }}
              </p>
            </div>
          </div>

          <!-- Client Info -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informations du {{ authStore.user?.role === 'avocat' ? 'client' : "cabinet d'avocats" }}
              </h2>
              <div class="flex flex-wrap gap-3">
                <button 
                  @click="scheduleAppointment"
                  class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="hidden sm:inline">Programmer un RDV</span>
                  <span class="sm:hidden">RDV</span>
                </button>

                <button
                  @click="contactOtherParty"
                  class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="hidden sm:inline">{{ authStore.user?.role === 'avocat' ? 'Contacter le client' : 'Contacter mon avocat' }}</span>
                  <span class="sm:hidden">Contacter</span>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="group">
                <p class="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Nom complet
                </p>
                <p class="text-lg font-bold text-gray-900">
                  {{ caseData.client_first_name }} {{ caseData.client_last_name }}
                </p>
              </div>
              <div v-if="caseData.client_email" class="group">
                <p class="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </p>
                <a 
                  :href="`mailto:${caseData.client_email}`"
                  class="text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  {{ caseData.client_email }}
                </a>
              </div>
              <div v-if="caseData.client_phone" class="group">
                <p class="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Téléphone
                </p>
                <a 
                  :href="`tel:${caseData.client_phone}`"
                  class="text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  {{ caseData.client_phone }}
                </a>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Description du dossier
            </h2>
            <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ caseData.description || 'Aucune description disponible' }}</p>
          </div>

          <!-- Informations juridiques et dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white hover:shadow-lg transition-shadow duration-300">
              <h2 class="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Informations juridiques
              </h2>
              <div class="space-y-4">
                <div v-if="caseData.court_name" class="group">
                  <p class="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Tribunal
                  </p>
                  <p class="text-gray-900 font-semibold pl-6">{{ caseData.court_name }}</p>
                </div>
                <div v-if="caseData.judge_name" class="group">
                  <p class="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Juge
                  </p>
                  <p class="text-gray-900 font-semibold pl-6">{{ caseData.judge_name }}</p>
                </div>
                <div v-if="caseData.next_hearing_date" class="group">
                  <p class="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Prochaine audience
                  </p>
                  <p class="text-orange-600 font-bold pl-6">{{ formatDate(caseData.next_hearing_date) }}</p>
                </div>
                <div v-if="!caseData.court_name && !caseData.judge_name && !caseData.next_hearing_date" class="text-center py-4">
                  <p class="text-gray-400 text-sm">Aucune information juridique disponible</p>
                </div>
              </div>
            </div>

            <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white hover:shadow-lg transition-shadow duration-300">
              <h2 class="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Dates importantes
              </h2>
              <div class="space-y-4">
                <div class="group">
                  <p class="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Date de création
                  </p>
                  <p class="text-gray-900 font-semibold pl-6">{{ formatDate(caseData.created_at) }}</p>
                </div>
                <div v-if="caseData.closing_date" class="group">
                  <p class="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Date de clôture
                  </p>
                  <p class="text-gray-900 font-semibold pl-6">{{ formatDate(caseData.closing_date) }}</p>
                </div>
                <div v-if="caseData.estimated_duration_months" class="group">
                  <p class="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Durée estimée
                  </p>
                  <p class="text-gray-900 font-semibold pl-6">{{ caseData.estimated_duration_months }} mois</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Documents -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mt-6 border border-white">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Documents du dossier
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {{ documents.length }}
                </span>
              </h2>
              <button
                @click="showUploadModal = true"
                class="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span class="hidden sm:inline">Ajouter un document</span>
                <span class="sm:hidden">Ajouter</span>
              </button>
            </div>

            <div v-if="loadingDocuments" class="text-center py-12">
              <div class="inline-flex items-center justify-center">
                <div class="relative">
                  <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p class="mt-3 text-sm font-medium text-gray-600">Chargement des documents...</p>
            </div>

            <div v-else-if="documents.length === 0" class="text-center py-16">
              <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Aucun document</h3>
              <p class="text-sm text-gray-500 mb-4">Commencez par télécharger un premier document</p>
              <button
                @click="showUploadModal = true"
                class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un document
              </button>
            </div>

            <div v-else class="overflow-x-auto -mx-6">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Document</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Taille</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Auteur</th>
                    <th class="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white/50 divide-y divide-gray-100">
                  <tr v-for="doc in documents" :key="doc.id" class="hover:bg-blue-50/30 transition-colors duration-150 group">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div class="flex flex-col">
                          <span class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ doc.file_name }}</span>
                          <span class="text-xs text-gray-500">{{ doc.title }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-col gap-1.5">
                        <span class="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 w-fit">
                          {{ getDocumentTypeLabel(doc.document_type) }}
                        </span>
                        <!-- Badge de visibilité pour l'avocat -->
                        <span
                          v-if="authStore.user?.role === 'avocat'"
                          class="px-3 py-1 text-xs font-bold rounded-full w-fit"
                          :class="doc.is_confidential ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'"
                        >
                          {{ doc.is_confidential ? 'Privé' : 'Partagé' }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                      {{ formatFileSize(doc.file_size) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                      {{ formatDate(doc.uploaded_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                      {{ doc.uploader_name || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          @click="downloadDocument(doc)"
                          class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Télécharger"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          @click="deleteDocument(doc.id)"
                          class="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Supprimer"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
              <option value="contract">Contrat</option>
              <option value="evidence">Preuve</option>
              <option value="court_decision">Décision de justice</option>
              <option value="letter">Courrier</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <!-- Section confidentialité - visible uniquement pour les avocats -->
          <div
            v-if="authStore.user?.role === 'avocat'"
            class="p-4 rounded-xl border-2 transition-all flex items-center justify-between"
            :class="uploadForm.is_confidential ? 'bg-gray-50 border-gray-100' : 'bg-green-50/50 border-green-100'"
          >
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

          <!-- Message pour les clients -->
          <div
            v-else
            class="p-4 rounded-xl bg-blue-50 border-2 border-blue-100"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                ℹ️
              </div>
              <div>
                <p class="text-sm font-black text-blue-800">Document visible par votre avocat</p>
                <p class="text-[10px] text-blue-600">Votre avocat recevra une notification de ce dépôt</p>
              </div>
            </div>
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

const contactOtherParty = () => {
  if (!caseData.value) return

  // Déterminer qui contacter selon le rôle
  let recipientId: string
  let recipientName: string

  if (authStore.user?.role === 'avocat') {
    // Avocat contacte le client
    recipientId = caseData.value.client_id
    recipientName = `${caseData.value.client_first_name} ${caseData.value.client_last_name}`
  } else {
    // Client contacte l'avocat
    recipientId = caseData.value.lawyer_id || ''
    recipientName = `${caseData.value.lawyer_first_name || ''} ${caseData.value.lawyer_last_name || ''}`.trim()
  }

  router.push({
    path: '/messages',
    query: {
      recipientId,
      recipientName: encodeURIComponent(recipientName),
      caseId: caseData.value.id
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
    in_progress: 'bg-indigo-100 text-indigo-800',
    on_hold: 'bg-gray-100 text-gray-800',
    closed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-200 text-gray-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
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