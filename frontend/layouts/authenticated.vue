<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="authStore.isAdmin" class="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/admin/stats" class="text-xl font-bold text-white">Back Office Admin</NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="handleLogout" class="px-4 py-2 text-sm font-medium text-purple-700 bg-white rounded-md transition hover:bg-gray-100">Déconnexion</button>
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
                <NuxtLink v-if="authStore.isLawyer" to="/cases" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">Dossiers</NuxtLink>
                <NuxtLink v-if="authStore.isClient" to="/lawyers" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">Avocats</NuxtLink>
                <NuxtLink to="/appointments" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">Rendez-vous</NuxtLink>
                <NuxtLink to="/messages" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">Messages</NuxtLink>
                <NuxtLink to="/documents" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition">Documents</NuxtLink>
              </div>
            </ClientOnly>
          </div>

          <ClientOnly>
            <div class="flex items-center space-x-4">
              <div class="relative">
                <button @click.stop="toggleNotifications" class="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                  <span v-if="notificationCount > 0" class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                    {{ notificationCount }}
                  </span>
                </button>

                <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100">
                  <div v-show="showNotifications" class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden" @click.stop>
                    <div class="p-4 border-b bg-gray-50 flex items-center justify-between">
                      <h3 class="font-bold text-gray-900 uppercase text-xs tracking-wider">Notifications 🔔</h3>
                      <button v-if="notificationCount > 0" @click="notificationStore.markAllAsRead" class="text-xs text-blue-600 hover:underline font-bold">Tout marquer</button>
                    </div>

                    <div class="flex border-b text-center text-xs font-black uppercase tracking-tighter text-gray-500">
                      <button @click="activeTab = 'toutes'" :class="['flex-1 py-2 border-b-2 transition', activeTab === 'toutes' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent']">Toutes</button>
                      <button @click="activeTab = 'offres'" :class="['flex-1 py-2 border-b-2 transition', activeTab === 'offres' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent']">Offres</button>
                      <button @click="activeTab = 'messages'" :class="['flex-1 py-2 border-b-2 transition', activeTab === 'messages' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent']">Messages</button>
                    </div>

                    <div class="max-h-96 overflow-y-auto">
                      <div v-if="notificationStore.loading" class="p-8 text-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
                      <div v-else-if="filteredNotifications.length === 0" class="p-8 text-center text-gray-500 text-sm">Aucune notification ici</div>
                      <div v-else>
                        <div 
                          v-for="notif in filteredNotifications" 
                          :key="notif.id" 
                          @click="goToNotificationJournal"
                          class="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition group"
                        >
                          <div class="flex items-start gap-3">
                            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                              {{ notif.type === 'message' ? '💬' : '📅' }}
                            </div>
                            <div class="flex-1">
                              <p class="text-[10px] font-black uppercase text-blue-500 mb-1">{{ notif.category }}</p>
                              <p class="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition">{{ notif.title }}</p>
                              <p class="text-xs text-gray-700 mt-1 line-clamp-2">{{ notif.message }}</p>
                              <p class="text-[10px] text-gray-500 mt-1 italic">{{ notif.time }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="p-3 border-t text-center bg-gray-50">
                      <NuxtLink :to="fullJournalLink" @click="showNotifications = false" class="text-xs text-blue-600 font-bold hover:underline uppercase tracking-tighter">Voir tout le journal →</NuxtLink>
                    </div>
                  </div>
                </transition>
              </div>

              <div class="relative">
                <button @click.stop="toggleProfileMenu" class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition">
                  <span v-if="authStore.user?.profilePictureUrl" class="w-9 h-9 rounded-full bg-cover bg-center border-2 border-blue-500 shadow-sm" :style="`background-image: url('${authStore.user.profilePictureUrl}')`"></span>
                  <span v-else class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm uppercase border-2 border-blue-600">{{ getInitials() }}</span>
                </button>
                <transition enter-active-class="transition duration-150 ease-out" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100">
                  <div v-show="showProfileMenu" class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div class="p-4 border-b">
                      <p class="font-bold text-gray-900 text-sm truncate">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
                      <span class="inline-block mt-1 px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-100 text-blue-800 uppercase tracking-widest">{{ authStore.user?.role }}</span>
                    </div>
                    <div class="py-1">
                      <NuxtLink to="/profile" @click="showProfileMenu = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mon Profil</NuxtLink>
                      <NuxtLink v-if="authStore.isLawyer" to="/clients" @click="showProfileMenu = false" class="block px-4 py-2 text-sm text-blue-600 font-bold hover:bg-gray-50 border-t">Mes Clients</NuxtLink>
                      <NuxtLink v-if="authStore.isClient" to="/clients/requests" @click="showProfileMenu = false" class="block px-4 py-2 text-sm text-blue-600 font-bold hover:bg-gray-50 border-t">Mes Demandes</NuxtLink>
                      <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold border-t transition">Déconnexion</button>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()

const showProfileMenu = ref(false)
const showNotifications = ref(false)
const activeTab = ref('toutes')
let refreshInterval: any = null

const fullJournalLink = computed(() => authStore.isClient ? '/clients/notifications' : '/notifications')

const goToNotificationJournal = () => {
  showNotifications.value = false
  router.push(fullJournalLink.value)
}

// On utilise maintenant les données du store pour le filtrage
const filteredNotifications = computed(() => {
  const all = notificationStore.notifications
  if (activeTab.value === 'toutes') return all
  // On s'assure que le champ de filtrage correspond à celui du store
  return all.filter(n => n.type === activeTab.value || (activeTab.value === 'offres' && n.type === 'offer'))
})

const notificationCount = computed(() => notificationStore.unreadCount)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showProfileMenu.value = false
  if (showNotifications.value) notificationStore.fetchNotifications()
}

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
  showNotifications.value = false
}

const handleLogout = async () => {
  if (refreshInterval) clearInterval(refreshInterval)
  await authStore.logout()
}

const getInitials = () => {
  if (!authStore.user) return '?'
  return `${authStore.user.firstName?.charAt(0)}${authStore.user.lastName?.charAt(0)}`.toUpperCase()
}

watch(() => authStore.user, (newUser) => {
  if (newUser) notificationStore.fetchNotifications()
}, { immediate: true })

onMounted(() => {
  notificationStore.fetchNotifications()
  refreshInterval = setInterval(() => notificationStore.fetchNotifications(), 60000)
})

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>