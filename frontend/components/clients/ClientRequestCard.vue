<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-shrink-0">
        <img
          :src="request.lawyer_profile_picture || '/images/default-avatar.png'"
          :alt="`${request.lawyer_first_name} ${request.lawyer_last_name}`"
          class="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
        />
      </div>

      <div class="flex-grow">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ request.title }}</h3>
            <p class="text-sm text-gray-600 mt-1">
              Avocat: {{ request.lawyer_first_name }} {{ request.lawyer_last_name }}
            </p>
          </div>

          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            :class="getStatusClass(request.status)"
          >
            {{ getStatusLabel(request.status) }}
          </span>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {{ request.case_type }}
            </span>

            <span
              class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
              :class="getUrgencyClass(request.urgency)"
            >
              {{ getUrgencyLabel(request.urgency) }}
            </span>

            <span v-if="request.budget_max" class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Budget: {{ request.budget_min || 0 }}€ - {{ request.budget_max }}€
            </span>
          </div>

          <p class="text-sm text-gray-700 line-clamp-2">
            {{ request.description }}
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span>Envoyée le {{ formatDate(request.created_at) }}</span>
          <span v-if="request.responded_at">
            Réponse le {{ formatDate(request.responded_at) }}
          </span>
        </div>

        <div v-if="request.status === 'rejected' && request.rejection_reason" class="mb-4">
          <div class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm font-medium text-red-800 mb-1">Raison du rejet:</p>
            <p class="text-sm text-red-700">{{ request.rejection_reason }}</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="$emit('view', request)"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm font-medium"
          >
            Voir les détails
          </button>

          <button
            v-if="request.status === 'pending'"
            @click="$emit('cancel', request.id)"
            class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition text-sm font-medium"
          >
            Annuler
          </button>

          <NuxtLink
            v-if="request.status === 'accepted'"
            :to="`/cases/${request.id}`"
            class="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition text-sm font-medium"
          >
            Voir le dossier
          </NuxtLink>

          <NuxtLink
            v-if="request.status === 'rejected'"
            to="/lawyers"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition text-sm font-medium"
          >
            Trouver un autre avocat
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LawyerRequest } from '~/types/lawyer';

defineProps<{
  request: LawyerRequest;
}>();

defineEmits<{
  (e: 'cancel', requestId: string): void;
  (e: 'view', request: LawyerRequest): void;
}>();

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-orange-100 text-orange-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
    cancelled: 'Annulée',
  };
  return labels[status as keyof typeof labels] || status;
};

const getUrgencyClass = (urgency: string) => {
  const classes = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  return classes[urgency as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

const getUrgencyLabel = (urgency: string) => {
  const labels = {
    low: 'Faible',
    medium: 'Moyen',
    high: 'Élevé',
    urgent: 'Urgent',
  };
  return labels[urgency as keyof typeof labels] || urgency;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>