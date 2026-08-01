import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface InspectionFindingsPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

function SeverityPill({ level }: { level: "critical" | "moderate" | "minor" }) {
  const styles = {
    critical: "bg-red-100 text-red-700",
    moderate: "bg-amber-100 text-amber-700",
    minor: "bg-blue-100 text-blue-700",
  }
  const labels = {
    critical: "Kriittinen",
    moderate: "Kohtalainen",
    minor: "Vähäinen",
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[level]}`}>
      {labels[level]}
    </span>
  )
}

export function InspectionFindingsPage({ config, pageNumber, totalPages }: InspectionFindingsPageProps) {
  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Tarkastushavainnot"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Tarkastushavainnot</h1>

      {/* Summary strip */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {(["critical", "moderate", "minor"] as const).map((level) => (
          <div
            key={level}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-center"
          >
            <SeverityPill level={level} />
            <p className="mt-2 text-2xl font-bold text-[#1a1a1a]">–</p>
            <p className="text-[10px] text-[#999]">havaintoa</p>
          </div>
        ))}
      </div>

      <PageSection title="Havaintojen yhteenveto">
        <PlaceholderTable cols={4} rows={6} />
      </PageSection>

      <PageSection title="Kriittiset havainnot">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
              <div className="mb-2 flex items-center gap-3">
                <SeverityPill level="critical" />
                <div className="h-2.5 w-40 rounded-full bg-[#e5e5e5]" />
              </div>
              <PlaceholderBlock rows={2} />
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title="Muut havainnot">
        <PlaceholderBlock rows={4} />
      </PageSection>
    </ReportPage>
  )
}
