import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"

const URGENCY_KEYS: Record<string, string> = {
  valitom: "reportContent.urgImmediate",
  "1_3v": "reportContent.urgShort",
  "3_5v": "reportContent.urgMedium",
  "5_10v": "reportContent.urgLong",
  immediate: "reportContent.urgImmediate",
  short: "reportContent.urgShort",
  medium: "reportContent.urgMedium",
  long: "reportContent.urgLong",
}

const STATUS_KEYS: Record<string, string> = {
  draft: "reportContent.statusDraft",
  complete: "reportContent.statusCompleted",
  completed: "reportContent.statusCompleted",
  approved: "reportContent.statusApproved",
  archived: "reportContent.statusArchived",
}

function translateUrgency(u: string | null | undefined, t: (k: string) => string): string {
  if (!u) return "—"
  const key = URGENCY_KEYS[u]
  return key ? t(key) : u
}

function translateStatus(s: string | null | undefined, t: (k: string) => string): string {
  if (!s) return "—"
  const key = STATUS_KEYS[s]
  return key ? t(key) : s
}

export function InspectionFindingsPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  if (data.inspections.length === 0) {
    return (
      <ReportPage
        config={config}
        pageNumber={pageNumber}
        totalPages={totalPages}
        sectionTitle={t("reportContent.inspectionTitle")}
      >
        <h2 className="mb-6 text-xl font-bold text-[#1a1a1a]">{t("reportContent.inspectionTitle")}</h2>
        <p className="text-sm text-[#999]">{t("reportContent.inspectionNoData")}</p>
      </ReportPage>
    )
  }

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle={t("reportContent.inspectionTitle")}
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">{t("reportContent.inspectionTitle")}</h2>

      {data.inspections.map((insp) => {
        const catEvals = data.categoryEvaluations.filter(
          (e) => e.inspection_id === insp.id && (e.comment || e.score),
        )
        return (
          <PageSection
            key={insp.id}
            title={`${t("reportContent.inspectionPrefix")} ${insp.inspection_date?.slice(0, 10) ?? "—"}`}
          >
            {/* Meta row */}
            <dl className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm sm:grid-cols-4">
              {[
                [t("reportContent.inspectionInspector"), insp.inspector_name ?? "—"],
                [t("reportContent.inspectionType"), insp.inspector_type ?? "—"],
                [
                  t("reportContent.inspectionOverallScore"),
                  insp.overall_score != null
                    ? `${insp.overall_score.toFixed(1)} / 5`
                    : "—",
                ],
                [
                  t("reportContent.fieldStatus"),
                  translateStatus(insp.status, t),
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
                      {[
                        t("reportContent.colScore"),
                        t("reportContent.colUrgency"),
                        t("reportContent.colNote"),
                      ].map((h) => (
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
                          {translateUrgency(e.urgency, t)}
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
              <p className="text-xs text-[#bbb]">{t("reportContent.inspectionNoFindings")}</p>
            )}
          </PageSection>
        )
      })}
    </ReportPage>
  )
}
