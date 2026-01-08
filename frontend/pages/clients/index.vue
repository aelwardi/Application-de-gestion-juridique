<script setup lang="ts">
import type { Client, ClientSearchFilters } from '~/types/client';

definePageMeta({
  middleware: ['auth', 'lawyer'],
  layout: 'authenticated'
});

const authStore = useAuthStore();
const { getAllClients, searchClients, getClientsByLawyer } = useClient();
const toast = useToast();

const clients = ref<Client[]>([]);
const loading = ref(true);

const filters = ref<ClientSearchFilters>({
  name: '',
  email: '',
  city: '',
  hasActiveCases: undefined,
  limit: 20,
  offset: 0,
});

const pagination = ref({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
});

let searchTimeout: NodeJS.Timeout;

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

const handleSearch = async () => {
  loading.value = true;
  filters.value.offset = 0;
  pagination.value.page = 1;
  await loadClients();
};

const loadClients = async () => {
  if (!authStore.user) return;

  try {
    loading.value = true;

    if (!filters.value.name && !filters.value.email && !filters.value.city && filters.value.hasActiveCases === undefined) {
      const result = await getClientsByLawyer(authStore.user.id, filters.value.limit, filters.value.offset);
      clients.value = result.data;
      pagination.value = {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    } else {
      const result = await searchClients({
        ...filters.value,
        lawyerId: authStore.user.id,
      });
      clients.value = result.data;
      pagination.value = {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    }
  } catch (error) {
    console.error('Error loading clients:', error);
    toast.error('Erreur lors du chargement des clients');
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.page = page;
  filters.value.offset = (page - 1) * pagination.value.limit;
  loadClients();
};

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, pagination.value.page - Math.floor(maxVisible / 2));
  let end = Math.min(pagination.value.totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const getInitials = (firstName: string, lastName: string) => {
  if (!firstName || !lastName) return '??';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const viewClient = (clientId: string) => {
  navigateTo(`/clients/${clientId}`);
};

const viewClientCases = (userId: string) => {
  navigateTo(`/cases?client=${userId}`);
};

onMounted(() => {
  loadClients();
});

onBeforeUnmount(() => {
  clearTimeout(searchTimeout);
});
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Mes Clients
              </h1>
              <p class="text-gray-600 mt-1">Gérez vos clients et consultez leurs dossiers</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </label>
            <input
              v-model="filters.name"
              type="text"
              placeholder="Nom du client..."
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </label>
            <input
              v-model="filters.email"
              type="text"
              placeholder="Email..."
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ville
            </label>
            <input
              v-model="filters.city"
              type="text"
              placeholder="Ville..."
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </label>
            <select
              v-model="filters.hasActiveCases"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm font-medium"
              @change="handleSearch"
            >
              <option :value="undefined">Tous les clients</option>
              <option :value="true">Avec dossiers actifs</option>
              <option :value="false">Sans dossiers actifs</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div v-if="loading" class="text-center py-16">
          <div class="relative inline-flex">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0"></div>
          </div>
          <p class="text-gray-600 mt-4 font-medium">Chargement des clients...</p>
        </div>

        <div v-else-if="clients.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Aucun client trouvé</h3>
          <p class="text-gray-500 mt-2">Essayez de modifier vos critères de recherche</p>
        </div>

        <div v-else class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Ville
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Dossiers
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr
                v-for="client in clients"
                :key="client.id"
                class="hover:bg-blue-50/50 cursor-pointer transition-all"
                @click="viewClient(client.id)"
              >
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <div
                        v-if="client.profilePictureUrl"
                        class="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 ring-2 ring-white shadow-sm"
                        :style="`background-image: url('${client.profilePictureUrl}'); background-size: cover; background-position: center;`"
                      ></div>
                      <div
                        v-else
                        class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white shadow-md"
                      >
                        {{ getInitials(client.firstName, client.lastName) }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-bold text-gray-900">
                        {{ client.firstName }} {{ client.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ client.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ client.phone || '-' }}</div>
                  <div v-if="client.emergencyContactPhone" class="text-sm text-gray-500">
                    <span class="text-red-600 font-semibold">SOS:</span> {{ client.emergencyContactPhone }}
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ client.city || '-' }}</div>
                  <div v-if="client.postalCode" class="text-sm text-gray-500">{{ client.postalCode }}</div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                      {{ client.activeCases }} actifs
                    </span>
                    <span class="text-xs text-gray-500 font-medium">
                      / {{ client.totalCases }} total
                    </span>
                  </div>
                </td>
                <td class="px-6 py-5 whitespace-nowrap">
                  <span
                    v-if="client.isActive"
                    class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Actif
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    Inactif
                  </span>
                </td>
                <td class="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5 mr-2"
                    @click.stop="viewClient(client.id)"
                  >
                    Voir
                  </button>
                  <button
                    class="px-4 py-2 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all"
                    @click.stop="viewClientCases(client.id)"
                  >
                    Dossiers
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.totalPages > 1" class="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                :disabled="pagination.page === 1"
                class="relative inline-flex items-center px-5 py-2.5 border-2 border-gray-200 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                @click="changePage(pagination.page - 1)"
              >
                Précédent
              </button>
              <button
                :disabled="pagination.page === pagination.totalPages"
                class="ml-3 relative inline-flex items-center px-5 py-2.5 border-2 border-gray-200 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                @click="changePage(pagination.page + 1)"
              >
                Suivant
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700 font-medium">
                  Affichage de
                  <span class="font-bold text-blue-600">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                  à
                  <span class="font-bold text-blue-600">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                  sur
                  <span class="font-bold text-blue-600">{{ pagination.total }}</span>
                  clients
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-xl shadow-sm gap-1">
                  <button
                    :disabled="pagination.page === 1"
                    class="relative inline-flex items-center px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    @click="changePage(pagination.page - 1)"
                  >
                    <span class="sr-only">Précédent</span>
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    :class="[
                      page === pagination.page
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50',
                      'relative inline-flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all'
                    ]"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                  <button
                    :disabled="pagination.page === pagination.totalPages"
                    class="relative inline-flex items-center px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    @click="changePage(pagination.page + 1)"
                  >
                    <span class="sr-only">Suivant</span>
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

