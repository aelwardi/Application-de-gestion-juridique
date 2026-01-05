<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

        <!-- Modal Container -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
            @click.stop
          >
            <!-- Header avec gradient -->
            <div class="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <span class="text-3xl">⚖️</span>
                    </div>
                    <div>
                      <h2 class="text-2xl font-black text-white uppercase tracking-tight">
                        Nouvelle Demande Client
                      </h2>
                      <p class="text-blue-100 text-sm font-medium mt-1">
                        Réf: {{ offer.id?.substring(0, 8).toUpperCase() }}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  @click="closeModal"
                  class="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 flex items-center justify-center group"
                >
                  <svg class="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Corps du modal -->
            <div class="max-h-[70vh] overflow-y-auto px-8 py-6 space-y-6">
              <!-- Titre du dossier -->
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-l-4 border-blue-500">
                <label class="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 block">
                  📋 Titre du dossier
                </label>
                <h3 class="text-2xl font-black text-gray-900">
                  {{ offer.title || 'Sans titre' }}
                </h3>
              </div>

              <!-- Description -->
              <div>
                <label class="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                  <span>📝</span> Description complète
                </label>
                <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p class="text-gray-700 leading-relaxed whitespace-pre-line">
                    {{ offer.description || 'Aucune description fournie' }}
                  </p>
                </div>
              </div>

              <!-- Grid d'informations -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Type de demande -->
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">📌</span>
                    <label class="text-xs font-black text-purple-700 uppercase tracking-wider">
                      Type de demande
                    </label>
                  </div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ getRequestTypeLabel(offer.request_type) }}
                  </p>
                </div>

                <!-- Catégorie -->
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">⚖️</span>
                    <label class="text-xs font-black text-blue-700 uppercase tracking-wider">
                      Catégorie juridique
                    </label>
                  </div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ offer.case_category || 'Non spécifiée' }}
                  </p>
                </div>

                <!-- Urgence -->
                <div
                  class="rounded-xl p-4 border-2"
                  :class="getUrgencyClasses(offer.urgency)"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">{{ getUrgencyIcon(offer.urgency) }}</span>
                    <label class="text-xs font-black uppercase tracking-wider">
                      Niveau d'urgence
                    </label>
                  </div>
                  <p class="text-lg font-bold">
                    {{ getUrgencyLabel(offer.urgency) }}
                  </p>
                </div>

                <!-- Date de création -->
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">📅</span>
                    <label class="text-xs font-black text-green-700 uppercase tracking-wider">
                      Date de création
                    </label>
                  </div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ formatDate(offer.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Budget (si présent) -->
              <div
                v-if="offer.budget_min || offer.budget_max"
                class="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-amber-300"
              >
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-3xl">💰</span>
                  <label class="text-sm font-black text-amber-800 uppercase tracking-wider">
                    Budget Estimé par le Client
                  </label>
                </div>
                <div class="flex items-center gap-3">
                  <span v-if="offer.budget_min" class="text-2xl font-black text-gray-900">
                    {{ formatCurrency(offer.budget_min) }}
                  </span>
                  <span v-if="offer.budget_min && offer.budget_max" class="text-xl text-gray-500 font-bold">
                    →
                  </span>
                  <span v-if="offer.budget_max" class="text-2xl font-black text-gray-900">
                    {{ formatCurrency(offer.budget_max) }}
                  </span>
                </div>
              </div>

              <!-- Date préférée (si présente) -->
              <div
                v-if="offer.preferred_date"
                class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🗓️</span>
                  <label class="text-xs font-black text-indigo-700 uppercase tracking-wider">
                    Date souhaitée pour consultation
                  </label>
                </div>
                <p class="text-lg font-bold text-gray-900">
                  {{ formatDate(offer.preferred_date) }}
                </p>
              </div>

              <!-- Informations client -->
              <div class="border-t-2 border-dashed border-gray-300 pt-6">
                <label class="text-sm font-black text-gray-700 uppercase tracking-widest mb-4 block flex items-center gap-2">
                  <span>👤</span> Informations du Client
                </label>
                <div class="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 space-y-3">
                  <div
                    v-if="offer.client_first_name || offer.client_last_name"
                    class="flex items-center gap-3"
                  >
                    <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-white font-bold text-lg">
                        {{ getClientInitials() }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500 font-medium">Nom complet</p>
                      <p class="font-bold text-gray-900 text-lg">
                        {{ offer.client_first_name }} {{ offer.client_last_name }}
                      </p>
                    </div>
                  </div>

                  <div v-if="offer.client_email" class="flex items-start gap-3 py-2">
                    <span class="text-2xl">📧</span>
                    <div>
                      <p class="text-sm text-gray-500 font-medium">Email</p>
                      <a
                        :href="`mailto:${offer.client_email}`"
                        class="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                      >
                        {{ offer.client_email }}
                      </a>
                    </div>
                  </div>

                  <div v-if="offer.client_phone" class="flex items-start gap-3 py-2">
                    <span class="text-2xl">📞</span>
                    <div>
                      <p class="text-sm text-gray-500 font-medium">Téléphone</p>
                      <a
                        :href="`tel:${offer.client_phone}`"
                        class="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                      >
                        {{ offer.client_phone }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer avec actions -->
            <div class="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-8 py-5">
              <div class="flex gap-3">
                <button
                  @click="closeModal"
                  :disabled="loading"
                  class="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-black uppercase text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fermer
                </button>
                <button
                  @click="handleReject"
                  :disabled="loading"
                  class="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-black uppercase text-sm hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg v-if="!rejecting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span v-if="rejecting" class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refus...
                  </span>
                  <span v-else>Refuser</span>
                </button>
                <button
                  @click="handleAccept"
                  :disabled="loading"
                  class="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black uppercase text-sm hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg v-if="!accepting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-if="accepting" class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Acceptation...
                  </span>
                  <span v-else>Accepter & Créer Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps({
  show: { type: Boolean, required: true },
  offer: { type: Object, required: true }
});

const emit = defineEmits(['close', 'accept', 'reject']);

const loading = computed(() => accepting.value || rejecting.value);
const accepting = ref(false);
const rejecting = ref(false);

const closeModal = () => {
  if (!loading.value) {
    emit('close');
  }
};

const handleAccept = async () => {
  if (!confirm('✅ Êtes-vous sûr de vouloir accepter cette demande ?\n\nUn nouveau dossier sera automatiquement créé.')) return;

  accepting.value = true;
  try {
    emit('accept');
  } finally {
    accepting.value = false;
  }
};

const handleReject = async () => {
  if (!confirm('❌ Êtes-vous sûr de vouloir refuser cette demande ?\n\nCette action est irréversible.')) return;

  rejecting.value = true;
  try {
    emit('reject');
  } finally {
    rejecting.value = false;
  }
};

const getRequestTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    consultation: '📋 Consultation',
    new_case: '📁 Nouveau dossier',
    second_opinion: '🔍 Second avis',
    urgent: '🚨 Urgent',
  };
  return labels[type] || type || 'Non spécifié';
};

const getUrgencyLabel = (urgency: string) => {
  const labels: Record<string, string> = {
    low: 'Faible',
    normal: 'Normal',
    medium: 'Normal',
    high: 'Élevée',
    urgent: 'Très Urgent',
  };
  return labels[urgency] || 'Normal';
};

const getUrgencyIcon = (urgency: string) => {
  const icons: Record<string, string> = {
    low: '🟢',
    normal: '🟡',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴',
  };
  return icons[urgency] || '⚪';
};

const getUrgencyClasses = (urgency: string) => {
  const classes: Record<string, string> = {
    low: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 text-green-800',
    normal: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 text-yellow-800',
    medium: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 text-yellow-800',
    high: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300 text-orange-800',
    urgent: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-400 text-red-900',
  };
  return classes[urgency] || classes.normal;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Non spécifiée';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const getClientInitials = () => {
  const first = props.offer.client_first_name?.charAt(0) || '';
  const last = props.offer.client_last_name?.charAt(0) || '';
  return (first + last).toUpperCase() || '??';
};

// Fermer avec Échap
onMounted(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.show && !loading.value) {
      closeModal();
    }
  };
  window.addEventListener('keydown', handleEsc);

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEsc);
  });
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: transform 0.3s ease;
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  transform: scale(0.95) translateY(-20px);
}
</style>

