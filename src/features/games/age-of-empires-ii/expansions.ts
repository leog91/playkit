// Reviewed commercial metadata, independent of extracted unit stats.
// Access describes the current PC base package, not a particular user's license.
export const accessVerifiedAt = '2026-11-02'
const baseStore =
  'https://store.steampowered.com/app/813780/Age_of_Empires_II_Definitive_Edition/'
const expansionsPage =
  'https://www.ageofempires.com/age-of-empires-ii-de-expansions/'
export type Expansion = {
  id: string
  name: string
  access: 'base' | 'bundled' | 'paid'
  civilizations: string[]
  source: string
  sharedFeatures?: string[]
}
export const expansions: Expansion[] = [
  {
    id: 'age-of-kings',
    name: 'The Age of Kings',
    access: 'base',
    civilizations: [
      'britons',
      'byzantines',
      'celts',
      'chinese',
      'franks',
      'goths',
      'japanese',
      'mongols',
      'persians',
      'saracens',
      'teutons',
      'turks',
      'vikings',
    ],
    source: baseStore,
  },
  {
    id: 'conquerors',
    name: 'The Conquerors',
    access: 'base',
    civilizations: ['aztecs', 'huns', 'koreans', 'mayans', 'spanish'],
    source: baseStore,
  },
  {
    id: 'forgotten',
    name: 'The Forgotten',
    access: 'base',
    civilizations: ['hindustanis', 'incas', 'italians', 'magyars', 'slavs'],
    source: baseStore,
  },
  {
    id: 'african-kingdoms',
    name: 'The African Kingdoms',
    access: 'base',
    civilizations: ['berbers', 'ethiopians', 'malians', 'portuguese'],
    source: baseStore,
  },
  {
    id: 'rajas',
    name: 'Rise of the Rajas',
    access: 'base',
    civilizations: ['burmese', 'khmer', 'malay', 'vietnamese'],
    source: baseStore,
  },
  {
    id: 'last-khans',
    name: 'The Last Khans (DE)',
    access: 'base',
    civilizations: ['bulgarians', 'cumans', 'lithuanians', 'tatars'],
    source: baseStore,
  },
  {
    id: 'lords-west',
    name: 'Lords of the West',
    access: 'bundled',
    civilizations: ['burgundians', 'sicilians'],
    source: baseStore,
  },
  {
    id: 'dawn-dukes',
    name: 'Dawn of the Dukes',
    access: 'bundled',
    civilizations: ['bohemians', 'poles'],
    source: baseStore,
  },
  {
    id: 'dynasties-india',
    name: 'Dynasties of India',
    access: 'bundled',
    civilizations: ['bengalis', 'dravidians', 'gurjaras'],
    source: baseStore,
  },
  {
    id: 'return-rome',
    name: 'Return of Rome',
    access: 'paid',
    civilizations: ['romans'],
    source: expansionsPage,
  },
  {
    id: 'mountain-royals',
    name: 'The Mountain Royals',
    access: 'paid',
    civilizations: ['armenians', 'georgians'],
    source: expansionsPage,
  },
  {
    id: 'three-kingdoms',
    name: 'The Three Kingdoms',
    access: 'paid',
    civilizations: ['jurchens', 'khitans', 'shu', 'wei', 'wu'],
    source: expansionsPage,
  },
  {
    id: 'last-chieftains',
    name: 'The Last Chieftains',
    access: 'paid',
    civilizations: ['mapuche', 'muisca', 'tupi'],
    source:
      'https://www.ageofempires.com/news/pre-order-the-last-chieftains-aoeii-de/',
    sharedFeatures: [
      'Champi Warriors, Slingers, and Settlements are shared by the Mapuche, Muisca, Tupi, and Incas. These are regional features, not a bonus for owning the pack.',
    ],
  },
  {
    id: 'viking-sagas',
    name: 'The Viking Sagas',
    access: 'paid',
    civilizations: ['danes', 'saxons', 'varangians'],
    source:
      'https://www.ageofempires.com/news/pre-order-age-of-empires-ii-definitive-edition-the-viking-sagas/',
    sharedFeatures: [
      'Danes, Saxons, Varangians, and Vikings share Longships and access to Varangian Guards. Varangian Guards also serve Byzantines; Mounted Crossbowmen are shared with several European civilizations. These are regional units, not an ownership bonus.',
    ],
  },
]

export function civilizationExpansion(id: string): Expansion | undefined {
  return expansions.find((expansion) => expansion.civilizations.includes(id))
}
export function accessLabel(expansion: Expansion | undefined): string {
  if (!expansion) return 'Access not verified'
  return expansion.access === 'paid'
    ? `Paid DLC: ${expansion.name}`
    : expansion.access === 'bundled'
      ? 'Included with current DE'
      : 'Included in DE'
}
