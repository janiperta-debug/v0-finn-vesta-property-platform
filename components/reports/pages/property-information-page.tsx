import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection, InfoGrid, PlaceholderBlock, PlaceholderTable } from "./report-page"

interface PropertyInformationPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function PropertyInformationPage({ config, pageNumber, totalPages }: PropertyInformationPageProps) {
  // Show first property's details; for multi-property reports list all.
  const primary = config.properties[0]

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Kiinteistötiedot"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Kiinteistötiedot</h1>

      {config.properties.map((prop, i) => (
        <div key={prop.id} className={i > 0 ? "mt-10" : ""}>
          {config.properties.length > 1 && (
            <h2 className="mb-4 text-base font-semibold text-[#1a1a1a]">{prop.name}</h2>
          )}

          <PageSection title="Perustiedot">
            <InfoGrid
              rows={[
                { label: "Nimi", value: prop.name },
                { label: "Osoite", value: prop.address ?? "–" },
                { label: "Rakennusvuosi", value: "–" },
                { label: "Pinta-ala", value: "–" },
                { label: "Kerrokset", value: "–" },
                { label: "Käyttötarkoitus", value: "–" },
              ]}
            />
          </PageSection>

          <PageSection title="Tekniset järjestelmät">
            <PlaceholderTable cols={3} rows={5} />
          </PageSection>

          <PageSection title="Lisätiedot">
            <PlaceholderBlock rows={3} />
          </PageSection>
        </div>
      ))}
    </ReportPage>
  )
}
