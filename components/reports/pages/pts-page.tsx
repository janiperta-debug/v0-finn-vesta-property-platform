import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import {
  derivePlanItems,
  timelineBuckets,
  type UrgencyCode,
} from "@/lib/building-plan"
import { formatEur } from "@/lib/database.types"

const tStub = (k: string) => k

const URGENCY_FI: Record<UrgencyCode, string> = {
  valitom: "Välitön",
  "1_3v": "1–3 v",
  "3_5v": "3–5 v",
  "5_10v": "5–10 v",
}

export function PTSPage({ config, data, pageNumber, totalPages }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building ? derivePlanItems(building, data.categoryEvaluations, tStub) : []
  const buckets = timelineBuckets(planItems, tStub)

  // Also include investment_plans rows from DB
  const investmentRows = data.investmentPlans.sort((a, b) => a.plan_year - b.plan_year)

  // Bar chart: costs grouped by urgency bucket
  const maxTotal = Math.max(...buckets.map((b) => b.total), 1)

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="PTS-suunnitelma"
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">
        PTS – Pitkän tähtäimen suunnitelma
      </h2>

      {planItems.length === 0 && investmentRows.length === 0 ? (
        <p className="text-sm text-[#999]">PTS-dataa ei saatavilla.</p>
      ) : (
        <>
          {/* Urgency bucket bars */}
          {buckets.length > 0 && (
            <PageSection title="Kustannusjakauma kiireellisyysluokittain">
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
                          className="w-full rounded-t-sm bg-[#C8A84B]/70"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[9px] text-[#aaa]">
                          {URGENCY_FI[b.urgency as UrgencyCode] ?? b.urgency}
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
              title={`${URGENCY_FI[bucket.urgency as UrgencyCode] ?? bucket.urgency} — ${formatEur(bucket.total)}`}
            >
              <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      {["Komponentti", "Kunto", "Jäljellä (v)", "Kustannus (arvio)"].map(
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
            <PageSection title={`Investointisuunnitelmat (${investmentRows.length} riviä)`}>
              <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      {["Vuosi", "Tyyppi", "Investointi", "Prioriteetti", "Tila"].map((h) => (
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
