import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import {
  derivePlanItems,
  repairItems,
  totalRepairCost,
  URGENCY_ORDER,
  type UrgencyCode,
} from "@/lib/building-plan"
import { formatEur } from "@/lib/database.types"

const URGENCY_FI: Record<UrgencyCode, string> = {
  valitom: "Välitön",
  "1_3v": "1–3 v",
  "3_5v": "3–5 v",
  "5_10v": "5–10 v",
}

export function RepairDebtPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building ? derivePlanItems(building, data.categoryEvaluations, t) : []
  const repairs = repairItems(planItems)
  const totalDebt = totalRepairCost(planItems)
  const urgentDebt = planItems
    .filter((i) => i.urgency === "valitom" || i.urgency === "1_3v")
    .reduce((s, i) => s + i.cost, 0)
  const perM2 =
    building?.area_m2 && building.area_m2 > 0
      ? totalDebt / building.area_m2
      : null

  // Group by urgency
  const byUrgency = URGENCY_ORDER.map((u) => ({
    urgency: u,
    label: URGENCY_FI[u],
    items: planItems.filter((i) => i.urgency === u && i.cost > 0),
    total: planItems.filter((i) => i.urgency === u).reduce((s, i) => s + i.cost, 0),
  })).filter((g) => g.items.length > 0)

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Korjausvelka"
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">Korjausvelka</h2>

      {planItems.length === 0 ? (
        <p className="text-sm text-[#999]">Korjausvelkadata ei saatavilla.</p>
      ) : (
        <>
          {/* KPI row */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Kokonaiskorjausvelka", value: formatEur(totalDebt) },
              { label: "Per m²", value: perM2 != null ? formatEur(perM2) : "—" },
              { label: "Kiireelliset (0–3 v)", value: formatEur(urgentDebt) },
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
            <PageSection key={group.urgency} title={`${group.label} — yhteensä ${formatEur(group.total)}`}>
              <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      {["Komponentti", "Kunto", "Jäljellä (v)", "Kustannus (arvio)"].map((h) => (
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
        </>
      )}
    </ReportPage>
  )
}
