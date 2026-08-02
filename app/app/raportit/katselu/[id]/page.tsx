"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReportEngine } from "@/components/reports/report-engine"
import { fetchReportById, type SavedReport } from "@/lib/saved-reports"
import { ArrowLeft, Download, Printer, Loader2, AlertTriangle, X } from "lucide-react"

export default function ReportViewerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [report, setReport] = useState<SavedReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchReportById(id)
      .then((r) => {
        if (!r) setError("Raporttia ei löydy.")
        else setReport(r)
      })
      .catch((e) => setError(e?.message ?? "Virhe ladattaessa raporttia."))
      .finally(() => setLoading(false))
  }, [id])

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Ladataan raporttia...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="text-sm font-medium text-foreground">{error ?? "Raporttia ei löydy."}</p>
        <Button variant="outline" onClick={() => router.push("/app/raportit")}>
          Takaisin raporttikeskukseen
        </Button>
      </div>
    )
  }

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-[#f0f0ee] print:bg-white print:m-0 print:p-0">
      {/* Action bar — hidden when printing */}
      <div className="sticky top-0 z-10 border-b border-[#e0e0dd] bg-[#f8f8f6]/95 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-3">
          {/* Left: back */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={() => router.push("/app/raportit")}
          >
            <ArrowLeft className="h-4 w-4" />
            Raporttikeskus
          </Button>

          {/* Center: title + report ID */}
          <div className="flex min-w-0 flex-col items-center">
            <span className="truncate text-sm font-semibold text-foreground">
              {report.title}
            </span>
            <span className="text-xs text-muted-foreground">{report.report_id}</span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                report.status === "generated"
                  ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
                  : report.status === "archived"
                  ? "border-muted bg-muted/50 text-muted-foreground"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }
            >
              {report.status === "generated"
                ? "Luotu"
                : report.status === "archived"
                ? "Arkistoitu"
                : "Luonnos"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
              onClick={handlePrint}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vie PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
              onClick={handlePrint}
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tulosta</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-sm"
              onClick={() => router.push("/app/raportit")}
              title="Sulje raportti"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Sulje</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Report body */}
      <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 print:px-0 print:py-0 print:max-w-full">
        <ReportEngine config={report.config} />
      </div>
    </div>
  )
}
