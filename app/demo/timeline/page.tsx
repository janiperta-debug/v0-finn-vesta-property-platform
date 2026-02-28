"use client"

import Link from "next/link"
import { ptsTimeline, investmentProjects, properties, formatEur } from "@/lib/mock-data"
import { categories, samplePropertyKuntoarvio } from "@/lib/kuntoarvio-data"
import type { ConditionScore } from "@/lib/kuntoarvio-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
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

// Mock PTS items derived from kuntoarvio evaluations
type PTSItem = {
  id: string
  categoryId: string
  subItemId?: string
  description: string
  urgency: "immediate" | "short" | "medium" | "long"
  estimatedCost: number
  currentCondition: ConditionScore
}

// Generate PTS items from sample evaluations
const MOCK_PTS_ITEMS: PTSItem[] = [
  {
    id: "pts-1",
    categoryId: "ikkunat",
    subItemId: "ikkunat-puitteet",
    description: "Ikkunoiden uusiminen - puuosat lahonneet",
    urgency: "short",
    estimatedCost: 85000,
    currentCondition: 2,
  },
  {
    id: "pts-2",
    categoryId: "julkisivut",
    subItemId: "julkisivut-saumaukset",
    description: "Elementtisaumausten uusiminen",
    urgency: "short",
    estimatedCost: 28000,
    currentCondition: 2,
  },
  {
    id: "pts-3",
    categoryId: "lvi-vesi",
    subItemId: "lvi-vesi-viemari",
    description: "Viemäriputkiston sukitus/uusiminen",
    urgency: "immediate",
    estimatedCost: 120000,
    currentCondition: 2,
  },
  {
    id: "pts-4",
    categoryId: "julkisivut",
    subItemId: "julkisivut-rappaus",
    description: "Paikkarappaus ja maalaus",
    urgency: "medium",
    estimatedCost: 45000,
    currentCondition: 3,
  },
  {
    id: "pts-5",
    categoryId: "vesikate",
    subItemId: "vesikate-kate",
    description: "Vesikaton uusiminen",
    urgency: "medium",
    estimatedCost: 65000,
    currentCondition: 3,
  },
  {
    id: "pts-6",
    categoryId: "perustukset",
    subItemId: "perustukset-salaojat",
    description: "Salaojien huuhtelu ja tarkistus",
    urgency: "medium",
    estimatedCost: 3500,
    currentCondition: 3,
  },
  {
    id: "pts-7",
    categoryId: "lvi-lammitys",
    subItemId: "lvi-lammitys-putkistot",
    description: "Lämmitysputkiston huolto",
    urgency: "long",
    estimatedCost: 15000,
    currentCondition: 3,
  },
  {
    id: "pts-8",
    categoryId: "piha",
    subItemId: "piha-asfaltti",
    description: "Pihan asfaltoinnin uusiminen",
    urgency: "long",
    estimatedCost: 25000,
    currentCondition: 4,
  },
]

// Group PTS items by urgency
function groupByUrgency(items: PTSItem[]) {
  return {
    immediate: items.filter(i => i.urgency === "immediate"),
    short: items.filter(i => i.urgency === "short"),
    medium: items.filter(i => i.urgency === "medium"),
    long: items.filter(i => i.urgency === "long"),
  }
}

const urgencyLabels: Record<string, { label: string; color: string; years: string }> = {
  immediate: { label: "Välitön", color: "text-red-500", years: "0-1v" },
  short: { label: "Lyhyt aikaväli", color: "text-amber-500", years: "1-3v" },
  medium: { label: "Keskipitkä", color: "text-yellow-500", years: "3-5v" },
  long: { label: "Pitkä aikaväli", color: "text-blue-500", years: "5-10v" },
}

export default function TimelinePage() {
  const ptsGrouped = groupByUrgency(MOCK_PTS_ITEMS)
  const immediateCount = ptsGrouped.immediate.length
  const shortTermCount = ptsGrouped.short.length
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Investointiaikajana (PTS 2026-2040)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          15-vuotinen pitkän tähtäimen suunnitelma koko portfoliolle
        </p>
      </div>

      {/* Kuntoarvio-based PTS Alert */}
      {immediateCount > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Välittömiä korjaustarpeita kuntoarviosta</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {immediateCount} kohdetta vaatii välitöntä huomiota. Yhteensä {shortTermCount + immediateCount} kohdetta lähivuosina.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ptsGrouped.immediate.slice(0, 3).map(item => {
                    const category = categories.find(c => c.id === item.categoryId)
                    return (
                      <Badge key={item.id} variant="outline" className="border-red-500/30 text-red-500">
                        {category?.name || item.categoryId}
                      </Badge>
                    )
                  })}
                  {ptsGrouped.immediate.length > 3 && (
                    <Badge variant="outline">+{ptsGrouped.immediate.length - 3} muuta</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/demo/property/1/arviointi">
                  Tarkastele
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Kuntoarvio-based PTS Items */}
      <Card>
        <CardHeader>
          <CardTitle>Kuntoarviosta johdettu PTS</CardTitle>
          <CardDescription>
            Automaattisesti luotu investointisuunnitelma kuntoarvioiden perusteella
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="immediate" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="immediate" className="gap-2">
                Välitön
                {ptsGrouped.immediate.length > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                    {ptsGrouped.immediate.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="short" className="gap-2">
                1-3v
                {ptsGrouped.short.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {ptsGrouped.short.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="medium">3-5v</TabsTrigger>
              <TabsTrigger value="long">5-10v</TabsTrigger>
            </TabsList>
            
            {Object.entries(ptsGrouped).map(([urgency, items]) => (
              <TabsContent key={urgency} value={urgency} className="space-y-3">
                {items.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Ei korjaustarpeita tässä aikaikkunassa
                  </div>
                ) : (
                  items.map(item => {
                    const category = categories.find(c => c.id === item.categoryId)
                    return (
                      <div 
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg border bg-card p-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{item.description}</p>
                            <ConditionBadge score={item.currentCondition} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {category?.name || item.categoryId}
                            {item.subItemId && ` - ${item.subItemId}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatEur(item.estimatedCost)}</p>
                          <p className="text-xs text-muted-foreground">
                            {urgencyLabels[item.urgency]?.years}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                
                {items.length > 0 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm text-muted-foreground">
                      {items.length} kohdetta
                    </span>
                    <span className="font-semibold">
                      {formatEur(items.reduce((sum, i) => sum + i.estimatedCost, 0))}
                    </span>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

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
