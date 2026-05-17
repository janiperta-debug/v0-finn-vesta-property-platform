"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Inspection {
  id: string
  building_id: number
  org_id: number
  inspection_date: string
  inspector_name: string
  inspector_type: string
  status: string
  overall_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface Building {
  id: number
  name: string
  address: string | null
}

const statusLabels: Record<string, { label: string; variant: "secondary" | "default" | "destructive"; icon: typeof Clock }> = {
  draft: { label: "Luonnos", variant: "secondary", icon: Clock },
  scheduled: { label: "Ajoitettu", variant: "secondary", icon: Clock },
  in_progress: { label: "Käynnissä", variant: "secondary", icon: Clock },
  completed: { label: "Valmis", variant: "default", icon: CheckCircle },
  approved: { label: "Hyväksytty", variant: "default", icon: CheckCircle },
}

const defaultStatus = { label: "Tuntematon", variant: "secondary" as const, icon: Clock }

const inspectorTypeLabels: Record<string, string> = {
  perus: "Perustarkastus",
  laaja: "Laaja tarkastus",
  erikois: "Erikoistarkastus",
  internal: "Sisäinen tarkastus",
  external: "Ulkoinen tarkastus",
}

export default function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: inspectionId } = use(params)
  const router = useRouter()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadInspection()
  }, [inspectionId])

  const loadInspection = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      const { data: insp, error } = await supabase
        .from("inspections")
        .select("*")
        .eq("id", inspectionId)
        .single()

      if (error) throw error
      setInspection(insp)

      // Load building info
      if (insp.building_id) {
        const { data: bldg } = await supabase
          .from("buildings")
          .select("id, name, address")
          .eq("id", insp.building_id)
          .single()

        if (bldg) setBuilding(bldg)
      }
    } catch (error) {
      console.error("Load error:", error)
      toast.error("Tarkastuksen lataus epäonnistui")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Haluatko varmasti poistaa tämän tarkastuksen?")) return

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("inspections")
        .delete()
        .eq("id", inspectionId)

      if (error) throw error

      toast.success("Tarkastus poistettu")
      router.push("/app/kuntoarviot")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Poistaminen epäonnistui")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Tarkastusta ei löytynyt</h2>
        <p className="text-muted-foreground mb-4">Tarkastus on ehkä poistettu tai sitä ei ole olemassa.</p>
        <Button asChild>
          <Link href="/app/kuntoarviot">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Takaisin kuntoarvioihin
          </Link>
        </Button>
      </div>
    )
  }

  const statusInfo = statusLabels[inspection.status] || defaultStatus
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/kuntoarviot">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Kuntoarvio {building?.name ? `- ${building.name}` : ""}
              </h1>
              <Badge variant={statusInfo.variant}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {new Date(inspection.inspection_date).toLocaleDateString("fi-FI")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Poista
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tarkastuksen tiedot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Kiinteistö
              </div>
              <div className="font-medium">
                {building ? (
                  <Link 
                    href={`/app/properties/${building.id}`}
                    className="text-primary hover:underline"
                  >
                    {building.name}
                  </Link>
                ) : (
                  "Ei määritetty"
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Päivämäärä
              </div>
              <div className="font-medium">
                {new Date(inspection.inspection_date).toLocaleDateString("fi-FI")}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Tarkastaja
              </div>
              <div className="font-medium">
                {inspection.inspector_name || "-"}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                Tyyppi
              </div>
              <div className="font-medium">
                {inspectorTypeLabels[inspection.inspector_type] || inspection.inspector_type || "-"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Card */}
        <Card>
          <CardHeader>
            <CardTitle>Yleisarvosana</CardTitle>
            <CardDescription>Kiinteistön kokonaiskunto</CardDescription>
          </CardHeader>
          <CardContent>
            {inspection.overall_score ? (
              <div className="flex items-center gap-6">
                <div className="text-5xl font-bold">
                  {inspection.overall_score.toFixed(1)}
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(inspection.overall_score / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Asteikolla 1-5
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Ei arvosanaa</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {inspection.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Muistiinpanot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{inspection.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metatiedot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Luotu</span>
              <p className="font-medium">
                {new Date(inspection.created_at).toLocaleDateString("fi-FI")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Päivitetty</span>
              <p className="font-medium">
                {new Date(inspection.updated_at).toLocaleDateString("fi-FI")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">ID</span>
              <p className="font-medium font-mono text-xs">{inspection.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
