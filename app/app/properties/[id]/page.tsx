"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Settings,
  MoreHorizontal
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

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [subSpaces, setSubSpaces] = useState<SubSpace[]>([])
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
        .eq("id", propertyId)
        .single()

      if (propError) throw propError
      setProperty(prop)

      // Load sub-spaces (child buildings where property_id = this building)
      const { data: spaces, error: spacesError } = await supabase
        .from("buildings")
        .select("*")
        .eq("property_id", parseInt(propertyId))
        .eq("is_sub_building", true)
        .order("name", { ascending: true })

      if (!spacesError && spaces) {
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
        .eq("id", subSpaceId)

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
        .eq("id", propertyId)

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

  // Group sub-spaces by floor
  const subSpacesByFloor = subSpaces.reduce((acc, space) => {
    const floor = space.floor
    if (!acc[floor]) acc[floor] = []
    acc[floor].push(space)
    return acc
  }, {} as Record<number, SubSpace[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/properties">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-foreground">{property.name}</h1>
              <Badge variant="outline">{buildingTypeLabels[property.building_type ?? ''] || property.building_type || '-'}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {property.address}{property.municipality && `, ${property.municipality}`}
              </span>
              {property.construction_year && property.construction_year > 0 && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {property.construction_year}
                </span>
              )}
              {property.area_m2 && property.area_m2 > 0 && (
                <span className="flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5" />
                  {property.area_m2.toLocaleString("fi-FI")} m²
                </span>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
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
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Asetukset
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

      {/* Main content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full overflow-x-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="h-4 w-4" />
            Yleiskatsaus
          </TabsTrigger>
          <TabsTrigger value="subspaces" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Tilat
            {subSpaces.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {subSpaces.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="kuntoarvio" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Kuntoarvio
          </TabsTrigger>
          <TabsTrigger value="historia" className="gap-2">
            <History className="h-4 w-4" />
            Historia
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Kiinteistön tiedot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <span className="text-muted-foreground">Tyyppi</span>
                  <span className="font-medium">{buildingTypeLabels[property.building_type || ''] || property.building_type || '-'}</span>
                  {property.construction_year && property.construction_year > 0 && (
                    <>
                      <span className="text-muted-foreground">Rakennusvuosi</span>
                      <span className="font-medium">{property.construction_year}</span>
                    </>
                  )}
                  {property.area_m2 && property.area_m2 > 0 && (
                    <>
                      <span className="text-muted-foreground">Pinta-ala</span>
                      <span className="font-medium">{property.area_m2.toLocaleString("fi-FI")} m²</span>
                    </>
                  )}
                  {property.usage_category && (
                    <>
                      <span className="text-muted-foreground">Käyttöluokka</span>
                      <span className="font-medium">{property.usage_category}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Alatilat</span>
                  <span className="font-medium">{property.is_sub_building ? `${subSpaces.length} kpl` : "Ei jaettu"}</span>
                </div>
                {property.notes && (
                  <div className="pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Lisätiedot</span>
                    <p className="mt-1 text-sm">{property.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Yhteenveto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">-</p>
                    <p className="text-xs text-muted-foreground">Kuntoluokka</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-xs text-muted-foreground">Korjausvelka</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">{subSpaces.length}</p>
                    <p className="text-xs text-muted-foreground">Huoneistoa</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-xs text-muted-foreground">Tarkastuksia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sub-spaces Tab - show if there are sub-spaces OR always allow adding */}
        <TabsContent value="subspaces" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Huoneistot ja tilat</h3>
              <p className="text-sm text-muted-foreground">
                {subSpaces.length} tilaa
              </p>
            </div>
            <Button asChild>
              <Link href={`/app/properties/${property.id}/tilat/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Lisää tila
              </Link>
            </Button>
          </div>

          {subSpaces.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <LayoutGrid className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">Ei tiloja vielä</p>
                <Button asChild>
                  <Link href={`/app/properties/${property.id}/tilat/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Lisää ensimmäinen tila
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                          <Card key={space.id} className="group">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{space.number}</span>
                                    {space.overall_condition && (
                                      <ConditionBadge score={space.overall_condition as 1|2|3|4|5} size="sm" />
                                    )}
                                  </div>
                                  <div className="mt-1 text-sm text-muted-foreground">
                                    {space.rooms && <span>{space.rooms}</span>}
                                    {space.square_meters && <span> &bull; {space.square_meters} m²</span>}
                                  </div>
                                  {space.tenant && (
                                    <Badge variant="secondary" className="mt-2 text-xs">
                                      Vuokrattu
                                    </Badge>
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
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

        {/* Kuntoarvio Tab */}
        <TabsContent value="kuntoarvio">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">Kuntoarvioita ei vielä tehty</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Aloita kuntoarvio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historia Tab */}
        <TabsContent value="historia">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Ei historiatietoja</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
