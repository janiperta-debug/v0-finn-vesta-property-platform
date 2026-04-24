import type {
  Category,
  BuildingTypeTemplate,
  BuildingType,
  ConditionScoreInfo,
  UrgencyClassInfo,
  PropertyKuntoarvio,
  ConditionScore,
} from './kuntoarvio-types'

// Condition Score definitions (1-5)
export const conditionScores: ConditionScoreInfo[] = [
  {
    score: 5,
    label: 'Erinomainen',
    labelEn: 'Excellent',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    description: 'Uudenveroinen, ei toimenpiteitä',
  },
  {
    score: 4,
    label: 'Hyvä',
    labelEn: 'Good',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    description: 'Normaali kuluminen, huolto riittää',
  },
  {
    score: 3,
    label: 'Tyydyttävä',
    labelEn: 'Satisfactory',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    description: 'Korjaustarve 5-10v sisällä',
  },
  {
    score: 2,
    label: 'Välttävä',
    labelEn: 'Fair',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    description: 'Korjaustarve 1-5v sisällä',
  },
  {
    score: 1,
    label: 'Heikko',
    labelEn: 'Poor',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    description: 'Välitön korjaustarve',
  },
]

// Urgency Class definitions (1-4)
export const urgencyClasses: UrgencyClassInfo[] = [
  {
    urgency: 1,
    label: 'Välitön',
    labelEn: 'Immediate',
    timeframe: 'Heti / turvallisuusriski',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  {
    urgency: 2,
    label: 'Kiireellinen',
    labelEn: 'Urgent',
    timeframe: '1-2 vuoden sisällä',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  {
    urgency: 3,
    label: 'Suunniteltava',
    labelEn: 'Planned',
    timeframe: '3-5 vuoden sisällä',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  {
    urgency: 4,
    label: 'Seurattava',
    labelEn: 'Monitor',
    timeframe: 'Ei akuuttia, seurataan',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
]

// All 17 Categories with sub-items
export const categories: Category[] = [
  {
    id: 'perustukset',
    name: 'Perustukset ja alapohja',
    nameEn: 'Foundations',
    icon: 'foundation',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'perustukset-anturat', name: 'Anturat', categoryId: 'perustukset' },
      { id: 'perustukset-perusmuuri', name: 'Perusmuuri', categoryId: 'perustukset' },
      { id: 'perustukset-alapohja', name: 'Alapohjarakenne', categoryId: 'perustukset' },
      { id: 'perustukset-salaojat', name: 'Salaojat', categoryId: 'perustukset' },
      { id: 'perustukset-routasuojaus', name: 'Routasuojaus', categoryId: 'perustukset' },
    ],
  },
  {
    id: 'runko',
    name: 'Runko',
    nameEn: 'Frame/Structure',
    icon: 'building',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'runko-kantavat', name: 'Kantavat rakenteet', categoryId: 'runko' },
      { id: 'runko-valipohjat', name: 'Välipohjat', categoryId: 'runko' },
      { id: 'runko-palkit', name: 'Palkit ja pilarit', categoryId: 'runko' },
      { id: 'runko-jäykistys', name: 'Jäykistävät rakenteet', categoryId: 'runko' },
    ],
  },
  {
    id: 'julkisivut',
    name: 'Julkisivut',
    nameEn: 'Facades',
    icon: 'building-2',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'julkisivut-rappaus', name: 'Rappaus/pintakäsittely', categoryId: 'julkisivut' },
      { id: 'julkisivut-tiili', name: 'Tiiliverhoilu', categoryId: 'julkisivut' },
      { id: 'julkisivut-puu', name: 'Puuverhous', categoryId: 'julkisivut' },
      { id: 'julkisivut-metalli', name: 'Metalliverhoilu', categoryId: 'julkisivut' },
      { id: 'julkisivut-saumaukset', name: 'Saumaukset', categoryId: 'julkisivut' },
      { id: 'julkisivut-sokkeli', name: 'Sokkelipinta', categoryId: 'julkisivut' },
    ],
  },
  {
    id: 'ikkunat',
    name: 'Ikkunat',
    nameEn: 'Windows',
    icon: 'square',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'ikkunat-puitteet', name: 'Ikkunapuitteet', categoryId: 'ikkunat' },
      { id: 'ikkunat-lasit', name: 'Lasitukset', categoryId: 'ikkunat' },
      { id: 'ikkunat-tiivisteet', name: 'Tiivisteet', categoryId: 'ikkunat' },
      { id: 'ikkunat-helat', name: 'Helat ja mekanismit', categoryId: 'ikkunat' },
      { id: 'ikkunat-pellitys', name: 'Vesipellitys', categoryId: 'ikkunat' },
    ],
  },
  {
    id: 'ovet',
    name: 'Ovet',
    nameEn: 'Doors',
    icon: 'door-open',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'ovet-ulko', name: 'Ulko-ovet', categoryId: 'ovet' },
      { id: 'ovet-parveke', name: 'Parvekeovet', categoryId: 'ovet' },
      { id: 'ovet-porras', name: 'Porrasovet', categoryId: 'ovet' },
      { id: 'ovet-palo', name: 'Palo-ovet', categoryId: 'ovet' },
      { id: 'ovet-autohalli', name: 'Autohallin ovet', categoryId: 'ovet' },
    ],
  },
  {
    id: 'katto',
    name: 'Katto ja yläpohja',
    nameEn: 'Roof Structure',
    icon: 'home',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'katto-rakenne', name: 'Kattorakenne', categoryId: 'katto' },
      { id: 'katto-eristys', name: 'Yläpohjaeristys', categoryId: 'katto' },
      { id: 'katto-tuuletus', name: 'Tuuletus', categoryId: 'katto' },
      { id: 'katto-hoitotasot', name: 'Kattohoitotasot', categoryId: 'katto' },
    ],
  },
  {
    id: 'vesikate',
    name: 'Vesikate',
    nameEn: 'Roof Covering',
    icon: 'cloud-rain',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'vesikate-kate', name: 'Katemateriaali', categoryId: 'vesikate' },
      { id: 'vesikate-läpiviennit', name: 'Läpiviennit', categoryId: 'vesikate' },
      { id: 'vesikate-räystäät', name: 'Räystäsrakenteet', categoryId: 'vesikate' },
      { id: 'vesikate-sadevesi', name: 'Sadevesijärjestelmä', categoryId: 'vesikate' },
      { id: 'vesikate-turva', name: 'Kattoturvavarusteet', categoryId: 'vesikate' },
    ],
  },
  {
    id: 'sisatilat-pinnat',
    name: 'Sisätilat – pinnat',
    nameEn: 'Interior Surfaces',
    icon: 'paint-bucket',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'muu'],
    subItems: [
      { id: 'sisatilat-pinnat-seinat', name: 'Seinäpinnat', categoryId: 'sisatilat-pinnat' },
      { id: 'sisatilat-pinnat-katot', name: 'Kattopinnat', categoryId: 'sisatilat-pinnat' },
      { id: 'sisatilat-pinnat-lattiat', name: 'Lattiapinnat', categoryId: 'sisatilat-pinnat' },
      { id: 'sisatilat-pinnat-listat', name: 'Listat ja kynnykset', categoryId: 'sisatilat-pinnat' },
    ],
  },
  {
    id: 'sisatilat-kalusteet',
    name: 'Sisätilat – kalusteet',
    nameEn: 'Interior Fixtures',
    icon: 'armchair',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'muu'],
    subItems: [
      { id: 'sisatilat-kalusteet-keittio', name: 'Keittiökalusteet', categoryId: 'sisatilat-kalusteet' },
      { id: 'sisatilat-kalusteet-kiintokalusteet', name: 'Kiintokalusteet', categoryId: 'sisatilat-kalusteet' },
      { id: 'sisatilat-kalusteet-tasot', name: 'Tasot ja altaat', categoryId: 'sisatilat-kalusteet' },
      { id: 'sisatilat-kalusteet-kodinkoneet', name: 'Kodinkoneet', categoryId: 'sisatilat-kalusteet' },
    ],
  },
  {
    id: 'markatilat',
    name: 'Märkätilat',
    nameEn: 'Wet Rooms',
    icon: 'droplets',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'muu'],
    subItems: [
      { id: 'markatilat-vedeneristys', name: 'Vedeneristys', categoryId: 'markatilat' },
      { id: 'markatilat-laatoitus', name: 'Laatoitus', categoryId: 'markatilat' },
      { id: 'markatilat-kalusteet', name: 'Kalusteet ja varusteet', categoryId: 'markatilat' },
      { id: 'markatilat-lattiakaivo', name: 'Lattiakaivot', categoryId: 'markatilat' },
      { id: 'markatilat-silikonit', name: 'Saumaukset ja silikonit', categoryId: 'markatilat' },
    ],
  },
  {
    id: 'lvi-lammitys',
    name: 'LVI – lämmitys',
    nameEn: 'HVAC – Heating',
    icon: 'thermometer',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'lvi-lammitys-kattila', name: 'Kattila/lämmönlähde', categoryId: 'lvi-lammitys' },
      { id: 'lvi-lammitys-patterit', name: 'Patterit/radiaattorit', categoryId: 'lvi-lammitys' },
      { id: 'lvi-lammitys-lattia', name: 'Lattialämmitys', categoryId: 'lvi-lammitys' },
      { id: 'lvi-lammitys-putkistot', name: 'Lämmitysputkistot', categoryId: 'lvi-lammitys' },
      { id: 'lvi-lammitys-saato', name: 'Säätölaitteet', categoryId: 'lvi-lammitys' },
    ],
  },
  {
    id: 'lvi-vesi',
    name: 'LVI – vesi ja viemäri',
    nameEn: 'HVAC – Plumbing',
    icon: 'pipette',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'muu'],
    subItems: [
      { id: 'lvi-vesi-kayttovesi', name: 'Käyttövesiputkisto', categoryId: 'lvi-vesi' },
      { id: 'lvi-vesi-viemari', name: 'Viemäriputkisto', categoryId: 'lvi-vesi' },
      { id: 'lvi-vesi-vesikalusteet', name: 'Vesikalusteet', categoryId: 'lvi-vesi' },
      { id: 'lvi-vesi-lamminvesi', name: 'Lämminvesivaraaja', categoryId: 'lvi-vesi' },
      { id: 'lvi-vesi-pumput', name: 'Pumput ja venttiilit', categoryId: 'lvi-vesi' },
    ],
  },
  {
    id: 'lvi-ilmanvaihto',
    name: 'LVI – ilmanvaihto',
    nameEn: 'HVAC – Ventilation',
    icon: 'wind',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'lvi-ilmanvaihto-kone', name: 'IV-kone', categoryId: 'lvi-ilmanvaihto' },
      { id: 'lvi-ilmanvaihto-kanavat', name: 'Kanavisto', categoryId: 'lvi-ilmanvaihto' },
      { id: 'lvi-ilmanvaihto-paatteet', name: 'Päätelaitteet', categoryId: 'lvi-ilmanvaihto' },
      { id: 'lvi-ilmanvaihto-suodattimet', name: 'Suodattimet', categoryId: 'lvi-ilmanvaihto' },
      { id: 'lvi-ilmanvaihto-lto', name: 'Lämmöntalteenotto', categoryId: 'lvi-ilmanvaihto' },
    ],
  },
  {
    id: 'sahko',
    name: 'Sähköjärjestelmät',
    nameEn: 'Electrical',
    icon: 'zap',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'sahko-keskus', name: 'Sähkökeskukset', categoryId: 'sahko' },
      { id: 'sahko-johdotus', name: 'Johdotukset', categoryId: 'sahko' },
      { id: 'sahko-pistorasiat', name: 'Pistorasiat ja kytkimet', categoryId: 'sahko' },
      { id: 'sahko-valaistus', name: 'Valaistus', categoryId: 'sahko' },
      { id: 'sahko-turva', name: 'Turvajärjestelmät', categoryId: 'sahko' },
      { id: 'sahko-tele', name: 'Tele- ja datajärjestelmät', categoryId: 'sahko' },
    ],
  },
  {
    id: 'hissi',
    name: 'Hissi',
    nameEn: 'Elevator',
    icon: 'move-vertical',
    applicableToTypes: ['kerrostalo', 'toimisto', 'liiketila', 'teollisuus', 'muu'],
    subItems: [
      { id: 'hissi-koneisto', name: 'Hissikoneisto', categoryId: 'hissi' },
      { id: 'hissi-kori', name: 'Hissikori', categoryId: 'hissi' },
      { id: 'hissi-ovet', name: 'Hissiovet', categoryId: 'hissi' },
      { id: 'hissi-ohjaus', name: 'Ohjausjärjestelmä', categoryId: 'hissi' },
      { id: 'hissi-turva', name: 'Turvalaitteet', categoryId: 'hissi' },
    ],
  },
  {
    id: 'piha',
    name: 'Piha-alueet',
    nameEn: 'Yard/Outdoor',
    icon: 'trees',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'piha-asfaltti', name: 'Asfalttipinnat', categoryId: 'piha' },
      { id: 'piha-kiveys', name: 'Kiveykset', categoryId: 'piha' },
      { id: 'piha-viheralueet', name: 'Viheralueet', categoryId: 'piha' },
      { id: 'piha-aidat', name: 'Aidat ja portit', categoryId: 'piha' },
      { id: 'piha-leikki', name: 'Leikkivälineet', categoryId: 'piha' },
      { id: 'piha-valaistus', name: 'Piha-valaistus', categoryId: 'piha' },
      { id: 'piha-autopaikat', name: 'Autopaikat', categoryId: 'piha' },
    ],
  },
  {
    id: 'erityisrakenteet',
    name: 'Erityisrakenteet',
    nameEn: 'Special Structures',
    icon: 'construction',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'erityis-parvekkeet', name: 'Parvekkeet', categoryId: 'erityisrakenteet' },
      { id: 'erityis-terassit', name: 'Terassit', categoryId: 'erityisrakenteet' },
      { id: 'erityis-varastorakennukset', name: 'Varastorakennukset', categoryId: 'erityisrakenteet' },
      { id: 'erityis-autokatokset', name: 'Autokatokset', categoryId: 'erityisrakenteet' },
      { id: 'erityis-saunat', name: 'Saunatilat', categoryId: 'erityisrakenteet' },
      { id: 'erityis-uima-altaat', name: 'Uima-altaat', categoryId: 'erityisrakenteet' },
    ],
  },
]

// Building Type Templates
export const buildingTypeTemplates: BuildingTypeTemplate[] = [
  {
    id: 'kerrostalo',
    name: 'Kerrostalo',
    nameEn: 'Apartment Building',
    description: 'Asuinkerrostalo, kaikki 17 kategoriaa',
    includedCategories: categories.map(c => c.id),
  },
  {
    id: 'rivitalo',
    name: 'Rivitalo',
    nameEn: 'Row House',
    description: 'Rivitalo, 16 kategoriaa (ei hissiä)',
    includedCategories: categories.filter(c => c.id !== 'hissi').map(c => c.id),
  },
  {
    id: 'paritalo',
    name: 'Paritalo',
    nameEn: 'Semi-detached',
    description: 'Paritalo, 14 kategoriaa',
    includedCategories: categories.filter(c => 
      !['hissi', 'sisatilat-kalusteet', 'erityisrakenteet'].includes(c.id)
    ).map(c => c.id),
  },
  {
    id: 'omakotitalo',
    name: 'Omakotitalo',
    nameEn: 'Detached House',
    description: 'Omakotitalo, 13 kategoriaa',
    includedCategories: categories.filter(c => 
      !['hissi', 'sisatilat-kalusteet', 'erityisrakenteet', 'lvi-ilmanvaihto'].includes(c.id)
    ).map(c => c.id),
  },
  {
    id: 'toimisto',
    name: 'Toimisto',
    nameEn: 'Office',
    description: 'Toimistorakennus, kaikki 17 kategoriaa',
    includedCategories: categories.map(c => c.id),
  },
  {
    id: 'liiketila',
    name: 'Liiketila',
    nameEn: 'Retail',
    description: 'Liiketila, 15 kategoriaa',
    includedCategories: categories.filter(c => 
      !['sisatilat-kalusteet', 'erityisrakenteet'].includes(c.id)
    ).map(c => c.id),
  },
  {
    id: 'teollisuus',
    name: 'Teollisuus',
    nameEn: 'Industrial',
    description: 'Teollisuusrakennus, 14 kategoriaa',
    includedCategories: categories.filter(c => 
      !['sisatilat-kalusteet', 'markatilat', 'erityisrakenteet'].includes(c.id)
    ).map(c => c.id),
  },
  {
    id: 'varasto',
    name: 'Varasto',
    nameEn: 'Warehouse',
    description: 'Varastorakennus, 10 kategoriaa',
    includedCategories: [
      'perustukset', 'runko', 'julkisivut', 'ovet', 'katto', 'vesikate',
      'lvi-lammitys', 'lvi-ilmanvaihto', 'sahko', 'piha'
    ],
  },
  {
    id: 'muu',
    name: 'Muu',
    nameEn: 'Other',
    description: 'Mukautettu valinta',
    includedCategories: [],
  },
]

// Helper functions
export function getConditionInfo(score: ConditionScore): ConditionScoreInfo {
  return conditionScores.find(c => c.score === score) || conditionScores[0]
}

export function getUrgencyInfo(urgency: number): UrgencyClassInfo {
  return urgencyClasses.find(u => u.urgency === urgency) || urgencyClasses[3]
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id)
}

export function getTemplateById(id: BuildingType): BuildingTypeTemplate | undefined {
  return buildingTypeTemplates.find(t => t.id === id)
}

export function getCategoriesForBuildingType(buildingType: BuildingType): Category[] {
  const template = getTemplateById(buildingType)
  if (!template) return categories
  return categories.filter(c => template.includedCategories.includes(c.id))
}

// Sample mock evaluations for demo property
export const samplePropertyKuntoarvio: PropertyKuntoarvio = {
  propertyId: 'prop-1',
  buildingType: 'kerrostalo',
  enabledCategories: categories.map(c => c.id),
  lastFullEvaluation: '2024-11-15',
  nextScheduledEvaluation: '2025-11-15',
  evaluations: [
    {
      categoryId: 'perustukset',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 4,
      notes: 'Perustukset hyvässä kunnossa. Salaojien toiminta tarkistettu.',
      subItemEvaluations: [
        { subItemId: 'perustukset-anturat', score: 4, urgency: 4 },
        { subItemId: 'perustukset-perusmuuri', score: 4, urgency: 4 },
        { subItemId: 'perustukset-alapohja', score: 4, urgency: 4 },
        { subItemId: 'perustukset-salaojat', score: 3, urgency: 3, notes: 'Salaojien huuhtelu suositeltava 2-3v sisällä', estimatedCost: 3500 },
        { subItemId: 'perustukset-routasuojaus', score: 5, urgency: 4 },
      ],
    },
    {
      categoryId: 'runko',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'basic',
      overallScore: 5,
      notes: 'Betonielementtirunko erinomaisessa kunnossa.',
    },
    {
      categoryId: 'julkisivut',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 3,
      notes: 'Julkisivurappaus vaatii huomiota. Saumaukset uusittava.',
      subItemEvaluations: [
        { subItemId: 'julkisivut-rappaus', score: 3, urgency: 3, notes: 'Paikkarappaus tarpeen 3-5v sisällä', estimatedCost: 45000 },
        { subItemId: 'julkisivut-tiili', score: 4, urgency: 4 },
        { subItemId: 'julkisivut-saumaukset', score: 2, urgency: 2, notes: 'Elementtisaumaukset uusittava', estimatedCost: 28000 },
        { subItemId: 'julkisivut-sokkeli', score: 3, urgency: 3, estimatedCost: 8000 },
      ],
    },
    {
      categoryId: 'ikkunat',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 2,
      notes: 'Ikkunat käyttöikänsä päässä. Uusiminen suositeltava 1-3v sisällä.',
      subItemEvaluations: [
        { subItemId: 'ikkunat-puitteet', score: 2, urgency: 2, notes: 'Puuosat lahonneet osittain', estimatedCost: 85000 },
        { subItemId: 'ikkunat-lasit', score: 3, urgency: 3 },
        { subItemId: 'ikkunat-tiivisteet', score: 2, urgency: 2, notes: 'Tiivisteet kovettuneet' },
        { subItemId: 'ikkunat-helat', score: 2, urgency: 2 },
        { subItemId: 'ikkunat-pellitys', score: 3, urgency: 3 },
      ],
    },
    {
      categoryId: 'ovet',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'basic',
      overallScore: 4,
      notes: 'Ulko-ovet ja porrasovet hyväkuntoiset.',
    },
    {
      categoryId: 'katto',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'basic',
      overallScore: 4,
      notes: 'Yläpohjarakenne kunnossa, eristys riittävä.',
    },
    {
      categoryId: 'vesikate',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 3,
      notes: 'Bitumikermi käyttöikänsä puolivälissä.',
      subItemEvaluations: [
        { subItemId: 'vesikate-kate', score: 3, urgency: 3, notes: 'Uusiminen 5-8v sisällä', estimatedCost: 65000 },
        { subItemId: 'vesikate-läpiviennit', score: 3, urgency: 3 },
        { subItemId: 'vesikate-räystäät', score: 4, urgency: 4 },
        { subItemId: 'vesikate-sadevesi', score: 3, urgency: 3, estimatedCost: 12000 },
        { subItemId: 'vesikate-turva', score: 4, urgency: 4 },
      ],
    },
    {
      categoryId: 'sisatilat-pinnat',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'basic',
      overallScore: 4,
      notes: 'Yleiset tilat siistissä kunnossa.',
    },
    {
      categoryId: 'sisatilat-kalusteet',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'basic',
      overallScore: 3,
      notes: 'Yhteistilojen kalusteet toimivat, päivitystarve 5v sisällä.',
    },
    {
      categoryId: 'markatilat',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 3,
      notes: 'Yhteissaunan märkätilat vaativat huomiota.',
      subItemEvaluations: [
        { subItemId: 'markatilat-vedeneristys', score: 3, urgency: 3, notes: 'Tarkistettava perusteellisemmin' },
        { subItemId: 'markatilat-laatoitus', score: 3, urgency: 3 },
        { subItemId: 'markatilat-kalusteet', score: 3, urgency: 4 },
        { subItemId: 'markatilat-lattiakaivo', score: 4, urgency: 4 },
        { subItemId: 'markatilat-silikonit', score: 2, urgency: 2, notes: 'Silikonit uusittava', estimatedCost: 1500 },
      ],
    },
    {
      categoryId: 'lvi-lammitys',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 4,
      notes: 'Kaukolämpöjärjestelmä toimii moitteettomasti.',
      subItemEvaluations: [
        { subItemId: 'lvi-lammitys-kattila', score: 4, urgency: 4 },
        { subItemId: 'lvi-lammitys-patterit', score: 4, urgency: 4 },
        { subItemId: 'lvi-lammitys-putkistot', score: 4, urgency: 4 },
        { subItemId: 'lvi-lammitys-saato', score: 3, urgency: 3, notes: 'Säätöautomatiikan päivitys harkittava', estimatedCost: 8000 },
      ],
    },
    {
      categoryId: 'lvi-vesi',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 2,
      notes: 'Käyttövesiputkisto käyttöikänsä lopussa. Linjasaneeraus ajankohtainen.',
      subItemEvaluations: [
        { subItemId: 'lvi-vesi-kayttovesi', score: 2, urgency: 2, notes: 'Kupariputket uusittava', estimatedCost: 450000 },
        { subItemId: 'lvi-vesi-viemari', score: 2, urgency: 2, notes: 'Valurautaviemärit korroosiovaurioita', estimatedCost: 380000 },
        { subItemId: 'lvi-vesi-vesikalusteet', score: 3, urgency: 3 },
        { subItemId: 'lvi-vesi-lamminvesi', score: 3, urgency: 3 },
        { subItemId: 'lvi-vesi-pumput', score: 3, urgency: 3 },
      ],
    },
    {
      categoryId: 'lvi-ilmanvaihto',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'basic',
      overallScore: 3,
      notes: 'Koneellinen poisto, toimii. Suodattimet vaihdettu.',
    },
    {
      categoryId: 'sahko',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 3,
      notes: 'Sähköjärjestelmä toimiva, päivitystarve tulevaisuudessa.',
      subItemEvaluations: [
        { subItemId: 'sahko-keskus', score: 3, urgency: 3, notes: 'Pääkeskus uusittava 5-10v', estimatedCost: 25000 },
        { subItemId: 'sahko-johdotus', score: 3, urgency: 3 },
        { subItemId: 'sahko-pistorasiat', score: 4, urgency: 4 },
        { subItemId: 'sahko-valaistus', score: 3, urgency: 4, notes: 'LED-päivitys suositeltava', estimatedCost: 15000 },
        { subItemId: 'sahko-turva', score: 4, urgency: 4 },
        { subItemId: 'sahko-tele', score: 3, urgency: 4 },
      ],
    },
    {
      categoryId: 'hissi',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 3,
      notes: 'Hissi toimiva, modernisointi tulossa.',
      subItemEvaluations: [
        { subItemId: 'hissi-koneisto', score: 3, urgency: 3, notes: 'Modernisointi suunnitteilla', estimatedCost: 120000 },
        { subItemId: 'hissi-kori', score: 3, urgency: 3 },
        { subItemId: 'hissi-ovet', score: 3, urgency: 3 },
        { subItemId: 'hissi-ohjaus', score: 2, urgency: 2, notes: 'Ohjausjärjestelmä vanhentunut' },
        { subItemId: 'hissi-turva', score: 4, urgency: 4 },
      ],
    },
    {
      categoryId: 'piha',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 3,
      notes: 'Piha-alueet kohtalaisessa kunnossa.',
      subItemEvaluations: [
        { subItemId: 'piha-asfaltti', score: 2, urgency: 2, notes: 'Asfaltin uusiminen tarpeen', estimatedCost: 35000 },
        { subItemId: 'piha-kiveys', score: 4, urgency: 4 },
        { subItemId: 'piha-viheralueet', score: 4, urgency: 4 },
        { subItemId: 'piha-aidat', score: 3, urgency: 4 },
        { subItemId: 'piha-valaistus', score: 3, urgency: 3, estimatedCost: 8000 },
        { subItemId: 'piha-autopaikat', score: 3, urgency: 3 },
      ],
    },
    {
      categoryId: 'erityisrakenteet',
      date: '2024-11-15',
      evaluatedBy: 'Matti Virtanen',
      mode: 'thorough',
      overallScore: 3,
      notes: 'Parvekkeet ja sauna tarkastettu.',
      subItemEvaluations: [
        { subItemId: 'erityis-parvekkeet', score: 3, urgency: 3, notes: 'Parvekekorjaus 5-8v sisällä', estimatedCost: 180000 },
        { subItemId: 'erityis-saunat', score: 3, urgency: 3, estimatedCost: 25000 },
      ],
    },
  ],
}

// Historical evaluations for history view
export const evaluationHistory = [
  {
    date: '2024-11-15',
    categoryId: 'ikkunat',
    previousScore: 3 as ConditionScore,
    newScore: 2 as ConditionScore,
    notes: 'Kuntoarvio päivitetty, ikkunoiden kunto heikentynyt',
    evaluatedBy: 'Matti Virtanen',
  },
  {
    date: '2023-11-20',
    categoryId: 'ikkunat',
    previousScore: 3 as ConditionScore,
    newScore: 3 as ConditionScore,
    notes: 'Vuosittainen tarkastus',
    evaluatedBy: 'Matti Virtanen',
  },
  {
    date: '2022-11-18',
    categoryId: 'ikkunat',
    previousScore: 4 as ConditionScore,
    newScore: 3 as ConditionScore,
    notes: 'Tiivisteiden kunto heikentynyt',
    evaluatedBy: 'Pekka Korhonen',
  },
  {
    date: '2024-11-15',
    categoryId: 'julkisivut',
    previousScore: 3 as ConditionScore,
    newScore: 3 as ConditionScore,
    notes: 'Tilanne ennallaan',
    evaluatedBy: 'Matti Virtanen',
  },
  {
    date: '2023-11-20',
    categoryId: 'julkisivut',
    previousScore: 4 as ConditionScore,
    newScore: 3 as ConditionScore,
    notes: 'Saumausten kunto heikentynyt',
    evaluatedBy: 'Matti Virtanen',
  },
  {
    date: '2024-11-15',
    categoryId: 'lvi-vesi',
    previousScore: 3 as ConditionScore,
    newScore: 2 as ConditionScore,
    notes: 'Putkistovuoto havaittu, linjasaneeraus kiireellinen',
    evaluatedBy: 'Matti Virtanen',
  },
]

// Sample apartments for demo building (kerrostalo)
import type { Apartment, ApartmentEvaluation, BuildingApartmentSummary } from './kuntoarvio-types'

export const sampleApartments: Apartment[] = [
  { id: 'apt-a1', buildingId: 'prop-1', number: 'A 1', floor: 1, squareMeters: 45, rooms: '2h+k', tenant: 'Vuokralainen', rentEndDate: '2025-12-31', lastInspection: '2024-10-15', overallCondition: 4, notes: 'Hyvässä kunnossa' },
  { id: 'apt-a2', buildingId: 'prop-1', number: 'A 2', floor: 1, squareMeters: 32, rooms: '1h+k', tenant: 'Vuokralainen', lastInspection: '2024-10-15', overallCondition: 3 },
  { id: 'apt-a3', buildingId: 'prop-1', number: 'A 3', floor: 1, squareMeters: 65, rooms: '3h+k', lastInspection: '2024-10-15', overallCondition: 5 },
  { id: 'apt-a4', buildingId: 'prop-1', number: 'A 4', floor: 2, squareMeters: 45, rooms: '2h+k', tenant: 'Vuokralainen', lastInspection: '2024-08-20', overallCondition: 2, notes: 'Keittiöremontti tarpeen' },
  { id: 'apt-a5', buildingId: 'prop-1', number: 'A 5', floor: 2, squareMeters: 32, rooms: '1h+k', tenant: 'Vuokralainen', lastInspection: '2024-08-20', overallCondition: 4 },
  { id: 'apt-a6', buildingId: 'prop-1', number: 'A 6', floor: 2, squareMeters: 65, rooms: '3h+k', tenant: 'Vuokralainen', rentEndDate: '2025-06-30', lastInspection: '2024-08-20', overallCondition: 3, notes: 'Kylpyhuoneen silikonit uusittava' },
  { id: 'apt-a7', buildingId: 'prop-1', number: 'A 7', floor: 3, squareMeters: 45, rooms: '2h+k', tenant: 'Vuokralainen', lastInspection: '2024-11-01', overallCondition: 4 },
  { id: 'apt-a8', buildingId: 'prop-1', number: 'A 8', floor: 3, squareMeters: 32, rooms: '1h+k', lastInspection: '2024-11-01', overallCondition: 2, notes: 'Märkätilaremontti kiireellinen' },
  { id: 'apt-a9', buildingId: 'prop-1', number: 'A 9', floor: 3, squareMeters: 65, rooms: '3h+k', tenant: 'Vuokralainen', lastInspection: '2024-11-01', overallCondition: 5 },
  { id: 'apt-b1', buildingId: 'prop-1', number: 'B 1', floor: 1, squareMeters: 55, rooms: '2h+k+s', tenant: 'Vuokralainen', lastInspection: '2024-09-15', overallCondition: 4 },
  { id: 'apt-b2', buildingId: 'prop-1', number: 'B 2', floor: 1, squareMeters: 75, rooms: '3h+k+s', tenant: 'Vuokralainen', rentEndDate: '2025-08-31', lastInspection: '2024-09-15', overallCondition: 3 },
  { id: 'apt-b3', buildingId: 'prop-1', number: 'B 3', floor: 2, squareMeters: 55, rooms: '2h+k+s', lastInspection: '2024-09-15', overallCondition: 1, notes: 'Vesivahinko, täysremontti tarpeen' },
  { id: 'apt-b4', buildingId: 'prop-1', number: 'B 4', floor: 2, squareMeters: 75, rooms: '3h+k+s', tenant: 'Vuokralainen', lastInspection: '2024-09-15', overallCondition: 4 },
  { id: 'apt-b5', buildingId: 'prop-1', number: 'B 5', floor: 3, squareMeters: 55, rooms: '2h+k+s', tenant: 'Vuokralainen', lastInspection: '2024-07-10', overallCondition: 3, notes: 'Lattian uusiminen suositeltava' },
  { id: 'apt-b6', buildingId: 'prop-1', number: 'B 6', floor: 3, squareMeters: 75, rooms: '3h+k+s', tenant: 'Vuokralainen', lastInspection: '2024-07-10', overallCondition: 4 },
]

export const sampleApartmentEvaluations: ApartmentEvaluation[] = [
  {
    apartmentId: 'apt-a4',
    date: '2024-08-20',
    evaluatedBy: 'Demo Tarkastaja',
    overallScore: 2,
    categoryScores: [
      { categoryId: 'sisatilat-pinnat', score: 3, notes: 'Seinämaalit kulunut' },
      { categoryId: 'sisatilat-kalusteet', score: 2, notes: 'Keittiökalusteet käyttöikänsä päässä', estimatedCost: 8500 },
      { categoryId: 'markatilat', score: 3 },
      { categoryId: 'sahko', score: 4 },
    ],
    notes: 'Keittiöremontti suositeltava ennen seuraavaa vuokralaista',
  },
  {
    apartmentId: 'apt-a8',
    date: '2024-11-01',
    evaluatedBy: 'Demo Tarkastaja',
    overallScore: 2,
    categoryScores: [
      { categoryId: 'sisatilat-pinnat', score: 4 },
      { categoryId: 'sisatilat-kalusteet', score: 4 },
      { categoryId: 'markatilat', score: 1, notes: 'Vedeneristys pettänyt, laatat irti', estimatedCost: 12000 },
      { categoryId: 'sahko', score: 3 },
    ],
    notes: 'Märkätilaremontti kiireellinen - kosteusvaurioriski',
  },
  {
    apartmentId: 'apt-b3',
    date: '2024-09-15',
    evaluatedBy: 'Demo Tarkastaja',
    overallScore: 1,
    categoryScores: [
      { categoryId: 'sisatilat-pinnat', score: 1, notes: 'Vesivahingon jäljet, homevaurio', estimatedCost: 15000 },
      { categoryId: 'sisatilat-kalusteet', score: 1, notes: 'Kaikki kalusteet uusittava', estimatedCost: 10000 },
      { categoryId: 'markatilat', score: 1, notes: 'Täysremontti', estimatedCost: 14000 },
      { categoryId: 'sahko', score: 2, notes: 'Sähköt tarkistettava', estimatedCost: 3000 },
    ],
    notes: 'Vesivahinko yläkerran vuodosta. Asunto tyhjillään, täysremontti vaaditaan.',
  },
]

export function getApartmentSummary(apartments: Apartment[]): BuildingApartmentSummary {
  const needsAttention = apartments.filter(a => a.overallCondition <= 2).length
  const avgCondition = apartments.reduce((sum, a) => sum + a.overallCondition, 0) / apartments.length
  const occupiedUnits = apartments.filter(a => a.tenant).length
  
  return {
    totalUnits: apartments.length,
    occupiedUnits,
    avgCondition: Math.round(avgCondition * 10) / 10,
    needsAttention,
    upcomingRenovations: needsAttention,
  }
}
