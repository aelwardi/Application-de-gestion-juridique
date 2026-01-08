<script setup lang="ts">
import { useToastStore } from '~/stores/toast'

const toastStore = useToastStore()

const getToastClasses = (type: string) => {
  const classes = {
    success: 'bg-green-50 border-green-500 text-green-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    warning: 'bg-amber-50 border-amber-500 text-amber-900',
    info: 'bg-blue-50 border-blue-500 text-blue-900',
  }
  return classes[type as keyof typeof classes] || classes.info
}
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="getToastClasses(toast.type)"
        class="rounded-xl shadow-2xl p-4 flex items-start gap-3 backdrop-blur-sm border-2 min-w-[320px]"
      >
        <!-- Icône -->
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Success -->
            <path
              v-if="toast.type === 'success'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <!-- Error -->
            <path
              v-else-if="toast.type === 'error'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <!-- Warning -->
            <path
              v-else-if="toast.type === 'warning'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
            <!-- Info -->
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Contenu -->
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm">{{ toast.title }}</p>
          <p v-if="toast.message" class="text-sm mt-1 opacity-90">
            {{ toast.message }}
          </p>
        </div>

        <!-- Bouton fermer -->
        <button
          @click="toastStore.removeToast(toast.id)"
          class="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>


<style scoped>
/* Animations d'entrée/sortie */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
