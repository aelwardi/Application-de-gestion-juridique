# Guide d'Utilisation - API Appointments

Ce guide vous explique comment utiliser l'API Appointments dans votre application frontend.

## Table des matières

1. [Configuration](#configuration)
2. [Import du composable](#import-du-composable)
3. [Exemples d'utilisation](#exemples-dutilisation)
4. [Gestion des erreurs](#gestion-des-erreurs)
5. [Types TypeScript](#types-typescript)

---

## Configuration

L'API Appointments utilise le composable `useAppointment` qui gère automatiquement :
- L'authentification JWT
- Les appels API
- La gestion des erreurs
- Le typage TypeScript

**Base URL:** `http://localhost:5000/api/appointments`

---

## Import du composable

```typescript
import { useAppointment } from '~/composables/useAppointment'

const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByLawyer,
  getAppointmentsByClient,
  getAppointmentsByCase,
  getUpcomingAppointments,
  getTodayAppointments,
  getAppointmentStats,
  cancelAppointment,
  confirmAppointment,
  completeAppointment
} = useAppointment()
```

---

## Exemples d'utilisation

### 1. Créer un nouveau rendez-vous

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAppointment } from '~/composables/useAppointment'
import type { CreateAppointmentDTO } from '~/types/appointment'

const { createAppointment } = useAppointment()
const loading = ref(false)

const newAppointment: CreateAppointmentDTO = {
  lawyer_id: 'uuid-avocat',
  client_id: 'uuid-client',
  appointment_type: 'consultation',
  title: 'Consultation initiale',
  description: 'Première rencontre avec le client',
  start_time: new Date('2024-01-15T10:00:00Z'),
  end_time: new Date('2024-01-15T11:00:00Z'),
  location_type: 'office',
  location_address: '123 Rue de la Loi, Paris'
}

const handleCreateAppointment = async () => {
  loading.value = true
  try {
    const response = await createAppointment(newAppointment)
    if (response.success) {
      console.log('Rendez-vous créé:', response.data)
      // Redirection ou notification de succès
    }
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

---

### 2. Afficher les rendez-vous d'un avocat

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppointment } from '~/composables/useAppointment'
import type { AppointmentWithDetails } from '~/types/appointment'

const { getAppointmentsByLawyer } = useAppointment()
const appointments = ref<AppointmentWithDetails[]>([])
const loading = ref(false)

const loadAppointments = async (lawyerId: string) => {
  loading.value = true
  try {
    const response = await getAppointmentsByLawyer(lawyerId, {
      status: 'confirmed',
      limit: 10,
      page: 1
    })
    
    if (response.success && response.data) {
      appointments.value = response.data
    }
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const lawyerId = 'uuid-avocat'
  loadAppointments(lawyerId)
})
</script>

<template>
  <div>
    <div v-if="loading">Chargement...</div>
    <div v-else-if="appointments.length === 0">
      Aucun rendez-vous
    </div>
    <div v-else>
      <div v-for="appointment in appointments" :key="appointment.id">
        <h3>{{ appointment.title }}</h3>
        <p>{{ appointment.client_first_name }} {{ appointment.client_last_name }}</p>
        <p>{{ new Date(appointment.start_time).toLocaleDateString() }}</p>
        <span :class="`badge-${appointment.status}`">
          {{ appointment.status }}
        </span>
      </div>
    </div>
  </div>
</template>
```

---

### 3. Afficher les rendez-vous à venir (Dashboard)

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppointment } from '~/composables/useAppointment'
import { useAuthStore } from '~/stores/auth'

const { getUpcomingAppointments } = useAppointment()
const authStore = useAuthStore()
const upcomingAppointments = ref([])

onMounted(async () => {
  const lawyerId = authStore.user?.id
  if (lawyerId) {
    const response = await getUpcomingAppointments(lawyerId, { 
      limit: 5,
      days: 7  // Prochains 7 jours
    })
    
    if (response.success && response.data) {
      upcomingAppointments.value = response.data
    }
  }
})
</script>

<template>
  <div class="upcoming-appointments">
    <h2>Prochains Rendez-vous</h2>
    <div v-for="apt in upcomingAppointments" :key="apt.id" class="appointment-card">
      <div class="appointment-header">
        <h3>{{ apt.title }}</h3>
        <span class="badge">{{ apt.appointment_type }}</span>
      </div>
      <div class="appointment-details">
        <p>
          <strong>Client:</strong> 
          {{ apt.client_first_name }} {{ apt.client_last_name }}
        </p>
        <p>
          <strong>Date:</strong> 
          {{ new Date(apt.start_time).toLocaleString('fr-FR') }}
        </p>
        <p>
          <strong>Lieu:</strong> 
          {{ apt.location_type === 'office' ? 'Bureau' : 
             apt.location_type === 'court' ? 'Tribunal' : 
             apt.location_type === 'online' ? 'En ligne' : 
             apt.location_address }}
        </p>
      </div>
      <div class="appointment-actions">
        <button @click="confirmAppointment(apt.id)">Confirmer</button>
        <button @click="cancelAppointment(apt.id)">Annuler</button>
      </div>
    </div>
  </div>
</template>
```

---

### 4. Afficher les rendez-vous d'aujourd'hui

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppointment } from '~/composables/useAppointment'

const { getTodayAppointments } = useAppointment()
const todayAppointments = ref([])

const loadTodayAppointments = async (lawyerId: string) => {
  const response = await getTodayAppointments(lawyerId)
  if (response.success && response.data) {
    todayAppointments.value = response.data
  }
}

onMounted(() => {
  const lawyerId = 'uuid-avocat'
  loadTodayAppointments(lawyerId)
})
</script>

<template>
  <div class="today-appointments">
    <h2>Rendez-vous d'aujourd'hui ({{ todayAppointments.length }})</h2>
    <div v-if="todayAppointments.length === 0">
      Aucun rendez-vous aujourd'hui
    </div>
    <div v-else>
      <div v-for="apt in todayAppointments" :key="apt.id">
        <!-- Contenu du rendez-vous -->
      </div>
    </div>
  </div>
</template>
```

---

### 5. Obtenir les statistiques

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppointment } from '~/composables/useAppointment'

const { getAppointmentStats } = useAppointment()
const stats = ref({
  total: 0,
  today: 0,
  this_week: 0,
  this_month: 0,
  by_status: {},
  by_type: {}
})

const loadStats = async (lawyerId: string) => {
  const response = await getAppointmentStats(lawyerId)
  if (response.success && response.data) {
    stats.value = response.data
  }
}

onMounted(() => {
  const lawyerId = 'uuid-avocat'
  loadStats(lawyerId)
})
</script>

<template>
  <div class="stats-dashboard">
    <div class="stat-card">
      <h3>Total</h3>
      <p>{{ stats.total }}</p>
    </div>
    <div class="stat-card">
      <h3>Aujourd'hui</h3>
      <p>{{ stats.today }}</p>
    </div>
    <div class="stat-card">
      <h3>Cette Semaine</h3>
      <p>{{ stats.this_week }}</p>
    </div>
    <div class="stat-card">
      <h3>Ce Mois</h3>
      <p>{{ stats.this_month }}</p>
    </div>
  </div>
</template>
```

---

### 6. Mettre à jour un rendez-vous

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAppointment } from '~/composables/useAppointment'

const { updateAppointment } = useAppointment()

const handleUpdateAppointment = async (appointmentId: string) => {
  const updates = {
    title: 'Titre mis à jour',
    start_time: new Date('2024-01-20T14:00:00Z'),
    status: 'confirmed'
  }
  
  const response = await updateAppointment(appointmentId, updates)
  if (response.success) {
    console.log('Rendez-vous mis à jour:', response.data)
  }
}
</script>
```

---

### 7. Actions sur un rendez-vous (Confirmer/Annuler/Terminer)

```vue
<script setup lang="ts">
import { useAppointment } from '~/composables/useAppointment'

const { 
  confirmAppointment, 
  cancelAppointment, 
  completeAppointment 
} = useAppointment()

// Confirmer
const handleConfirm = async (appointmentId: string) => {
  const response = await confirmAppointment(appointmentId)
  if (response.success) {
    console.log('Rendez-vous confirmé')
  }
}

// Annuler
const handleCancel = async (appointmentId: string) => {
  const notes = 'Client indisponible'
  const response = await cancelAppointment(appointmentId, notes)
  if (response.success) {
    console.log('Rendez-vous annulé')
  }
}

// Terminer
const handleComplete = async (appointmentId: string) => {
  const notes = 'Réunion productive, prochaines étapes définies'
  const response = await completeAppointment(appointmentId, notes)
  if (response.success) {
    console.log('Rendez-vous terminé')
  }
}
</script>
```

---

### 8. Filtrer les rendez-vous

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAppointment } from '~/composables/useAppointment'
import type { AppointmentFilters } from '~/types/appointment'

const { getAllAppointments } = useAppointment()
const appointments = ref([])

const filters = ref<AppointmentFilters>({
  status: 'confirmed',
  appointment_type: 'consultation',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  search: 'consultation',
  page: 1,
  limit: 20
})

const loadFilteredAppointments = async () => {
  const response = await getAllAppointments(filters.value)
  if (response.success && response.data) {
    appointments.value = response.data
  }
}
</script>

<template>
  <div>
    <div class="filters">
      <select v-model="filters.status">
        <option value="">Tous les statuts</option>
        <option value="scheduled">Programmé</option>
        <option value="confirmed">Confirmé</option>
        <option value="completed">Terminé</option>
        <option value="cancelled">Annulé</option>
      </select>
      
      <select v-model="filters.appointment_type">
        <option value="">Tous les types</option>
        <option value="consultation">Consultation</option>
        <option value="tribunal">Tribunal</option>
        <option value="rencontre_client">Rencontre client</option>
      </select>
      
      <input 
        v-model="filters.search" 
        type="text" 
        placeholder="Rechercher..."
      />
      
      <button @click="loadFilteredAppointments">Filtrer</button>
    </div>
    
    <div class="appointments-list">
      <!-- Liste des rendez-vous -->
    </div>
  </div>
</template>
```

---

## Gestion des erreurs

Toutes les fonctions retournent un objet avec `success` et `error` :

```typescript
const response = await createAppointment(data)

if (response.success) {
  // Succès
  console.log(response.data)
  console.log(response.message) // Message de succès
} else {
  // Erreur
  console.error(response.error) // Message d'erreur
  // Afficher une notification d'erreur à l'utilisateur
}
```

**Exemples d'erreurs courantes:**
- `401` - Token JWT invalide ou expiré
- `404` - Rendez-vous non trouvé
- `400` - Données invalides (validation échouée)

---

## Types TypeScript

### AppointmentWithDetails

```typescript
interface AppointmentWithDetails {
  id: string
  case_id: string | null
  lawyer_id: string
  client_id: string
  appointment_type: AppointmentType
  title: string
  description: string | null
  start_time: Date
  end_time: Date
  location_type: AppointmentLocationType
  location_address: string | null
  location_latitude: number | null
  location_longitude: number | null
  meeting_url: string | null
  status: AppointmentStatus
  reminder_sent: boolean
  notes: string | null
  
  // Relations
  lawyer_first_name?: string
  lawyer_last_name?: string
  lawyer_email?: string
  client_first_name?: string
  client_last_name?: string
  client_email?: string
  case_number?: string
  case_title?: string
  
  created_at: Date
  updated_at: Date
}
```

### CreateAppointmentDTO

```typescript
interface CreateAppointmentDTO {
  case_id?: string
  lawyer_id: string
  client_id: string
  appointment_type: AppointmentType
  title: string
  description?: string
  start_time: Date
  end_time: Date
  location_type: AppointmentLocationType
  location_address?: string
  location_latitude?: number
  location_longitude?: number
  meeting_url?: string
  notes?: string
}
```

### AppointmentFilters

```typescript
interface AppointmentFilters {
  lawyer_id?: string
  client_id?: string
  case_id?: string
  status?: AppointmentStatus
  appointment_type?: AppointmentType
  location_type?: AppointmentLocationType
  start_date?: string
  end_date?: string
  search?: string
  page?: number
  limit?: number
}
```

---

## Labels et couleurs pour l'UI

Le fichier `types/appointment.ts` contient des helpers pour l'affichage :

```typescript
import { 
  AppointmentStatusLabels, 
  AppointmentStatusColors,
  AppointmentTypeLabels,
  AppointmentLocationTypeLabels 
} from '~/types/appointment'

// Dans votre template
const statusLabel = AppointmentStatusLabels['confirmed'] // "Confirmé"
const statusColor = AppointmentStatusColors['confirmed'] // "#10B981"
const typeLabel = AppointmentTypeLabels['consultation'] // "Consultation"
const locationLabel = AppointmentLocationTypeLabels['office'] // "Bureau"
```

---

## Bonnes pratiques

1. **Toujours vérifier `response.success`** avant d'utiliser les données
2. **Utiliser le typage TypeScript** pour éviter les erreurs
3. **Gérer les états de chargement** avec `loading.value`
4. **Afficher des messages d'erreur** à l'utilisateur en cas d'échec
5. **Rafraîchir la liste** après création/mise à jour/suppression
6. **Utiliser les filtres** pour optimiser les requêtes

---

## Intégration dans le Dashboard

Exemple complet d'intégration dans un dashboard avocat :

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAppointment } from '~/composables/useAppointment'

const authStore = useAuthStore()
const {
  getUpcomingAppointments,
  getTodayAppointments,
  getAppointmentStats
} = useAppointment()

const stats = ref({ today: 0, this_week: 0 })
const todayAppointments = ref([])
const upcomingAppointments = ref([])
const loading = ref(true)

const loadDashboard = async () => {
  const lawyerId = authStore.user?.id
  if (!lawyerId) return

  try {
    // Charger les statistiques
    const statsRes = await getAppointmentStats(lawyerId)
    if (statsRes.success) {
      stats.value = statsRes.data
    }

    // Charger les RDV d'aujourd'hui
    const todayRes = await getTodayAppointments(lawyerId)
    if (todayRes.success) {
      todayAppointments.value = todayRes.data
    }

    // Charger les prochains RDV
    const upcomingRes = await getUpcomingAppointments(lawyerId, { limit: 5 })
    if (upcomingRes.success) {
      upcomingAppointments.value = upcomingRes.data
    }
  } catch (error) {
    console.error('Erreur dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>
```

---

**Dernière mise à jour:** Décembre 2024
