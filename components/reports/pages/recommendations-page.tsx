import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import { derivePlanItems, repairItems, type UrgencyCode } from "@/lib/building-plan"
import { formatEur } from "@/lib/database.types"

const URGENCY_FI: Record<UrgencyCode, string> = {
  valitom: "Välitön",
  "1_3v": "1–3 v",
  "3_5v": "3–5 v",
  "5_10v": "5–10 v",
}

const URGENCY_COLOR: Record<UrgencyCode, string> = {
  valitom: "bg-red-50 text-red-700 border-red-200",
  "1_3v": "bg-amber-50 text-amber-700 border-amber-200",
  "3_5v": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "5_10v": "bg-green-50 text-green-700 border-green-200",
}

export function RecommendationsPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building ? derivePlanItems(building, data.categoryEvaluations, t) : []
  const repairs = repairItems(planItems)

  // Also pull planned maintenance tasks as additional recommendations
  const plannedTasks = data.maintenanceTasks.filter(
    (t) => t.status === "planned" || t.status === "in_progress",
  )

  if (repairs.length === 0 && plannedTasks.length === 0) {
    return (
      <ReportPage
        config={config}
        pageNumber={pageNumber}
        totalPages={totalPages}
        sectionTitle="Suositukset"
      >
        <h2 className="mb-6 text-xl font-bold text-[#1a1a1a]">Suositukset</h2>
        <p className="text-sm text-[#999]">Suosituksia ei saatavilla.</p>
      </ReportPage>
    )
  }

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Suositukset"
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">Suositukset</h2>

      {repairs.length > 0 && (
        <PageSection title="Komponenttikohtaiset toimenpidesuositukset">
          <div className="space-y-2">
            {repairs.map((item) => (
              <div
                key={item.categoryStringId}
                className="flex items-start gap-3 rounded-lg border border-[#e5e5e5] p-4"
              >
                <span
                  className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-medium ${URGENCY_COLOR[item.urgency]}`}
                >
                  {URGENCY_FI[item.urgency]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1a1a1a] text-sm">{item.categoryName}</p>
                  <p className="text-xs text-[#999] mt-0.5">
                    Kunto {item.conditionScore.toFixed(1)} / 5 ·{" "}
                    {item.remainingLifespan > 0
                      ? `Jäljellä n. ${item.remainingLifespan} v`
                      : "Tekninen käyttöikä täynnä"}{" "}
                    · Arvio {formatEur(item.cost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      )}

      {plannedTasks.length > 0 && (
        <PageSection title="Suunnitellut huoltotoimet">
          <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
            <table className="w-full text-sm">
              <thead className="bg-[#fafafa]">
                <tr>
                  {["Toimenpide", "Komponentti", "Ajankohta", "Arvio"].map((h) => (
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
                {plannedTasks.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={
                      idx % 2 === 0
                        ? "border-t border-[#f0f0f0] bg-white"
                        : "border-t border-[#f0f0f0] bg-[#fafafa]"
                    }
                  >
                    <td className="px-4 py-2 font-medium text-[#1a1a1a]">{t.title}</td>
                    <td className="px-4 py-2 text-[#666]">{t.component_type ?? "—"}</td>
                    <td className="px-4 py-2 text-[#666]">
                      {t.scheduled_date?.slice(0, 10) ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-right text-[#666]">
                      {t.estimated_cost != null ? formatEur(t.estimated_cost) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>
      )}
    </ReportPage>
  )
}
