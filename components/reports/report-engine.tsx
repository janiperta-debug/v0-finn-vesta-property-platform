"use client"

// ReportEngine – assembles report pages dynamically from the ReportConfig.
//
// Pages are rendered in a fixed canonical order; only the modules the user
// selected in the wizard are included. The cover page and closing page are
// always rendered regardless of module selection.

import { useMemo } from "react"
import type { ReportConfig } from "@/lib/report-engine"
import { REPORT_MODULES } from "@/lib/report-modules"

// Page components
import { CoverPage } from "./pages/cover-page"
import { ExecutiveSummaryPage } from "./pages/executive-summary-page"
import { PropertyInformationPage } from "./pages/property-information-page"
import { ConditionOverviewPage } from "./pages/condition-overview-page"
import { InspectionFindingsPage } from "./pages/inspection-findings-page"
import { PhotoGalleryPage } from "./pages/photo-gallery-page"
import { MaintenanceHistoryPage } from "./pages/maintenance-history-page"
import { RepairDebtPage } from "./pages/repair-debt-page"
import { PTSPage } from "./pages/pts-page"
import { InvestmentForecastPage } from "./pages/investment-forecast-page"
import { RecommendationsPage } from "./pages/recommendations-page"
import { ClosingPage } from "./pages/closing-page"

// Map each module id to its page component constructor.
// The component receives (config, pageNumber, totalPages).
type PageComponent = (props: {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}) => React.ReactElement

const MODULE_PAGE_MAP: Record<string, PageComponent> = {
  "executive-summary": ExecutiveSummaryPage,
  "property-information": PropertyInformationPage,
  "condition-overview": ConditionOverviewPage,
  "inspection-findings": InspectionFindingsPage,
  "photo-gallery": PhotoGalleryPage,
  "maintenance-history": MaintenanceHistoryPage,
  "repair-debt": RepairDebtPage,
  pts: PTSPage,
  "investment-forecast": InvestmentForecastPage,
  recommendations: RecommendationsPage,
}

// Canonical page order (mirrors REPORT_MODULES order).
const CANONICAL_ORDER = REPORT_MODULES.map((m) => m.id)

interface ReportEngineProps {
  config: ReportConfig
}

export function ReportEngine({ config }: ReportEngineProps) {
  // Build the ordered list of page components to render.
  const pages = useMemo(() => {
    const selected = new Set(config.selectedModuleIds)

    // Sort module ids by canonical order so page sequence is stable regardless
    // of the order they were stored in the config.
    const modulePages = CANONICAL_ORDER.filter(
      (id) => selected.has(id) && MODULE_PAGE_MAP[id],
    ).map((id) => MODULE_PAGE_MAP[id])

    // Cover is always first; Closing always last.
    return [
      CoverPage,
      ...modulePages,
      ClosingPage,
    ] as PageComponent[]
  }, [config.selectedModuleIds])

  const totalPages = pages.length

  return (
    <div className="report-engine space-y-8">
      {pages.map((Page, index) => (
        <Page
          key={index}
          config={config}
          pageNumber={index + 1}
          totalPages={totalPages}
        />
      ))}
    </div>
  )
}
