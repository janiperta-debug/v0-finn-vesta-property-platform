// RT-korttien mukaiset rakennusosien käyttöiät ja kuntoluokitus
// Perustuu RT 18-10922 ja TALO 2000 -nimikkeistöön

// Mapping from string category IDs to database integer IDs
// These match the inspection_categories table in Supabase
export const categoryIdMapping: Record<string, number> = {
  'perustukset': 1,
  'runko': 2,
  'julkisivut': 3,
  'ikkunat': 4,
  'ovet': 5,
  'vesikatto': 6,
  'ylapohja': 7,
  'sisatilat': 8,
  'lammitys': 9,
  'ilmanvaihto': 10,
  'vesi': 11,
  'sahko': 12,
  'hissit': 13,
  'piha': 14,
  'talotekniikka': 15,
  'turvallisuus': 16,
  'energia': 17,
}

export interface ComponentLifespan {
  id: string
  name: string
  categoryId: string // Maps to kuntoarvio-data categories
  options: {
    value: string
    label: string
    lifespanYears: number // Typical lifespan in years
    costPerSqm?: number // Estimated replacement cost €/m²
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
    name: 'Perustukset',
    categoryId: 'perustukset',
    options: [
      { value: 'betoni', label: 'Betonianturaperustus', lifespanYears: 100, costPerSqm: 150 },
      { value: 'pilari', label: 'Pilarianturaperustus', lifespanYears: 100, costPerSqm: 120 },
      { value: 'laatta', label: 'Laattaperustus', lifespanYears: 80, costPerSqm: 100 },
      { value: 'puu', label: 'Puuperustus/rossipohja', lifespanYears: 50, costPerSqm: 80 },
    ]
  },
  {
    id: 'frame',
    name: 'Runko',
    categoryId: 'runko',
    options: [
      { value: 'betoni', label: 'Betonirunko', lifespanYears: 100, costPerSqm: 200 },
      { value: 'teräs', label: 'Teräsrunko', lifespanYears: 100, costPerSqm: 180 },
      { value: 'tiili', label: 'Tiilirunko', lifespanYears: 100, costPerSqm: 160 },
      { value: 'puu', label: 'Puurunko', lifespanYears: 80, costPerSqm: 120 },
      { value: 'hirsi', label: 'Hirsirunko', lifespanYears: 100, costPerSqm: 180 },
    ]
  },
  {
    id: 'facade',
    name: 'Julkisivu',
    categoryId: 'julkisivut',
    options: [
      { value: 'tiili', label: 'Tiili / Klinkkeri', lifespanYears: 60, costPerSqm: 150 },
      { value: 'rappaus', label: 'Rappaus', lifespanYears: 35, costPerSqm: 80 },
      { value: 'betoni', label: 'Betonielementti', lifespanYears: 50, costPerSqm: 120 },
      { value: 'puu', label: 'Puuverhous', lifespanYears: 30, costPerSqm: 60 },
      { value: 'levy', label: 'Levyverhous', lifespanYears: 40, costPerSqm: 70 },
      { value: 'metalli', label: 'Metallipaneeli', lifespanYears: 45, costPerSqm: 90 },
    ]
  },
  {
    id: 'roof',
    name: 'Vesikatto',
    categoryId: 'vesikatto',
    options: [
      { value: 'pelti', label: 'Peltikate', lifespanYears: 45, costPerSqm: 50 },
      { value: 'tiili', label: 'Tiilikate', lifespanYears: 50, costPerSqm: 60 },
      { value: 'huopa', label: 'Bitumikermi / Huopa', lifespanYears: 25, costPerSqm: 40 },
      { value: 'konesauma', label: 'Konesaumakate', lifespanYears: 50, costPerSqm: 70 },
      { value: 'betoni', label: 'Betonitiilikate', lifespanYears: 40, costPerSqm: 55 },
    ]
  },
  {
    id: 'windows',
    name: 'Ikkunat ja ovet',
    categoryId: 'ikkunat',
    options: [
      { value: 'puu2', label: 'Puuikkunat 2-lasinen', lifespanYears: 35, costPerSqm: 400 },
      { value: 'puu3', label: 'Puuikkunat 3-lasinen', lifespanYears: 40, costPerSqm: 500 },
      { value: 'alumiini', label: 'Alumiini-ikkunat', lifespanYears: 45, costPerSqm: 550 },
      { value: 'puualu', label: 'Puu-alumiini-ikkunat', lifespanYears: 50, costPerSqm: 600 },
      { value: 'muovi', label: 'Muovi-ikkunat', lifespanYears: 30, costPerSqm: 350 },
    ]
  },
  {
    id: 'heating',
    name: 'Lämmitysjärjestelmä',
    categoryId: 'lammitys',
    options: [
      { value: 'kaukolampo', label: 'Kaukolämpö', lifespanYears: 30, costPerSqm: 25 },
      { value: 'oljy', label: 'Öljylämmitys', lifespanYears: 25, costPerSqm: 30 },
      { value: 'maalampö', label: 'Maalämpö', lifespanYears: 25, costPerSqm: 80 },
      { value: 'sahko', label: 'Suora sähkölämmitys', lifespanYears: 30, costPerSqm: 15 },
      { value: 'ilmalampopumppu', label: 'Ilmalämpöpumppu', lifespanYears: 15, costPerSqm: 20 },
      { value: 'pelletti', label: 'Pelletti/Hake', lifespanYears: 20, costPerSqm: 35 },
    ]
  },
  {
    id: 'ventilation',
    name: 'Ilmanvaihto',
    categoryId: 'ilmanvaihto',
    options: [
      { value: 'painovoimainen', label: 'Painovoimainen', lifespanYears: 50, costPerSqm: 10 },
      { value: 'koneellinen_poisto', label: 'Koneellinen poisto', lifespanYears: 25, costPerSqm: 30 },
      { value: 'koneellinen_tulo_poisto', label: 'Koneellinen tulo/poisto', lifespanYears: 25, costPerSqm: 50 },
      { value: 'lto', label: 'Koneellinen + LTO', lifespanYears: 25, costPerSqm: 70 },
    ]
  },
  {
    id: 'plumbing',
    name: 'Vesi- ja viemärijärjestelmät',
    categoryId: 'vesi',
    options: [
      { value: 'kupari', label: 'Kupariputket', lifespanYears: 50, costPerSqm: 40 },
      { value: 'muovi', label: 'Muoviputket (PEX)', lifespanYears: 50, costPerSqm: 35 },
      { value: 'galvanoitu', label: 'Galvanoidut putket', lifespanYears: 30, costPerSqm: 30 },
      { value: 'valurauta', label: 'Valurautaviemärit', lifespanYears: 50, costPerSqm: 45 },
      { value: 'muoviviemari', label: 'Muoviviemärit', lifespanYears: 50, costPerSqm: 35 },
    ]
  },
  {
    id: 'electrical',
    name: 'Sähköjärjestelmät',
    categoryId: 'sahko',
    options: [
      { value: 'alkuperainen_60_70', label: 'Alkuperäinen 1960-70 luku', lifespanYears: 40, costPerSqm: 50 },
      { value: 'alkuperainen_80_90', label: 'Alkuperäinen 1980-90 luku', lifespanYears: 45, costPerSqm: 50 },
      { value: 'uusittu', label: 'Täysin uusittu', lifespanYears: 50, costPerSqm: 60 },
      { value: 'osittain_uusittu', label: 'Osittain uusittu', lifespanYears: 40, costPerSqm: 55 },
    ]
  },
  {
    id: 'elevator',
    name: 'Hissi',
    categoryId: 'hissit',
    options: [
      { value: 'ei', label: 'Ei hissiä', lifespanYears: 999, costPerSqm: 0 },
      { value: 'vanha', label: 'Alkuperäinen hissi', lifespanYears: 30, costPerSqm: 20 },
      { value: 'modernisoitu', label: 'Modernisoitu hissi', lifespanYears: 25, costPerSqm: 15 },
      { value: 'uusi', label: 'Uusi hissi', lifespanYears: 30, costPerSqm: 25 },
    ]
  },
]

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

// Calculate estimated repair cost
export function calculateRepairCost(
  squareMeters: number,
  componentCostPerSqm: number,
  conditionScore: number
): number {
  // Lower condition = higher percentage of full replacement cost
  const costMultiplier = {
    5: 0, // No cost for excellent condition
    4: 0.1, // 10% for good
    3: 0.3, // 30% for satisfactory
    2: 0.6, // 60% for fair
    1: 1.0, // 100% for poor
  }[conditionScore] || 0

  return Math.round(squareMeters * componentCostPerSqm * costMultiplier)
}

// Generate initial building assessment based on RT standards
export interface GeneratedAssessment {
  categoryId: number // Numeric ID matching inspection_categories table
  categoryName: string
  conditionScore: number
  urgencyClass: number
  estimatedRepairCost: number
  remainingLifespan: number
  notes: string
}

export function generateInitialAssessment(
  buildYear: number,
  squareMeters: number,
  structures: BuildingStructureData
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
    const estimatedRepairCost = calculateRepairCost(
      squareMeters,
      option.costPerSqm || 50,
      conditionScore
    )

    // Generate descriptive notes
    let notes = `${option.label}, rakennettu ${buildYear}. `
    if (conditionScore <= 2) {
      notes += `Käyttöikä (${option.lifespanYears}v) ylittynyt tai ylittymässä. `
    } else if (conditionScore === 3) {
      notes += `Käyttöiästä kulunut ${Math.round((age / option.lifespanYears) * 100)}%. `
    }
    if (remainingLifespan <= 0) {
      notes += 'Uusiminen ajankohtaista.'
    } else if (remainingLifespan <= 5) {
      notes += `Uusimistarve ${remainingLifespan} vuoden sisällä.`
    } else if (remainingLifespan <= 10) {
      notes += `Suunnittele uusiminen ${remainingLifespan} vuoden sisällä.`
    }

    assessments.push({
      categoryId: categoryIdMapping[component.categoryId] || 0, // Use numeric ID for database
      categoryName: component.name,
      conditionScore,
      urgencyClass,
      estimatedRepairCost,
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

// Calculate total repair debt
export function calculateTotalRepairDebt(assessments: GeneratedAssessment[]): number {
  return assessments.reduce((sum, a) => sum + a.estimatedRepairCost, 0)
}
