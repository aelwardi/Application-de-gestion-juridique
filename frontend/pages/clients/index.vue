<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Mes Clients</h1>
        <p class="text-gray-600 mt-2">Gérez vos clients et consultez leurs dossiers</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <input
              v-model="filters.name"
              type="text"
              placeholder="Nom du client..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="filters.email"
              type="text"
              placeholder="Email..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ville</label>
            <input
              v-model="filters.city"
              type="text"
              placeholder="Ville..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtres</label>
            <select
              v-model="filters.hasActiveCases"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="handleSearch"
            >
              <option :value="undefined">Tous les clients</option>
              <option :value="true">Avec dossiers actifs</option>
              <option :value="false">Sans dossiers actifs</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="clients.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun client trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
        </div>

        <div v-else class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ville
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dossiers
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="client in clients"
                :key="client.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="viewClient(client.id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div
                        v-if="client.profilePictureUrl"
                        class="h-10 w-10 rounded-full bg-gray-200"
                        :style="`background-image: url('${client.profilePictureUrl}')`"
                      ></div>
                      <div
                        v-else
                        class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold"
                      >
                        {{ getInitials(client.firstName, client.lastName) }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ client.firstName }} {{ client.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ client.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.phone || '-' }}</div>
                  <div v-if="client.emergencyContactPhone" class="text-sm text-gray-500">
                    Urgence: {{ client.emergencyContactPhone }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.city || '-' }}</div>
                  <div v-if="client.postalCode" class="text-sm text-gray-500">{{ client.postalCode }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ client.activeCases }} actifs
                    </span>
                    <span class="text-xs text-gray-500">
                      / {{ client.totalCases }} total
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="client.isActive"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    Actif
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    Inactif
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    class="text-blue-600 hover:text-blue-900 mr-3"
                    @click.stop="viewClient(client.id)"
                  >
                    Voir
                  </button>
                  <button
                    class="text-indigo-600 hover:text-indigo-900"
                    @click.stop="viewClientCases(client.userId)"
                  >
                    Dossiers
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.totalPages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                :disabled="pagination.page === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                @click="changePage(pagination.page - 1)"
              >
                Précédent
              </button>
              <button
                :disabled="pagination.page === pagination.totalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                @click="changePage(pagination.page + 1)"
              >
                Suivant
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Affichage de
                  <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                  à
                  <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                  sur
                  <span class="font-medium">{{ pagination.total }}</span>
                  clients
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    :disabled="pagination.page === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                    ]"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                  <button
                    :disabled="pagination.page === pagination.totalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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

<script setup lang="ts">
import type { ClientWithUser, ClientSearchFilters } from '~/types/client';

definePageMeta({
  middleware: ['auth', 'lawyer'],
  layout: 'authenticated',
});

const { getClientsByLawyer, searchClients } = useClient();
const authStore = useAuthStore();

const clients = ref<ClientWithUser[]>([]);
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