import type { AvatarId, Badge } from '@/lib/types'

/**
 * Badges : récompenses symboliques uniquement.
 * Aucun achat, aucun classement, aucune série de connexion culpabilisante.
 */
export const BADGES: readonly Badge[] = [
  {
    id: 'premier-pas',
    name: { fr: 'Premier pas', ar: 'الخطوة الأولى', hassaniya: 'الخطوة الأولى', pulaar: 'Koral adii', wolof: 'Tàmbali bu njëkk', validated: ['fr'] },
    description: {
      fr: 'Tu as terminé ta première partie.',
      ar: 'أكملت جولتك الأولى.',
      hassaniya: 'كملت جولتك الأولى.',
      pulaar: 'A gasii fijirde maa adannde.',
      wolof: 'Jeexal na sa fànn bu njëkk.',
      validated: ['fr'],
    },
    emoji: '🌱',
    condition: { type: 'sessions', count: 1 },
  },
  {
    id: 'curieux',
    name: { fr: 'Petit curieux', ar: 'فضولي صغير', hassaniya: 'فضولي صغير', pulaar: 'Jiɗɗo anndude', wolof: 'Bëgg-xam', validated: ['fr'] },
    description: {
      fr: '5 parties terminées.',
      ar: '٥ جولات مكتملة.',
      hassaniya: '٥ جولات كملت.',
      pulaar: 'Fijirde 5 gasii.',
      wolof: '5 fànn jeex na.',
      validated: ['fr'],
    },
    emoji: '🔎',
    condition: { type: 'sessions', count: 5 },
  },
  {
    id: 'explorateur',
    name: { fr: 'Explorateur', ar: 'مستكشف', hassaniya: 'مستكشف', pulaar: 'Teeŋtiiɗo', wolof: 'Seetkat', validated: ['fr'] },
    description: {
      fr: '10 parties terminées.',
      ar: '١٠ جولات مكتملة.',
      hassaniya: '١٠ جولات كملت.',
      pulaar: 'Fijirde 10 gasii.',
      wolof: '10 fànn jeex na.',
      validated: ['fr'],
    },
    emoji: '🧭',
    condition: { type: 'sessions', count: 10 },
  },
  {
    id: 'champion-calcul',
    name: { fr: 'Ami des nombres', ar: 'صديق الأرقام', hassaniya: 'صاحب الأرقام', pulaar: 'Gollodiiɗo limle', wolof: 'Xarit limu', validated: ['fr'] },
    description: {
      fr: '3 activités de calcul terminées.',
      ar: '٣ أنشطة حساب مكتملة.',
      hassaniya: '٣ أنشطة حساب كملت.',
      pulaar: 'Golle limngal 3 gasii.',
      wolof: '3 liggéey konta jeex na.',
      validated: ['fr'],
    },
    emoji: '🔢',
    condition: { type: 'category', count: 3, category: 'math' },
  },
  {
    id: 'safari-hero',
    name: { fr: 'Ami des animaux', ar: 'صديق الحيوانات', hassaniya: 'صاحب الحيوانات', pulaar: 'Gollodiiɗo kulle', wolof: 'Xarit mala yi', validated: ['fr'] },
    description: {
      fr: '3 découvertes au safari.',
      ar: '٣ اكتشافات في السفاري.',
      hassaniya: '٣ اكتشافات في السفاري.',
      pulaar: 'Teeŋtinde 3 e safari.',
      wolof: '3 seet ci safari.',
      validated: ['fr'],
    },
    emoji: '🦒',
    condition: { type: 'category', count: 3, category: 'safari' },
  },
  {
    id: 'memoriseur',
    name: { fr: 'Bonne mémoire', ar: 'ذاكرة قوية', hassaniya: 'ذاكرة قوية', pulaar: 'Miijo moƴƴo', wolof: 'Xam-xam bu sax', validated: ['fr'] },
    description: {
      fr: '2 puzzles de mémoire réussis.',
      ar: '٢ ألعاب ذاكرة ناجحة.',
      hassaniya: '٢ ألعاب ذاكرة.',
      pulaar: 'Fijirde miijo 2.',
      wolof: '2 fànn xam-xam.',
      validated: ['fr'],
    },
    emoji: '🧠',
    condition: { type: 'category', count: 2, category: 'logique' },
  },
  {
    id: 'lecteur',
    name: { fr: 'Ami des lettres', ar: 'صديق الحروف', hassaniya: 'صاحب الحروف', pulaar: 'Gollodiiɗo alkule', wolof: 'Xarit araf yi', validated: ['fr'] },
    description: {
      fr: '3 activités de lettres et de sons.',
      ar: '٣ أنشطة حروف وأصوات.',
      hassaniya: '٣ أنشطة حروف.',
      pulaar: 'Golle alkule 3.',
      wolof: '3 liggéey araf.',
      validated: ['fr'],
    },
    emoji: '🔤',
    condition: { type: 'category', count: 3, category: 'alphabet' },
  },
  {
    id: 'polyglotte',
    name: { fr: 'Détective des langues', ar: 'محقق اللغات', hassaniya: 'محقق اللغات', pulaar: 'Wiɗtoowo ɗemɗe', wolof: 'Seetkat làkk', validated: ['fr'] },
    description: {
      fr: '2 enquêtes de langues terminées.',
      ar: '٢ تحقيقات لغوية مكتملة.',
      hassaniya: '٢ تحقيقات لغوية.',
      pulaar: 'Wiɗto ɗemngal 2.',
      wolof: '2 seet làkk.',
      validated: ['fr'],
    },
    emoji: '🗣️',
    condition: { type: 'category', count: 2, category: 'detective' },
  },
  {
    id: 'scientifique',
    name: { fr: 'Petit scientifique', ar: 'عالم صغير', hassaniya: 'عالم صغير', pulaar: 'Annduɗo seeɗa', wolof: 'Xam-xamkat', validated: ['fr'] },
    description: {
      fr: '3 expériences de sciences et nature.',
      ar: '٣ تجارب في العلوم والطبيعة.',
      hassaniya: '٣ تجارب في العلوم.',
      pulaar: 'Ɗemngal 3 e tago.',
      wolof: '3 seet ci xam-xam.',
      validated: ['fr'],
    },
    emoji: '🌍',
    condition: { type: 'category', count: 3, category: 'sciences' },
  },
  {
    id: 'conteur',
    name: { fr: 'Ami des contes', ar: 'صديق الحكايات', hassaniya: 'صاحب الحكايات', pulaar: 'Gollodiiɗo taa', wolof: 'Xarit léeb yi', validated: ['fr'] },
    description: {
      fr: '2 contes terminés.',
      ar: 'حكايتان مكتملتان.',
      hassaniya: 'حكايتين كملت.',
      pulaar: 'Taa 2 gasii.',
      wolof: '2 léeb jeex na.',
      validated: ['fr'],
    },
    emoji: '📖',
    condition: { type: 'category', count: 2, category: 'contes' },
  },
]

export interface AvatarOption {
  readonly id: AvatarId
  readonly emoji: string
  readonly name: { readonly fr: string; readonly ar: string }
}

/** Compagnons inspirés de la faune locale. Sidi la gazelle est la mascotte guide. */
export const AVATARS: readonly AvatarOption[] = [
  { id: 'sidi', emoji: '🦌', name: { fr: 'Sidi la gazelle', ar: 'سيدي الغزال' } },
  { id: 'gazelle', emoji: '🦌', name: { fr: 'Dorcas', ar: 'دركس' } },
  { id: 'fennec', emoji: '🦊', name: { fr: 'Tini le fennec', ar: 'تيني الفنك' } },
  { id: 'dauphin', emoji: '🐬', name: { fr: 'Nina le dauphin', ar: 'نينا الدلفين' } },
  { id: 'aigle', emoji: '🦅', name: { fr: 'Aya l’aigle', ar: 'آية النسر' } },
  { id: 'dromadaire', emoji: '🐪', name: { fr: 'Mimi le dromadaire', ar: 'ميمي الجمل' } },
]

/** Suggestions d'activités hors écran pour l'espace parent (contexte mauritanien). */
export const OFFLINE_IDEAS: Readonly<Record<string, readonly string[]>> = {
  math: [
    'Compter ensemble les dattes ou les tomates du marché, par groupes de 5.',
    'Faire 5 additions avec les prix des légumes au marché Capitale.',
  ],
  alphabet: [
    'Chercher ensemble 3 mots qui commencent par le son appris dans la journée.',
    'Écrire son prénom en français et en arabe sur du sable ou une ardoise.',
  ],
  safari: [
    'Nommer les animaux vus sur le chemin de l’école (âne, mouton, oiseau, chameau).',
    'Nommer 3 couleurs des vêtements portés aujourd’hui.',
  ],
  detective: [
    'Jeu d’écoute : fermer les yeux 30 secondes et nommer 3 sons entendus.',
    'Dire un mot en hassaniya, pulaar ou wolof et le traduire en français.',
  ],
  sciences: [
    'Arroser une petite plante chaque matin et observer ce qui change en une semaine.',
    'Trier les déchets de la maison : plastique, papier, restes de cuisine.',
  ],
  logique: [
    'Jeu des 7 différences avec deux objets de la maison.',
    'Ranger les cuillères de la plus courte à la plus longue.',
  ],
  contes: [
    'Raconter en famille l’histoire du conte entendu, avec ses propres mots.',
    'Inventer la fin d’une histoire en changeant un personnage.',
  ],
  missions: [
    'Préparer ensemble une mission de la semaine et la cocher chaque soir.',
    'Aider à mettre la table : compter les couverts nécessaires.',
  ],
}
