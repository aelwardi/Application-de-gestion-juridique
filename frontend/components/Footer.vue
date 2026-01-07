<script setup lang="ts">
import { ref, computed } from 'vue'
import FeedbackModal from './FeedbackModal.vue'

const showFeedbackModal = ref(false)

const currentYear = computed(() => new Date().getFullYear())

const openFeedbackModal = () => {
  showFeedbackModal.value = true
}
</script>


<template>
  <footer class="bg-gray-900 text-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- About -->
        <div>
          <h3 class="text-lg font-bold mb-4">Plateforme Juridique</h3>
          <p class="text-gray-400 text-sm">
            Connectez-vous avec les meilleurs avocats pour tous vos besoins juridiques.
          </p>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-4">Liens rapides</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/lawyers" class="text-gray-400 hover:text-white transition-colors">
                Trouver un avocat
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cases" class="text-gray-400 hover:text-white transition-colors">
                Mes dossiers
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/support" class="text-gray-400 hover:text-white transition-colors">
                Support
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-4">Légal</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                Mentions légales
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                CGU
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-4">Votre avis</h3>
          <p class="text-gray-400 text-sm mb-4">
            Aidez-nous à améliorer la plateforme
          </p>
          <button
            @click="openFeedbackModal"
            class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all font-medium shadow-lg flex items-center justify-center gap-2 group"
          >
            <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Donner mon avis
          </button>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © {{ currentYear }} Plateforme Juridique. Tous droits réservés.
        </p>
        <div class="flex gap-4 mt-4 md:mt-0">
          <a href="#" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <FeedbackModal :is-open="showFeedbackModal" @close="showFeedbackModal = false" />
  </footer>
</template>

