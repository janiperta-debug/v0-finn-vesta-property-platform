"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Layers,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react"
import { toast } from "sonner"

interface ComponentCategory {
  id: string
  name: string
  description: string | null
  sort_order: number
}

interface CategoryEvaluation {
  id: string
  inspection_id: string
  category_id: number
  score: number
  comment: string | null
  urgency: string | null
  cost_estimate: number | null
  category?: ComponentCategory
}

interface Inspection {
  id: string
  inspection_date: string
  inspector_name: string
  status: string
  overall_score: number | null
}

// RT-standardin kuntoluokka: 5 = erinomainen, 1 = heikko
const conditionLabels: Record<number, { label: string; color: string; bg: string }> = {
  5: { label: "Uusi/Erinomainen", color: "text-emerald-500", bg: "bg-emerald-500" },
  4: { label: "Hyvä", color: "text-lime-500", bg: "bg-lime-500" },
  3: { label: "Tyydyttävä", color: "text-yellow-500", bg: "bg-yellow-500" },
  2: { label: "Välttävä", color: "text-orange-500", bg: "bg-orange-500" },
  1: { label: "Heikko", color: "text-red-500", bg: "bg-red-500" },
}

// Urgency-arvot vastaavat tietokannan CHECK-rajoitusta
const urgencyLabels: Record<string, { label: string; color: string }> = {
  valitom: { label: "Välitön korjaus", color: "text-red-500" },
  "1_3v": { label: "1-3 vuotta", color: "text-orange-500" },
  "3_5v": { label: "3-5 vuotta", color: "text-yellow-500" },
  "5_10v": { label: "5-10 vuotta", color: "text-muted-foreground" },
}

export default function KomponentitPage() {
  const params = useParams()
  const propertyId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<any>(null)
  const [categories, setCategories] = useState<ComponentCategory[]>([])
  const [evaluations, setEvaluations] = useState<CategoryEvaluation[]>([])
  const [latestInspection, setLatestInspection] = useState<Inspection | null>(null)

  useEffect(() => {
    loadData()
  }, [propertyId])

  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()

      // Load property
      const { data: prop } = await supabase
        .from("buildings")
        .select("*")
        .eq("id", propertyId)
        .single()

      if (prop) setProperty(prop)

      // Load inspection categories (reference data)
      const { data: cats } = await supabase
        .from("inspection_categories")
        .select("*")
        .order("sort_order", { ascending: true })

      if (cats) setCategories(cats)

      // Load latest completed inspection for this building
      const { data: inspections } = await supabase
        .from("inspections")
        .select("*")
        .eq("building_id", parseInt(propertyId))
        .in("status", ["complete", "approved"])
        .order("inspection_date", { ascending: false })
        .limit(1)

      if (inspections && inspections.length > 0) {
        setLatestInspection(inspections[0])

        // Load evaluations for this inspection
        const { data: evals } = await supabase
          .from("category_evaluations")
          .select("*, inspection_categories(*)")
          .eq("inspection_id", inspections[0].id)

        if (evals) {
          setEvaluations(evals.map(e => ({
            ...e,
            category: e.inspection_categories,
          })))
        }
      }
    } catch (error) {
      console.error("Load error:", error)
      toast.error("Tietojen lataus epäonnistui")
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const avgCondition = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length
    : 0
  
  const urgentCount = evaluations.filter(e => 
    e.urgency === "valitom" || e.urgency === "1_3v"
  ).length

  const totalEstimatedCost = evaluations.reduce((sum, e) => sum + (e.cost_estimate || 0), 0)

  function formatEur(value: number) {
    return new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/app/properties/${propertyId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Komponentit</h1>
          <p className="text-sm text-muted-foreground">{property?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Keskimääräinen kunto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {avgCondition > 0 ? avgCondition.toFixed(1) : "-"}
              </span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
            {avgCondition > 0 && (
              <Progress value={avgCondition / 5 * 100} className="mt-2 h-2" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Korjaustarpeet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{urgentCount}</span>
              {urgentCount > 0 && <AlertTriangle className="h-5 w-5 text-orange-500" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              kiireellistä toimenpidettä
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Arvioitu korjauskustannus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEur(totalEstimatedCost)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Latest inspection info */}
      {latestInspection && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Viimeisin tarkastus</CardTitle>
              <Badge variant="outline">
                {new Date(latestInspection.inspection_date).toLocaleDateString("fi-FI")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tarkastaja: {latestInspection.inspector_name || "-"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Component list */}
      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ei komponenttiarvioita</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Komponenttiarviot luodaan kuntoarvion yhteydessä. Tee ensin kuntoarvio tälle kiinteistölle.
            </p>
            <Button asChild>
              <Link href={`/app/kuntoarviot/new?building_id=${propertyId}`}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Aloita kuntoarvio
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Komponenttiarviot</h2>
          {categories.map((category) => {
            const evaluation = evaluations.find(e => String(e.category_id) === String(category.id))
            if (!evaluation) return null

            const condition = conditionLabels[evaluation.score] || conditionLabels[3]
            const urgency = evaluation.urgency ? urgencyLabels[evaluation.urgency] : undefined

            return (
              <Card key={category.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${condition.bg}`} />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm">
                          <span className={condition.color}>{condition.label}</span>
                          {urgency && (
                            <>
                              <span className="text-muted-foreground">|</span>
                              <span className={urgency.color}>{urgency.label}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {evaluation.cost_estimate && evaluation.cost_estimate > 0 && (
                        <p className="font-medium">{formatEur(evaluation.cost_estimate)}</p>
                      )}
                      {evaluation.comment && (
                        <p className="text-xs text-muted-foreground max-w-48 truncate">
                          {evaluation.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
