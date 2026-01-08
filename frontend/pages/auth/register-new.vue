
<script setup lang="ts">
import AddressAutocomplete from '~/components/common/AddressAutocomplete.vue'

definePageMeta({
  middleware: 'guest',
  layout: false,
});

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'client' as 'admin' | 'avocat' | 'client' | 'collaborateur',
  lawyerData: {
    barNumber: '',
    specialties: [] as string[],
    officeAddress: '',
    officeCity: '',
    officeLatitude: null as number | null,
    officeLongitude: null as number | null,
    yearsOfExperience: undefined as number | undefined,
    bio: '',
  },
  clientData: {
    address: '',
    city: '',
    postalCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
  },
});

const lawyerLocationData = ref<{
  address: string
  latitude: number | null
  longitude: number | null
  formattedAddress?: string
}>({
  address: '',
  latitude: null,
  longitude: null
});

const clientLocationData = ref<{
  address: string
  latitude: number | null
  longitude: number | null
  formattedAddress?: string
}>({
  address: '',
  latitude: null,
  longitude: null
});

const specialtiesInput = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const validationErrors = ref<string[]>([]);
const showPassword = ref(false);
const acceptTerms = ref(false);

watch(lawyerLocationData, (newValue) => {
  if (newValue.address) {
    form.value.lawyerData.officeAddress = newValue.address
    form.value.lawyerData.officeLatitude = newValue.latitude
    form.value.lawyerData.officeLongitude = newValue.longitude

    if (newValue.formattedAddress) {
      const parts = newValue.formattedAddress.split(',')
      if (parts.length > 1) {
        form.value.lawyerData.officeCity = parts[parts.length - 3]?.trim() || parts[1]?.trim() || ''
      }
    }
  }
}, { deep: true });

watch(clientLocationData, (newValue) => {
  if (newValue.address) {
    form.value.clientData.address = newValue.address
    form.value.clientData.latitude = newValue.latitude
    form.value.clientData.longitude = newValue.longitude

    if (newValue.formattedAddress) {
      const parts = newValue.formattedAddress.split(',')
      if (parts.length > 1) {
        const postalMatch = newValue.formattedAddress.match(/\b\d{5}\b/)
        if (postalMatch) {
          form.value.clientData.postalCode = postalMatch[0]
        }
        form.value.clientData.city = parts[parts.length - 3]?.trim() || parts[1]?.trim() || ''
      }
    }
  }
}, { deep: true });

watch(specialtiesInput, (value) => {
  if (value) {
    form.value.lawyerData.specialties = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } else {
    form.value.lawyerData.specialties = [];
  }
});

const passwordStrength = computed(() => {
  const password = form.value.password;
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 12.5;
  if (/[^a-zA-Z\d]/.test(password)) strength += 12.5;

  return Math.min(strength, 100);
});

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 25) return 'Très faible';
  if (passwordStrength.value < 50) return 'Faible';
  if (passwordStrength.value < 75) return 'Moyen';
  if (passwordStrength.value < 100) return 'Fort';
  return 'Très fort';
});

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 25) return 'bg-accent-500 text-accent-600';
  if (passwordStrength.value < 50) return 'bg-amber-500 text-amber-600';
  if (passwordStrength.value < 75) return 'bg-primary-500 text-primary-600';
  return 'bg-success-500 text-success-600';
});

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  validationErrors.value = [];

  if (form.value.password !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas';
    isLoading.value = false;
    return;
  }

  if (form.value.role === 'avocat') {
    if (!form.value.lawyerData.barNumber) {
      errorMessage.value = 'Le numéro du barreau est requis pour les avocats';
      isLoading.value = false;
      return;
    }
  }

  try {
    const registrationData: any = {
      email: form.value.email,
      password: form.value.password,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      phone: form.value.phone,
      role: form.value.role,
    };

    if (form.value.role === 'avocat') {
      registrationData.lawyerData = {
        barNumber: form.value.lawyerData.barNumber,
        specialties: form.value.lawyerData.specialties,
        officeAddress: form.value.lawyerData.officeAddress || undefined,
        officeCity: form.value.lawyerData.officeCity || undefined,
        yearsOfExperience: form.value.lawyerData.yearsOfExperience || undefined,
        bio: form.value.lawyerData.bio || undefined,
      };
    }

    if (form.value.role === 'client') {
      registrationData.clientData = {
        address: form.value.clientData.address || undefined,
        city: form.value.clientData.city || undefined,
        postalCode: form.value.clientData.postalCode || undefined,
      };
    }

    const result = await authStore.register(registrationData);

    if (result.success) {
      await router.push('/dashboard');
    } else {
      errorMessage.value = result.message || 'Échec de l\'inscription';
      if (result.errors) {
        validationErrors.value = result.errors.map((err: any) => err.message);
      }
    }
  } catch (error: any) {
    console.error('Register exception:', error);
    errorMessage.value = 'Une erreur est survenue lors de l\'inscription';
  } finally {
    isLoading.value = false;
  }
};
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
    <!-- Navigation Header -->
    <nav class="bg-white/80 backdrop-blur-md shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="flex items-center">
            <h1 class="text-2xl font-heading font-bold">
              <span class="text-primary-600">Lex</span><span class="text-neutral-800">Manager</span>
            </h1>
          </NuxtLink>
          <NuxtLink to="/auth/login" class="text-sm text-neutral-600 hover:text-neutral-900 inline-flex items-center transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Déjà inscrit ? Se connecter
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-heading font-bold text-neutral-900 mb-3">
          Créer votre compte
        </h2>
        <p class="text-lg text-neutral-600">
          Rejoignez LexManager et simplifiez votre gestion juridique
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-6 mb-12">
        <button
          @click="form.role = 'client'"
          :class="[
            'card p-6 text-left transition-all duration-200 cursor-pointer border-2',
            form.role === 'client' 
              ? 'border-secondary-500 bg-secondary-50 shadow-lg' 
              : 'border-transparent hover:border-secondary-200'
          ]"
        >
          <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h3 class="text-lg font-heading font-semibold text-neutral-900 mb-2">Client</h3>
          <p class="text-sm text-neutral-600">Je cherche un avocat pour mes besoins juridiques</p>
          <div v-if="form.role === 'client'" class="mt-4 flex items-center text-secondary-600 text-sm font-semibold">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Sélectionné
          </div>
        </button>

        <button
          @click="form.role = 'avocat'"
          :class="[
            'card p-6 text-left transition-all duration-200 cursor-pointer border-2',
            form.role === 'avocat' 
              ? 'border-primary-500 bg-primary-50 shadow-lg' 
              : 'border-transparent hover:border-primary-200'
          ]"
        >
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-heading font-semibold text-neutral-900 mb-2">Avocat</h3>
          <p class="text-sm text-neutral-600">Je gère mes clients et mes dossiers juridiques</p>
          <div v-if="form.role === 'avocat'" class="mt-4 flex items-center text-primary-600 text-sm font-semibold">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Sélectionné
          </div>
        </button>

        <button
          @click="form.role = 'collaborateur'"
          :class="[
            'card p-6 text-left transition-all duration-200 cursor-pointer border-2',
            form.role === 'collaborateur' 
              ? 'border-success-500 bg-success-50 shadow-lg' 
              : 'border-transparent hover:border-success-200'
          ]"
        >
          <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-heading font-semibold text-neutral-900 mb-2">Collaborateur</h3>
          <p class="text-sm text-neutral-600">Je travaille avec un cabinet d'avocats</p>
          <div v-if="form.role === 'collaborateur'" class="mt-4 flex items-center text-success-600 text-sm font-semibold">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Sélectionné
          </div>
        </button>
      </div>

      <form @submit.prevent="handleRegister" class="max-w-3xl mx-auto">
        <div v-if="errorMessage" class="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="w-5 h-5 text-accent-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-accent-800">{{ errorMessage }}</p>
              <ul v-if="validationErrors.length" class="mt-2 text-sm text-accent-700 space-y-1">
                <li v-for="error in validationErrors" :key="error" class="flex items-start">
                  <span class="mr-2">•</span>
                  <span>{{ error }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card p-8 space-y-6">
          <div>
            <h3 class="text-lg font-heading font-semibold text-neutral-900 mb-4 flex items-center">
              <span class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 text-primary-600 font-bold text-sm">1</span>
              Informations personnelles
            </h3>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-neutral-700 mb-2">
                  Prénom <span class="text-accent-500">*</span>
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Jean"
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-neutral-700 mb-2">
                  Nom <span class="text-accent-500">*</span>
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="input-field"
                  placeholder="Dupont"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-neutral-700 mb-2">
                  Email <span class="text-accent-500">*</span>
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="input-field"
                  placeholder="exemple@email.com"
                />
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-neutral-700 mb-2">
                  Téléphone
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="input-field"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>
          </div>

          <div v-if="form.role === 'avocat'" class="pt-6 border-t border-neutral-200">
            <h3 class="text-lg font-heading font-semibold text-neutral-900 mb-4 flex items-center">
              <span class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 text-primary-600 font-bold text-sm">2</span>
              Informations professionnelles
            </h3>

            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="barNumber" class="block text-sm font-medium text-neutral-700 mb-2">
                  Numéro du Barreau <span class="text-accent-500">*</span>
                </label>
                <input
                  id="barNumber"
                  v-model="form.lawyerData.barNumber"
                  type="text"
                  :required="form.role === 'avocat'"
                  class="input-field"
                  placeholder="ex: 75001234"
                />
              </div>

              <div>
                <label for="yearsOfExperience" class="block text-sm font-medium text-neutral-700 mb-2">
                  Années d'expérience
                </label>
                <input
                  id="yearsOfExperience"
                  v-model.number="form.lawyerData.yearsOfExperience"
                  type="number"
                  min="0"
                  max="60"
                  class="input-field"
                  placeholder="5"
                />
              </div>

              <div class="md:col-span-2">
                <label for="specialties" class="block text-sm font-medium text-neutral-700 mb-2">
                  Spécialités
                </label>
                <input
                  id="specialties"
                  v-model="specialtiesInput"
                  type="text"
                  class="input-field"
                  placeholder="Droit civil, Droit pénal, Droit des affaires"
                />
                <p class="mt-1 text-xs text-neutral-500">Séparez les spécialités par des virgules</p>
              </div>

              <div class="md:col-span-2">
                <AddressAutocomplete
                  v-model="lawyerLocationData"
                  label="Adresse du cabinet"
                  placeholder="Entrez l'adresse de votre cabinet..."
                  :show-current-location-button="true"
                />
              </div>

              <div class="md:col-span-2">
                <label for="bio" class="block text-sm font-medium text-neutral-700 mb-2">
                  Présentation
                </label>
                <textarea
                  id="bio"
                  v-model="form.lawyerData.bio"
                  rows="4"
                  class="input-field resize-none"
                  placeholder="Présentez brièvement votre parcours et vos domaines d'expertise..."
                />
              </div>
            </div>
          </div>

          <div v-if="form.role === 'client'" class="pt-6 border-t border-neutral-200">
            <h3 class="text-lg font-heading font-semibold text-neutral-900 mb-4 flex items-center">
              <span class="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center mr-3 text-secondary-600 font-bold text-sm">2</span>
              Informations complémentaires
            </h3>

            <div class="grid md:grid-cols-1 gap-6">
              <AddressAutocomplete
                v-model="clientLocationData"
                label="Adresse"
                placeholder="Entrez votre adresse..."
                :show-current-location-button="true"
              />
            </div>
          </div>

          <div class="pt-6 border-t border-neutral-200">
            <h3 class="text-lg font-heading font-semibold text-neutral-900 mb-4 flex items-center">
              <span class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 text-primary-600 font-bold text-sm">
                {{ form.role === 'collaborateur' ? '2' : '3' }}
              </span>
              Sécurité
            </h3>

            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="password" class="block text-sm font-medium text-neutral-700 mb-2">
                  Mot de passe <span class="text-accent-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="input-field pr-10"
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
                <p class="mt-1 text-xs text-neutral-500">
                  Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
                </p>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-neutral-700 mb-2">
                  Confirmer le mot de passe <span class="text-accent-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="confirmPassword"
                    v-model="confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="input-field pr-10"
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
            </div>

            <div v-if="form.password" class="mt-4">
              <div class="flex items-center justify-between text-xs text-neutral-600 mb-1">
                <span>Force du mot de passe</span>
                <span :class="passwordStrengthColor">{{ passwordStrengthText }}</span>
              </div>
              <div class="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div :class="[passwordStrengthColor, 'h-full transition-all duration-300']" :style="{ width: passwordStrength + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-neutral-200">
            <label class="flex items-start cursor-pointer">
              <input
                v-model="acceptTerms"
                type="checkbox"
                required
                class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded cursor-pointer"
              />
              <span class="ml-3 text-sm text-neutral-700">
                J'accepte les 
                <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">conditions d'utilisation</a> 
                et la 
                <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">politique de confidentialité</a>
              </span>
            </label>
          </div>

          <div class="pt-6">
            <button
              type="submit"
              :disabled="isLoading || !acceptTerms"
              class="btn-primary w-full relative"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </span>
              <span v-else>Créer mon compte</span>
            </button>
          </div>
        </div>
      </form>

      <div class="text-center mt-8">
        <p class="text-neutral-600">
          Vous avez déjà un compte ?
          <NuxtLink to="/auth/login" class="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Se connecter
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>


<style scoped>
</style>
