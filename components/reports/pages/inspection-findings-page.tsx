import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"

const URGENCY_FI: Record<string, string> = {
  valitom: "Välitön",
  "1_3v": "1–3 v",
  "3_5v": "3–5 v",
  "5_10v": "5–10 v",
  immediate: "Välitön",
  short: "Lyhyt",
  medium: "Keskipitkä",
  long: "Pitkä",
}

const STATUS_FI: Record<string, string> = {
  draft: "Luonnos",
  complete: "Valmis",
  completed: "Valmis",
  approved: "Hyväksytty",
  archived: "Arkistoitu",
}

export function InspectionFindingsPage({ config, data, pageNumber, totalPages }: PageProps) {
  if (data.inspections.length === 0) {
    return (
      <ReportPage
        config={config}
        pageNumber={pageNumber}
        totalPages={totalPages}
        sectionTitle="Tarkastushavainnot"
      >
        <h2 className="mb-6 text-xl font-bold text-[#1a1a1a]">Tarkastushavainnot</h2>
        <p className="text-sm text-[#999]">Tarkastustietoja ei saatavilla.</p>
      </ReportPage>
    )
  }

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Tarkastushavainnot"
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">Tarkastushavainnot</h2>

      {data.inspections.map((insp) => {
        const catEvals = data.categoryEvaluations.filter(
          (e) => e.inspection_id === insp.id && (e.comment || e.score),
        )
        return (
          <PageSection
            key={insp.id}
            title={`Tarkastus ${insp.inspection_date?.slice(0, 10) ?? "—"}`}
          >
            {/* Meta row */}
            <dl className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm sm:grid-cols-4">
              {[
                ["Tarkastaja", insp.inspector_name ?? "—"],
                ["Tyyppi", insp.inspector_type ?? "—"],
                [
                  "Kokonaisarvio",
                  insp.overall_score != null
                    ? `${insp.overall_score.toFixed(1)} / 5`
                    : "—",
                ],
                [
                  "Tila",
                  STATUS_FI[insp.status ?? ""] ?? insp.status ?? "—",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10px] uppercase tracking-wider text-[#aaa]">
                    {label}
                  </dt>
                  <dd className="font-medium text-[#1a1a1a]">{value}</dd>
                </div>
              ))}
            </dl>

            {insp.notes && (
              <p className="mb-4 rounded bg-[#fafafa] p-3 text-sm text-[#555]">
                {insp.notes}
              </p>
            )}

            {catEvals.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
                <table className="w-full text-sm">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      {["Pisteet", "Kiireellisyys", "Huomio"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[#999]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {catEvals.map((e, idx) => (
                      <tr
                        key={e.id}
                        className={
                          idx % 2 === 0
                            ? "border-t border-[#f0f0f0] bg-white"
                            : "border-t border-[#f0f0f0] bg-[#fafafa]"
                        }
                      >
                        <td className="px-3 py-2 text-[#666]">
                          {e.score?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-[#666]">
                          {e.urgency
                            ? (URGENCY_FI[e.urgency] ?? e.urgency)
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-[#555]">
                          {e.comment ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#bbb]">Ei havaintoja tässä tarkastuksessa.</p>
            )}
          </PageSection>
        )
      })}
    </ReportPage>
  )
}
