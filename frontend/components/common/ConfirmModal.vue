<script setup lang="ts">
import { useConfirmStore } from '~/stores/confirm'

const confirmStore = useConfirmStore()

const getIconClasses = computed(() => {
  const classes = {
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    error: 'bg-gradient-to-br from-red-500 to-red-600',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
    info: 'bg-gradient-to-br from-blue-500 to-blue-600',
  }
  return classes[confirmStore.options.type || 'info']
})

const getButtonClasses = computed(() => {
  const classes = {
    success: 'bg-gradient-to-r from-green-600 to-green-700',
    error: 'bg-gradient-to-r from-red-600 to-red-700',
    warning: 'bg-gradient-to-r from-amber-600 to-amber-700',
    info: 'bg-gradient-to-r from-blue-600 to-blue-700',
  }
  return classes[confirmStore.options.type || 'info']
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="confirmStore.isOpen"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="confirmStore.handleCancel"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform"
          @click.stop
        >
          <!-- Icône -->
          <div class="mb-4 flex justify-center">
            <div :class="getIconClasses" class="w-16 h-16 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  v-if="confirmStore.options.type === 'success'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  v-else-if="confirmStore.options.type === 'error'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  v-else-if="confirmStore.options.type === 'warning'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Contenu -->
          <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
            {{ confirmStore.options.title }}
          </h3>
          <p class="text-gray-600 text-center mb-6">
            {{ confirmStore.options.message }}
          </p>

          <!-- Boutons -->
          <div class="flex gap-3">
            <button
              v-if="confirmStore.options.showCancel"
              @click="confirmStore.handleCancel"
              class="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              {{ confirmStore.options.cancelText }}
            </button>
            <button
              @click="confirmStore.handleConfirm"
              :class="getButtonClasses"
              class="flex-1 px-4 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              {{ confirmStore.options.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>