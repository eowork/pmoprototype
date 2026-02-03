import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@pinia/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify({ autoImport: true }))
      })
    },
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  css: ['@mdi/font/css/materialdesignicons.css'],

  runtimeConfig: {
    public: {
      // Empty string = use relative URLs, letting Nitro devProxy handle routing
      // This avoids CORS issues by keeping requests same-origin
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
    },
  },

  ssr: false, // SPA mode for admin dashboard (auth-required pages)

  // Dev proxy to forward /api requests to NestJS backend
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3000/api',
        changeOrigin: true,
      },
    },
  },
})
