import { PortfolioStats } from "@/components/demo/portfolio-stats"
import { PortfolioCharts } from "@/components/demo/portfolio-charts"
import { PropertyTable } from "@/components/demo/property-table"

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Portfolio-kojelauta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hyvinkaan kaupunki &mdash; 156 kiinteistoa
        </p>
      </div>

      <PortfolioStats />
      <PortfolioCharts />
      <PropertyTable />
    </div>
  )
}
