import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface PTSPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function PTSPage({ config, pageNumber, totalPages }: PTSPageProps) {
  const currentYear = new Date().getFullYear()
  // Build a simple decade of placeholder bars.
  const barYears = Array.from({ length: 10 }, (_, i) => currentYear + i)
  const barHeights = [40, 65, 30, 80, 45, 55, 70, 35, 60, 50]

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="PTS-suunnitelma"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">PTS – Pitkän tähtäimen suunnitelma</h1>

      <PageSection title="Kustannusennuste vuosittain">
        {/* Placeholder bar chart */}
        <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-6">
          <div className="flex h-28 items-end gap-2">
            {barYears.map((year, i) => (
              <div key={year} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-[#C8A84B]/70"
                  style={{ height: `${barHeights[i]}%` }}
                />
                <span className="text-[9px] text-[#bbb]">{year}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[10px] text-[#ccc]">
            Placeholder – tiedot täytetään PTS-datasta
          </p>
        </div>
      </PageSection>

      <PageSection title="PTS-toimenpiteet">
        <PlaceholderTable cols={5} rows={6} />
      </PageSection>

      <PageSection title="Aikajänne: {config.timeHorizon}">
        <PlaceholderBlock rows={3} />
      </PageSection>
    </ReportPage>
  )
}
