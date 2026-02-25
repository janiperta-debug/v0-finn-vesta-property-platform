"use client"

import { use } from "react"
import {
  properties,
  componentAssessments,
  defaultComponents,
  formatEur,
  formatEurPerM2,
  type ComponentCondition,
} from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function getScoreColor(score: number): string {
  if (score >= 4) return "text-emerald-400"
  if (score >= 3) return "text-amber-400"
  return "text-red-400"
}

function getScoreBarColor(score: number): string {
  if (score >= 4) return "bg-emerald-400"
  if (score >= 3) return "bg-amber-400"
  return "bg-red-400"
}

function getScoreLabel(score: number): string {
  if (score >= 4.5) return "Erinomainen"
  if (score >= 3.5) return "Hyvä"
  if (score >= 2.5) return "Tyydyttävä"
  if (score >= 1.5) return "Välttävä"
  return "Heikko"
}

function ComponentCard({ component }: { component: ComponentCondition }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/20">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-heading text-sm font-semibold text-foreground">{component.nameFi}</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs border-border bg-card text-foreground">
              <p className="text-xs">{component.notes}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-3 flex items-end gap-2">
        <span className={`font-heading text-3xl font-bold ${getScoreColor(component.score)}`}>
          {component.score.toFixed(1)}
        </span>
        <span className="mb-1 text-xs text-muted-foreground">/ 5.0</span>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${getScoreBarColor(component.score)}`}
          style={{ width: `${(component.score / 5) * 100}%` }}
        />
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Arvio</span>
          <Badge variant="secondary" className="border-0 px-1.5 py-0 text-[10px]">
            {getScoreLabel(component.score)}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Käyttöikää jäljellä</span>
          <span className="text-foreground">{component.estimatedLifespan} v</span>
        </div>
        {component.replacementCost > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Uusimiskustannus</span>
              <span className="text-foreground">{formatEur(component.replacementCost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Per m&sup2;</span>
              <span className="font-mono text-foreground">{formatEurPerM2(component.replacementCostPerM2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ComponentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const property = properties.find((p) => p.id === id) || properties[0]
  const components = componentAssessments[property.id] || defaultComponents

  const avgScore = components.reduce((sum, c) => sum + c.score, 0) / components.length
  const totalRepairCost = components.reduce((sum, c) => sum + c.replacementCost, 0)

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
        <h1 className="font-heading text-2xl font-bold text-foreground">Komponenttiarviointi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          9 standardia rakennusosaa &mdash; {property.name}
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Keskimääräinen arvosana</p>
          <p className={`mt-2 font-heading text-3xl font-bold ${getScoreColor(avgScore)}`}>
            {avgScore.toFixed(1)} / 5.0
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Korjauskustannukset yht.</p>
          <p className="mt-2 font-heading text-3xl font-bold text-amber-400">{formatEur(totalRepairCost)}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Komponentteja arvioitu</p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground">{components.length}</p>
        </div>
      </div>

      {/* Component grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {components.map((component) => (
          <ComponentCard key={component.nameFi} component={component} />
        ))}
      </div>
    </div>
  )
}
