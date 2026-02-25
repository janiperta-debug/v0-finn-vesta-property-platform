"use client"

import { use, useState } from "react"
import {
  properties,
  componentAssessments,
  defaultComponents,
  formatEur,
  formatEurPerM2,
  getKlaColor,
  getKlaBgColor,
} from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Target, TrendingUp, ArrowRight } from "lucide-react"

interface Scenario {
  label: string
  targetKla: number
  description: string
  color: string
  bgColor: string
}

const scenarios: Scenario[] = [
  {
    label: "Kunnossapito",
    targetKla: 75,
    description: "Nostaa kuntoluokan tyydyttävälle tasolle. Perushuolto ja kunnossapitotoimet.",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10 border-amber-400/30",
  },
  {
    label: "Peruskorjaus",
    targetKla: 90,
    description: "Nostaa kuntoluokan hyvälle tasolle. Laajempi peruskorjaus komponenteittain.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10 border-emerald-400/30",
  },
  {
    label: "Perusparannus",
    targetKla: 120,
    description: "Nostaa rakennuksen uutta vastaavaan kuntoon. Täysimittainen perusparannus.",
    color: "text-sky-400",
    bgColor: "bg-sky-400/10 border-sky-400/30",
  },
]

function calculateInvestment(currentKla: number, targetKla: number, jalleenhankintaArvo: number, squareMeters: number) {
  if (currentKla >= targetKla) return { total: 0, perM2: 0 }
  const gap = (targetKla - currentKla) / 100
  const total = Math.round(jalleenhankintaArvo * gap * 0.65)
  const perM2 = Math.round(total / squareMeters)
  return { total, perM2 }
}

export default function TargetPlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const property = properties.find((p) => p.id === id) || properties[0]
  const components = componentAssessments[property.id] || defaultComponents
  const [selectedScenario, setSelectedScenario] = useState<number>(0)

  const currentScenario = scenarios[selectedScenario]
  const investment = calculateInvestment(
    property.kuntoluokka,
    currentScenario.targetKla,
    property.jalleenhankintaArvo,
    property.squareMeters
  )

  // Calculate per-component breakdown
  const componentBreakdown = components.map((c) => {
    const currentPercent = (c.score / 5) * 100
    const targetPercent = currentScenario.targetKla
    if (currentPercent >= targetPercent) return { ...c, investmentNeeded: 0 }
    const gap = (targetPercent - currentPercent) / 100
    return { ...c, investmentNeeded: Math.round(c.replacementCost * gap * 1.2) }
  })

  const totalComponentInvestment = componentBreakdown.reduce((sum, c) => sum + c.investmentNeeded, 0)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/demo/property/${property.id}`}
          className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {property.name}
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">Tavoitesuunnittelu</h1>
          <Badge variant="secondary" className={`${getKlaBgColor(property.kuntoluokka)} border-0 font-mono`}>
            Nykyinen Kla {property.kuntoluokka}%
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Vertaile eri tavoitetasoja ja niiden investointitarpeita &mdash; {property.name}
        </p>
      </div>

      {/* Scenario selector */}
      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map((scenario, index) => {
          const inv = calculateInvestment(
            property.kuntoluokka,
            scenario.targetKla,
            property.jalleenhankintaArvo,
            property.squareMeters
          )
          const isSelected = selectedScenario === index

          return (
            <button
              key={scenario.label}
              type="button"
              onClick={() => setSelectedScenario(index)}
              className={`rounded-xl border p-5 text-left transition-all ${
                isSelected
                  ? `${scenario.bgColor} ring-1 ring-current`
                  : "border-border/50 bg-card hover:border-primary/20"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{scenario.label}</p>
                <Target className={`h-4 w-4 ${isSelected ? scenario.color : "text-muted-foreground"}`} />
              </div>
              <p className={`font-heading text-3xl font-bold ${scenario.color}`}>{scenario.targetKla}%</p>
              <p className="mt-2 text-xs text-muted-foreground">{scenario.description}</p>
              <div className="mt-4 border-t border-border/50 pt-3">
                <p className="text-xs text-muted-foreground">Investointitarve</p>
                <p className={`font-heading text-lg font-bold ${scenario.color}`}>{formatEur(inv.total)}</p>
                <p className="text-xs text-muted-foreground">{formatEurPerM2(inv.perM2)}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected scenario details */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-foreground">
            Skenaario: {currentScenario.label} ({currentScenario.targetKla}% Kla)
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={getKlaColor(property.kuntoluokka)}>{property.kuntoluokka}%</span>
            <ArrowRight className="h-4 w-4" />
            <span className={currentScenario.color}>{currentScenario.targetKla}%</span>
          </div>
        </div>

        {/* Progress visualization */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Nykyinen kunto</span>
                <span>Tavoite</span>
              </div>
              <div className="relative h-4 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    property.kuntoluokka >= 75 ? "bg-emerald-400" : property.kuntoluokka >= 60 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${Math.min(property.kuntoluokka, 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full opacity-30"
                  style={{
                    width: `${Math.min(currentScenario.targetKla, 100)}%`,
                    background: currentScenario.targetKla >= 90 ? "rgb(56, 189, 248)" : currentScenario.targetKla >= 75 ? "rgb(52, 211, 153)" : "rgb(251, 191, 36)",
                  }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className={getKlaColor(property.kuntoluokka)}>{property.kuntoluokka}%</span>
                <span className={currentScenario.color}>{currentScenario.targetKla}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Kokonaisinvestointi</p>
            <p className={`font-heading text-lg font-bold ${currentScenario.color}`}>{formatEur(investment.total)}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Per m&sup2;</p>
            <p className="font-heading text-lg font-bold text-foreground">{formatEurPerM2(investment.perM2)}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Kuntoluokan nosto</p>
            <p className="font-heading text-lg font-bold text-foreground">
              +{currentScenario.targetKla - property.kuntoluokka}%
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">Arvioitu kesto</p>
            <p className="font-heading text-lg font-bold text-foreground">
              {currentScenario.targetKla >= 100 ? "4-6 v" : currentScenario.targetKla >= 80 ? "2-4 v" : "1-2 v"}
            </p>
          </div>
        </div>
      </div>

      {/* Component-level breakdown */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Komponenttikohtainen erittely</h3>
        <div className="space-y-3">
          {componentBreakdown.map((c) => {
            const currentPercent = (c.score / 5) * 100
            return (
              <div key={c.nameFi} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-sm text-foreground">{c.nameFi}</div>
                <div className="flex-1">
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${
                        currentPercent >= 75 ? "bg-emerald-400" : currentPercent >= 50 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${currentPercent}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                  {c.score.toFixed(1)}/5.0
                </div>
                <div className="w-24 shrink-0 text-right text-sm font-medium">
                  {c.investmentNeeded > 0 ? (
                    <span className="text-amber-400">{formatEur(c.investmentNeeded)}</span>
                  ) : (
                    <span className="text-emerald-400">OK</span>
                  )}
                </div>
              </div>
            )
          })}
          <div className="flex items-center gap-4 border-t border-border/50 pt-3">
            <div className="w-32 shrink-0 text-sm font-semibold text-foreground">Yhteensä</div>
            <div className="flex-1" />
            <div className="w-16 shrink-0" />
            <div className="w-24 shrink-0 text-right">
              <span className={`font-heading text-sm font-bold ${currentScenario.color}`}>
                {formatEur(totalComponentInvestment)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">Haluatko tarkemman analyysin?</p>
          <p className="mt-1 text-xs text-muted-foreground">Ota yhteyttä niin teemme yksityiskohtaisen investointisuunnitelman.</p>
        </div>
        <Link href="/#contact">
          <Button size="sm" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Ota yhteyttä
          </Button>
        </Link>
      </div>
    </div>
  )
}
