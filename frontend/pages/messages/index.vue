<template>
  <div class="h-screen flex bg-gray-50">
    <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Messages</h2>
        <div class="mt-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="loadingConversations" class="p-4 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="conversations.length === 0" class="p-4 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="mt-2">Aucune conversation</p>
        </div>

        <div v-else>
          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            @click="selectConversation(conv)"
            :class="[
              'p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors',
              selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
            ]"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <div class="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {{ getInitials(conv.participantName) }}
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900 truncate">{{ conv.participantName }}</h3>
                  <span class="text-xs text-gray-500">{{ formatTime(conv.lastMessageAt) }}</span>
                </div>
                <p class="text-sm text-gray-600 truncate mt-1">{{ conv.lastMessage }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span v-if="conv.caseTitle" class="text-xs text-gray-500 truncate">
                    📁 {{ conv.caseTitle }}
                  </span>
                  <span v-if="conv.unreadCount > 0" class="ml-auto px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {{ conv.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200">
        <button
          @click="showNewMessageModal = true"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle conversation
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col">
      <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center text-gray-500">
        <div class="text-center">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="mt-4 text-lg">Sélectionnez une conversation</p>
          <p class="text-sm">ou créez-en une nouvelle</p>
        </div>
      </div>

      <template v-else>
        <div class="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {{ getInitials(selectedConversation.participantName) }}
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ selectedConversation.participantName }}</h3>
              <p v-if="selectedConversation.caseTitle" class="text-sm text-gray-500">
                📁 {{ selectedConversation.caseTitle }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div
            v-for="message in selectedConversation.messages"
            :key="message.id"
            :class="[
              'flex',
              message.isMe ? 'justify-end' : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-sm lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg',
                message.isMe
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              ]"
            >
              <p class="text-sm">{{ message.text }}</p>
              <p
                :class="[
                  'text-xs mt-1',
                  message.isMe ? 'text-blue-100' : 'text-gray-500'
                ]"
              >
                {{ formatTime(message.timestamp) }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-gray-200">
          <div class="flex gap-2">
            <button class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              v-model="newMessage"
              type="text"
              placeholder="Écrivez votre message..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keypress.enter="sendMessage"
            />
            <button
              @click="sendMessage"
              :disabled="!newMessage.trim()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <div v-if="showNewMessageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-2xl font-bold mb-4">Nouvelle Conversation</h2>
        <p class="text-gray-600 mb-4">Fonctionnalité en cours de développement...</p>
        <button
          @click="showNewMessageModal = false"
          class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const authStore = useAuthStore();

const conversations = ref<any[]>([]);
const selectedConversation = ref<any>(null);
const loadingConversations = ref(true);
const showNewMessageModal = ref(false);
const searchQuery = ref('');
const newMessage = ref('');

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value;
  const query = searchQuery.value.toLowerCase();
  return conversations.value.filter(conv =>
    conv.participantName.toLowerCase().includes(query) ||
    conv.lastMessage.toLowerCase().includes(query) ||
    conv.caseTitle?.toLowerCase().includes(query)
  );
});

onMounted(() => {
  loadConversations();
});

const loadConversations = async () => {
  try {
    loadingConversations.value = true;

    // Mock data
    conversations.value = [
      {
        id: '1',
        participantName: 'Me. Jean Dupont',
        caseTitle: 'Divorce',
        lastMessage: 'Je vous envoie les documents demandés',
        lastMessageAt: new Date('2025-12-22T14:30:00'),
        unreadCount: 2,
        messages: [
          {
            id: 'm1',
            text: 'Bonjour, avez-vous reçu mes documents ?',
            timestamp: new Date('2025-12-22T10:00:00'),
            isMe: true,
          },
          {
            id: 'm2',
            text: 'Oui, je les ai bien reçus. Je vais les examiner.',
            timestamp: new Date('2025-12-22T10:15:00'),
            isMe: false,
          },
          {
            id: 'm3',
            text: 'Je vous envoie les documents demandés',
            timestamp: new Date('2025-12-22T14:30:00'),
            isMe: false,
          },
        ],
      },
      {
        id: '2',
        participantName: 'Marie Martin',
        caseTitle: 'Litige Commercial',
        lastMessage: 'Merci pour votre aide',
        lastMessageAt: new Date('2025-12-21T16:00:00'),
        unreadCount: 0,
        messages: [
          {
            id: 'm4',
            text: 'Bonjour, j\'aurais besoin de vos conseils',
            timestamp: new Date('2025-12-21T15:00:00'),
            isMe: false,
          },
          {
            id: 'm5',
            text: 'Bien sûr, je suis à votre disposition',
            timestamp: new Date('2025-12-21T15:30:00'),
            isMe: true,
          },
          {
            id: 'm6',
            text: 'Merci pour votre aide',
            timestamp: new Date('2025-12-21T16:00:00'),
            isMe: false,
          },
        ],
      },
    ];
  } catch (error) {
    console.error('Error loading conversations:', error);
  } finally {
    loadingConversations.value = false;
  }
};

const selectConversation = (conv: any) => {
  selectedConversation.value = conv;
  conv.unreadCount = 0;
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return;

  selectedConversation.value.messages.push({
    id: `m${Date.now()}`,
    text: newMessage.value,
    timestamp: new Date(),
    isMe: true,
  });

  selectedConversation.value.lastMessage = newMessage.value;
  selectedConversation.value.lastMessageAt = new Date();

  newMessage.value = '';
};

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatTime = (date: Date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return messageDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
};
</script>