<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-shrink-0">
        <img
          :src="lawyer.profilePictureUrl || '/images/default-avatar.png'"
          :alt="`${lawyer.firstName} ${lawyer.lastName}`"
          class="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
        />
      </div>

      <div class="flex-grow">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-900">
              {{ lawyer.firstName }} {{ lawyer.lastName }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              Barreau n° {{ lawyer.barNumber }}
            </p>
          </div>

          <span
            v-if="lawyer.verifiedByAdmin"
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            Vérifié
          </span>
        </div>

        <div class="flex items-center gap-4 mt-3">
          <div class="flex items-center">
            <svg
              v-for="i in 5"
              :key="i"
              class="w-5 h-5"
              :class="i <= Math.round(lawyer.rating) ? 'text-yellow-400' : 'text-gray-300'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="ml-2 text-sm text-gray-600">
              {{ lawyer.rating.toFixed(1) }} ({{ lawyer.totalReviews }} avis)
            </span>
          </div>

          <span class="text-sm text-gray-600">
            {{ lawyer.experienceYears }} ans d'expérience
          </span>
        </div>

        <div class="mt-3">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="specialty in lawyer.specialties.slice(0, 3)"
              :key="specialty"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ specialty }}
            </span>
            <span
              v-if="lawyer.specialties.length > 3"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              +{{ lawyer.specialties.length - 3 }} autres
            </span>
          </div>
        </div>

        <p v-if="lawyer.description" class="mt-3 text-sm text-gray-600 line-clamp-2">
          {{ lawyer.description }}
        </p>

        <div class="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <span v-if="lawyer.officeCity" class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {{ lawyer.officeCity }}
          </span>

          <span v-if="lawyer.hourlyRate" class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ lawyer.hourlyRate }}€/heure
          </span>

          <span
            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
            :class="{
              'bg-green-100 text-green-800': lawyer.availabilityStatus === 'available',
              'bg-orange-100 text-orange-800': lawyer.availabilityStatus === 'busy',
              'bg-red-100 text-red-800': lawyer.availabilityStatus === 'unavailable',
            }"
          >
            <span
              class="w-2 h-2 rounded-full mr-1"
              :class="{
                'bg-green-500': lawyer.availabilityStatus === 'available',
                'bg-orange-500': lawyer.availabilityStatus === 'busy',
                'bg-red-500': lawyer.availabilityStatus === 'unavailable',
              }"
            ></span>
            {{
              lawyer.availabilityStatus === 'available'
                ? 'Disponible'
                : lawyer.availabilityStatus === 'busy'
                ? 'Occupé'
                : 'Indisponible'
            }}
          </span>
        </div>

        <div class="mt-4 flex gap-3">
          <button
            @click="$emit('send-request', lawyer)"
            class="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            Envoyer une demande
          </button>
          <NuxtLink
            :to="`/lawyers/${lawyer.id}`"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium"
          >
            Voir le profil
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Lawyer } from '~/types/lawyer';

defineProps<{
  lawyer: Lawyer;
}>();

defineEmits<{
  (e: 'send-request', lawyer: Lawyer): void;
}>();
</script>