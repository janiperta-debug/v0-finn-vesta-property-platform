"use client"

import { useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReportEngine } from "@/components/reports/report-engine"
import { decodeReportConfig, REPORT_CONFIG_PARAM } from "@/lib/report-engine"
import { ArrowLeft, Download, Printer } from "lucide-react"

export default function EsikatseluPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const config = useMemo(() => {
    const raw = searchParams.get(REPORT_CONFIG_PARAM)
    if (!raw) return null
    return decodeReportConfig(raw)
  }, [searchParams])

  // Fallback: config missing or malformed.
  if (!config) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground text-sm">
          Raporttikonfiguraatiota ei löydy. Palaa ohjattuun luontiin.
        </p>
        <Button variant="outline" onClick={() => router.push("/app/raportit/uusi")}>
          Luo raportti
        </Button>
      </div>
    )
  }

  return (
    // Full-bleed light gray report canvas — overrides the app layout's padding.
    <div className="-mx-4 -my-6 min-h-screen bg-[#f0f0ee]">
      {/* Slim action bar */}
      <div className="sticky top-0 z-10 border-b border-[#e0e0dd] bg-[#f8f8f6]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={() => router.push("/app/raportit")}
          >
            <ArrowLeft className="h-4 w-4" />
            Raporttikeskus
          </Button>

          <div className="flex items-center gap-2">
            <span className="hidden truncate text-sm font-medium text-foreground sm:block">
              {config.title || "Raportti"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
              disabled
              title="PDF-vienti tulossa"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vie PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
              disabled
              title="Tulostus tulossa"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tulosta</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Report pages */}
      <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6">
        <ReportEngine config={config} />
      </div>
    </div>
  )
}
