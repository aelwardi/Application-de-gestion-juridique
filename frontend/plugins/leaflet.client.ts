/**
 * Plugin Nuxt pour Leaflet
 * Assure le chargement correct de Leaflet côté client uniquement
 */

export default defineNuxtPlugin(() => {
  // Leaflet doit être chargé uniquement côté client
  if (process.client) {
    console.log('Plugin Leaflet chargé côté client');
  }
});

