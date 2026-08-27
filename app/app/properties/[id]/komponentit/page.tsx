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
import { useTranslation } from "@/lib/i18n"
import {
  derivePlanItems,
  overallCondition,
  urgencyLabel,
  type PlanItem,
} from "@/lib/building-plan"

interface Inspection {
  id: string
  inspection_date: string
  inspector_name: string
  status: string
  overall_score: number | null
}

const urgencyColor: Record<string, string> = {
  valitom: "text-red-500",
  "1_3v": "text-orange-500",
  "3_5v": "text-yellow-500",
  "5_10v": "text-muted-foreground",
}

export default function KomponentitPage() {
  const params = useParams()
  const propertyId = params.id as string
  const { t, locale } = useTranslation()

  // RT-standardin kuntoluokka: 5 = erinomainen, 1 = heikko
  const conditionLabels: Record<number, { label: string; color: string; bg: string }> = {
    5: { label: t("propertyComponents.condExcellent"), color: "text-emerald-500", bg: "bg-emerald-500" },
    4: { label: t("propertyComponents.condGood"), color: "text-lime-500", bg: "bg-lime-500" },
    3: { label: t("propertyComponents.condSatisfactory"), color: "text-yellow-500", bg: "bg-yellow-500" },
    2: { label: t("propertyComponents.condPoor"), color: "text-orange-500", bg: "bg-orange-500" },
    1: { label: t("propertyComponents.condWeak"), color: "text-red-500", bg: "bg-red-500" },
  }

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<any>(null)
  const [items, setItems] = useState<PlanItem[]>([])
  const [latestInspection, setLatestInspection] = useState<Inspection | null>(null)

  useEffect(() => {
    loadData()
  }, [propertyId])

  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()

      // Load property basics
      const { data: prop } = await supabase
        .from("buildings")
        .select("*")
        .eq("id", parseInt(propertyId))
        .single()

      if (prop) setProperty(prop)

      // Load latest inspection for this building (any status, including drafts)
      const { data: inspections } = await supabase
        .from("inspections")
        .select("*")
        .eq("building_id", parseInt(propertyId))
        .order("inspection_date", { ascending: false })
        .limit(1)

      let evaluations: any[] = []
      if (inspections && inspections.length > 0) {
        setLatestInspection(inspections[0])

        const { data: evals } = await supabase
          .from("category_evaluations")
          .select("*")
          .eq("inspection_id", inspections[0].id)

        if (evals) evaluations = evals
      }

      // Derive per-component condition from building basics + RT standards,
      // refined by any stored evaluations. Always shows a baseline.
      if (prop) {
        const planItems = derivePlanItems(
          {
            construction_year: prop.construction_year,
            building_type: prop.building_type,
          },
          evaluations,
          t
        )
        setItems(planItems)
      }
    } catch (error) {
      console.error("Load error:", error)
      toast.error(t("propertyComponents.loadError"))
    } finally {
      setLoading(false)
    }
  }

  // Stats derived from the plan
  const avgCondition = overallCondition(items)
  const urgentCount = items.filter(i => i.urgency === "valitom" || i.urgency === "1_3v").length

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
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("nav.components")}</h1>
          <p className="text-sm text-muted-foreground">{property?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("propertyComponents.avgCondition")}</CardDescription>
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
            <CardDescription>{t("propertyComponents.repairNeeds")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{urgentCount}</span>
              {urgentCount > 0 && <AlertTriangle className="h-5 w-5 text-orange-500" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("propertyComponents.urgentActionsSuffix")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source info */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {latestInspection ? t("propertyComponents.latestInspection") : t("propertyComponents.rtEstimate")}
            </CardTitle>
            {latestInspection && (
              <Badge variant="outline">
                {new Date(latestInspection.inspection_date).toLocaleDateString(locale === "en" ? "en-US" : "fi-FI")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {latestInspection
              ? `${t("propertyComponents.inspectorPrefix")} ${latestInspection.inspector_name || "-"}. ${t("propertyComponents.refinedByInspection")}`
              : t("propertyComponents.baselineEstimate")}
          </p>
        </CardContent>
      </Card>

      {/* Component list */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("propertyComponents.emptyTitle")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {t("propertyComponents.emptyDescription")}
            </p>
            <Button asChild>
              <Link href={`/app/kuntoarviot/new?building_id=${propertyId}`}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                {t("propertyComponents.startInspection")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t("propertyComponents.componentEvaluationsTitle")}</h2>
          {[...items]
            .sort((a, b) => a.conditionScore - b.conditionScore)
            .map((item) => {
              const condition = conditionLabels[item.conditionScore] || conditionLabels[3]
              return (
                <Card key={item.categoryId} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`h-3 w-3 rounded-full shrink-0 ${condition.bg}`} />
                        <div className="min-w-0">
                          <p className="font-medium">{item.categoryName}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
                            <span className={condition.color}>{condition.label}</span>
                            <span className="text-muted-foreground">|</span>
                            <span className={urgencyColor[item.urgency]}>{urgencyLabel(item.urgency, t)}</span>
                            {!item.fromInspection && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t("propertyComponents.rtEstimateShort")}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {item.remainingLifespan > 0 ? `~${item.remainingLifespan}${t("propertyComponents.yearsRemainingSuffix")}` : t("propertyComponents.lifespanExceeded")}
                        </p>
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
