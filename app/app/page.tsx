import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getTranslation } from "@/lib/i18n/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  ClipboardCheck,
} from "lucide-react"

interface DashboardStats {
  totalProperties: number
  propertiesWithInspections: number
  propertiesWithoutInspections: number
  staleInspectionProperties: number
  incompleteInspections: number
}

interface PropertyRow {
  id: number
  name: string
  address: string | null
}

interface InspectionRow {
  id: string
  building_id: number | null
  inspection_date: string | null
  status: string | null
  overall_score: number | null
  created_at: string | null
}

interface PropertyOverviewItem {
  id: string
  name: string
  address: string | null
  latestInspection: InspectionRow | null
  latestInspectionDate: Date | null
  hasOldInspection: boolean
}

interface IncompleteInspectionItem {
  id: string
  propertyName: string
  inspectionDate: string | null
  status: string | null
  evaluatedCategories: number
}

const COMPLETE_INSPECTION_STATUSES = new Set(["complete", "completed", "approved", "archived"])
const INCOMPLETE_INSPECTION_STATUSES = new Set(["draft", "scheduled", "in_progress"])

function normalizeInspectionStatus(status: string | null) {
  return status?.trim().toLowerCase().replace(/-/g, "_") ?? "unknown"
}

function parseDate(value: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getInspectionRecency(inspection: InspectionRow) {
  return parseDate(inspection.inspection_date)?.getTime()
    ?? parseDate(inspection.created_at)?.getTime()
    ?? Number.NEGATIVE_INFINITY
}

function isIncompleteInspection(status: string | null) {
  return INCOMPLETE_INSPECTION_STATUSES.has(normalizeInspectionStatus(status))
}

function getStatusBadgeVariant(status: string | null): "default" | "secondary" | "outline" {
  const normalized = normalizeInspectionStatus(status)
  if (INCOMPLETE_INSPECTION_STATUSES.has(normalized)) return "secondary"
  if (COMPLETE_INSPECTION_STATUSES.has(normalized)) return "default"
  return "outline"
}

export default async function AppPage() {
  const supabase = await createClient()
  const { t, locale } = await getTranslation()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const hour = new Date().getHours()
  const greeting = hour < 10 ? t("dashboard.greetingMorning") : hour < 18 ? t("dashboard.greetingDay") : t("dashboard.greetingEvening")
  const dateFormatter = new Intl.DateTimeFormat(locale)
  const scoreFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 0 })
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  let userName = user.email?.split("@")[0] || t("dashboard.defaultUser")
  let stats: DashboardStats = {
    totalProperties: 0,
    propertiesWithInspections: 0,
    propertiesWithoutInspections: 0,
    staleInspectionProperties: 0,
    incompleteInspections: 0,
  }
  let propertyOverview: PropertyOverviewItem[] = []
  let incompleteInspections: IncompleteInspectionItem[] = []
  let totalInspectionCategories = 0
  let hasData = false
  let hasOrganization = false

  const getStatusLabel = (status: string | null) => {
    switch (normalizeInspectionStatus(status)) {
      case "draft":
        return t("inspectionDetail.statusDraft")
      case "scheduled":
        return t("inspectionDetail.statusScheduled")
      case "in_progress":
        return t("inspectionDetail.statusInProgress")
      case "complete":
      case "completed":
        return t("inspectionDetail.statusCompleted")
      case "approved":
        return t("inspectionDetail.statusApproved")
      case "archived":
        return t("reportContent.statusArchived")
      default:
        return t("inspectionDetail.statusUnknown")
    }
  }

  try {
    const { data: orgUsers } = await supabase
      .from("org_users")
      .select("org_id, user_name")
      .eq("user_id", user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]
    if (orgUser?.user_name) {
      userName = orgUser.user_name.split(" ")[0]
    }

    if (orgUser?.org_id) {
      hasOrganization = true

      const [
        { data: properties },
        { data: inspectionsData },
        { count: inspectionCategoryCount },
      ] = await Promise.all([
        supabase
          .from("buildings")
          .select("id, name, address, building_type")
          .eq("org_id", orgUser.org_id)
          .is("property_id", null)
          .order("name"),
        supabase
          .from("inspections")
          .select("id, building_id, inspection_date, status, overall_score, created_at")
          .eq("org_id", orgUser.org_id),
        supabase
          .from("inspection_categories")
          .select("id", { count: "exact", head: true }),
      ])

      totalInspectionCategories = inspectionCategoryCount ?? 0

      if (properties && properties.length > 0) {
        hasData = true

        const inspections = (inspectionsData ?? []) as InspectionRow[]
        const propertyMap = new Map<number, PropertyRow>((properties as PropertyRow[]).map((property) => [property.id, property]))
        const latestInspectionByProperty = new Map<number, InspectionRow>()
        const inspectionIds = inspections.map((inspection) => inspection.id)
        const categoryEvaluationCounts = new Map<string, number>()

        if (inspectionIds.length > 0) {
          const { data: evaluationRows } = await supabase
            .from("category_evaluations")
            .select("inspection_id")
            .in("inspection_id", inspectionIds)

          for (const row of evaluationRows ?? []) {
            const nextCount = (categoryEvaluationCounts.get(row.inspection_id) ?? 0) + 1
            categoryEvaluationCounts.set(row.inspection_id, nextCount)
          }
        }

        for (const inspection of inspections) {
          if (!inspection.building_id || !propertyMap.has(inspection.building_id)) continue

          const currentLatest = latestInspectionByProperty.get(inspection.building_id)
          if (!currentLatest || getInspectionRecency(inspection) > getInspectionRecency(currentLatest)) {
            latestInspectionByProperty.set(inspection.building_id, inspection)
          }
        }

        propertyOverview = (properties as PropertyRow[])
          .map((property) => {
            const latestInspection = latestInspectionByProperty.get(property.id) ?? null
            const latestInspectionDate = parseDate(latestInspection?.inspection_date ?? null)
            const hasOldInspection = Boolean(latestInspectionDate && latestInspectionDate < twelveMonthsAgo)

            return {
              id: String(property.id),
              name: property.name || "",
              address: property.address,
              latestInspection,
              latestInspectionDate,
              hasOldInspection,
            }
          })
          .sort((a, b) => {
            const aRank = !a.latestInspection ? 0 : a.hasOldInspection ? 1 : isIncompleteInspection(a.latestInspection.status) ? 2 : 3
            const bRank = !b.latestInspection ? 0 : b.hasOldInspection ? 1 : isIncompleteInspection(b.latestInspection.status) ? 2 : 3
            if (aRank !== bRank) return aRank - bRank
            return a.name.localeCompare(b.name, locale)
          })
          .slice(0, 5)

        incompleteInspections = inspections
          .filter((inspection) => isIncompleteInspection(inspection.status))
          .sort((a, b) => getInspectionRecency(b) - getInspectionRecency(a))
          .map((inspection) => ({
            id: inspection.id,
            propertyName: inspection.building_id ? propertyMap.get(inspection.building_id)?.name || t("inspections.unknownProperty") : t("inspections.unknownProperty"),
            inspectionDate: inspection.inspection_date,
            status: inspection.status,
            evaluatedCategories: categoryEvaluationCounts.get(inspection.id) ?? 0,
          }))
          .slice(0, 5)

        const propertiesWithInspections = (properties as PropertyRow[]).filter((property) => latestInspectionByProperty.has(property.id)).length
        const propertiesWithoutInspections = properties.length - propertiesWithInspections
        const staleInspectionProperties = (properties as PropertyRow[]).filter((property) => {
          const latestInspection = latestInspectionByProperty.get(property.id)
          const latestInspectionDate = parseDate(latestInspection?.inspection_date ?? null)
          return Boolean(latestInspectionDate && latestInspectionDate < twelveMonthsAgo)
        }).length

        stats = {
          totalProperties: properties.length,
          propertiesWithInspections,
          propertiesWithoutInspections,
          staleInspectionProperties,
          incompleteInspections: inspections.filter((inspection) => isIncompleteInspection(inspection.status)).length,
        }
      }
    }
  } catch (error) {
    console.log("[v0] Error fetching portfolio data:", error)
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl min-h-[400px] md:min-h-[450px]">
        <div className="absolute inset-0 hidden md:block">
          <Image
            src="/images/hero-cityscape.jpg"
            alt={t("dashboard.heroAlt")}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 md:hidden">
          <Image
            src="/images/hero-cityscape-mobile.jpg"
            alt={t("dashboard.heroAlt")}
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <div className="relative flex h-full min-h-[400px] md:min-h-[450px] flex-col justify-between px-6 py-8 md:px-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                {greeting}, {userName}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {t("dashboard.portfolioOverviewTitle")}
              </p>
            </div>
          </div>

          {hasData && (
            <div className="mt-auto grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">{t("dashboard.propertiesCount")}</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{stats.totalProperties}</p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">{t("dashboard.propertiesWithInspection")}</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{stats.propertiesWithInspections}</p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">{t("dashboard.propertiesWithoutInspection")}</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{stats.propertiesWithoutInspections}</p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">{t("dashboard.inspectionsOlderThan12Months")}</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{stats.staleInspectionProperties}</p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">{t("dashboard.incompleteInspections")}</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{stats.incompleteInspections}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasOrganization ? (
        <Card className="border-dashed border-amber-500/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-amber-500/10 p-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("dashboard.noOrgTitle")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {t("dashboard.noOrgDescription")}
            </p>
            <Button variant="outline" asChild>
              <Link href="mailto:info@janope.fi">{t("dashboard.contactSupport")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : !hasData ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("dashboard.noPropertiesTitle")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {t("dashboard.noPropertiesDescription")}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/app/properties/import">{t("dashboard.importCsv")}</Link>
              </Button>
              <Button asChild>
                <Link href="/app/properties/new">{t("dashboard.addProperty")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("dashboard.propertiesTitle")}</CardTitle>
                  <CardDescription>{t("dashboard.propertiesOverviewDescription")}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/properties">
                    {t("dashboard.showAll")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {propertyOverview.map((property) => (
                  <Link
                    key={property.id}
                    href={`/app/properties/${property.id}`}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{property.name}</p>
                        <p className="text-sm text-muted-foreground">{property.address || "—"}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant={property.latestInspection ? "outline" : "secondary"} className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {property.latestInspectionDate
                              ? `${t("dashboard.latestInspectionLabel")} ${dateFormatter.format(property.latestInspectionDate)}`
                              : property.latestInspection
                                ? t("dashboard.unknownInspectionDate")
                                : t("dashboard.noInspection")}
                          </Badge>
                          {property.hasOldInspection && (
                            <Badge variant="secondary">{t("dashboard.inspectionOlderThan12Months")}</Badge>
                          )}
                          {property.latestInspection && isIncompleteInspection(property.latestInspection.status) && (
                            <Badge variant="secondary">{getStatusLabel(property.latestInspection.status)}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {property.latestInspection?.overall_score != null && (
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {scoreFormatter.format(property.latestInspection.overall_score)} / 5
                          </p>
                          <p className="text-xs text-muted-foreground">{t("dashboard.savedConditionScore")}</p>
                        </div>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>{t("dashboard.incompleteInspections")}</CardTitle>
              <CardDescription>{t("dashboard.incompleteInspectionsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incompleteInspections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                  {t("dashboard.noIncompleteInspections")}
                </div>
              ) : (
                incompleteInspections.map((inspection) => {
                  const progressValue = totalInspectionCategories > 0
                    ? (inspection.evaluatedCategories / totalInspectionCategories) * 100
                    : 0
                  const inspectionDate = parseDate(inspection.inspectionDate)

                  return (
                    <Link
                      key={inspection.id}
                      href={`/app/kuntoarviot/${inspection.id}`}
                      className="block rounded-xl border border-border/50 bg-muted/30 p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{inspection.propertyName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {inspectionDate
                              ? dateFormatter.format(inspectionDate)
                              : t("dashboard.unknownInspectionDate")}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(inspection.status)}>
                          {getStatusLabel(inspection.status)}
                        </Badge>
                      </div>

                      {totalInspectionCategories > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{t("dashboard.categoriesEvaluated")}</span>
                            <span>{inspection.evaluatedCategories} / {totalInspectionCategories}</span>
                          </div>
                          <Progress value={progressValue} className="h-2" />
                        </div>
                      )}
                    </Link>
                  )
                })
              )}

              <div className="space-y-2 pt-2">
                <Button variant="outline" className="w-full justify-start gap-3 border-border/50 bg-muted/30 hover:bg-muted/50" asChild>
                  <Link href="/app/kuntoarviot/new">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                      <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    {t("dashboard.newInspection")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 border-border/50 bg-muted/30 hover:bg-muted/50" asChild>
                  <Link href="/app/kuntoarviot">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                    </div>
                    {t("dashboard.showAll")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
