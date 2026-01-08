<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
});

const route = useRoute();
const { apiFetch } = useApi();
const authStore = useAuthStore();
const toast = useToast();
const confirmModal = useConfirm();

const ticket = ref<any>(null);
const messages = ref<any[]>([]);
const loading = ref(true);
const newStatus = ref('');
const newMessage = ref('');
const isInternalMessage = ref(false);
const sending = ref(false);

const fetchTicket = async () => {
  loading.value = true;
  try {
    const response = await apiFetch<any>(`/support/tickets/${route.params.id}`, {
      method: 'GET',
    });

    console.log('Réponse ticket:', response);

    if (response.success) {
      ticket.value = response.data.ticket;
      messages.value = response.data.messages;
      newStatus.value = ticket.value.status;

      console.log(' Ticket chargé:', ticket.value);
      console.log(' Messages chargés:', messages.value.length);
    }
  } catch (error) {
    console.error('Failed to fetch ticket:', error);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async () => {
  try {
    await apiFetch(`/support/tickets/${ticket.value.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus.value }),
    });
    ticket.value.status = newStatus.value;
    toast.success('Statut mis à jour avec succès');
  } catch (error) {
    console.error('Failed to update status:', error);
    toast.error('Erreur lors de la mise à jour');
  }
};

const assignToMe = async () => {
  try {
    await apiFetch(`/support/tickets/${ticket.value.id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ adminId: authStore.user?.id }),
    });
    ticket.value.admin_name = authStore.fullName;
    toast.success('Ticket assigné avec succès');
  } catch (error) {
    console.error('Failed to assign ticket:', error);
    toast.error('Erreur lors de l\'assignation');
  }
};

const closeTicket = async () => {
  const confirmed = await confirmModal.confirm({
    title: 'Clôturer le ticket',
    message: 'Êtes-vous sûr de vouloir clôturer ce ticket ? L\'utilisateur devra créer un nouveau ticket pour vous contacter à nouveau.',
    confirmText: 'Clôturer',
    cancelText: 'Annuler',
    type: 'warning'
  });

  if (!confirmed) return;

  try {
    await apiFetch(`/support/tickets/${ticket.value.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'closed' }),
    });
    ticket.value.status = 'closed';
    newStatus.value = 'closed';
    toast.success('Ticket clôturé avec succès');
  } catch (error) {
    console.error('Failed to close ticket:', error);
    toast.error('Erreur lors de la clôture du ticket');
  }
};

const sendMessage = async () => {
  sending.value = true;
  try {
    const response = await apiFetch<any>(`/support/tickets/${ticket.value.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message: newMessage.value,
        isInternal: isInternalMessage.value,
      }),
    });

    if (response.success) {
      messages.value.push(response.data);
      newMessage.value = '';
      isInternalMessage.value = false;
      toast.success('Message envoyé avec succès');
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    toast.error('Erreur lors de l\'envoi');
  } finally {
    sending.value = false;
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Résolu',
    closed: 'Fermé',
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Urgente',
  };
  return labels[priority] || priority;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR');
};

onMounted(() => {
  fetchTicket();
});
</script>



<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin/support" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </NuxtLink>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Ticket #{{ ticket?.id?.substring(0, 8) }}</h1>
              <p class="mt-1 text-sm text-gray-500">{{ ticket?.subject }}</p>
            </div>
          </div>
          <div v-if="ticket" class="flex items-center space-x-3">
            <select
              v-model="newStatus"
              @change="updateStatus"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Ouvert</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
            <button
              v-if="ticket.status !== 'closed'"
              @click="closeTicket"
              class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckIcon class="h-4 w-4" />
              Clôturer
            </button>
            <button
              @click="assignToMe"
              class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              M'assigner
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>

    <div v-else-if="ticket" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg p-6 space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Statut</h3>
              <span
                class="mt-1 px-3 py-1 text-sm font-semibold rounded-full inline-block"
                :class="{
                  'bg-blue-100 text-blue-800': ticket.status === 'open',
                  'bg-yellow-100 text-yellow-800': ticket.status === 'in_progress',
                  'bg-green-100 text-green-800': ticket.status === 'resolved',
                  'bg-gray-100 text-gray-800': ticket.status === 'closed',
                }"
              >
                {{ getStatusLabel(ticket.status) }}
              </span>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-500">Priorité</h3>
              <span
                class="mt-1 px-3 py-1 text-sm font-semibold rounded-full inline-block"
                :class="{
                  'bg-gray-100 text-gray-800': ticket.priority === 'low',
                  'bg-blue-100 text-blue-800': ticket.priority === 'medium',
                  'bg-orange-100 text-orange-800': ticket.priority === 'high',
                  'bg-red-100 text-red-800': ticket.priority === 'urgent',
                }"
              >
                {{ getPriorityLabel(ticket.priority) }}
              </span>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-500">Utilisateur</h3>
              <p class="mt-1 text-sm text-gray-900">{{ ticket.user_name }}</p>
              <p class="text-sm text-gray-500">{{ ticket.user_email }}</p>
            </div>

            <div v-if="ticket.admin_name">
              <h3 class="text-sm font-medium text-gray-500">Assigné à</h3>
              <p class="mt-1 text-sm text-gray-900">{{ ticket.admin_name }}</p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-500">Créé le</h3>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(ticket.created_at) }}</p>
            </div>

            <div v-if="ticket.category">
              <h3 class="text-sm font-medium text-gray-500">Catégorie</h3>
              <p class="mt-1 text-sm text-gray-900">{{ ticket.category }}</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Description</h3>
            <div class="prose prose-sm max-w-none">
              <p class="text-gray-700">{{ ticket.description }}</p>
            </div>
          </div>

          <div class="mt-6 bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Conversation ({{ messages.length }} messages)</h3>

            <div v-if="messages.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-sm text-gray-500">Aucun message pour le moment</p>
              <p class="text-xs text-gray-400 mt-1">Envoyez un message pour commencer la conversation</p>
            </div>

            <div v-else class="space-y-4 mb-6 max-h-96 overflow-y-auto">
              <div
                v-for="message in messages"
                :key="message.id"
                class="border rounded-lg p-4 transition-all hover:shadow-sm"
                :class="message.is_internal ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white'"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ message.user_name }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(message.created_at) }}</p>
                  </div>
                  <span v-if="message.is_internal" class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Interne
                  </span>
                </div>
                <p class="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{{ message.message }}</p>
              </div>
            </div>

            <form @submit.prevent="sendMessage" class="space-y-4">
              <div>
                <label class="flex items-center mb-2">
                  <input
                    v-model="isInternalMessage"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Note interne (visible uniquement pour les admins)</span>
                </label>
                <textarea
                  v-model="newMessage"
                  rows="4"
                  required
                  placeholder="Votre réponse..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                :disabled="sending"
                class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {{ sending ? 'Envoi...' : 'Envoyer' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

