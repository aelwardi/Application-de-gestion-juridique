<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header avec actions -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mes Dossiers
            </h1>
            <p class="text-gray-600 mt-2 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ authStore.user?.role === 'avocat' ? 'Dossiers regroupés par client' : 'Dossiers regroupés par avocat' }}
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Boutons de vue -->
            <div class="bg-white rounded-lg shadow-sm p-1 flex gap-1">
              <button
                @click="viewMode = 'group'"
                :class="viewMode === 'group' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
                class="px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="hidden sm:inline text-sm font-medium">Groupés</span>
              </button>
              <button
                @click="viewMode = 'grid'"
                :class="viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
                class="px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span class="hidden sm:inline text-sm font-medium">Grille</span>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
                class="px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span class="hidden sm:inline text-sm font-medium">Liste</span>
              </button>
            </div>

            <!-- Export -->
            <button
              @click="exportCases"
              class="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm flex items-center gap-2 transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="hidden sm:inline text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        <!-- Stats Cards avec animations -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Total Dossiers</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
                <p class="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +12% ce mois
                </p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 cursor-pointer transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">{{ authStore.user?.role === 'avocat' ? 'Clients' : 'Avocats' }}</p>
                <p class="text-3xl font-bold text-indigo-600">{{ stats.clients }}</p>
                <p class="text-xs text-gray-500 mt-2">Actifs</p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-orange-200 cursor-pointer transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">En cours</p>
                <p class="text-3xl font-bold text-orange-600">{{ stats.inProgress }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ ((stats.inProgress / stats.total) * 100).toFixed(0) }}% du total</p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 cursor-pointer transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Fermés</p>
                <p class="text-3xl font-bold text-green-600">{{ stats.closed }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ ((stats.closed / stats.total) * 100).toFixed(0) }}% du total</p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
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
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Effacer les filtres
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Recherche améliorée -->
          <div class="lg:col-span-2">
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
                placeholder="Rechercher par titre, numéro, client..."
                class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                @input="debouncedSearch"
              />
              <div v-if="filters.search" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button @click="filters.search = ''; loadCases()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Statut -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
              @change="loadCases"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="on_hold">En pause</option>
              <option value="closed">Fermé</option>
            </select>
          </div>

          <!-- Priorité -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
            <select
              v-model="filters.priority"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
              @change="loadCases"
            >
              <option value="">Toutes</option>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>

        <!-- Tri -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Trier par:</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="sortOption in sortOptions"
                :key="sortOption.value"
                @click="setSortBy(sortOption.value)"
                :class="filters.sortBy === sortOption.value ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'"
                class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
              >
                {{ sortOption.label }}
                <span v-if="filters.sortBy === sortOption.value">
                  {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques visuelles -->
      <CaseStats :cases="cases" />

      <!-- Loading State -->
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
        <p class="text-gray-600 mt-4 font-medium">Chargement des dossiers...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="Object.keys(clientGroups).length === 0" class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm text-center py-16 border border-gray-200">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Aucun dossier trouvé</h3>
          <p class="text-gray-600 mb-6">
            {{ hasActiveFilters ? 'Essayez de modifier vos critères de recherche' : 'Aucun dossier disponible pour le moment' }}
          </p>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 flex items-center gap-2 font-medium transition-all mx-auto"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>

      <div v-else-if="Object.keys(clientGroups).length === 0" class="bg-white rounded-lg shadow text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun dossier</h3>
        <p class="mt-1 text-sm text-gray-500">Aucun dossier disponible pour le moment</p>
      </div>

      <!-- Vue Groupée par Client/Avocat -->
      <div v-else-if="viewMode === 'group'" class="space-y-6">
        <div
          v-for="(group, clientId) in clientGroups"
          :key="clientId"
          class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border border-white hover:shadow-xl transition-all duration-300"
        >
          <!-- En-tête du client/avocat -->
          <div
            @click="toggleClient(clientId)"
            class="p-6 cursor-pointer transition-all duration-300"
            :class="group.isLawyer 
              ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100' 
              : 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 hover:from-green-100 hover:via-emerald-100 hover:to-teal-100'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="relative h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transform transition-all duration-300 hover:scale-110"
                  :class="group.isLawyer ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-green-600 to-emerald-600'"
                >
                  {{ getInitials(group.clientName) }}
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                    <svg v-if="group.isLawyer" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-xl font-bold text-gray-900">{{ group.clientName }}</h3>
                    <span
                      v-if="!group.isLawyer"
                      class="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm flex items-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Avocat
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ group.clientEmail }}
                  </p>
                  <!-- Mini stats -->
                  <div class="flex items-center gap-4 mt-2">
                    <span class="text-xs text-gray-500 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ getGroupStats(group).inProgress }} en cours
                    </span>
                    <span class="text-xs text-gray-500 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ getGroupStats(group).closed }} fermés
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <!-- Bouton Contacter avec menu déroulant pour choisir le dossier -->
                <div class="relative group/contact">
                  <button
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contacter
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Menu déroulant -->
                  <div class="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover/contact:opacity-100 group-hover/contact:visible transition-all duration-200 z-50">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-xs font-semibold text-gray-500 uppercase">Choisir un dossier</p>
                    </div>

                    <!-- Conversation générale -->
                    <button
                      @click.stop="contactPerson(clientId, group.clientName, null, 'Conversation générale')"
                      class="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
                    >
                      <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">Conversation générale</p>
                        <p class="text-xs text-gray-500">Sans lien à un dossier spécifique</p>
                      </div>
                    </button>

                    <div class="border-t border-gray-100 my-1"></div>

                    <!-- Liste des dossiers -->
                    <div class="max-h-64 overflow-y-auto">
                      <button
                        v-for="caseItem in group.cases"
                        :key="caseItem.id"
                        @click.stop="contactPerson(clientId, group.clientName, caseItem.id, caseItem.title)"
                        class="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors flex items-center gap-3"
                      >
                        <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-semibold text-gray-900 truncate">{{ caseItem.title }}</p>
                          <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-xs text-gray-500">{{ caseItem.case_number }}</span>
                            <span class="px-1.5 py-0.5 text-xs rounded-full" :class="getStatusClass(caseItem.status)">
                              {{ getStatusLabel(caseItem.status) }}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    class="text-3xl font-bold mb-1"
                    :class="group.isLawyer ? 'text-blue-600' : 'text-green-600'"
                  >
                    {{ group.cases.length }}
                  </p>
                  <p class="text-sm text-gray-600 font-medium">{{ group.cases.length === 1 ? 'dossier' : 'dossiers' }}</p>
                </div>
                <svg
                  class="w-6 h-6 text-gray-400 transition-transform duration-300"
                  :class="{ 'rotate-180': expandedClients.has(clientId) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Liste des dossiers du client -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-4"
          >
            <div v-if="expandedClients.has(clientId)" class="divide-y divide-gray-100">
              <div
                v-for="caseItem in group.cases"
                :key="caseItem.id"
                class="group/item p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                @click="navigateTo(`/cases/${caseItem.id}`)"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-3">
                      <h4 class="text-lg font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                        {{ caseItem.title }}
                      </h4>
                      <span
                        class="px-3 py-1 text-xs font-bold rounded-full shadow-sm"
                        :class="getStatusClass(caseItem.status)"
                      >
                        {{ getStatusLabel(caseItem.status) }}
                      </span>
                      <span
                        class="px-3 py-1 text-xs font-bold rounded-full shadow-sm"
                        :class="getPriorityClass(caseItem.priority)"
                      >
                        {{ getPriorityLabel(caseItem.priority) }}
                      </span>
                    </div>

                    <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ caseItem.description }}</p>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div class="flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span class="text-gray-500">N°:</span>
                        <span class="font-semibold text-gray-900">{{ caseItem.case_number }}</span>
                      </div>
                      <div v-if="caseItem.case_type" class="flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span class="text-gray-500">Type:</span>
                        <span class="font-medium text-gray-900">{{ caseItem.case_type }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-gray-500">Créé:</span>
                        <span class="font-medium text-gray-900">{{ formatDate(caseItem.created_at) }}</span>
                      </div>
                      <div v-if="caseItem.next_hearing_date" class="flex items-center gap-2 text-sm">
                        <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-gray-500">Audience:</span>
                        <span class="font-semibold text-orange-600">{{ formatDate(caseItem.next_hearing_date) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions rapides -->
                  <div class="flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                    <button
                      @click.stop="openCase(caseItem.id)"
                      class="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Ouvrir"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      v-if="authStore.user?.role === 'avocat'"
                      @click.stop="editCase(caseItem.id)"
                      class="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                      title="Modifier"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Vue Grille -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="caseItem in sortedCases"
          :key="caseItem.id"
          class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white cursor-pointer transform hover:-translate-y-2 relative"
          @click="navigateTo(`/cases/${caseItem.id}`)"
        >
          <!-- Header coloré selon priorité -->
          <div 
            class="h-2"
            :class="{
              'bg-gradient-to-r from-green-400 to-green-500': caseItem.priority === 'low',
              'bg-gradient-to-r from-yellow-400 to-yellow-500': caseItem.priority === 'medium',
              'bg-gradient-to-r from-orange-400 to-orange-500': caseItem.priority === 'high',
              'bg-gradient-to-r from-red-400 to-red-500': caseItem.priority === 'urgent',
            }"
          ></div>

          <div class="p-6">
            <!-- Titre et badges -->
            <div class="mb-4">
              <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {{ caseItem.title }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  class="px-2.5 py-1 text-xs font-bold rounded-full shadow-sm"
                  :class="getStatusClass(caseItem.status)"
                >
                  {{ getStatusLabel(caseItem.status) }}
                </span>
                <span
                  class="px-2.5 py-1 text-xs font-bold rounded-full shadow-sm"
                  :class="getPriorityClass(caseItem.priority)"
                >
                  {{ getPriorityLabel(caseItem.priority) }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ caseItem.description }}</p>

            <!-- Infos -->
            <div class="space-y-2 text-sm mb-4">
              <div class="flex items-center gap-2 text-gray-600">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span class="font-semibold">{{ caseItem.case_number }}</span>
              </div>
              <div v-if="caseItem.case_type" class="flex items-center gap-2 text-gray-600">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{{ caseItem.case_type }}</span>
              </div>
            </div>

            <!-- Client -->
            <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm"
              >
                {{ getInitials(`${caseItem.client_first_name || ''} ${caseItem.client_last_name || ''}`) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">
                  {{ caseItem.client_first_name }} {{ caseItem.client_last_name }}
                </p>
                <p class="text-xs text-gray-500">{{ formatDate(caseItem.created_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Action overlay au hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-blue-600/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <button class="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              Voir les détails
            </button>
          </div>
        </div>
      </div>

      <!-- Vue Liste -->
      <div v-else-if="viewMode === 'list'" class="space-y-3">
        <div
          v-for="caseItem in sortedCases"
          :key="caseItem.id"
          class="group bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden border border-white cursor-pointer"
          @click="navigateTo(`/cases/${caseItem.id}`)"
        >
          <div class="flex items-center gap-4 p-4">
            <!-- Indicateur de priorité -->
            <div 
              class="w-1.5 h-16 rounded-full"
              :class="{
                'bg-gradient-to-b from-green-400 to-green-500': caseItem.priority === 'low',
                'bg-gradient-to-b from-yellow-400 to-yellow-500': caseItem.priority === 'medium',
                'bg-gradient-to-b from-orange-400 to-orange-500': caseItem.priority === 'high',
                'bg-gradient-to-b from-red-400 to-red-500': caseItem.priority === 'urgent',
              }"
            ></div>

            <!-- Client Avatar -->
            <div
              class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0"
            >
              {{ getInitials(`${caseItem.client_first_name || ''} ${caseItem.client_last_name || ''}`) }}
            </div>

            <!-- Infos principales -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {{ caseItem.title }}
                </h3>
                <span
                  class="px-2 py-0.5 text-xs font-bold rounded-full shadow-sm flex-shrink-0"
                  :class="getStatusClass(caseItem.status)"
                >
                  {{ getStatusLabel(caseItem.status) }}
                </span>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ caseItem.client_first_name }} {{ caseItem.client_last_name }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  {{ caseItem.case_number }}
                </span>
                <span v-if="caseItem.case_type" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {{ caseItem.case_type }}
                </span>
              </div>
            </div>

            <!-- Date et Actions -->
            <div class="flex items-center gap-4 flex-shrink-0">
              <div class="text-right">
                <p class="text-xs text-gray-500">Créé le</p>
                <p class="text-sm font-semibold text-gray-900">{{ formatDate(caseItem.created_at) }}</p>
              </div>
              <button
                class="p-2 bg-blue-100 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="openCase(caseItem.id)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Création -->
    <CreateCaseModal :show="showCreateModal" @close="showCreateModal = false" />
  </div>
</template>

<script setup lang="ts">
import CaseStats from '~/components/cases/CaseStats.vue';
import CreateCaseModal from '~/components/cases/CreateCaseModal.vue';

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const authStore = useAuthStore();
const { getAllCases } = useCase();

const cases = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const expandedClients = ref<Set<string>>(new Set());
const viewMode = ref<'group' | 'grid' | 'list'>('group');

const filters = ref({
  search: '',
  status: '',
  priority: '',
  sortBy: 'created_at',
  sortOrder: 'desc' as 'asc' | 'desc',
});

const sortOptions = [
  { label: 'Date de création', value: 'created_at' },
  { label: 'Titre', value: 'title' },
  { label: 'Priorité', value: 'priority' },
  { label: 'Statut', value: 'status' },
  { label: 'Client', value: 'client_name' },
];

const hasActiveFilters = computed(() => {
  return filters.value.search !== '' || 
         filters.value.status !== '' || 
         filters.value.priority !== '';
});

const sortedCases = computed(() => {
  let result = [...cases.value];
  
  // Tri
  result.sort((a, b) => {
    let compareValue = 0;
    
    switch (filters.value.sortBy) {
      case 'title':
        compareValue = a.title.localeCompare(b.title);
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        compareValue = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      case 'client_name':
        const aName = `${a.client_first_name || ''} ${a.client_last_name || ''}`;
        const bName = `${b.client_first_name || ''} ${b.client_last_name || ''}`;
        compareValue = aName.localeCompare(bName);
        break;
      case 'created_at':
      default:
        compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    
    return filters.value.sortOrder === 'asc' ? compareValue : -compareValue;
  });
  
  return result;
});

const clientGroups = computed(() => {
  const groups: Record<string, any> = {};

  // Déterminer si on groupe par client (avocat) ou par avocat (client)
  const isLawyer = authStore.user?.role === 'avocat';

  cases.value.forEach(caseItem => {
    let groupId: string;
    let groupName: string;
    let groupEmail: string;

    if (isLawyer) {
      // Avocat : grouper par client
      groupId = caseItem.client_id;
      groupName = `${caseItem.client_first_name || ''} ${caseItem.client_last_name || ''}`.trim() || 'Client inconnu';
      groupEmail = caseItem.client_email || '';
    } else {
      // Client : grouper par avocat
      groupId = caseItem.lawyer_id || 'no-lawyer';
      groupName = `${caseItem.lawyer_first_name || ''} ${caseItem.lawyer_last_name || ''}`.trim() || 'Avocat non assigné';
      groupEmail = caseItem.lawyer_email || '';
    }

    if (!groups[groupId]) {
      groups[groupId] = {
        clientName: groupName,
        clientEmail: groupEmail,
        isLawyer,
        cases: []
      };
    }

    groups[groupId].cases.push(caseItem);
  });

  return groups;
});

const stats = computed(() => {
  return {
    total: cases.value.length,
    clients: Object.keys(clientGroups.value).length,
    inProgress: cases.value.filter(c => c.status === 'in_progress').length,
    closed: cases.value.filter(c => c.status === 'closed').length,
  };
});

let searchTimeout: any;

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadCases();
  }, 500);
};

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    priority: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  };
  loadCases();
};

const setSortBy = (sortBy: string) => {
  if (filters.value.sortBy === sortBy) {
    // Toggle sort order
    filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    filters.value.sortBy = sortBy;
    filters.value.sortOrder = 'desc';
  }
};

const getGroupStats = (group: any) => {
  return {
    inProgress: group.cases.filter((c: any) => c.status === 'in_progress').length,
    closed: group.cases.filter((c: any) => c.status === 'closed').length,
  };
};

const openCase = (caseId: string) => {
  navigateTo(`/cases/${caseId}`);
};

const editCase = (caseId: string) => {
  // TODO: Implémenter l'édition
  console.log('Edit case:', caseId);
};

const exportCases = () => {
  // TODO: Implémenter l'export
  console.log('Export cases');
  alert('Fonctionnalité d\'export en cours de développement...');
};

const loadCases = async () => {
  if (!authStore.user) return;

  try {
    loading.value = true;

    const apiFilters: any = {};

    if (filters.value.status) apiFilters.status = filters.value.status;
    if (filters.value.priority) apiFilters.priority = filters.value.priority;
    if (filters.value.search) apiFilters.search = filters.value.search;

    if (authStore.user.role === 'avocat') {
      apiFilters.lawyer_id = authStore.user.id;
    } else if (authStore.user.role === 'client') {
      apiFilters.client_id = authStore.user.id;
    }

    const response = await getAllCases(apiFilters);

    if (response.success && response.data) {
      cases.value = response.data;
    }
  } catch (error) {
    console.error('Error loading cases:', error);
    cases.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleClient = (clientId: string) => {
  if (expandedClients.value.has(clientId)) {
    expandedClients.value.delete(clientId);
  } else {
    expandedClients.value.add(clientId);
  }
};

const contactPerson = (personId: string, personName: string, caseId?: string | null, caseTitle?: string) => {
  const query: any = {
    recipientId: personId,
    recipientName: encodeURIComponent(personName)
  };

  // Si un dossier est spécifié, inclure dans les paramètres
  if (caseId) {
    query.caseId = caseId;
    query.caseTitle = encodeURIComponent(caseTitle || '');
  }

  navigateTo({
    path: '/messages',
    query
  });
};

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(p => p);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]?.substring(0, 2).toUpperCase() || '?';
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || '?';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    on_hold: 'bg-gray-100 text-gray-800',
    closed: 'bg-green-100 text-green-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    on_hold: 'En pause',
    closed: 'Fermé',
  };
  return labels[status] || status;
};

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente',
  };
  return labels[priority] || priority;
};

onMounted(() => {
  loadCases();
});

onBeforeUnmount(() => {
  clearTimeout(searchTimeout);
});
</script>