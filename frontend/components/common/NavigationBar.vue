<script setup lang="ts">
interface NavLink {
  label: string;
  href: string;
}

interface Props {
  links?: NavLink[];
  badge?: string;
  variant?: 'default' | 'lawyer' | 'client';
}

const props = withDefaults(defineProps<Props>(), {
  links: () => [],
  badge: '',
  variant: 'default'
});

const mobileMenuOpen = ref(false);

const badgeClass = computed(() => {
  switch (props.variant) {
    case 'lawyer':
      return 'bg-primary-100 text-primary-700';
    case 'client':
      return 'bg-secondary-100 text-secondary-700';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
});

const ctaButtonClass = computed(() => {
  switch (props.variant) {
    case 'lawyer':
      return 'btn-primary';
    case 'client':
      return 'bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg';
    default:
      return 'btn-primary';
  }
});

watch(() => mobileMenuOpen.value, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>





<template>
  <nav class="bg-white/90 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">

        <NuxtLink to="/" class="flex items-center group">
          <div class="relative">
            <h1 class="text-2xl font-heading font-bold">
              <span class="text-primary-600 group-hover:text-primary-700 transition-colors">Lex</span>
              <span class="text-neutral-800 group-hover:text-neutral-900 transition-colors">Manager</span>
            </h1>
          </div>
          <span v-if="badge" class="ml-3 px-3 py-1 text-sm font-semibold rounded-full" :class="badgeClass">
            {{ badge }}
          </span>
        </NuxtLink>

        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div class="hidden md:flex items-center space-x-8">
          <a 
            v-for="link in links" 
            :key="link.href" 
            :href="link.href"
            class="text-neutral-600 hover:text-primary-600 font-medium transition-colors"
          >
            {{ link.label }}
          </a>
        </div>

        <div class="hidden md:flex items-center space-x-4">
          <NuxtLink to="/auth/login" class="btn-outline">
            Connexion
          </NuxtLink>
          <NuxtLink to="/auth/register" :class="ctaButtonClass">
            Inscription
          </NuxtLink>
        </div>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-neutral-200">
          <div class="space-y-2">
            <a 
              v-for="link in links" 
              :key="link.href" 
              :href="link.href"
              class="block px-4 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 rounded-lg font-medium transition-colors"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </a>
          </div>
          <div class="mt-4 pt-4 border-t border-neutral-200 space-y-2">
            <NuxtLink 
              to="/auth/login" 
              class="block text-center btn-outline"
              @click="mobileMenuOpen = false"
            >
              Connexion
            </NuxtLink>
            <NuxtLink 
              to="/auth/register" 
              :class="[ctaButtonClass, 'block text-center']"
              @click="mobileMenuOpen = false"
            >
              Inscription
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

