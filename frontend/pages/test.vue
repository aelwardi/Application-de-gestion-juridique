<script setup lang="ts">
const config = useRuntimeConfig();
const apiUrl = config.public.apiBaseUrl;

console.log('Test page loaded successfully');
console.log('API URL:', apiUrl);
</script>


<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
      <p class="text-gray-600 mb-4">If you see this, Nuxt is working!</p>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="font-bold mb-2">API Config:</h2>
        <p>{{ apiUrl }}</p>

        <div class="mt-4">
          <NuxtLink to="/auth/login" class="text-blue-600 hover:underline">
            Go to Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

