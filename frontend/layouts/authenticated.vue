<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="authStore.isAdmin" class="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/admin/stats" class="text-xl font-bold text-white flex items-center">
              Back Office Admin
            </NuxtLink>
            <div class="hidden md:flex space-x-2">
              <NuxtLink to="/admin/stats" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition">Dashboard</NuxtLink>
              <NuxtLink to="/admin/users" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition">Utilisateurs</NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
             <span class="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-purple-900">👑 ADMIN</span>
             <button @click="handleLogout" class="px-4 py-2 text-sm font-medium text-purple-700 bg-white hover:bg-gray-100 rounded-md transition">Déconnexion</button>
          </div>
        </div>
      </div>
    </nav>

    <nav v-else class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/dashboard" class="text-xl font-bold text-blue-600">Gestion Juridique</NuxtLink>
            <ClientOnly>
              <div class="hidden md:flex space-x-4">
                <NuxtLink v-if="authStore.isLawyer" to="/cases" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dossiers</NuxtLink>
                <NuxtLink v-if="authStore.isClient" to="/lawyers" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Avocats</NuxtLink>
                <NuxtLink to="/appointments" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Rendez-vous</NuxtLink>
                <NuxtLink to="/messages" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Messages</NuxtLink>
                <NuxtLink to="/documents" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Documents</NuxtLink>
              </div>
            </ClientOnly>
          </div>

          <ClientOnly>
            <div class="flex items-center space-x-4">
              <div class="relative">
                <button @click.stop="toggleNotifications" type="button" class="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                  <span v-if="notificationCount > 0" class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {{ notificationCount > 9 ? '9+' : notificationCount }}
                  </span>
                </button>

                <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                  <div v-show="showNotifications" class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50" @click.stop>
                    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 class="font-semibold text-gray-900">Notifications</h3>
                      <button v-if="notificationCount > 0" @click="markAllAsRead" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Tout marquer</button>
                    </div>
                    <div class="max-h-96 overflow-y-auto">
                      <div v-if="loadingNotifications" class="p-8 text-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
                      <div v-else-if="notificationsList.length === 0" class="p-8 text-center text-gray-500"><p class="text-sm">Aucune notification</p></div>
                      <div v-else>
                        <div v-for="notif in notificationsList.slice(0, 8)" :key="notif.id" @click="handleNotificationClick(notif)" class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors" :class="!notif.is_read ? 'bg-blue-50/50' : ''">
                          <div class="flex items-start gap-3">
                            <div :class="['flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', getNotificationColor(notif.type)]">
                              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-bold text-gray-900">{{ notif.title }}</p>
                              <p class="text-sm text-gray-600 truncate">{{ notif.message }}</p>
                              <p class="text-xs text-gray-400 mt-1">{{ formatNotificationTime(notif.created_at) }}</p>
                            </div>
                            <div v-if="!notif.is_read" class="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="p-4 border-t border-gray-200 text-center">
                      <NuxtLink to="/notifications" @click="showNotifications = false" class="text-sm text-blue-600 font-bold hover:underline">Voir toutes les notifications →</NuxtLink>
                    </div>
                  </div>
                </transition>
              </div>

              <div class="relative">
                <button @click.stop="toggleProfileMenu" class="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <span v-if="authStore.user?.profilePictureUrl" class="block w-10 h-10 rounded-full bg-cover bg-center border-2 border-blue-500" :style="`background-image: url('${authStore.user.profilePictureUrl}')`"></span>
                  <span v-else class="w-10 h-10 rounded-full bg-blue-500 inline-flex items-center justify-center text-white font-semibold border-2 border-blue-600 uppercase">{{ getInitials() }}</span>
                </button>
                <transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                  <div v-show="showProfileMenu" class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div class="p-4 border-b border-gray-200">
                      <p class="font-semibold text-gray-900">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
                      <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
                      <span class="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">{{ authStore.user?.role }}</span>
                    </div>
                    <div class="py-2">
                      <NuxtLink to="/profile" @click="showProfileMenu = false" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">Mon Profil</NuxtLink>
                      <NuxtLink v-if="authStore.isClient" to="/clients/requests" @click="showProfileMenu = false" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-t">
                        <span class="font-medium text-blue-600 italic">Mes Demandes</span>
                      </NuxtLink>
                      <NuxtLink v-if="authStore.isLawyer" to="/clients" @click="showProfileMenu = false" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-t font-medium">
                         Mes Clients
                      </NuxtLink>
                      <button @click="handleLogout" class="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold border-t">Déconnexion</button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>
    </nav>
    <main><slot /></main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCase } from '~/composables/useCase'

const authStore = useAuthStore()
const { getPendingOffers } = useCase()

const showProfileMenu = ref(false)
const showNotifications = ref(false)
const loadingNotifications = ref(false)
const notificationsList = ref<any[]>([])

const notificationCount = computed(() => notificationsList.value.filter(n => !n.is_read).length)

const loadNotifications = async () => {
  if (!authStore.user) return
  
  // LOGIQUE DU DOUBLE ID POUR LA CLOCHE
  const id1 = authStore.user.id
  const id2 = authStore.user.lawyer_id || authStore.user.lawyerId

  try {
    // On lance la recherche pour les deux identités possibles
    const [offers1, offers2] = await Promise.all([
      getPendingOffers(id1),
      id2 ? getPendingOffers(id2) : Promise.resolve([])
    ])

    const data1 = Array.isArray(offers1) ? offers1 : (offers1?.data || [])
    const data2 = Array.isArray(offers2) ? offers2 : (offers2?.data || [])
    
    // On fusionne tout
    const allOffers = [...data1, ...data2]
    
    // On dédoublonne par ID et on trie par date
    const uniqueMap = new Map()
    allOffers.forEach(o => uniqueMap.set(o.id, o))
    
    const sortedOffers = Array.from(uniqueMap.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // On transforme les offres en format Notification
    notificationsList.value = sortedOffers.map((o: any) => ({
      id: o.id,
      type: 'case',
      title: 'Nouvelle offre client',
      message: `Dossier: ${o.title || 'Sans titre'}`,
      created_at: o.created_at,
      is_read: false
    }))
  } catch (e) { 
    console.error("Erreur chargement cloche:", e) 
  }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showProfileMenu.value = false
  if (showNotifications.value) loadNotifications()
}

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
  showNotifications.value = false
}

const markAllAsRead = async () => {
  try {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.apiBaseUrl}/notifications/mark-all-read`, { method: 'POST' })
    notificationsList.value = notificationsList.value.map(n => ({ ...n, is_read: true }))
  } catch (e) {
    notificationsList.value = notificationsList.value.map(n => ({ ...n, is_read: true }))
  }
}

const handleNotificationClick = (notif: any) => {
  showNotifications.value = false
  navigateTo(`/notifications?id=${notif.id}`)
}

const getInitials = () => {
  if (!authStore.user) return '?'
  return `${authStore.user.firstName?.charAt(0)}${authStore.user.lastName?.charAt(0)}`.toUpperCase()
}

const formatNotificationTime = (date: any) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const getNotificationColor = (type: string) => {
  if(type === 'case') return 'bg-blue-600'
  return 'bg-gray-500'
}

const handleLogout = async () => {
  await authStore.logout()
}

onMounted(() => {
  loadNotifications()
  // Rafraîchir toutes les minutes
  setInterval(loadNotifications, 60000)
})
</script>