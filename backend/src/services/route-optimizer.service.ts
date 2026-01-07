import { pool } from '../config/database.config';

interface Location {
  id: string;
  lat: number;
  lng: number;
  address: string;
  title: string;
  time: string;
}

/**
 * Calculer la distance entre deux points (formule de Haversine)
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Algorithme du plus proche voisin pour optimiser l'itinéraire
 */
const optimizeRouteGreedy = (locations: Location[]): Location[] => {
  if (locations.length <= 1) return locations;

  const optimized: Location[] = [locations[0]];
  const remaining = [...locations.slice(1)];

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let minDistance = Infinity;

    remaining.forEach((loc, index) => {
      const distance = calculateDistance(current.lat, current.lng, loc.lat, loc.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    optimized.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }

  return optimized;
};

/**
 * Optimiser l'itinéraire des rendez-vous d'une journée
 */
export const optimizeRoute = async (
  lawyerId: string,
  date: string
): Promise<any> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      SELECT 
        id,
        title,
        start_date as start_time,
        location_latitude,
        location_longitude,
        location_address
      FROM appointments
      WHERE lawyer_id = $1
        AND start_date >= $2
        AND start_date < $3
        AND status IN ('pending', 'confirmed')
        AND location_latitude IS NOT NULL
        AND location_longitude IS NOT NULL
      ORDER BY start_date
    `;

    const result = await pool.query(query, [
      lawyerId,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    ]);

    if (result.rows.length === 0) {
      return {
        success: true,
        appointments: [],
        optimizedRoute: [],
        totalDistance: 0,
        estimatedTime: 0,
        message: 'Aucun rendez-vous géolocalisé ce jour'
      };
    }

    const locations: Location[] = result.rows.map((row: any) => ({
      id: row.id,
      lat: parseFloat(row.location_latitude),
      lng: parseFloat(row.location_longitude),
      address: row.location_address,
      title: row.title,
      time: row.start_time
    }));

    const optimizedRoute = optimizeRouteGreedy(locations);

    let totalDistance = 0;
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
      const dist = calculateDistance(
        optimizedRoute[i].lat,
        optimizedRoute[i].lng,
        optimizedRoute[i + 1].lat,
        optimizedRoute[i + 1].lng
      );
      totalDistance += dist;
    }

    const estimatedTime = Math.ceil((totalDistance / 50) * 60); // en minutes

    return {
      success: true,
      appointments: result.rows,
      optimizedRoute: optimizedRoute.map((loc, index) => ({
        ...loc,
        order: index + 1,
        distanceFromPrevious: index > 0
          ? calculateDistance(
              optimizedRoute[index - 1].lat,
              optimizedRoute[index - 1].lng,
              loc.lat,
              loc.lng
            ).toFixed(2)
          : 0
      })),
      totalDistance: totalDistance.toFixed(2),
      estimatedTime,
      savings: calculateSavings(locations, optimizedRoute)
    };
  } catch (error) {
    console.error('Erreur lors de l\'optimisation de l\'itinéraire:', error);
    throw error;
  }
};

/**
 * Calculer les économies réalisées par l'optimisation
 */
const calculateSavings = (original: Location[], optimized: Location[]): string => {
  let originalDistance = 0;
  for (let i = 0; i < original.length - 1; i++) {
    originalDistance += calculateDistance(
      original[i].lat,
      original[i].lng,
      original[i + 1].lat,
      original[i + 1].lng
    );
  }

  let optimizedDistance = 0;
  for (let i = 0; i < optimized.length - 1; i++) {
    optimizedDistance += calculateDistance(
      optimized[i].lat,
      optimized[i].lng,
      optimized[i + 1].lat,
      optimized[i + 1].lng
    );
  }

  const savings = originalDistance - optimizedDistance;
  const percentage = ((savings / originalDistance) * 100).toFixed(1);

  return `${savings.toFixed(2)} km (${percentage}%)`;
};

/**
 * Générer URL Google Maps pour l'itinéraire
 */
export const generateGoogleMapsUrl = (locations: Location[]): string => {
  if (locations.length === 0) return '';

  const origin = `${locations[0].lat},${locations[0].lng}`;
  const destination = `${locations[locations.length - 1].lat},${locations[locations.length - 1].lng}`;

  const waypoints = locations
    .slice(1, -1)
    .map(loc => `${loc.lat},${loc.lng}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  url += '&travelmode=driving';

  return url;
};

export default {
  optimizeRoute,
  generateGoogleMapsUrl
};