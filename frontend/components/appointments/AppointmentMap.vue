
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'


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
let routePolyline: L.Polyline | null = null
const showRouteModal = ref(false)
const routeStats = ref<{ count: number; distance: string; route: any[] } | null>(null)

onMounted(() => {
  initMap()

  window.addEventListener('view-appointment', (event: any) => {
    const appointmentId = event.detail
    navigateTo(`/appointments/${appointmentId}`)
  })
})

onUnmounted(() => {
  window.removeEventListener('view-appointment', () => {})
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

    const mapElement = document.getElementById('appointment-map');
    if (!mapElement) {
      loading.value = false;
      return;
    }


    map = L.map('appointment-map').setView([48.8566, 2.3522], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    updateMarkers()

    loading.value = false
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la carte:', error)
    loading.value = false
  }
}

const updateMarkers = () => {
  if (!map) return



  markers.forEach(marker => marker.remove())
  markers.length = 0

  let appointmentsWithCoords = 0
  props.appointments.forEach(appointment => {
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      console.log(`Skipping ${appointment.status} appointment: "${appointment.title}"`)
      return
    }

    const hasCoords = !!(appointment.location_latitude && appointment.location_longitude)


    if (hasCoords) {
      appointmentsWithCoords++
      const marker = createMarker(appointment)
      markers.push(marker)
    }
  })



  if (markers.length > 0) {
    fitAllMarkers()
  }
}

const createMarker = (appointment: any) => {
  const lat = parseFloat(appointment.location_latitude)
  const lng = parseFloat(appointment.location_longitude)

  const color = getAppointmentColor(appointment.appointment_type)

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
  const date = new Date(appointment.start_time).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const time = new Date(appointment.start_time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const statusColors: Record<string, string> = {
    scheduled: '#3b82f6',
    confirmed: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444'
  }

  const statusLabels: Record<string, string> = {
    scheduled: 'Prévu',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé'
  }

  const statusColor = statusColors[appointment.status] || '#6b7280'
  const statusLabel = statusLabels[appointment.status] || appointment.status

  return `
    <div style="padding: 16px; min-width: 280px; max-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <span style="
          background-color: ${statusColor}15;
          color: ${statusColor};
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">${statusLabel}</span>
      </div>

      <h3 style="
        font-size: 16px;
        font-weight: 700;
        color: #111827;
        margin: 0 0 12px 0;
        line-height: 1.4;
      ">${appointment.title}</h3>

      <div style="
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        border-left: 3px solid #3b82f6;
      ">
        <div style="display: flex; align-items: start; margin-bottom: 8px;">
          <span style="font-size: 16px; margin-right: 8px;"></span>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 600; color: #1e40af;">${date}</div>
            <div style="font-size: 12px; color: #3b82f6; font-weight: 500;">${time}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 14px; margin-right: 8px;"></span>
          <span style="font-size: 12px; color: #374151; line-height: 1.4;">
            ${appointment.location_address || 'Adresse non spécifiée'}
          </span>
        </div>

        <div style="display: flex; align-items: center;">
          <span style="font-size: 14px; margin-right: 8px;"></span>
          <span style="font-size: 13px; color: #111827; font-weight: 500;">
            ${appointment.client_first_name} ${appointment.client_last_name}
          </span>
        </div>
      </div>

      <div style="
        display: inline-block;
        background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
        color: #6b21a8;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 12px;
        text-transform: capitalize;
      ">
        ${appointment.appointment_type}
      </div>

      <button
        onclick="window.dispatchEvent(new CustomEvent('view-appointment', {detail: '${appointment.id}'}))"
        style="
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        "
        onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(37, 99, 235, 0.4)'"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(37, 99, 235, 0.3)'"
      >
        <span style="font-size: 16px;"></span>
        Voir les détails
      </button>
    </div>
  `
}

const getAppointmentColor = (type: string): string => {
  const colors: Record<string, string> = {
    consultation: '#2563eb',
    court: '#dc2626',
    meeting: '#16a34a',
    phone: '#9333ea',
    video: '#ea580c',
    other: '#4b5563'
  }
  return type in colors ? colors[type]! : colors.other!
}

const getAppointmentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    consultation: '',
    court: '',
    meeting: '',
    phone: '',
    video: '',
    other: ''
  }
  return type in icons ? icons[type]! : icons.other!
}

const highlightMarker = (appointmentId: string) => {
  const appointment = props.appointments.find(a => a.id === appointmentId)
  if (!appointment || !appointment.location_latitude || !appointment.location_longitude) return

  const lat = parseFloat(appointment.location_latitude)
  const lng = parseFloat(appointment.location_longitude)
  map?.setView([lat, lng], 15, { animate: true })

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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}


const optimizeRoute = () => {
  if (!map || markers.length < 2) {
    alert('Il faut au moins 2 rendez-vous pour calculer un itinéraire')
    return
  }

  if (routePolyline) {
    map.removeLayer(routePolyline)
    routePolyline = null
  }

  const activeAppointments = props.appointments.filter(apt =>
      apt.location_latitude &&
      apt.location_longitude &&
      apt.status !== 'cancelled' &&
      apt.status !== 'completed'
  )

  if (activeAppointments.length < 2) return

  const sortedByTime = [...activeAppointments].sort((a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  const visited = new Set<number>()
  const route: number[] = []

  route.push(0)
  visited.add(0)

  while (visited.size < sortedByTime.length) {
    const currentIdx = route[route.length - 1]
    if (currentIdx === undefined) break

    const current = sortedByTime[currentIdx]
    if (!current) break

    let nearestIdx = -1
    let nearestDist = Infinity

    for (let i = 0; i < sortedByTime.length; i++) {
      if (!visited.has(i)) {
        const nextApt = sortedByTime[i]
        if (!nextApt) continue

        const dist = calculateDistance(
            parseFloat(current.location_latitude),
            parseFloat(current.location_longitude),
            parseFloat(nextApt.location_latitude),
            parseFloat(nextApt.location_longitude)
        )

        if (dist < nearestDist) {
          nearestDist = dist
          nearestIdx = i
        }
      }
    }

    if (nearestIdx !== -1) {
      route.push(nearestIdx)
      visited.add(nearestIdx)
    } else {
      break
    }
  }

  const routeCoords: [number, number][] = route
      .map(idx => {
        const apt = sortedByTime[idx]
        if (!apt || !apt.location_latitude || !apt.location_longitude) return null
        return [parseFloat(apt.location_latitude), parseFloat(apt.location_longitude)] as [number, number]
      })
      .filter((coord): coord is [number, number] => coord !== null)

  let totalDistance = 0
  for (let i = 0; i < routeCoords.length - 1; i++) {
    const current = routeCoords[i]
    const next = routeCoords[i + 1]
    if (current && next) {
      totalDistance += calculateDistance(
          current[0], current[1],
          next[0], next[1]
      )
    }
  }

  routePolyline = L.polyline(routeCoords, {
    color: '#3b82f6',
    weight: 4,
    opacity: 0.7,
    dashArray: '10, 10',
    lineJoin: 'round'
  }).addTo(map)

  route.forEach((idx, order) => {
    const apt = sortedByTime[idx]
    if (!apt || !map) return

    const lat = parseFloat(apt.location_latitude)
    const lng = parseFloat(apt.location_longitude)

    L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'route-number',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-left: -12px;
            margin-top: -35px;
          ">${order + 1}</div>
        `,
        iconSize: [24, 24]
      })
    }).addTo(map)
  })

  showRouteModal.value = true
  routeStats.value = {
    count: sortedByTime.length,
    distance: totalDistance.toFixed(2),
    route: route.map(idx => sortedByTime[idx])
  }

  fitAllMarkers()
}


const clearRoute = () => {
  if (routePolyline && map) {
    map.removeLayer(routePolyline)
    routePolyline = null

    map.eachLayer((layer: any) => {
      if (layer.options?.icon?.options?.className === 'route-number') {
        map?.removeLayer(layer)
      }
    })
  }
}

if (process.client) {
  window.addEventListener('view-appointment', (e: any) => {
    emit('selectAppointment', e.detail)
  })
}
</script>




<template>
  <div class="h-full w-full relative">
    <div id="appointment-map" class="h-full w-full rounded-lg shadow-lg"></div>

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
            <span class="text-xl"></span>
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

    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement de la carte...</p>
      </div>
    </div>

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
        @click="optimizeRoute"
        :disabled="markers.length < 2"
        class="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        title="Optimiser l'itinéraire"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Itinéraire
      </button>

      <button
        v-if="routePolyline"
        @click="clearRoute"
        class="w-full px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        title="Effacer l'itinéraire"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Effacer
      </button>

      <button
        @click="fitAllMarkers"
        class="w-full px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        title="Voir tous les rendez-vous"
      >
        Tout afficher
      </button>
    </div>

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
      <div class="mt-3 pt-3 border-t border-gray-200">
        <p class="text-xs text-gray-500 italic">
          Les RDV annulés et terminés ne sont pas affichés
        </p>
      </div>
    </div>

    <div v-if="showRouteModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-2 sm:p-4 animate-fadeIn" @click="showRouteModal = false">
      <div class="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-slideUp" @click.stop>
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="text-lg sm:text-xl font-bold truncate">Itinéraire Optimisé</h3>
                <p class="text-blue-100 text-xs sm:text-sm truncate">Ordre de visite calculé</p>
              </div>
            </div>
            <button @click="showRouteModal = false" class="text-white/80 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-lg flex-shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 sm:p-4">
          <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-blue-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] sm:text-xs text-blue-600 font-semibold uppercase tracking-wide truncate">RDV</p>
                  <p class="text-xl sm:text-2xl font-black text-blue-900">{{ routeStats?.count || 0 }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-green-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] sm:text-xs text-green-600 font-semibold uppercase tracking-wide truncate">Distance</p>
                  <p class="text-xl sm:text-2xl font-black text-green-900">{{ routeStats?.distance || 0 }} <span class="text-sm sm:text-base">km</span></p>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3 sm:mb-4">
            <h4 class="text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span class="truncate">Ordre de visite optimal</span>
            </h4>
            <div class="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1">
              <div
                v-for="(apt, index) in routeStats?.route || []"
                :key="apt.id"
                class="flex items-start gap-2 p-2 sm:p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 text-xs sm:text-sm truncate">{{ apt.title }}</p>
                  <p class="text-[10px] sm:text-xs text-gray-600 truncate">{{ apt.location_address }}</p>
                  <p class="text-[10px] sm:text-xs text-blue-600 font-medium mt-0.5">
                     {{ new Date(apt.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-2.5 sm:p-3">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] sm:text-xs text-blue-900 font-medium">
                  Les numéros sur la carte indiquent l'ordre de visite optimal.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 rounded-b-xl sm:rounded-b-2xl flex items-center justify-between gap-2 flex-shrink-0 border-t border-gray-100">
          <button
            @click="clearRoute(); showRouteModal = false"
            class="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-xs sm:text-sm"
          >
            Effacer
          </button>
          <button
            @click="showRouteModal = false"
            class="px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xs sm:text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#appointment-map {
  position: relative;
}

/* Styles modernes pour les popups Leaflet */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

:deep(.leaflet-popup-content) {
  margin: 0;
  width: auto !important;
}

:deep(.leaflet-popup-tip) {
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.1);
}

:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

:deep(.custom-marker:hover) {
  transform: scale(1.15);
  transition: transform 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
</style>