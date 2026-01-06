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
            class="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all"
            @click.stop
          >
            <!-- Header compact -->
            <div class="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-white">
                      Nouvelle Demande Client
                    </h2>
                    <p class="text-blue-100 text-xs">
                      Réf: {{ offer.id?.substring(0, 8).toUpperCase() }}
                    </p>
                  </div>
                </div>
                <button
                  @click="closeModal"
                  class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center group"
                >
                  <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Corps du modal -->
            <div class="max-h-[65vh] overflow-y-auto px-6 py-4 space-y-4">
              <!-- Titre et description -->
              <div class="space-y-3">
                <div class="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                  <label class="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 block">
                    Titre du dossier
                  </label>
                  <h3 class="text-lg font-bold text-gray-900">
                    {{ offer.title || 'Sans titre' }}
                  </h3>
                </div>

                <div>
                  <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Description
                  </label>
                  <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {{ offer.description || 'Aucune description fournie' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Grid d'informations compact -->
              <div class="grid grid-cols-2 gap-3">
                <!-- Type de demande -->
                <div class="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
                    </svg>
                    <label class="text-xs font-semibold text-purple-600 uppercase">
                      Type
                    </label>
                  </div>
                  <p class="text-sm font-bold text-gray-900">
                    {{ getRequestTypeLabel(offer.request_type) }}
                  </p>
                </div>

                <!-- Catégorie -->
                <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clip-rule="evenodd" />
                    </svg>
                    <label class="text-xs font-semibold text-blue-600 uppercase">
                      Catégorie
                    </label>
                  </div>
                  <p class="text-sm font-bold text-gray-900">
                    {{ offer.case_category || 'Non spécifiée' }}
                  </p>
                </div>

                <!-- Urgence -->
                <div
                  class="rounded-lg p-3 border-2"
                  :class="getUrgencyClasses(offer.urgency)"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">{{ getUrgencyIcon(offer.urgency) }}</span>
                    <label class="text-xs font-semibold uppercase">
                      Urgence
                    </label>
                  </div>
                  <p class="text-sm font-bold">
                    {{ getUrgencyLabel(offer.urgency) }}
                  </p>
                </div>

                <!-- Date de création -->
                <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <label class="text-xs font-semibold text-green-600 uppercase">
                      Créé le
                    </label>
                  </div>
                  <p class="text-sm font-bold text-gray-900">
                    {{ formatDate(offer.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Budget compact -->
              <div
                v-if="offer.budget_min || offer.budget_max"
                class="bg-amber-50 rounded-lg p-3 border border-amber-300"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <label class="text-xs font-semibold text-amber-800 uppercase">
                      Budget Estimé
                    </label>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="offer.budget_min" class="text-base font-bold text-gray-900">
                      {{ formatCurrency(offer.budget_min) }}
                    </span>
                    <span v-if="offer.budget_min && offer.budget_max" class="text-gray-500 font-bold">→</span>
                    <span v-if="offer.budget_max" class="text-base font-bold text-gray-900">
                      {{ formatCurrency(offer.budget_max) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Date préférée compact -->
              <div
                v-if="offer.preferred_date"
                class="bg-indigo-50 rounded-lg p-3 border border-indigo-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <label class="text-xs font-semibold text-indigo-600 uppercase">
                      Date souhaitée
                    </label>
                  </div>
                  <p class="text-sm font-bold text-gray-900">
                    {{ formatDate(offer.preferred_date) }}
                  </p>
                </div>
              </div>

              <!-- Informations client compact -->
              <div class="border-t border-gray-200 pt-3">
                <label class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Informations Client
                </label>
                <div class="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div
                    v-if="offer.client_first_name || offer.client_last_name"
                    class="flex items-center gap-2"
                  >
                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-white font-bold text-sm">
                        {{ getClientInitials() }}
                      </span>
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-gray-900 text-sm">
                        {{ offer.client_first_name }} {{ offer.client_last_name }}
                      </p>
                    </div>
                  </div>

                  <div v-if="offer.client_email" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a
                      :href="`mailto:${offer.client_email}`"
                      class="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      {{ offer.client_email }}
                    </a>
                  </div>

                  <div v-if="offer.client_phone" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a
                      :href="`tel:${offer.client_phone}`"
                      class="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      {{ offer.client_phone }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer avec actions compact -->
            <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3">
              <div class="flex gap-2">
                <button
                  @click="closeModal"
                  :disabled="loading"
                  class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fermer
                </button>
                <button
                  @click="handleReject"
                  :disabled="loading"
                  class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow flex items-center justify-center gap-2"
                >
                  <svg v-if="!rejecting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span v-if="rejecting" class="flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                  class="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow flex items-center justify-center gap-2"
                >
                  <svg v-if="!accepting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-if="accepting" class="flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Acceptation...
                  </span>
                  <span v-else>Accepter</span>
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
    consultation: 'Consultation',
    new_case: 'Nouveau dossier',
    second_opinion: 'Second avis',
    urgent: 'Urgent',
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
    low: '●',
    normal: '●',
    medium: '●',
    high: '●',
    urgent: '●',
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

