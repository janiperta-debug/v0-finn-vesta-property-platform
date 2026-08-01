import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface ConditionOverviewPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

// Condition rating scale 1–5 displayed as a visual bar.
function ConditionBar({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-36 shrink-0 text-sm text-[#555]">{label}</span>
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="h-3 flex-1 rounded-sm"
            style={{
              backgroundColor: n <= rating
                ? rating >= 4 ? "#4ade80" : rating >= 3 ? "#facc15" : "#f87171"
                : "#f0f0f0",
            }}
          />
        ))}
      </div>
      <span className="w-6 text-right text-sm font-semibold text-[#1a1a1a]">{rating}</span>
    </div>
  )
}

export function ConditionOverviewPage({ config, pageNumber, totalPages }: ConditionOverviewPageProps) {
  const systems = [
    { label: "Rakenteet", rating: 0 },
    { label: "LVIS-järjestelmät", rating: 0 },
    { label: "Ulkovaippa", rating: 0 },
    { label: "Sisätilat", rating: 0 },
    { label: "Piha-alueet", rating: 0 },
  ]

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Kuntotilanne"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Kuntotilanne</h1>

      <PageSection title="Kuntoluokitukset järjestelmittäin">
        <div className="space-y-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-6 py-5">
          <p className="mb-4 text-xs text-[#bbb]">
            Tiedot täytetään kuntotarkastusdatasta (placeholder)
          </p>
          {systems.map((s) => (
            <ConditionBar key={s.label} rating={s.rating} label={s.label} />
          ))}
        </div>
      </PageSection>

      <PageSection title="Kuntoluokkien selitteet">
        <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
          {[
            { n: 1, label: "Heikko", color: "#f87171" },
            { n: 2, label: "Välttävä", color: "#fb923c" },
            { n: 3, label: "Tyydyttävä", color: "#facc15" },
            { n: 4, label: "Hyvä", color: "#a3e635" },
            { n: 5, label: "Erinomainen", color: "#4ade80" },
          ].map(({ n, label, color }) => (
            <div key={n} className="rounded border border-[#e5e5e5] bg-[#fafafa] px-2 py-2">
              <div
                className="mx-auto mb-1.5 h-2 w-8 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[#555]">{n} – {label}</span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title="Havaintojen jakauma">
        <PlaceholderTable cols={4} rows={4} />
      </PageSection>

      <PageSection title="Yleishuomiot">
        <PlaceholderBlock rows={4} />
      </PageSection>
    </ReportPage>
  )
}
