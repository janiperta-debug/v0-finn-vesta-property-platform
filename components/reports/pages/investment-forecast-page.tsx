import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface InvestmentForecastPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function InvestmentForecastPage({ config, pageNumber, totalPages }: InvestmentForecastPageProps) {
  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Investointiennuste"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Investointiennuste</h1>

      <PageSection title="Ennuste">
        <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-6">
          {/* Placeholder line chart area */}
          <div className="relative h-32 w-full">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#e5e5e5]" />
            <div className="absolute left-0 top-0 bottom-0 w-px bg-[#e5e5e5]" />
            {/* Simulated upward trend line */}
            <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <polyline
                points="0,38 15,33 30,28 45,22 60,18 75,12 90,8 100,5"
                fill="none"
                stroke="#C8A84B"
                strokeWidth="1.5"
                opacity="0.5"
              />
            </svg>
          </div>
          <p className="mt-3 text-center text-[10px] text-[#ccc]">
            Placeholder – tiedot täytetään investointidatasta
          </p>
        </div>
      </PageSection>

      <PageSection title="Investointikohteet">
        <PlaceholderTable cols={4} rows={5} />
      </PageSection>

      <PageSection title="Taloudellinen analyysi">
        <PlaceholderBlock rows={4} />
      </PageSection>
    </ReportPage>
  )
}
