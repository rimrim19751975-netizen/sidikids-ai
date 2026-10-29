import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Consignes audio.
 *
 * Règles de vérité :
 * - Aucun fichier audio n'est livré avec la démonstration (aucune voix native
 *   n'a été enregistrée ni validée). Le moteur le détecte et renvoie
 *   `status: 'missing'` : l'interface affiche alors la consigne écrite.
 * - On n'utilise JAMAIS la synthèse vocale du navigateur pour « faire semblant »
 *   d'avoir un audio natif : elle prononce mal le hassaniya, le pulaar et le wolof.
 * - Si un fichier existe pour une langue non relue, on l'indique aussi.
 */

const AUDIO_BASE = (import.meta.env.VITE_AUDIO_BASE_URL as string | undefined) ?? '/audio'

export function audioUrl(language: string, key: string): string {
  return `${AUDIO_BASE.replace(/\/$/, '')}/${language}/${key}.mp3`
}

export interface PlayOutcome {
  readonly ok: boolean
  readonly status: 'played' | 'missing' | 'error'
}

/** Vérifie l'existence d'un fichier audio sans le télécharger entièrement. */
export async function probeAudio(language: string, key: string): Promise<boolean> {
  try {
    const response = await fetch(audioUrl(language, key), { method: 'HEAD' })
    return response.ok && (response.headers.get('content-type') ?? '').startsWith('audio')
  } catch {
    return false
  }
}

export interface AudioController {
  readonly enabled: boolean
  readonly setEnabled: (value: boolean) => void
  readonly slow: boolean
  readonly setSlow: (value: boolean) => void
  readonly playingKey: string | null
  readonly lastStatus: 'played' | 'missing' | 'error' | null
  readonly play: (language: string, key: string) => Promise<PlayOutcome>
  readonly stop: () => void
}

/**
 * `audioAvailability` vient du contenu (statut `AudioStatus` par langue) : c'est
 * la source de vérité, on ne devine pas. Le probe réseau ne sert qu'à confirmer.
 */
export function useAudio(initialEnabled = true): AudioController {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [slow, setSlow] = useState(false)
  const [playingKey, setPlayingKey] = useState<string | null>(null)
  const [lastStatus, setLastStatus] = useState<'played' | 'missing' | 'error' | null>(null)
  const elementRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.pause()
      elementRef.current = null
    }
    setPlayingKey(null)
  }, [])

  const play = useCallback(
    async (language: string, key: string): Promise<PlayOutcome> => {
      if (!enabled) return { ok: false, status: 'missing' }
      stop()
      const available = await probeAudio(language, key)
      if (!available) {
        setLastStatus('missing')
        return { ok: false, status: 'missing' }
      }
      try {
        const audio = new Audio(audioUrl(language, key))
        audio.playbackRate = slow ? 0.85 : 1
        elementRef.current = audio
        setPlayingKey(key)
        await audio.play()
        audio.addEventListener('ended', () => setPlayingKey(null), { once: true })
        setLastStatus('played')
        return { ok: true, status: 'played' }
      } catch {
        setLastStatus('error')
        setPlayingKey(null)
        return { ok: false, status: 'error' }
      }
    },
    [enabled, slow, stop],
  )

  useEffect(() => stop, [stop])

  return { enabled, setEnabled, slow, setSlow, playingKey, lastStatus, play, stop }
}
