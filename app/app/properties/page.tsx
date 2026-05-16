"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus,
  Search,
  MoreHorizontal,
  Building2,
  Upload,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  Filter,
} from "lucide-react"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"
import type { ConditionScore } from "@/lib/kuntoarvio-types"

// Type matching Supabase kiinteistot schema
interface Property {
  id: number
  org_id: number
  property_id: number | null
  name: string
  address: string | null
  construction_year: number | null
  area_m2: number | null
  building_type: string | null
  usage_category: string | null
  cost_per_m2: number | null
  notes: string | null
  created_at: string
  updated_at: string
  status: string
  is_sub_building: boolean | null
  municipality: string | null
}

const buildingTypes = [
  { value: "all", label: "Kaikki tyypit" },
  { value: "kerrostalo", label: "Kerrostalo" },
  { value: "rivitalo", label: "Rivitalo" },
  { value: "omakotitalo", label: "Omakotitalo" },
  { value: "toimisto", label: "Toimistorakennus" },
  { value: "koulu", label: "Koulu" },
  { value: "paivakoti", label: "Päiväkoti" },
  { value: "liikunta", label: "Liikuntarakennus" },
  { value: "teollisuus", label: "Teollisuusrakennus" },
  { value: "varasto", label: "Varastorakennus" },
]

const conditionFilters = [
  { value: "all", label: "Kaikki kuntoluokat" },
  { value: "critical", label: "Kriittinen (1-2)" },
  { value: "attention", label: "Huomioitava (3)" },
  { value: "good", label: "Hyvä (4-5)" },
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    setLoading(true)
    const supabase = createClient()
    
    // Get user's org first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: orgUsers } = await supabase
      .from("org_users")
      .select("org_id")
      .eq("user_id", user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]
    if (!orgUser) { setLoading(false); return }

    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .eq("org_id", orgUser.org_id)
      .order("name", { ascending: true })

    if (!error && data) {
      setProperties(data)
    }
    
    setLoading(false)
  }

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.address?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === "all" || property.building_type === typeFilter
    
    // For now, no condition filtering since we don't have a condition column
    const matchesCondition = conditionFilter === "all"

    return matchesSearch && matchesType && matchesCondition
  })

  const totalSquareMeters = filteredProperties.reduce((sum, p) => sum + (p.area_m2 || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Kiinteistöt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hallitse rakennuksia ja niiden tiloja
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Upload className="h-4 w-4" />
                Tuo tiedostosta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tuo kiinteistöjä</DialogTitle>
                <DialogDescription>
                  Lataa Excel- tai CSV-tiedosto kiinteistötiedoilla. Tiedoston tulee sisältää sarakkeet: nimi, osoite, rakennusvuosi, pinta-ala.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
                  <div className="text-center">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Vedä tiedosto tähän tai klikkaa valitaksesi
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Valitse tiedosto
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Link href="/app/properties/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Lisää kiinteistö
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{filteredProperties.length}</p>
                <p className="text-sm text-muted-foreground">Kiinteistöä</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalSquareMeters.toLocaleString('fi-FI')}</p>
                <p className="text-sm text-muted-foreground">m² yhteensä</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Hae nimellä tai osoitteella..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Rakennustyyppi" />
          </SelectTrigger>
          <SelectContent>
            {buildingTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Kuntoluokka" />
          </SelectTrigger>
          <SelectContent>
            {conditionFilters.map(filter => (
              <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Ei kiinteistöjä</h3>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
              {searchQuery || typeFilter !== "all" || conditionFilter !== "all"
                ? "Hakuehdoilla ei löytynyt kiinteistöjä. Kokeile muuttaa suodattimia."
                : "Aloita lisäämällä ensimmäinen kiinteistö tai tuomalla tiedot tiedostosta."
              }
            </p>
            {!searchQuery && typeFilter === "all" && conditionFilter === "all" && (
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="h-4 w-4" />
                  Tuo tiedostosta
                </Button>
                <Link href="/app/properties/new">
                  <Button size="sm" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Lisää kiinteistö
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nimi</TableHead>
                <TableHead className="hidden sm:table-cell">Osoite</TableHead>
                <TableHead className="hidden md:table-cell">Tyyppi</TableHead>
                <TableHead className="hidden lg:table-cell">Vuosi</TableHead>
                <TableHead className="text-right">m²</TableHead>
                <TableHead className="text-center">Kunto</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Tilat</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => {
                return (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">
                    <Link href={`/app/properties/${property.id}`} className="hover:text-primary">
                      {property.name || '-'}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {property.address || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="capitalize">
                      {property.building_type || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {property.construction_year || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {property.area_m2?.toLocaleString('fi-FI') || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <ConditionBadge score={3} size="sm" />
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <span className="text-muted-foreground">-</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/app/properties/${property.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Näytä
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/app/properties/${property.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Muokkaa
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Poista
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Link key={property.id} href={`/app/properties/${property.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{property.name || '-'}</h3>
                      <p className="text-sm text-muted-foreground truncate">{property.address || '-'}</p>
                    </div>
                    <ConditionBadge score={3} size="sm" />
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{property.construction_year || '-'}</span>
                    <span>{property.area_m2?.toLocaleString('fi-FI') || '-'} m²</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
