import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Racine explicite : évite que Vite cherche le projet depuis un dossier parent.
  root: fileURLToPath(new URL('.', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./node_modules/.vite', import.meta.url)),
  plugins: [
    react(),
    // Tailwind v4 passe par PostCSS ici (voir postcss.config.mjs) : le plugin
    // Vite de Tailwind n'est pas appliqué par le bundler de cette version.
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SIDIKIDS AI — Apprendre en jouant',
        short_name: 'SIDIKIDS',
        description:
          "Application éducative pour les enfants de 5 à 10 ans : calcul, langues, safari, sciences, logique et contes.",
        lang: 'fr',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f2f7ff',
        theme_color: '#3b82f6',
        categories: ['education', 'kids'],
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
        navigateFallback: '/index.html',
        // Les données Supabase ne passent jamais par le cache du service worker :
        // un résultat de classe doit toujours refléter le serveur. Seuls les
        // fichiers de l'app et les audios (quand ils existeront) sont mis en cache.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'sidikids-audio',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
