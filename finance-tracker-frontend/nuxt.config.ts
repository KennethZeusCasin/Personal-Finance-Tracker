// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-08-22',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:5000/api'
        //  apiBaseUrl: 'https://gjsrv5jx-5000.asse.devtunnels.ms/'
    }
  },

  vite: {
    plugins: [
      tailwindcss()
    ]
  }

})
