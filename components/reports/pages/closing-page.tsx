import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, PlaceholderBlock } from "./report-page"

interface ClosingPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function ClosingPage({ config, pageNumber, totalPages }: ClosingPageProps) {
  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Yhteenveto"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Yhteenveto ja johtopäätökset</h1>

      <PageSection title="Johtopäätökset">
        <PlaceholderBlock rows={5} label="Raportin keskeinen johtopäätös ja kokonaisarvio" />
      </PageSection>

      <PageSection title="Seuraavat askeleet">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C8A84B]/20 text-xs font-bold text-[#C8A84B]">
                {i}
              </div>
              <div className="h-2.5 flex-1 rounded-full bg-[#f0f0f0]" />
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title="Vastuuvapauslauseke">
        <p className="text-[11px] leading-relaxed text-[#bbb]">
          Tämä raportti on laadittu FinnVesta-järjestelmällä saatavilla olevien tietojen
          perusteella. Raportti on tarkoitettu ainoastaan informatiiviseen käyttöön eikä
          muodosta juridista tai taloudellista sitoumusta. Tietojen oikeellisuudesta vastaa
          tietojen syöttäjä.
        </p>
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
          <span className="text-xs text-[#bbb]">
            Raportti luotu {config.date}
          </span>
        </div>
      </div>
    </ReportPage>
  )
}
