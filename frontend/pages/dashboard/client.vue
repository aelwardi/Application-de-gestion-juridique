<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header modernisé -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Tableau de bord
        </h1>
        <p class="text-gray-600 mt-2 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Bienvenue {{ authStore.user?.firstName }} 👋
        </p>
      </div>

      <!-- Stats Cards modernisées avec animations -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-blue-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Dossiers Actifs</p>
              <p class="text-3xl font-bold text-blue-600">{{ stats?.activeCases || 0 }}</p>
              <p class="text-xs text-gray-500 mt-2">En cours de traitement</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-green-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Total Dossiers</p>
              <p class="text-3xl font-bold text-green-600">{{ stats?.totalCases || 0 }}</p>
              <p class="text-xs text-gray-500 mt-2">Tous vos dossiers</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-purple-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Rendez-vous</p>
              <p class="text-3xl font-bold text-purple-600">{{ stats?.upcomingAppointments || 0 }}</p>
              <p class="text-xs text-gray-500 mt-2">À venir prochainement</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="group bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-white hover:border-orange-200 cursor-pointer transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Documents</p>
              <p class="text-3xl font-bold text-orange-600">{{ stats?.totalDocuments || 0 }}</p>
              <p class="text-xs text-gray-500 mt-2">Fichiers disponibles</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Grille principale modernisée -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Section Dossiers -->
        <div class="lg:col-span-2">
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Mes Dossiers
              </h2>
              <NuxtLink 
                to="/cases" 
                class="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Voir tous
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
            <div class="p-6">
              <!-- État de chargement -->
              <div v-if="loadingCases" class="text-center py-12">
                <div class="inline-flex items-center justify-center">
                  <div class="relative">
                    <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p class="text-gray-600 mt-3 text-sm font-medium">Chargement des dossiers...</p>
              </div>
              
              <!-- État vide -->
              <div v-else-if="cases.length === 0" class="text-center py-12">
                <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun dossier</h3>
                <p class="text-gray-600 text-sm">Vous n'avez pas encore de dossier</p>
              </div>
              
              <!-- Liste des dossiers -->
              <div v-else class="space-y-4">
                <div
                  v-for="caseItem in cases"
                  :key="caseItem.id"
                  class="group border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  @click="navigateTo(`/cases/${caseItem.id}`)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {{ caseItem.title }}
                      </h3>
                      <p class="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        {{ caseItem.case_number }}
                      </p>
                      <div class="flex items-center gap-2 mt-3">
                        <span
                          class="px-3 py-1 text-xs rounded-full font-bold shadow-sm"
                          :class="getCaseStatusClass(caseItem.status)"
                        >
                          {{ getCaseStatusLabel(caseItem.status) }}
                        </span>
                        <span
                          class="px-3 py-1 text-xs rounded-full font-bold shadow-sm"
                          :class="getCasePriorityClass(caseItem.priority)"
                        >
                          {{ getPriorityLabel(caseItem.priority) }}
                        </span>
                      </div>
                    </div>
                    <div v-if="caseItem.lawyer_first_name" class="text-right ml-4 bg-gray-50 rounded-lg p-3">
                      <p class="text-xs text-gray-500 mb-1">Votre avocat</p>
                      <p class="font-semibold text-gray-900 text-sm">
                        {{ caseItem.lawyer_first_name }} {{ caseItem.lawyer_last_name }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Rendez-vous -->
        <div>
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Prochains RDV
              </h2>
              <NuxtLink 
                to="/clients/appointments"
                class="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Voir tous
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
            <div class="p-6">
              <!-- État de chargement -->
              <div v-if="loadingAppointments" class="text-center py-12">
                <div class="inline-flex items-center justify-center">
                  <div class="relative">
                    <div class="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                </div>
                <p class="text-gray-600 mt-3 text-sm font-medium">Chargement...</p>
              </div>
              
              <!-- État vide -->
              <div v-else-if="appointments.length === 0" class="text-center py-12">
                <div class="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun RDV</h3>
                <p class="text-gray-600 text-sm">Pas de rendez-vous à venir</p>
              </div>
              
              <!-- Liste des rendez-vous -->
              <div v-else class="space-y-4">
                <div
                  v-for="appointment in appointments"
                  :key="appointment.id"
                  class="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <h3 class="font-bold text-gray-900">{{ appointment.title }}</h3>
                  <p class="text-sm text-gray-600 mt-2 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(appointment.start_time) }}
                  </p>
                  <p class="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}
                  </p>
                  <div v-if="appointment.lawyer_first_name" class="mt-3 pt-3 border-t border-gray-200">
                    <p class="text-xs text-gray-500 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Avec {{ appointment.lawyer_first_name }} {{ appointment.lawyer_last_name }}
                    </p>
                  </div>
                  <span
                    class="inline-block mt-3 px-3 py-1 text-xs rounded-full font-bold shadow-sm"
                    :class="getAppointmentStatusClass(appointment.status)"
                  >
                    {{ getAppointmentStatusLabel(appointment.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Documents modernisée -->
      <div class="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Documents Récents
          </h2>
          <NuxtLink 
            to="/documents" 
            class="text-orange-600 hover:text-orange-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Voir tous
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
        <div class="p-6">
          <!-- État de chargement -->
          <div v-if="loadingDocuments" class="text-center py-12">
            <div class="inline-flex items-center justify-center">
              <div class="relative">
                <div class="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <p class="text-gray-600 mt-3 text-sm font-medium">Chargement des documents...</p>
          </div>
          
          <!-- État vide -->
          <div v-else-if="documents.length === 0" class="text-center py-12">
            <div class="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun document</h3>
            <p class="text-gray-600 text-sm">Aucun document disponible pour le moment</p>
          </div>
          
          <!-- Liste des documents -->
          <div v-else class="space-y-3">
            <div
              v-for="document in documents"
              :key="document.id"
              class="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{{ document.fileName }}</p>
                  <p class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {{ document.caseTitle }}
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(document.createdAt) }}
                    </span>
                  </p>
                </div>
              </div>
              <button class="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClientStats } from '~/types/client';

definePageMeta({
  middleware: ['auth', 'client'],
  layout: 'authenticated',
});

const { getClientStats } = useClient();
const { getAllCases } = useCase();
const { getAllAppointments } = useAppointment();
const authStore = useAuthStore();

const stats = ref<ClientStats | null>(null);
const cases = ref<any[]>([]);
const appointments = ref<any[]>([]);
const documents = ref<any[]>([]);

const loadingCases = ref(true);
const loadingAppointments = ref(true);
const loadingDocuments = ref(true);

onMounted(async () => {
  if (!authStore.user) return;

  try {
    // Charger les stats
    stats.value = await getClientStats(authStore.user.id);

    // Charger les dossiers
    loadingCases.value = true;
    const casesResponse = await getAllCases({
      client_id: authStore.user.id,
      limit: 5
    });
    cases.value = casesResponse.data || [];
    loadingCases.value = false;

    // Charger les rendez-vous
    loadingAppointments.value = true;
    const appointmentsResponse = await getAllAppointments({
      client_id: authStore.user.id,
      limit: 5
    });
    appointments.value = (appointmentsResponse.data || []).filter((apt: any) => new Date(apt.start_time) > new Date());
    loadingAppointments.value = false;

    // Documents - à implémenter si nécessaire
    loadingDocuments.value = false;
  } catch (error) {
    console.error('Error loading client dashboard:', error);
    loadingCases.value = false;
    loadingAppointments.value = false;
    loadingDocuments.value = false;
  }
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCaseStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    on_hold: 'bg-gray-100 text-gray-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getCaseStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Accepté',
    in_progress: 'En cours',
    on_hold: 'En pause',
    resolved: 'Résolu',
    closed: 'Fermé',
    rejected: 'Rejeté',
  };
  return labels[status] || status;
};

const getCasePriorityClass = (priority: string) => {
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

const getAppointmentStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    no_show: 'bg-orange-100 text-orange-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getAppointmentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    scheduled: 'Programmé',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
    no_show: 'Absent',
  };
  return labels[status] || status;
};
</script>