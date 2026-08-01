import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface RepairDebtPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function RepairDebtPage({ config, pageNumber, totalPages }: RepairDebtPageProps) {
  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Korjausvelka"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Korjausvelka</h1>

      {/* Summary KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Kokonaiskorjausvelka", value: "–", unit: "€" },
          { label: "Per m²", value: "–", unit: "€/m²" },
          { label: "Kiireelliset", value: "–", unit: "€" },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-4 text-center"
          >
            <p className="text-2xl font-bold text-[#1a1a1a]">
              {value}
              <span className="ml-0.5 text-xs font-normal text-[#aaa]">{unit}</span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[#999]">{label}</p>
          </div>
        ))}
      </div>

      <PageSection title="Korjausvelkaerittely">
        <PlaceholderTable cols={4} rows={6} />
      </PageSection>

      <PageSection title="Korjausvelka rakennusosittain">
        <PlaceholderBlock rows={4} />
      </PageSection>
    </ReportPage>
  )
}
