/**
 * saved-reports.ts
 *
 * Service layer for the saved_reports Supabase table.
 * All functions run client-side (use createBrowserClient via @/lib/supabase/client).
 */
import { createClient } from "@/lib/supabase/client"
import type { ReportConfig } from "@/lib/report-engine"

// ── Types ──────────────────────────────────────────────────────────────────

export type ReportStatus = "draft" | "generated" | "archived"

export interface SavedReport {
  id: string                  // UUID primary key
  report_id: string           // e.g. FVR-2026-000001
  org_id: number
  created_by: string
  title: string
  property_names: string[]
  building_ids: number[]
  report_type: string
  language: string
  version: number
  status: ReportStatus
  config: ReportConfig
  generated_at: string        // ISO timestamp
  updated_at: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Generates a FVR-YYYY-NNNNNN style report ID client-side (fallback when RPC unavailable). */
function generateReportId(): string {
  const year = new Date().getFullYear()
  const num = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, "0")
  return `FVR-${year}-${num}`
}

// ── CRUD ───────────────────────────────────────────────────────────────────

/** Save a newly generated report. Returns the saved row or throws. */
export async function saveReport(params: {
  config: ReportConfig
  orgId: number
  userId: string
}): Promise<SavedReport> {
  const { config, orgId, userId } = params
  const supabase = createClient()

  // Try to get the next ID from the DB function; fall back to client-side.
  let reportId = generateReportId()
  try {
    const { data } = await supabase.rpc("next_report_id")
    if (data) reportId = data as string
  } catch {
    // RPC not yet available — use client-side ID
  }

  const row = {
    report_id: reportId,
    org_id: orgId,
    created_by: userId,
    title: config.title || "Nimetön raportti",
    property_names: config.properties.map((p) => p.name),
    building_ids: config.properties.map((p) => p.id),
    report_type: "custom",
    language: config.language,
    version: 1,
    status: "generated" as ReportStatus,
    config,
  }

  const { data, error } = await supabase
    .from("saved_reports")
    .insert(row)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SavedReport
}

/** Fetch all reports for the current user's org, most recent first. */
export async function fetchSavedReports(): Promise<SavedReport[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("saved_reports")
    .select("*")
    .order("generated_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as SavedReport[]
}

/** Fetch a single report by its UUID. */
export async function fetchReportById(id: string): Promise<SavedReport | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("saved_reports")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as SavedReport
}

/** Duplicate a report (new ID, version 1, status generated). */
export async function duplicateReport(id: string): Promise<SavedReport> {
  const supabase = createClient()
  const original = await fetchReportById(id)
  if (!original) throw new Error("Report not found")

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  let reportId = generateReportId()
  try {
    const { data } = await supabase.rpc("next_report_id")
    if (data) reportId = data as string
  } catch {
    // fallback
  }

  const copy = {
    report_id: reportId,
    org_id: original.org_id,
    created_by: user.id,
    title: `${original.title} (kopio)`,
    property_names: original.property_names,
    building_ids: original.building_ids,
    report_type: original.report_type,
    language: original.language,
    version: 1,
    status: "generated" as ReportStatus,
    config: original.config,
  }

  const { data, error } = await supabase
    .from("saved_reports")
    .insert(copy)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SavedReport
}

/** Update report status. */
export async function updateReportStatus(
  id: string,
  status: ReportStatus,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("saved_reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

/** Permanently delete a report. */
export async function deleteReport(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("saved_reports").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
