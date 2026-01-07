<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  lawyerId: string
  date: string
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(true)
const result = ref<any>(null)
const config = useRuntimeConfig()
const authStore = useAuthStore()

onMounted(async () => {
  await loadOptimization()
})

const loadOptimization = async () => {
  loading.value = true
  try {
    const response = await $fetch<any>(
        `${config.public.apiBaseUrl}/appointments/optimize-route?lawyer_id=${props.lawyerId}&date=${props.date}`,
        { headers: authStore.getAuthHeaders() }
    )
    if (response.success) {
      result.value = response
    }
  } catch (error) {
    console.error('Erreur optimisation:', error)
  } finally {
    loading.value = false
  }
}

const openInGoogleMaps = () => {
  if (!result.value || !result.value.optimizedRoute) return

  const locations = result.value.optimizedRoute
  const origin = `${locations[0].lat},${locations[0].lng}`
  const destination = `${locations[locations.length - 1].lat},${locations[locations.length - 1].lng}`

  const waypoints = locations
      .slice(1, -1)
      .map((loc: any) => `${loc.lat},${loc.lng}`)
      .join('|')

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
  if (waypoints) {
    url += `&waypoints=${waypoints}`
  }
  url += '&travelmode=driving'

  window.open(url, '_blank')
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const close = () => emit('close')
</script>




<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-bold text-gray-900">Optimisation d'itinéraire</h3>
        <p class="text-sm text-gray-600 mt-1">Optimisez vos déplacements pour la journée</p>
      </div>
      <button @click="close" class="text-gray-400 hover:text-gray-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Calcul de l'itinéraire optimal...</p>
    </div>

    <div v-else-if="result">
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ result.optimizedRoute.length }}</div>
          <div class="text-xs text-gray-600 mt-1">Rendez-vous</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ result.totalDistance }} km</div>
          <div class="text-xs text-gray-600 mt-1">Distance totale</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ result.estimatedTime }} min</div>
          <div class="text-xs text-gray-600 mt-1">Temps estimé</div>
        </div>
      </div>

      <div v-if="result.savings" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-semibold text-green-800">Économie réalisée: {{ result.savings }}</span>
        </div>
      </div>

      <div class="space-y-3 mb-6">
        <h4 class="font-semibold text-gray-900">Itinéraire optimisé:</h4>
        <div v-for="(stop, index) in result.optimizedRoute" :key="stop.id" class="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
          <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {{ stop.order }}
          </div>
          <div class="flex-1">
            <div class="font-semibold text-gray-900">{{ stop.title }}</div>
            <div class="text-sm text-gray-600">{{ formatTime(stop.time) }}</div>
            <div class="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {{ stop.address }}
            </div>
            <div v-if="stop.distanceFromPrevious && stop.distanceFromPrevious > 0" class="text-xs text-blue-600 mt-2">
              → {{ stop.distanceFromPrevious }} km depuis le point précédent
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="openInGoogleMaps"
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Ouvrir dans Google Maps
        </button>
        <button
          @click="close"
          class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Fermer
        </button>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      <p>Aucun rendez-vous géolocalisé pour ce jour</p>
    </div>
  </div>
</template>

