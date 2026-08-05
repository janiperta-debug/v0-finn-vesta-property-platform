"use client"

// ReportEngine – assembles report pages dynamically from the ReportConfig.
//
// Fetches all property data in parallel via useReportData, then renders each
// selected module page in canonical order. Cover and Closing pages are always
// included regardless of module selection.

import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { defaultLocale, isLocale } from "@/lib/i18n/config"
import { dictionaries } from "@/lib/i18n/dictionaries"
import { useTranslation } from "@/lib/i18n"
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

// Each page component receives config + real data + pagination info + translator.
export type PageProps = {
  config: ReportConfig
  data: ReportData
  pageNumber: number
  totalPages: number
  t: (key: string) => string
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
  const router = useRouter()
  // UI-locale translator for engine chrome (loading/error states) shown before
  // report data — and thus config.language's translator — is available.
  const { t: tUi } = useTranslation()

  // Build a translator pinned to the report's own language, not the UI locale.
  // This ensures a Finnish-speaking user can generate an English report and vice versa.
  const t = useCallback(
    (key: string): string => {
      const locale = isLocale(config.language) ? config.language : defaultLocale
      const [ns, k] = key.split(".") as [string, string]
      const dict = dictionaries[locale] ?? dictionaries[defaultLocale]
      const section = (dict as Record<string, Record<string, string>>)[ns]
      return section?.[k]
        ?? (dictionaries[defaultLocale] as Record<string, Record<string, string>>)[ns]?.[k]
        ?? key
    },
    [config.language],
  )

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
        <Loader2 className="h-8 w-8 animate-spin text-[#1e6fbf]" />
        <p className="text-sm text-[#666]">{tUi("reports.engineLoading")}</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="text-sm font-medium text-[#333] dark:text-[#ccc]">{tUi("reports.engineLoadFailed")}</p>
        <p className="max-w-sm text-xs text-[#999]">{error ?? tUi("reports.engineUnknownError")}</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => router.push("/app/raportit")}
        >
          <ArrowLeft className="h-4 w-4" />
          {tUi("reports.engineBackToCenter")}
        </Button>
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
          t={t}
          pageNumber={index + 1}
          totalPages={totalPages}
        />
      ))}
    </div>
  )
}
