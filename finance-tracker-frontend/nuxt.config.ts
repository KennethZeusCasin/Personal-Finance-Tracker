// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:5000/api'
    }
  }

  // modules: [
  //   '@nuxt/eslint',
  //   '@nuxt/ui'
  // ],

  // devtools: {
  //   enabled: true
  // },

  // css: ['~/assets/css/main.css'],

  // routeRules: {
  //   '/': { prerender: true }
  // },

  // compatibilityDate: '2026-06-30',

  // eslint: {
  //   config: {
  //     stylistic: {
  //       commaDangle: 'never',
  //       braceStyle: '1tbs'
  //     }
  //   }
  // }

})
