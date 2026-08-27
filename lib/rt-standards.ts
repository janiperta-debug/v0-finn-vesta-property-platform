// RT-korttien mukaiset rakennusosien käyttöiät ja kuntoluokitus
// Perustuu RT 18-10922 ja TALO 2000 -nimikkeistöön

// Mapping from string category IDs to database integer IDs
// These match the inspection_categories table in Supabase
export const categoryIdMapping: Record<string, number> = {
  // Rakenteet
  'perustukset': 1,
  'runko': 2,
  'julkisivut': 3,
  'ikkunat': 4,
  'ovet': 5,
  'katto': 6,
  'vesikate': 7,
  // Sisätilat
  'sisatilat-pinnat': 8,
  'sisatilat-kalusteet': 9,
  'markatilat': 10,
  // LVI
  'lvi-lammitys': 11,
  'lvi-vesi': 12,
  'lvi-ilmanvaihto': 13,
  // Sähkö ja hissit
  'sahko': 14,
  'hissi': 15,
  // Piha ja erityis
  'piha': 16,
  'erityisrakenteet': 17,
  // Legacy mappings (for older data)
  'vesikatto': 6,
  'ylapohja': 6,
  'sisatilat': 8,
  'lammitys': 11,
  'ilmanvaihto': 13,
  'vesi': 12,
  'hissit': 15,
  'talotekniikka': 11,
  'turvallisuus': 14,
  'energia': 11,
}

export interface ComponentLifespan {
  id: string
  categoryId: string // Maps to kuntoarvio-data categories
  options: {
    value: string
    lifespanYears: number // Typical lifespan in years
  }[]
}

export interface BuildingStructureData {
  foundation: string // Perustus
  frame: string // Runko
  facade: string // Julkisivu
  roof: string // Vesikatto
  windows: string // Ikkunat
  heating: string // Lämmitys
  ventilation: string // Ilmanvaihto
  plumbing: string // Vesi- ja viemäri
  electrical: string // Sähkö
  elevator?: string // Hissi (optional)
}

// RT-standardien mukaiset käyttöiät
export const componentLifespans: ComponentLifespan[] = [
  {
    id: 'foundation',
    categoryId: 'perustukset',
    options: [
      { value: 'betoni', lifespanYears: 100 },
      { value: 'pilari', lifespanYears: 100 },
      { value: 'laatta', lifespanYears: 80 },
      { value: 'puu', lifespanYears: 50 },
    ]
  },
  {
    id: 'frame',
    categoryId: 'runko',
    options: [
      { value: 'betoni', lifespanYears: 100 },
      { value: 'teräs', lifespanYears: 100 },
      { value: 'tiili', lifespanYears: 100 },
      { value: 'puu', lifespanYears: 80 },
      { value: 'hirsi', lifespanYears: 100 },
    ]
  },
  {
    id: 'facade',
    categoryId: 'julkisivut',
    options: [
      { value: 'tiili', lifespanYears: 60 },
      { value: 'rappaus', lifespanYears: 35 },
      { value: 'betoni', lifespanYears: 50 },
      { value: 'puu', lifespanYears: 30 },
      { value: 'levy', lifespanYears: 40 },
      { value: 'metalli', lifespanYears: 45 },
    ]
  },
  {
    id: 'roof',
    categoryId: 'vesikatto',
    options: [
      { value: 'pelti', lifespanYears: 45 },
      { value: 'tiili', lifespanYears: 50 },
      { value: 'huopa', lifespanYears: 25 },
      { value: 'konesauma', lifespanYears: 50 },
      { value: 'betoni', lifespanYears: 40 },
    ]
  },
  {
    id: 'windows',
    categoryId: 'ikkunat',
    options: [
      { value: 'puu2', lifespanYears: 35 },
      { value: 'puu3', lifespanYears: 40 },
      { value: 'alumiini', lifespanYears: 45 },
      { value: 'puualu', lifespanYears: 50 },
      { value: 'muovi', lifespanYears: 30 },
    ]
  },
  {
    id: 'heating',
    categoryId: 'lammitys',
    options: [
      { value: 'kaukolampo', lifespanYears: 30 },
      { value: 'oljy', lifespanYears: 25 },
      { value: 'maalampö', lifespanYears: 25 },
      { value: 'sahko', lifespanYears: 30 },
      { value: 'ilmalampopumppu', lifespanYears: 15 },
      { value: 'pelletti', lifespanYears: 20 },
    ]
  },
  {
    id: 'ventilation',
    categoryId: 'ilmanvaihto',
    options: [
      { value: 'painovoimainen', lifespanYears: 50 },
      { value: 'koneellinen_poisto', lifespanYears: 25 },
      { value: 'koneellinen_tulo_poisto', lifespanYears: 25 },
      { value: 'lto', lifespanYears: 25 },
    ]
  },
  {
    id: 'plumbing',
    categoryId: 'vesi',
    options: [
      { value: 'kupari', lifespanYears: 50 },
      { value: 'muovi', lifespanYears: 50 },
      { value: 'galvanoitu', lifespanYears: 30 },
      { value: 'valurauta', lifespanYears: 50 },
      { value: 'muoviviemari', lifespanYears: 50 },
    ]
  },
  {
    id: 'electrical',
    categoryId: 'sahko',
    options: [
      { value: 'alkuperainen_60_70', lifespanYears: 40 },
      { value: 'alkuperainen_80_90', lifespanYears: 45 },
      { value: 'uusittu', lifespanYears: 50 },
      { value: 'osittain_uusittu', lifespanYears: 40 },
    ]
  },
  {
    id: 'elevator',
    categoryId: 'hissit',
    options: [
      { value: 'ei', lifespanYears: 999 },
      { value: 'vanha', lifespanYears: 30 },
      { value: 'modernisoitu', lifespanYears: 25 },
      { value: 'uusi', lifespanYears: 30 },
    ]
  },
]

// Translator function type. Callers pass their `t` from useTranslation() /
// getTranslation(); dynamic keys are safe because t() falls back to the raw
// key if a generated key is ever missing.
export type Translator = (key: string) => string

export function getComponentName(componentId: string, t: Translator): string {
  return t(`kuntoarvioData.structName_${componentId}`)
}

export function getComponentOptionLabel(componentId: string, value: string, t: Translator): string {
  return t(`kuntoarvioData.structOpt_${componentId}_${value}`)
}

// Calculate condition score (1-5) based on age and lifespan
export function calculateConditionScore(
  buildYear: number,
  componentLifespanYears: number,
  lastRenovationYear?: number
): number {
  const currentYear = new Date().getFullYear()
  const referenceYear = lastRenovationYear || buildYear
  const age = currentYear - referenceYear
  const lifespanPercentage = (age / componentLifespanYears) * 100

  // Score based on percentage of lifespan consumed
  if (lifespanPercentage <= 20) return 5 // Erinomainen
  if (lifespanPercentage <= 40) return 4 // Hyvä
  if (lifespanPercentage <= 60) return 3 // Tyydyttävä
  if (lifespanPercentage <= 80) return 2 // Välttävä
  return 1 // Heikko - over 80% of lifespan
}

// Calculate urgency class based on remaining lifespan
export function calculateUrgencyClass(
  buildYear: number,
  componentLifespanYears: number,
  lastRenovationYear?: number
): number {
  const currentYear = new Date().getFullYear()
  const referenceYear = lastRenovationYear || buildYear
  const age = currentYear - referenceYear
  const remainingYears = componentLifespanYears - age

  if (remainingYears <= 0) return 1 // Välitön
  if (remainingYears <= 5) return 2 // Kiireellinen
  if (remainingYears <= 10) return 3 // Suunniteltava
  return 4 // Seurattava
}

// Generate initial building assessment based on RT standards
export interface GeneratedAssessment {
  categoryId: number // Numeric ID matching inspection_categories table
  categoryName: string
  conditionScore: number
  urgencyClass: number
  remainingLifespan: number
  notes: string
}

export function generateInitialAssessment(
  buildYear: number,
  _squareMeters: number,
  structures: BuildingStructureData,
  t: Translator
): GeneratedAssessment[] {
  const assessments: GeneratedAssessment[] = []
  const currentYear = new Date().getFullYear()

  for (const component of componentLifespans) {
    const structureValue = structures[component.id as keyof BuildingStructureData]
    if (!structureValue) continue

    const option = component.options.find(o => o.value === structureValue)
    if (!option) continue

    // Skip if "no elevator"
    if (component.id === 'elevator' && structureValue === 'ei') continue

    const conditionScore = calculateConditionScore(buildYear, option.lifespanYears)
    const urgencyClass = calculateUrgencyClass(buildYear, option.lifespanYears)
    const age = currentYear - buildYear
    const remainingLifespan = Math.max(0, option.lifespanYears - age)
    // Generate descriptive notes
    const optionLabel = getComponentOptionLabel(component.id, option.value, t)
    let notes = `${optionLabel}, ${t('kuntoarvioData.notesBuiltPrefix')} ${buildYear}. `
    if (conditionScore <= 2) {
      notes += `${t('kuntoarvioData.notesLifespanLabel')} (${option.lifespanYears}v) ${t('kuntoarvioData.notesLifespanExceededSuffix')}. `
    } else if (conditionScore === 3) {
      notes += `${t('kuntoarvioData.notesLifespanUsedPrefix')} ${Math.round((age / option.lifespanYears) * 100)}%. `
    }
    if (remainingLifespan <= 0) {
      notes += t('kuntoarvioData.notesRenewalNow')
    } else if (remainingLifespan <= 5) {
      notes += `${t('kuntoarvioData.notesRenewalNeededPrefix')} ${remainingLifespan} ${t('kuntoarvioData.notesRenewalNeededSuffix')}`
    } else if (remainingLifespan <= 10) {
      notes += `${t('kuntoarvioData.notesPlanRenewalPrefix')} ${remainingLifespan} ${t('kuntoarvioData.notesPlanRenewalSuffix')}`
    }

    assessments.push({
      categoryId: categoryIdMapping[component.categoryId] || 0, // Use numeric ID for database
      categoryName: getComponentName(component.id, t),
      conditionScore,
      urgencyClass,
      remainingLifespan,
      notes: notes.trim(),
    })
  }

  return assessments
}

// Calculate overall building condition from component assessments
export function calculateOverallCondition(assessments: GeneratedAssessment[]): number {
  if (assessments.length === 0) return 3

  // Weighted average - structural components have higher weight (using numeric IDs)
  const weights: Record<number, number> = {
    1: 1.5,  // perustukset
    2: 1.5,  // runko
    3: 1.2,  // julkisivut
    6: 1.3,  // vesikatto
    4: 1.0,  // ikkunat
    9: 1.1,  // lammitys
    10: 1.0, // ilmanvaihto
    11: 1.2, // vesi
    12: 1.0, // sahko
    13: 0.8, // hissit
  }

  let totalWeight = 0
  let weightedSum = 0

  for (const assessment of assessments) {
    const weight = weights[assessment.categoryId] || 1.0
    weightedSum += assessment.conditionScore * weight
    totalWeight += weight
  }

  return Math.round((weightedSum / totalWeight) * 10) / 10
}
