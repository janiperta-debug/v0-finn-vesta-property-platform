import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import { formatEur } from "@/lib/database.types"

const PRIORITY_KEYS: Record<string, string> = {
  low: "reportContent.prioLow",
  medium: "reportContent.prioMedium",
  high: "reportContent.prioHigh",
  urgent: "reportContent.prioUrgent",
}

function translatePriority(p: string | null | undefined, t: (k: string) => string): string {
  if (!p) return "—"
  const key = PRIORITY_KEYS[p]
  return key ? t(key) : p
}

export function MaintenanceHistoryPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  // Completed tasks sorted newest first; upcoming tasks sorted oldest first.
  const completed = data.maintenanceTasks
    .filter((task) => task.status === "completed")
    .sort((a, b) =>
      (b.completed_date ?? b.created_at).localeCompare(
        a.completed_date ?? a.created_at,
      ),
    )

  const upcoming = data.maintenanceTasks
    .filter((task) => task.status === "planned" || task.status === "in_progress")
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
        sectionTitle={t("reportContent.maintenanceTitle")}
      >
        <h2 className="mb-6 text-xl font-bold text-[#1a1a1a]">{t("reportContent.maintenanceTitle")}</h2>
        <p className="text-sm text-[#999]">{t("reportContent.maintenanceNoData")}</p>
      </ReportPage>
    )
  }

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle={t("reportContent.maintenanceTitle")}
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">{t("reportContent.maintenanceTitle")}</h2>

      {completed.length > 0 && (
        <PageSection title={`${t("reportContent.maintenanceCompleted")} (${completed.length})`}>
          <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
            <table className="w-full text-sm">
              <thead className="bg-[#fafafa]">
                <tr>
                  {[
                    t("reportContent.colDate"),
                    t("reportContent.colAction"),
                    t("reportContent.colComponent"),
                    t("reportContent.colPriority"),
                    t("reportContent.colCost"),
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
                {completed.map((task, idx) => (
                  <tr
                    key={task.id}
                    className={
                      idx % 2 === 0
                        ? "border-t border-[#f0f0f0] bg-white"
                        : "border-t border-[#f0f0f0] bg-[#fafafa]"
                    }
                  >
                    <td className="px-4 py-2 text-[#666]">
                      {(task.completed_date ?? task.scheduled_date ?? task.created_at).slice(0, 10)}
                    </td>
                    <td className="px-4 py-2 font-medium text-[#1a1a1a]">{task.title}</td>
                    <td className="px-4 py-2 text-[#666]">{task.component_type ?? "—"}</td>
                    <td className="px-4 py-2 text-[#666]">
                      {translatePriority(task.priority, t)}
                    </td>
                    <td className="px-4 py-2 text-right text-[#666]">
                      {task.actual_cost != null ? formatEur(task.actual_cost) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>
      )}

      {upcoming.length > 0 && (
        <PageSection title={`${t("reportContent.maintenancePlanned")} (${upcoming.length})`}>
          <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
            <table className="w-full text-sm">
              <thead className="bg-[#fafafa]">
                <tr>
                  {[
                    t("reportContent.colDate"),
                    t("reportContent.colAction"),
                    t("reportContent.colComponent"),
                    t("reportContent.colPriority"),
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
                {upcoming.map((task, idx) => (
                  <tr
                    key={task.id}
                    className={
                      idx % 2 === 0
                        ? "border-t border-[#f0f0f0] bg-white"
                        : "border-t border-[#f0f0f0] bg-[#fafafa]"
                    }
                  >
                    <td className="px-4 py-2 text-[#666]">
                      {(task.scheduled_date ?? task.created_at).slice(0, 10)}
                    </td>
                    <td className="px-4 py-2 font-medium text-[#1a1a1a]">{task.title}</td>
                    <td className="px-4 py-2 text-[#666]">{task.component_type ?? "—"}</td>
                    <td className="px-4 py-2 text-[#666]">
                      {translatePriority(task.priority, t)}
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
