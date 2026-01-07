<template>
  <transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          @click="closeModal"
        ></div>

        <!-- Modal panel -->
        <div class="relative inline-block bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-5">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-bold text-white">
                ⭐ Donnez votre avis
              </h3>
              <button
                @click="closeModal"
                class="text-white hover:text-gray-200 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-purple-100 mt-2">
              Votre opinion compte ! Aidez-nous à améliorer nos services
            </p>
          </div>

          <!-- Body -->
          <form @submit.prevent="submitFeedback" class="px-6 py-6 space-y-6">
            <!-- Rating Section -->
            <div>
              <label class="block text-center text-lg font-semibold text-gray-900 mb-3">
                Quelle note donneriez-vous à notre plateforme ?
              </label>
              <p class="text-sm text-gray-600 text-center mb-4">
                Cliquez pour noter de 1 (très mauvais) à 10 (excellent)
              </p>

              <div class="flex justify-center gap-2 mb-4">
                <button
                  v-for="rating in 10"
                  :key="rating"
                  type="button"
                  @click="form.rating = rating"
                  @mouseenter="hoverRating = rating"
                  @mouseleave="hoverRating = 0"
                  :class="[
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold transition-all transform',
                    rating <= (hoverRating || form.rating)
                      ? 'bg-purple-600 text-white scale-110 shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:scale-105'
                  ]"
                >
                  {{ rating }}
                </button>
              </div>

              <p v-if="form.rating > 0" :class="['text-center text-xl font-bold', getRatingColor(form.rating)]">
                {{ getRatingText(form.rating) }}
              </p>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quel aspect souhaitez-vous évaluer ? (optionnel)
              </label>
              <select
                v-model="form.category"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 bg-white"
              >
                <option value="">Sélectionner une catégorie...</option>
                <option value="interface">Interface et design</option>
                <option value="usability">Facilité d'utilisation</option>
                <option value="features">Fonctionnalités</option>
                <option value="lawyers">Qualité des avocats</option>
                <option value="support">Support client</option>
                <option value="security">Sécurité</option>
                <option value="pricing">Tarifs</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <!-- Comment -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Votre commentaire (optionnel)
              </label>
              <textarea
                v-model="form.comment"
                rows="4"
                placeholder="Partagez votre expérience, ce qui vous a plu ou déplu..."
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-gray-900 bg-white"
              ></textarea>
            </div>

            <!-- Suggestions -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Suggestions d'amélioration (optionnel)
              </label>
              <textarea
                v-model="form.suggestions"
                rows="3"
                placeholder="Comment pouvons-nous améliorer notre plateforme ?"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-gray-900 bg-white"
              ></textarea>
            </div>

            <!-- User Info -->
            <div v-if="authStore.user" class="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p class="text-sm text-gray-700">
                  <span class="font-semibold">{{ authStore.user.firstName }} {{ authStore.user.lastName }}</span>
                  <span class="text-gray-500 ml-2">({{ getRoleLabel(authStore.user.role) }})</span>
                </p>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="submitting || form.rating === 0"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
              >
                {{ submitting ? '⏳ Envoi...' : '✨ Envoyer mon avis' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()

const form = ref({
  rating: 0,
  category: '',
  comment: '',
  suggestions: ''
})

const hoverRating = ref(0)
const submitting = ref(false)

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset form when modal opens
    form.value = {
      rating: 0,
      category: '',
      comment: '',
      suggestions: ''
    }
    hoverRating.value = 0
  }
})

const closeModal = () => {
  emit('close')
}

const submitFeedback = async () => {
  if (form.value.rating === 0) {
    alert('⚠️ Veuillez donner une note avant de soumettre')
    return
  }

  submitting.value = true
  try {
    const { apiFetch } = useApi()

    const feedbackData = {
      rating: form.value.rating,
      category: form.value.category || null,
      comment: form.value.comment || null,
      suggestions: form.value.suggestions || null,
      user_email: authStore.user?.email,
      user_role: authStore.user?.role
    }

    const response = await apiFetch('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    })

    if (response.success) {
      alert('✅ Merci pour votre avis ! Votre retour a été enregistré avec succès.')
      closeModal()
    } else {
      throw new Error(response.message || 'Erreur lors de l\'envoi')
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du feedback:', error)
    alert('❌ Une erreur est survenue. Veuillez réessayer.')
  } finally {
    submitting.value = false
  }
}

const getRatingText = (rating: number) => {
  if (rating === 0) return ''
  if (rating <= 3) return 'Très insatisfait'
  if (rating <= 5) return 'Peu satisfait'
  if (rating <= 7) return 'Satisfait'
  if (rating <= 9) return 'Très satisfait'
  return 'Excellent !'
}

const getRatingColor = (rating: number) => {
  if (rating === 0) return ''
  if (rating <= 3) return 'text-red-600'
  if (rating <= 5) return 'text-orange-600'
  if (rating <= 7) return 'text-yellow-600'
  if (rating <= 9) return 'text-green-600'
  return 'text-purple-600'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    client: 'Client',
    avocat: 'Avocat',
    lawyer: 'Avocat',
    admin: 'Administrateur'
  }
  return labels[role] || role
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>

