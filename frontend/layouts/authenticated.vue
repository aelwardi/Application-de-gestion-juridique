<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="authStore.isAdmin" class="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <NuxtLink to="/admin/stats" class="text-xl font-bold text-white flex items-center">
              <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
              Back Office Admin
            </NuxtLink>
            <ClientOnly>
              <div class="hidden md:flex space-x-2">
                <NuxtLink to="/admin/stats" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition">Dashboard</NuxtLink>
                <NuxtLink to="/admin/users" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition">Utilisateurs</NuxtLink>
                <NuxtLink to="/admin/support" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition">Support</NuxtLink>
                <NuxtLink to="/admin/logs" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition">Logs</NuxtLink>
                <NuxtLink to="/admin/create-admin" class="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition">Créer Admin</NuxtLink>
              </div>
            </ClientOnly>
          </div>
          <ClientOnly>
            <div class="flex items-center space-x-4">
              <span v-if="authStore.user" class="text-sm text-white font-medium">{{ authStore.fullName }}</span>
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-purple-900">👑 ADMIN</span>
              <button @click="handleLogout" class="px-4 py-2 text-sm font-medium text-purple-700 bg-white hover:bg-gray-100 rounded-md transition">Déconnexion</button>
            </div>
          </ClientOnly>
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
                <NuxtLink to="/appointments" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Rendez-vous</NuxtLink>
                <NuxtLink v-if="authStore.isClient" to="/lawyers" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Avocats</NuxtLink>
                <NuxtLink to="/messages" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Messages</NuxtLink>
                <NuxtLink to="/documents" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Documents</NuxtLink>
              </div>
            </ClientOnly>
          </div>

          <ClientOnly>
            <div class="flex items-center space-x-4">
               <div class="relative">
                <button
                  @click.stop="toggleNotifications"
                  type="button"
                  class="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>

                  <span
                    v-if="notificationCount > 0"
                    class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
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
                    class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    @click.stop
                  >
                    <!-- Header -->
                    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 class="font-semibold text-gray-900">Notifications</h3>
                      <button
                        v-if="notificationCount > 0"
                        @click="markAllAsRead"
                        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Tout marquer comme lu
                      </button>
                    </div>

                    <div class="max-h-96 overflow-y-auto">
                      <div v-if="loadingNotifications" class="p-8 text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>

                      <div v-else-if="notificationsList.length === 0" class="p-8 text-center text-gray-500">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clip-rule="evenodd" />
                        </svg>
                        <p class="mt-2 text-sm">Aucune notification</p>
                      </div>

                      <div v-else>
                        <div
                          v-for="notif in notificationsList.slice(0, 5)"
                          :key="notif.id"
                          @click="handleNotificationClick(notif)"
                          :class="[
                            'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                            !notif.is_read ? 'bg-blue-50' : ''
                          ]"
                        >
                          <div class="flex items-start gap-3">
                            <div
                              :class="[
                                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                                getNotificationColor(notif.type)
                              ]"
                            >
                              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                              </svg>
                            </div>

                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-gray-900">{{ notif.title }}</p>
                              <p class="text-sm text-gray-600 truncate">{{ notif.message }}</p>
                              <p class="text-xs text-gray-500 mt-1">{{ formatNotificationTime(notif.created_at) }}</p>
                            </div>

                            <div v-if="!notif.is_read" class="flex-shrink-0">
                              <span class="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="p-4 border-t border-gray-200">
                      <NuxtLink
                        to="/notifications"
                        @click="showNotifications = false"
                        class="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
                      >
                        Voir toutes les notifications →
                      </NuxtLink>
                    </div>
                  </div>
                </transition>
              </div>

              <div class="relative">
                <button
                  @click.stop="toggleProfileMenu"
                  type="button"
                  class="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span
                    v-if="authStore.user?.profilePictureUrl"
                    class="block w-10 h-10 rounded-full bg-cover bg-center border-2 border-blue-500"
                    :style="`background-image: url('${authStore.user.profilePictureUrl}')`"
                  ></span>
                  <span
                    v-else
                    class="w-10 h-10 rounded-full bg-blue-500 inline-flex items-center justify-center text-white font-semibold border-2 border-blue-600"
                  >
                    {{ getInitials() }}
                  </span>
                  <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
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
                  <div
                    v-show="showProfileMenu"
                    class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    @click.stop
                  >
                    <div class="p-4 border-b border-gray-200">
                      <div class="flex items-center gap-3">
                        <span
                          v-if="authStore.user?.profilePictureUrl"
                          class="block w-12 h-12 rounded-full bg-cover bg-center"
                          :style="`background-image: url('${authStore.user.profilePictureUrl}')`"
                        ></span>
                        <span
                          v-else
                          class="w-12 h-12 rounded-full bg-blue-500 inline-flex items-center justify-center text-white font-semibold text-lg"
                        >
                          {{ getInitials() }}
                        </span>
                        <div class="flex-1">
                          <p class="font-semibold text-gray-900">{{ authStore.fullName }}</p>
                          <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
                          <span v-if="roleLabel" class="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {{ roleLabel }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="py-2">
                      <NuxtLink
                        to="/profile"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                        <span class="flex-1">
                          <span class="block text-sm font-medium text-gray-900">Mon Profil</span>
                          <span class="block text-xs text-gray-500">Gérer mes informations</span>
                        </span>
                      </NuxtLink>

                      <NuxtLink
                        v-if="authStore.isClient"
                        to="/clients/requests"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                        </svg>
                        <span class="flex-1">
                          <span class="block text-sm font-medium text-gray-900">Mes Demandes</span>
                          <span class="block text-xs text-gray-500">Demandes aux avocats</span>
                        </span>
                      </NuxtLink>

                      <NuxtLink
                        v-if="authStore.isLawyer"
                        to="/clients"
                        @click="showProfileMenu = false"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span class="flex-1">
                          <span class="block text-sm font-medium text-gray-900">Mes Clients</span>
                          <span class="block text-xs text-gray-500">Gérer mes clients</span>
                        </span>
                      </NuxtLink>
                    </div>

                    <div class="border-t border-gray-200 py-2">
                      <button
                        type="button"
                        @click="handleLogout"
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                        </svg>
                        <span class="flex-1">
                          <span class="block text-sm font-medium text-red-600">Déconnexion</span>
                          <span class="block text-xs text-gray-500">Se déconnecter du compte</span>
                        </span>
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

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const showProfileMenu = ref(false);
const showNotifications = ref(false);
const loadingNotifications = ref(false);
const notificationsList = ref<any[]>([]);

const notificationCount = computed(() => notificationsList.value.filter(n => !n.is_read).length);

const roleLabel = computed(() => {
  if (!authStore.user) return '';
  const roles: Record<string, string> = {
    admin: 'Administrateur',
    avocat: 'Avocat',
    client: 'Client',
    collaborateur: 'Collaborateur',
  };
  return roles[authStore.user.role] || authStore.user.role;
});

const getInitials = () => {
  if (!authStore.user) return '?';
  return `${authStore.user.firstName.charAt(0)}${authStore.user.lastName.charAt(0)}`.toUpperCase();
};

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value;
  showNotifications.value = false; // Close notifications when opening profile
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showProfileMenu.value = false; // Close profile when opening notifications
  if (showNotifications.value && notificationsList.value.length === 0) {
    loadNotifications();
  }
};

const loadNotifications = async () => {
  loadingNotifications.value = true;

  setTimeout(() => {
    notificationsList.value = [
      {
        id: '1',
        type: 'appointment',
        title: 'Rappel de rendez-vous',
        message: 'Rendez-vous demain à 10h00 avec Me. Dupont',
        created_at: new Date('2025-12-22T09:00:00'),
        is_read: false,
      },
      {
        id: '2',
        type: 'message',
        title: 'Nouveau message',
        message: 'Marie Martin vous a envoyé un message',
        created_at: new Date('2025-12-22T08:30:00'),
        is_read: false,
      },
      {
        id: '3',
        type: 'case',
        title: 'Mise à jour dossier',
        message: 'Le dossier "Divorce Dupont" a été mis à jour',
        created_at: new Date('2025-12-21T15:00:00'),
        is_read: true,
      },
    ];
    loadingNotifications.value = false;
  }, 500);
};

const markAllAsRead = () => {
  notificationsList.value.forEach(n => n.is_read = true);
};

const handleNotificationClick = (notif: any) => {
  notif.is_read = true;
  showNotifications.value = false;
  // Navigate to notification detail if needed
  if (notif.url) {
    navigateTo(notif.url);
  }
};

const formatNotificationTime = (date: Date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return notifDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
};

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    appointment: 'bg-blue-500',
    message: 'bg-green-500',
    case: 'bg-purple-500',
    document: 'bg-orange-500',
    payment: 'bg-teal-500',
  };
  return colors[type] || 'bg-gray-500';
};

const handleLogout = async () => {
  showProfileMenu.value = false;
  showNotifications.value = false;
  await authStore.logout();
};

onMounted(() => {
  document.addEventListener('click', () => {
    if (showProfileMenu.value) {
      showProfileMenu.value = false;
    }
    if (showNotifications.value) {
      showNotifications.value = false;
    }
  });

  loadNotifications();

  setInterval(() => {
    loadNotifications();
  }, 30000);
});
</script>