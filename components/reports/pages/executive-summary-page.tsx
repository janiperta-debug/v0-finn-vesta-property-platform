import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import { derivePlanItems, overallCondition, repairItems, totalRepairCost } from "@/lib/building-plan"
import { formatEur } from "@/lib/database.types"

function conditionLabel(s: number) {
  if (s >= 4.5) return "Erinomainen"
  if (s >= 3.5) return "Hyvä"
  if (s >= 2.5) return "Tyydyttävä"
  if (s >= 1.5) return "Heikko"
  return "Erittäin heikko"
}
function conditionColor(s: number) {
  if (s >= 4) return "#22c55e"
  if (s >= 3) return "#f59e0b"
  return "#ef4444"
}

export function ExecutiveSummaryPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building ? derivePlanItems(building, data.categoryEvaluations, t) : []
  const condition = overallCondition(planItems)
  const repairs = repairItems(planItems)
  const debt = totalRepairCost(planItems)
  const completed = data.maintenanceTasks.filter((t) => t.status === "completed")
  const upcoming = data.maintenanceTasks.filter(
    (t) => t.status === "planned" || t.status === "in_progress",
  )

  const kpis = [
    {
      label: "Kokonaiskunto",
      value: condition > 0 ? `${condition.toFixed(1)} / 5` : "—",
      sub: condition > 0 ? conditionLabel(condition) : "Ei dataa",
      color: condition > 0 ? conditionColor(condition) : "#aaa",
    },
    {
      label: "Korjausvelka (arvio)",
      value: debt > 0 ? formatEur(debt) : "—",
      sub: "RT-standardien mukainen",
      color: "#1a1a1a",
    },
    {
      label: "Tarkastuksia",
      value: String(data.inspections.length),
      sub:
        data.inspections.length > 0
          ? `Viimeisin ${data.inspections[0].inspection_date?.slice(0, 10) ?? "—"}`
          : "Ei tarkastuksia",
      color: "#1a1a1a",
    },
    {
      label: "Suoritettuja huoltoja",
      value: String(completed.length),
      sub: `${upcoming.length} suunnitteilla`,
      color: "#1a1a1a",
    },
    {
      label: "Huomiota vaativia",
      value: String(repairs.length),
      sub: "komponenttia",
      color: repairs.length > 0 ? "#ef4444" : "#22c55e",
    },
    {
      label: "Investointisuunnitelmat",
      value: String(data.investmentPlans.length),
      sub: "PTS-riviä",
      color: "#1a1a1a",
    },
  ]

  return (
    <ReportPage config={config} pageNumber={pageNumber} totalPages={totalPages} sectionTitle="Tiivistelmä">
      <PageSection title="Tiivistelmä">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {kpis.map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#999]">{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="mt-0.5 text-[11px] text-[#aaa]">{sub}</p>
            </div>
          ))}
        </div>
      </PageSection>

      {building && (
        <PageSection title="Kiinteistötiedot lyhyesti">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            {[
              ["Nimi", building.name],
              ["Osoite", building.address ?? "—"],
              ["Rakennusvuosi", building.construction_year ? String(building.construction_year) : "—"],
              ["Pinta-ala", building.area_m2 ? `${building.area_m2.toLocaleString("fi-FI")} m²` : "—"],
              ["Rakennustyyppi", building.building_type ?? "—"],
              ["Kunta", building.municipality ?? "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] text-[#999]">{label}</dt>
                <dd className="font-medium text-[#1a1a1a]">{value}</dd>
              </div>
            ))}
          </dl>
        </PageSection>
      )}

      {repairs.length > 0 && (
        <PageSection title="Eniten huomiota vaativat komponentit">
          <ul className="space-y-1.5">
            {repairs.slice(0, 6).map((item) => (
              <li
                key={item.categoryStringId}
                className="flex items-center justify-between rounded border border-[#f0f0f0] px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#1a1a1a]">{item.categoryName}</span>
                <span className="text-[#999]">
                  Kunto {item.conditionScore.toFixed(1)} · {formatEur(item.cost)}
                </span>
              </li>
            ))}
          </ul>
        </PageSection>
      )}
    </ReportPage>
  )
}
