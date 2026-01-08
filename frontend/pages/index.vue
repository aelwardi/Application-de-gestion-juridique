<script setup lang="ts">
import RegisterModal from '~/components/auth/RegisterModal.vue';

definePageMeta({
  layout: false,
});

const showRegisterModal = ref(false);
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
    <nav class="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-heading font-bold text-primary-700">
                <span class="text-primary-600">Lex</span><span class="text-neutral-800">Manager</span>
              </h1>
            </div>
          </div>

          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink to="#fonctionnalites" class="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              Fonctionnalités
            </NuxtLink>
            <NuxtLink to="#apropos" class="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              À propos
            </NuxtLink>
            <NuxtLink to="#contact" class="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              Contact
            </NuxtLink>
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink to="/auth/login" class="btn-outline">
              Connexion
            </NuxtLink>
            <button @click="showRegisterModal = true" class="btn-primary">
              Inscription
            </button>
          </div>
        </div>
      </div>
    </nav>

    <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-display-lg font-heading text-neutral-900 mb-6">
            Gérez vos affaires juridiques
            <span class="block text-primary-600">en toute simplicité</span>
          </h1>
          <p class="text-xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Une plateforme moderne pour la gestion des rendez-vous, dossiers et communications juridiques.
            Connectez avocats, clients et collaborateurs en un seul endroit.
          </p>

          <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
            <NuxtLink to="/home/lawyers" class="card p-8 hover:scale-105 transition-transform duration-300 group">
              <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <svg class="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-2xl font-heading font-bold text-neutral-900 mb-3">
                Je suis Avocat
              </h3>
              <p class="text-neutral-600 mb-6">
                Gérez vos rendez-vous, dossiers clients et communications professionnelles efficacement.
              </p>
              <div class="flex items-center justify-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform">
                Accéder à l'espace Avocat
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </NuxtLink>

            <NuxtLink to="/home/clients" class="card p-8 hover:scale-105 transition-transform duration-300 group">
              <div class="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-200 transition-colors">
                <svg class="w-10 h-10 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 class="text-2xl font-heading font-bold text-neutral-900 mb-3">
                Je suis Client
              </h3>
              <p class="text-neutral-600 mb-6">
                Trouvez votre avocat, suivez vos dossiers et communiquez en toute transparence.
              </p>
              <div class="flex items-center justify-center text-secondary-600 font-semibold group-hover:translate-x-2 transition-transform">
                Accéder à l'espace Client
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section id="fonctionnalites" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-display-sm font-heading text-neutral-900 mb-4">
            Fonctionnalités clés
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Une solution complète pour digitaliser et faciliter la gestion de vos activités juridiques
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Calendrier intelligent</h3>
            <p class="text-neutral-600">Gestion optimisée des rendez-vous avec rappels automatiques</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Gestion de dossiers</h3>
            <p class="text-neutral-600">Suivi complet de vos affaires juridiques en temps réel</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Messagerie sécurisée</h3>
            <p class="text-neutral-600">Communication en temps réel entre toutes les parties</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-neutral-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h3 class="text-2xl font-heading font-bold mb-4">
            <span class="text-primary-400">Lex</span>Manager
          </h3>
          <p class="text-neutral-400 mb-6">
            Votre solution de gestion juridique complète
          </p>
          <p class="text-neutral-500 text-sm">
            © 2026 LexManager. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>

    <RegisterModal v-model="showRegisterModal" />
  </div>
</template>

