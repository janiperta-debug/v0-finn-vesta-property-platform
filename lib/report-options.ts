// Configuration-driven options for the Report Wizard – Step 3 (Report Options).
//
// Everything the UI renders on step 3 comes from these config objects. To add,
// remove, or reorder an option, edit the arrays here and add the matching i18n
// key(s) in every dictionary — the wizard renders whatever is configured.

export interface RadioOptionConfig {
  id: string
  labelKey: string
  descriptionKey?: string
}

export interface SelectOptionConfig {
  id: string
  labelKey: string
}

export interface CheckboxOptionConfig {
  id: string
  labelKey: string
  defaultChecked: boolean
}

// Section 2 – Report purpose. Only affects the cover page and introduction.
export const REPORT_PURPOSES: RadioOptionConfig[] = [
  { id: "internal", labelKey: "reports.purposeInternal" },
  { id: "owner", labelKey: "reports.purposeOwner" },
  { id: "board", labelKey: "reports.purposeBoard" },
  { id: "investment", labelKey: "reports.purposeInvestment" },
  { id: "insurance", labelKey: "reports.purposeInsurance" },
  { id: "other", labelKey: "reports.purposeOther" },
]

export const DEFAULT_PURPOSE = "internal"

// Section 3 – Time horizon. Affects PTS and lifecycle forecasts.
export const TIME_HORIZONS: SelectOptionConfig[] = [
  { id: "current", labelKey: "reports.horizonCurrent" },
  { id: "5y", labelKey: "reports.horizon5" },
  { id: "10y", labelKey: "reports.horizon10" },
  { id: "20y", labelKey: "reports.horizon20" },
  { id: "lifecycle", labelKey: "reports.horizonLifecycle" },
]

export const DEFAULT_TIME_HORIZON = "10y"

// Section 4 – Detail level. The page multiplier scales the estimated page
// count shown in the summary so the estimate reflects the chosen verbosity.
export interface DetailLevelConfig extends RadioOptionConfig {
  pageMultiplier: number
}

export const DETAIL_LEVELS: DetailLevelConfig[] = [
  {
    id: "executive",
    labelKey: "reports.detailExecutive",
    descriptionKey: "reports.detailExecutiveDesc",
    pageMultiplier: 0.5,
  },
  {
    id: "standard",
    labelKey: "reports.detailStandard",
    descriptionKey: "reports.detailStandardDesc",
    pageMultiplier: 1,
  },
  {
    id: "detailed",
    labelKey: "reports.detailDetailed",
    descriptionKey: "reports.detailDetailedDesc",
    pageMultiplier: 1.4,
  },
]

export const DEFAULT_DETAIL_LEVEL = "standard"

// Section 5 – Visual settings.
export const VISUAL_SETTINGS: CheckboxOptionConfig[] = [
  { id: "charts", labelKey: "reports.visualCharts", defaultChecked: true },
  { id: "lifecycleTimeline", labelKey: "reports.visualLifecycleTimeline", defaultChecked: true },
  { id: "maintenanceSchedule", labelKey: "reports.visualMaintenanceSchedule", defaultChecked: true },
  { id: "coverPage", labelKey: "reports.visualCoverPage", defaultChecked: true },
  { id: "toc", labelKey: "reports.visualToc", defaultChecked: true },
]

// Section 6 – Branding.
export const BRANDING_OPTIONS: RadioOptionConfig[] = [
  { id: "finnvesta", labelKey: "reports.brandFinnVesta" },
  { id: "organization", labelKey: "reports.brandOrganization" },
  { id: "cobranded", labelKey: "reports.brandCoBranded" },
]

export const DEFAULT_BRANDING = "finnvesta"

export function defaultVisualSettings(): Record<string, boolean> {
  return Object.fromEntries(VISUAL_SETTINGS.map((v) => [v.id, v.defaultChecked]))
}
