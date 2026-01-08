<script setup lang="ts">
import { ref, onMounted } from 'vue';

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
});

const { apiFetch } = useApi();

const twoFactorStatus = ref({ enabled: false, backupCodesCount: 0 });
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const logs = ref<string[]>([]);

const showSetupModal = ref(false);
const setupStep = ref(1);
const qrCodeUrl = ref('');
const secret = ref('');
const verificationCode = ref('');
const backupCodes = ref<string[]>([]);

const showDisableModal = ref(false);
const disablePassword = ref('');

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.unshift(`[${timestamp}] ${message}`);
  if (logs.value.length > 20) logs.value.pop();
  console.log(message);
};

onMounted(() => {
  addLog('Page 2FA chargée');
  fetchStatus();
});

const fetchStatus = async () => {
  addLog('Récupération du statut 2FA...');
  try {
    const response = await apiFetch('/auth/2fa/status', { method: 'GET' });
    addLog(`Response: ${JSON.stringify(response)}`);

    if (response.success) {
      twoFactorStatus.value = response.data;
      addLog(`Statut chargé: enabled=${response.data.enabled}`);
    }
  } catch (err: any) {
    addLog(`Erreur: ${err.message || err}`);
    errorMessage.value = `Erreur: ${err.message || 'API non disponible'}`;
    twoFactorStatus.value = { enabled: false, backupCodesCount: 0 };
  }
};

const startSetup = async () => {
  addLog('Démarrage de la configuration 2FA...');
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await apiFetch('/auth/2fa/setup', { method: 'POST' });
    addLog(`Setup response: ${JSON.stringify(response)}`);

    if (response.success && response.data) {
      qrCodeUrl.value = response.data.qrCodeUrl;
      secret.value = response.data.secret;
      backupCodes.value = response.data.backupCodes;
      showSetupModal.value = true;
      setupStep.value = 1;
      addLog('Modal de configuration affiché');
    }
  } catch (err: any) {
    addLog(`Erreur setup: ${err.message || err}`);
    errorMessage.value = err.data?.message || 'Échec de la configuration';
  } finally {
    loading.value = false;
  }
};

const verifyAndEnable = async () => {
  addLog('Vérification du code...');
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
      addLog('2FA activé avec succès !');
    }
  } catch (err: any) {
    addLog(`Erreur vérification: ${err.message || err}`);
    errorMessage.value = err.data?.message || 'Code invalide';
    verificationCode.value = '';
  } finally {
    loading.value = false;
  }
};

const finishSetup = () => {
  showSetupModal.value = false;
  setupStep.value = 1;
  verificationCode.value = '';
  successMessage.value = '✅ 2FA activé avec succès !';
  addLog('Configuration terminée');
  fetchStatus();
};

const cancelSetup = () => {
  showSetupModal.value = false;
  setupStep.value = 1;
  verificationCode.value = '';
  addLog('Configuration annulée');
};

const disableTwoFactor = async () => {
  addLog('Désactivation du 2FA...');
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
      successMessage.value = '2FA désactivé';
      addLog('2FA désactivé avec succès');
      fetchStatus();
    }
  } catch (err: any) {
    addLog(`Erreur désactivation: ${err.message || err}`);
    errorMessage.value = err.data?.message || 'Échec';
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
  addLog('Codes de secours téléchargés');
};
</script>
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-8">
        <NuxtLink to="/dashboard" class="text-blue-600 hover:text-blue-800 flex items-center mb-4">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au dashboard
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900">Test Authentification 2FA</h1>
        <p class="mt-2 text-gray-600">Version simplifiée pour diagnostic</p>
      </div>

      <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>

      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Statut actuel</h2>
        <div class="bg-gray-50 p-4 rounded font-mono text-sm">
          <div>enabled: <strong :class="twoFactorStatus.enabled ? 'text-green-600' : 'text-red-600'">{{ twoFactorStatus.enabled }}</strong></div>
          <div>backupCodesCount: {{ twoFactorStatus.backupCodesCount }}</div>
          <div>loading: {{ loading }}</div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Actions</h2>

        <div class="mb-4">
          <button
            @click="startSetup"
            :disabled="loading"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-bold text-lg"
          >
            {{ loading ? 'Chargement...' : 'Activer le 2FA' }}
          </button>
          <p class="text-sm text-gray-500 mt-2">Cliquez ici pour commencer la configuration</p>
        </div>

        <div class="mb-4">
          <button
            @click="fetchStatus"
            class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Recharger le statut
          </button>
        </div>

        <div v-if="twoFactorStatus.enabled" class="mb-4">
          <button
            @click="showDisableModal = true"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Désactiver le 2FA
          </button>
        </div>
      </div>

      <div v-if="showSetupModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Configuration 2FA</h2>
              <button @click="cancelSetup" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="setupStep === 1" class="space-y-6">
              <div class="text-center">
                <p class="text-sm text-gray-600 mb-4">
                  Scannez ce code QR avec Google Authenticator ou Authy
                </p>
                <div class="flex justify-center mb-4">
                  <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="border-4 border-gray-200 rounded-lg" />
                  <div v-else class="w-64 h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
                    Chargement...
                  </div>
                </div>
                <p class="text-xs text-gray-500 mb-2">Ou entrez ce code manuellement :</p>
                <code class="bg-gray-100 px-4 py-2 rounded text-sm font-mono">{{ secret }}</code>
              </div>
              <button
                @click="setupStep = 2"
                class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Suivant →
              </button>
            </div>

            <div v-if="setupStep === 2" class="space-y-6">
              <div>
                <p class="text-sm text-gray-600 mb-4">
                  Entrez le code à 6 chiffres de votre application
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
                  ← Retour
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
                    <h4 class="font-semibold text-yellow-900 mb-1">Sauvegardez ces codes !</h4>
                    <p class="text-sm text-yellow-800">
                      Ces codes vous permettront d'accéder à votre compte si vous perdez votre téléphone.
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
                class="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
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
            Entrez votre mot de passe pour confirmer
          </p>
          <input
            v-model="disablePassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            placeholder="Mot de passe"
          />
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

      <div class="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs overflow-auto max-h-60">
        <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
      </div>
    </div>
  </div>
</template>