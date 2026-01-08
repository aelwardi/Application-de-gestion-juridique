export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (error, instance, info) => {
    console.error('Global error handler:', error, info);
  });

  nuxtApp.hook('app:error', (error) => {
    console.error('App error:', error);
  });
});