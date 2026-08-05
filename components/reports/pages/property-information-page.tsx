import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection, InfoGrid } from "./report-page"

function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—"
  return String(v)
}

const STATUS_KEYS: Record<string, string> = {
  active: "reportContent.statusActive",
  inactive: "reportContent.statusInactive",
  archived: "reportContent.statusArchived",
  draft: "reportContent.statusDraft",
}

function translateStatus(s: string | null | undefined, t: (k: string) => string): string {
  if (!s) return "—"
  const key = STATUS_KEYS[s]
  return key ? t(key) : s
}

/** Returns true if the string looks like raw JSON. */
function isJsonString(s: string): boolean {
  const trimmed = s.trim()
  return (trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 2
}

export function PropertyInformationPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  return (
    <ReportPage config={config} pageNumber={pageNumber} totalPages={totalPages} sectionTitle={t("reportContent.propertyTitle")}>
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">{t("reportContent.propertyTitle")}</h2>

      {data.buildings.length === 0 ? (
        <p className="text-sm text-[#999]">{t("reportContent.propertyNoData")}</p>
      ) : (
        data.buildings.map((b) => (
          <PageSection key={b.id} title={data.buildings.length > 1 ? b.name : t("reportContent.propertyBasicInfo")}>
            <InfoGrid
              rows={[
                { label: t("reportContent.fieldName"), value: val(b.name) },
                { label: t("reportContent.fieldAddress"), value: val(b.address) },
                { label: t("reportContent.fieldMunicipality"), value: val(b.municipality) },
                { label: t("reportContent.fieldBuildingType"), value: val(b.building_type) },
                { label: t("reportContent.fieldUsage"), value: val(b.usage_category) },
                { label: t("reportContent.fieldBuildYear"), value: val(b.construction_year) },
                {
                  label: t("reportContent.fieldArea"),
                  value: b.area_m2
                    ? `${b.area_m2.toLocaleString(config.language)} m²`
                    : "—",
                },
                {
                  label: t("reportContent.fieldCostPerM2"),
                  value: b.cost_per_m2
                    ? `${b.cost_per_m2.toLocaleString(config.language)} €/m²`
                    : "—",
                },
                { label: t("reportContent.fieldStatus"), value: translateStatus(b.status, t) },
              ].filter((r) => r.value !== "—")}
            />
            {b.notes && !isJsonString(b.notes) && (
              <div className="mt-4 rounded-lg bg-[#fafafa] p-4">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#aaa]">
                  {t("reportContent.additionalInfo")}
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
