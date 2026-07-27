import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslation } from "@/lib/i18n/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Wrench,
  Plus,
  Calendar,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import {
  derivePlanItems,
  repairItems,
  urgencyLabel,
  URGENCY_ORDER,
  type UrgencyCode,
  type PlanItem,
} from "@/lib/building-plan"

interface RecommendedItem {
  id: string
  propertyId: string
  propertyName: string
  categoryName: string
  conditionScore: number
  urgency: UrgencyCode
  cost: number
  fromInspection: boolean
}

interface MaintenanceTask {
  id: string
  propertyName: string
  title: string
  category: string
  date: string
  cost: number
  status: "planned" | "in-progress" | "complete"
  contractor?: string
}

const urgencyBadge: Record<UrgencyCode, string> = {
  valitom: "border-red-500 text-red-500",
  "1_3v": "border-amber-500 text-amber-500",
  "3_5v": "border-lime-500 text-lime-500",
  "5_10v": "",
}

function formatEur(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
}

export default async function HuoltohistoriaPage() {
  const supabase = await createClient()
  const { t, locale } = await getTranslation()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let recommended: RecommendedItem[] = []
  let tasks: MaintenanceTask[] = []

  try {
    const { data: orgUsers } = await supabase
      .from("org_users")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]

    if (orgUser?.org_id) {
      // 1. All buildings in the org (basics for RT-derived baseline)
      const { data: buildings } = await supabase
        .from("buildings")
        .select("id, name, construction_year, area_m2, building_type")
        .eq("org_id", orgUser.org_id)

      // 2. Latest inspection per building
      const { data: inspections } = await supabase
        .from("inspections")
        .select("id, building_id, inspection_date")
        .eq("org_id", orgUser.org_id)
        .order("inspection_date", { ascending: false })

      const latestInspectionByBuilding = new Map<number, string>()
      for (const insp of inspections || []) {
        if (!latestInspectionByBuilding.has(insp.building_id)) {
          latestInspectionByBuilding.set(insp.building_id, insp.id)
        }
      }

      // 3. Evaluations for those latest inspections
      const inspectionIds = [...latestInspectionByBuilding.values()]
      const evalsByBuilding = new Map<number, any[]>()
      if (inspectionIds.length > 0) {
        const { data: evals } = await supabase
          .from("category_evaluations")
          .select("category_id, score, urgency, cost_estimate, inspection_id")
          .in("inspection_id", inspectionIds)

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

      // 4. Derive recommended maintenance across the whole portfolio
      for (const b of buildings || []) {
        const planItems: PlanItem[] = derivePlanItems(
          {
            construction_year: b.construction_year,
            area_m2: b.area_m2,
            building_type: b.building_type,
          },
          evalsByBuilding.get(b.id) || [],
          t
        )
        for (const item of repairItems(planItems)) {
          recommended.push({
            id: `${b.id}-${item.categoryStringId}`,
            propertyId: String(b.id),
            propertyName: b.name || t("maintenance.defaultPropertyName"),
            categoryName: item.categoryName,
            conditionScore: item.conditionScore,
            urgency: item.urgency,
            cost: item.cost,
            fromInspection: item.fromInspection,
          })
        }
      }

      // Sort recommended by urgency then cost desc
      recommended.sort((a, b) => {
        const u = URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency)
        return u !== 0 ? u : b.cost - a.cost
      })

      // 5. Actual completed / logged maintenance work
      const { data: tasksData } = await supabase
        .from("huoltotyot")
        .select("*")
        .eq("org_id", orgUser.org_id)
        .order("pvm", { ascending: false })

      if (tasksData && tasksData.length > 0) {
        const buildingNameMap = new Map<number, string>(
          (buildings || []).map(b => [b.id, b.name || t("maintenance.defaultPropertyName")])
        )
        tasks = tasksData.map((row: any) => ({
          id: row.id,
          propertyName: buildingNameMap.get(row.kiinteisto_id) || t("maintenance.unknownProperty"),
          title: row.otsikko || "-",
          category: row.kategoria || "other",
          date: row.pvm,
          cost: row.kustannus || 0,
          status: row.tila || "planned",
          contractor: row.urakoitsija,
        }))
      }
    }
  } catch (error) {
    console.log("[v0] Error building maintenance overview:", error)
  }

  const totalRecommendedCost = recommended.reduce((sum, r) => sum + r.cost, 0)
  const criticalCount = recommended.filter(r => r.urgency === "valitom").length
  const completedCount = tasks.filter(task => task.status === "complete").length

  const categoryLabels: Record<string, string> = {
    hvac: t("maintenance.categoryHvac"),
    electrical: t("maintenance.categoryElectrical"),
    structural: t("maintenance.categoryStructural"),
    roof: t("maintenance.categoryRoof"),
    facade: t("maintenance.categoryFacade"),
    interior: t("maintenance.categoryInterior"),
    outdoor: t("maintenance.categoryOutdoor"),
    other: t("maintenance.categoryOther"),
  }

  const statusConfig = {
    planned: { label: t("maintenance.statusPlanned"), variant: "secondary" as const, icon: Clock },
    "in-progress": { label: t("maintenance.statusInProgress"), variant: "default" as const, icon: AlertTriangle },
    complete: { label: t("maintenance.statusComplete"), variant: "outline" as const, icon: CheckCircle },
  }

  // Group recommended items by urgency for display
  const groupedByUrgency = URGENCY_ORDER.map(urgency => ({
    urgency,
    label: urgencyLabel(urgency, t),
    items: recommended.filter(r => r.urgency === urgency),
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("maintenance.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("maintenance.subtitle")}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/app/huoltohistoria/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("maintenance.logWorkButton")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("maintenance.statRecommended")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommended.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("maintenance.statCritical")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{criticalCount}</span>
              {criticalCount > 0 && <AlertTriangle className="h-5 w-5 text-red-500" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("maintenance.statEstimatedCost")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEur(totalRecommendedCost, locale)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("maintenance.statLoggedWorks")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{completedCount}</span>
              {completedCount > 0 && <CheckCircle className="h-5 w-5 text-emerald-500" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("maintenance.recommendedTitle")}</CardTitle>
          <CardDescription>
            {t("maintenance.recommendedDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommended.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t("maintenance.emptyTitle")}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {t("maintenance.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedByUrgency.map(group => (
                <div key={group.urgency}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        group.urgency === "valitom" ? "bg-red-500" :
                        group.urgency === "1_3v" ? "bg-amber-500" :
                        group.urgency === "3_5v" ? "bg-lime-500" : "bg-emerald-500"
                      }`} />
                      <h4 className="font-heading text-sm font-semibold text-foreground">{group.label}</h4>
                      <Badge variant="secondary" className="text-xs">{group.items.length}</Badge>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatEur(group.items.reduce((sum, i) => sum + i.cost, 0), locale)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map(item => (
                      <Link
                        key={item.id}
                        href={`/app/properties/${item.propertyId}/tavoitesuunnittelu`}
                        className="flex items-center justify-between rounded-lg bg-muted/40 p-3 transition-colors hover:bg-muted/70"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{item.categoryName}</p>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{item.propertyName}</span>
                            {!item.fromInspection && (
                              <span className="text-muted-foreground/60">· {t("maintenance.estimateSuffix")}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-3">
                          <Badge variant="outline" className={urgencyBadge[item.urgency]}>
                            KL {item.conditionScore}
                          </Badge>
                          <span className="text-sm font-medium">{formatEur(item.cost, locale)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actual logged works */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("maintenance.loggedTitle")}</CardTitle>
            <CardDescription>{t("maintenance.loggedDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("maintenance.colWork")}</TableHead>
                  <TableHead>{t("maintenance.colProperty")}</TableHead>
                  <TableHead>{t("maintenance.colCategory")}</TableHead>
                  <TableHead>{t("maintenance.colDate")}</TableHead>
                  <TableHead>{t("maintenance.colCost")}</TableHead>
                  <TableHead>{t("maintenance.colStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const statusInfo = statusConfig[task.status]
                  const StatusIcon = statusInfo.icon
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.contractor && (
                            <p className="text-xs text-muted-foreground">{task.contractor}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {task.propertyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[task.category] || task.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.date).toLocaleDateString(locale === "en" ? "en-US" : "fi-FI")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatEur(task.cost, locale)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
