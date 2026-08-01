import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import { derivePlanItems, overallCondition, totalRepairCost } from "@/lib/building-plan"
import { formatEur } from "@/lib/database.types"

const tStub = (k: string) => k

export function ClosingPage({ config, data, pageNumber, totalPages }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building ? derivePlanItems(building, data.categoryEvaluations, tStub) : []
  const condition = overallCondition(planItems)
  const debt = totalRepairCost(planItems)

  // Report metadata
  const meta = [
    { label: "Luotu", value: new Date().toLocaleDateString("fi-FI") },
    { label: "Luonut", value: "FinnVesta-järjestelmä" },
    { label: "Raporttiversio", value: "1.0" },
    {
      label: "Kiinteistötunniste",
      value:
        config.properties.length === 1
          ? String(config.properties[0].id)
          : `${config.properties.length} kiinteistöä`,
    },
    { label: "Raporttitunnus", value: "—" },
  ]

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Yhteenveto"
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">Yhteenveto ja johtopäätökset</h2>

      {/* Key findings */}
      {(condition > 0 || debt > 0) && (
        <PageSection title="Keskeiset löydökset">
          <div className="grid grid-cols-2 gap-4">
            {condition > 0 && (
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#aaa]">Kokonaiskunto</p>
                <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">
                  {condition.toFixed(1)} <span className="text-sm font-normal text-[#aaa]">/ 5</span>
                </p>
              </div>
            )}
            {debt > 0 && (
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#aaa]">Korjausvelka (arvio)</p>
                <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">{formatEur(debt)}</p>
              </div>
            )}
          </div>
        </PageSection>
      )}

      <PageSection title="Vastuuvapauslauseke">
        <p className="text-[11px] leading-relaxed text-[#aaa]">
          Tämä raportti on laadittu FinnVesta-järjestelmällä saatavilla olevien tietojen
          perusteella. Raportti on tarkoitettu ainoastaan informatiiviseen käyttöön eikä
          muodosta juridista tai taloudellista sitoumusta. Tietojen oikeellisuudesta vastaa
          tietojen syöttäjä.
        </p>
      </PageSection>

      {/* Report metadata */}
      <PageSection title="Raportin tiedot">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
          {meta.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-[10px] uppercase tracking-wider text-[#aaa]">{label}</dt>
              <dd className="font-medium text-[#555]">{value}</dd>
            </div>
          ))}
        </dl>
      </PageSection>

      {/* Bottom gold bar */}
      <div className="mt-12 border-t-2 border-[#C8A84B] pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#C8A84B]">
              <span className="text-[10px] font-bold text-white">FV</span>
            </div>
            <span className="text-xs font-semibold tracking-widest text-[#888] uppercase">
              FinnVesta
            </span>
          </div>
          <span className="text-xs text-[#bbb]">Raportti luotu {config.date}</span>
        </div>
      </div>
    </ReportPage>
  )
}
