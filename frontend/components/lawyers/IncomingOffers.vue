<template>
  <div v-if="offers && offers.length > 0" class="mb-8">
    <div class="bg-white rounded-lg shadow-lg border-t-4 border-purple-600 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 bg-purple-50 flex justify-between items-center">
        <h2 class="text-lg font-bold text-purple-900 flex items-center gap-2">
          <span class="flex h-3 w-3 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-600"></span>
          </span>
          Nouvelles Demandes Clients ({{ offers.length }})
        </h2>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="offer in offers" 
            :key="offer.id" 
            class="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all bg-white"
          >
            <div class="flex justify-between items-start mb-3">
              <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase tracking-wider">
                {{ offer.case_type }}
              </span>
              <span class="text-xs text-gray-400 italic">
                Reçu le {{ new Date(offer.created_at).toLocaleDateString() }}
              </span>
            </div>

            <h3 class="font-bold text-gray-900 mb-2">{{ offer.title }}</h3>
            <p class="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
              {{ offer.description }}
            </p>

            <div class="flex gap-2 mt-auto">
              <button 
                @click="handleAccept(offer.id)"
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
              >
                Accepter le dossier
              </button>
              <button 
                class="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-sm transition-colors"
              >
                Détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// On définit les "props" pour recevoir les données depuis avocat.vue
const props = defineProps({
  offers: {
    type: Array as () => any[],
    default: () => []
  }
})

// On définit les "emits" pour dire au parent de se rafraîchir après action
const emit = defineEmits(['refresh'])

const handleAccept = async (offerId: string) => {
  if (!confirm("Voulez-vous accepter cette demande et créer le dossier correspondant ?")) return

  try {
    const response: any = await $fetch(`/api/offers/${offerId}/accept`, {
      method: 'POST'
    })

    if (response.success) {
      // On prévient le parent (avocat.vue) qu'il doit recharger les données
      emit('refresh')
    }
  } catch (err) {
    console.error("Erreur lors de l'acceptation:", err)
    alert("Une erreur est survenue lors de la création du dossier.")
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>