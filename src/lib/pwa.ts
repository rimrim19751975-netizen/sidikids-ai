import { registerSW } from 'virtual:pwa-register'

/**
 * Enregistrement du service worker. En développement il n'y en a pas : PWA
 * n'est activable qu'après `npm run build && npm run preview` (voir README).
 */
export function registerPwa(): void {
  if (import.meta.env.DEV) return
  registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent('sidikids:update-available'))
    },
    onOfflineReady() {
      window.dispatchEvent(new CustomEvent('sidikids:offline-ready'))
    },
  })
}
