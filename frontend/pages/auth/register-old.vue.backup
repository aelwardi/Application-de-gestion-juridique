<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Application de Gestion Juridique
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ errorMessage }}
              </h3>
              <div v-if="validationErrors.length" class="mt-2 text-sm text-red-700">
                <ul class="list-disc list-inside space-y-1">
                  <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Jean"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Dupont"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="exemple@email.com"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Téléphone (optionnel)
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">
              Type de compte
            </label>
            <select
              id="role"
              v-model="form.role"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="client">Client</option>
              <option value="avocat">Avocat</option>
              <option value="collaborateur">Collaborateur</option>
            </select>
          </div>

          <!-- Champs spécifiques pour les avocats -->
          <div v-if="form.role === 'avocat'" class="space-y-4 p-4 bg-blue-50 rounded-md border border-blue-200">
            <h3 class="text-sm font-semibold text-blue-900">Informations professionnelles</h3>
            
            <div>
              <label for="barNumber" class="block text-sm font-medium text-gray-700">
                Numéro du Barreau <span class="text-red-500">*</span>
              </label>
              <input
                id="barNumber"
                v-model="form.lawyerData.barNumber"
                type="text"
                :required="form.role === 'avocat'"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ex: 75001234"
              />
            </div>

            <div>
              <label for="specialties" class="block text-sm font-medium text-gray-700">
                Spécialités
              </label>
              <input
                id="specialties"
                v-model="specialtiesInput"
                type="text"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ex: Droit civil, Droit pénal (séparez par des virgules)"
              />
              <p class="mt-1 text-xs text-gray-500">Séparez les spécialités par des virgules</p>
            </div>

            <div>
              <label for="officeAddress" class="block text-sm font-medium text-gray-700">
                Adresse du cabinet
              </label>
              <input
                id="officeAddress"
                v-model="form.lawyerData.officeAddress"
                type="text"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ex: 123 Rue de la Loi, 75001 Paris"
              />
            </div>

            <div>
              <label for="officeCity" class="block text-sm font-medium text-gray-700">
                Ville
              </label>
              <input
                id="officeCity"
                v-model="form.lawyerData.officeCity"
                type="text"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ex: Paris"
              />
            </div>

            <div>
              <label for="yearsOfExperience" class="block text-sm font-medium text-gray-700">
                Années d'expérience
              </label>
              <input
                id="yearsOfExperience"
                v-model.number="form.lawyerData.yearsOfExperience"
                type="number"
                min="0"
                max="60"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ex: 5"
              />
            </div>

            <div>
              <label for="bio" class="block text-sm font-medium text-gray-700">
                Présentation
              </label>
              <textarea
                id="bio"
                v-model="form.lawyerData.bio"
                rows="3"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Présentez brièvement votre parcours et vos domaines d'expertise..."
              />
            </div>
          </div>

          <!-- Champs spécifiques pour les clients -->
          <div v-if="form.role === 'client'" class="space-y-4 p-4 bg-green-50 rounded-md border border-green-200">
            <h3 class="text-sm font-semibold text-green-900">Informations complémentaires</h3>
            
            <div>
              <label for="clientAddress" class="block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <input
                id="clientAddress"
                v-model="form.clientData.address"
                type="text"
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ex: 10 Rue de la Paix"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="clientCity" class="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  id="clientCity"
                  v-model="form.clientData.city"
                  type="text"
                  class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ex: Paris"
                />
              </div>
              <div>
                <label for="postalCode" class="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <input
                  id="postalCode"
                  v-model="form.clientData.postalCode"
                  type="text"
                  class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="ex: 75001"
                />
              </div>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
            <p class="mt-1 text-xs text-gray-500">
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            @click="() => console.log('Button clicked!')"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Inscription en cours...</span>
            <span v-else>S'inscrire</span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Vous avez déjà un compte ?
            <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
              Se connecter
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

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
  firstName: '',
  lastName: '',
  phone: '',
  role: 'client' as 'admin' | 'avocat' | 'client' | 'collaborateur',
  lawyerData: {
    barNumber: '',
    specialties: [] as string[],
    officeAddress: '',
    officeCity: '',
    yearsOfExperience: undefined as number | undefined,
    bio: '',
  },
  clientData: {
    address: '',
    city: '',
    postalCode: '',
  },
});

const specialtiesInput = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const validationErrors = ref<string[]>([]);

// Watch specialties input to update the array
watch(specialtiesInput, (value) => {
  if (value) {
    form.value.lawyerData.specialties = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } else {
    form.value.lawyerData.specialties = [];
  }
});

const handleRegister = async () => {
  console.log('Starting registration...');
  console.log('Form data:', form.value);

  isLoading.value = true;
  errorMessage.value = '';
  validationErrors.value = [];

  if (form.value.password !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas';
    isLoading.value = false;
    console.error('Passwords do not match');
    return;
  }

  // Validate lawyer required fields
  if (form.value.role === 'avocat') {
    if (!form.value.lawyerData.barNumber) {
      errorMessage.value = 'Le numéro du barreau est requis pour les avocats';
      isLoading.value = false;
      return;
    }
  }

  try {
    console.log('Calling authStore.register...');
    
    // Prepare data to send - only include relevant fields based on role
    const registrationData: any = {
      email: form.value.email,
      password: form.value.password,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      phone: form.value.phone,
      role: form.value.role,
    };

    // Add lawyerData only if role is avocat
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

    // Add clientData only if role is client
    if (form.value.role === 'client') {
      registrationData.clientData = {
        address: form.value.clientData.address || undefined,
        city: form.value.clientData.city || undefined,
        postalCode: form.value.clientData.postalCode || undefined,
      };
    }

    console.log('Registration data to send:', JSON.stringify(registrationData, null, 2));
    
    const result = await authStore.register(registrationData);
    console.log('Register result:', result);

    if (result.success) {
      console.log('Registration successful, redirecting to dashboard...');
      await router.push('/dashboard');
    } else {
      console.error('Registration failed:', result.message);
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
    console.log('Registration process completed');
  }
};
</script>

<style scoped>
</style>

