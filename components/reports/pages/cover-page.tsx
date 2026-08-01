import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage } from "./report-page"

interface CoverPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function CoverPage({ config, pageNumber, totalPages }: CoverPageProps) {
  const propertyNames = config.properties.map((p) => p.name).join(", ")
  const propertyAddresses = config.properties
    .map((p) => p.address)
    .filter(Boolean)
    .join(", ")

  return (
    <ReportPage config={config} pageNumber={pageNumber} totalPages={totalPages} hideHeader>
      {/* Top accent bar */}
      <div className="-mx-14 -mt-16 mb-16 h-2 bg-[#C8A84B]" />

      {/* FinnVesta wordmark */}
      <div className="mb-20 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#C8A84B]">
          <span className="text-xs font-bold text-white">FV</span>
        </div>
        <span className="text-sm font-semibold tracking-widest text-[#888] uppercase">
          FinnVesta
        </span>
      </div>

      {/* Report title */}
      <div className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#C8A84B]">
          Kiinteistöraportti
        </p>
        <h1 className="text-4xl font-bold leading-tight text-[#1a1a1a]">
          {config.title || propertyNames || "Raportti"}
        </h1>
        {propertyAddresses && (
          <p className="mt-3 text-base text-[#666]">{propertyAddresses}</p>
        )}
      </div>

      {/* Divider */}
      <div className="mb-10 h-px bg-[#e5e5e5]" />

      {/* Meta grid */}
      <dl className="mb-16 grid grid-cols-2 gap-8 sm:grid-cols-3">
        {[
          { label: "Päivämäärä", value: config.date },
          { label: "Kiinteistöjä", value: String(config.properties.length) },
          { label: "Kieli", value: config.language.toUpperCase() },
        ].map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[10px] font-medium uppercase tracking-widest text-[#aaa]">
              {label}
            </dt>
            <dd className="mt-1 text-base font-semibold text-[#1a1a1a]">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Property list (if multiple) */}
      {config.properties.length > 1 && (
        <div className="mb-16">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-[#aaa]">
            Kiinteistöt
          </p>
          <ul className="space-y-1.5">
            {config.properties.map((p) => (
              <li key={p.id} className="flex items-baseline gap-3 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 translate-y-px rounded-full bg-[#C8A84B]" />
                <span className="font-medium text-[#1a1a1a]">{p.name}</span>
                {p.address && (
                  <span className="text-[#999]">{p.address}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom footer */}
      <div className="mt-auto flex items-center justify-between border-t border-[#e5e5e5] pt-6">
        <span className="text-xs text-[#bbb]">Luotu FinnVesta-järjestelmällä</span>
        <span className="text-xs text-[#bbb]">{new Date().getFullYear()}</span>
      </div>
    </ReportPage>
  )
}
