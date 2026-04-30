import { createClient } from '@/lib/supabase/server'
import type { 
  Organization, 
  OrgUser, 
  Building, 
  BuildingValuation,
  Inspection, 
  InspectionCategory,
  CategoryEvaluation,
  MaintenanceTask, 
  InvestmentPlan,
  getBuildingSizeTier
} from './database.types'

// Get current user's organization
export async function getCurrentUserOrg() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: orgUser } = await supabase
    .from('org_users')
    .select('*, organizations(*)')
    .eq('user_id', user.id)
    .single()

  return orgUser
}

// Buildings
export async function getBuildings(orgId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('org_id', orgId)
    .order('name')

  if (error) throw error
  return data as Building[]
}

export async function getBuilding(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Building
}

export async function createBuilding(building: Partial<Building>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buildings')
    .insert(building)
    .select()
    .single()

  if (error) throw error
  return data as Building
}

export async function updateBuilding(id: number, updates: Partial<Building>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('buildings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Building
}

export async function deleteBuilding(id: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Building Valuations
export async function getBuildingValuation(buildingId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('building_valuations')
    .select('*')
    .eq('building_id', buildingId)
    .order('assessment_date', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as BuildingValuation | null
}

// Inspections
export async function getInspections(orgId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inspections')
    .select('*, buildings(name, address)')
    .eq('org_id', orgId)
    .order('inspection_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getInspection(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inspections')
    .select('*, buildings(name, address)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getBuildingInspections(buildingId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('building_id', buildingId)
    .order('inspection_date', { ascending: false })

  if (error) throw error
  return data as Inspection[]
}

export async function createInspection(inspection: Partial<Inspection>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inspections')
    .insert(inspection)
    .select()
    .single()

  if (error) throw error
  return data as Inspection
}

// Inspection Categories (reference data)
export async function getInspectionCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inspection_categories')
    .select('*, inspection_sub_items(*)')
    .order('sort_order')

  if (error) throw error
  return data
}

// Category Evaluations
export async function getCategoryEvaluations(inspectionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('category_evaluations')
    .select('*, sub_item_evaluations(*)')
    .eq('inspection_id', inspectionId)

  if (error) throw error
  return data
}

export async function upsertCategoryEvaluation(evaluation: Partial<CategoryEvaluation>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('category_evaluations')
    .upsert(evaluation)
    .select()
    .single()

  if (error) throw error
  return data
}

// Maintenance Tasks
export async function getMaintenanceTasks(orgId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*, buildings(name)')
    .eq('org_id', orgId)
    .order('scheduled_date', { ascending: false })

  if (error) throw error
  return data
}

export async function createMaintenanceTask(task: Partial<MaintenanceTask>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data as MaintenanceTask
}

export async function updateMaintenanceTask(id: number, updates: Partial<MaintenanceTask>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as MaintenanceTask
}

// Investment Plans
export async function getInvestmentPlans(orgId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('investment_plans')
    .select('*, buildings(name)')
    .eq('buildings.org_id', orgId)
    .order('plan_year')

  if (error) throw error
  return data
}

export async function getBuildingInvestmentPlans(buildingId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('investment_plans')
    .select('*')
    .eq('building_id', buildingId)
    .order('plan_year')

  if (error) throw error
  return data as InvestmentPlan[]
}

export async function createInvestmentPlan(plan: Partial<InvestmentPlan>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('investment_plans')
    .insert(plan)
    .select()
    .single()

  if (error) throw error
  return data as InvestmentPlan
}

// Org Users
export async function getOrgUsers(orgId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('org_users')
    .select('*')
    .eq('org_id', orgId)
    .order('user_name')

  if (error) throw error
  return data as OrgUser[]
}

export async function inviteUser(orgId: number, email: string, role: 'paakayttaja' | 'kayttaja') {
  const supabase = await createClient()
  
  // This would typically trigger an invite email
  // For now, just create the org_user record
  const { data, error } = await supabase
    .from('org_users')
    .insert({
      org_id: orgId,
      user_email: email,
      org_role: role,
    })
    .select()
    .single()

  if (error) throw error
  return data as OrgUser
}

export async function updateUserRole(userId: number, role: 'paakayttaja' | 'kayttaja') {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('org_users')
    .update({ org_role: role })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as OrgUser
}

export async function removeUser(userId: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('org_users')
    .delete()
    .eq('id', userId)

  if (error) throw error
}

// Portfolio Stats
export async function getPortfolioStats(orgId: number) {
  const supabase = await createClient()
  
  // Get buildings count by size
  const { data: buildings } = await supabase
    .from('buildings')
    .select('area_m2, is_sub_building')
    .eq('org_id', orgId)

  // Get users count by role
  const { data: users } = await supabase
    .from('org_users')
    .select('org_role')
    .eq('org_id', orgId)

  // Get latest valuations for total values
  const { data: valuations } = await supabase
    .from('building_valuations')
    .select('replacement_value, technical_value, repair_debt, buildings!inner(org_id)')
    .eq('buildings.org_id', orgId)

  const stats = {
    buildingCount: buildings?.length || 0,
    smallBuildings: buildings?.filter(b => !b.is_sub_building && (b.area_m2 || 0) < 1000).length || 0,
    mediumBuildings: buildings?.filter(b => !b.is_sub_building && (b.area_m2 || 0) >= 1000 && (b.area_m2 || 0) <= 5000).length || 0,
    largeBuildings: buildings?.filter(b => !b.is_sub_building && (b.area_m2 || 0) > 5000).length || 0,
    subBuildings: buildings?.filter(b => b.is_sub_building).length || 0,
    paakayttajat: users?.filter(u => u.org_role === 'paakayttaja').length || 0,
    kayttajat: users?.filter(u => u.org_role === 'kayttaja').length || 0,
    totalArea: buildings?.reduce((sum, b) => sum + (b.area_m2 || 0), 0) || 0,
    totalReplacementValue: valuations?.reduce((sum, v) => sum + (v.replacement_value || 0), 0) || 0,
    totalTechnicalValue: valuations?.reduce((sum, v) => sum + (v.technical_value || 0), 0) || 0,
    totalRepairDebt: valuations?.reduce((sum, v) => sum + (v.repair_debt || 0), 0) || 0,
  }

  return stats
}

// Contact form
export async function submitContactRequest(request: {
  name: string
  email: string
  municipality?: string
  phone?: string
  message?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_requests')
    .insert({
      ...request,
      status: 'new',
    })
    .select()
    .single()

  if (error) throw error
  return data
}
