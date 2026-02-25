"use client"

import { ptsTimeline, investmentProjects, properties, formatEur } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const chartData = ptsTimeline.map((item) => ({
  year: item.year.toString(),
  Kunnossapito: item.kunnossapito / 1000,
  Peruskorjaus: item.peruskorjaus / 1000,
  Perusparannus: item.perusparannus / 1000,
}))

const totalInvestment = ptsTimeline.reduce((sum, item) => sum + item.total, 0)
const avgYearly = totalInvestment / ptsTimeline.length
const peakYear = ptsTimeline.reduce((max, item) => (item.total > max.total ? item : max), ptsTimeline[0])

function getPriorityColor(priority: string) {
  switch (priority) {
    case "kriittinen":
      return "bg-red-400/15 text-red-400"
    case "tärkeä":
      return "bg-amber-400/15 text-amber-400"
    default:
      return "bg-sky-400/15 text-sky-400"
  }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null
  const total = payload.reduce((sum, p) => sum + p.value, 0)
  return (
    <div className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value.toFixed(0)} k&euro;</span>
        </div>
      ))}
      <div className="mt-1 border-t border-border/50 pt-1 text-xs font-semibold text-foreground">
        Yhteensä: {total.toFixed(0)} k&euro;
      </div>
    </div>
  )
}

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Investointiaikajana (PTS 2026-2040)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          15-vuotinen pitkän tähtäimen suunnitelma koko portfoliolle
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kokonaisinvestointi</p>
          <p className="mt-2 font-heading text-2xl font-bold text-foreground">{formatEur(totalInvestment)}</p>
          <p className="mt-1 text-xs text-muted-foreground">15 vuoden aikana</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Keskimääräinen / vuosi</p>
          <p className="mt-2 font-heading text-2xl font-bold text-primary">{formatEur(avgYearly)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Vuosibudjetti</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Huippuvuosi</p>
          <p className="mt-2 font-heading text-2xl font-bold text-amber-400">{peakYear.year}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatEur(peakYear.total)}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Aktiivisia projekteja</p>
          <p className="mt-2 font-heading text-2xl font-bold text-foreground">{investmentProjects.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Suunniteltuja hankkeita</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-6 font-heading text-base font-semibold text-foreground">Investoinnit vuosittain (k&euro;)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 16%)" />
              <XAxis
                dataKey="year"
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(215, 25%, 16%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(215, 25%, 16%)" }}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(215, 25%, 16%, 0.5)" }} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "hsl(215, 15%, 55%)" }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="Kunnossapito" stackId="a" fill="hsl(40, 60%, 55%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Peruskorjaus" stackId="a" fill="hsl(215, 60%, 50%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Perusparannus" stackId="a" fill="hsl(180, 40%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project list */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Suunnitellut hankkeet</h3>
        <div className="space-y-3">
          <div className="hidden items-center gap-4 border-b border-border/50 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground md:flex">
            <div className="w-40">Hanke</div>
            <div className="w-32">Kiinteistö</div>
            <div className="w-24">Kategoria</div>
            <div className="w-20 text-center">Vuosi</div>
            <div className="w-16 text-center">Kesto</div>
            <div className="w-24 text-right">Investointi</div>
            <div className="w-20 text-center">Prioriteetti</div>
          </div>
          {investmentProjects.map((project) => {
            const prop = properties.find((p) => p.id === project.propertyId)
            return (
              <div
                key={project.id}
                className="flex flex-col gap-2 rounded-lg border border-border/30 bg-secondary/30 p-3 md:flex-row md:items-center md:gap-4 md:border-0 md:bg-transparent md:p-0"
              >
                <div className="w-40 text-sm font-medium text-foreground">{project.title}</div>
                <div className="w-32 text-sm text-muted-foreground">{prop?.name || "–"}</div>
                <div className="w-24">
                  <Badge variant="secondary" className="border-0 text-[10px]">
                    {project.category}
                  </Badge>
                </div>
                <div className="w-20 text-center text-sm text-foreground">{project.aloitusVuosi}</div>
                <div className="w-16 text-center text-sm text-muted-foreground">{project.kestoVuotta} v</div>
                <div className="w-24 text-right font-heading text-sm font-semibold text-foreground">
                  {formatEur(project.investointiEur)}
                </div>
                <div className="w-20 text-center">
                  <Badge className={`border-0 text-[10px] ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <span className="text-sm text-muted-foreground">
            {investmentProjects.length} hanketta yhteensä
          </span>
          <span className="font-heading text-sm font-bold text-primary">
            {formatEur(investmentProjects.reduce((sum, p) => sum + p.investointiEur, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
