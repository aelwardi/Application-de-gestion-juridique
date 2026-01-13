<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
  layout: false,
});

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  email: '',
  password: '',
});

const isLoading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const showRegisterModal = ref(false);

watch(showRegisterModal, (newVal) => {
  console.log('Register modal state:', newVal);
});

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const result = await authStore.login(form.value);

    if (result.success) {
      if ((result as any).requiresTwoFactor) {
        return;
      }

      const user = authStore.user;
      if (user?.role === 'admin') {
        await router.push('/admin/stats');
      } else if (user?.role === 'avocat') {
        await router.push('/dashboard');
      } else {
        await router.push('/dashboard');
      }
    } else {
      errorMessage.value = result.message || 'Échec de la connexion';
    }
  } catch (error: any) {
    console.error('Login error:', error);
    errorMessage.value = 'Une erreur est survenue lors de la connexion';
  } finally {
    isLoading.value = false;
  }
};
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-600 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <NuxtLink to="/" class="mb-12">
          <h1 class="text-4xl font-heading font-bold mb-2">
            <span class="text-white">Lex</span><span class="text-primary-200">Manager</span>
          </h1>
        </NuxtLink>
        
        <h2 class="text-4xl font-heading font-bold mb-6 leading-tight">
          Bienvenue sur votre<br />plateforme juridique
        </h2>
        <p class="text-xl text-primary-100 mb-12 leading-relaxed">
          Gérez vos rendez-vous, dossiers et communications en toute simplicité.
        </p>
        
        <div class="space-y-4">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-1">Sécurité maximale</h3>
              <p class="text-primary-100">Vos données sont protégées avec les meilleurs standards</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-1">Rapide et efficace</h3>
              <p class="text-primary-100">Accédez à vos informations en quelques clics</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div class="max-w-md w-full">
        <div class="lg:hidden text-center mb-8">
          <NuxtLink to="/">
            <h1 class="text-3xl font-heading font-bold">
              <span class="text-primary-600">Lex</span><span class="text-neutral-800">Manager</span>
            </h1>
          </NuxtLink>
        </div>

        <div class="text-center mb-8">
          <h2 class="text-3xl font-heading font-bold text-neutral-900 mb-2">
            Connexion
          </h2>
          <p class="text-neutral-600">
            Accédez à votre espace personnel
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="errorMessage" class="bg-accent-50 border border-accent-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-accent-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-accent-800">{{ errorMessage }}</p>
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-neutral-700 mb-2">
              Adresse email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="input-field pl-10"
                placeholder="exemple@email.com"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-neutral-700 mb-2">
              Mot de passe
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="!showPassword" class="h-5 w-5 text-neutral-400 hover:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="h-5 w-5 text-neutral-400 hover:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded cursor-pointer"
              />
              <label for="remember-me" class="ml-2 block text-sm text-neutral-700 cursor-pointer">
                Se souvenir de moi
              </label>
            </div>

            <NuxtLink to="/auth/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Mot de passe oublié ?
            </NuxtLink>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full relative"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </span>
            <span v-else>Se connecter</span>
          </button>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-neutral-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-neutral-500">Nouveau sur LexManager ?</span>
            </div>
          </div>

          <div class="text-center">
            <button type="button" @click="showRegisterModal = true" class="btn-secondary w-full">
              Créer un compte
            </button>
          </div>

          <div class="text-center pt-4">
            <NuxtLink to="/" class="text-sm text-neutral-600 hover:text-neutral-900 inline-flex items-center transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Retour à l'accueil
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>

    <AuthRegisterModal v-model="showRegisterModal" />
  </div>
</template>


<style scoped>
</style>