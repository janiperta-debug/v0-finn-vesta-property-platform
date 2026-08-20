import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"

const PRIORITY_KEYS: Record<string, string> = {
  low: "reportContent.prioLow",
  medium: "reportContent.prioMedium",
  high: "reportContent.prioHigh",
  critical: "reportContent.prioCritical",
}

const STATUS_KEYS: Record<string, string> = {
  planned: "reportContent.statusPlanned",
  approved: "reportContent.statusApproved",
  in_progress: "reportContent.statusInProgress",
  completed: "reportContent.statusRealized",
}

function translatePriority(p: string | null | undefined, t: (k: string) => string): string {
  if (!p) return "—"
  const key = PRIORITY_KEYS[p]
  return key ? t(key) : p
}

function translateStatus(s: string | null | undefined, t: (k: string) => string): string {
  if (!s) return "—"
  const key = STATUS_KEYS[s]
  return key ? t(key) : s
}

export function InvestmentForecastPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const rows = data.investmentPlans.sort((a, b) => a.plan_year - b.plan_year)

  if (rows.length === 0) {
    return (
      <ReportPage
        config={config}
        pageNumber={pageNumber}
        totalPages={totalPages}
        sectionTitle={t("reportContent.investmentTitle")}
      >
        <h2 className="mb-6 text-xl font-bold text-[#1a1a1a]">{t("reportContent.investmentTitle")}</h2>
        <p className="text-sm text-[#999]">{t("reportContent.investmentNoData")}</p>
      </ReportPage>
    )
  }

  // Group actions by year for the timeline
  const byYear = rows.reduce<Record<number, number>>((acc, r) => {
    acc[r.plan_year] = (acc[r.plan_year] ?? 0) + 1
    return acc
  }, {})
  const years = Object.keys(byYear).map(Number).sort()
  const maxVal = Math.max(...Object.values(byYear), 1)

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle={t("reportContent.investmentTitle")}
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">{t("reportContent.investmentTitle")}</h2>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: t("reportContent.investmentKpiRows"), value: String(rows.length) },
          {
            label: t("reportContent.investmentKpiTimespan"),
            value:
              years.length > 1
                ? `${years[0]}–${years[years.length - 1]}`
                : String(years[0] ?? "—"),
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 text-center"
          >
            <p className="text-xl font-bold text-[#1a1a1a]">{value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[#999]">{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart by year */}
      {years.length > 0 && (
        <PageSection title={t("reportContent.investmentByYear")}>
          <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-6">
            <div className="flex h-28 items-end gap-2">
              {years.map((yr) => {
                const val = byYear[yr] ?? 0
                const pct = Math.round((val / maxVal) * 100)
                return (
                  <div key={yr} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[9px] text-[#999]">
                      {val > 0 ? String(val) : ""}
                    </span>
                    <div
                      className="w-full rounded-t-sm bg-[#C8A84B]/70"
                      style={{ height: `${pct}%`, minHeight: val > 0 ? "4px" : "0" }}
                    />
                    <span className="text-[9px] text-[#bbb]">{yr}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </PageSection>
      )}

      {/* Detail table */}
      <PageSection title={t("reportContent.investmentTargets")}>
        <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
          <table className="w-full text-sm">
            <thead className="bg-[#fafafa]">
              <tr>
                {[
                  t("reportContent.colYear"),
                  t("reportContent.colType"),
                  t("reportContent.colPriority"),
                  t("reportContent.colStatus"),
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#999]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className={
                    idx % 2 === 0
                      ? "border-t border-[#f0f0f0] bg-white"
                      : "border-t border-[#f0f0f0] bg-[#fafafa]"
                  }
                >
                  <td className="px-4 py-2 font-medium text-[#1a1a1a]">{r.plan_year}</td>
                  <td className="px-4 py-2 text-[#666]">{r.investment_type ?? "—"}</td>
                  <td className="px-4 py-2 text-[#666]">
                    {translatePriority(r.priority, t)}
                  </td>
                  <td className="px-4 py-2 text-[#666]">
                    {translateStatus(r.status, t)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </ReportPage>
  )
}
