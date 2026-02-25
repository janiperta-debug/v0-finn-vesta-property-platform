"use client"

import {
  buildingTypeDistribution,
  ageDistribution,
  conditionDistribution,
  formatEur,
  getKlaColor,
  getKlaBgColor,
  portfolioSummary,
} from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const PIE_COLORS = ["hsl(180, 40%, 45%)", "hsl(215, 60%, 50%)", "hsl(350, 50%, 55%)"]

function CustomTooltipBar({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">
            {p.name.includes("Kla") ? `${p.value}%` : formatEur(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

const typeChartData = buildingTypeDistribution.map((item) => ({
  name: item.type,
  "Keskim. Kla": item.avgKla,
  Korjausvelka: item.korjausVelka / 1000,
}))

const ageChartData = ageDistribution.map((item) => ({
  name: item.range,
  "Keskim. Kla": item.avgKla,
  Korjausvelka: item.korjausVelka / 1000,
}))

export default function ComparisonPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Portfolio-vertailu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analysoi portfolion jakaumia rakennustyypin, iän ja kuntoluokan mukaan
        </p>
      </div>

      {/* Top-level stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kiinteistöjä</p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground">{portfolioSummary.totalProperties}</p>
          <p className="mt-1 text-xs text-muted-foreground">{portfolioSummary.totalSquareMeters.toLocaleString("fi-FI")} m&sup2; yhteensä</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Keskimääräinen Kla</p>
          <p className={`mt-2 font-heading text-3xl font-bold ${getKlaColor(portfolioSummary.averageKuntoluokka)}`}>
            {portfolioSummary.averageKuntoluokka}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Koko portfolio</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Korjausvelka yhteensä</p>
          <p className="mt-2 font-heading text-3xl font-bold text-amber-400">{formatEur(portfolioSummary.totalKorjausVelka)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatEur(portfolioSummary.totalKorjausVelka / portfolioSummary.totalProperties)} / kiinteistö</p>
        </div>
      </div>

      {/* Condition distribution pie chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Kuntojakauma</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {conditionDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  iconType="circle"
                  iconSize={8}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg">
                        <p className="text-xs font-semibold text-foreground">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.value} kiinteistöä</p>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Korjausvelka breakdown */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Korjausvelan erittely</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kunnossapitotarve</span>
                <span className="font-heading font-semibold text-foreground">{formatEur(portfolioSummary.kunnossapitoTarve)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(portfolioSummary.kunnossapitoTarve / portfolioSummary.totalKorjausVelka) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Peruskorjaustarve</span>
                <span className="font-heading font-semibold text-foreground">{formatEur(portfolioSummary.peruskorjausTarve)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(portfolioSummary.peruskorjausTarve / portfolioSummary.totalKorjausVelka) * 100}%`,
                    backgroundColor: "hsl(215, 60%, 50%)",
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Perusparannustarve</span>
                <span className="font-heading font-semibold text-foreground">{formatEur(portfolioSummary.perusparannusTarve)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(portfolioSummary.perusparannusTarve / portfolioSummary.totalKorjausVelka) * 100}%`,
                    backgroundColor: "hsl(180, 40%, 45%)",
                  }}
                />
              </div>
            </div>
            <div className="border-t border-border/50 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">Korjausvelka yhteensä</span>
                <span className="font-heading text-lg font-bold text-amber-400">{formatEur(portfolioSummary.totalKorjausVelka)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Building type comparison */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Vertailu rakennustyypeittäin</h3>
        <div className="space-y-3">
          <div className="hidden items-center gap-4 border-b border-border/50 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground md:flex">
            <div className="w-28">Tyyppi</div>
            <div className="w-16 text-center">Kpl</div>
            <div className="w-20 text-center">Keskim. Kla</div>
            <div className="flex-1">Kunto</div>
            <div className="w-28 text-right">Korjausvelka</div>
          </div>
          {buildingTypeDistribution.map((item) => (
            <div
              key={item.type}
              className="flex flex-col gap-2 rounded-lg border border-border/30 bg-secondary/20 p-3 md:flex-row md:items-center md:gap-4 md:border-0 md:bg-transparent md:p-0"
            >
              <div className="w-28 text-sm font-medium text-foreground">{item.type}</div>
              <div className="w-16 text-center text-sm text-muted-foreground">{item.count}</div>
              <div className="w-20 text-center">
                <Badge className={`border-0 font-mono text-[10px] ${getKlaBgColor(item.avgKla)}`}>
                  {item.avgKla}%
                </Badge>
              </div>
              <div className="flex-1">
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${item.avgKla >= 75 ? "bg-emerald-400" : item.avgKla >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${item.avgKla}%` }}
                  />
                </div>
              </div>
              <div className="w-28 text-right text-sm font-medium text-amber-400">{formatEur(item.korjausVelka)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Age distribution */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Vertailu ikäryhmittäin</h3>
        <div className="space-y-3">
          <div className="hidden items-center gap-4 border-b border-border/50 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground md:flex">
            <div className="w-28">Ikäryhmä</div>
            <div className="w-16 text-center">Kpl</div>
            <div className="w-20 text-center">Keskim. Kla</div>
            <div className="flex-1">Kunto</div>
            <div className="w-28 text-right">Korjausvelka</div>
          </div>
          {ageDistribution.map((item) => (
            <div
              key={item.range}
              className="flex flex-col gap-2 rounded-lg border border-border/30 bg-secondary/20 p-3 md:flex-row md:items-center md:gap-4 md:border-0 md:bg-transparent md:p-0"
            >
              <div className="w-28 font-mono text-sm font-medium text-foreground">{item.range}</div>
              <div className="w-16 text-center text-sm text-muted-foreground">{item.count}</div>
              <div className="w-20 text-center">
                <Badge className={`border-0 font-mono text-[10px] ${getKlaBgColor(item.avgKla)}`}>
                  {item.avgKla}%
                </Badge>
              </div>
              <div className="flex-1">
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${item.avgKla >= 75 ? "bg-emerald-400" : item.avgKla >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${item.avgKla}%` }}
                  />
                </div>
              </div>
              <div className="w-28 text-right text-sm font-medium text-amber-400">{formatEur(item.korjausVelka)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Age distribution bar chart */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-6 font-heading text-base font-semibold text-foreground">Korjausvelka ikäryhmittäin (k&euro;)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageChartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 16%)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(215, 25%, 16%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(215, 25%, 16%)" }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltipBar />} cursor={{ fill: "hsl(215, 25%, 16%, 0.5)" }} />
              <Bar dataKey="Korjausvelka" fill="hsl(40, 60%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
