// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  ssr: false,

  vite: {
    plugins: [
      (await import('@tailwindcss/vite')).default(),
    ] as any,
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Worktime',
      meta: [
        { name: 'description', content: 'Workforce Execution & Scheduling System — Manage work schedules, track attendance, and analyze planned vs actual performance.' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001/api/v1',
      socketUrl: 'http://localhost:3001',
    },
  },
})
