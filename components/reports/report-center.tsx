"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslation } from "@/lib/i18n"
import {
  fetchSavedReports,
  deleteReport,
  duplicateReport,
  updateReportStatus,
  type SavedReport,
  type ReportStatus,
} from "@/lib/saved-reports"
import {
  FileText,
  Plus,
  CalendarClock,
  FileEdit,
  Mail,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Archive,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react"

// ── Status badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReportStatus }) {
  const map: Record<ReportStatus, { label: string; className: string }> = {
    generated: {
      label: "Luotu",
      className:
        "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400",
    },
    draft: {
      label: "Luonnos",
      className:
        "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    archived: {
      label: "Arkistoitu",
      className: "border-border bg-muted/50 text-muted-foreground",
    },
  }
  const { label, className } = map[status] ?? map.generated
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}

// ── Report row ────────────────────────────────────────────────────────────

function ReportRow({
  report,
  onDelete,
  onDuplicate,
  onArchive,
}: {
  report: SavedReport
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onArchive: (id: string) => void
}) {
  const router = useRouter()
  const date = new Date(report.generated_at).toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0 hover:bg-muted/30 transition-colors">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <FileText className="h-4 w-4 text-primary" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">
            {report.title}
          </span>
          <StatusBadge status={report.status} />
        </div>
        <div className="mt-0.5 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span className="font-mono">{report.report_id}</span>
          <span>·</span>
          <span>{report.property_names.slice(0, 2).join(", ")}{report.property_names.length > 2 ? ` +${report.property_names.length - 2}` : ""}</span>
          <span>·</span>
          <span>{date}</span>
          <span>·</span>
          <span>v{report.version}</span>
        </div>
      </div>

      {/* Open button */}
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex gap-1.5"
        onClick={() => router.push(`/app/raportit/katselu/${report.id}`)}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Avaa
      </Button>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toiminnot</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/app/raportit/katselu/${report.id}`)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Avaa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(report.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Kahdenna
          </DropdownMenuItem>
          {report.status !== "archived" && (
            <DropdownMenuItem onClick={() => onArchive(report.id)}>
              <Archive className="mr-2 h-4 w-4" />
              Arkistoi
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(report.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Poista
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export function ReportCenter() {
  const { t } = useTranslation()
  const [reports, setReports] = useState<SavedReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tableSetupNeeded, setTableSetupNeeded] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadingReports(true)
    setLoadError(null)
    try {
      const data = await fetchSavedReports()
      setReports(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Latausvirhe"
      // If the table doesn't exist yet, show setup instructions instead of a raw error.
      if (
        msg.includes("does not exist") ||
        msg.includes("relation") ||
        msg.includes("schema cache") ||
        msg.includes("saved_reports")
      ) {
        setTableSetupNeeded(true)
        setReports([])
      } else {
        setLoadError(msg)
      }
    } finally {
      setLoadingReports(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    setActionLoading(id)
    try {
      await deleteReport(id)
      setReports((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setActionLoading(null)
      setDeleteTarget(null)
    }
  }

  async function handleDuplicate(id: string) {
    setActionLoading(id)
    try {
      const copy = await duplicateReport(id)
      setReports((prev) => [copy, ...prev])
    } finally {
      setActionLoading(null)
    }
  }

  async function handleArchive(id: string) {
    setActionLoading(id)
    try {
      await updateReportStatus(id, "archived")
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "archived" as ReportStatus } : r)),
      )
    } finally {
      setActionLoading(null)
    }
  }

  const recent = reports.filter((r) => r.status !== "draft")
  const drafts = reports.filter((r) => r.status === "draft")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("reports.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      {/* Create Report CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {t("reports.createReportTitle")}
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {t("reports.createReportDescription")}
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="gap-2 sm:shrink-0">
            <Link href="/app/raportit/uusi">
              <Plus className="h-5 w-5" />
              {t("reports.newReport")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Setup needed — saved_reports table missing */}
      {tableSetupNeeded && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-4 text-sm">
          <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">
            Raporttitaulua ei ole vielä luotu
          </p>
          <p className="text-muted-foreground text-xs mb-3">
            Aja seuraava SQL Supabase SQL Editor -näkymässä luodaksesi <code className="font-mono bg-muted px-1 rounded">saved_reports</code>-taulun. Katso tarkemmat ohjeet tiedostosta <code className="font-mono bg-muted px-1 rounded">scripts/setup-saved-reports.mjs</code>.
          </p>
          <Button size="sm" variant="outline" onClick={load} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Yritä uudelleen
          </Button>
        </div>
      )}

      {/* Load error */}
      {loadError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button size="sm" variant="outline" onClick={load} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Yritä uudelleen
          </Button>
        </div>
      )}

      {/* Recent Reports */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {t("reports.recentTitle")}
          </h2>
          {loadingReports && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <Card>
          {recent.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("reports.recentEmpty")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("reports.recentEmptyHint")}</p>
            </CardContent>
          ) : (
            <div>
              {recent.map((r) => (
                <ReportRow
                  key={r.id}
                  report={r}
                  onDelete={(id) => setDeleteTarget(id)}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* Scheduled Reports */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {t("reports.scheduledTitle")}
          </h2>
          <Button size="sm" variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            {t("reports.addSchedule")}
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <CalendarClock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{t("reports.noScheduledReports")}</p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">{t("reports.scheduleHint")}</p>
          </CardContent>
        </Card>
      </section>

      {/* Draft Reports */}
      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          {t("reports.draftsTitle")}
        </h2>
        <Card>
          {drafts.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-full bg-muted p-3">
                <FileEdit className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("reports.draftsEmpty")}</p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">{t("reports.draftsEmptyHint")}</p>
            </CardContent>
          ) : (
            <div>
              {drafts.map((r) => (
                <ReportRow
                  key={r.id}
                  report={r}
                  onDelete={(id) => setDeleteTarget(id)}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Poistetaanko raportti?</AlertDialogTitle>
            <AlertDialogDescription>
              Tätä toimintoa ei voi peruuttaa. Raportti poistetaan pysyvästi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={!!actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Poista"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
