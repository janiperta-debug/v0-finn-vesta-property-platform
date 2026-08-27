import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import {
  derivePlanItems,
  overallCondition,
  repairItems,
  URGENCY_ORDER,
  type UrgencyCode,
} from "@/lib/building-plan"

function urgencyShort(u: UrgencyCode, t: (k: string) => string): string {
  switch (u) {
    case "valitom":
      return t("reportContent.urgImmediate")
    case "1_3v":
      return "1–3 v"
    case "3_5v":
      return "3–5 v"
    case "5_10v":
      return "5–10 v"
    default:
      return String(u)
  }
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score / 5) * 100)
  const color = score >= 4 ? "#22c55e" : score >= 3 ? "#f59e0b" : "#ef4444"
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-[#f0f0f0]">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-[#555]">
        {score.toFixed(1)}
      </span>
    </div>
  )
}

export function ConditionOverviewPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building
    ? derivePlanItems(building, data.categoryEvaluations, t)
    : []
  const condition = overallCondition(planItems)
  const repairs = repairItems(planItems)

  const urgencyCounts = URGENCY_ORDER.reduce<Record<string, number>>(
    (acc, u) => ({ ...acc, [u]: planItems.filter((i) => i.urgency === u).length }),
    {},
  )

  const condColor =
    condition >= 4 ? "#22c55e" : condition >= 3 ? "#f59e0b" : "#ef4444"

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle={t("reportContent.conditionTitle")}
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">{t("reportContent.conditionTitle")}</h2>

      {planItems.length === 0 ? (
        <p className="text-sm text-[#999]">{t("reportContent.conditionNoData")}</p>
      ) : (
        <>
          {/* Overall score card */}
          <div className="mb-8 flex items-center gap-6 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: condColor }}>
                {condition.toFixed(1)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[#999]">/ 5</p>
            </div>
            <div className="flex-1">
              <p className="mb-1 text-sm font-semibold text-[#1a1a1a]">{t("reportContent.conditionOverallLabel")}</p>
              <ScoreBar score={condition} />
              <p className="mt-2 text-xs text-[#999]">
                {repairs.length} {t("reportContent.conditionNeedsAttention")} ·{" "}
                {planItems.filter((i) => i.fromInspection).length} {t("reportContent.conditionInspected")}
              </p>
            </div>
          </div>

          {/* Urgency summary */}
          <PageSection title={t("reportContent.urgencyDistribution")}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {URGENCY_ORDER.map((u) => (
                <div
                  key={u}
                  className="rounded-lg border border-[#e5e5e5] p-3 text-center"
                >
                  <p className="text-2xl font-bold text-[#1a1a1a]">
                    {urgencyCounts[u] ?? 0}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#999]">
                    {urgencyShort(u, t)}
                  </p>
                </div>
              ))}
            </div>
          </PageSection>

          {/* Per-component table */}
          <PageSection title={t("reportContent.perComponentCondition")}>
            <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
              <table className="w-full text-sm">
                <thead className="bg-[#fafafa]">
                  <tr>
                    {[
                      t("reportContent.colComponent"),
                      t("reportContent.colCondition"),
                      t("reportContent.colUrgency"),
                    ].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-[#999]"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {planItems.map((item, idx) => (
                    <tr
                      key={item.categoryStringId}
                      className={idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}
                    >
                      <td className="px-4 py-2 font-medium text-[#1a1a1a]">
                        {item.categoryName}
                      </td>
                      <td className="px-4 py-2 w-32">
                        <ScoreBar score={item.conditionScore} />
                      </td>
                      <td className="px-4 py-2 text-[#666]">
                        {urgencyShort(item.urgency, t)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PageSection>
        </>
      )}
    </ReportPage>
  )
}
