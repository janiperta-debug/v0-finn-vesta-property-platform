import { createClient } from "@/lib/supabase/server"
import { getTranslation } from "@/lib/i18n/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarRange,
  Plus,
  Building2,
  AlertTriangle,
  Download,
} from "lucide-react"
import {
  derivePlanItems,
  repairItems,
  type UrgencyCode,
} from "@/lib/building-plan"

interface InvestmentItem {
  id: string
  propertyId: string
  propertyName: string
  title: string
  year: number
  estimatedCost: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  derived: boolean
}

// Map a derived urgency bucket to a target year offset and priority
const URGENCY_YEAR_OFFSET: Record<UrgencyCode, number> = {
  valitom: 0,
  "1_3v": 2,
  "3_5v": 4,
  "5_10v": 8,
}
const URGENCY_PRIORITY: Record<UrgencyCode, InvestmentItem['priority']> = {
  valitom: 'critical',
  "1_3v": 'high',
  "3_5v": 'medium',
  "5_10v": 'low',
}

export default async function TimelinePage() {
  const supabase = await createClient()
  const { t, locale } = await getTranslation()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const priorityConfig = {
    low: { label: t("timeline.priorityLow"), color: 'text-slate-400' },
    medium: { label: t("timeline.priorityMedium"), color: 'text-blue-400' },
    high: { label: t("timeline.priorityHigh"), color: 'text-amber-400' },
    critical: { label: t("timeline.priorityCritical"), color: 'text-red-400' },
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i)
  let investments: InvestmentItem[] = []

  // Get org_id first
  const { data: orgUsers } = await supabase
    .from('org_users')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)

  const orgUser = orgUsers?.[0]

  try {
    if (orgUser?.org_id) {
      // 1. All buildings in the org (basics needed for RT-derived baseline)
      const { data: buildings } = await supabase
        .from('buildings')
        .select('id, name, construction_year, area_m2, building_type')
        .eq('org_id', orgUser.org_id)

      // 2. Latest inspection per building
      const { data: inspections } = await supabase
        .from('inspections')
        .select('id, building_id, inspection_date')
        .eq('org_id', orgUser.org_id)
        .order('inspection_date', { ascending: false })

      const latestInspectionByBuilding = new Map<number, string>()
      for (const insp of inspections || []) {
        if (!latestInspectionByBuilding.has(insp.building_id)) {
          latestInspectionByBuilding.set(insp.building_id, insp.id)
        }
      }

      // 3. Evaluations for those latest inspections
      const inspectionIds = [...latestInspectionByBuilding.values()]
      let evalsByBuilding = new Map<number, any[]>()
      if (inspectionIds.length > 0) {
        const { data: evals } = await supabase
          .from('category_evaluations')
          .select('category_id, score, urgency, cost_estimate, inspection_id')
          .in('inspection_id', inspectionIds)

        const buildingByInspection = new Map<string, number>()
        for (const [buildingId, inspId] of latestInspectionByBuilding.entries()) {
          buildingByInspection.set(inspId, buildingId)
        }
        for (const e of evals || []) {
          const bId = buildingByInspection.get(e.inspection_id)
          if (bId == null) continue
          if (!evalsByBuilding.has(bId)) evalsByBuilding.set(bId, [])
          evalsByBuilding.get(bId)!.push(e)
        }
      }

      // 4. Derive a portfolio-wide plan: one set of repair items per building
      for (const b of buildings || []) {
        const planItems = derivePlanItems(
          {
            construction_year: b.construction_year,
            area_m2: b.area_m2,
            building_type: b.building_type,
          },
          evalsByBuilding.get(b.id) || []
        )
        for (const item of repairItems(planItems)) {
          investments.push({
            id: `${b.id}-${item.categoryStringId}`,
            propertyId: String(b.id),
            propertyName: b.name || t('maintenance.defaultPropertyName'),
            title: item.categoryName,
            year: currentYear + URGENCY_YEAR_OFFSET[item.urgency],
            estimatedCost: item.cost,
            priority: URGENCY_PRIORITY[item.urgency],
            derived: true,
          })
        }
      }

      // 5. Merge any manually planned investments
      const { data: invData } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('org_id', orgUser.org_id)

      if (invData && invData.length > 0) {
        const buildingMap = new Map<number, string>(
          (buildings || []).map(b => [b.id, b.name])
        )
        for (const i of invData as any[]) {
          investments.push({
            id: `manual-${i.id}`,
            propertyId: String(i.kiinteisto_id),
            propertyName: buildingMap.get(i.kiinteisto_id) || t('maintenance.unknownProperty'),
            title: i.otsikko || '-',
            year: i.vuosi || currentYear,
            estimatedCost: i.arvioitu_kustannus || 0,
            priority: (i.prioriteetti as InvestmentItem['priority']) || 'medium',
            derived: false,
          })
        }
      }
    }
  } catch (error) {
    console.log("[v0] Error building portfolio PTS:", error)
  }

  // Group by year
  const investmentsByYear = years.map(year => ({
    year,
    items: investments
      .filter(i => i.year === year)
      .sort((a, b) => b.estimatedCost - a.estimatedCost),
    total: investments.filter(i => i.year === year).reduce((sum, i) => sum + i.estimatedCost, 0),
  }))

  const totalInvestment = investments.reduce((sum, i) => sum + i.estimatedCost, 0)
  const next5 = investments.filter(i => i.year <= currentYear + 5).reduce((s, i) => s + i.estimatedCost, 0)
  const criticalCount = investments.filter(i => i.priority === 'critical').length

  function formatEur(value: number) {
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("timeline.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("timeline.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("timeline.exportExcel")}
          </Button>
          <Button size="sm" asChild>
            <Link href="/app/timeline/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("timeline.addInvestment")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("timeline.totalInvestments15y")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEur(totalInvestment)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {investments.length} {t("targetPlanning.plannedActionsSuffix")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("targetPlanning.next5Years")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEur(next5)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentYear} - {currentYear + 5}
            </p>
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
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {investments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CalendarRange className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("timeline.noPropertiesTitle")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {t("timeline.noPropertiesDescription")}
            </p>
            <Button asChild>
              <Link href="/app/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("dashboard.addProperty")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {investmentsByYear.filter(y => y.items.length > 0 || y.year <= currentYear + 5).map(({ year, items, total }) => (
            <Card key={year} className={items.length === 0 ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={year === currentYear ? 'default' : 'outline'} className="text-sm">
                      {year}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {items.length} {t("targetPlanning.actionsSuffix")}
                    </span>
                  </div>
                  <span className="font-semibold">{formatEur(total)}</span>
                </div>
              </CardHeader>
              {items.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {items.map((item) => {
                      const priority = priorityConfig[item.priority]
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${priority.color.replace('text-', 'bg-')}`} />
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                {item.propertyName}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className={priority.color}>
                              {priority.label}
                            </Badge>
                            <span className="text-sm font-medium">{formatEur(item.estimatedCost)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
