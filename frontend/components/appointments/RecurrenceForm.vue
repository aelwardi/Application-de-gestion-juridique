<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const isRecurring = ref(false)
const endType = ref<'never' | 'on' | 'after'>('after')

const recurrence = ref({
  frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
  interval: 1,
  daysOfWeek: [] as number[],
  endDate: undefined as string | undefined,
  occurrences: 10
})

const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

watch(isRecurring, (value) => {
  if (value) {
    emit('update:modelValue', recurrence.value)
  } else {
    emit('update:modelValue', null)
  }
})

watch(recurrence, (value) => {
  if (isRecurring.value) {
    const cleaned = { ...value }
    if (endType.value === 'never' || endType.value === 'after') {
      cleaned.endDate = undefined
    }
    if (endType.value === 'never' || endType.value === 'on') {
      cleaned.occurrences = undefined
    }
    emit('update:modelValue', cleaned)
  }
}, { deep: true })

const toggleDay = (dayIndex: number) => {
  const index = recurrence.value.daysOfWeek.indexOf(dayIndex)
  if (index > -1) {
    recurrence.value.daysOfWeek.splice(index, 1)
  } else {
    recurrence.value.daysOfWeek.push(dayIndex)
  }
}

const getFrequencyLabel = () => {
  const labels = {
    daily: 'jour(s)',
    weekly: 'semaine(s)',
    monthly: 'mois'
  }
  return labels[recurrence.value.frequency]
}

const getSummary = () => {
  let summary = `Se répète tous les ${recurrence.value.interval} ${getFrequencyLabel()}`

  if (recurrence.value.frequency === 'weekly' && recurrence.value.daysOfWeek.length > 0) {
    const days = recurrence.value.daysOfWeek
        .sort()
        .map(i => daysOfWeek[i])
        .join(', ')
    summary += ` le ${days}`
  }

  if (endType.value === 'on' && recurrence.value.endDate) {
    summary += ` jusqu'au ${new Date(recurrence.value.endDate).toLocaleDateString('fr-FR')}`
  } else if (endType.value === 'after' && recurrence.value.occurrences) {
    summary += ` pour ${recurrence.value.occurrences} occurrence(s)`
  }

  return summary
}
</script>






<template>
  <div class="space-y-4 border-t pt-4 mt-4">
    <div class="flex items-center gap-2">
      <input
        type="checkbox"
        id="enable-recurrence"
        v-model="isRecurring"
        class="w-4 h-4 text-blue-600 rounded"
      />
      <label for="enable-recurrence" class="text-sm font-medium text-gray-700">
        Répéter ce rendez-vous
      </label>
    </div>

    <div v-if="isRecurring" class="space-y-4 pl-6 border-l-2 border-blue-200">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
        <select
          v-model="recurrence.frequency"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Quotidien</option>
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuel</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Répéter tous les {{ recurrence.interval }} {{ getFrequencyLabel() }}
        </label>
        <input
          type="number"
          v-model.number="recurrence.interval"
          min="1"
          max="30"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div v-if="recurrence.frequency === 'weekly'">
        <label class="block text-sm font-medium text-gray-700 mb-2">Jours de la semaine</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(day, index) in daysOfWeek"
            :key="index"
            type="button"
            @click="toggleDay(index)"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              recurrence.daysOfWeek?.includes(index)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Se termine</label>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="end-never"
              value="never"
              v-model="endType"
              class="w-4 h-4 text-blue-600"
            />
            <label for="end-never" class="text-sm text-gray-700">Jamais</label>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="end-on"
              value="on"
              v-model="endType"
              class="w-4 h-4 text-blue-600"
            />
            <label for="end-on" class="text-sm text-gray-700">Le</label>
            <input
              type="date"
              v-model="recurrence.endDate"
              :disabled="endType !== 'on'"
              class="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            />
          </div>

          <div class="flex items-center gap-2">
            <input
              type="radio"
              id="end-after"
              value="after"
              v-model="endType"
              class="w-4 h-4 text-blue-600"
            />
            <label for="end-after" class="text-sm text-gray-700">Après</label>
            <input
              type="number"
              v-model.number="recurrence.occurrences"
              :disabled="endType !== 'after'"
              min="1"
              max="100"
              class="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            />
            <span class="text-sm text-gray-700">occurrence(s)</span>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-sm text-blue-900 font-medium mb-1">Résumé</p>
        <p class="text-sm text-blue-700">{{ getSummary() }}</p>
      </div>
    </div>
  </div>
</template>

