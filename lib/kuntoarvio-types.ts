// Kuntoarvio v2 Type Definitions

// Building Types (9 templates)
export type BuildingType =
  | 'kerrostalo'      // Apartment Building
  | 'rivitalo'        // Row House
  | 'paritalo'        // Semi-detached
  | 'omakotitalo'     // Detached House
  | 'toimisto'        // Office
  | 'liiketila'       // Retail
  | 'teollisuus'      // Industrial
  | 'varasto'         // Warehouse
  | 'muu'             // Other (custom)

// Condition Score 1-5
export type ConditionScore = 1 | 2 | 3 | 4 | 5

// Urgency Classification 1-4
export type UrgencyClass = 1 | 2 | 3 | 4

// Evaluation mode
export type EvaluationMode = 'basic' | 'thorough'

// Category definition
export interface Category {
  id: string
  name: string
  nameEn: string
  icon: string
  subItems: SubItem[]
  applicableToTypes: BuildingType[]
}

// Sub-item within a category
export interface SubItem {
  id: string
  name: string
  categoryId: string
}

// Single category evaluation
export interface CategoryEvaluation {
  categoryId: string
  date: string
  evaluatedBy?: string
  mode: EvaluationMode
  overallScore: ConditionScore
  notes?: string
  subItemEvaluations?: SubItemEvaluation[]
}

// Sub-item evaluation (thorough mode)
export interface SubItemEvaluation {
  subItemId: string
  score: ConditionScore
  urgency?: UrgencyClass
  notes?: string
  photos?: string[]
  estimatedCost?: number
}

// Building type template
export interface BuildingTypeTemplate {
  id: BuildingType
  name: string
  nameEn: string
  description: string
  includedCategories: string[]
}

// Property's kuntoarvio state
export interface PropertyKuntoarvio {
  propertyId: string
  buildingType: BuildingType
  enabledCategories: string[]
  evaluations: CategoryEvaluation[]
  lastFullEvaluation?: string
  nextScheduledEvaluation?: string
}

// Evaluation history entry (for timeline)
export interface EvaluationHistoryEntry {
  date: string
  categoryId: string
  previousScore?: ConditionScore
  newScore: ConditionScore
  notes?: string
  evaluatedBy?: string
}

// Condition score metadata
export interface ConditionScoreInfo {
  score: ConditionScore
  label: string
  labelEn: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}

// Urgency class metadata
export interface UrgencyClassInfo {
  urgency: UrgencyClass
  label: string
  labelEn: string
  timeframe: string
  color: string
  bgColor: string
}

// PTS item generated from evaluations
export interface PTSItem {
  id: string
  categoryId: string
  subItemId?: string
  description: string
  urgency: UrgencyClass
  estimatedCost: number
  scheduledYear: number
  status: 'planned' | 'in-progress' | 'completed'
  notes?: string
}

// Apartment/Unit for multi-unit buildings
export interface Apartment {
  id: string
  buildingId: string
  number: string           // e.g., "A 12", "B 3"
  floor: number
  squareMeters: number
  rooms: string            // e.g., "2h+k", "3h+k+s"
  tenant?: string          // Optional tenant info
  rentEndDate?: string     // Lease end date
  lastInspection?: string
  overallCondition: ConditionScore
  notes?: string
}

// Apartment-level evaluation (simplified subset of categories)
export interface ApartmentEvaluation {
  apartmentId: string
  date: string
  evaluatedBy?: string
  overallScore: ConditionScore
  categoryScores: {
    categoryId: 'sisatilat-pinnat' | 'sisatilat-kalusteet' | 'markatilat' | 'sahko' | 'ovet' | 'ikkunat'
    score: ConditionScore
    notes?: string
    estimatedCost?: number
  }[]
  notes?: string
  photos?: string[]
}

// Summary of apartments for a building
export interface BuildingApartmentSummary {
  totalUnits: number
  occupiedUnits: number
  avgCondition: number
  needsAttention: number   // Units with condition <= 2
  upcomingRenovations: number
}
