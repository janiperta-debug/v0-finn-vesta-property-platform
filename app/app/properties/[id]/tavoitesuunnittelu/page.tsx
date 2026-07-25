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
import { useTranslation } from "@/lib/i18n"
import {
  derivePlanItems,
  timelineBuckets,
  totalRepairCost,
  type PlanItem,
  type UrgencyCode,
} from "@/lib/building-plan"

export default function TavoitesuunnitteluPage() {
  const params = useParams()
  const propertyId = params.id as string
  const { t, locale } = useTranslation()

  // Visual styling per urgency timeframe (labels/order come from building-plan)
  const TIMEFRAME_STYLE: Record<UrgencyCode, { title: string; priorityLabel: string; dot: string; badge: string }> = {
    valitom: { title: t("targetPlanning.timeframeImmediate"), priorityLabel: t("targetPlanning.priorityCritical"), dot: "bg-red-500", badge: "border-red-500 text-red-500" },
    "1_3v": { title: t("targetPlanning.timeframeShort"), priorityLabel: t("targetPlanning.priorityHigh"), dot: "bg-orange-500", badge: "border-orange-500 text-orange-500" },
    "3_5v": { title: t("targetPlanning.timeframeMedium"), priorityLabel: t("targetPlanning.priorityNormal"), dot: "bg-yellow-500", badge: "border-yellow-500 text-yellow-600" },
    "5_10v": { title: t("targetPlanning.timeframeLong"), priorityLabel: t("targetPlanning.priorityLow"), dot: "bg-emerald-500", badge: "border-emerald-500 text-emerald-500" },
  }

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<any>(null)
  const [items, setItems] = useState<PlanItem[]>([])
  const [inspectionDate, setInspectionDate] = useState<string | null>(null)
  const [hasInspection, setHasInspection] = useState(false)

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
        const inspection = inspections[0]
        setInspectionDate(inspection.inspection_date)
        setHasInspection(true)

        const { data: evals } = await supabase
          .from("category_evaluations")
          .select("*")
          .eq("inspection_id", inspection.id)

        if (evals) evaluations = evals
      }

      // Derive the plan from building basics + RT standards, refined by any evaluations.
      // This always produces a baseline, even with no inspection.
      if (prop) {
        const planItems = derivePlanItems(
          {
            construction_year: prop.construction_year,
            area_m2: prop.area_m2,
            building_type: prop.building_type,
          },
          evaluations
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

  const buckets = timelineBuckets(items)
  const totalInvestment = totalRepairCost(items)
  const next5YearsTotal = buckets
    .filter(b => b.urgency !== "5_10v")
    .reduce((sum, b) => sum + b.total, 0)
  const criticalCount = items.filter(i => i.urgency === "valitom" && i.cost > 0).length

  function formatEur(value: number) {
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
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
            <h1 className="font-heading text-2xl font-bold text-foreground">{t("nav.targetPlanning")}</h1>
            <p className="text-sm text-muted-foreground">{property?.name} - {t("targetPlanning.tenYearPts")}</p>
          </div>
        </div>
      </div>

      {/* Info banner - automaattinen suunnitelma */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-4">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">{t("targetPlanning.autoTitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("targetPlanning.autoDescription")}
              {hasInspection && inspectionDate ? (
                <> {t("targetPlanning.refinedByInspection")} {new Date(inspectionDate).toLocaleDateString(locale === "en" ? "en-US" : "fi-FI")}.</>
              ) : (
                <> {t("targetPlanning.refineHint")}</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {buckets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CalendarRange className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("targetPlanning.emptyTitle")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {t("targetPlanning.emptyDescription")}
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
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("targetPlanning.totalInvestment")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEur(totalInvestment)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {buckets.reduce((n, b) => n + b.items.length, 0)} {t("targetPlanning.plannedActionsSuffix")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("targetPlanning.next5Years")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEur(next5YearsTotal)}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("targetPlanning.mostUrgentActions")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("targetPlanning.criticalActions")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{criticalCount}</span>
                  {criticalCount > 0 && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("targetPlanning.requiresImmediateAttention")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline by timeframe */}
          <div className="space-y-4">
            {buckets.map((bucket) => {
              const style = TIMEFRAME_STYLE[bucket.urgency]
              return (
                <Card key={bucket.urgency}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${style.dot}`} />
                        <div>
                          <CardTitle className="text-base">{style.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">{bucket.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{formatEur(bucket.total)}</span>
                        <p className="text-xs text-muted-foreground">{bucket.items.length} {t("targetPlanning.actionsSuffix")}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {bucket.items.map((item) => (
                        <div
                          key={item.categoryId}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="shrink-0">
                              {item.conditionScore}/5
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{item.categoryName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.fromInspection ? t("targetPlanning.basedOnInspection") : t("propertyComponents.rtEstimate")}
                                {item.remainingLifespan > 0
                                  ? ` · ${t("targetPlanning.lifespanRemainingPrefix")} ~${item.remainingLifespan}${t("propertyComponents.yearsRemainingSuffix")}`
                                  : ` · ${t("propertyComponents.lifespanExceeded")}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge variant="outline" className={style.badge}>
                              {style.priorityLabel}
                            </Badge>
                            <span className="text-sm font-medium">{formatEur(item.cost)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
