"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ConditionBadge } from "./condition-badge"
import type { Apartment, ApartmentEvaluation, BuildingApartmentSummary } from "@/lib/kuntoarvio-types"
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Calendar, 
  Ruler, 
  Home,
  ChevronRight,
  Wrench,
} from "lucide-react"
import { formatEur } from "@/lib/mock-data"

interface ApartmentSummaryCardsProps {
  summary: BuildingApartmentSummary
}

export function ApartmentSummaryCards({ summary }: ApartmentSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Home className="h-3.5 w-3.5" />
          Huoneistot
        </div>
        <p className="font-heading text-2xl font-bold text-foreground">{summary.totalUnits}</p>
        <p className="mt-1 text-xs text-muted-foreground">huoneistoa yhteensä</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Vuokrausaste
        </div>
        <p className="font-heading text-2xl font-bold text-foreground">
          {Math.round((summary.occupiedUnits / summary.totalUnits) * 100)}%
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{summary.occupiedUnits}/{summary.totalUnits} vuokrattu</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          Keskikunto
        </div>
        <p className={`font-heading text-2xl font-bold ${
          summary.avgCondition >= 4 ? 'text-emerald-400' : 
          summary.avgCondition >= 3 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {summary.avgCondition.toFixed(1)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">asteikolla 1-5</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          Huomioitavat
        </div>
        <p className={`font-heading text-2xl font-bold ${summary.needsAttention > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {summary.needsAttention}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">huoneistoa vaatii toimenpiteitä</p>
      </div>
    </div>
  )
}

interface ApartmentGridProps {
  apartments: Apartment[]
  evaluations?: ApartmentEvaluation[]
  onSelect?: (apartment: Apartment) => void
}

export function ApartmentGrid({ apartments, evaluations = [], onSelect }: ApartmentGridProps) {
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)
  
  // Group by floor
  const floors = [...new Set(apartments.map(a => a.floor))].sort((a, b) => b - a)
  
  const getEvaluation = (aptId: string) => evaluations.find(e => e.apartmentId === aptId)
  
  return (
    <div className="space-y-6">
      {floors.map(floor => (
        <div key={floor} className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {floor}. kerros
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {apartments
              .filter(a => a.floor === floor)
              .sort((a, b) => a.number.localeCompare(b.number))
              .map(apartment => {
                const evaluation = getEvaluation(apartment.id)
                return (
                  <Dialog key={apartment.id}>
                    <DialogTrigger asChild>
                      <button 
                        className={`w-full text-left rounded-xl border p-4 transition-colors hover:bg-muted/50 ${
                          apartment.overallCondition <= 2 
                            ? 'border-red-500/30 bg-red-500/5' 
                            : 'border-border/50 bg-card'
                        }`}
                        onClick={() => setSelectedApartment(apartment)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{apartment.number}</p>
                            <p className="text-xs text-muted-foreground">{apartment.rooms} &bull; {apartment.squareMeters} m²</p>
                          </div>
                          <ConditionBadge score={apartment.overallCondition} size="sm" />
                        </div>
                        
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          {apartment.tenant ? (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Vuokrattu
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Home className="h-3 w-3" />
                              Vapaa
                            </span>
                          )}
                          {apartment.notes && (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Wrench className="h-3 w-3" />
                              Huomio
                            </span>
                          )}
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          Huoneisto {apartment.number}
                          <ConditionBadge score={apartment.overallCondition} size="sm" />
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Basic info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            <span>{apartment.squareMeters} m²</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <span>{apartment.rooms}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{apartment.floor}. kerros</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Tarkastettu {apartment.lastInspection}</span>
                          </div>
                        </div>

                        {/* Tenant info */}
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Vuokralainen</p>
                          {apartment.tenant ? (
                            <div>
                              <p className="text-sm">{apartment.tenant}</p>
                              {apartment.rentEndDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Sopimus päättyy {apartment.rentEndDate}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-amber-400">Vapaa</p>
                          )}
                        </div>

                        {/* Notes */}
                        {apartment.notes && (
                          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                            <p className="text-xs font-medium text-amber-400 mb-1">Huomiot</p>
                            <p className="text-sm">{apartment.notes}</p>
                          </div>
                        )}

                        {/* Evaluation details if exists */}
                        {evaluation && (
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">Arvioinnin tulokset</p>
                            {evaluation.categoryScores.map(cs => (
                              <div key={cs.categoryId} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                                <div className="flex items-center gap-2">
                                  <ConditionBadge score={cs.score} size="sm" />
                                  <span className="text-sm capitalize">
                                    {cs.categoryId.replace('sisatilat-', '').replace('-', ' ')}
                                  </span>
                                </div>
                                {cs.estimatedCost && (
                                  <span className="text-sm font-medium">{formatEur(cs.estimatedCost)}</span>
                                )}
                              </div>
                            ))}
                            {evaluation.notes && (
                              <p className="text-sm text-muted-foreground mt-2">{evaluation.notes}</p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button className="flex-1" size="sm">
                            Avaa arviointi
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Historia
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}

interface ApartmentFloorPlanProps {
  apartments: Apartment[]
}

export function ApartmentFloorPlan({ apartments }: ApartmentFloorPlanProps) {
  // Simple visual grid representation
  const floors = [...new Set(apartments.map(a => a.floor))].sort((a, b) => b - a)
  
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="font-heading text-base font-semibold text-foreground mb-4">Kerrosnäkymä</h3>
      <div className="space-y-4">
        {floors.map(floor => {
          const floorApartments = apartments.filter(a => a.floor === floor)
          return (
            <div key={floor} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16">{floor}. krs</span>
              <div className="flex gap-1.5 flex-wrap">
                {floorApartments.map(apt => (
                  <div 
                    key={apt.id}
                    className={`w-10 h-10 rounded flex items-center justify-center text-xs font-medium ${
                      apt.overallCondition === 5 ? 'bg-emerald-500/20 text-emerald-400' :
                      apt.overallCondition === 4 ? 'bg-green-500/20 text-green-400' :
                      apt.overallCondition === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                      apt.overallCondition === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}
                    title={`${apt.number}: ${apt.overallCondition}/5`}
                  >
                    {apt.number.split(' ')[1] || apt.number}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground">Kunto:</span>
        <div className="flex gap-2">
          {[5, 4, 3, 2, 1].map(score => (
            <div key={score} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${
                score === 5 ? 'bg-emerald-500/50' :
                score === 4 ? 'bg-green-500/50' :
                score === 3 ? 'bg-yellow-500/50' :
                score === 2 ? 'bg-orange-500/50' :
                'bg-red-500/50'
              }`} />
              <span className="text-xs text-muted-foreground">{score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
