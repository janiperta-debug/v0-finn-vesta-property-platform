"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { categories } from "@/lib/kuntoarvio-data"
import { categoryIdMapping } from "@/lib/rt-standards"
import { derivePlanItems, overallCondition, totalRepairCost, repairItems } from "@/lib/building-plan"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  Ruler, 
  Edit, 
  Trash2,
  Plus,
  LayoutGrid,
  ClipboardCheck,
  History,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  MoreHorizontal,
  User,
  FileText,
  Target,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n"

interface Property {
  id: number
  name: string
  address: string | null
  building_type: string | null
  construction_year: number | null
  area_m2: number | null
  municipality: string | null
  notes: string | null
  status: string
  is_sub_building: boolean | null
  org_id: number
  property_id: number | null
  usage_category: string | null
  cost_per_m2: number | null
  created_at: string
}

interface SubSpace {
  id: string
  property_id: string
  number: string
  floor: number
  square_meters?: number
  rooms?: string
  type: string
  notes?: string
  tenant?: string
  overall_condition?: number
}

interface Inspection {
  id: string
  building_id: number
  inspection_date: string
  inspector_name: string | null
  inspector_type: string | null
  status: string
  overall_score: number | null
  notes: string | null
}

interface CategoryEvaluation {
  id: string
  inspection_id: string
  category_id: number
  score: number | null
  comment: string | null
  urgency: string | null
  cost_estimate: number | null
}

const getKlaColor = (score: number) => {
  if (score >= 75) return "text-emerald-400"
  if (score >= 60) return "text-amber-400"
  return "text-red-400"
}

const getKlaBgColor = (score: number) => {
  if (score >= 75) return "bg-emerald-500/20 text-emerald-400"
  if (score >= 60) return "bg-amber-500/20 text-amber-400"
  return "bg-red-500/20 text-red-400"
}

// Reverse mapping: numeric category_id (from database) -> string category id (used in categories list)
const numericToStringCategoryId: Record<number, string> = Object.fromEntries(
  Object.entries(categoryIdMapping).map(([strId, numId]) => [numId, strId])
)

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  const { t, locale } = useTranslation()

  const buildingTypeLabels: Record<string, string> = {
    kerrostalo: t("propertyTypes.kerrostalo"),
    rivitalo: t("propertyTypes.rivitalo"),
    paritalo: t("propertyTypes.paritalo"),
    omakotitalo: t("propertyTypes.omakotitalo"),
    toimisto: t("propertyTypes.toimisto"),
    koulu: t("propertyTypes.kouluPaivakoti"),
    liikunta: t("propertyTypes.liikunta"),
    teollisuus: t("propertyTypes.teollisuus"),
    muu: t("propertyTypes.muu"),
  }

  const formatEur = (value: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-US" : "fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

  // Resolve a display name for a category_id that may be numeric (database) or a string id
  const getCategoryName = (categoryId: number | string): string => {
    let category = categories.find(c => String(c.id) === String(categoryId))
    if (!category) {
      const strId = numericToStringCategoryId[Number(categoryId)]
      if (strId) {
        category = categories.find(c => c.id === strId)
      }
    }
    return category?.name || `${t("propertyDetail.categoryPrefix")} ${categoryId}`
  }

  // Urgency values stored in the database (matches the inspections/category_evaluations CHECK constraint)
  const URGENCY_META: Record<string, { label: string; rank: number; dot: string; badge: string }> = {
    valitom: { label: t("propertyDetail.urgencyImmediate"), rank: 0, dot: "bg-red-500", badge: "border-red-500 text-red-500" },
    "1_3v": { label: t("propertyDetail.urgency1to3"), rank: 1, dot: "bg-amber-500", badge: "border-amber-500 text-amber-500" },
    "3_5v": { label: t("propertyDetail.urgency3to5"), rank: 2, dot: "bg-lime-500", badge: "" },
    "5_10v": { label: t("propertyDetail.urgency5to10"), rank: 3, dot: "bg-emerald-500", badge: "" },
  }
  const getUrgencyLabel = (u?: string | null) => (u ? URGENCY_META[u]?.label : undefined) || t("propertyDetail.urgencyMonitoring")
  const getUrgencyRank = (u?: string | null) => (u && URGENCY_META[u] ? URGENCY_META[u].rank : 3)
  const getUrgencyDot = (u?: string | null) => (u ? URGENCY_META[u]?.dot : undefined) || "bg-emerald-500"
  const getUrgencyBadge = (u?: string | null) => (u ? URGENCY_META[u]?.badge : undefined) || ""

  const [property, setProperty] = useState<Property | null>(null)
  const [subSpaces, setSubSpaces] = useState<SubSpace[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [categoryEvaluations, setCategoryEvaluations] = useState<CategoryEvaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProperty()
  }, [propertyId])

  const loadProperty = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Load property from buildings table
      const { data: prop, error: propError } = await supabase
        .from("buildings")
        .select("*")
        .eq("id", parseInt(propertyId))
        .single()

      if (propError) throw propError
      setProperty(prop)

      // Load sub-spaces (child buildings where property_id = this building)
      const { data: spaces } = await supabase
        .from("buildings")
        .select("*")
        .eq("property_id", parseInt(propertyId))
        .order("name", { ascending: true })

      if (spaces) {
        setSubSpaces(spaces.map(s => ({
          id: String(s.id),
          property_id: String(s.property_id),
          number: s.name || "",
          floor: 1,
          square_meters: s.area_m2,
          rooms: "",
          type: s.usage_category || "other",
          notes: s.notes,
        })))
      }

      // Load inspections for this building
      const { data: insps } = await supabase
        .from("inspections")
        .select("*")
        .eq("building_id", parseInt(propertyId))
        .order("inspection_date", { ascending: false })

      if (insps) {
        setInspections(insps)
        
        // Load category evaluations for the latest inspection
        if (insps.length > 0) {
          const { data: evals } = await supabase
            .from("category_evaluations")
            .select("*")
            .eq("inspection_id", insps[0].id)
          
          if (evals) {
            setCategoryEvaluations(evals)
          }
        }
      }
    } catch (error) {
      console.error("Load error:", error)
      toast.error(t("propertyDetail.loadError"))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubSpace = async (subSpaceId: string) => {
    if (!confirm(t("propertyDetail.deleteSpaceConfirm"))) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("buildings")
        .delete()
        .eq("id", parseInt(subSpaceId))

      if (error) throw error

      toast.success(t("propertyDetail.spaceDeleted"))
      loadProperty()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(t("propertyDetail.deleteError"))
    }
  }

  const handleDeleteProperty = async () => {
    if (!confirm(t("propertyDetail.deletePropertyConfirm"))) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("buildings")
        .delete()
        .eq("id", parseInt(propertyId))

      if (error) throw error

      toast.success(t("propertyDetail.propertyDeleted"))
      router.push("/app/properties")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(t("propertyDetail.deleteError"))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t("propertyDetail.notFoundTitle")}</h2>
        <p className="text-muted-foreground mb-6">{t("propertyDetail.notFoundDescription")}</p>
        <Button asChild>
          <Link href="/app/properties">{t("propertyDetail.backToList")}</Link>
        </Button>
      </div>
    )
  }

  // Derive the building's condition & long-term plan from basics + RT standards,
  // refined by any stored category evaluations. This gives a meaningful baseline
  // even before an inspection exists.
  const planItems = derivePlanItems(
    {
      construction_year: property.construction_year,
      area_m2: property.area_m2,
      building_type: property.building_type,
    },
    categoryEvaluations.map(e => ({
      category_id: e.category_id,
      score: e.score,
      urgency: e.urgency,
      cost_estimate: e.cost_estimate,
      comment: e.comment,
    }))
  )
  const overallCond = overallCondition(planItems) // 1-5
  const kuntoluokka = overallCond > 0 ? Math.round(overallCond * 20) : 0 // percentage
  const jalleenhankintaArvo = (property.area_m2 || 0) * (property.cost_per_m2 || 2500)
  const korjausVelka = totalRepairCost(planItems)
  const tekninenArvo = Math.max(0, jalleenhankintaArvo - korjausVelka)
  const planRepairItems = repairItems(planItems)

  // Group sub-spaces by floor
  const subSpacesByFloor = subSpaces.reduce((acc, space) => {
    const floor = space.floor
    if (!acc[floor]) acc[floor] = []
    acc[floor].push(space)
    return acc
  }, {} as Record<number, SubSpace[]>)

  // Check building type for apartments
  const hasApartments = ['kerrostalo', 'rivitalo'].includes(property.building_type || '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/properties">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-heading text-2xl font-bold text-foreground">{property.name}</h1>
              {kuntoluokka > 0 && (
                <Badge variant="secondary" className={`${getKlaBgColor(kuntoluokka)} border-0 font-mono`}>
                  Kla {kuntoluokka}%
                </Badge>
              )}
              <Badge variant="outline">{buildingTypeLabels[property.building_type ?? ''] || property.building_type || '-'}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {property.address}{property.municipality && `, ${property.municipality}`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/app/kuntoarviot/new?building_id=${property.id}`}>
            <Button size="sm" className="gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5" />
              {t("propertyDetail.inspectionButton")}
            </Button>
          </Link>
          <Link href={`/app/properties/${property.id}/tavoitesuunnittelu`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Target className="h-3.5 w-3.5" />
              {t("nav.targetPlanning")}
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/app/properties/${propertyId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("propertyDetail.editInfo")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDeleteProperty}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("propertyDetail.deleteProperty")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key metrics - similar to demo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {t("propertyDetail.constructionYearLabel")}
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">
            {property.construction_year || "-"}
          </p>
          {property.construction_year && (
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date().getFullYear() - property.construction_year} {t("propertyDetail.yearsOldSuffix")}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Ruler className="h-3.5 w-3.5" />
            {t("propertyDetail.areaLabel")}
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">
            {property.area_m2 ? `${property.area_m2.toLocaleString(locale === "en" ? "en-US" : "fi-FI")} m²` : "-"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {subSpaces.length} {t("propertyDetail.spacesUnitsSuffix")}
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("propertyDetail.replacementValueLabel")}
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">
            {jalleenhankintaArvo > 0 ? formatEur(jalleenhankintaArvo) : "-"}
          </p>
          {property.area_m2 && jalleenhankintaArvo > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatEur(jalleenhankintaArvo / property.area_m2)}/m²
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("propertyDetail.technicalValueLabel")}
          </div>
          <p className={`font-heading text-2xl font-bold ${kuntoluokka > 0 ? getKlaColor(kuntoluokka) : ''}`}>
            {tekninenArvo > 0 ? formatEur(tekninenArvo) : "-"}
          </p>
          {kuntoluokka > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("propertyDetail.conditionClassLabel")} {kuntoluokka}%
            </p>
          )}
        </div>
      </div>

      {/* Tabs for different views - similar to demo */}
      <Tabs defaultValue="kuntoarvio" className="space-y-4">
        <TabsList className="bg-muted/50 w-full overflow-x-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="kuntoarvio" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            {t("propertyDetail.inspectionButton")}
          </TabsTrigger>
          <TabsTrigger value="huoneistot" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            {hasApartments ? t("propertyDetail.apartmentsLabel") : t("propertyDetail.spacesLabel")}
            {subSpaces.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                {subSpaces.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="kuntoluokka" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("propertyDetail.conditionClassLabel")}
          </TabsTrigger>
          <TabsTrigger value="korjausvelka" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t("propertyDetail.repairDebtLabel")}
          </TabsTrigger>
        </TabsList>

        {/* Kuntoarvio Tab */}
        <TabsContent value="kuntoarvio" className="space-y-6">
          {inspections.length > 0 ? (
            <>
              {/* Latest inspection summary */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <h3 className="font-heading text-base font-semibold text-foreground mb-4">{t("propertyDetail.latestAssessmentTitle")}</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("inspectionDetail.scoreTitle")}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {inspections[0].overall_score && (
                            <ConditionBadge score={Math.round(inspections[0].overall_score) as 1|2|3|4|5} />
                          )}
                          <span className="font-medium">{inspections[0].overall_score?.toFixed(1) || "-"} / 5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("inspectionDetail.inspectorLabel")}</p>
                        <p className="font-medium mt-1">{inspections[0].inspector_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("inspectionDetail.dateLabel")}</p>
                        <p className="font-medium mt-1">
                          {new Date(inspections[0].inspection_date).toLocaleDateString(locale === "en" ? "en-US" : "fi-FI")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link href={`/app/kuntoarviot/${inspections[0].id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      {t("propertyDetail.openAssessment")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Category evaluations from latest inspection */}
              {categoryEvaluations.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <h3 className="font-heading text-base font-semibold text-foreground mb-4">
                    {t("propertyDetail.componentConditionTitle")}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryEvaluations
                      .filter(e => e.score !== null)
                      .sort((a, b) => (a.score || 0) - (b.score || 0))
                      .slice(0, 9)
                      .map(evaluation => {
                        return (
                          <div key={evaluation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <ConditionBadge score={evaluation.score as 1|2|3|4|5} size="sm" />
                              <div>
                                <p className="text-sm font-medium">{getCategoryName(evaluation.category_id)}</p>
                                {evaluation.urgency && (
                                  <p className="text-xs text-muted-foreground">
                                    {getUrgencyLabel(evaluation.urgency)}
                                  </p>
                                )}
                              </div>
                            </div>
                            {evaluation.cost_estimate && evaluation.cost_estimate > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {(evaluation.cost_estimate / 1000).toFixed(0)}k€
                              </span>
                            )}
                          </div>
                        )
                      })}
                  </div>
                  {categoryEvaluations.filter(e => e.score !== null).length > 9 && (
                    <Link href={`/app/kuntoarviot/${inspections[0].id}`}>
                      <Button variant="link" size="sm" className="mt-2 px-0">
                        {t("propertyDetail.showAllPrefix")} {categoryEvaluations.filter(e => e.score !== null).length} {t("propertyDetail.categoriesSuffix")}
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* All inspections list */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {t("propertyDetail.allAssessmentsPrefix")} ({inspections.length})
                  </h3>
                  <Link href={`/app/kuntoarviot/new?building_id=${property.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      {t("propertyDetail.newAssessmentButton")}
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {inspections.map(insp => (
                    <Link 
                      key={insp.id} 
                      href={`/app/kuntoarviot/${insp.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {insp.overall_score && (
                          <ConditionBadge score={Math.round(insp.overall_score) as 1|2|3|4|5} size="sm" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(insp.inspection_date).toLocaleDateString(locale === "en" ? "en-US" : "fi-FI")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {insp.inspector_name || t("propertyDetail.noInspector")} &bull; {insp.status}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold mb-2">{t("inspections.emptyTitle")}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("propertyDetail.noInspectionsDescription")}
              </p>
              <Link href={`/app/kuntoarviot/new?building_id=${property.id}`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("propertyComponents.startInspection")}
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* Huoneistot/Tilat Tab */}
        <TabsContent value="huoneistot" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold">
                {hasApartments ? t("propertyDetail.apartmentsLabel") : t("propertyDetail.spacesLabel")}
              </h3>
              <p className="text-sm text-muted-foreground">{subSpaces.length} {t("dashboard.piecesSuffix")}</p>
            </div>
            <Link href={`/app/properties/${property.id}/tilat/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("common.add")} {hasApartments ? t("propertyDetail.apartmentSingular") : t("propertyDetail.spaceSingular")}
              </Button>
            </Link>
          </div>

          {subSpaces.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(subSpacesByFloor)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([floor, spaces]) => (
                  <div key={floor}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      {floor === "0" ? t("propertyDetail.basement") : `${floor}${t("propertyDetail.floorSuffix")}`}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {spaces.map((space) => (
                        <div key={space.id} className="group rounded-xl border border-border/50 bg-card p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{space.number}</span>
                                {space.overall_condition && (
                                  <ConditionBadge score={space.overall_condition as 1|2|3|4|5} size="sm" />
                                )}
                              </div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                {space.type && <span className="capitalize">{space.type}</span>}
                                {space.square_meters && <span> &bull; {space.square_meters} m²</span>}
                              </div>
                              {space.notes && (
                                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{space.notes}</p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/app/kuntoarviot/new?building_id=${space.id}`}>
                                    <ClipboardCheck className="h-4 w-4 mr-2" />
                                    {t("propertyDetail.doInspection")}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/app/properties/${property.id}/tilat/${space.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t("common.edit")}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteSubSpace(space.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("common.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
              <LayoutGrid className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold mb-2">
                {t("propertyDetail.noPrefix")} {hasApartments ? t("propertyDetail.apartmentsPlural") : t("propertyDetail.spacesPlural")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("propertyDetail.addPropertyPrefix")} {hasApartments ? t("propertyDetail.apartmentsLabel").toLowerCase() : t("propertyDetail.spacesLabel").toLowerCase()} {t("propertyDetail.addToTrackSuffix")}
              </p>
              <Link href={`/app/properties/${property.id}/tilat/new`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("propertyDetail.addFirstPrefix")} {hasApartments ? t("propertyDetail.apartmentSingular") : t("propertyDetail.spaceSingular")}
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* Kuntoluokka Tab */}
        <TabsContent value="kuntoluokka" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">{t("propertyDetail.conditionClassLabel")}</h3>
              {kuntoluokka > 0 ? (
                <>
                  <div className="flex items-end gap-4">
                    <div className={`font-heading text-5xl font-bold ${getKlaColor(kuntoluokka)}`}>
                      {kuntoluokka}%
                    </div>
                    <div className="pb-1 text-sm text-muted-foreground">
                      {kuntoluokka >= 75 ? t("propertyDetail.condExcellentDesc") : kuntoluokka >= 60 ? t("propertyDetail.condSatisfactoryDesc") : t("propertyDetail.condPoorDesc")}
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${kuntoluokka >= 75 ? "bg-emerald-400" : kuntoluokka >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${Math.min(kuntoluokka, 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>60%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("propertyDetail.doInspectionToSeeClass")}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">{t("propertyDetail.inspectionInfoTitle")}</h3>
              {inspections.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("propertyComponents.latestInspection")}</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(inspections[0].inspection_date).toLocaleDateString(locale === "en" ? "en-US" : "fi-FI")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("inspectionDetail.inspectorLabel")}</p>
                      <p className="text-sm font-medium text-foreground">
                        {inspections[0].inspector_name || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("propertyDetail.totalInspectionsLabel")}</p>
                      <p className="text-sm font-medium text-foreground">{inspections.length} {t("dashboard.piecesSuffix")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("propertyDetail.noInspectionsShort")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Komponenttikohtaiset arviot - johdettu perustiedoista + RT-standardeista */}
          {planItems.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold text-foreground">{t("propertyDetail.componentConditionTitle")}</h3>
                {categoryEvaluations.length === 0 && (
                  <Badge variant="outline" className="text-xs">{t("propertyDetail.rtEstimateBadge")}</Badge>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {planItems
                  .slice()
                  .sort((a, b) => a.conditionScore - b.conditionScore)
                  .map(item => {
                    const scorePercent = (item.conditionScore / 5) * 100
                    return (
                      <div key={item.categoryStringId} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{item.categoryName}</span>
                          <ConditionBadge score={item.conditionScore as 1|2|3|4|5} size="sm" />
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${
                              scorePercent >= 80 ? "bg-emerald-400" : 
                              scorePercent >= 60 ? "bg-lime-400" : 
                              scorePercent >= 40 ? "bg-amber-400" : "bg-red-400"
                            }`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                        {item.urgency !== '5_10v' && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("propertyDetail.urgencyPrefix")} {getUrgencyLabel(item.urgency)}
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Korjausvelka Tab */}
        <TabsContent value="korjausvelka" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">{t("propertyDetail.repairDebtSummaryTitle")}</h3>
              {korjausVelka > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("propertyDetail.totalRepairDebtLabel")}</span>
                      <span className="font-heading font-bold text-amber-400">{formatEur(korjausVelka)}</span>
                    </div>
                    {property.area_m2 && (
                      <p className="mt-0.5 text-right text-xs text-muted-foreground">
                        {formatEur(korjausVelka / property.area_m2)}/m²
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("propertyDetail.maintenanceNeedLabel")}</span>
                      <span className="text-foreground">{formatEur(korjausVelka * 0.35)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("propertyDetail.majorRepairNeedLabel")}</span>
                      <span className="text-foreground">{formatEur(korjausVelka * 0.42)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("propertyDetail.developmentNeedLabel")}</span>
                      <span className="text-foreground">{formatEur(korjausVelka * 0.23)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {kuntoluokka > 0 
                      ? t("propertyDetail.noSignificantDebt")
                      : t("propertyDetail.doInspectionToSeeDebt")}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold text-foreground">{t("propertyDetail.targetPlanTitle")}</h3>
                <Link href={`/app/properties/${property.id}/tavoitesuunnittelu`} className="text-xs text-primary hover:underline">
                  {t("propertyDetail.fullPtsLink")}
                </Link>
              </div>
              {planRepairItems.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">{t("propertyDetail.estimatedCostsOrderedLabel")}</p>
                  {planRepairItems
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.categoryStringId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getUrgencyDot(item.urgency)}`} />
                          <span className="text-sm">{item.categoryName}</span>
                        </div>
                        <span className="text-sm font-medium">{formatEur(item.cost)}</span>
                      </div>
                    ))}
                  <Link href={`/app/properties/${property.id}/tavoitesuunnittelu`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Target className="h-4 w-4 mr-2" />
                      {t("propertyDetail.openTargetPlan")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("propertyDetail.noSignificantNeeds")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Komponenttikohtaiset korjaustarpeet - johdettu suunnitelmasta */}
          {planRepairItems.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">{t("propertyDetail.repairRequiredTitle")}</h3>
              <div className="space-y-2">
                {planRepairItems.map(item => (
                  <div key={item.categoryStringId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <ConditionBadge score={item.conditionScore as 1|2|3|4|5} size="sm" />
                      <p className="text-sm font-medium">{item.categoryName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getUrgencyBadge(item.urgency)}>
                        {getUrgencyLabel(item.urgency)}
                      </Badge>
                      {item.cost > 0 && (
                        <span className="text-sm font-medium text-muted-foreground">
                          {formatEur(item.cost)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
