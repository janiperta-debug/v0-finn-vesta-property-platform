"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  CalendarRange,
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

interface PlanItem {
  id: string
  categoryId: number
  categoryName: string
  score: number
  urgency: string
  cost: number
  comment: string | null
}

// Urgency-arvot vastaavat tietokannan CHECK-rajoitusta.
// Nämä muodostavat PTS-aikajanan (pitkän tähtäimen suunnitelma).
interface TimeframeBucket {
  key: string
  label: string
  range: string
  priorityLabel: string
  dot: string
  badge: string
  // Onko tämä osa "seuraavat 5 vuotta" -laskentaa
  within5Years: boolean
}

const TIMEFRAMES: TimeframeBucket[] = [
  {
    key: "valitom",
    label: "Välitön",
    range: "0-1 vuotta",
    priorityLabel: "Kriittinen",
    dot: "bg-red-500",
    badge: "border-red-500 text-red-500",
    within5Years: true,
  },
  {
    key: "1_3v",
    label: "Lyhyt aikaväli",
    range: "1-3 vuotta",
    priorityLabel: "Korkea",
    dot: "bg-orange-500",
    badge: "border-orange-500 text-orange-500",
    within5Years: true,
  },
  {
    key: "3_5v",
    label: "Keskipitkä aikaväli",
    range: "3-5 vuotta",
    priorityLabel: "Normaali",
    dot: "bg-yellow-500",
    badge: "border-yellow-500 text-yellow-600",
    within5Years: true,
  },
  {
    key: "5_10v",
    label: "Pitkä aikaväli",
    range: "5-10 vuotta",
    priorityLabel: "Matala",
    dot: "bg-emerald-500",
    badge: "border-emerald-500 text-emerald-500",
    within5Years: false,
  },
]

export default function TavoitesuunnitteluPage() {
  const params = useParams()
  const propertyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<any>(null)
  const [items, setItems] = useState<PlanItem[]>([])
  const [inspectionDate, setInspectionDate] = useState<string | null>(null)

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
        .eq("id", parseInt(propertyId))
        .single()

      if (prop) setProperty(prop)

      // Load latest completed/approved inspection for this building
      const { data: inspections } = await supabase
        .from("inspections")
        .select("*")
        .eq("building_id", parseInt(propertyId))
        .in("status", ["complete", "approved"])
        .order("inspection_date", { ascending: false })
        .limit(1)

      if (inspections && inspections.length > 0) {
        const inspection = inspections[0]
        setInspectionDate(inspection.inspection_date)

        // Load evaluations with category names from inspection_categories
        const { data: evals } = await supabase
          .from("category_evaluations")
          .select("*, inspection_categories(*)")
          .eq("inspection_id", inspection.id)

        if (evals) {
          // Automaattinen tavoitesuunnittelu: sisällytä komponentit, joille
          // RT-standardi on määrittänyt korjaustarpeen (kustannus > 0).
          const planItems: PlanItem[] = evals
            .filter((e: any) => (e.cost_estimate || 0) > 0 && e.urgency)
            .map((e: any) => ({
              id: e.id,
              categoryId: e.category_id,
              categoryName: e.inspection_categories?.name || `Kategoria ${e.category_id}`,
              score: e.score,
              urgency: e.urgency,
              cost: e.cost_estimate || 0,
              comment: e.comment,
            }))
          setItems(planItems)
        }
      }
    } catch (error) {
      console.error("Load error:", error)
      toast.error("Tietojen lataus epäonnistui")
    } finally {
      setLoading(false)
    }
  }

  // Group items by urgency timeframe
  const buckets = TIMEFRAMES.map(tf => {
    const bucketItems = items
      .filter(i => i.urgency === tf.key)
      .sort((a, b) => a.score - b.score) // huonoin kunto ensin
    return {
      ...tf,
      items: bucketItems,
      total: bucketItems.reduce((sum, i) => sum + i.cost, 0),
    }
  })

  const totalInvestment = items.reduce((sum, i) => sum + i.cost, 0)
  const next5YearsTotal = items
    .filter(i => TIMEFRAMES.find(tf => tf.key === i.urgency)?.within5Years)
    .reduce((sum, i) => sum + i.cost, 0)
  const criticalCount = items.filter(i => i.urgency === "valitom").length

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/properties/${propertyId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Tavoitesuunnittelu</h1>
            <p className="text-sm text-muted-foreground">{property?.name} - 10v PTS</p>
          </div>
        </div>
      </div>

      {/* Info banner - automaattinen suunnitelma */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-4">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Automaattinen pitkän tähtäimen suunnitelma</p>
            <p className="text-xs text-muted-foreground mt-1">
              Suunnitelma on luotu RT-standardien ja kuntoarvion perusteella. Toimenpiteet on
              jaettu kiireellisyyden mukaan aikajaksoihin.
              {inspectionDate && (
                <> Perustuu tarkastukseen {new Date(inspectionDate).toLocaleDateString("fi-FI")}.</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CalendarRange className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ei tavoitesuunnitelmaa</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Tavoitesuunnitelma luodaan automaattisesti kuntoarvion perusteella. Tee ensin
              kuntoarvio tälle kiinteistölle, niin näet korjaustoimenpiteiden aikajanan ja
              kustannusarviot.
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
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Investoinnit yhteensä (10v)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEur(totalInvestment)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {items.length} suunniteltua toimenpidettä
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Seuraavat 5 vuotta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEur(next5YearsTotal)}</div>
                <p className="text-xs text-muted-foreground mt-1">Kiireellisimmät toimenpiteet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Kriittiset toimenpiteet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{criticalCount}</span>
                  {criticalCount > 0 && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">vaativat välitöntä huomiota</p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline by timeframe */}
          <div className="space-y-4">
            {buckets.filter(b => b.items.length > 0).map((bucket) => (
              <Card key={bucket.key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${bucket.dot}`} />
                      <div>
                        <CardTitle className="text-base">{bucket.label}</CardTitle>
                        <p className="text-xs text-muted-foreground">{bucket.range}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{formatEur(bucket.total)}</span>
                      <p className="text-xs text-muted-foreground">{bucket.items.length} toimenpidettä</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {bucket.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="shrink-0">
                            {item.score}/5
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">{item.categoryName}</p>
                            {item.comment && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{item.comment}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge variant="outline" className={bucket.badge}>
                            {bucket.priorityLabel}
                          </Badge>
                          <span className="text-sm font-medium">{formatEur(item.cost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
