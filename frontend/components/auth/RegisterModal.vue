<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm" @click="closeModal"></div>

        <!-- Modal Container -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              class="relative w-full max-w-2xl bg-white rounded-2xl shadow-strong overflow-hidden"
              @click.stop
            >
              <!-- Close Button -->
              <button
                @click="closeModal"
                class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <!-- Header -->
              <div :class="[
                'px-8 py-6',
                selectedUserType === 'avocat' ? 'bg-gradient-to-r from-primary-600 to-primary-700' : 'bg-gradient-to-r from-secondary-600 to-secondary-700'
              ]">
                <div class="flex items-center">
                  <div :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center mr-4',
                    selectedUserType === 'avocat' ? 'bg-white/20' : 'bg-white/20'
                  ]">
                    <svg v-if="selectedUserType === 'avocat'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-2xl font-heading font-bold text-white">
                      {{ selectedUserType === 'avocat' ? 'Inscription Avocat' : 'Inscription Client' }}
                    </h2>
                    <p class="text-white/80 text-sm mt-1">
                      {{ selectedUserType === 'avocat' ? 'Rejoignez notre réseau de professionnels' : 'Trouvez votre avocat en quelques clics' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Form Content -->
              <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
                <form @submit.prevent="handleRegister" class="space-y-6">
                  <!-- User Type Selection (only if not pre-selected) -->
                  <div v-if="!userType" class="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <label class="block text-sm font-medium text-neutral-700 mb-3">
                      Je m'inscris en tant que <span class="text-accent-500">*</span>
                    </label>
                    <div class="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        @click="selectedUserType = 'client'"
                        :class="[
                          'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                          selectedUserType === 'client'
                            ? 'border-secondary-600 bg-secondary-50'
                            : 'border-neutral-300 bg-white hover:border-secondary-300'
                        ]"
                      >
                        <div class="flex items-center">
                          <div :class="[
                            'w-10 h-10 rounded-full flex items-center justify-center mr-3',
                            selectedUserType === 'client' ? 'bg-secondary-600' : 'bg-neutral-200'
                          ]">
                            <svg class="w-5 h-5" :class="selectedUserType === 'client' ? 'text-white' : 'text-neutral-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                          </div>
                          <div>
                            <div :class="['font-semibold', selectedUserType === 'client' ? 'text-secondary-700' : 'text-neutral-900']">
                              Client
                            </div>
                            <div class="text-xs text-neutral-600">Particulier ou Entreprise</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        @click="selectedUserType = 'avocat'"
                        :class="[
                          'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                          selectedUserType === 'avocat'
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-neutral-300 bg-white hover:border-primary-300'
                        ]"
                      >
                        <div class="flex items-center">
                          <div :class="[
                            'w-10 h-10 rounded-full flex items-center justify-center mr-3',
                            selectedUserType === 'avocat' ? 'bg-primary-600' : 'bg-neutral-200'
                          ]">
                            <svg class="w-5 h-5" :class="selectedUserType === 'avocat' ? 'text-white' : 'text-neutral-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                          </div>
                          <div>
                            <div :class="['font-semibold', selectedUserType === 'avocat' ? 'text-primary-700' : 'text-neutral-900']">
                              Avocat
                            </div>
                            <div class="text-xs text-neutral-600">Professionnel du droit</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <!-- Error Message -->
                  <div v-if="errorMessage" class="bg-accent-50 border border-accent-200 rounded-lg p-4">
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

                  <!-- Personal Information -->
                  <div>
                    <h3 class="text-sm font-semibold text-neutral-900 mb-4 flex items-center">
                      <span :class="[
                        'w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold text-white',
                        selectedUserType === 'avocat' ? 'bg-primary-600' : 'bg-secondary-600'
                      ]">1</span>
                      Informations personnelles
                    </h3>
                    
                    <div class="grid md:grid-cols-2 gap-4">
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

                  <!-- Lawyer Specific Fields -->
                  <div v-if="selectedUserType === 'avocat'" class="pt-4 border-t border-neutral-200">
                    <h3 class="text-sm font-semibold text-neutral-900 mb-4 flex items-center">
                      <span class="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center mr-2 text-xs font-bold text-white">2</span>
                      Informations professionnelles
                    </h3>

                    <div class="space-y-4">
                      <div>
                        <label for="barNumber" class="block text-sm font-medium text-neutral-700 mb-2">
                          Numéro du Barreau <span class="text-accent-500">*</span>
                        </label>
                        <input
                          id="barNumber"
                          v-model="form.lawyerData.barNumber"
                          type="text"
                          required
                          class="input-field"
                          placeholder="ex: 75001234"
                        />
                      </div>

                      <div class="grid md:grid-cols-2 gap-4">
                        <div>
                          <label for="specialties" class="block text-sm font-medium text-neutral-700 mb-2">
                            Spécialités
                          </label>
                          <input
                            id="specialties"
                            v-model="specialtiesInput"
                            type="text"
                            class="input-field"
                            placeholder="Droit civil, Droit pénal"
                          />
                          <p class="mt-1 text-xs text-neutral-500">Séparez par des virgules</p>
                        </div>

                        <div>
                          <label for="officeCity" class="block text-sm font-medium text-neutral-700 mb-2">
                            Ville du cabinet
                          </label>
                          <input
                            id="officeCity"
                            v-model="form.lawyerData.officeCity"
                            type="text"
                            class="input-field"
                            placeholder="Paris"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Client Specific Fields -->
                  <div v-if="selectedUserType === 'client'" class="pt-4 border-t border-neutral-200">
                    <h3 class="text-sm font-semibold text-neutral-900 mb-4 flex items-center">
                      <span class="w-6 h-6 bg-secondary-600 rounded-full flex items-center justify-center mr-2 text-xs font-bold text-white">2</span>
                      Adresse (optionnel)
                    </h3>

                    <div class="grid md:grid-cols-2 gap-4">
                      <div class="md:col-span-2">
                        <label for="clientAddress" class="block text-sm font-medium text-neutral-700 mb-2">
                          Adresse
                        </label>
                        <input
                          id="clientAddress"
                          v-model="form.clientData.address"
                          type="text"
                          class="input-field"
                          placeholder="10 Rue de la Paix"
                        />
                      </div>

                      <div>
                        <label for="clientCity" class="block text-sm font-medium text-neutral-700 mb-2">
                          Ville
                        </label>
                        <input
                          id="clientCity"
                          v-model="form.clientData.city"
                          type="text"
                          class="input-field"
                          placeholder="Paris"
                        />
                      </div>

                      <div>
                        <label for="postalCode" class="block text-sm font-medium text-neutral-700 mb-2">
                          Code postal
                        </label>
                        <input
                          id="postalCode"
                          v-model="form.clientData.postalCode"
                          type="text"
                          class="input-field"
                          placeholder="75001"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Password Section -->
                  <div class="pt-4 border-t border-neutral-200">
                    <h3 class="text-sm font-semibold text-neutral-900 mb-4 flex items-center">
                      <span :class="[
                        'w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold text-white',
                        selectedUserType === 'avocat' ? 'bg-primary-600' : 'bg-secondary-600'
                      ]">3</span>
                      Mot de passe
                    </h3>

                    <div class="grid md:grid-cols-2 gap-4">
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
                            <svg v-if="!showPassword" class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                            <svg v-else class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                            </svg>
                          </button>
                        </div>
                        <p class="mt-1 text-xs text-neutral-500">Min. 8 caractères</p>
                      </div>

                      <div>
                        <label for="confirmPassword" class="block text-sm font-medium text-neutral-700 mb-2">
                          Confirmer <span class="text-accent-500">*</span>
                        </label>
                        <input
                          id="confirmPassword"
                          v-model="confirmPassword"
                          :type="showPassword ? 'text' : 'password'"
                          required
                          class="input-field"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <!-- Password Strength -->
                    <div v-if="form.password" class="mt-3">
                      <div class="flex items-center justify-between text-xs text-neutral-600 mb-1">
                        <span>Force du mot de passe</span>
                        <span :class="passwordStrengthColor">{{ passwordStrengthText }}</span>
                      </div>
                      <div class="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div :class="[passwordStrengthColor, 'h-full transition-all duration-300']" :style="{ width: passwordStrength + '%' }"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Terms -->
                  <div class="pt-4 border-t border-neutral-200">
                    <label class="flex items-start cursor-pointer">
                      <input
                        v-model="acceptTerms"
                        type="checkbox"
                        required
                        :class="[
                          'mt-1 h-4 w-4 border-neutral-300 rounded cursor-pointer',
                          selectedUserType === 'avocat' ? 'text-primary-600 focus:ring-primary-500' : 'text-secondary-600 focus:ring-secondary-500'
                        ]"
                      />
                      <span class="ml-3 text-sm text-neutral-700">
                        J'accepte les 
                        <a href="#" class="font-medium hover:underline" :class="selectedUserType === 'avocat' ? 'text-primary-600' : 'text-secondary-600'">conditions d'utilisation</a> 
                        et la 
                        <a href="#" class="font-medium hover:underline" :class="selectedUserType === 'avocat' ? 'text-primary-600' : 'text-secondary-600'">politique de confidentialité</a>
                      </span>
                    </label>
                  </div>

                  <!-- Submit Button -->
                  <div class="flex gap-3 pt-4">
                    <button
                      type="button"
                      @click="closeModal"
                      class="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      :disabled="isLoading || !acceptTerms"
                      :class="[
                        'flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
                        selectedUserType === 'avocat' 
                          ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                          : 'bg-secondary-600 hover:bg-secondary-700 text-white'
                      ]"
                    >
                      <span v-if="isLoading" class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création en cours...
                      </span>
                      <span v-else>Créer mon compte</span>
                    </button>
                  </div>
                </form>
              </div>

              <!-- Footer -->
              <div class="px-8 py-4 bg-neutral-50 border-t border-neutral-200">
                <p class="text-sm text-center text-neutral-600">
                  Vous avez déjà un compte ?
                  <NuxtLink 
                    to="/auth/login" 
                    :class="[
                      'font-semibold transition-colors',
                      selectedUserType === 'avocat' ? 'text-primary-600 hover:text-primary-700' : 'text-secondary-600 hover:text-secondary-700'
                    ]"
                  >
                    Se connecter
                  </NuxtLink>
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  userType?: 'avocat' | 'client';
}

const props = withDefaults(defineProps<Props>(), {
  userType: undefined,
});
const emit = defineEmits(['update:modelValue', 'success']);

const authStore = useAuthStore();
const router = useRouter();

// Initialize userType as a reactive ref - use provided prop or default to 'client'
const selectedUserType = ref<'avocat' | 'client'>(props.userType || 'client');

// Update selectedUserType when prop changes
watch(() => props.userType, (newType) => {
  if (newType) {
    selectedUserType.value = newType;
  }
});

const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: selectedUserType.value,
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
const showPassword = ref(false);
const acceptTerms = ref(false);

// Watch specialties input
watch(specialtiesInput, (value) => {
  if (value) {
    form.value.lawyerData.specialties = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } else {
    form.value.lawyerData.specialties = [];
  }
});

// Watch selectedUserType and update form role
watch(selectedUserType, (newType) => {
  form.value.role = newType;
});

// Password strength calculator
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

const closeModal = () => {
  emit('update:modelValue', false);
  // Reset form after animation
  setTimeout(() => {
    // Reset selectedUserType if it was not provided as prop
    if (!props.userType) {
      selectedUserType.value = 'client';
    }
    
    form.value = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: selectedUserType.value,
      lawyerData: {
        barNumber: '',
        specialties: [],
        officeAddress: '',
        officeCity: '',
        yearsOfExperience: undefined,
        bio: '',
      },
      clientData: {
        address: '',
        city: '',
        postalCode: '',
      },
    };
    specialtiesInput.value = '';
    confirmPassword.value = '';
    errorMessage.value = '';
    validationErrors.value = [];
    acceptTerms.value = false;
  }, 300);
};

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  validationErrors.value = [];

  if (form.value.password !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas';
    isLoading.value = false;
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
      emit('success');
      closeModal();
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

// Prevent body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>
