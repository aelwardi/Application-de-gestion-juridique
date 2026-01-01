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
            <div class="flex items-center space-x-3">
              <div class="relative">
                <button
                  @click.stop="toggleNotifications"
                  type="button"
                  class="relative p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                  :class="{ 'bg-blue-50 text-blue-600 border-blue-200': showNotifications }"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span
                    v-if="notificationCount > 0"
                    class="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse"
                  >
                    {{ notificationCount > 9 ? '9+' : notificationCount }}
                  </span>
                </button>

                <transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-show="showNotifications"
                    class="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                    @click.stop
                  >
                    <div class="p-4 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between">
                      <h3 class="font-bold text-white text-lg flex items-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                        Notifications
                      </h3>
                      <button
                        v-if="notificationCount > 0"
                        @click="markAllAsRead"
                        class="text-sm text-white hover:text-blue-100 font-medium underline hover:no-underline transition"
                      >
                        Tout marquer
                      </button>
                    </div>

                    <div class="max-h-[500px] overflow-y-auto custom-scrollbar">
                      <div v-if="loadingNotifications" class="p-8 text-center">
                        <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                        <p class="text-sm text-gray-500 mt-3">Chargement...</p>
                      </div>

                      <div v-else-if="notificationsList.length === 0" class="p-12 text-center">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p class="text-sm text-gray-500 font-medium">Aucune notification</p>
                        <p class="text-xs text-gray-400 mt-1">Vous êtes à jour !</p>
                      </div>

                      <div v-else>
                        <div
                          v-for="notif in notificationsList.slice(0, 8)"
                          :key="notif.id"
                          @click="handleNotificationClick(notif)"
                          class="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-all duration-150 group relative"
                          :class="!notif.is_read ? 'bg-blue-50/50' : ''"
                        >
                          <div class="flex items-start gap-3">
                            <div
                              :class="['flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform', getNotificationColor(notif.type)]"
                            >
                              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-bold text-gray-900">{{ notif.title }}</p>
                              <p class="text-sm text-gray-600 line-clamp-2">{{ notif.message }}</p>
                              <p class="text-xs text-gray-400 mt-1">{{ formatNotificationTime(notif.created_at) }}</p>
                            </div>
                            <div v-if="!notif.is_read" class="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2 shadow-md"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="p-3 bg-gray-50 border-t border-gray-200 text-center">
                      <NuxtLink
                        to="/notifications"
                        @click="showNotifications = false"
                        class="text-sm text-blue-600 font-bold hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition"
                      >
                        Voir toutes les notifications
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </NuxtLink>
                    </div>
                  </div>
                </transition>
              </div>

              <div class="relative">
                <button
                  @click.stop="toggleProfileMenu"
                  class="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 border-2 border-transparent hover:border-gray-200"
                  :class="{ 'bg-gray-100 border-gray-200': showProfileMenu }"
                >
                  <span
                    v-if="authStore.user?.profilePictureUrl"
                    class="block w-10 h-10 rounded-full bg-cover bg-center border-2 border-blue-500 shadow-sm"
                    :style="`background-image: url('${authStore.user.profilePictureUrl}')`"
                  ></span>
                  <span
                    v-else
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 inline-flex items-center justify-center text-white font-bold text-sm shadow-md uppercase"
                  >
                    {{ getInitials() }}
                  </span>
                  <svg
                    class="w-4 h-4 text-gray-500 transition-transform duration-200"
                    :class="{ 'rotate-180': showProfileMenu }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div v-show="showProfileMenu" class="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div class="p-4 bg-gradient-to-r from-blue-500 to-blue-600">
                      <div class="flex items-center gap-3">
                        <span
                          v-if="authStore.user?.profilePictureUrl"
                          class="block w-12 h-12 rounded-full bg-cover bg-center border-2 border-white shadow-md"
                          :style="`background-image: url('${authStore.user.profilePictureUrl}')`"
                        ></span>
                        <span
                          v-else
                          class="w-12 h-12 rounded-full bg-white inline-flex items-center justify-center text-blue-600 font-bold shadow-md uppercase"
                        >
                          {{ getInitials() }}
                        </span>
                        <div class="flex-1 min-w-0">
                          <p class="font-bold text-white truncate">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
                          <p class="text-sm text-blue-100 truncate">{{ authStore.user?.email }}</p>
                        </div>
                      </div>
                      <span class="inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full bg-white/20 text-white uppercase backdrop-blur-sm">
                        {{ authStore.user?.role }}
                      </span>
                    </div>

                    <div class="py-2">
                      <NuxtLink
                        to="/profile"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition group"
                      >
                        <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span class="font-medium">Mon Profil</span>
                      </NuxtLink>

                      <NuxtLink
                        v-if="authStore.isClient"
                        to="/clients/requests"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-t group"
                      >
                        <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span class="font-medium text-blue-600">Mes Demandes</span>
                      </NuxtLink>

                      <NuxtLink
                        v-if="authStore.isLawyer"
                        to="/clients"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-t group"
                      >
                        <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span class="font-medium">Mes Clients</span>
                      </NuxtLink>

                      <button
                        @click="handleLogout"
                        class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold border-t transition group"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
  
  const id1 = authStore.user.id
  const id2 = authStore.user.lawyerId

  try {
    const [offers1, offers2] = await Promise.all([
      getPendingOffers(id1),
      id2 ? getPendingOffers(id2) : Promise.resolve([])
    ])

    const data1 = Array.isArray(offers1) ? offers1 : ((offers1 as any)?.data || [])
    const data2 = Array.isArray(offers2) ? offers2 : ((offers2 as any)?.data || [])

    const allOffers = [...data1, ...data2]
    
    const uniqueMap = new Map()
    allOffers.forEach(o => uniqueMap.set(o.id, o))
    
    const sortedOffers = Array.from(uniqueMap.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

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

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showNotifications.value = false
    showProfileMenu.value = false
  }
}

onMounted(() => {
  loadNotifications()
  setInterval(loadNotifications, 60000)

  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>