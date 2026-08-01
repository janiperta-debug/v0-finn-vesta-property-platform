import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface ExecutiveSummaryPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function ExecutiveSummaryPage({ config, pageNumber, totalPages }: ExecutiveSummaryPageProps) {
  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Johdon yhteenveto"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Johdon yhteenveto</h1>

      {/* KPI row */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: "Kokonaisarvo", value: "–", unit: "€" },
          { label: "Kuntoluokka", value: "–", unit: "/5" },
          { label: "Toimenpiteitä", value: "–", unit: "kpl" },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-5 py-4 text-center"
          >
            <p className="text-2xl font-bold text-[#1a1a1a]">
              {value}
              <span className="ml-0.5 text-sm font-normal text-[#aaa]">{unit}</span>
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-[#999]">{label}</p>
          </div>
        ))}
      </div>

      <PageSection title="Tiivistelmä">
        <PlaceholderBlock rows={5} label="Yleinen kuntotilanne ja keskeiset havainnot" />
      </PageSection>

      <PageSection title="Kriittiset toimenpiteet">
        <PlaceholderTable cols={3} rows={4} />
      </PageSection>

      <PageSection title="Suositukset lyhyesti">
        <PlaceholderBlock rows={3} />
      </PageSection>
    </ReportPage>
  )
}
