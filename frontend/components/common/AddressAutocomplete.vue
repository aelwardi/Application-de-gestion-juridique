<template>
  <div class="relative">
    <label v-if="label" class="block text-sm font-semibold text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        :required="required"
        @input="handleInput"
        @focus="showSuggestions = true"
        @blur="handleBlur"
        class="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        :class="{ 'border-red-500': error }"
      />

      <!-- Loading spinner -->
      <div v-if="loading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <div class="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>

      <!-- Search icon -->
      <div v-else class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Suggestions dropdown -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <button
        v-for="(suggestion, index) in suggestions"
        :key="index"
        type="button"
        @mousedown.prevent="selectSuggestion(suggestion)"
        class="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
      >
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ getShortAddress(suggestion.address) }}</p>
            <p class="text-xs text-gray-500">{{ suggestion.formattedAddress }}</p>
          </div>
        </div>
      </button>
    </div>

    <!-- Current location button -->
    <button
      v-if="showCurrentLocationButton"
      type="button"
      @click="useCurrentLocation"
      class="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Utiliser ma position actuelle
    </button>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>

    <!-- Selected address info -->
    <div v-if="modelValue && modelValue.latitude && modelValue.longitude" class="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
      <div class="flex items-start gap-2">
        <svg class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div class="flex-1">
          <p class="text-green-800 font-medium">Adresse géolocalisée</p>
          <p class="text-green-600 text-xs mt-0.5">
            📍 {{ modelValue.latitude.toFixed(6) }}, {{ modelValue.longitude.toFixed(6) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGeolocation } from '~/composables/useGeolocation'

interface LocationData {
  address: string
  latitude: number | null
  longitude: number | null
  formattedAddress?: string
}

const props = defineProps<{
  modelValue: LocationData
  label?: string
  placeholder?: string
  required?: boolean
  showCurrentLocationButton?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LocationData]
}>()

const { loading, error, searchAddresses, getCurrentPosition, reverseGeocode } = useGeolocation()

const searchQuery = ref(props.modelValue?.address || '')
const suggestions = ref<any[]>([])
const showSuggestions = ref(false)
let searchTimeout: NodeJS.Timeout | null = null

watch(() => props.modelValue?.address, (newAddress) => {
  if (newAddress && newAddress !== searchQuery.value) {
    searchQuery.value = newAddress
  }
})

const handleInput = async () => {
  const query = searchQuery.value.trim()

  // Émettre la valeur même si pas encore géocodée
  emit('update:modelValue', {
    address: query,
    latitude: null,
    longitude: null
  })

  if (query.length < 3) {
    suggestions.value = []
    return
  }

  // Debounce pour éviter trop de requêtes
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(async () => {
    const results = await searchAddresses(query, 5)
    suggestions.value = results
  }, 300)
}

const selectSuggestion = (suggestion: any) => {
  searchQuery.value = suggestion.formattedAddress || suggestion.address
  showSuggestions.value = false

  emit('update:modelValue', {
    address: suggestion.formattedAddress || suggestion.address,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    formattedAddress: suggestion.formattedAddress
  })
}

const handleBlur = () => {
  // Delay to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const useCurrentLocation = async () => {
  try {
    loading.value = true
    const position = await getCurrentPosition()
    const lat = position.coords.latitude
    const lng = position.coords.longitude

    const address = await reverseGeocode(lat, lng)

    if (address) {
      searchQuery.value = address
      emit('update:modelValue', {
        address: address,
        latitude: lat,
        longitude: lng,
        formattedAddress: address
      })
    }
  } catch (err) {
    error.value = 'Impossible d\'obtenir votre position'
    console.error('Erreur de géolocalisation:', err)
  } finally {
    loading.value = false
  }
}

const getShortAddress = (address: string): string => {
  const parts = address.split(',')
  return parts.slice(0, 2).join(',')
}
</script>

<style scoped>
/* Animations pour les suggestions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>