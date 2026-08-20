import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import {
  derivePlanItems,
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

export function RepairDebtPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building ? derivePlanItems(building, data.categoryEvaluations, t) : []
  const repairs = repairItems(planItems)
  const urgentCount = planItems.filter((i) => i.urgency === "valitom" || i.urgency === "1_3v").length

  // Group by urgency
  const byUrgency = URGENCY_ORDER.map((u) => ({
    urgency: u,
    label: urgencyShort(u, t),
    items: planItems.filter((i) => i.urgency === u),
  })).filter((g) => g.items.length > 0)

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle={t("reportContent.repairDebtTitle")}
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">{t("reportContent.repairDebtTitle")}</h2>

      {planItems.length === 0 ? (
        <p className="text-sm text-[#999]">{t("reportContent.repairDebtNoData")}</p>
      ) : (
        <>
          {/* KPI row */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: t("reportContent.execNeedsAttention"), value: String(repairs.length) },
              { label: t("reportContent.urgImmediate"), value: String(urgentCount) },
              { label: t("targetPlanning.plannedActionsSuffix"), value: String(planItems.length) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4 text-center"
              >
                <p className="text-xl font-bold text-[#1a1a1a]">{value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[#999]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Urgency breakdown */}
          {byUrgency.map((group) => (
            <PageSection key={group.urgency} title={`${group.label} — ${group.items.length} ${t("targetPlanning.actionsSuffix")}`}>
              <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      {[
                        t("reportContent.colComponent"),
                        t("reportContent.colCondition"),
                        t("reportContent.colRemainingYears"),
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
                    {group.items.map((item, idx) => (
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
                        <td className="px-4 py-2 text-[#666]">
                          {item.remainingLifespan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageSection>
          ))}
        </>
      )}
    </ReportPage>
  )
}
