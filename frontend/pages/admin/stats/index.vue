<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
            <p class="mt-1 text-sm text-gray-500">Vue d'ensemble de la plateforme</p>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="refreshStats"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Utilisateurs</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">
                      {{ stats?.totalUsers || 0 }}
                    </div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <svg class="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span class="ml-1">{{ stats?.newUsersThisMonth || 0 }}</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink to="/admin/users" class="font-medium text-blue-700 hover:text-blue-900">
                Voir tous →
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Avocats</dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    {{ stats?.totalLawyers || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink to="/admin/lawyers" class="font-medium text-blue-700 hover:text-blue-900">
                Gérer →
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Clients</dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    {{ stats?.totalClients || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <NuxtLink to="/admin/users?role=client" class="font-medium text-blue-700 hover:text-blue-900">
                Voir tous →
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Utilisateurs Actifs</dt>
                  <dd class="text-2xl font-semibold text-gray-900">
                    {{ stats?.activeUsers || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <span class="text-gray-500">
                {{ stats ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0 }}% du total
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8" v-if="comprehensiveStats">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Statistiques Détaillées</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Dossiers</p>
                  <p class="text-3xl font-semibold text-gray-900">{{ comprehensiveStats.cases?.total || 0 }}</p>
                </div>
                <div class="p-3 bg-orange-100 rounded-full">
                  <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center space-x-4 text-sm">
                <span class="text-yellow-600">{{ comprehensiveStats.cases?.pending || 0 }} en attente</span>
                <span class="text-blue-600">{{ comprehensiveStats.cases?.in_progress || 0 }} en cours</span>
                <span class="text-green-600">{{ comprehensiveStats.cases?.resolved || 0 }} résolus</span>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <NuxtLink to="/admin/cases" class="text-sm font-medium text-blue-700 hover:text-blue-900">
                Voir tous les dossiers →
              </NuxtLink>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Avocats</p>
                  <p class="text-3xl font-semibold text-gray-900">{{ comprehensiveStats.lawyers?.total || 0 }}</p>
                </div>
                <div class="p-3 bg-blue-100 rounded-full">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between text-sm">
                <span class="text-green-600">{{ comprehensiveStats.lawyers?.verified || 0 }} vérifiés</span>
                <span class="text-yellow-600">{{ comprehensiveStats.lawyers?.pending_verification || 0 }} en attente</span>
                <span class="text-gray-600">
                  Note: {{ comprehensiveStats.lawyers?.average_rating ? Number(comprehensiveStats.lawyers.average_rating).toFixed(1) : '0.0' }}/5
                </span>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <NuxtLink to="/admin/lawyers" class="text-sm font-medium text-blue-700 hover:text-blue-900">
                Gérer les avocats →
              </NuxtLink>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Rendez-vous</p>
                  <p class="text-3xl font-semibold text-gray-900">{{ comprehensiveStats.appointments?.total || 0 }}</p>
                </div>
                <div class="p-3 bg-purple-100 rounded-full">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center space-x-4 text-sm">
                <span class="text-blue-600">{{ comprehensiveStats.appointments?.scheduled || 0 }} programmés</span>
                <span class="text-green-600">{{ comprehensiveStats.appointments?.completed || 0 }} terminés</span>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <span class="text-sm text-gray-500">{{ comprehensiveStats.appointments?.upcoming || 0 }} à venir</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            to="/admin/users"
            class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div class="flex-shrink-0">
              <svg class="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <span class="absolute inset-0" aria-hidden="true"></span>
              <p class="text-sm font-medium text-gray-900">Gérer Utilisateurs</p>
              <p class="text-sm text-gray-500">Voir, modifier, supprimer</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/admin/logs"
            class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div class="flex-shrink-0">
              <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <span class="absolute inset-0" aria-hidden="true"></span>
              <p class="text-sm font-medium text-gray-900">Journaux d'Activité</p>
              <p class="text-sm text-gray-500">Voir les logs système</p>
            </div>
          </NuxtLink>

          <button
            @click="showBulkEmailModal = true"
            class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 text-left"
          >
            <div class="flex-shrink-0">
              <svg class="h-10 w-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">Email Groupé</p>
              <p class="text-sm text-gray-500">Envoyer aux utilisateurs</p>
            </div>
          </button>

          <NuxtLink
            to="/admin/stats"
            class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div class="flex-shrink-0">
              <svg class="h-10 w-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <span class="absolute inset-0" aria-hidden="true"></span>
              <p class="text-sm font-medium text-gray-900">Statistiques</p>
              <p class="text-sm text-gray-500">Rapports détaillés</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Activité Récente</h2>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li class="px-6 py-4">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">Nouvel utilisateur inscrit</p>
                <p class="text-sm text-gray-500">Il y a 2 heures</p>
              </div>
            </li>
            <li class="px-6 py-4">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">Avocat vérifié</p>
                <p class="text-sm text-gray-500">Il y a 5 heures</p>
              </div>
            </li>
            <li class="px-6 py-4 text-center">
              <NuxtLink to="/admin/logs" class="text-sm font-medium text-blue-600 hover:text-blue-500">
                Voir tout l'historique →
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="showBulkEmailModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showBulkEmailModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Envoyer un Email Groupé</h3>

                <form @submit.prevent="sendBulkEmail">
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
                    <select
                      v-model="bulkEmailForm.role"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un groupe</option>
                      <option value="all">Tous les utilisateurs</option>
                      <option value="avocat">Avocats uniquement</option>
                      <option value="client">Clients uniquement</option>
                      <option value="collaborateur">Collaborateurs uniquement</option>
                    </select>
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                    <input
                      v-model="bulkEmailForm.subject"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Sujet de l'email"
                    />
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      v-model="bulkEmailForm.message"
                      required
                      rows="6"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Votre message..."
                    ></textarea>
                  </div>

                  <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      :disabled="bulkEmailLoading"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {{ bulkEmailLoading ? 'Envoi...' : 'Envoyer' }}
                    </button>
                    <button
                      type="button"
                      @click="showBulkEmailModal = false"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
});

interface AdminStats {
  totalUsers: number;
  totalLawyers: number;
  totalClients: number;
  totalCollaborators: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

const { apiFetch } = useApi();
const stats = ref<AdminStats | null>(null);
const comprehensiveStats = ref<any>(null);
const loading = ref(false);
const showBulkEmailModal = ref(false);
const bulkEmailLoading = ref(false);

const bulkEmailForm = ref({
  role: '',
  subject: '',
  message: '',
});

const fetchStats = async () => {
  loading.value = true;
  try {
    const response = await apiFetch<{ success: boolean; data: AdminStats }>('/admin/stats', {
      method: 'GET',
    });
    if (response.success) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
};

const fetchComprehensiveStats = async () => {
  try {
    const response = await apiFetch<{ success: boolean; data: any }>('/admin/stats/comprehensive', {
      method: 'GET',
    });
    if (response.success) {
      comprehensiveStats.value = response.data;
      console.log('📊 Statistiques complètes chargées:', comprehensiveStats.value);
    }
  } catch (error) {
    console.error('Failed to fetch comprehensive stats:', error);
    // Ne pas bloquer si les stats avancées échouent
    comprehensiveStats.value = {
      cases: { total: 0, pending: 0, in_progress: 0, resolved: 0 },
      lawyers: { total: 0, verified: 0, pending_verification: 0, average_rating: 0 },
      appointments: { total: 0, scheduled: 0, completed: 0, upcoming: 0 },
    };
  }
};

const sendBulkEmail = async () => {
  bulkEmailLoading.value = true;
  try {
    const response = await apiFetch('/admin/email/bulk', {
      method: 'POST',
      body: JSON.stringify(bulkEmailForm.value),
    });

    if (response.success) {
      alert('Emails envoyés avec succès !');
      showBulkEmailModal.value = false;
      bulkEmailForm.value = { role: '', subject: '', message: '' };
    } else {
      alert('Erreur lors de l\'envoi des emails');
    }
  } catch (error) {
    console.error('Failed to send bulk email:', error);
    alert('Erreur lors de l\'envoi des emails');
  } finally {
    bulkEmailLoading.value = false;
  }
};

const refreshStats = () => {
  fetchStats();
  fetchComprehensiveStats();
};

onMounted(() => {
  fetchStats();
  fetchComprehensiveStats();
});
</script>