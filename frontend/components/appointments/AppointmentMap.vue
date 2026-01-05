<template>
  <div class="h-full w-full relative">
    <div id="appointment-map" class="h-full w-full rounded-lg shadow-lg"></div>

    <!-- No markers message -->
    <div v-if="!loading && props.appointments.length > 0 && markers.length === 0" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-lg z-50">
      <div class="text-center p-8 max-w-lg">
        <svg class="w-20 h-20 text-blue-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">Aucun rendez-vous géolocalisé</h3>
        <p class="text-gray-600 mb-6">
          Les rendez-vous doivent avoir une adresse géolocalisée pour apparaître sur la carte.
        </p>

        <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-left">
          <h4 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span class="text-xl">💡</span>
            Pour ajouter une adresse géolocalisée :
          </h4>
          <ol class="space-y-2 text-sm text-blue-800">
            <li class="flex items-start gap-2">
              <span class="font-bold min-w-[24px]">1.</span>
              <span>Éditez un rendez-vous existant</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold min-w-[24px]">2.</span>
              <span>Tapez une adresse dans le champ prévu</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold min-w-[24px]">3.</span>
              <span><strong>Sélectionnez une suggestion</strong> dans la liste déroulante</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold min-w-[24px]">4.</span>
              <span>Vérifiez que l'encadré vert <strong>"✓ Adresse géolocalisée"</strong> apparaît</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-bold min-w-[24px]">5.</span>
              <span>Enregistrez le rendez-vous</span>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement de la carte...</p>
      </div>
    </div>

    <!-- Map controls -->
    <div class="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2 z-[1000]">
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
    <div class="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
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
          <span>Réunion</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-purple-600"></div>
          <span>Téléphone</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-orange-600"></div>
          <span>Visioconférence</span>
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

// Fix pour les icônes par défaut de Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

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
    console.log('🗺️ Initialisation de la carte Leaflet...');
    console.log('📦 Leaflet version:', L.version);

    const mapElement = document.getElementById('appointment-map');
    if (!mapElement) {
      console.error('❌ Élément #appointment-map introuvable !');
      loading.value = false;
      return;
    }

    console.log('✅ Élément DOM trouvé:', mapElement);

    // Initialiser la carte centrée sur Paris par défaut
    map = L.map('appointment-map').setView([48.8566, 2.3522], 12)
    console.log('✅ Carte initialisée');

    // Ajouter le layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)
    console.log('✅ Tuiles OSM ajoutées');

    // Ajouter les marqueurs
    console.log(`🎯 Ajout des marqueurs pour ${props.appointments.length} rendez-vous`);
    updateMarkers()

    loading.value = false
    console.log('✅ Carte chargée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la carte:', error)
    loading.value = false
  }
}

const updateMarkers = () => {
  if (!map) return

  console.log('🗺️ Updating markers with appointments:', props.appointments)
  console.log(`📊 Total appointments received: ${props.appointments.length}`)

  // Supprimer les anciens marqueurs
  markers.forEach(marker => marker.remove())
  markers.length = 0

  // Ajouter les nouveaux marqueurs
  let appointmentsWithCoords = 0
  props.appointments.forEach(appointment => {
    const hasCoords = !!(appointment.location_latitude && appointment.location_longitude)

    console.log(`📍 Appointment "${appointment.title}":`, {
      id: appointment.id,
      address: appointment.location_address || 'Pas d\'adresse',
      lat: appointment.location_latitude,
      lng: appointment.location_longitude,
      hasCoords: hasCoords,
      type: appointment.appointment_type,
      locationType: appointment.location_type
    })

    if (hasCoords) {
      appointmentsWithCoords++
      const marker = createMarker(appointment)
      markers.push(marker)
    }
  })

  console.log(`✅ Created ${appointmentsWithCoords} markers out of ${props.appointments.length} appointments`)

  if (appointmentsWithCoords === 0 && props.appointments.length > 0) {
    console.warn('⚠️ No markers to display - no appointments have coordinates')
    console.info('💡 To fix this:')
    console.info('   1. Edit an existing appointment')
    console.info('   2. In the address field, type an address and SELECT a suggestion from the dropdown')
    console.info('   3. You should see "✓ Adresse géolocalisée" with coordinates')
    console.info('   4. Save the appointment')
    console.info('   5. The marker should now appear on the map')
  }

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
        justify-content: center;
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
    court: '#dc2626', // red-600 (tribunal)
    meeting: '#16a34a', // green-600 (réunion)
    phone: '#9333ea', // purple-600 (téléphone)
    video: '#ea580c', // orange-600 (visioconférence)
    other: '#4b5563' // gray-600
  }
  return type in colors ? colors[type]! : colors.other!
}

const getAppointmentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    consultation: '📋',
    court: '⚖️',
    meeting: '👤',
    phone: '📞',
    video: '💻',
    other: '📌'
  }
  return type in icons ? icons[type]! : icons.other!
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