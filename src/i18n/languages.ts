import type { LanguageCode } from '@/lib/types'

export interface LanguageMeta {
  readonly code: LanguageCode
  readonly nativeName: string
  readonly nameFr: string
  readonly dir: 'ltr' | 'rtl'
  /** Numérotation : l'arabe utilise les chiffres arabes orientaux dans le contenu. */
  readonly digits: 'latin' | 'arabic'
  /**
   * `true` = langue disposant d'une relecture native documentée.
   * `false` = interface affichée mais signalée comme « à valider ».
   */
  readonly reviewedByNativeSpeaker: boolean
  /** Message honnête affiché à l'utilisateur sur l'état de la traduction. */
  readonly reviewNote: string
}

export const LANGUAGES: Readonly<Record<LanguageCode, LanguageMeta>> = {
  fr: {
    code: 'fr',
    nativeName: 'Français',
    nameFr: 'Français',
    dir: 'ltr',
    digits: 'latin',
    reviewedByNativeSpeaker: true,
    reviewNote: "Interface et contenus rédigés en français par l'équipe SIDIKIDS ; relecture par un enseignant du primaire à programmer avant déploiement.",
  },
  ar: {
    code: 'ar',
    nativeName: 'العربية',
    nameFr: 'Arabe standard',
    dir: 'rtl',
    digits: 'arabic',
    reviewedByNativeSpeaker: true,
    reviewNote: "Interface en arabe standard, relue par l'équipe ; à faire valider par un enseignant d'arabe avant usage scolaire officiel.",
  },
  hassaniya: {
    code: 'hassaniya',
    nativeName: 'الحسانية',
    nameFr: 'Hassaniya',
    dir: 'rtl',
    digits: 'arabic',
    reviewedByNativeSpeaker: false,
    reviewNote: 'Traductions hassaniya en attente de validation par un locuteur natif : aucun audio natif n’est fourni à ce stade.',
  },
  pulaar: {
    code: 'pulaar',
    nativeName: 'Pulaar',
    nameFr: 'Pulaar',
    dir: 'ltr',
    digits: 'latin',
    reviewedByNativeSpeaker: false,
    reviewNote: 'Traductions pulaar en attente de validation par un locuteur natif : aucun audio natif n’est fourni à ce stade.',
  },
  wolof: {
    code: 'wolof',
    nativeName: 'Wolof',
    nameFr: 'Wolof',
    dir: 'ltr',
    digits: 'latin',
    reviewedByNativeSpeaker: false,
    reviewNote: 'Traductions wolof en attente de validation par un locuteur natif : aucun audio natif n’est fourni à ce stade.',
  },
}

export const LANGUAGE_CODES: readonly LanguageCode[] = ['fr', 'ar', 'hassaniya', 'pulaar', 'wolof']

export function directionOf(code: LanguageCode): 'ltr' | 'rtl' {
  return LANGUAGES[code].dir
}

export function isRtl(code: LanguageCode): boolean {
  return LANGUAGES[code].dir === 'rtl'
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const

/** Formate un nombre selon la langue (chiffres arabes orientaux pour ar/hassaniya). */
export function formatNumber(value: number, lang: LanguageCode): string {
  const latin = String(value)
  if (LANGUAGES[lang].digits === 'latin') return latin
  return latin.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)] ?? d)
}
