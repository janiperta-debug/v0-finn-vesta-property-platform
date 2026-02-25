import { Building2, Ruler, Euro, TrendingDown } from "lucide-react"
import { portfolioSummary, formatEur } from "@/lib/mock-data"

const stats = [
  {
    label: "Kiinteistoja",
    value: portfolioSummary.totalProperties.toString(),
    icon: Building2,
    sub: `${(portfolioSummary.totalSquareMeters / 1000).toFixed(0)} k m\u00B2`,
  },
  {
    label: "Jalleenhankinta-arvo",
    value: formatEur(portfolioSummary.totalJalleenhankintaArvo),
    icon: Euro,
    sub: `Tekninen arvo: ${formatEur(portfolioSummary.totalTekninenArvo)}`,
  },
  {
    label: "Keskimaarainen Kuntoluokka",
    value: `${portfolioSummary.averageKuntoluokka}%`,
    icon: Ruler,
    sub: "Koko portfolion keskiarvo",
    warn: portfolioSummary.averageKuntoluokka < 65,
  },
  {
    label: "Korjausvelka yhteensa",
    value: formatEur(portfolioSummary.totalKorjausVelka),
    icon: TrendingDown,
    sub: `${(portfolioSummary.totalKorjausVelka / portfolioSummary.totalSquareMeters).toFixed(0)} \u20AC/m\u00B2`,
    warn: true,
  },
]

export function PortfolioStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</span>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className={`font-heading text-2xl font-bold ${stat.warn ? "text-amber-400" : "text-foreground"}`}>
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
        </div>
      ))}
    </div>
  )
}
