// Single source of truth for a building's condition & long-term plan (PTS).
//
// Derives per-category condition, urgency and repair cost from:
//   1. Building basics (construction year, area, type) + RT standards  -> baseline
//   2. Stored category_evaluations (score/urgency/cost_estimate)        -> refinement
//
// This lets a property show a meaningful baseline the moment it is added,
// even before any inspection, and lets every inspection/investment refine it.

import { categories, buildingTypeTemplates } from "@/lib/kuntoarvio-data"
import {
  categoryIdMapping,
  calculateConditionScore,
  calculateRepairCost,
} from "@/lib/rt-standards"

// Urgency codes match the database CHECK constraint on category_evaluations.urgency
export type UrgencyCode = "valitom" | "1_3v" | "3_5v" | "5_10v"

export const URGENCY_ORDER: UrgencyCode[] = ["valitom", "1_3v", "3_5v", "5_10v"]

// Translator function type accepted by the helpers below. Dynamic i18n keys are
// built from data-driven ids/codes, so callers pass their `t` from useTranslation()
// / getTranslation() and we cast internally (t() falls back to the raw key if a
// generated key is ever missing, so this stays safe at runtime).
export type Translator = (key: string) => string

export function urgencyLabel(code: UrgencyCode, t: Translator): string {
  return t(`kuntoarvioData.urgCode_${code}`)
}

export function categoryName(stringId: string, t: Translator): string {
  return t(`kuntoarvioData.cat_${stringId}`)
}

// Representative RT/TALO 2000 lifespans (years) and full-replacement cost (€/m² of
// building area) per category, plus a weight used for the overall condition average.
// Keyed by the string category id used in kuntoarvio-data.
const CATEGORY_RT_DEFAULTS: Record<string, { lifespan: number; costPerSqm: number; weight: number }> = {
  perustukset: { lifespan: 100, costPerSqm: 120, weight: 1.5 },
  runko: { lifespan: 100, costPerSqm: 180, weight: 1.5 },
  julkisivut: { lifespan: 45, costPerSqm: 100, weight: 1.2 },
  ikkunat: { lifespan: 40, costPerSqm: 120, weight: 1.0 },
  ovet: { lifespan: 40, costPerSqm: 40, weight: 0.6 },
  katto: { lifespan: 50, costPerSqm: 60, weight: 1.3 },
  vesikate: { lifespan: 35, costPerSqm: 55, weight: 1.3 },
  "sisatilat-pinnat": { lifespan: 20, costPerSqm: 80, weight: 0.8 },
  "sisatilat-kalusteet": { lifespan: 20, costPerSqm: 60, weight: 0.5 },
  markatilat: { lifespan: 25, costPerSqm: 90, weight: 1.0 },
  "lvi-lammitys": { lifespan: 25, costPerSqm: 60, weight: 1.1 },
  "lvi-vesi": { lifespan: 45, costPerSqm: 45, weight: 1.2 },
  "lvi-ilmanvaihto": { lifespan: 25, costPerSqm: 50, weight: 1.0 },
  sahko: { lifespan: 45, costPerSqm: 55, weight: 1.0 },
  hissi: { lifespan: 30, costPerSqm: 25, weight: 0.8 },
  piha: { lifespan: 30, costPerSqm: 20, weight: 0.5 },
  erityisrakenteet: { lifespan: 40, costPerSqm: 40, weight: 0.6 },
}

// numeric category_id -> string category id (reverse of categoryIdMapping)
const numericToStringId: Record<number, string> = Object.fromEntries(
  Object.entries(categoryIdMapping).map(([strId, numId]) => [numId, strId])
)

export interface BuildingBasics {
  construction_year?: number | null
  area_m2?: number | null
  building_type?: string | null
}

export interface StoredEvaluation {
  category_id: number | string
  score?: number | null
  urgency?: string | null
  cost_estimate?: number | null
  comment?: string | null
}

export interface PlanItem {
  categoryId: number
  categoryStringId: string
  categoryName: string
  conditionScore: number // 1-5 (5 = best), RT scale
  urgency: UrgencyCode
  cost: number
  remainingLifespan: number
  fromInspection: boolean // true if a stored evaluation contributed
}

const isUrgencyCode = (v: unknown): v is UrgencyCode =>
  typeof v === "string" && (URGENCY_ORDER as string[]).includes(v)

// Derive urgency from condition score and remaining lifespan
function deriveUrgency(score: number, remainingLifespan: number): UrgencyCode {
  if (remainingLifespan <= 0 || score <= 1) return "valitom"
  if (remainingLifespan <= 3 || score <= 2) return "1_3v"
  if (remainingLifespan <= 8 || score <= 3) return "3_5v"
  return "5_10v"
}

// Which categories apply to a given building type (falls back to all 17)
function applicableCategoryIds(buildingType?: string | null): string[] {
  const template = buildingTypeTemplates.find(t => t.id === buildingType)
  if (template && template.includedCategories.length > 0) return template.includedCategories
  return categories.map(c => c.id)
}

/**
 * Build the full per-category plan for a building. Always returns items for every
 * applicable category, using RT baseline where no inspection data exists.
 */
export function derivePlanItems(
  basics: BuildingBasics,
  evaluations: StoredEvaluation[] = [],
  t: Translator
): PlanItem[] {
  const currentYear = new Date().getFullYear()
  const buildYear = basics.construction_year || currentYear - 25
  const area = basics.area_m2 || 100

  // Index stored evaluations by string category id
  const evalByStringId = new Map<string, StoredEvaluation>()
  for (const e of evaluations) {
    const strId =
      typeof e.category_id === "number"
        ? numericToStringId[e.category_id]
        : numericToStringId[Number(e.category_id)] || String(e.category_id)
    if (strId) evalByStringId.set(strId, e)
  }

  const items: PlanItem[] = []

  for (const stringId of applicableCategoryIds(basics.building_type)) {
    const defaults = CATEGORY_RT_DEFAULTS[stringId]
    if (!defaults) continue

    const numericId = categoryIdMapping[stringId] || 0
    const stored = evalByStringId.get(stringId)

    const age = currentYear - buildYear
    const remainingLifespan = Math.max(0, defaults.lifespan - age)

    // Condition: stored score wins, otherwise RT baseline from age vs lifespan
    const baselineScore = calculateConditionScore(buildYear, defaults.lifespan)
    const conditionScore = stored?.score && stored.score > 0 ? stored.score : baselineScore

    // Urgency: stored (valid code) wins, otherwise derived
    const urgency: UrgencyCode = isUrgencyCode(stored?.urgency)
      ? (stored!.urgency as UrgencyCode)
      : deriveUrgency(conditionScore, remainingLifespan)

    // Cost: stored positive estimate wins, otherwise computed from RT standards
    const cost =
      stored?.cost_estimate && stored.cost_estimate > 0
        ? stored.cost_estimate
        : calculateRepairCost(area, defaults.costPerSqm, conditionScore)

    items.push({
      categoryId: numericId,
      categoryStringId: stringId,
      categoryName: categoryName(stringId, t),
      conditionScore,
      urgency,
      cost,
      remainingLifespan,
      fromInspection: !!stored,
    })
  }

  return items
}

// Weighted overall condition (1-5) across plan items
export function overallCondition(items: PlanItem[]): number {
  if (items.length === 0) return 0
  let weightedSum = 0
  let totalWeight = 0
  for (const item of items) {
    const w = CATEGORY_RT_DEFAULTS[item.categoryStringId]?.weight || 1
    weightedSum += item.conditionScore * w
    totalWeight += w
  }
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

// Total repair debt (sum of all derived costs)
export function totalRepairCost(items: PlanItem[]): number {
  return items.reduce((sum, i) => sum + i.cost, 0)
}

// Items that need attention (condition 3 or worse and a real cost), sorted by urgency
export function repairItems(items: PlanItem[]): PlanItem[] {
  return items
    .filter(i => i.conditionScore <= 3 && i.cost > 0)
    .sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency))
}

export interface TimelineBucket {
  urgency: UrgencyCode
  label: string
  items: PlanItem[]
  total: number
}

// Group plan items into urgency timeline buckets (only buckets with cost)
export function timelineBuckets(items: PlanItem[], t: Translator): TimelineBucket[] {
  return URGENCY_ORDER.map(urgency => {
    const bucketItems = items
      .filter(i => i.urgency === urgency && i.cost > 0)
      .sort((a, b) => a.conditionScore - b.conditionScore)
    return {
      urgency,
      label: urgencyLabel(urgency, t),
      items: bucketItems,
      total: bucketItems.reduce((sum, i) => sum + i.cost, 0),
    }
  }).filter(b => b.items.length > 0)
}
