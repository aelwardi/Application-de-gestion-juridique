<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Statistiques visuelles
      </h3>
      <button
        @click="isExpanded = !isExpanded"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          class="w-5 h-5 text-gray-500 transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isExpanded" class="space-y-6 overflow-hidden">
        <!-- Répartition par statut -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Répartition par statut</h4>
          <div class="space-y-3">
            <div
              v-for="status in statusStats"
              :key="status.key"
              class="group"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span
                    class="w-3 h-3 rounded-full"
                    :class="status.color"
                  ></span>
                  <span class="text-sm font-medium text-gray-700">{{ status.label }}</span>
                </div>
                <span class="text-sm font-bold text-gray-900">
                  {{ status.count }} ({{ status.percentage }}%)
                </span>
              </div>
              <div class="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
                  :class="status.bgColor"
                  :style="{ width: `${status.percentage}%` }"
                >
                  <div
                    class="absolute inset-0 opacity-50 animate-pulse"
                    :class="status.bgColor"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Répartition par priorité -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Répartition par priorité</h4>
          <div class="space-y-3">
            <div
              v-for="priority in priorityStats"
              :key="priority.key"
              class="group"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ priority.emoji }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ priority.label }}</span>
                </div>
                <span class="text-sm font-bold text-gray-900">
                  {{ priority.count }} ({{ priority.percentage }}%)
                </span>
              </div>
              <div class="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
                  :class="priority.bgColor"
                  :style="{ width: `${priority.percentage}%` }"
                >
                  <div
                    class="absolute inset-0 opacity-50 animate-pulse"
                    :class="priority.bgColor"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Résumé rapide -->
        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <p class="text-2xl font-bold text-blue-600">{{ completionRate }}%</p>
            <p class="text-xs text-gray-600 mt-1">Taux de résolution</p>
          </div>
          <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
            <p class="text-2xl font-bold text-orange-600">{{ urgentCount }}</p>
            <p class="text-xs text-gray-600 mt-1">Dossiers urgents</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  cases: any[];
}

const props = defineProps<Props>();
const isExpanded = ref(false);

const statusStats = computed(() => {
  const total = props.cases.length || 1;
  const statuses = [
    { key: 'pending', label: 'En attente', color: 'bg-yellow-500', bgColor: 'bg-yellow-500' },
    { key: 'in_progress', label: 'En cours', color: 'bg-indigo-500', bgColor: 'bg-indigo-500' },
    { key: 'on_hold', label: 'En pause', color: 'bg-gray-500', bgColor: 'bg-gray-500' },
    { key: 'closed', label: 'Fermé', color: 'bg-green-500', bgColor: 'bg-green-500' },
  ];

  return statuses.map(status => {
    const count = props.cases.filter(c => c.status === status.key).length;
    return {
      ...status,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });
});

const priorityStats = computed(() => {
  const total = props.cases.length || 1;
  const priorities = [
    { key: 'urgent', label: 'Urgente', emoji: '🔴', bgColor: 'bg-red-500' },
    { key: 'high', label: 'Élevée', emoji: '🟠', bgColor: 'bg-orange-500' },
    { key: 'medium', label: 'Moyenne', emoji: '🟡', bgColor: 'bg-yellow-500' },
    { key: 'low', label: 'Faible', emoji: '🟢', bgColor: 'bg-green-500' },
  ];

  return priorities.map(priority => {
    const count = props.cases.filter(c => c.priority === priority.key).length;
    return {
      ...priority,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });
});

const completionRate = computed(() => {
  const total = props.cases.length || 1;
  const closed = props.cases.filter(c => c.status === 'closed').length;
  return Math.round((closed / total) * 100);
});

const urgentCount = computed(() => {
  return props.cases.filter(c => c.priority === 'urgent').length;
});
</script>
