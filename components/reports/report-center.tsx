"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { FileText, Plus, CalendarClock, FileEdit, Mail } from "lucide-react"

export function ReportCenter() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("reports.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      {/* Section 1 – Create Report */}
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

      {/* Section 2 – Recent Reports */}
      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          {t("reports.recentTitle")}
        </h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{t("reports.recentEmpty")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("reports.recentEmptyHint")}</p>
          </CardContent>
        </Card>
      </section>

      {/* Section 3 – Scheduled Reports */}
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

      {/* Section 4 – Draft Reports */}
      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          {t("reports.draftsTitle")}
        </h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <FileEdit className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{t("reports.draftsEmpty")}</p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">{t("reports.draftsEmptyHint")}</p>
          </CardContent>
        </Card>
      </section>

    </div>
  )
}
