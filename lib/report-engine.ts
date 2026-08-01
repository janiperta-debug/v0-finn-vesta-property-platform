// Shared types for the FinnVesta Report Engine.
//
// The ReportConfig is built from the wizard's collected state and passed to the
// report page either via URL search params (JSON-encoded) or directly as a prop.
// Every report page component receives this config and renders accordingly.

export interface ReportProperty {
  id: number
  name: string
  address: string | null
}

export type ReportScope = "single" | "multiple" | "portfolio"
export type ReportDetailLevel = "executive" | "standard" | "detailed"
export type ReportBranding = "finnvesta" | "organization" | "cobranded"

export interface ReportConfig {
  // Step 1 – scope
  scope: ReportScope
  properties: ReportProperty[]

  // Step 2 – selected module ids, in order
  selectedModuleIds: string[]

  // Step 3 – options
  title: string
  language: string
  date: string
  purpose: string
  timeHorizon: string
  detailLevel: ReportDetailLevel
  visualSettings: Record<string, boolean>
  branding: ReportBranding

  // Set after saving to DB — used by the viewer to identify the saved record.
  savedReportId?: string
  reportDisplayId?: string   // e.g. FVR-2026-000001
}

// Serialise a ReportConfig to a URL-safe base64 string.
export function encodeReportConfig(config: ReportConfig): string {
  return btoa(encodeURIComponent(JSON.stringify(config)))
}

// Deserialise a ReportConfig from the encoded string. Returns null on parse
// failure so callers can handle invalid/missing params gracefully.
export function decodeReportConfig(encoded: string): ReportConfig | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as ReportConfig
  } catch {
    return null
  }
}

// URL search-param key used to carry the config to the report page.
export const REPORT_CONFIG_PARAM = "config"

// URL param for the saved report UUID (viewer route).
export const SAVED_REPORT_ID_PARAM = "id"
