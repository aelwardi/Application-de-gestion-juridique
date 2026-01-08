<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const router = useRouter();
const { apiFetch } = useApi();

const twoFactorStatus = ref({
  enabled: false,
  backupCodesCount: 0,
});

const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const showSetupModal = ref(false);
const setupStep = ref(1);
const qrCodeUrl = ref('');
const secret = ref('');
const verificationCode = ref('');
const backupCodes = ref<string[]>([]);

const showDisableModal = ref(false);
const disablePassword = ref('');

const showBackupCodesModal = ref(false);

onMounted(() => {
  fetchStatus();
});

const fetchStatus = async () => {
  try {
    console.log('Fetching 2FA status...');
    const response = await apiFetch('/auth/2fa/status', { method: 'GET' });
    console.log('2FA status response:', response);

    if (response.success) {
      twoFactorStatus.value = response.data;
      console.log('2FA status loaded:', twoFactorStatus.value);
    } else {
      errorMessage.value = 'Erreur lors du chargement du statut 2FA';
      console.error('Response not successful:', response);
    }
  } catch (err: any) {
    console.error('Failed to fetch 2FA status:', err);
    errorMessage.value = `Erreur API: ${err.message || 'Impossible de charger le statut'}`;

    // Si l'API ne répond pas, on force enabled à false pour afficher le bouton
    twoFactorStatus.value = {
      enabled: false,
      backupCodesCount: 0,
    };
  }
};

const startSetup = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await apiFetch('/auth/2fa/setup', { method: 'POST' });
    if (response.success && response.data) {
      qrCodeUrl.value = response.data.qrCodeUrl;
      secret.value = response.data.secret;
      backupCodes.value = response.data.backupCodes;
      showSetupModal.value = true;
      setupStep.value = 1;
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Échec de la configuration du 2FA';
  } finally {
    loading.value = false;
  }
};

const verifyAndEnable = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await apiFetch('/auth/2fa/enable', {
      method: 'POST',
      body: {
        secret: secret.value,
        code: verificationCode.value,
        backupCodes: backupCodes.value,
      },
    });

    if (response.success) {
      setupStep.value = 3;
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Code de vérification invalide';
    verificationCode.value = '';
  } finally {
    loading.value = false;
  }
};

const finishSetup = () => {
  showSetupModal.value = false;
  setupStep.value = 1;
  verificationCode.value = '';
  successMessage.value = '2FA activé avec succès !';
  fetchStatus();

  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
};

const cancelSetup = () => {
  showSetupModal.value = false;
  setupStep.value = 1;
  verificationCode.value = '';
  qrCodeUrl.value = '';
  secret.value = '';
  backupCodes.value = [];
};

const disableTwoFactor = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await apiFetch('/auth/2fa/disable', {
      method: 'POST',
      body: { password: disablePassword.value },
    });

    if (response.success) {
      showDisableModal.value = false;
      disablePassword.value = '';
      successMessage.value = '2FA désactivé avec succès';
      fetchStatus();

      setTimeout(() => {
        successMessage.value = '';
      }, 5000);
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Échec de la désactivation du 2FA';
  } finally {
    loading.value = false;
  }
};

const regenerateCodes = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await apiFetch('/auth/2fa/regenerate-backup-codes', {
      method: 'POST',
    });

    if (response.success && response.data) {
      backupCodes.value = response.data.backupCodes;
      showBackupCodesModal.value = true;
      fetchStatus();
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Échec de la régénération des codes';
  } finally {
    loading.value = false;
  }
};

const downloadBackupCodes = () => {
  const text = backupCodes.value.join('\n');
  const blob = new Blob([`Codes de secours 2FA\n\nDate: ${new Date().toLocaleString('fr-FR')}\n\n${text}\n\nConservez ces codes en lieu sûr !`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `2fa-backup-codes-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <button @click="router.back()" class="text-blue-600 hover:text-blue-800 flex items-center mb-4">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Authentification à deux facteurs</h1>
        <p class="mt-2 text-gray-600">Sécurisez votre compte avec une couche de protection supplémentaire</p>
      </div>

      <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>

      <div class="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
        <strong>Debug:</strong>
        enabled = {{ twoFactorStatus.enabled }},
        backupCodesCount = {{ twoFactorStatus.backupCodesCount }},
        loading = {{ loading }}
      </div>

      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div :class="[
              'h-12 w-12 rounded-full flex items-center justify-center',
              twoFactorStatus.enabled ? 'bg-green-100' : 'bg-gray-100'
            ]">
              <svg v-if="twoFactorStatus.enabled" class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <svg v-else class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">
                2FA {{ twoFactorStatus.enabled ? 'Activé' : 'Désactivé' }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ twoFactorStatus.enabled
                  ? 'Votre compte est protégé par une authentification à deux facteurs'
                  : 'Activez le 2FA pour une sécurité accrue'
                }}
              </p>
            </div>
          </div>
          <button
            v-if="!twoFactorStatus.enabled"
            @click="startSetup"
            :disabled="loading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            Activer
          </button>
          <button
            v-else
            @click="showDisableModal = true"
            :disabled="loading"
            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
          >
            Désactiver
          </button>
        </div>

        <div v-if="twoFactorStatus.enabled" class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">Codes de secours</p>
              <p class="text-xs text-gray-500">{{ twoFactorStatus.backupCodesCount }} codes disponibles</p>
            </div>
            <button
              @click="regenerateCodes"
              :disabled="loading"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Régénérer les codes
            </button>
          </div>
        </div>
      </div>

      <div v-if="showSetupModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Configurer l'authentification à deux facteurs</h2>
              <button @click="cancelSetup" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="setupStep === 1" class="space-y-6">
              <div class="text-center">
                <p class="text-sm text-gray-600 mb-4">
                  Scannez ce code QR avec votre application d'authentification (Google Authenticator, Authy, etc.)
                </p>
                <div class="flex justify-center mb-4">
                  <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="border-4 border-gray-200 rounded-lg" />
                  <div v-else class="w-64 h-64 bg-gray-100 animate-pulse rounded-lg"></div>
                </div>
                <p class="text-xs text-gray-500 mb-2">Ou entrez ce code manuellement :</p>
                <code class="bg-gray-100 px-4 py-2 rounded text-sm font-mono">{{ secret }}</code>
              </div>
              <button
                @click="setupStep = 2"
                class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Suivant
              </button>
            </div>

            <div v-if="setupStep === 2" class="space-y-6">
              <div>
                <p class="text-sm text-gray-600 mb-4">
                  Entrez le code à 6 chiffres depuis votre application pour vérifier la configuration
                </p>
                <input
                  v-model="verificationCode"
                  type="text"
                  maxlength="6"
                  inputmode="numeric"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                  placeholder="000000"
                  @keyup.enter="verifyAndEnable"
                />
              </div>
              <div class="flex gap-3">
                <button
                  @click="setupStep = 1"
                  class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Retour
                </button>
                <button
                  @click="verifyAndEnable"
                  :disabled="loading || verificationCode.length !== 6"
                  class="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {{ loading ? 'Vérification...' : 'Vérifier et activer' }}
                </button>
              </div>
            </div>

            <div v-if="setupStep === 3" class="space-y-6">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div class="flex items-start">
                  <svg class="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 class="font-semibold text-yellow-900 mb-1">Important : Sauvegardez ces codes de secours</h4>
                    <p class="text-sm text-yellow-800">
                      Ces codes vous permettront d'accéder à votre compte si vous perdez votre téléphone.
                      Chaque code ne peut être utilisé qu'une seule fois.
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-2 gap-3">
                  <code v-for="(code, index) in backupCodes" :key="index" class="bg-white px-3 py-2 rounded border border-gray-200 text-center font-mono text-sm">
                    {{ code }}
                  </code>
                </div>
              </div>

              <button
                @click="downloadBackupCodes"
                class="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger les codes
              </button>

              <button
                @click="finishSetup"
                class="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                J'ai sauvegardé mes codes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showDisableModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Désactiver le 2FA</h3>
          <p class="text-sm text-gray-600 mb-4">
            Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ? Votre compte sera moins sécurisé.
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Entrez votre mot de passe pour confirmer
            </label>
            <input
              v-model="disablePassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Mot de passe"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="showDisableModal = false; disablePassword = ''"
              class="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              @click="disableTwoFactor"
              :disabled="loading || !disablePassword"
              class="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
            >
              {{ loading ? 'Désactivation...' : 'Désactiver' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showBackupCodesModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-lg w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">Nouveaux codes de secours</h3>
            <button @click="showBackupCodesModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p class="text-sm text-yellow-800">
              Vos anciens codes de secours ne fonctionneront plus. Sauvegardez ces nouveaux codes.
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="grid grid-cols-2 gap-3">
              <code v-for="(code, index) in backupCodes" :key="index" class="bg-white px-3 py-2 rounded border border-gray-200 text-center font-mono text-sm">
                {{ code }}
              </code>
            </div>
          </div>

          <button
            @click="downloadBackupCodes"
            class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger les codes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>