// Shared A4-like page wrapper used by every report page component.
// Renders a white "sheet" with generous margins, professional typography,
// and a subtle header band with the report title + page number.

import type { ReportConfig } from "@/lib/report-engine"

interface ReportPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
  children: React.ReactNode
  /** Optional: override the header title shown on this page. */
  sectionTitle?: string
  /** Hide the running header (used for the cover page). */
  hideHeader?: boolean
}

export function ReportPage({
  config,
  pageNumber,
  totalPages,
  children,
  sectionTitle,
  hideHeader = false,
}: ReportPageProps) {
  return (
    <article
      className="report-page mx-auto w-full max-w-[794px] bg-white text-[#1a1a1a] shadow-[0_2px_16px_rgba(0,0,0,0.10)]"
      style={{ minHeight: "1123px", fontFamily: "var(--font-report, Georgia, serif)" }}
    >
      {/* Running header */}
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-12 py-3">
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#888]">
            {config.title || "FinnVesta Report"}
          </span>
          <div className="flex items-center gap-4">
            {sectionTitle && (
              <span className="text-[10px] text-[#aaa]">{sectionTitle}</span>
            )}
            <span className="text-[10px] text-[#aaa]">
              {pageNumber} / {totalPages}
            </span>
          </div>
        </div>
      )}

      {/* Page body */}
      <div className={hideHeader ? "px-14 py-16" : "px-12 py-10"}>
        {children}
      </div>

      {/* Running footer */}
      {!hideHeader && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-[#f0f0f0] px-12 py-3">
          <span className="text-[9px] text-[#bbb]">
            {config.properties.map((p) => p.name).join(", ")}
          </span>
          <span className="text-[9px] text-[#bbb]">
            FinnVesta · {config.date}
          </span>
        </div>
      )}
    </article>
  )
}

// Reusable section heading inside a page.
export function PageSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <h2
        className="mb-4 border-b border-[#e5e5e5] pb-2 text-sm font-semibold uppercase tracking-widest text-[#555]"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

// Reusable two-column info grid (label / value).
export function InfoGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
      {rows.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-[#999]">{label}</dt>
          <dd className="mt-0.5 font-medium text-[#1a1a1a]">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Placeholder block used inside every non-implemented module page.
export function PlaceholderBlock({
  label,
  rows = 4,
}: {
  label?: string
  rows?: number
}) {
  return (
    <div className="space-y-2.5">
      {label && (
        <p className="text-xs text-[#bbb]">{label}</p>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-[#f0f0f0]"
          style={{ width: `${75 + Math.sin(i * 1.5) * 20}%` }}
        />
      ))}
    </div>
  )
}

// Placeholder table skeleton.
export function PlaceholderTable({
  cols = 4,
  rows = 5,
}: {
  cols?: number
  rows?: number
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#e5e5e5]">
      {/* Header */}
      <div
        className="grid gap-px bg-[#f7f7f7] px-4 py-2.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-2.5 w-3/4 rounded-full bg-[#ddd]" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-px border-t border-[#f0f0f0] px-4 py-2.5"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-2 rounded-full bg-[#f0f0f0]"
              style={{ width: c === 0 ? "85%" : "60%" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
