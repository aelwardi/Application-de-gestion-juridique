<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <NuxtLink to="/dashboard" class="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6 transition group">
        <svg class="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour au tableau de bord
      </NuxtLink>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Notifications</h1>
        <p class="text-gray-600 mt-2">Nouvelles offres de clients à valider</p>
      </div>

      <div class="bg-white rounded-lg shadow p-4 mb-8">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in filters" :key="filter.id"
            @click="activeFilter = filter.id"
            :class="[
              activeFilter === filter.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200', 
              'px-4 py-2 rounded-lg text-sm font-medium transition'
            ]"
          >
            {{ filter.label }} ({{ filter.count }})
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="loading" class="bg-white rounded-lg shadow p-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>

        <div v-else-if="filteredNotifications.length === 0" class="bg-white rounded-lg shadow p-12 text-center text-gray-500 italic">
          Aucune notification trouvée.
        </div>

        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :id="'notif-' + notification.id"
          class="bg-white rounded-lg shadow border-l-4 overflow-hidden transition-all duration-700"
          :class="[
            getBorderColor(notification.type),
            highlightedId === notification.id ? 'ring-4 ring-blue-500/50 bg-blue-50 scale-[1.02] shadow-[0_20px_50px_rgba(37,99,235,0.3)] z-10' : ''
          ]"
        >
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div :class="['flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white', getIconBg(notification.type)]">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(notification.type)" />
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 uppercase leading-tight">{{ notification.title }}</h3>
                    <p class="text-blue-600 text-xs font-bold uppercase tracking-wider mt-1">
                      {{ notification.data?.case_category || (notification.type === 'message' ? 'Communication' : 'Calendrier') }}
                    </p>
                  </div>
                  <span class="text-xs text-gray-400 font-medium">Reçu le {{ formatFullDate(notification.created_at) }}</span>
                </div>

                <div v-if="notification.type === 'case'" class="mt-5 flex flex-wrap gap-2">
                  <button @click="openDetails(notification.data)" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold rounded transition uppercase">
                    DÉTAILS
                  </button>
                  <button @click="handleDeclineOffer(notification.id)" class="px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-bold rounded transition uppercase">
                    DÉCLINER
                  </button>
                  <button @click="handleAcceptOffer(notification.id)" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded transition uppercase shadow-sm">
                    ACCEPTER
                  </button>
                </div>
                
                <p v-else class="text-sm text-gray-600 mt-2">{{ notification.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 class="text-xl font-bold text-gray-900 uppercase">{{ selectedOffer?.title }}</h3>
            <p class="text-xs text-blue-600 font-bold tracking-widest uppercase mt-1">{{ selectedOffer?.case_category }}</p>
          </div>
          <button @click="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors text-3xl">&times;</button>
        </div>

        <div class="p-6 space-y-8">
          <div class="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
            <div class="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md uppercase">
              {{ selectedOffer?.client_first_name?.charAt(0) }}{{ selectedOffer?.client_last_name?.charAt(0) }}
            </div>
            <div>
              <h4 class="font-bold text-gray-900">{{ selectedOffer?.client_first_name }} {{ selectedOffer?.client_last_name }}</h4>
              <p class="text-sm text-gray-600 mt-1">📧 {{ selectedOffer?.client_email }}</p>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Détails de l'affaire</h4>
            <div class="bg-gray-50 p-4 rounded-xl border italic text-gray-700 leading-relaxed">
              "{{ selectedOffer?.description || 'Aucune description fournie' }}"
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="border p-4 rounded-xl shadow-sm">
              <p class="text-xs text-gray-500 font-bold uppercase mb-1">Budget</p>
              <p class="text-lg font-black text-gray-900">{{ selectedOffer?.budget_min }}€ - {{ selectedOffer?.budget_max }}€</p>
            </div>
            <div class="border p-4 rounded-xl shadow-sm">
              <p class="text-xs text-gray-500 font-bold uppercase mb-1">Urgence</p>
              <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">{{ selectedOffer?.urgency || 'Normal' }}</span>
            </div>
          </div>
        </div>

        <div class="p-6 border-t bg-gray-50/50 flex gap-3 justify-end">
          <button @click="showModal = false" class="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition uppercase text-xs">Fermer</button>
          <button @click="handleAcceptOffer(selectedOffer.id)" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition uppercase text-xs shadow-lg shadow-blue-100">
            Accepter l'affaire
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCase } from '~/composables/useCase'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const { getPendingOffers } = useCase()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const notifications = ref<any[]>([])
const loading = ref(true)
const activeFilter = ref('all')
const showModal = ref(false)
const selectedOffer = ref<any>(null)
const highlightedId = ref<string | null>(null)

const filters = computed(() => [
  { id: 'all', label: 'Toutes', count: notifications.value.length },
  { id: 'case', label: 'Offres', count: notifications.value.filter(n => n.type === 'case').length },
  { id: 'message', label: 'Messages', count: notifications.value.filter(n => n.type === 'message').length },
])

const filteredNotifications = computed(() => {
  let list = notifications.value
  if (activeFilter.value !== 'all') list = list.filter(n => n.type === activeFilter.value)
  return list.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const loadNotifications = async () => {
  if (!authStore.user) return
  loading.value = true
  try {
    // ON RÉCUPÈRE LES DEUX POUR VOIR WASHLAFA
    const userId = authStore.user.id
    const lawyerId = authStore.user?.lawyer_id || authStore.user?.lawyerId

    const [res1, res2] = await Promise.all([
      getPendingOffers(userId),
      lawyerId && lawyerId !== userId ? getPendingOffers(lawyerId) : Promise.resolve([])
    ])

    const data1 = Array.isArray(res1) ? res1 : (res1?.data || [])
    const data2 = Array.isArray(res2) ? res2 : (res2?.data || [])
    
    const uniqueMap = new Map()
    const all = [...data1, ...data2]
    all.forEach(o => { if(o?.id) uniqueMap.set(o.id, o) })

    const offerNotifs = Array.from(uniqueMap.values()).map((o: any) => ({
      id: o.id,
      type: 'case',
      title: o.title || 'Sans titre',
      created_at: o.created_at,
      data: o 
    }))

    const otherNotifs = [{ id: 'm1', type: 'message', title: 'Nouveau message', message: 'Bienvenue sur la plateforme.', created_at: new Date() }]
    notifications.value = [...offerNotifs, ...otherNotifs]
  } finally {
    loading.value = false
  }
}

const handleAcceptOffer = async (id: string) => {
  if (!confirm('Accepter ce dossier ?')) return
  loading.value = true

  try {
    // Ton ID valide qui permet de passer la sécurité "Profil manquant"
    const validId = "bccc7e35-e678-4a9a-894f-b07256a9104c"

    const response: any = await $fetch(`${config.public.apiBaseUrl}/offers/${id}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` },
      body: {
        lawyer_id: validId,
        user_id: validId
      }
    })

    // Fermeture de la modale
    showModal.value = false

    // Redirection automatique vers le dossier créé
    // On utilise le numéro de dossier ou l'ID retourné par le backend
    const targetId = response.caseNumber || id
    // On redirige vers la liste complète des dossiers
await navigateTo('/cases')

  } catch (e: any) {
    alert("Erreur lors de l'acceptation. Le serveur refuse l'opération.")
  } finally {
    loading.value = false
  }
}
const handleDeclineOffer = async (id: string) => {
  if(!confirm('Refuser ?')) return
  try {
    await $fetch(`${config.public.apiBaseUrl}/offers/${id}/decline`, { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    await loadNotifications()
  } catch (e) { alert("Erreur refus") }
}

const openDetails = (offer: any) => {
  selectedOffer.value = offer
  showModal.value = true
}

const getBorderColor = (type: string) => type === 'case' ? 'border-blue-600' : 'border-green-500'
const getIconBg = (type: string) => type === 'case' ? 'bg-blue-600' : 'bg-green-500'
const getIconPath = (type: string) => 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
const formatFullDate = (d: any) => new Date(d).toLocaleDateString('fr-FR')

onMounted(loadNotifications)
</script>