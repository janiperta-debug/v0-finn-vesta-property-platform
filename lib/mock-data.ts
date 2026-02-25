// FinnVesta Mock Data - Hyvinkää Kaupunki Sample Portfolio

export interface Property {
  id: string
  name: string
  address: string
  tunnus: string
  ktt: string
  buildYear: number
  squareMeters: number
  jalleenhankintaArvo: number
  tekninenArvo: number
  kuntoluokka: number
  eurPerM2: number
  lastInspectionDate: string
  inspector: string
  type: string
}

export interface ComponentCondition {
  name: string
  nameFi: string
  score: number
  estimatedLifespan: number
  replacementCost: number
  replacementCostPerM2: number
  notes: string
}

export interface InvestmentProject {
  id: string
  propertyId: string
  title: string
  category: string
  aloitusVuosi: number
  kestoVuotta: number
  investointiEur: number
  investointiEurPerM2: number
  priority: "kriittinen" | "tarkea" | "normaali"
  status: "suunniteltu" | "aloitettu" | "valmis" | "lykatty"
}

export const portfolioSummary = {
  totalProperties: 156,
  totalSquareMeters: 342800,
  totalJalleenhankintaArvo: 485000000,
  totalTekninenArvo: 312000000,
  averageKuntoluokka: 64.3,
  totalKorjausVelka: 47200000,
  kunnossapitoTarve: 18500000,
  peruskorjausTarve: 19200000,
  perusparannusTarve: 9500000,
}

export const properties: Property[] = [
  {
    id: "1",
    name: "Keskuskoulu",
    address: "Keskuskatu 12, 05800 Hyvinkää",
    tunnus: "HYV-001",
    ktt: "511",
    buildYear: 1962,
    squareMeters: 4200,
    jalleenhankintaArvo: 8400000,
    tekninenArvo: 3360000,
    kuntoluokka: 40,
    eurPerM2: 800,
    lastInspectionDate: "2025-05-15",
    inspector: "Matti Virtanen",
    type: "Koulu",
  },
  {
    id: "2",
    name: "Hakalantalon päiväkoti",
    address: "Hakalantie 5, 05800 Hyvinkää",
    tunnus: "HYV-002",
    ktt: "611",
    buildYear: 1978,
    squareMeters: 1800,
    jalleenhankintaArvo: 3600000,
    tekninenArvo: 2160000,
    kuntoluokka: 60,
    eurPerM2: 1200,
    lastInspectionDate: "2025-06-02",
    inspector: "Anna Korhonen",
    type: "Päiväkoti",
  },
  {
    id: "3",
    name: "Sveitsin liikuntahalli",
    address: "Sveitsinrinne 4, 05800 Hyvinkää",
    tunnus: "HYV-003",
    ktt: "321",
    buildYear: 1995,
    squareMeters: 6500,
    jalleenhankintaArvo: 15600000,
    tekninenArvo: 11700000,
    kuntoluokka: 75,
    eurPerM2: 1800,
    lastInspectionDate: "2025-04-20",
    inspector: "Matti Virtanen",
    type: "Liikunta",
  },
  {
    id: "4",
    name: "Kaupungintalo",
    address: "Kaupungintalokatu 1, 05800 Hyvinkää",
    tunnus: "HYV-004",
    ktt: "111",
    buildYear: 1970,
    squareMeters: 3800,
    jalleenhankintaArvo: 9500000,
    tekninenArvo: 5700000,
    kuntoluokka: 60,
    eurPerM2: 1500,
    lastInspectionDate: "2025-05-28",
    inspector: "Anna Korhonen",
    type: "Toimisto",
  },
  {
    id: "5",
    name: "Tapainlinnan koulu",
    address: "Tapainlinnankatu 8, 05800 Hyvinkää",
    tunnus: "HYV-005",
    ktt: "511",
    buildYear: 2015,
    squareMeters: 5200,
    jalleenhankintaArvo: 13000000,
    tekninenArvo: 11700000,
    kuntoluokka: 90,
    eurPerM2: 2250,
    lastInspectionDate: "2025-03-10",
    inspector: "Matti Virtanen",
    type: "Koulu",
  },
  {
    id: "6",
    name: "Martintalon päiväkoti",
    address: "Martinkatu 3, 05800 Hyvinkää",
    tunnus: "HYV-006",
    ktt: "611",
    buildYear: 1985,
    squareMeters: 1200,
    jalleenhankintaArvo: 2400000,
    tekninenArvo: 1440000,
    kuntoluokka: 55,
    eurPerM2: 1200,
    lastInspectionDate: "2025-07-14",
    inspector: "Jukka Mäkinen",
    type: "Päiväkoti",
  },
  {
    id: "7",
    name: "Kirjasto - Pääkirjasto",
    address: "Hämeenkatu 2, 05800 Hyvinkää",
    tunnus: "HYV-007",
    ktt: "411",
    buildYear: 1988,
    squareMeters: 2800,
    jalleenhankintaArvo: 5600000,
    tekninenArvo: 3920000,
    kuntoluokka: 70,
    eurPerM2: 1400,
    lastInspectionDate: "2025-04-05",
    inspector: "Anna Korhonen",
    type: "Kulttuuri",
  },
  {
    id: "8",
    name: "Terveyskeskus",
    address: "Sandelininkatu 1, 05800 Hyvinkää",
    tunnus: "HYV-008",
    ktt: "711",
    buildYear: 2005,
    squareMeters: 7200,
    jalleenhankintaArvo: 21600000,
    tekninenArvo: 17280000,
    kuntoluokka: 80,
    eurPerM2: 2400,
    lastInspectionDate: "2025-06-18",
    inspector: "Matti Virtanen",
    type: "Terveys",
  },
  {
    id: "9",
    name: "Hangonsillan koulu",
    address: "Hangonsillankatu 6, 05800 Hyvinkää",
    tunnus: "HYV-009",
    ktt: "511",
    buildYear: 1972,
    squareMeters: 3600,
    jalleenhankintaArvo: 7200000,
    tekninenArvo: 3960000,
    kuntoluokka: 55,
    eurPerM2: 1100,
    lastInspectionDate: "2025-05-22",
    inspector: "Jukka Mäkinen",
    type: "Koulu",
  },
  {
    id: "10",
    name: "Uimahalli",
    address: "Urheilukatu 10, 05800 Hyvinkää",
    tunnus: "HYV-010",
    ktt: "321",
    buildYear: 1980,
    squareMeters: 4500,
    jalleenhankintaArvo: 13500000,
    tekninenArvo: 8100000,
    kuntoluokka: 60,
    eurPerM2: 1800,
    lastInspectionDate: "2025-07-01",
    inspector: "Anna Korhonen",
    type: "Liikunta",
  },
]

export const componentAssessments: Record<string, ComponentCondition[]> = {
  "1": [
    { name: "Structure", nameFi: "Runko", score: 2.5, estimatedLifespan: 15, replacementCost: 2100000, replacementCostPerM2: 500, notes: "Betonin rapautumista havaittavissa" },
    { name: "Facade", nameFi: "Julkisivu", score: 1.5, estimatedLifespan: 5, replacementCost: 840000, replacementCostPerM2: 200, notes: "Halkeamia julkisivussa, maalaus kulunut" },
    { name: "Roof", nameFi: "Katto", score: 2.0, estimatedLifespan: 8, replacementCost: 504000, replacementCostPerM2: 120, notes: "Kattohuopa lopussa, vuotokohtia" },
    { name: "Windows", nameFi: "Ikkunat", score: 1.0, estimatedLifespan: 3, replacementCost: 672000, replacementCostPerM2: 160, notes: "Alkuperäiset puuikkunat, huono tiiveys" },
    { name: "Doors", nameFi: "Ovet", score: 2.5, estimatedLifespan: 10, replacementCost: 168000, replacementCostPerM2: 40, notes: "Ovet toimivat, heloitus kulunut" },
    { name: "Interior walls", nameFi: "Väliseinät", score: 3.0, estimatedLifespan: 15, replacementCost: 336000, replacementCostPerM2: 80, notes: "Kohtuullisessa kunnossa" },
    { name: "HVAC", nameFi: "LVI-järjestelmät", score: 1.5, estimatedLifespan: 5, replacementCost: 1260000, replacementCostPerM2: 300, notes: "Ilmanvaihto puutteellinen, putket osittain korroosioituneita" },
    { name: "Electrical", nameFi: "Sähköjärjestelmät", score: 2.0, estimatedLifespan: 8, replacementCost: 630000, replacementCostPerM2: 150, notes: "Sähköjärjestelmä vanhentunut" },
    { name: "Yard", nameFi: "Piha-alueet", score: 2.5, estimatedLifespan: 10, replacementCost: 420000, replacementCostPerM2: 100, notes: "Piha-alueet tyydyttävässä kunnossa" },
  ],
  "5": [
    { name: "Structure", nameFi: "Runko", score: 5.0, estimatedLifespan: 50, replacementCost: 0, replacementCostPerM2: 0, notes: "Erinomainen kunto" },
    { name: "Facade", nameFi: "Julkisivu", score: 4.5, estimatedLifespan: 30, replacementCost: 0, replacementCostPerM2: 0, notes: "Hyvä kunto" },
    { name: "Roof", nameFi: "Katto", score: 4.5, estimatedLifespan: 25, replacementCost: 0, replacementCostPerM2: 0, notes: "Uusi katto" },
    { name: "Windows", nameFi: "Ikkunat", score: 5.0, estimatedLifespan: 30, replacementCost: 0, replacementCostPerM2: 0, notes: "Uudet ikkunat" },
    { name: "Doors", nameFi: "Ovet", score: 4.5, estimatedLifespan: 25, replacementCost: 0, replacementCostPerM2: 0, notes: "Uudet ovet" },
    { name: "Interior walls", nameFi: "Väliseinät", score: 4.0, estimatedLifespan: 20, replacementCost: 0, replacementCostPerM2: 0, notes: "Hyvä kunto" },
    { name: "HVAC", nameFi: "LVI-järjestelmät", score: 4.5, estimatedLifespan: 25, replacementCost: 0, replacementCostPerM2: 0, notes: "Moderni järjestelmä" },
    { name: "Electrical", nameFi: "Sähköjärjestelmät", score: 4.5, estimatedLifespan: 25, replacementCost: 0, replacementCostPerM2: 0, notes: "Nykyaikainen sähköjärjestelmä" },
    { name: "Yard", nameFi: "Piha-alueet", score: 4.0, estimatedLifespan: 20, replacementCost: 0, replacementCostPerM2: 0, notes: "Hyvin hoidettu" },
  ],
}

// Default component assessment for properties without specific data
export const defaultComponents: ComponentCondition[] = [
  { name: "Structure", nameFi: "Runko", score: 3.0, estimatedLifespan: 20, replacementCost: 500000, replacementCostPerM2: 200, notes: "Tyydyttävä kunto" },
  { name: "Facade", nameFi: "Julkisivu", score: 3.0, estimatedLifespan: 15, replacementCost: 300000, replacementCostPerM2: 120, notes: "Keskimääräinen kunto" },
  { name: "Roof", nameFi: "Katto", score: 3.5, estimatedLifespan: 15, replacementCost: 200000, replacementCostPerM2: 80, notes: "Kohtuullinen kunto" },
  { name: "Windows", nameFi: "Ikkunat", score: 3.0, estimatedLifespan: 12, replacementCost: 250000, replacementCostPerM2: 100, notes: "Toimiva kunto" },
  { name: "Doors", nameFi: "Ovet", score: 3.5, estimatedLifespan: 15, replacementCost: 80000, replacementCostPerM2: 32, notes: "Hyvä kunto" },
  { name: "Interior walls", nameFi: "Väliseinät", score: 3.5, estimatedLifespan: 20, replacementCost: 150000, replacementCostPerM2: 60, notes: "Kohtuullinen kunto" },
  { name: "HVAC", nameFi: "LVI-järjestelmät", score: 3.0, estimatedLifespan: 12, replacementCost: 400000, replacementCostPerM2: 160, notes: "Toimiva mutta ikääntyvä" },
  { name: "Electrical", nameFi: "Sähköjärjestelmät", score: 3.0, estimatedLifespan: 15, replacementCost: 250000, replacementCostPerM2: 100, notes: "Keskimääräinen kunto" },
  { name: "Yard", nameFi: "Piha-alueet", score: 3.5, estimatedLifespan: 15, replacementCost: 120000, replacementCostPerM2: 48, notes: "Hyvä kunto" },
]

export const investmentProjects: InvestmentProject[] = [
  { id: "inv-1", propertyId: "1", title: "Julkisivuremontti", category: "Julkisivu", aloitusVuosi: 2026, kestoVuotta: 1, investointiEur: 840000, investointiEurPerM2: 200, priority: "kriittinen", status: "suunniteltu" },
  { id: "inv-2", propertyId: "1", title: "Ikkunoiden uusiminen", category: "Ikkunat", aloitusVuosi: 2026, kestoVuotta: 1, investointiEur: 672000, investointiEurPerM2: 160, priority: "kriittinen", status: "suunniteltu" },
  { id: "inv-3", propertyId: "1", title: "LVI-saneeraus", category: "LVI", aloitusVuosi: 2027, kestoVuotta: 2, investointiEur: 1260000, investointiEurPerM2: 300, priority: "kriittinen", status: "suunniteltu" },
  { id: "inv-4", propertyId: "1", title: "Kattoremontti", category: "Katto", aloitusVuosi: 2028, kestoVuotta: 1, investointiEur: 504000, investointiEurPerM2: 120, priority: "tärkeä", status: "suunniteltu" },
  { id: "inv-5", propertyId: "1", title: "Sähkösaneeraus", category: "Sähkö", aloitusVuosi: 2029, kestoVuotta: 1, investointiEur: 630000, investointiEurPerM2: 150, priority: "tärkeä", status: "suunniteltu" },
  { id: "inv-6", propertyId: "2", title: "Kattoremontti", category: "Katto", aloitusVuosi: 2027, kestoVuotta: 1, investointiEur: 216000, investointiEurPerM2: 120, priority: "tärkeä", status: "suunniteltu" },
  { id: "inv-7", propertyId: "4", title: "Julkisivukorjaus", category: "Julkisivu", aloitusVuosi: 2028, kestoVuotta: 1, investointiEur: 570000, investointiEurPerM2: 150, priority: "normaali", status: "suunniteltu" },
  { id: "inv-8", propertyId: "6", title: "Peruskorjaus", category: "LVI", aloitusVuosi: 2027, kestoVuotta: 2, investointiEur: 480000, investointiEurPerM2: 400, priority: "kriittinen", status: "suunniteltu" },
  { id: "inv-9", propertyId: "9", title: "Ikkunaremontti", category: "Ikkunat", aloitusVuosi: 2029, kestoVuotta: 1, investointiEur: 540000, investointiEurPerM2: 150, priority: "tärkeä", status: "suunniteltu" },
  { id: "inv-10", propertyId: "10", title: "LVI-päivitys", category: "LVI", aloitusVuosi: 2030, kestoVuotta: 2, investointiEur: 810000, investointiEurPerM2: 180, priority: "normaali", status: "suunniteltu" },
]

// Investment timeline data for PTS visualization (15 years)
export const ptsTimeline = [
  { year: 2026, total: 1512000, kunnossapito: 512000, peruskorjaus: 700000, perusparannus: 300000 },
  { year: 2027, total: 2456000, kunnossapito: 456000, peruskorjaus: 1200000, perusparannus: 800000 },
  { year: 2028, total: 1874000, kunnossapito: 374000, peruskorjaus: 900000, perusparannus: 600000 },
  { year: 2029, total: 1770000, kunnossapito: 420000, peruskorjaus: 850000, perusparannus: 500000 },
  { year: 2030, total: 2310000, kunnossapito: 510000, peruskorjaus: 1100000, perusparannus: 700000 },
  { year: 2031, total: 1650000, kunnossapito: 350000, peruskorjaus: 800000, perusparannus: 500000 },
  { year: 2032, total: 2890000, kunnossapito: 490000, peruskorjaus: 1400000, perusparannus: 1000000 },
  { year: 2033, total: 1420000, kunnossapito: 420000, peruskorjaus: 600000, perusparannus: 400000 },
  { year: 2034, total: 3100000, kunnossapito: 600000, peruskorjaus: 1500000, perusparannus: 1000000 },
  { year: 2035, total: 1980000, kunnossapito: 380000, peruskorjaus: 1000000, perusparannus: 600000 },
  { year: 2036, total: 2540000, kunnossapito: 440000, peruskorjaus: 1300000, perusparannus: 800000 },
  { year: 2037, total: 1350000, kunnossapito: 350000, peruskorjaus: 600000, perusparannus: 400000 },
  { year: 2038, total: 2780000, kunnossapito: 480000, peruskorjaus: 1400000, perusparannus: 900000 },
  { year: 2039, total: 1690000, kunnossapito: 390000, peruskorjaus: 800000, perusparannus: 500000 },
  { year: 2040, total: 2450000, kunnossapito: 450000, peruskorjaus: 1200000, perusparannus: 800000 },
]

// Portfolio distribution data
export const conditionDistribution = [
  { name: "Erinomainen (>75%)", value: 42, fill: "hsl(var(--chart-3))" },
  { name: "Tyydyttävä (60-75%)", value: 68, fill: "hsl(var(--chart-1))" },
  { name: "Heikko (<60%)", value: 46, fill: "hsl(var(--chart-4))" },
]

export const buildingTypeDistribution = [
  { type: "Koulu", count: 38, avgKla: 62, korjausVelka: 12400000 },
  { type: "Päiväkoti", count: 24, avgKla: 65, korjausVelka: 6800000 },
  { type: "Liikunta", count: 18, avgKla: 68, korjausVelka: 5200000 },
  { type: "Toimisto", count: 22, avgKla: 63, korjausVelka: 7800000 },
  { type: "Terveys", count: 16, avgKla: 72, korjausVelka: 4200000 },
  { type: "Kulttuuri", count: 12, avgKla: 66, korjausVelka: 3800000 },
  { type: "Muu", count: 26, avgKla: 61, korjausVelka: 7000000 },
]

export const ageDistribution = [
  { range: "1950-1969", count: 28, avgKla: 48, korjausVelka: 14200000 },
  { range: "1970-1979", count: 34, avgKla: 55, korjausVelka: 12800000 },
  { range: "1980-1989", count: 30, avgKla: 63, korjausVelka: 8600000 },
  { range: "1990-1999", count: 24, avgKla: 72, korjausVelka: 5200000 },
  { range: "2000-2009", count: 22, avgKla: 80, korjausVelka: 3800000 },
  { range: "2010-2025", count: 18, avgKla: 92, korjausVelka: 2600000 },
]

export function formatEur(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} M\u20AC`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)} k\u20AC`
  }
  return `${value} \u20AC`
}

export function formatEurPerM2(value: number): string {
  return `${value.toFixed(0)} \u20AC/m\u00B2`
}

export function getKlaColor(kla: number): string {
  if (kla >= 75) return "text-emerald-400"
  if (kla >= 60) return "text-amber-400"
  return "text-red-400"
}

export function getKlaBgColor(kla: number): string {
  if (kla >= 75) return "bg-emerald-400/15 text-emerald-400"
  if (kla >= 60) return "bg-amber-400/15 text-amber-400"
  return "bg-red-400/15 text-red-400"
}
