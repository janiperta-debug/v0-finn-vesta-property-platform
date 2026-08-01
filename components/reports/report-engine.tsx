"use client"

// ReportEngine – assembles report pages dynamically from the ReportConfig.
//
// Fetches all property data in parallel via useReportData, then renders each
// selected module page in canonical order. Cover and Closing pages are always
// included regardless of module selection.

import { useMemo } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import type { ReportConfig } from "@/lib/report-engine"
import type { ReportData } from "@/hooks/use-report-data"
import { useReportData } from "@/hooks/use-report-data"
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

// Each page component receives config + real data + pagination info.
export type PageProps = {
  config: ReportConfig
  data: ReportData
  pageNumber: number
  totalPages: number
}

type PageComponent = (props: PageProps) => React.ReactElement

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

const CANONICAL_ORDER = REPORT_MODULES.map((m) => m.id)

interface ReportEngineProps {
  config: ReportConfig
}

export function ReportEngine({ config }: ReportEngineProps) {
  const { data, loading, error } = useReportData(config)

  const pages = useMemo((): PageComponent[] => {
    const selected = new Set(config.selectedModuleIds)
    const modulePages = CANONICAL_ORDER.filter(
      (id) => selected.has(id) && MODULE_PAGE_MAP[id],
    ).map((id) => MODULE_PAGE_MAP[id])
    return [CoverPage, ...modulePages, ClosingPage] as PageComponent[]
  }, [config.selectedModuleIds])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C8A84B]" />
        <p className="text-sm text-[#666]">Ladataan kiinteistötietoja...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="text-sm font-medium text-[#333]">Tietojen lataus epäonnistui</p>
        <p className="max-w-sm text-xs text-[#999]">{error ?? "Tuntematon virhe"}</p>
      </div>
    )
  }

  const totalPages = pages.length

  return (
    <div className="report-engine space-y-8">
      {pages.map((Page, index) => (
        <Page
          key={index}
          config={config}
          data={data}
          pageNumber={index + 1}
          totalPages={totalPages}
        />
      ))}
    </div>
  )
}
