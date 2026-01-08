// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  css: [
    '~/assets/css/main.css',
    '~/assets/css/admin.css',
    'leaflet/dist/leaflet.css'
  ],

  dir: {
    pages: 'pages',
    layouts: 'layouts',
    middleware: 'middleware',
    plugins: 'plugins',
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
    }
  },

  app: {
    head: {
      title: 'Application de Gestion Juridique',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Application de gestion juridique pour avocats et clients' }
      ],
    }
  },

  devServer: {
    host: '0.0.0.0',
    port: 3001,
  },
})