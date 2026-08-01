import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface RecommendationsPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

function PriorityTag({ priority }: { priority: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-red-50 text-red-600 border-red-200",
    medium: "bg-amber-50 text-amber-600 border-amber-200",
    low: "bg-green-50 text-green-600 border-green-200",
  }
  const labels = { high: "Korkea", medium: "Kohtalainen", low: "Matala" }
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${styles[priority]}`}>
      {labels[priority]}
    </span>
  )
}

export function RecommendationsPage({ config, pageNumber, totalPages }: RecommendationsPageProps) {
  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Suositukset"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Suositukset</h1>

      <PageSection title="Välittömät toimenpiteet">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
              <PriorityTag priority="high" />
              <PlaceholderBlock rows={2} />
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title="Suunnitelmalliset toimenpiteet">
        <PlaceholderTable cols={4} rows={4} />
      </PageSection>

      <PageSection title="Pitkän aikavälin suositukset">
        <PlaceholderBlock rows={3} />
      </PageSection>
    </ReportPage>
  )
}
