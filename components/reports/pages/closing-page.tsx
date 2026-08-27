import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"
import { derivePlanItems, overallCondition, repairItems } from "@/lib/building-plan"

export function ClosingPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const building = data.buildings[0] ?? null
  const planItems = building ? derivePlanItems(building, data.categoryEvaluations, t) : []
  const condition = overallCondition(planItems)
  const repairs = repairItems(planItems)

  // Report metadata
  const meta = [
    { label: t("reportContent.closingMetaCreated"), value: new Date().toLocaleDateString(config.language) },
    { label: t("reportContent.closingMetaCreatedBy"), value: t("reportContent.closingMetaCreatedByValue") },
    { label: t("reportContent.closingMetaVersion"), value: "1.0" },
    {
      label: t("reportContent.closingMetaPropertyId"),
      value:
        config.properties.length === 1
          ? String(config.properties[0].id)
          : `${config.properties.length} ${t("reportContent.closingPropertiesCountSuffix")}`,
    },
    { label: t("reportContent.closingMetaReportId"), value: "—" },
  ]

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle={t("reportContent.closingSectionTitle")}
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">{t("reportContent.closingHeading")}</h2>

      {/* Key findings */}
      {(condition > 0 || repairs.length > 0) && (
        <PageSection title={t("reportContent.closingKeyFindings")}>
          <div className="grid grid-cols-2 gap-4">
            {condition > 0 && (
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#aaa]">{t("reportContent.execOverallCondition")}</p>
                <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">
                  {condition.toFixed(1)} <span className="text-sm font-normal text-[#aaa]">/ 5</span>
                </p>
              </div>
            )}
            {repairs.length > 0 && (
              <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#aaa]">{t("reportContent.execNeedsAttention")}</p>
                <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">{repairs.length}</p>
              </div>
            )}
          </div>
        </PageSection>
      )}

      <PageSection title={t("reportContent.closingDisclaimer")}>
        <p className="text-[11px] leading-relaxed text-[#aaa]">
          {t("reportContent.closingDisclaimerText")}
        </p>
      </PageSection>

      {/* Report metadata */}
      <PageSection title={t("reportContent.closingReportInfo")}>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
          {meta.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-[10px] uppercase tracking-wider text-[#aaa]">{label}</dt>
              <dd className="font-medium text-[#555]">{value}</dd>
            </div>
          ))}
        </dl>
      </PageSection>

      {/* Bottom bar */}
      <div className="mt-12 border-t-2 border-[#1e6fbf] pt-6">
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/finnvesta-login-logo.png" alt="FinnVesta" className="h-6 w-auto" />
          <span className="text-xs text-[#bbb]">{t("reportContent.closingReportCreatedPrefix")} {config.date}</span>
        </div>
      </div>
    </ReportPage>
  )
}
