"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Trash2,
  Save,
  X,
  ClipboardList,
  BarChart3,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CategoryGrid, CategorySummaryStats } from "@/components/kuntoarvio/category-card"
import { EvaluationForm, EvaluationProgress } from "@/components/kuntoarvio/evaluation-form"
import { allCategoryIds } from "@/lib/kuntoarvio-data"
import type { CategoryEvaluation } from "@/lib/kuntoarvio-types"

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
  building_type: string | null
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
  property_manager: "Kiinteistöpäällikkö",
}

export default function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: inspectionId } = use(params)
  const router = useRouter()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("arviointi")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryEvaluations, setCategoryEvaluations] = useState<CategoryEvaluation[]>([])
  
  const [editForm, setEditForm] = useState({
    inspector_name: "",
    inspection_date: "",
    inspector_type: "",
    overall_score: "",
    notes: "",
    status: "",
  })

  useEffect(() => {
    loadInspection()
    loadCategoryEvaluations()
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
      
      setEditForm({
        inspector_name: insp.inspector_name || "",
        inspection_date: insp.inspection_date || "",
        inspector_type: insp.inspector_type || "",
        overall_score: insp.overall_score?.toString() || "",
        notes: insp.notes || "",
        status: insp.status || "draft",
      })

      if (insp.building_id) {
        const { data: bldg } = await supabase
          .from("buildings")
          .select("id, name, address, building_type")
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

  const loadCategoryEvaluations = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("category_evaluations")
        .select("*")
        .eq("inspection_id", inspectionId)

      if (data) {
        setCategoryEvaluations(data.map((e: any) => ({
          categoryId: String(e.category_id),
          date: new Date().toISOString().split('T')[0],
          mode: e.mode || 'basic',
          overallScore: e.score,
          notes: e.comment,
        })))
      }
    } catch (error) {
      console.error("Load evaluations error:", error)
    }
  }

  const handleSaveEvaluation = async (evaluation: CategoryEvaluation) => {
    try {
      const supabase = createClient()
      
      // Check if exists
      const { data: existing } = await supabase
        .from("category_evaluations")
        .select("id")
        .eq("inspection_id", inspectionId)
        .eq("category_id", parseInt(evaluation.categoryId))
        .single()

      if (existing) {
        await supabase
          .from("category_evaluations")
          .update({
            score: evaluation.overallScore,
            mode: evaluation.mode,
            comment: evaluation.notes || null,
          })
          .eq("id", existing.id)
      } else {
        await supabase
          .from("category_evaluations")
          .insert({
            inspection_id: inspectionId,
            category_id: parseInt(evaluation.categoryId),
            score: evaluation.overallScore,
            mode: evaluation.mode,
            comment: evaluation.notes || null,
            is_applicable: true,
            is_migrated: false,
          })
      }

      // Update local state
      setCategoryEvaluations(prev => {
        const idx = prev.findIndex(e => e.categoryId === evaluation.categoryId)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = evaluation
          return updated
        }
        return [...prev, evaluation]
      })

      // Calculate and update overall score
      const allEvals = [...categoryEvaluations.filter(e => e.categoryId !== evaluation.categoryId), evaluation]
      if (allEvals.length > 0) {
        const avgScore = allEvals.reduce((sum, e) => sum + e.overallScore, 0) / allEvals.length
        await supabase
          .from("inspections")
          .update({ overall_score: avgScore, status: 'in_progress' })
          .eq("id", inspectionId)
        
        setInspection(prev => prev ? { ...prev, overall_score: avgScore, status: 'in_progress' } : null)
      }

      setSelectedCategory(null)
      toast.success("Arvio tallennettu")
    } catch (error) {
      console.error("Save evaluation error:", error)
      toast.error("Tallentaminen epäonnistui")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      
      const updateData = {
        inspector_name: editForm.inspector_name || "-",
        inspection_date: editForm.inspection_date,
        inspector_type: editForm.inspector_type || null,
        overall_score: editForm.overall_score ? parseFloat(editForm.overall_score) : null,
        notes: editForm.notes || null,
        status: editForm.status,
      }
      
      const { error } = await supabase
        .from("inspections")
        .update(updateData)
        .eq("id", inspectionId)

      if (error) throw error

      toast.success("Tarkastus tallennettu")
      setIsEditing(false)
      loadInspection()
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Tallentaminen epäonnistui")
    } finally {
      setSaving(false)
    }
  }

  const handleMarkComplete = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("inspections")
        .update({ status: "completed" })
        .eq("id", inspectionId)

      if (error) throw error

      toast.success("Tarkastus merkitty valmiiksi")
      loadInspection()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Toiminto epäonnistui")
    } finally {
      setSaving(false)
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
  const isIncomplete = ["draft", "scheduled", "in_progress"].includes(inspection.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/kuntoarviot">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold">
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
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Peruuta
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Tallennetaan..." : "Tallenna"}
              </Button>
            </>
          ) : (
            <>
              {isIncomplete && (
                <Button variant="default" onClick={handleMarkComplete} disabled={saving}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Merkitse valmiiksi
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Muokkaa
              </Button>
              <Button variant="outline" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Poista
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <EvaluationProgress
            total={allCategoryIds.length}
            completed={categoryEvaluations.length}
            thorough={categoryEvaluations.filter(e => e.mode === 'thorough').length}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="arviointi" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Arviointi
          </TabsTrigger>
          <TabsTrigger value="tiedot" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Tiedot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arviointi" className="space-y-6">
          {selectedCategory ? (
            <EvaluationForm
              categoryId={selectedCategory}
              existingEvaluation={categoryEvaluations.find(e => e.categoryId === selectedCategory)}
              onSave={handleSaveEvaluation}
              onCancel={() => setSelectedCategory(null)}
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Kategoriat</CardTitle>
                  <CardDescription>
                    Valitse kategoria arvioidaksesi. Arvioituja: {categoryEvaluations.length} / {allCategoryIds.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryGrid
                    categoryIds={allCategoryIds}
                    evaluations={categoryEvaluations}
                    onCategoryClick={setSelectedCategory}
                    selectedCategoryId={selectedCategory || undefined}
                  />
                </CardContent>
              </Card>

              {categoryEvaluations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Yhteenveto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategorySummaryStats
                      evaluations={categoryEvaluations}
                      totalCategories={allCategoryIds.length}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="tiedot" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tarkastuksen tiedot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tarkastaja</Label>
                      <Input
                        value={editForm.inspector_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, inspector_name: e.target.value }))}
                        placeholder="Tarkastajan nimi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Päivämäärä</Label>
                      <Input
                        type="date"
                        value={editForm.inspection_date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, inspection_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tyyppi</Label>
                      <Select
                        value={editForm.inspector_type}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, inspector_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Valitse tyyppi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="perus">Perustarkastus</SelectItem>
                          <SelectItem value="laaja">Laaja tarkastus</SelectItem>
                          <SelectItem value="erikois">Erikoistarkastus</SelectItem>
                          <SelectItem value="internal">Sisäinen tarkastus</SelectItem>
                          <SelectItem value="external">Ulkoinen tarkastus</SelectItem>
                          <SelectItem value="property_manager">Kiinteistöpäällikkö</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tila</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Valitse tila" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Luonnos</SelectItem>
                          <SelectItem value="in_progress">Käynnissä</SelectItem>
                          <SelectItem value="completed">Valmis</SelectItem>
                          <SelectItem value="approved">Hyväksytty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle>Yleisarvosana</CardTitle>
                <CardDescription>Kiinteistön kokonaiskunto</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Arvosana (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={editForm.overall_score}
                        onChange={(e) => setEditForm(prev => ({ ...prev, overall_score: e.target.value }))}
                        placeholder="esim. 3.5"
                      />
                    </div>
                    {editForm.overall_score && (
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(parseFloat(editForm.overall_score) / 5) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : inspection.overall_score ? (
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
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">Ei arvosanaa vielä</p>
                    <p className="text-xs text-muted-foreground">Arvosana lasketaan automaattisesti kategorioiden keskiarvosta</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Muistiinpanot</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Kirjoita muistiinpanoja tarkastuksesta..."
                  rows={4}
                />
              ) : inspection.notes ? (
                <p className="whitespace-pre-wrap">{inspection.notes}</p>
              ) : (
                <p className="text-muted-foreground italic">Ei muistiinpanoja</p>
              )}
            </CardContent>
          </Card>

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
                  <p className="font-medium font-mono text-xs truncate">{inspection.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
