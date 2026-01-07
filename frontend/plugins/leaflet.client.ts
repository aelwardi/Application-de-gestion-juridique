export default defineNuxtPlugin(() => {
  if (process.client) {
    console.log('Plugin Leaflet chargé côté client');
  }
});

