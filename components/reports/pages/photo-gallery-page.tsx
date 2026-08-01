import type { PageProps } from "@/components/reports/report-engine"
import { ReportPage, PageSection } from "./report-page"

export function PhotoGalleryPage({ config, data, pageNumber, totalPages }: PageProps) {
  // Collect photo URLs from sub-item evaluations.
  const photos = data.subItemEvaluations
    .flatMap((s) => s.photo_urls ?? [])
    .slice(0, 24)

  if (photos.length === 0) {
    return (
      <ReportPage
        config={config}
        pageNumber={pageNumber}
        totalPages={totalPages}
        sectionTitle="Valokuvat"
      >
        <h2 className="mb-6 text-xl font-bold text-[#1a1a1a]">Valokuvat</h2>
        <p className="text-sm text-[#999]">Tarkastuskuvia ei saatavilla.</p>
      </ReportPage>
    )
  }

  return (
    <ReportPage
      config={config}
      pageNumber={pageNumber}
      totalPages={totalPages}
      sectionTitle="Valokuvat"
    >
      <h2 className="mb-8 text-xl font-bold text-[#1a1a1a]">Valokuvat</h2>
      <PageSection title={`${photos.length} kuvaa`}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((url, i) => (
            <figure
              key={i}
              className="overflow-hidden rounded-lg border border-[#e5e5e5]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Tarkastuskuva ${i + 1}`}
                className="aspect-square w-full object-cover"
                crossOrigin="anonymous"
              />
            </figure>
          ))}
        </div>
      </PageSection>
    </ReportPage>
  )
}
