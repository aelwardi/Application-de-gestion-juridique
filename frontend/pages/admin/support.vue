<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
});

const { apiFetch } = useApi();
const toast = useToast();
const confirmModal = useConfirm();

const tickets = ref<any[]>([]);
const selectedTicket = ref<any>(null);
const loading = ref(true);
const searchQuery = ref('');
const messageText = ref('');
const sendingMessage = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const filters = ref({
  status: '',
});

const pagination = ref({
  page: 1,
  limit: 100,
  total: 0,
  totalPages: 0,
});

const filteredTickets = computed(() => {
  let result = tickets.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t =>
        t.subject.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.user_name.toLowerCase().includes(query)
    );
  }

  return result;
});

const fetchTickets = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
    });

    if (filters.value.status) params.append('status', filters.value.status);

    const response = await apiFetch<any>(`/support/tickets?${params}`, { method: 'GET' });

    if (response.success) {
      tickets.value = response.data;
      pagination.value = { ...pagination.value, ...response.pagination };
    }
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
  } finally {
    loading.value = false;
  }
};

const selectTicket = async (ticket: any) => {
  try {
    const response = await apiFetch<any>(`/support/tickets/${ticket.id}`, { method: 'GET' });

    if (response.success) {
      selectedTicket.value = {
        ...response.data.ticket,
        messages: response.data.messages
      };

      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      }, 100);
    }
  } catch (error) {
    console.error('Failed to fetch ticket details:', error);
  }
};

const sendMessage = async () => {
  if (!messageText.value.trim() || !selectedTicket.value) return;

  sendingMessage.value = true;
  try {
    const response = await apiFetch<any>(`/support/tickets/${selectedTicket.value.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message: messageText.value,
        isInternal: false,
      }),
    });

    if (response.success) {
      if (!selectedTicket.value.messages) {
        selectedTicket.value.messages = [];
      }
      selectedTicket.value.messages.push(response.data);
      messageText.value = '';

      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      }, 100);
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    toast.error('Erreur lors de l\'envoi du message');
  } finally {
    sendingMessage.value = false;
  }
};

const closeTicket = async () => {
  if (!selectedTicket.value) return;

  const confirmed = await confirmModal.confirm({
    title: 'Clôturer le ticket',
    message: 'Êtes-vous sûr de vouloir clôturer ce ticket ? Le client/avocat devra créer un nouveau ticket pour vous contacter à nouveau.',
    confirmText: 'Clôturer',
    cancelText: 'Annuler',
    type: 'warning'
  });

  if (!confirmed) return;

  try {
    await apiFetch(`/support/tickets/${selectedTicket.value.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'closed' }),
    });

    selectedTicket.value.status = 'closed';

    const ticketIndex = tickets.value.findIndex(t => t.id === selectedTicket.value.id);
    if (ticketIndex !== -1) {
      tickets.value[ticketIndex].status = 'closed';
    }

    toast.success('Ticket clôturé avec succès');
  } catch (error) {
    console.error('Failed to close ticket:', error);
    toast.error('Erreur lors de la clôture du ticket');
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Resolu',
    closed: 'Ferme',
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Aujourd\'hui';
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'A l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchTickets();
});
</script>






<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div class="bg-white border-b border-gray-200 px-4 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h1 class="text-2xl font-bold text-gray-900">Support Admin</h1>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">{{ pagination.total }} tickets</span>
        </div>
      </div>
    </div>

    <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <div class="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div class="p-4 border-b border-gray-200 space-y-3 flex-shrink-0">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                v-model="filters.status"
                @change="fetchTickets"
                class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous</option>
                <option value="open">Ouverts</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Resolus</option>
                <option value="closed">Fermes</option>
              </select>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>

            <div v-else-if="filteredTickets.length === 0" class="text-center py-12 px-4">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-sm text-gray-600">Aucun ticket trouvé</p>
            </div>

            <div v-else class="divide-y divide-gray-200">
              <button
                v-for="ticket in filteredTickets"
                :key="ticket.id"
                @click="selectTicket(ticket)"
                :class="[
                  'w-full text-left p-4 hover:bg-gray-50 transition-colors',
                  selectedTicket?.id === ticket.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                ]"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="font-medium text-gray-900 text-sm line-clamp-1">
                    {{ ticket.subject }}
                  </h3>
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', getStatusClass(ticket.status)]">
                    {{ getStatusLabel(ticket.status) }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 line-clamp-2 mb-2">{{ ticket.description }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                  <span>{{ ticket.user_name }}</span>
                  <span></span>
                  <span>{{ formatDate(ticket.created_at) }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div v-if="selectedTicket" class="flex flex-col h-full">
            <div class="p-4 border-b border-gray-200 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">{{ selectedTicket.subject }}</h2>
                  <div class="flex items-center gap-3 mt-1">
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(selectedTicket.status)]">
                      {{ getStatusLabel(selectedTicket.status) }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ selectedTicket.user_name }} ({{ selectedTicket.user_email }})
                    </span>
                  </div>
                </div>
                <button
                  v-if="selectedTicket.status !== 'closed'"
                  @click="closeTicket"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Cloturer
                </button>
              </div>
            </div>

            <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {{ getInitials(selectedTicket.user_name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-gray-900 text-sm">{{ selectedTicket.user_name }}</span>
                      <span class="text-xs text-gray-500">
                        {{ formatDateTime(selectedTicket.created_at) }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedTicket.description }}</p>
                  </div>
                </div>
              </div>

              <div
                v-for="message in selectedTicket.messages || []"
                :key="message.id"
                :class="['flex items-start gap-3', message.is_admin ? '' : 'flex-row-reverse']"
              >
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0', message.is_admin ? 'bg-green-600' : 'bg-blue-600']">
                  {{ message.is_admin ? 'A' : getInitials(selectedTicket.user_name) }}
                </div>
                <div :class="['flex-1 min-w-0', message.is_admin ? '' : 'text-right']">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-900 text-sm">
                      {{ message.is_admin ? 'Admin' : selectedTicket.user_name }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatDateTime(message.created_at) }}
                    </span>
                  </div>
                  <div :class="['inline-block px-4 py-2 rounded-lg', message.is_admin ? 'bg-gray-100 text-gray-900' : 'bg-blue-100 text-gray-900']">
                    <p class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedTicket.status !== 'closed'" class="p-4 border-t border-gray-200 flex-shrink-0">
              <form @submit.prevent="sendMessage" class="flex gap-2">
                <input
                  v-model="messageText"
                  type="text"
                  placeholder="Ecrire votre reponse..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  :disabled="sendingMessage"
                />
                <button
                  type="submit"
                  :disabled="sendingMessage || !messageText.trim()"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
            <div v-else class="p-4 border-t border-gray-200 bg-gray-50 text-center flex-shrink-0">
              <p class="text-sm text-gray-600">Ce ticket est cloturé</p>
            </div>
          </div>

          <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p class="text-gray-600 font-medium">Selectionnez un ticket</p>
              <p class="text-sm text-gray-400 mt-1">Choisissez une conversation pour commencer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


