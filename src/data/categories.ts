import type { Category } from '@/lib/types'

export const CATEGORIES: readonly Category[] = [
  {
    id: 'math',
    name: { fr: 'Calcul malin', ar: 'حساب ذكي', hassaniya: 'حساب ذكي', pulaar: 'Limngal', wolof: 'Konta', validated: ['fr'] },
    emoji: '🔢',
    accent: 'blue',
    world: 'Monde des nombres',
  },
  {
    id: 'alphabet',
    name: { fr: 'Lettres et sons', ar: 'حروف وأصوات', hassaniya: 'حروف وأصوات', pulaar: 'Alkule e nanndi', wolof: 'Araf ak baat', validated: ['fr'] },
    emoji: '🔤',
    accent: 'violet',
    world: 'Monde des lettres',
  },
  {
    id: 'safari',
    name: { fr: 'Safari éducatif', ar: 'سفاري تعليمي', hassaniya: 'سفاري تعليمي', pulaar: 'Safari jannde', wolof: 'Safari jàng', validated: ['fr'] },
    emoji: '🦒',
    accent: 'green',
    world: 'Monde du safari',
  },
  {
    id: 'detective',
    name: { fr: 'Détective des langues', ar: 'محقق اللغات', hassaniya: 'محقق اللغات', pulaar: 'Wiɗtoowo ɗemɗe', wolof: 'Seetkat làkk', validated: ['fr'] },
    emoji: '🗣️',
    accent: 'teal',
    world: 'Monde des langues',
  },
  {
    id: 'sciences',
    name: { fr: 'Sciences et nature', ar: 'علوم وطبيعة', hassaniya: 'علوم وطبيعة', pulaar: 'Anndal e tago', wolof: 'Xam-xam ak àll',
    validated: ['fr'] },
    emoji: '🌍',
    accent: 'orange',
    world: 'Monde de la nature',
  },
  {
    id: 'logique',
    name: { fr: 'Logique et mémoire', ar: 'منطق وذاكرة', hassaniya: 'منطق وذاكرة', pulaar: 'Miijo e hakkil', wolof: 'Xalaat ak fàttali',
    validated: ['fr'] },
    emoji: '🧩',
    accent: 'indigo',
    world: 'Monde des énigmes',
  },
  {
    id: 'contes',
    name: { fr: 'Contes du pays', ar: 'حكايات البلد', hassaniya: 'حكايات البلد', pulaar: 'Taa leydi', wolof: 'Léeb bu réew', validated: ['fr'] },
    emoji: '📖',
    accent: 'rose',
    world: 'Monde des histoires',
  },
  {
    id: 'missions',
    name: { fr: 'Missions et badges', ar: 'مهام وشارات', hassaniya: 'مهام وشارات', pulaar: 'Golle e maale', wolof: 'Liggéey ak màrk',
    validated: ['fr'] },
    emoji: '🏅',
    accent: 'yellow',
    world: 'Monde des missions',
  },
]

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
