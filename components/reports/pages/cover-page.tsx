import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage } from "./report-page"

export function CoverPage({ config, data, pageNumber, totalPages, t }: PageProps) {
  const building = data.buildings[0] ?? null
  const propertyNames = config.properties.map((p) => p.name).join(", ")
  const address =
    building?.address ??
    config.properties.map((p) => p.address).filter(Boolean).join(", ")

  return (
    <ReportPage config={config} pageNumber={pageNumber} totalPages={totalPages} hideHeader>
      <div className="-mx-14 -mt-16 mb-16 h-2 bg-[#1e6fbf]" />

      <div className="mb-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/finnvesta-login-logo.png" alt="FinnVesta" className="w-1/3 max-w-[220px] h-auto" />
      </div>

      <div className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#1e6fbf]">
          {t("reportContent.coverLabel")}
        </p>
        <h1 className="text-4xl font-bold leading-tight text-[#1a1a1a]">
          {config.title || propertyNames || t("reportContent.reportWord")}
        </h1>
        {address && <p className="mt-3 text-base text-[#666]">{address}</p>}
      </div>

      <div className="mb-10 h-px bg-[#e5e5e5]" />

      <dl className="mb-16 grid grid-cols-2 gap-8 sm:grid-cols-3">
        {[
          { label: t("reportContent.coverDate"), value: config.date },
          { label: t("reportContent.coverProperties"), value: String(config.properties.length) },
          ...(building?.construction_year
            ? [{ label: t("reportContent.coverBuildYear"), value: String(building.construction_year) }]
            : []),
          ...(building?.area_m2
            ? [{ label: t("reportContent.coverArea"), value: `${building.area_m2.toLocaleString("fi-FI")} m²` }]
            : []),
          { label: t("reportContent.coverLanguage"), value: config.language.toUpperCase() },
        ].map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[10px] font-medium uppercase tracking-widest text-[#aaa]">{label}</dt>
            <dd className="mt-1 text-base font-semibold text-[#1a1a1a]">{value}</dd>
          </div>
        ))}
      </dl>

      {config.properties.length > 1 && (
        <div className="mb-16">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-[#aaa]">{t("reportContent.coverPropertiesList")}</p>
          <ul className="space-y-1.5">
            {config.properties.map((p) => {
              const b = data.buildings.find((b) => b.id === p.id)
              return (
                <li key={p.id} className="flex items-baseline gap-3 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 translate-y-px rounded-full bg-[#1e6fbf]" />
                  <span className="font-medium text-[#1a1a1a]">{p.name}</span>
                  {p.address && <span className="text-[#999]">{p.address}</span>}
                  {b?.area_m2 && (
                    <span className="text-[#bbb]">{b.area_m2.toLocaleString("fi-FI")} m²</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-[#e5e5e5] pt-6">
        <span className="text-xs text-[#bbb]">{t("reportContent.coverGeneratedBy")}</span>
        <span className="text-xs text-[#bbb]">{new Date().getFullYear()}</span>
      </div>
    </ReportPage>
  )
}
