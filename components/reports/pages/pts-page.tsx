import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import {
  derivePlanItems,
  timelineBuckets,
} from "@/lib/building-plan"
import { formatEur } from "@/lib/database.types"

export function PTSPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building ? derivePlanItems(building, data.categoryEvaluations, t) : []
  const buckets = timelineBuckets(planItems, t)

  // Also include investment_plans rows from DB
  const investmentRows = data.investmentPlans.sort((a, b) => a.plan_year - b.plan_year)

  // Bar chart: costs grouped by urgency bucket
  const maxTotal = Math.max(...buckets.map((b) => b.total), 1)

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle={t("reportContent.ptsTitle")}
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">
        {t("reportContent.ptsTitle")}
      </h2>

      {planItems.length === 0 && investmentRows.length === 0 ? (
        <p className="text-sm text-[#999]">{t("reportContent.ptsNoData")}</p>
      ) : (
        <>
          {/* Urgency bucket bars */}
          {buckets.length > 0 && (
            <PageSection title={t("reportContent.ptsCostByUrgency")}>
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-6">
                <div className="flex h-28 items-end gap-4">
                  {buckets.map((b) => {
                    const pct = Math.round((b.total / maxTotal) * 100)
                    return (
                      <div key={b.urgency} className="flex flex-1 flex-col items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-[#555]">
                          {formatEur(b.total)}
                        </span>
                        <div
                          className="w-full rounded-t-sm bg-[#1e6fbf]/70"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[9px] text-[#aaa]">
                          {b.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </PageSection>
          )}

          {/* Per-bucket component tables */}
          {buckets.map((bucket) => (
            <PageSection
              key={bucket.urgency}
              title={`${bucket.label} — ${formatEur(bucket.total)}`}
            >
              <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      {[
                        t("reportContent.colComponent"),
                        t("reportContent.colCondition"),
                        t("reportContent.colRemainingYears"),
                        t("reportContent.colCostEstimate"),
                      ].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#999]"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {bucket.items.map((item, idx) => (
                      <tr
                        key={item.categoryStringId}
                        className={
                          idx % 2 === 0
                            ? "border-t border-[#f0f0f0] bg-white"
                            : "border-t border-[#f0f0f0] bg-[#fafafa]"
                        }
                      >
                        <td className="px-4 py-2 font-medium text-[#1a1a1a]">
                          {item.categoryName}
                        </td>
                        <td className="px-4 py-2 text-[#666]">
                          {item.conditionScore.toFixed(1)} / 5
                        </td>
                        <td className="px-4 py-2 text-[#666]">{item.remainingLifespan}</td>
                        <td className="px-4 py-2 text-right text-[#666]">
                          {formatEur(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageSection>
          ))}

          {/* DB investment_plans if present */}
          {investmentRows.length > 0 && (
            <PageSection title={`${t("reportContent.ptsInvestmentPlans")} (${investmentRows.length} ${t("reportContent.ptsRowsUnit")})`}>
              <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      {[
                        t("reportContent.colYear"),
                        t("reportContent.colType"),
                        t("reportContent.colInvestment"),
                        t("reportContent.colPriority"),
                        t("reportContent.colStatus"),
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#999]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {investmentRows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={
                          idx % 2 === 0
                            ? "border-t border-[#f0f0f0] bg-white"
                            : "border-t border-[#f0f0f0] bg-[#fafafa]"
                        }
                      >
                        <td className="px-4 py-2 font-medium text-[#1a1a1a]">
                          {row.plan_year}
                        </td>
                        <td className="px-4 py-2 text-[#666]">{row.investment_type ?? "—"}</td>
                        <td className="px-4 py-2 text-[#666]">
                          {row.planned_investment != null
                            ? formatEur(row.planned_investment)
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-[#666]">{row.priority ?? "—"}</td>
                        <td className="px-4 py-2 text-[#666]">{row.status ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageSection>
          )}
        </>
      )}
    </ReportPage>
  )
}
