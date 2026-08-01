import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import { formatEur } from "@/lib/database.types"

const PRIORITY_FI: Record<string, string> = {
  low: "Matala",
  medium: "Kohtalainen",
  high: "Korkea",
  urgent: "Kiireellinen",
}

const STATUS_FI: Record<string, string> = {
  planned: "Suunniteltu",
  in_progress: "Käynnissä",
  completed: "Valmis",
  cancelled: "Peruutettu",
}

export function MaintenanceHistoryPage({ config, data, pageNumber, totalPages }: PageProps) {
  // Completed tasks sorted newest first; upcoming tasks sorted oldest first.
  const completed = data.maintenanceTasks
    .filter((t) => t.status === "completed")
    .sort((a, b) =>
      (b.completed_date ?? b.created_at).localeCompare(
        a.completed_date ?? a.created_at,
      ),
    )

  const upcoming = data.maintenanceTasks
    .filter((t) => t.status === "planned" || t.status === "in_progress")
    .sort((a, b) =>
      (a.scheduled_date ?? a.created_at).localeCompare(
        b.scheduled_date ?? b.created_at,
      ),
    )

  if (data.maintenanceTasks.length === 0) {
    return (
      <ReportPage
        config={config}
        pageNumber={pageNumber}
        totalPages={totalPages}
        sectionTitle="Huoltohistoria"
      >
        <h2 className="mb-6 text-xl font-bold text-[#1a1a1a]">Huoltohistoria</h2>
        <p className="text-sm text-[#999]">Huoltotietoja ei saatavilla.</p>
      </ReportPage>
    )
  }

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Huoltohistoria"
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">Huoltohistoria</h2>

      {completed.length > 0 && (
        <PageSection title={`Suoritetut huoltotoimet (${completed.length})`}>
          <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
            <table className="w-full text-sm">
              <thead className="bg-[#fafafa]">
                <tr>
                  {["Päivämäärä", "Toimenpide", "Komponentti", "Prioriteetti", "Kustannus"].map(
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
                {completed.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={
                      idx % 2 === 0
                        ? "border-t border-[#f0f0f0] bg-white"
                        : "border-t border-[#f0f0f0] bg-[#fafafa]"
                    }
                  >
                    <td className="px-4 py-2 text-[#666]">
                      {(t.completed_date ?? t.scheduled_date ?? t.created_at).slice(0, 10)}
                    </td>
                    <td className="px-4 py-2 font-medium text-[#1a1a1a]">{t.title}</td>
                    <td className="px-4 py-2 text-[#666]">{t.component_type ?? "—"}</td>
                    <td className="px-4 py-2 text-[#666]">
                      {t.priority ? (PRIORITY_FI[t.priority] ?? t.priority) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right text-[#666]">
                      {t.actual_cost != null
                        ? formatEur(t.actual_cost)
                        : t.estimated_cost != null
                        ? `${formatEur(t.estimated_cost)} (arvio)`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>
      )}

      {upcoming.length > 0 && (
        <PageSection title={`Suunnitellut toimet (${upcoming.length})`}>
          <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
            <table className="w-full text-sm">
              <thead className="bg-[#fafafa]">
                <tr>
                  {["Päivämäärä", "Toimenpide", "Komponentti", "Prioriteetti", "Arvio"].map(
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
                {upcoming.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={
                      idx % 2 === 0
                        ? "border-t border-[#f0f0f0] bg-white"
                        : "border-t border-[#f0f0f0] bg-[#fafafa]"
                    }
                  >
                    <td className="px-4 py-2 text-[#666]">
                      {(t.scheduled_date ?? t.created_at).slice(0, 10)}
                    </td>
                    <td className="px-4 py-2 font-medium text-[#1a1a1a]">{t.title}</td>
                    <td className="px-4 py-2 text-[#666]">{t.component_type ?? "—"}</td>
                    <td className="px-4 py-2 text-[#666]">
                      {t.priority ? (PRIORITY_FI[t.priority] ?? t.priority) : "—"}
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
