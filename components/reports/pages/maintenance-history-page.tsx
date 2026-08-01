import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface MaintenanceHistoryPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function MaintenanceHistoryPage({ config, pageNumber, totalPages }: MaintenanceHistoryPageProps) {
  // Placeholder timeline years.
  const years = [2020, 2021, 2022, 2023, 2024, 2025]

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Huoltohistoria"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Huoltohistoria</h1>

      <PageSection title="Huoltotoimenpiteet vuosittain">
        {/* Simplified timeline */}
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-[#e5e5e5]" />
          <div className="space-y-5">
            {years.map((year) => (
              <div key={year} className="relative">
                <div className="absolute -left-[18px] mt-1 h-2.5 w-2.5 rounded-full border-2 border-[#C8A84B] bg-white" />
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#C8A84B]">
                  {year}
                </div>
                <PlaceholderBlock rows={1} />
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection title="Huoltotiedot">
        <PlaceholderTable cols={4} rows={6} />
      </PageSection>

      <PageSection title="Huomiot">
        <PlaceholderBlock rows={3} />
      </PageSection>
    </ReportPage>
  )
}
