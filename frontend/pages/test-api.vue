<script setup lang="ts">
const config = useRuntimeConfig();
const apiUrl = config.public.apiBaseUrl;

const healthResult = ref<any>(null);
const registerResult = ref<any>(null);

const testHealth = async () => {
  try {
    console.log('Testing health endpoint...');
    const response = await $fetch('http://localhost:3000/health');
    healthResult.value = response;
    console.log('Health response:', response);
  } catch (error) {
    console.error('Health error:', error);
    healthResult.value = { error: String(error) };
  }
};

const testRegister = async () => {
  try {
    console.log('Testing register endpoint...');
    const testData = {
      email: `test${Date.now()}@test.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
      role: 'client'
    };

    const response = await $fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      body: testData
    });

    registerResult.value = response;
    console.log('Register response:', response);
  } catch (error: any) {
    console.error('Register error:', error);
    registerResult.value = {
      error: error.message,
      data: error.data,
      status: error.status || error.statusCode
    };
  }
};
</script>




<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">API Test</h1>

    <div class="space-y-4">
      <div>
        <h2 class="font-bold">API URL:</h2>
        <p>{{ apiUrl }}</p>
      </div>

      <button
        @click="testHealth"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Health Endpoint
      </button>

      <div v-if="healthResult" class="p-4 bg-gray-100 rounded">
        <h3 class="font-bold">Health Result:</h3>
        <pre>{{ JSON.stringify(healthResult, null, 2) }}</pre>
      </div>

      <button
        @click="testRegister"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Test Register Endpoint
      </button>

      <div v-if="registerResult" class="p-4 bg-gray-100 rounded">
        <h3 class="font-bold">Register Result:</h3>
        <pre>{{ JSON.stringify(registerResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

