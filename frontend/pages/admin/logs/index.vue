<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <!-- Header -->
    <div class="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-black text-gray-900 flex items-center gap-3">
              <span class="text-4xl">📋</span>
              Journaux d'Activité
            </h1>
            <p class="mt-2 text-gray-600">Historique complet des actions sur la plateforme</p>
          </div>
          <button
            @click="loadLogs"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type d'action</label>
            <select
              v-model="filters.action"
              @change="filterLogs"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les actions</option>
              <option value="USER_LOGIN">Connexions</option>
              <option value="USER_LOGOUT">Déconnexions</option>
              <option value="LAWYER_VERIFIED">Validation avocat</option>
              <option value="TICKET_CREATED">Ticket créé</option>
              <option value="TICKET_CLOSED">Ticket clôturé</option>
              <option value="PROFILE_UPDATED">Mise à jour profil</option>
              <option value="CASE_CREATED">Dossier créé</option>
              <option value="APPOINTMENT_CREATED">Rendez-vous créé</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rôle utilisateur</label>
            <select
              v-model="filters.role"
              @change="filterLogs"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="avocat">Avocat</option>
              <option value="client">Client</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              v-model="filters.period"
              @change="filterLogs"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="all">Tout</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom, email..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              @input="filterLogs"
            />
          </div>
        </div>
      </div>

      <!-- Logs List -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="filteredLogs.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-600 font-medium">Aucun journal trouvé</p>
          <p class="text-sm text-gray-400 mt-1">Les journaux d'activité s'afficheront ici</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="log in paginatedLogs"
            :key="log.id"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', getActionColor(log.action)]">
                <span class="text-xl">{{ getActionIcon(log.action) }}</span>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ log.description }}</p>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="text-xs text-gray-500">
                        👤 {{ log.user_name }} ({{ log.user_role }})
                      </span>
                      <span class="text-xs text-gray-400">
                        📧 {{ log.user_email }}
                      </span>
                      <span class="text-xs text-gray-400">
                        🕐 {{ formatDateTime(log.created_at) }}
                      </span>
                    </div>
                  </div>
                  <span :class="['px-2 py-1 text-xs font-semibold rounded-full', getActionBadge(log.action)]">
                    {{ getActionLabel(log.action) }}
                  </span>
                </div>
                <div v-if="log.details" class="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                  {{ log.details }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredLogs.length > 0" class="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Affichage de <span class="font-medium">{{ startIndex + 1 }}</span> à
              <span class="font-medium">{{ Math.min(endIndex, filteredLogs.length) }}</span> sur
              <span class="font-medium">{{ filteredLogs.length }}</span> résultats
            </div>
            <div class="flex gap-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
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

interface Log {
  id: string;
  action: string;
  description: string;
  user_name: string;
  user_email: string;
  user_role: string;
  details?: string;
  created_at: string;
}

const { apiFetch } = useApi();

const logs = ref<Log[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 20;

const filters = ref({
  action: '',
  role: '',
  period: 'all',
});

const loadLogs = async () => {
  loading.value = true;
  try {
    // Appel API pour récupérer les vrais logs
    const response = await apiFetch<any>('/admin/logs', {
      method: 'GET',
    });

    if (response.success && response.data) {
      logs.value = response.data.map((log: any) => ({
        id: log.id,
        action: log.action,
        description: getDescriptionFromAction(log.action, log.metadata),
        user_name: log.user_name || 'Utilisateur inconnu',
        user_email: log.user_email || 'N/A',
        user_role: log.user_role || 'N/A',
        details: log.metadata ? JSON.stringify(log.metadata) : undefined,
        created_at: log.created_at,
      }));
    }
  } catch (error) {
    console.error('Erreur lors du chargement des logs:', error);
    // En cas d'erreur, afficher un message
    logs.value = [];
  } finally {
    loading.value = false;
  }
};

// Fonction pour générer une description lisible à partir de l'action
const getDescriptionFromAction = (action: string, metadata: any) => {
  const descriptions: Record<string, string> = {
    'USER_LOGIN': 'Connexion réussie',
    'USER_LOGOUT': 'Déconnexion',
    'LAWYER_VERIFIED': 'Validation du profil avocat',
    'LAWYER_REJECTED': 'Rejet du profil avocat',
    'TICKET_CREATED': 'Création d\'un ticket de support',
    'TICKET_CLOSED': 'Clôture d\'un ticket de support',
    'PROFILE_UPDATED': 'Mise à jour du profil',
    'CASE_CREATED': 'Création d\'un dossier',
    'CASE_UPDATED': 'Mise à jour d\'un dossier',
    'APPOINTMENT_CREATED': 'Création d\'un rendez-vous',
    'APPOINTMENT_UPDATED': 'Mise à jour d\'un rendez-vous',
    'DOCUMENT_UPLOADED': 'Upload d\'un document',
  };

  return descriptions[action] || action.replace(/_/g, ' ').toLowerCase();
};

const filteredLogs = computed(() => {
  let result = logs.value;

  // Filter by action
  if (filters.value.action) {
    result = result.filter(log => log.action === filters.value.action);
  }

  // Filter by role
  if (filters.value.role) {
    result = result.filter(log => log.user_role === filters.value.role);
  }

  // Filter by period
  if (filters.value.period !== 'all') {
    const now = new Date();
    result = result.filter(log => {
      const logDate = new Date(log.created_at);
      const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);

      if (filters.value.period === 'today') return diffDays < 1;
      if (filters.value.period === 'week') return diffDays < 7;
      if (filters.value.period === 'month') return diffDays < 30;
      return true;
    });
  }

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(log =>
      log.user_name.toLowerCase().includes(query) ||
      log.user_email.toLowerCase().includes(query) ||
      log.description.toLowerCase().includes(query)
    );
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => currentPage.value * itemsPerPage);

const paginatedLogs = computed(() => {
  return filteredLogs.value.slice(startIndex.value, endIndex.value);
});

const filterLogs = () => {
  currentPage.value = 1;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const getActionIcon = (action: string) => {
  const icons: Record<string, string> = {
    'USER_LOGIN': '',
    'USER_LOGOUT': '',
    'LAWYER_VERIFIED': '',
    'LAWYER_REJECTED': '',
    'TICKET_CREATED': '',
    'TICKET_CLOSED': '',
    'PROFILE_UPDATED': '️',
    'CASE_CREATED': '',
    'CASE_UPDATED': '',
    'APPOINTMENT_CREATED': '',
    'APPOINTMENT_UPDATED': '',
    'DOCUMENT_UPLOADED': '',
  };
  return icons[action] || '';
};

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    'USER_LOGIN': 'bg-green-100',
    'USER_LOGOUT': 'bg-gray-100',
    'LAWYER_VERIFIED': 'bg-blue-100',
    'LAWYER_REJECTED': 'bg-red-100',
    'TICKET_CREATED': 'bg-yellow-100',
    'TICKET_CLOSED': 'bg-purple-100',
    'PROFILE_UPDATED': 'bg-orange-100',
    'CASE_CREATED': 'bg-indigo-100',
    'CASE_UPDATED': 'bg-cyan-100',
    'APPOINTMENT_CREATED': 'bg-pink-100',
    'APPOINTMENT_UPDATED': 'bg-teal-100',
    'DOCUMENT_UPLOADED': 'bg-lime-100',
  };
  return colors[action] || 'bg-gray-100';
};

const getActionBadge = (action: string) => {
  const badges: Record<string, string> = {
    'USER_LOGIN': 'bg-green-100 text-green-800',
    'USER_LOGOUT': 'bg-gray-100 text-gray-800',
    'LAWYER_VERIFIED': 'bg-blue-100 text-blue-800',
    'LAWYER_REJECTED': 'bg-red-100 text-red-800',
    'TICKET_CREATED': 'bg-yellow-100 text-yellow-800',
    'TICKET_CLOSED': 'bg-purple-100 text-purple-800',
    'PROFILE_UPDATED': 'bg-orange-100 text-orange-800',
    'CASE_CREATED': 'bg-indigo-100 text-indigo-800',
    'CASE_UPDATED': 'bg-cyan-100 text-cyan-800',
    'APPOINTMENT_CREATED': 'bg-pink-100 text-pink-800',
    'APPOINTMENT_UPDATED': 'bg-teal-100 text-teal-800',
    'DOCUMENT_UPLOADED': 'bg-lime-100 text-lime-800',
  };
  return badges[action] || 'bg-gray-100 text-gray-800';
};

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    'USER_LOGIN': 'Connexion',
    'USER_LOGOUT': 'Déconnexion',
    'LAWYER_VERIFIED': 'Validation',
    'LAWYER_REJECTED': 'Rejet',
    'TICKET_CREATED': 'Ticket créé',
    'TICKET_CLOSED': 'Ticket fermé',
    'PROFILE_UPDATED': 'Profil',
    'CASE_CREATED': 'Dossier créé',
    'CASE_UPDATED': 'Dossier MAJ',
    'APPOINTMENT_CREATED': 'RDV créé',
    'APPOINTMENT_UPDATED': 'RDV MAJ',
    'DOCUMENT_UPLOADED': 'Document',
  };
  return labels[action] || action.replace(/_/g, ' ');
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadLogs();
});
</script>