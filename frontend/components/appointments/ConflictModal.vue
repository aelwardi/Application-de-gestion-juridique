<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  conflicts: any[]
  availableSlots?: any[]
  allowForce?: boolean
}>()

const emit = defineEmits<{
  close: []
  selectSlot: [slot: any]
  forceCreate: []
}>()

const close = () => emit('close')
const selectSlot = (slot: any) => emit('selectSlot', slot)
const forceCreate = () => emit('forceCreate')

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>


<template>
  <transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-12">
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="close"></div>

        <div class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
          <div class="flex items-start gap-4 mb-6">
            <div class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                 Conflit de rendez-vous détecté
              </h3>
              <p class="text-gray-600">
                Ce créneau chevauche {{ conflicts.length }} rendez-vous existant(s).
              </p>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4 mb-6">
            <div v-for="conflict in conflicts" :key="conflict.id" class="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-semibold text-gray-900">{{ conflict.title }}</h4>
                  <div class="text-sm text-gray-600 mt-1 space-y-1">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ formatTime(conflict.start_time) }} - {{ formatTime(conflict.end_time) }}
                    </div>
                    <div v-if="conflict.client_name" class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {{ conflict.client_name }}
                    </div>
                    <div v-if="conflict.location_address" class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {{ conflict.location_address }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="availableSlots && availableSlots.length > 0" class="mb-6">
            <h4 class="font-semibold text-gray-900 mb-3">Créneaux disponibles suggérés :</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                v-for="(slot, index) in availableSlots.slice(0, 6)"
                :key="index"
                @click="selectSlot(slot)"
                class="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                {{ slot.label }}
              </button>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="close"
              class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              v-if="allowForce"
              @click="forceCreate"
              class="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Forcer la création
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>



<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

