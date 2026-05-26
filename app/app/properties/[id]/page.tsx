"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { categories } from "@/lib/kuntoarvio-data"
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

const buildingTypeLabels: Record<string, string> = {
  kerrostalo: "Kerrostalo",
  rivitalo: "Rivitalo",
  paritalo: "Paritalo",
  omakotitalo: "Omakotitalo",
  toimisto: "Toimistorakennus",
  koulu: "Koulu / Päiväkoti",
  liikunta: "Liikuntarakennus",
  teollisuus: "Teollisuusrakennus",
  muu: "Muu",
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

const formatEur = (value: number) => 
  new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
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
      toast.error("Kiinteistön lataus epäonnistui")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubSpace = async (subSpaceId: string) => {
    if (!confirm("Haluatko varmasti poistaa tämän tilan?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("buildings")
        .delete()
        .eq("id", parseInt(subSpaceId))

      if (error) throw error

      toast.success("Tila poistettu")
      loadProperty()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Poisto epäonnistui")
    }
  }

  const handleDeleteProperty = async () => {
    if (!confirm("Haluatko varmasti poistaa tämän kiinteistön ja kaikki sen tiedot?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("buildings")
        .delete()
        .eq("id", parseInt(propertyId))

      if (error) throw error

      toast.success("Kiinteistö poistettu")
      router.push("/app/properties")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Poisto epäonnistui")
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
        <h2 className="text-xl font-semibold mb-2">Kiinteistöä ei löytynyt</h2>
        <p className="text-muted-foreground mb-6">Kiinteistöä ei ole olemassa tai sinulla ei ole oikeuksia siihen.</p>
        <Button asChild>
          <Link href="/app/properties">Takaisin listaan</Link>
        </Button>
      </div>
    )
  }

  // Calculate some demo values (replace with real data when available)
  const kuntoluokka = inspections.length > 0 && inspections[0].overall_score 
    ? Math.round(inspections[0].overall_score * 20) 
    : 0
  const jalleenhankintaArvo = (property.area_m2 || 0) * (property.cost_per_m2 || 2500)
  const tekninenArvo = jalleenhankintaArvo * (kuntoluokka / 100 || 0.7)
  const korjausVelka = jalleenhankintaArvo - tekninenArvo

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
              Kuntoarvio
            </Button>
          </Link>
          <Link href={`/app/properties/${property.id}/tavoitesuunnittelu`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Tavoitesuunnittelu
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
                  Muokkaa tietoja
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDeleteProperty}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Poista kiinteistö
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
            Rakennusvuosi
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">
            {property.construction_year || "-"}
          </p>
          {property.construction_year && (
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date().getFullYear() - property.construction_year} vuotta vanha
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Ruler className="h-3.5 w-3.5" />
            Pinta-ala
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">
            {property.area_m2 ? `${property.area_m2.toLocaleString("fi-FI")} m²` : "-"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {subSpaces.length} tilaa/huoneistoa
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Jälleenhankinta-arvo
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
            Tekninen arvo
          </div>
          <p className={`font-heading text-2xl font-bold ${kuntoluokka > 0 ? getKlaColor(kuntoluokka) : ''}`}>
            {tekninenArvo > 0 ? formatEur(tekninenArvo) : "-"}
          </p>
          {kuntoluokka > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Kuntoluokka {kuntoluokka}%
            </p>
          )}
        </div>
      </div>

      {/* Tabs for different views - similar to demo */}
      <Tabs defaultValue="kuntoarvio" className="space-y-4">
        <TabsList className="bg-muted/50 w-full overflow-x-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="kuntoarvio" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Kuntoarvio
          </TabsTrigger>
          <TabsTrigger value="huoneistot" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            {hasApartments ? "Huoneistot" : "Tilat"}
            {subSpaces.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                {subSpaces.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="kuntoluokka" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Kuntoluokka
          </TabsTrigger>
          <TabsTrigger value="korjausvelka" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Korjausvelka
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
                    <h3 className="font-heading text-base font-semibold text-foreground mb-4">Viimeisin arviointi</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Yleisarvosana</p>
                        <div className="flex items-center gap-2 mt-1">
                          {inspections[0].overall_score && (
                            <ConditionBadge score={Math.round(inspections[0].overall_score) as 1|2|3|4|5} />
                          )}
                          <span className="font-medium">{inspections[0].overall_score?.toFixed(1) || "-"} / 5</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tarkastaja</p>
                        <p className="font-medium mt-1">{inspections[0].inspector_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Päivämäärä</p>
                        <p className="font-medium mt-1">
                          {new Date(inspections[0].inspection_date).toLocaleDateString("fi-FI")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link href={`/app/kuntoarviot/${inspections[0].id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      Avaa arviointi
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Category evaluations from latest inspection */}
              {categoryEvaluations.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <h3 className="font-heading text-base font-semibold text-foreground mb-4">
                    Rakennusosien kunto
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryEvaluations
                      .filter(e => e.score !== null)
                      .sort((a, b) => (a.score || 0) - (b.score || 0))
                      .slice(0, 9)
                      .map(evaluation => {
                        const category = categories.find(c => String(c.id) === String(evaluation.category_id))
                        return (
                          <div key={evaluation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <ConditionBadge score={evaluation.score as 1|2|3|4|5} size="sm" />
                              <div>
                                <p className="text-sm font-medium">{category?.name || `Kategoria ${evaluation.category_id}`}</p>
                                {evaluation.urgency && (
                                  <p className="text-xs text-muted-foreground">
                                    {evaluation.urgency === 'immediate' ? 'Välitön' : 
                                     evaluation.urgency === 'soon' ? '1-2v' : 
                                     evaluation.urgency === 'planned' ? '3-5v' : 'Seuranta'}
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
                        Näytä kaikki {categoryEvaluations.filter(e => e.score !== null).length} kategoriaa
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* All inspections list */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    Kaikki arvioinnit ({inspections.length})
                  </h3>
                  <Link href={`/app/kuntoarviot/new?building_id=${property.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Uusi arviointi
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
                            {new Date(insp.inspection_date).toLocaleDateString("fi-FI")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {insp.inspector_name || "Ei tarkastajaa"} &bull; {insp.status}
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
              <h3 className="font-heading text-lg font-semibold mb-2">Ei kuntoarvioita</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Tee ensimmäinen kuntoarvio nähdäksesi kiinteistön kunnon ja korjaustarpeet.
              </p>
              <Link href={`/app/kuntoarviot/new?building_id=${property.id}`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Aloita kuntoarvio
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
                {hasApartments ? "Huoneistot" : "Tilat"}
              </h3>
              <p className="text-sm text-muted-foreground">{subSpaces.length} kpl</p>
            </div>
            <Link href={`/app/properties/${property.id}/tilat/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Lisää {hasApartments ? "huoneisto" : "tila"}
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
                      {floor === "0" ? "Kellari" : `${floor}. kerros`}
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
                                    Tee tarkastus
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/app/properties/${property.id}/tilat/${space.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Muokkaa
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteSubSpace(space.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Poista
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
                Ei {hasApartments ? "huoneistoja" : "tiloja"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Lisää kiinteistön {hasApartments ? "huoneistot" : "tilat"} seurataksesi niiden kuntoa erikseen.
              </p>
              <Link href={`/app/properties/${property.id}/tilat/new`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Lisää ensimmäinen {hasApartments ? "huoneisto" : "tila"}
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* Kuntoluokka Tab */}
        <TabsContent value="kuntoluokka" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Kuntoluokka</h3>
              {kuntoluokka > 0 ? (
                <>
                  <div className="flex items-end gap-4">
                    <div className={`font-heading text-5xl font-bold ${getKlaColor(kuntoluokka)}`}>
                      {kuntoluokka}%
                    </div>
                    <div className="pb-1 text-sm text-muted-foreground">
                      {kuntoluokka >= 75 ? "Erinomainen kunto" : kuntoluokka >= 60 ? "Tyydyttävä kunto" : "Heikko kunto - toimenpiteitä tarvitaan"}
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
                  <p className="text-muted-foreground">Tee kuntoarvio nähdäksesi kuntoluokka</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Tarkastustiedot</h3>
              {inspections.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Viimeisin tarkastus</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(inspections[0].inspection_date).toLocaleDateString("fi-FI")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tarkastaja</p>
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
                      <p className="text-xs text-muted-foreground">Tarkastuksia yhteensä</p>
                      <p className="text-sm font-medium text-foreground">{inspections.length} kpl</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Ei tarkastuksia</p>
                </div>
              )}
            </div>
          </div>

          {/* Komponenttikohtaiset arviot */}
          {categoryEvaluations.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Rakennusosien kunto</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoryEvaluations
                  .filter(e => e.score !== null)
                  .sort((a, b) => (a.score || 5) - (b.score || 5))
                  .map(evaluation => {
                    const category = categories.find(c => String(c.id) === String(evaluation.category_id))
                    const scorePercent = ((evaluation.score || 3) / 5) * 100
                    return (
                      <div key={evaluation.id} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{category?.name || `Kategoria ${evaluation.category_id}`}</span>
                          <ConditionBadge score={evaluation.score as 1|2|3|4|5} size="sm" />
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
                        {evaluation.urgency && evaluation.urgency !== 'monitoring' && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Kiireellisyys: {evaluation.urgency === 'immediate' ? 'Välitön' : 
                              evaluation.urgency === 'soon' ? '1-2 vuotta' : '3-5 vuotta'}
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
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Korjausvelka yhteenveto</h3>
              {korjausVelka > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Korjausvelka yhteensä</span>
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
                      <span className="text-muted-foreground">Kunnossapitotarve</span>
                      <span className="text-foreground">{formatEur(korjausVelka * 0.35)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Peruskorjaustarve</span>
                      <span className="text-foreground">{formatEur(korjausVelka * 0.42)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Kehitys- ja muutostarve</span>
                      <span className="text-foreground">{formatEur(korjausVelka * 0.23)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {kuntoluokka > 0 
                      ? "Ei merkittävää korjausvelkaa" 
                      : "Tee kuntoarvio nähdäksesi korjausvelka"}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Tavoitesuunnitelma</h3>
              {categoryEvaluations.filter(e => e.cost_estimate && e.cost_estimate > 0).length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">Arvioidut korjauskustannukset kiireellisyysjärjestyksessä:</p>
                  {categoryEvaluations
                    .filter(e => e.cost_estimate && e.cost_estimate > 0)
                    .sort((a, b) => {
                      const urgencyOrder = { 'immediate': 0, 'soon': 1, 'planned': 2, 'monitoring': 3 }
                      return (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 3) - 
                             (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 3)
                    })
                    .slice(0, 5)
                    .map(evaluation => {
                      const category = categories.find(c => String(c.id) === String(evaluation.category_id))
                      return (
                        <div key={evaluation.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              evaluation.urgency === 'immediate' ? 'bg-red-500' : 
                              evaluation.urgency === 'soon' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            <span className="text-sm">{category?.name || `Kategoria ${evaluation.category_id}`}</span>
                          </div>
                          <span className="text-sm font-medium">{formatEur(evaluation.cost_estimate || 0)}</span>
                        </div>
                      )
                    })}
                  <Link href={`/app/timeline/new?building=${property.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Lis��ä PTS-suunnitelmaan
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {inspections.length > 0 
                      ? "Ei arvioituja korjauskustannuksia" 
                      : "Tee kuntoarvio nähdäksesi tavoitesuunnitelma"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Komponenttikohtaiset korjaustarpeet */}
          {categoryEvaluations.filter(e => e.score && e.score <= 3).length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Korjausta vaativat kohteet</h3>
              <div className="space-y-2">
                {categoryEvaluations
                  .filter(e => e.score && e.score <= 3)
                  .sort((a, b) => (a.score || 5) - (b.score || 5))
                  .map(evaluation => {
                    const category = categories.find(c => String(c.id) === String(evaluation.category_id))
                    return (
                      <div key={evaluation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <ConditionBadge score={evaluation.score as 1|2|3|4|5} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{category?.name || `Kategoria ${evaluation.category_id}`}</p>
                            {evaluation.comment && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{evaluation.comment}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {evaluation.urgency && (
                            <Badge variant="outline" className={
                              evaluation.urgency === 'immediate' ? 'border-red-500 text-red-500' : 
                              evaluation.urgency === 'soon' ? 'border-amber-500 text-amber-500' : ''
                            }>
                              {evaluation.urgency === 'immediate' ? 'Välitön' : 
                               evaluation.urgency === 'soon' ? '1-2v' : 
                               evaluation.urgency === 'planned' ? '3-5v' : 'Seuranta'}
                            </Badge>
                          )}
                          {evaluation.cost_estimate && evaluation.cost_estimate > 0 && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {formatEur(evaluation.cost_estimate)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
