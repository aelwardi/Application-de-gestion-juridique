<template>
  <div class="h-full w-full">
    <div id="appointment-map" class="h-full w-full rounded-lg shadow-lg"></div>

    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement de la carte...</p>
      </div>
    </div>

    <!-- Map controls -->
    <div class="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
      <button
        @click="centerOnUser"
        class="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        title="Me localiser"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Ma position
      </button>

      <button
        @click="fitAllMarkers"
        class="w-full px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        title="Voir tous les rendez-vous"
      >
        Tout afficher
      </button>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
      <h4 class="font-semibold text-gray-900 mb-2 text-sm">Légende</h4>
      <div class="space-y-1 text-xs">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Consultation</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-red-600"></div>
          <span>Tribunal</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-green-600"></div>
          <span>Client</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-purple-600"></div>
          <span>Téléconférence</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-gray-600"></div>
          <span>Autre</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  appointments: any[]
  selectedAppointmentId?: string
}>()

const emit = defineEmits<{
  selectAppointment: [id: string]
}>()

const loading = ref(true)
let map: L.Map | null = null
const markers: L.Marker[] = []

onMounted(() => {
  initMap()
})

watch(() => props.appointments, () => {
  updateMarkers()
}, { deep: true })

watch(() => props.selectedAppointmentId, (newId) => {
  if (newId) {
    highlightMarker(newId)
  }
})

const initMap = () => {
  try {
    // Initialiser la carte centrée sur Paris par défaut
    map = L.map('appointment-map').setView([48.8566, 2.3522], 12)

    // Ajouter le layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Ajouter les marqueurs
    updateMarkers()

    loading.value = false
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la carte:', error)
    loading.value = false
  }
}

const updateMarkers = () => {
  if (!map) return

  // Supprimer les anciens marqueurs
  markers.forEach(marker => marker.remove())
  markers.length = 0

  // Ajouter les nouveaux marqueurs
  props.appointments.forEach(appointment => {
    if (appointment.location_latitude && appointment.location_longitude) {
      const marker = createMarker(appointment)
      markers.push(marker)
    }
  })

  // Ajuster la vue pour afficher tous les marqueurs
  if (markers.length > 0) {
    fitAllMarkers()
  }
}

const createMarker = (appointment: any) => {
  const lat = parseFloat(appointment.location_latitude)
  const lng = parseFloat(appointment.location_longitude)

  // Couleur selon le type
  const color = getAppointmentColor(appointment.appointment_type)

  // Créer l'icône personnalisée
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-center: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
      ">${getAppointmentIcon(appointment.appointment_type)}</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  const marker = L.marker([lat, lng], { icon })
    .addTo(map!)
    .bindPopup(createPopupContent(appointment))
    .on('click', () => {
      emit('selectAppointment', appointment.id)
    })

  return marker
}

const createPopupContent = (appointment: any) => {
  const time = new Date(appointment.start_time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <div class="p-2 min-w-[200px]">
      <div class="font-bold text-gray-900 mb-1">${appointment.title}</div>
      <div class="text-sm text-gray-600 space-y-1">
        <div>🕐 ${time}</div>
        <div>📍 ${appointment.location_address || 'Adresse non spécifiée'}</div>
        <div>👤 ${appointment.client_first_name} ${appointment.client_last_name}</div>
      </div>
      <button
        onclick="window.dispatchEvent(new CustomEvent('view-appointment', {detail: '${appointment.id}'}))"
        class="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Voir détails
      </button>
    </div>
  `
}

const getAppointmentColor = (type: string): string => {
  const colors: Record<string, string> = {
    consultation: '#2563eb', // blue-600
    tribunal: '#dc2626', // red-600
    client_meeting: '#16a34a', // green-600
    teleconference: '#9333ea', // purple-600
    expertise: '#ea580c', // orange-600
    other: '#4b5563' // gray-600
  }
  return colors[type] || colors.other
}

const getAppointmentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    consultation: '📋',
    tribunal: '⚖️',
    client_meeting: '👤',
    teleconference: '💻',
    expertise: '🔍',
    other: '📌'
  }
  return icons[type] || icons.other
}

const highlightMarker = (appointmentId: string) => {
  // Trouver le rendez-vous correspondant
  const appointment = props.appointments.find(a => a.id === appointmentId)
  if (!appointment || !appointment.location_latitude || !appointment.location_longitude) return

  // Centrer la carte sur le marqueur
  const lat = parseFloat(appointment.location_latitude)
  const lng = parseFloat(appointment.location_longitude)
  map?.setView([lat, lng], 15, { animate: true })

  // Trouver et ouvrir le popup du marqueur
  const markerIndex = props.appointments.findIndex(a => a.id === appointmentId)
  if (markerIndex !== -1 && markers[markerIndex]) {
    markers[markerIndex].openPopup()
  }
}

const centerOnUser = () => {
  if (!navigator.geolocation) {
    alert('La géolocalisation n\'est pas supportée par votre navigateur')
    return
  }

  loading.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      map?.setView([lat, lng], 13, { animate: true })

      // Ajouter un marqueur pour la position de l'utilisateur
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'user-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #3b82f6;
              border: 3px solid white;
              box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map!).bindPopup('Vous êtes ici')

      loading.value = false
    },
    (error) => {
      console.error('Erreur de géolocalisation:', error)
      alert('Impossible de récupérer votre position')
      loading.value = false
    }
  )
}

const fitAllMarkers = () => {
  if (!map || markers.length === 0) return

  const group = L.featureGroup(markers)
  map.fitBounds(group.getBounds(), { padding: [50, 50] })
}

// Event listener pour les clics depuis les popups
if (process.client) {
  window.addEventListener('view-appointment', (e: any) => {
    emit('selectAppointment', e.detail)
  })
}
</script>

<style scoped>
#appointment-map {
  position: relative;
}

/* Fix pour les icônes Leaflet */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  padding: 0;
}

:deep(.leaflet-popup-content) {
  margin: 0;
}

:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}
</style>

