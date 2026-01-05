<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          Contactez-nous
        </h1>
        <p class="text-xl max-w-3xl mx-auto opacity-90">
          Une question ? Un problème ? Notre équipe est là pour vous aider
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Tabs -->
      <div class="flex justify-center mb-12">
        <div class="inline-flex bg-white rounded-lg shadow-sm p-1">
          <button
            @click="activeTab = 'contact'"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-all',
              activeTab === 'contact'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            📧 Nous contacter
          </button>
          <button
            @click="activeTab = 'feedback'"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-all',
              activeTab === 'feedback'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            ⭐ Donner mon avis
          </button>
        </div>
      </div>

      <!-- Contact Tab -->
      <div v-if="activeTab === 'contact'" class="grid lg:grid-cols-3 gap-12">
        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Envoyez-nous un message
            </h2>

            <form @submit.prevent="submitContact" class="space-y-6">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    v-model="contactForm.name"
                    type="text"
                    required
                    placeholder="Jean Dupont"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    v-model="contactForm.email"
                    type="email"
                    required
                    placeholder="jean.dupont@example.com"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <input
                  v-model="contactForm.subject"
                  type="text"
                  required
                  placeholder="Comment puis-je..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  v-model="contactForm.message"
                  rows="6"
                  required
                  placeholder="Décrivez votre demande en détail..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="submittingContact"
                class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
              >
                {{ submittingContact ? 'Envoi en cours...' : 'Envoyer le message' }}
              </button>
            </form>
          </div>

          <!-- FAQ Section -->
          <div class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <div class="space-y-4">
              <div v-for="(faq, index) in faqs" :key="index" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ faq.question }}
                </h3>
                <p class="text-gray-600">
                  {{ faq.answer }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Info Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-8 space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">
                Informations de contact
              </h3>
              <div class="space-y-4">
                <div v-for="(info, index) in contactInfo" :key="index" class="flex items-start">
                  <div class="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <component :is="info.icon" class="w-6 h-6" />
                  </div>
                  <div class="ml-4">
                    <h4 class="text-sm font-medium text-gray-900">
                      {{ info.title }}
                    </h4>
                    <a
                      v-if="info.link"
                      :href="info.link"
                      class="text-sm text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      {{ info.content }}
                    </a>
                    <p v-else class="text-sm text-gray-600">
                      {{ info.content }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-purple-900 mb-3">
                Support prioritaire
              </h3>
              <p class="text-sm text-purple-700 mb-4">
                Besoin d'une aide immédiate ? Créez un ticket support pour une réponse rapide.
              </p>
              <button
                @click="navigateTo('/support')"
                class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Créer un ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Tab -->
      <div v-else class="max-w-3xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">
              Donnez votre avis sur la plateforme
            </h2>
            <p class="text-lg text-gray-600">
              Votre opinion compte ! Aidez-nous à améliorer nos services juridiques
            </p>
          </div>

          <form @submit.prevent="submitFeedback" class="space-y-8">
            <!-- Rating Section -->
            <div>
              <label class="block text-lg font-semibold text-gray-900 mb-4 text-center">
                Quelle note donneriez-vous à notre plateforme ?
              </label>
              <p class="text-sm text-gray-600 text-center mb-6">
                Notez de 1 (très mauvais) à 10 (excellent)
              </p>

              <div class="flex justify-center gap-2 mb-4">
                <button
                  v-for="rating in 10"
                  :key="rating"
                  type="button"
                  @click="feedbackForm.rating = rating"
                  @mouseenter="hoverRating = rating"
                  @mouseleave="hoverRating = 0"
                  :class="[
                    'w-12 h-12 rounded-lg font-bold transition-all',
                    rating <= (hoverRating || feedbackForm.rating)
                      ? 'bg-purple-600 text-white scale-110 shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  ]"
                >
                  {{ rating }}
                </button>
              </div>

              <p v-if="feedbackForm.rating > 0" :class="['text-center text-xl font-semibold', getRatingColor(feedbackForm.rating)]">
                {{ getRatingText(feedbackForm.rating) }}
              </p>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quel aspect souhaitez-vous évaluer ?
              </label>
              <select
                v-model="feedbackForm.category"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une catégorie (optionnel)</option>
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
                Qu'avez-vous pensé de votre expérience ?
              </label>
              <textarea
                v-model="feedbackForm.comment"
                rows="5"
                placeholder="Partagez votre expérience, ce qui vous a plu ou déplu..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <!-- Suggestions -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Avez-vous des suggestions d'amélioration ?
              </label>
              <textarea
                v-model="feedbackForm.suggestions"
                rows="4"
                placeholder="Comment pouvons-nous améliorer notre plateforme juridique ?"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <!-- User Info Display -->
            <div v-if="authStore.user" class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Envoyé en tant que :</span> {{ authStore.user.email }}
                <span class="ml-2 text-purple-600">
                  ({{ getRoleLabel(authStore.user.role) }})
                </span>
              </p>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4 pt-6">
              <button
                type="button"
                @click="activeTab = 'contact'"
                class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Retour
              </button>
              <button
                type="submit"
                :disabled="submittingFeedback || feedbackForm.rating === 0"
                class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
              >
                {{ submittingFeedback ? 'Envoi...' : 'Envoyer mon avis' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'authenticated'
})

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('contact')
const submittingContact = ref(false)
const submittingFeedback = ref(false)
const hoverRating = ref(0)

const contactForm = ref({
  name: authStore.user ? `${authStore.user.firstName} ${authStore.user.lastName}` : '',
  email: authStore.user?.email || '',
  subject: '',
  message: ''
})

const feedbackForm = ref({
  rating: 0,
  category: '',
  comment: '',
  suggestions: ''
})

const contactInfo = [
  {
    icon: 'EnvelopeIcon',
    title: 'Email',
    content: 'contact@juridique.fr',
    link: 'mailto:contact@juridique.fr'
  },
  {
    icon: 'PhoneIcon',
    title: 'Téléphone',
    content: '+33 1 23 45 67 89',
    link: 'tel:+33123456789'
  },
  {
    icon: 'MapPinIcon',
    title: 'Adresse',
    content: '123 Avenue des Champs-Élysées, 75008 Paris, France',
    link: null
  },
  {
    icon: 'ClockIcon',
    title: 'Horaires',
    content: 'Lun - Ven: 9h00 - 18h00',
    link: null
  }
]

const faqs = [
  {
    question: 'Comment puis-je contacter un avocat ?',
    answer: 'Parcourez la liste des avocats, consultez leurs profils et envoyez-leur une demande directement via la plateforme.'
  },
  {
    question: 'Comment sont vérifiés les avocats ?',
    answer: 'Tous les avocats doivent fournir leurs documents officiels (numéro d\'inscription au barreau, etc.) et sont vérifiés avant validation.'
  },
  {
    question: 'Quels sont les frais ?',
    answer: 'La consultation de la plateforme est gratuite. Les honoraires sont définis directement par chaque avocat et affichés sur leur profil.'
  },
  {
    question: 'Comment se déroule un rendez-vous ?',
    answer: 'Après acceptation de votre demande, vous pouvez prendre rendez-vous directement via la plateforme. Les rendez-vous peuvent être physiques ou en visioconférence.'
  }
]

const submitContact = async () => {
  submittingContact.value = true
  try {
    // TODO: Implémenter l'envoi du formulaire de contact
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.')
    contactForm.value = {
      name: authStore.user ? `${authStore.user.firstName} ${authStore.user.lastName}` : '',
      email: authStore.user?.email || '',
      subject: '',
      message: ''
    }
  } catch (error) {
    alert('❌ Erreur lors de l\'envoi du message. Veuillez réessayer.')
  } finally {
    submittingContact.value = false
  }
}

const submitFeedback = async () => {
  if (feedbackForm.value.rating === 0) {
    alert('⚠️ Veuillez donner une note')
    return
  }

  submittingFeedback.value = true
  try {
    // TODO: Implémenter l'envoi du feedback
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('✅ Merci pour votre retour ! Votre avis a été enregistré.')
    feedbackForm.value = {
      rating: 0,
      category: '',
      comment: '',
      suggestions: ''
    }
  } catch (error) {
    alert('❌ Erreur lors de l\'envoi de votre avis. Veuillez réessayer.')
  } finally {
    submittingFeedback.value = false
  }
}

const getRatingText = (rating: number) => {
  if (rating === 0) return ''
  if (rating <= 3) return 'Mécontent 😞'
  if (rating <= 5) return 'Peu satisfait 😐'
  if (rating <= 7) return 'Satisfait 🙂'
  if (rating <= 9) return 'Très satisfait 😊'
  return 'Excellent ! 🎉'
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

