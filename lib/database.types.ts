// Database types matching Supabase schema

export interface Organization {
  id: number
  name: string
  subscription_tier: string | null
  created_at: string
  updated_at: string
}

export interface OrgUser {
  id: number
  org_id: number
  user_id: string
  org_role: 'paakayttaja' | 'kayttaja' | null
  system_role: 'admin' | 'user' | null
  user_email: string | null
  user_name: string | null
  joined_at: string | null
  created_at: string
  updated_at: string
}

export interface Property {
  id: number
  org_id: number
  name: string
  address: string | null
  postal_code: string | null
  municipality: string | null
  property_type: string | null
  status: string | null
  created_at: string
  updated_at: string
}

export interface Building {
  id: number
  org_id: number
  property_id: number | null
  name: string
  address: string | null
  construction_year: number | null
  area_m2: number | null
  building_type: string | null
  usage_category: string | null
  cost_per_m2: number | null
  notes: string | null
  status: string | null
  is_sub_building: boolean
  municipality: string | null
  created_at: string
  updated_at: string
}

export interface BuildingValuation {
  id: number
  building_id: number
  assessment_date: string | null
  inspection_date: string | null
  replacement_value: number | null
  annual_depreciation: number | null
  technical_value: number | null
  condition_score: number | null
  repair_debt: number | null
  maintenance_need: number | null
  improvement_need: number | null
  created_at: string
}

export interface Inspection {
  id: string // uuid
  building_id: number
  org_id: number
  inspection_date: string | null
  inspector_name: string | null
  inspector_type: string | null
  status: 'draft' | 'completed' | 'archived' | null
  overall_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InspectionCategory {
  id: number
  sort_order: number
  name_fi: string
  talo2000_ref: string | null
  description_fi: string | null
  created_at: string
}

export interface InspectionSubItem {
  id: number
  category_id: number
  sort_order: number
  name_fi: string
  notes_fi: string | null
  weight: number | null
  created_at: string
}

export interface CategoryEvaluation {
  id: string // uuid
  inspection_id: string
  category_id: number
  mode: 'basic' | 'thorough' | null
  score: number | null
  comment: string | null
  urgency: 'immediate' | 'short' | 'medium' | 'long' | null
  repair_year: number | null
  cost_estimate: number | null
  is_applicable: boolean
  is_migrated: boolean
  rt_reference_id: string | null
  created_at: string
  updated_at: string
}

export interface SubItemEvaluation {
  id: string // uuid
  category_evaluation_id: string
  sub_item_id: number
  score: number | null
  notes: string | null
  repair_year: number | null
  cost_estimate: number | null
  install_year: number | null
  photo_urls: string[] | null
  rt_reference_id: string | null
  urgency: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceTask {
  id: number
  org_id: number
  building_id: number
  title: string
  description: string | null
  category: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent' | null
  component_type: string | null
  estimated_cost: number | null
  actual_cost: number | null
  scheduled_date: string | null
  started_date: string | null
  completed_date: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | null
  improves_condition: boolean
  condition_impact_notes: string | null
  contractor_vendor: string | null
  created_at: string
  updated_at: string
  created_by: number | null
}

export interface InvestmentPlan {
  id: number
  building_id: number
  plan_year: number
  planned_investment: number | null
  investment_type: string | null
  priority: 'low' | 'medium' | 'high' | 'critical' | null
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BuildingTemplate {
  id: number
  type_key: string
  name_fi: string
  description_fi: string | null
  created_at: string
}

export interface BuildingTemplateCategory {
  template_id: number
  category_id: number
  is_default: boolean
}

export interface RtReference {
  id: string // uuid
  component_name_fi: string
  category_id: number | null
  sub_item_id: number | null
  lifespan_min_years: number | null
  lifespan_max_years: number | null
  lifespan_typical_years: number | null
  inspection_interval_months: number | null
  maintenance_interval_months: number | null
  notes: string | null
  created_at: string
}

export interface ContactRequest {
  id: number
  name: string
  email: string
  municipality: string | null
  phone: string | null
  message: string | null
  status: 'new' | 'contacted' | 'closed' | null
  preferred_date: string | null
  created_at: string
  updated_at: string
}

export interface PricingConfig {
  id: number
  primary_user_annual_fee: number
  additional_user_annual_fee: number
  small_building_monthly_fee: number
  medium_building_monthly_fee: number
  large_building_monthly_fee: number
  sub_building_percent: number | null
  sub_building_discount_percent: number | null
  updated_at: string
}

// Helper type for building size tier
export type BuildingSizeTier = 'small' | 'medium' | 'large'

export function getBuildingSizeTier(areaM2: number | null): BuildingSizeTier {
  if (!areaM2 || areaM2 < 1000) return 'small'
  if (areaM2 <= 5000) return 'medium'
  return 'large'
}

// Helper to format currency
export function formatEur(value: number | null): string {
  if (value === null) return '-'
  return new Intl.NumberFormat('fi-FI', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
