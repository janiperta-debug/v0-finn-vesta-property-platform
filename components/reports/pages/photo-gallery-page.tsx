import type { ReportConfig } from "@/lib/report-engine"
import { ReportPage, PageSection } from "./report-page"

interface PhotoGalleryPageProps {
  config: ReportConfig
  pageNumber: number
  totalPages: number
}

export function PhotoGalleryPage({ config, pageNumber, totalPages }: PhotoGalleryPageProps) {
  // 12 placeholder photo slots per gallery page.
  const slots = Array.from({ length: 12 })

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Valokuvagalleria"
    >
      <h1 className="mb-8 text-2xl font-bold text-[#1a1a1a]">Valokuvagalleria</h1>

      <PageSection title="Kuntotarkastuskuvat">
        <div className="grid grid-cols-3 gap-3">
          {slots.map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f7f7f7]"
              style={{ aspectRatio: "4/3" }}
            >
              {/* Photo placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <div className="h-6 w-6 rounded-full border-2 border-[#ddd]" />
                <div className="h-1.5 w-12 rounded-full bg-[#e5e5e5]" />
              </div>
              {/* Caption area */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#f0f0f0] px-2 py-1">
                <div className="h-1.5 w-20 rounded-full bg-[#ddd]" />
              </div>
            </div>
          ))}
        </div>
      </PageSection>
    </ReportPage>
  )
}
