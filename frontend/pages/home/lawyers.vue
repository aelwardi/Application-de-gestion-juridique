<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center">
            <h1 class="text-2xl font-heading font-bold text-primary-700">
              <span class="text-primary-600">Lex</span><span class="text-neutral-800">Manager</span>
            </h1>
            <span class="ml-3 px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
              Espace Avocat
            </span>
          </NuxtLink>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#avantages" class="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              Avantages
            </a>
            <a href="#fonctionnalites" class="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              Fonctionnalités
            </a>
            <a href="#tarifs" class="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              Tarifs
            </a>
          </div>

          <!-- Auth Buttons -->
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

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6">
              🎓 Pour les Professionnels du Droit
            </div>
            <h1 class="text-display-md font-heading text-neutral-900 mb-6 leading-tight">
              Optimisez votre pratique juridique
              <span class="block text-primary-600 mt-2">avec des outils modernes</span>
            </h1>
            <p class="text-xl text-neutral-600 mb-8 leading-relaxed">
              Gérez vos rendez-vous, dossiers et communications clients de manière efficace.
              Gagnez du temps et concentrez-vous sur ce qui compte vraiment.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button @click="showRegisterModal = true" class="btn-primary text-center">
                Commencer gratuitement
              </button>
              <button class="btn-secondary">
                Demander une démo
              </button>
            </div>
            <div class="mt-8 flex items-center gap-6 text-sm text-neutral-600">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Sans engagement
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Données sécurisées
              </div>
            </div>
          </div>
          
          <div class="relative">
            <div class="card p-8 bg-white">
              <div class="space-y-6">
                <div class="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <h3 class="font-heading font-semibold text-lg text-neutral-900">Tableau de bord</h3>
                  <span class="text-xs text-neutral-500">Aujourd'hui</span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-primary-50 rounded-lg p-4">
                    <div class="text-3xl font-bold text-primary-600 mb-1">12</div>
                    <div class="text-sm text-neutral-600">Rendez-vous</div>
                  </div>
                  <div class="bg-secondary-50 rounded-lg p-4">
                    <div class="text-3xl font-bold text-secondary-600 mb-1">38</div>
                    <div class="text-sm text-neutral-600">Dossiers actifs</div>
                  </div>
                  <div class="bg-success-50 rounded-lg p-4">
                    <div class="text-3xl font-bold text-success-600 mb-1">5</div>
                    <div class="text-sm text-neutral-600">Nouveaux messages</div>
                  </div>
                  <div class="bg-accent-50 rounded-lg p-4">
                    <div class="text-3xl font-bold text-accent-600 mb-1">3</div>
                    <div class="text-sm text-neutral-600">Actions requises</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Decorative elements -->
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full opacity-20 blur-2xl"></div>
            <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary-200 rounded-full opacity-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Avantages Section -->
    <section id="avantages" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-display-sm font-heading text-neutral-900 mb-4">
            Pourquoi choisir LexManager ?
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Des fonctionnalités pensées pour les avocats modernes
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card p-6 hover:shadow-strong transition-all duration-300">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Gain de temps</h3>
            <p class="text-neutral-600">
              Automatisez la gestion de vos rendez-vous avec des rappels intelligents et une synchronisation calendrier.
            </p>
          </div>

          <div class="card p-6 hover:shadow-strong transition-all duration-300">
            <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Suivi performant</h3>
            <p class="text-neutral-600">
              Tableaux de bord et statistiques détaillées pour piloter votre activité efficacement.
            </p>
          </div>

          <div class="card p-6 hover:shadow-strong transition-all duration-300">
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Sécurité maximale</h3>
            <p class="text-neutral-600">
              Vos données et celles de vos clients sont protégées avec les standards les plus élevés.
            </p>
          </div>

          <div class="card p-6 hover:shadow-strong transition-all duration-300">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Carte interactive</h3>
            <p class="text-neutral-600">
              Visualisez tous vos rendez-vous du jour sur une carte et optimisez vos déplacements.
            </p>
          </div>

          <div class="card p-6 hover:shadow-strong transition-all duration-300">
            <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Communication fluide</h3>
            <p class="text-neutral-600">
              Messagerie intégrée pour échanger facilement avec vos clients et collaborateurs.
            </p>
          </div>

          <div class="card p-6 hover:shadow-strong transition-all duration-300">
            <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-2">Gestion documentaire</h3>
            <p class="text-neutral-600">
              Centralisez tous vos documents juridiques avec un système de gestion performant.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Fonctionnalités Section -->
    <section id="fonctionnalites" class="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-display-sm font-heading text-neutral-900 mb-4">
            Fonctionnalités complètes
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer votre cabinet
          </p>
        </div>

        <div class="space-y-16">
          <!-- Feature 1 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                📅 Calendrier
              </div>
              <h3 class="text-3xl font-heading font-bold text-neutral-900 mb-4">
                Calendrier interactif et intelligent
              </h3>
              <p class="text-lg text-neutral-600 mb-6">
                Gérez tous vos rendez-vous avec une vue jour, semaine ou mois. Recevez des rappels automatiques
                par email et SMS 24h et 2h avant chaque rendez-vous.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Synchronisation avec Google Calendar et Outlook</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Rappels automatiques par email et SMS</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Notes et commentaires pour chaque rendez-vous</span>
                </li>
              </ul>
            </div>
            <div class="card p-6 bg-white">
              <img src="https://via.placeholder.com/600x400/f0f5ff/3344d8?text=Calendrier+Interactif" alt="Calendrier" class="rounded-lg w-full" />
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="order-2 lg:order-1 card p-6 bg-white">
              <img src="https://via.placeholder.com/600x400/f3e8ff/7e22ce?text=Gestion+Dossiers" alt="Dossiers" class="rounded-lg w-full" />
            </div>
            <div class="order-1 lg:order-2">
              <div class="inline-block px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold mb-4">
                📁 Dossiers
              </div>
              <h3 class="text-3xl font-heading font-bold text-neutral-900 mb-4">
                Gestion complète des dossiers
              </h3>
              <p class="text-lg text-neutral-600 mb-6">
                Créez, modifiez et suivez tous vos dossiers juridiques avec des filtres avancés et une recherche
                globale puissante.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Filtres avancés par statut, type, client, priorité</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Timeline de suivi de l'avancement</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Export PDF et partage de documents</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-block px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-semibold mb-4">
                🗺️ Cartographie
              </div>
              <h3 class="text-3xl font-heading font-bold text-neutral-900 mb-4">
                Carte interactive des rendez-vous
              </h3>
              <p class="text-lg text-neutral-600 mb-6">
                Visualisez tous vos rendez-vous du jour sur une carte interactive et optimisez automatiquement
                vos itinéraires.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Vue géographique de tous vos rendez-vous</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Optimisation automatique des itinéraires</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Calcul du temps de trajet</span>
                </li>
              </ul>
            </div>
            <div class="card p-6 bg-white">
              <img src="https://via.placeholder.com/600x400/f0fdf4/16a34a?text=Carte+Interactive" alt="Carte" class="rounded-lg w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-display-sm font-heading text-white mb-6">
          Prêt à moderniser votre pratique ?
        </h2>
        <p class="text-xl text-primary-100 mb-8">
          Rejoignez les centaines d'avocats qui font confiance à LexManager
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="showRegisterModal = true" class="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
            Créer mon compte avocat
          </button>
          <button class="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-8 rounded-lg transition-all duration-200">
            Contacter l'équipe
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-neutral-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-heading font-bold mb-4">
              <span class="text-primary-400">Lex</span>Manager
            </h3>
            <p class="text-neutral-400 text-sm">
              La solution complète pour les avocats modernes
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Produit</h4>
            <ul class="space-y-2 text-sm text-neutral-400">
              <li><a href="#" class="hover:text-white transition-colors">Fonctionnalités</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Tarifs</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Sécurité</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Ressources</h4>
            <ul class="space-y-2 text-sm text-neutral-400">
              <li><a href="#" class="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Guide de démarrage</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Entreprise</h4>
            <ul class="space-y-2 text-sm text-neutral-400">
              <li><a href="#" class="hover:text-white transition-colors">À propos</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" class="hover:text-white transition-colors">CGU</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
          © 2026 LexManager. Tous droits réservés.
        </div>
      </div>
    </footer>

    <!-- Register Modal -->
    <RegisterModal v-model="showRegisterModal" user-type="avocat" />
  </div>
</template>

<script setup lang="ts">
import RegisterModal from '~/components/auth/RegisterModal.vue';

definePageMeta({
  layout: false,
});

const showRegisterModal = ref(false);
</script>
