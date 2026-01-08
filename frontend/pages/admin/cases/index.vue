<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin',
});
</script>



<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow-xl rounded-lg p-8 text-center">
        <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
          <svg class="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Accès Restreint
        </h2>

        <div class="space-y-4 text-gray-600">
          <p class="text-lg">
            Les dossiers juridiques sont <strong class="text-gray-900">strictement confidentiels</strong> et ne sont accessibles qu'aux parties concernées.
          </p>

          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  <strong>Confidentialité professionnelle :</strong> Les dossiers ne peuvent être consultés que par le client et l'avocat assigné.
                </p>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 rounded-lg p-4 mt-6">
            <p class="text-sm text-blue-800">
              <strong>Accès autorisé pour :</strong>
            </p>
            <ul class="mt-2 text-sm text-blue-700 space-y-1">
              <li class="flex items-center gap-2">
                <CheckCircleIcon class="h-4 w-4 text-green-600" />
                Le client propriétaire du dossier
              </li>
              <li class="flex items-center gap-2">
                <CheckCircleIcon class="h-4 w-4 text-green-600" />
                L'avocat assigné au dossier
              </li>
              <li class="flex items-center gap-2">
                <XCircleIcon class="h-4 w-4 text-red-600" />
                Les administrateurs (accès restreint)
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8">
          <NuxtLink
            to="/admin/stats"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>


