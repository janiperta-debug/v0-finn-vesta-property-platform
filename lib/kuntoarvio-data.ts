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
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
  },
  {
    score: 4,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
  },
  {
    score: 3,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
  },
  {
    score: 2,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
  },
  {
    score: 1,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
  },
]

// Urgency Class definitions (1-4)
export const urgencyClasses: UrgencyClassInfo[] = [
  {
    urgency: 1,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  {
    urgency: 2,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  {
    urgency: 3,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  {
    urgency: 4,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
]

// All 17 Categories with sub-items
export const categories: Category[] = [
  {
    id: 'perustukset',
    icon: 'foundation',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'perustukset-anturat', categoryId: 'perustukset' },
      { id: 'perustukset-perusmuuri', categoryId: 'perustukset' },
      { id: 'perustukset-alapohja', categoryId: 'perustukset' },
      { id: 'perustukset-salaojat', categoryId: 'perustukset' },
      { id: 'perustukset-routasuojaus', categoryId: 'perustukset' },
    ],
  },
  {
    id: 'runko',
    icon: 'building',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'runko-kantavat', categoryId: 'runko' },
      { id: 'runko-valipohjat', categoryId: 'runko' },
      { id: 'runko-palkit', categoryId: 'runko' },
      { id: 'runko-jäykistys', categoryId: 'runko' },
    ],
  },
  {
    id: 'julkisivut',
    icon: 'building-2',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'julkisivut-rappaus', categoryId: 'julkisivut' },
      { id: 'julkisivut-tiili', categoryId: 'julkisivut' },
      { id: 'julkisivut-puu', categoryId: 'julkisivut' },
      { id: 'julkisivut-metalli', categoryId: 'julkisivut' },
      { id: 'julkisivut-saumaukset', categoryId: 'julkisivut' },
      { id: 'julkisivut-sokkeli', categoryId: 'julkisivut' },
    ],
  },
  {
    id: 'ikkunat',
    icon: 'square',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'ikkunat-puitteet', categoryId: 'ikkunat' },
      { id: 'ikkunat-lasit', categoryId: 'ikkunat' },
      { id: 'ikkunat-tiivisteet', categoryId: 'ikkunat' },
      { id: 'ikkunat-helat', categoryId: 'ikkunat' },
      { id: 'ikkunat-pellitys', categoryId: 'ikkunat' },
    ],
  },
  {
    id: 'ovet',
    icon: 'door-open',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'ovet-ulko', categoryId: 'ovet' },
      { id: 'ovet-parveke', categoryId: 'ovet' },
      { id: 'ovet-porras', categoryId: 'ovet' },
      { id: 'ovet-palo', categoryId: 'ovet' },
      { id: 'ovet-autohalli', categoryId: 'ovet' },
    ],
  },
  {
    id: 'katto',
    icon: 'home',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'katto-rakenne', categoryId: 'katto' },
      { id: 'katto-eristys', categoryId: 'katto' },
      { id: 'katto-tuuletus', categoryId: 'katto' },
      { id: 'katto-hoitotasot', categoryId: 'katto' },
    ],
  },
  {
    id: 'vesikate',
    icon: 'cloud-rain',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'vesikate-kate', categoryId: 'vesikate' },
      { id: 'vesikate-läpiviennit', categoryId: 'vesikate' },
      { id: 'vesikate-räystäät', categoryId: 'vesikate' },
      { id: 'vesikate-sadevesi', categoryId: 'vesikate' },
      { id: 'vesikate-turva', categoryId: 'vesikate' },
    ],
  },
  {
    id: 'sisatilat-pinnat',
    icon: 'paint-bucket',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'muu'],
    subItems: [
      { id: 'sisatilat-pinnat-seinat', categoryId: 'sisatilat-pinnat' },
      { id: 'sisatilat-pinnat-katot', categoryId: 'sisatilat-pinnat' },
      { id: 'sisatilat-pinnat-lattiat', categoryId: 'sisatilat-pinnat' },
      { id: 'sisatilat-pinnat-listat', categoryId: 'sisatilat-pinnat' },
    ],
  },
  {
    id: 'sisatilat-kalusteet',
    icon: 'armchair',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'muu'],
    subItems: [
      { id: 'sisatilat-kalusteet-keittio', categoryId: 'sisatilat-kalusteet' },
      { id: 'sisatilat-kalusteet-kiintokalusteet', categoryId: 'sisatilat-kalusteet' },
      { id: 'sisatilat-kalusteet-tasot', categoryId: 'sisatilat-kalusteet' },
      { id: 'sisatilat-kalusteet-kodinkoneet', categoryId: 'sisatilat-kalusteet' },
    ],
  },
  {
    id: 'markatilat',
    icon: 'droplets',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'muu'],
    subItems: [
      { id: 'markatilat-vedeneristys', categoryId: 'markatilat' },
      { id: 'markatilat-laatoitus', categoryId: 'markatilat' },
      { id: 'markatilat-kalusteet', categoryId: 'markatilat' },
      { id: 'markatilat-lattiakaivo', categoryId: 'markatilat' },
      { id: 'markatilat-silikonit', categoryId: 'markatilat' },
    ],
  },
  {
    id: 'lvi-lammitys',
    icon: 'thermometer',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'lvi-lammitys-kattila', categoryId: 'lvi-lammitys' },
      { id: 'lvi-lammitys-patterit', categoryId: 'lvi-lammitys' },
      { id: 'lvi-lammitys-lattia', categoryId: 'lvi-lammitys' },
      { id: 'lvi-lammitys-putkistot', categoryId: 'lvi-lammitys' },
      { id: 'lvi-lammitys-saato', categoryId: 'lvi-lammitys' },
    ],
  },
  {
    id: 'lvi-vesi',
    icon: 'pipette',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'muu'],
    subItems: [
      { id: 'lvi-vesi-kayttovesi', categoryId: 'lvi-vesi' },
      { id: 'lvi-vesi-viemari', categoryId: 'lvi-vesi' },
      { id: 'lvi-vesi-vesikalusteet', categoryId: 'lvi-vesi' },
      { id: 'lvi-vesi-lamminvesi', categoryId: 'lvi-vesi' },
      { id: 'lvi-vesi-pumput', categoryId: 'lvi-vesi' },
    ],
  },
  {
    id: 'lvi-ilmanvaihto',
    icon: 'wind',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'lvi-ilmanvaihto-kone', categoryId: 'lvi-ilmanvaihto' },
      { id: 'lvi-ilmanvaihto-kanavat', categoryId: 'lvi-ilmanvaihto' },
      { id: 'lvi-ilmanvaihto-paatteet', categoryId: 'lvi-ilmanvaihto' },
      { id: 'lvi-ilmanvaihto-suodattimet', categoryId: 'lvi-ilmanvaihto' },
      { id: 'lvi-ilmanvaihto-lto', categoryId: 'lvi-ilmanvaihto' },
    ],
  },
  {
    id: 'sahko',
    icon: 'zap',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'sahko-keskus', categoryId: 'sahko' },
      { id: 'sahko-johdotus', categoryId: 'sahko' },
      { id: 'sahko-pistorasiat', categoryId: 'sahko' },
      { id: 'sahko-valaistus', categoryId: 'sahko' },
      { id: 'sahko-turva', categoryId: 'sahko' },
      { id: 'sahko-tele', categoryId: 'sahko' },
    ],
  },
  {
    id: 'hissi',
    icon: 'move-vertical',
    applicableToTypes: ['kerrostalo', 'toimisto', 'liiketila', 'teollisuus', 'muu'],
    subItems: [
      { id: 'hissi-koneisto', categoryId: 'hissi' },
      { id: 'hissi-kori', categoryId: 'hissi' },
      { id: 'hissi-ovet', categoryId: 'hissi' },
      { id: 'hissi-ohjaus', categoryId: 'hissi' },
      { id: 'hissi-turva', categoryId: 'hissi' },
    ],
  },
  {
    id: 'piha',
    icon: 'trees',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'piha-asfaltti', categoryId: 'piha' },
      { id: 'piha-kiveys', categoryId: 'piha' },
      { id: 'piha-viheralueet', categoryId: 'piha' },
      { id: 'piha-aidat', categoryId: 'piha' },
      { id: 'piha-leikki', categoryId: 'piha' },
      { id: 'piha-valaistus', categoryId: 'piha' },
      { id: 'piha-autopaikat', categoryId: 'piha' },
    ],
  },
  {
    id: 'erityisrakenteet',
    icon: 'construction',
    applicableToTypes: ['kerrostalo', 'rivitalo', 'paritalo', 'omakotitalo', 'toimisto', 'liiketila', 'teollisuus', 'varasto', 'muu'],
    subItems: [
      { id: 'erityis-parvekkeet', categoryId: 'erityisrakenteet' },
      { id: 'erityis-terassit', categoryId: 'erityisrakenteet' },
      { id: 'erityis-varastorakennukset', categoryId: 'erityisrakenteet' },
      { id: 'erityis-autokatokset', categoryId: 'erityisrakenteet' },
      { id: 'erityis-saunat', categoryId: 'erityisrakenteet' },
      { id: 'erityis-uima-altaat', categoryId: 'erityisrakenteet' },
    ],
  },
]

// Building Type Templates
export const buildingTypeTemplates: BuildingTypeTemplate[] = [
  {
    id: 'kerrostalo',
    includedCategories: categories.map(c => c.id),
  },
  {
    id: 'rivitalo',
    includedCategories: categories.filter(c => c.id !== 'hissi').map(c => c.id),
  },
  {
    id: 'paritalo',
    includedCategories: categories.filter(c => 
      !['hissi', 'sisatilat-kalusteet', 'erityisrakenteet'].includes(c.id)
    ).map(c => c.id),
  },
  {
    id: 'omakotitalo',
    includedCategories: categories.filter(c => 
      !['hissi', 'sisatilat-kalusteet', 'erityisrakenteet', 'lvi-ilmanvaihto'].includes(c.id)
    ).map(c => c.id),
  },
  {
    id: 'toimisto',
    includedCategories: categories.map(c => c.id),
  },
  {
    id: 'liiketila',
    includedCategories: categories.filter(c => 
      !['sisatilat-kalusteet', 'erityisrakenteet'].includes(c.id)
    ).map(c => c.id),
  },
  {
    id: 'teollisuus',
    includedCategories: categories.filter(c => 
      !['sisatilat-kalusteet', 'markatilat', 'erityisrakenteet'].includes(c.id)
    ).map(c => c.id),
  },
  {
    id: 'varasto',
    includedCategories: [
      'perustukset', 'runko', 'julkisivut', 'ovet', 'katto', 'vesikate',
      'lvi-lammitys', 'lvi-ilmanvaihto', 'sahko', 'piha'
    ],
  },
  {
    id: 'muu',
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

// Translator function type. Callers pass their `t` from useTranslation() /
// getTranslation(); dynamic keys are safe because t() falls back to the raw
// key if a generated key is ever missing.
export type Translator = (key: string) => string

export function getCategoryName(id: string, t: Translator): string {
  return t(`kuntoarvioData.cat_${id}`)
}

export function getSubItemName(id: string, t: Translator): string {
  return t(`kuntoarvioData.sub_${id}`)
}

export function getConditionLabel(score: ConditionScore, t: Translator): string {
  return t(`kuntoarvioData.cond_${score}`)
}

export function getConditionDescription(score: ConditionScore, t: Translator): string {
  return t(`kuntoarvioData.condDesc_${score}`)
}

export function getUrgencyLabel(urgency: number, t: Translator): string {
  return t(`kuntoarvioData.urg_${urgency}`)
}

export function getUrgencyTimeframe(urgency: number, t: Translator): string {
  return t(`kuntoarvioData.urgTf_${urgency}`)
}

export function getTemplateName(id: BuildingType, t: Translator): string {
  return t(`kuntoarvioData.tmplName_${id}`)
}

export function getTemplateDescription(id: BuildingType, t: Translator): string {
  return t(`kuntoarvioData.tmplDesc_${id}`)
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
        { subItemId: 'perustukset-salaojat', score: 3, urgency: 3, notes: 'Salaojien huuhtelu suositeltava 2-3v sisällä' },
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
        { subItemId: 'julkisivut-rappaus', score: 3, urgency: 3, notes: 'Paikkarappaus tarpeen 3-5v sisällä' },
        { subItemId: 'julkisivut-tiili', score: 4, urgency: 4 },
        { subItemId: 'julkisivut-saumaukset', score: 2, urgency: 2, notes: 'Elementtisaumaukset uusittava' },
        { subItemId: 'julkisivut-sokkeli', score: 3, urgency: 3 },
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
        { subItemId: 'ikkunat-puitteet', score: 2, urgency: 2, notes: 'Puuosat lahonneet osittain' },
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
        { subItemId: 'vesikate-kate', score: 3, urgency: 3, notes: 'Uusiminen 5-8v sisällä' },
        { subItemId: 'vesikate-läpiviennit', score: 3, urgency: 3 },
        { subItemId: 'vesikate-räystäät', score: 4, urgency: 4 },
        { subItemId: 'vesikate-sadevesi', score: 3, urgency: 3 },
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
        { subItemId: 'markatilat-silikonit', score: 2, urgency: 2, notes: 'Silikonit uusittava' },
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
        { subItemId: 'lvi-lammitys-saato', score: 3, urgency: 3, notes: 'Säätöautomatiikan päivitys harkittava' },
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
        { subItemId: 'lvi-vesi-kayttovesi', score: 2, urgency: 2, notes: 'Kupariputket uusittava' },
        { subItemId: 'lvi-vesi-viemari', score: 2, urgency: 2, notes: 'Valurautaviemärit korroosiovaurioita' },
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
        { subItemId: 'sahko-keskus', score: 3, urgency: 3, notes: 'Pääkeskus uusittava 5-10v' },
        { subItemId: 'sahko-johdotus', score: 3, urgency: 3 },
        { subItemId: 'sahko-pistorasiat', score: 4, urgency: 4 },
        { subItemId: 'sahko-valaistus', score: 3, urgency: 4, notes: 'LED-päivitys suositeltava' },
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
        { subItemId: 'hissi-koneisto', score: 3, urgency: 3, notes: 'Modernisointi suunnitteilla' },
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
        { subItemId: 'piha-asfaltti', score: 2, urgency: 2, notes: 'Asfaltin uusiminen tarpeen' },
        { subItemId: 'piha-kiveys', score: 4, urgency: 4 },
        { subItemId: 'piha-viheralueet', score: 4, urgency: 4 },
        { subItemId: 'piha-aidat', score: 3, urgency: 4 },
        { subItemId: 'piha-valaistus', score: 3, urgency: 3 },
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
        { subItemId: 'erityis-parvekkeet', score: 3, urgency: 3, notes: 'Parvekekorjaus 5-8v sisällä' },
        { subItemId: 'erityis-saunat', score: 3, urgency: 3 },
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
      { categoryId: 'sisatilat-kalusteet', score: 2, notes: 'Keittiökalusteet käyttöikänsä päässä' },
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
      { categoryId: 'markatilat', score: 1, notes: 'Vedeneristys pettänyt, laatat irti' },
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
      { categoryId: 'sisatilat-pinnat', score: 1, notes: 'Vesivahingon jäljet, homevaurio' },
      { categoryId: 'sisatilat-kalusteet', score: 1, notes: 'Kaikki kalusteet uusittava' },
      { categoryId: 'markatilat', score: 1, notes: 'Täysremontti' },
      { categoryId: 'sahko', score: 2, notes: 'Sähköt tarkistettava' },
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

// Export all category IDs as an array
export const allCategoryIds = categories.map(c => c.id)
