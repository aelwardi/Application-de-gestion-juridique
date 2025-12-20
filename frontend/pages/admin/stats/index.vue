<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Statistiques</h1>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Total Utilisateurs</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">0</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Avocats</div>
          <div class="mt-2 text-3xl font-bold text-blue-600">0</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Clients</div>
          <div class="mt-2 text-3xl font-bold text-green-600">0</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Dossiers</div>
          <div class="mt-2 text-3xl font-bold text-purple-600">0</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Vue d'ensemble</h2>
        <p class="text-gray-600">Tableau de bord administrateur - En cours de développement</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'authenticated',
});
</script>

