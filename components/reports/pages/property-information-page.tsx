import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection, InfoGrid } from "./report-page"

function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—"
  return String(v)
}

const STATUS_FI: Record<string, string> = {
  active: "Aktiivinen",
  inactive: "Ei aktiivinen",
  archived: "Arkistoitu",
  draft: "Luonnos",
}

function translateStatus(s: string | null | undefined): string {
  if (!s) return "—"
  return STATUS_FI[s] ?? s
}

/** Returns true if the string looks like raw JSON. */
function isJsonString(s: string): boolean {
  const trimmed = s.trim()
  return (trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 2
}

export function PropertyInformationPage({ config, data, pageNumber, totalPages }: PageProps) {
  return (
    <ReportPage config={config} pageNumber={pageNumber} totalPages={totalPages} sectionTitle="Kiinteistötiedot">
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">Kiinteistötiedot</h2>

      {data.buildings.length === 0 ? (
        <p className="text-sm text-[#999]">Kiinteistötietoja ei löydy.</p>
      ) : (
        data.buildings.map((b) => (
          <PageSection key={b.id} title={data.buildings.length > 1 ? b.name : "Perustiedot"}>
            <InfoGrid
              rows={[
                { label: "Nimi", value: val(b.name) },
                { label: "Osoite", value: val(b.address) },
                { label: "Kunta", value: val(b.municipality) },
                { label: "Rakennustyyppi", value: val(b.building_type) },
                { label: "Käyttötarkoitus", value: val(b.usage_category) },
                { label: "Rakennusvuosi", value: val(b.construction_year) },
                {
                  label: "Pinta-ala",
                  value: b.area_m2
                    ? `${b.area_m2.toLocaleString("fi-FI")} m²`
                    : "—",
                },
                {
                  label: "Kustannus/m²",
                  value: b.cost_per_m2
                    ? `${b.cost_per_m2.toLocaleString("fi-FI")} €/m²`
                    : "—",
                },
                { label: "Tila", value: translateStatus(b.status) },
              ].filter((r) => r.value !== "—")}
            />
            {b.notes && !isJsonString(b.notes) && (
              <div className="mt-4 rounded-lg bg-[#fafafa] p-4">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#aaa]">
                  Lisätiedot
                </p>
                <p className="text-sm text-[#555]">{b.notes}</p>
              </div>
            )}
          </PageSection>
        ))
      )}
    </ReportPage>
  )
}
