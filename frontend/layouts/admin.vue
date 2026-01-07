<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/admin/stats" class="text-xl font-bold text-white flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Back Office Admin
            </NuxtLink>
          </div>
          <ClientOnly>
            <div class="flex items-center space-x-4">
              <span v-if="authStore.user" class="text-sm text-white font-medium">{{ authStore.fullName }}</span>
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-purple-900">
                ADMIN
              </span>
              <button
                @click="handleLogout"
                class="px-4 py-2 text-sm font-medium text-purple-700 bg-white hover:bg-gray-100 rounded-md transition"
              >
                Déconnexion
              </button>
            </div>
          </ClientOnly>
        </div>
      </div>
    </nav>

    <div class="flex">
      <aside class="w-64 bg-white shadow-lg min-h-screen flex flex-col">
        <nav class="mt-5 px-2 flex-1 overflow-y-auto">
          <NuxtLink
            to="/admin/stats"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-purple-50 hover:text-purple-700 transition"
            :class="$route.path === '/admin/stats' ? 'bg-purple-100 text-purple-700' : 'text-gray-700'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NuxtLink>

          <NuxtLink
            to="/admin/users"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-purple-50 hover:text-purple-700 transition"
            :class="$route.path.startsWith('/admin/users') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Utilisateurs
          </NuxtLink>

          <NuxtLink
            to="/admin/lawyers"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-purple-50 hover:text-purple-700 transition"
            :class="$route.path.startsWith('/admin/lawyers') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Avocats
          </NuxtLink>


          <NuxtLink
            to="/admin/reviews"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-purple-50 hover:text-purple-700 transition"
            :class="$route.path.startsWith('/admin/reviews') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Avis clients
          </NuxtLink>

          <NuxtLink
            to="/admin/support"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-purple-50 hover:text-purple-700 transition"
            :class="$route.path.startsWith('/admin/support') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support Tickets
          </NuxtLink>

          <NuxtLink
            to="/admin/logs"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-purple-50 hover:text-purple-700 transition"
            :class="$route.path === '/admin/logs' ? 'bg-purple-100 text-purple-700' : 'text-gray-700'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Journaux d'Activité
          </NuxtLink>

          <div class="border-t border-gray-200 my-3"></div>

          <NuxtLink
            to="/admin/create-admin"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-green-50 hover:text-green-700 transition"
            :class="$route.path === '/admin/create-admin' ? 'bg-green-100 text-green-700' : 'text-gray-700'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Créer Admin
          </NuxtLink>

          <div class="border-t border-gray-200 my-3"></div>

          <div class="px-3 py-2">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Paramètres
            </p>
          </div>

          <NuxtLink
            to="/profile"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-gray-50 text-gray-700 transition"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mon Profil
          </NuxtLink>

          <NuxtLink
            to="/profile/change-password"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 hover:bg-gray-50 text-gray-700 transition"
          >
            <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Changer mot de passe
          </NuxtLink>
        </nav>

        <div class="mt-auto pt-4">
          <div class="bg-purple-50 rounded-lg p-3 relative z-0">
            <p class="text-xs text-purple-700 font-medium">Version 1.0.0</p>
            <p class="text-xs text-gray-500 mt-1">© 2025 Back Office</p>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-x-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  navigateTo('/auth/login');
};
</script>