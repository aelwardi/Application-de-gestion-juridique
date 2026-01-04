<template>
  <div class="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-secondary-100">
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center">
            <h1 class="text-2xl font-heading font-bold text-primary-700">
              <span class="text-primary-600">Lex</span><span class="text-neutral-800">Manager</span>
            </h1>
            <span class="ml-3 px-3 py-1 bg-secondary-100 text-secondary-700 text-sm font-semibold rounded-full">
              Espace Client
            </span>
          </NuxtLink>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#recherche" class="text-neutral-600 hover:text-secondary-600 font-medium transition-colors">
              Trouver un avocat
            </a>
            <a href="#fonctionnalites" class="text-neutral-600 hover:text-secondary-600 font-medium transition-colors">
              Fonctionnalités
            </a>
            <a href="#temoignages" class="text-neutral-600 hover:text-secondary-600 font-medium transition-colors">
              Témoignages
            </a>
          </div>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/auth/login" class="btn-outline">
              Connexion
            </NuxtLink>
            <button @click="showRegisterModal = true" class="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
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
            <div class="inline-block px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold mb-6">
              👥 Pour les Particuliers et Entreprises
            </div>
            <h1 class="text-display-md font-heading text-neutral-900 mb-6 leading-tight">
              Trouvez l'avocat parfait
              <span class="block text-secondary-600 mt-2">pour vos besoins juridiques</span>
            </h1>
            <p class="text-xl text-neutral-600 mb-8 leading-relaxed">
              Recherchez, comparez et contactez les meilleurs avocats près de chez vous.
              Suivez vos dossiers en temps réel et communiquez facilement.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button @click="showRegisterModal = true" class="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-center">
                Trouver mon avocat
              </button>
              <button class="bg-white hover:bg-neutral-50 text-secondary-700 border-2 border-secondary-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200">
                Comment ça marche ?
              </button>
            </div>
            <div class="mt-8 flex items-center gap-6 text-sm text-neutral-600">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Gratuit pour les clients
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-success-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Avocats vérifiés
              </div>
            </div>
          </div>
          
          <div class="relative">
            <div class="card p-8 bg-white">
              <h3 class="font-heading font-semibold text-lg text-neutral-900 mb-6 flex items-center">
                <svg class="w-6 h-6 text-secondary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Recherche rapide
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">Spécialité</label>
                  <select class="input-field">
                    <option>Droit de la famille</option>
                    <option>Droit des affaires</option>
                    <option>Droit pénal</option>
                    <option>Droit immobilier</option>
                    <option>Droit du travail</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-2">Localisation</label>
                  <input type="text" placeholder="Ville ou code postal" class="input-field" />
                </div>
                <button class="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                  Rechercher
                </button>
              </div>
              <div class="mt-6 pt-6 border-t border-neutral-200">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-600">Avocats disponibles</span>
                  <span class="font-bold text-secondary-600">1,247+</span>
                </div>
              </div>
            </div>
            <!-- Decorative elements -->
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-secondary-200 rounded-full opacity-20 blur-2xl"></div>
            <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-200 rounded-full opacity-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Comment ça marche -->
    <section id="recherche" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-display-sm font-heading text-neutral-900 mb-4">
            Comment ça marche ?
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            En 3 étapes simples, trouvez et travaillez avec votre avocat
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center relative">
            <div class="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
              <span class="text-3xl font-bold text-secondary-600">1</span>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-3">Recherchez</h3>
            <p class="text-neutral-600">
              Utilisez nos filtres avancés pour trouver l'avocat qui correspond à vos besoins : spécialité, localisation, avis...
            </p>
            <div class="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-secondary-200 to-transparent -z-0"></div>
          </div>

          <div class="text-center relative">
            <div class="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
              <span class="text-3xl font-bold text-secondary-600">2</span>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-3">Contactez</h3>
            <p class="text-neutral-600">
              Prenez rendez-vous en ligne, présentez votre situation et commencez à travailler avec votre avocat.
            </p>
            <div class="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-secondary-200 to-transparent -z-0"></div>
          </div>

          <div class="text-center">
            <div class="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-3xl font-bold text-secondary-600">3</span>
            </div>
            <h3 class="text-xl font-heading font-semibold text-neutral-900 mb-3">Suivez</h3>
            <p class="text-neutral-600">
              Consultez l'avancement de votre dossier en temps réel et communiquez facilement avec votre avocat.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Fonctionnalités Section -->
    <section id="fonctionnalites" class="py-20 bg-gradient-to-br from-neutral-50 to-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-display-sm font-heading text-neutral-900 mb-4">
            Vos avantages en tant que client
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Une plateforme pensée pour simplifier votre expérience juridique
          </p>
        </div>

        <div class="space-y-16">
          <!-- Feature 1 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-block px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-semibold mb-4">
                🔍 Recherche avancée
              </div>
              <h3 class="text-3xl font-heading font-bold text-neutral-900 mb-4">
                Trouvez le bon avocat facilement
              </h3>
              <p class="text-lg text-neutral-600 mb-6">
                Recherchez par spécialité, localisation, note ou disponibilité. Consultez les profils détaillés
                et les avis d'autres clients pour faire le meilleur choix.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Carte interactive pour visualiser les avocats près de vous</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Filtres par spécialité, tarif et disponibilité</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Profils détaillés avec formations et expériences</span>
                </li>
              </ul>
            </div>
            <div class="card p-6 bg-white">
              <img src="https://via.placeholder.com/600x400/f3e8ff/9333ea?text=Recherche+Avocat" alt="Recherche" class="rounded-lg w-full" />
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="order-2 lg:order-1 card p-6 bg-white">
              <img src="https://via.placeholder.com/600x400/f0f5ff/3344d8?text=Suivi+Dossier" alt="Suivi" class="rounded-lg w-full" />
            </div>
            <div class="order-1 lg:order-2">
              <div class="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
                📊 Suivi transparent
              </div>
              <h3 class="text-3xl font-heading font-bold text-neutral-900 mb-4">
                Suivez votre dossier en temps réel
              </h3>
              <p class="text-lg text-neutral-600 mb-6">
                Consultez l'avancement de votre dossier à tout moment. Recevez des notifications automatiques
                à chaque étape importante.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Timeline de suivi de votre affaire</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Notifications email et in-app automatiques</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Accès à tous vos documents juridiques</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="inline-block px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-semibold mb-4">
                💬 Communication
              </div>
              <h3 class="text-3xl font-heading font-bold text-neutral-900 mb-4">
                Communiquez facilement avec votre avocat
              </h3>
              <p class="text-lg text-neutral-600 mb-6">
                Messagerie sécurisée intégrée pour échanger directement avec votre avocat. Posez vos questions
                et partagez des documents en toute simplicité.
              </p>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Chat en temps réel avec votre avocat</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Partage de documents sécurisé</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-success-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-neutral-700">Prise de rendez-vous en ligne</span>
                </li>
              </ul>
            </div>
            <div class="card p-6 bg-white">
              <img src="https://via.placeholder.com/600x400/f0fdf4/16a34a?text=Messagerie+Securisee" alt="Messagerie" class="rounded-lg w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Témoignages Section -->
    <section id="temoignages" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-display-sm font-heading text-neutral-900 mb-4">
            Ce que disent nos clients
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Des milliers de clients satisfaits nous font confiance
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="card p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-lg font-bold text-secondary-600">MG</span>
              </div>
              <div>
                <h4 class="font-semibold text-neutral-900">Marie Gallet</h4>
                <div class="flex items-center text-yellow-400">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                </div>
              </div>
            </div>
            <p class="text-neutral-600 italic">
              "Plateforme excellente ! J'ai trouvé un avocat spécialisé en droit de la famille rapidement. Le suivi de mon dossier est transparent et la communication facile."
            </p>
          </div>

          <div class="card p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-lg font-bold text-secondary-600">PL</span>
              </div>
              <div>
                <h4 class="font-semibold text-neutral-900">Pierre Lefort</h4>
                <div class="flex items-center text-yellow-400">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                </div>
              </div>
            </div>
            <p class="text-neutral-600 italic">
              "Interface intuitive et fonctionnalités pratiques. La prise de rendez-vous en ligne m'a fait gagner beaucoup de temps. Je recommande vivement !"
            </p>
          </div>

          <div class="card p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-lg font-bold text-secondary-600">SD</span>
              </div>
              <div>
                <h4 class="font-semibold text-neutral-900">Sophie Dubois</h4>
                <div class="flex items-center text-yellow-400">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                </div>
              </div>
            </div>
            <p class="text-neutral-600 italic">
              "Très satisfaite du service. Mon avocat répond rapidement à mes messages et je peux consulter mes documents à tout moment. Parfait pour suivre son dossier."
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-secondary-600 to-primary-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-display-sm font-heading text-white mb-6">
          Prêt à trouver votre avocat ?
        </h2>
        <p class="text-xl text-secondary-100 mb-8">
          Inscrivez-vous gratuitement et accédez à notre réseau d'avocats qualifiés
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="showRegisterModal = true" class="bg-white text-secondary-700 hover:bg-secondary-50 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
            Créer mon compte client
          </button>
          <button class="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-8 rounded-lg transition-all duration-200">
            Voir les avocats disponibles
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
              Connectez-vous avec les meilleurs avocats
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Pour les clients</h4>
            <ul class="space-y-2 text-sm text-neutral-400">
              <li><a href="#" class="hover:text-white transition-colors">Trouver un avocat</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Comment ça marche</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Témoignages</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Ressources</h4>
            <ul class="space-y-2 text-sm text-neutral-400">
              <li><a href="#" class="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Guide</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Légal</h4>
            <ul class="space-y-2 text-sm text-neutral-400">
              <li><a href="#" class="hover:text-white transition-colors">Mentions légales</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Confidentialité</a></li>
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
    <RegisterModal v-model="showRegisterModal" user-type="client" />
  </div>
</template>

<script setup lang="ts">
import RegisterModal from '~/components/auth/RegisterModal.vue';

definePageMeta({
  layout: false,
});

const showRegisterModal = ref(false);
</script>
