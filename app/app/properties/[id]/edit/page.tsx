"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Plus, Trash2, Sparkles, Info } from "lucide-react"
import { toast } from "sonner"
import { 
  componentLifespans, 
  generateInitialAssessment, 
  calculateOverallCondition,
  calculateTotalRepairDebt,
  type BuildingStructureData 
} from "@/lib/rt-standards"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"

const buildingTypes = [
  { value: "kerrostalo", label: "Kerrostalo" },
  { value: "rivitalo", label: "Rivitalo" },
  { value: "paritalo", label: "Paritalo" },
  { value: "omakotitalo", label: "Omakotitalo" },
  { value: "toimisto", label: "Toimistorakennus" },
  { value: "koulu", label: "Koulu / Päiväkoti" },
  { value: "liikunta", label: "Liikuntarakennus" },
  { value: "teollisuus", label: "Teollisuusrakennus" },
  { value: "muu", label: "Muu" },
]

const spaceTypes = [
  { value: "apartment", label: "Asunto" },
  { value: "office", label: "Toimisto" },
  { value: "commercial", label: "Liiketila" },
  { value: "classroom", label: "Luokkahuone" },
  { value: "kitchen", label: "Keittiö" },
  { value: "gym", label: "Liikuntasali" },
  { value: "meeting", label: "Neuvotteluhuone" },
  { value: "technical", label: "Tekninen tila" },
  { value: "storage", label: "Varasto" },
  { value: "parking", label: "Autopaikka" },
  { value: "sauna", label: "Sauna" },
  { value: "laundry", label: "Pesutupa" },
  { value: "common", label: "Yhteistila" },
  { value: "other", label: "Muu tila" },
]

interface SubSpace {
  id: string
  number: string
  floor: number
  squareMeters: number
  type: string
  notes: string
  isNew?: boolean
}

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubSpaces, setHasSubSpaces] = useState(false)
  const [subSpaces, setSubSpaces] = useState<SubSpace[]>([])
  const [previewAssessment, setPreviewAssessment] = useState<ReturnType<typeof generateInitialAssessment> | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    postalCode: "",
    city: "",
    buildingType: "",
    buildYear: "",
    squareMeters: "",
    floors: "",
    notes: "",
  })

  // Structure data for RT assessment
  const [structures, setStructures] = useState<BuildingStructureData>({
    foundation: "",
    frame: "",
    facade: "",
    roof: "",
    windows: "",
    heating: "",
    ventilation: "",
    plumbing: "",
    electrical: "",
    elevator: "ei",
  })

  useEffect(() => {
    async function loadProperty() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .eq("id", propertyId)
        .single()

      if (error || !data) {
        toast.error("Kiinteistöä ei löytynyt")
        router.push("/app/properties")
        return
      }

      // Parse notes field which may contain JSON with structure data
      let userNotes = data.notes || ""
      let savedStructures: BuildingStructureData | null = null
      
      if (data.notes) {
        try {
          const parsed = JSON.parse(data.notes)
          if (parsed.userNotes !== undefined) {
            userNotes = parsed.userNotes
          }
          if (parsed.structures) {
            savedStructures = parsed.structures
          }
        } catch {
          // notes is plain text, not JSON
          userNotes = data.notes
        }
      }

      setFormData({
        name: data.name || "",
        address: data.address || "",
        postalCode: "",
        city: data.municipality || "",
        buildingType: data.building_type || "",
        buildYear: data.construction_year ? String(data.construction_year) : "",
        squareMeters: data.area_m2 ? String(data.area_m2) : "",
        floors: "",
        notes: userNotes,
      })

      // Load saved structure data if exists
      if (savedStructures) {
        setStructures(savedStructures)
      }

      // Load existing sub-spaces
      const { data: spaces } = await supabase
        .from("buildings")
        .select("*")
        .eq("property_id", parseInt(propertyId))

      if (spaces && spaces.length > 0) {
        setHasSubSpaces(true)
        setSubSpaces(spaces.map(s => ({
          id: String(s.id),
          number: s.name || "",
          floor: 1,
          squareMeters: s.area_m2 || 0,
          type: s.usage_category || "other",
          notes: s.notes || "",
        })))
      }
      
      setIsLoading(false)
    }

    loadProperty()
  }, [propertyId, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStructureChange = (field: keyof BuildingStructureData, value: string) => {
    setStructures(prev => ({ ...prev, [field]: value }))
  }

  // Preview the generated assessment
  const handlePreviewAssessment = () => {
    const buildYear = parseInt(formData.buildYear)
    const squareMeters = parseFloat(formData.squareMeters)
    
    if (!buildYear || !squareMeters) {
      toast.error("Syötä ensin rakennusvuosi ja pinta-ala")
      return
    }

    const filledStructures = Object.entries(structures).filter(([key, value]) => value && value !== 'ei').length
    if (filledStructures < 3) {
      toast.error("Valitse vähintään 3 rakennetyyppiä arvion luomiseksi")
      return
    }

    const assessment = generateInitialAssessment(buildYear, squareMeters, structures)
    setPreviewAssessment(assessment)
    toast.success("Esikatselu luotu RT-standardien perusteella")
  }

  const addSubSpace = () => {
    const newSpace: SubSpace = {
      id: `new-${Date.now()}`,
      number: "",
      floor: 1,
      squareMeters: 0,
      type: "other",
      notes: "",
      isNew: true,
    }
    setSubSpaces(prev => [...prev, newSpace])
  }

  const updateSubSpace = (id: string, field: keyof SubSpace, value: string | number) => {
    setSubSpaces(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const removeSubSpace = (id: string) => {
    setSubSpaces(prev => prev.filter(s => s.id !== id))
  }

  const generateSubSpaces = () => {
    const floors = parseInt(formData.floors) || 3
    const buildingType = formData.buildingType
    const totalArea = parseFloat(formData.squareMeters) || 0
    const generated: SubSpace[] = []
    
    let unitsPerFloor = 4
    let defaultSize = 55
    let defaultRooms = "2h+k"
    
    if (buildingType === "rivitalo") {
      unitsPerFloor = 1
      defaultSize = 85
      defaultRooms = "3h+k"
    } else if (buildingType === "paritalo") {
      unitsPerFloor = 2
      defaultSize = 75
      defaultRooms = "3h+k"
    } else if (buildingType === "omakotitalo") {
      generated.push({
        id: `new-1-1`,
        number: "A",
        floor: 1,
        squareMeters: totalArea || 120,
        type: "apartment",
        notes: "",
        isNew: true,
      })
      setSubSpaces(generated)
      setHasSubSpaces(true)
      toast.success(`Luotiin ${generated.length} tila`)
      return
    } else if (buildingType === "toimisto" || buildingType === "teollisuus") {
      unitsPerFloor = 2
      defaultSize = 150
      defaultRooms = ""
    }
    
    if (totalArea > 0) {
      const totalUnits = buildingType === "rivitalo" ? floors : floors * unitsPerFloor
      defaultSize = Math.round(totalArea / totalUnits)
    }
    
    if (buildingType === "rivitalo") {
      const numUnits = floors
      for (let unit = 1; unit <= numUnits; unit++) {
        generated.push({
          id: `new-1-${unit}`,
          number: String.fromCharCode(64 + unit),
          floor: 1,
          squareMeters: defaultSize,
          type: "apartment",
          notes: "",
          isNew: true,
        })
      }
    } else {
      for (let floor = 1; floor <= floors; floor++) {
        for (let unit = 1; unit <= unitsPerFloor; unit++) {
          generated.push({
            id: `new-${floor}-${unit}`,
            number: `${floor}${String(unit).padStart(2, '0')}`,
            floor,
            squareMeters: defaultSize,
            type: buildingType === "toimisto" || buildingType === "teollisuus" ? "commercial" : "apartment",
            notes: "",
            isNew: true,
          })
        }
      }
    }
    
    setSubSpaces(prev => [...prev, ...generated])
    setHasSubSpaces(true)
    toast.success(`Luotiin ${generated.length} tilaa`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Combine notes with structure data as JSON
      const buildingMetadata = {
        userNotes: formData.notes || '',
        structures: structures,
      }

      // Update main building
      const { error } = await supabase
        .from("buildings")
        .update({
          name: formData.name,
          address: formData.address || '',
          municipality: formData.city || null,
          building_type: formData.buildingType || null,
          construction_year: parseInt(formData.buildYear) || 0,
          area_m2: parseFloat(formData.squareMeters) || 0,
          notes: JSON.stringify(buildingMetadata),
        })
        .eq("id", propertyId)

      if (error) throw error

      // Handle sub-spaces if enabled
      if (hasSubSpaces && subSpaces.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Ei kirjautunut sisään")
        
        const { data: orgUsers } = await supabase
          .from("org_users")
          .select("org_id")
          .eq("user_id", user.id)
          .limit(1)
        
        const orgId = orgUsers?.[0]?.org_id
        if (!orgId) throw new Error("Organisaatiota ei löytynyt")

        for (const space of subSpaces) {
          if (space.isNew) {
            await supabase.from("buildings").insert({
              org_id: orgId,
              property_id: parseInt(propertyId),
              name: space.number || "Tila",
              area_m2: space.squareMeters || 0,
              usage_category: space.type,
              notes: space.notes || null,
              construction_year: parseInt(formData.buildYear) || 0,
              cost_per_m2: 0,
              status: "active",
              is_sub_building: true,
            })
          } else {
            await supabase.from("buildings").update({
              name: space.number || "Tila",
              area_m2: space.squareMeters || 0,
              usage_category: space.type,
              notes: space.notes || null,
            }).eq("id", space.id)
          }
        }
      }

      // Create new assessment if preview was generated
      if (previewAssessment && previewAssessment.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: orgUsers } = await supabase
            .from("org_users")
            .select("org_id")
            .eq("user_id", user.id)
            .limit(1)
          
          const orgId = orgUsers?.[0]?.org_id
          if (orgId) {
            // Generate assessment if not previewed
            let assessmentToSave = previewAssessment
            if (!assessmentToSave) {
              const buildYear = parseInt(formData.buildYear)
              const area = parseFloat(formData.squareMeters) || 500
              if (buildYear > 0) {
                // Use default structures if not set
                const structuresToUse: BuildingStructureData = {
                  foundation: structures.foundation || "paikallavalettu",
                  frame: structures.frame || "betoni",
                  facade: structures.facade || "rappaus",
                  roof: structures.roof || "huopa",
                  windows: structures.windows || "puu-2",
                  heating: structures.heating || "kaukolampo",
                  ventilation: structures.ventilation || "koneellinen-poisto",
                  plumbing: structures.plumbing || "kupari",
                  electrical: structures.electrical || "alkuperainen",
                  elevator: structures.elevator || "ei",
                }
                assessmentToSave = generateInitialAssessment(buildYear, area, structuresToUse)
              }
            }
            
            if (assessmentToSave && assessmentToSave.length > 0) {
              const overallScore = calculateOverallCondition(assessmentToSave)
              
              const { data: inspection, error: inspError } = await supabase
                .from("inspections")
                .insert({
                  org_id: orgId,
                  building_id: parseInt(propertyId),
                  inspection_date: new Date().toISOString().split('T')[0],
                  inspector_name: "RT-standardi (automaattinen)",
                  inspector_type: null,
                  status: 'completed',
                  overall_score: overallScore,
                  notes: `Automaattisesti generoitu kuntoarvio RT-standardien käyttöikätietojen perusteella. Rakennusvuosi: ${formData.buildYear}.`,
                })
                .select()
                .single()

              if (!inspError && inspection) {
                // Map urgency number to text for database
                const urgencyMap: Record<number, string> = {
                  1: 'immediate',
                  2: 'soon',
                  3: 'planned',
                  4: 'monitoring',
                }
                
                const categoryEvals = assessmentToSave.map(a => ({
                  inspection_id: inspection.id,
                  category_id: a.categoryId,
                  score: a.conditionScore,
                  urgency: urgencyMap[a.urgencyClass] || 'monitoring',
                  comment: a.notes,
                  cost_estimate: a.estimatedRepairCost,
                  mode: 'basic',
                  is_applicable: true,
                  is_migrated: false,
                }))

                await supabase
                  .from("category_evaluations")
                  .insert(categoryEvals)
              }
            }
          }
        }
      }

      toast.success("Kiinteistö päivitetty")
      router.push(`/app/properties/${propertyId}`)
    } catch (error: any) {
      console.error("Update error:", error)
      toast.error(error.message || "Päivitys epäonnistui")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/app/properties/${propertyId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Muokkaa kiinteistöä</h1>
          <p className="text-sm text-muted-foreground">Päivitä kiinteistön tiedot ja rakennetiedot</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Perustiedot</TabsTrigger>
            <TabsTrigger value="structures">
              Rakenteet
              {Object.values(structures).filter(v => v && v !== 'ei').length > 0 && (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {Object.values(structures).filter(v => v && v !== 'ei').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="subspaces">
              Tilat
              {subSpaces.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {subSpaces.length}
                </span>
              )}
            </TabsTrigger>
            {previewAssessment && previewAssessment.length > 0 && (
              <TabsTrigger value="preview">
                Kuntoarvio
                <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                  Esikatselu
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kiinteistön tiedot</CardTitle>
                <CardDescription>Perustiedot kiinteistöstä</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nimi *</Label>
                    <Input
                      id="name"
                      placeholder="esim. Keskustan kerrostalo"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buildingType">Rakennustyyppi</Label>
                    <Select
                      value={formData.buildingType}
                      onValueChange={(value) => handleInputChange("buildingType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Valitse tyyppi" />
                      </SelectTrigger>
                      <SelectContent>
                        {buildingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Osoite *</Label>
                    <Input
                      id="address"
                      placeholder="Esimerkkikatu 1"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Kunta</Label>
                    <Input
                      id="city"
                      placeholder="Helsinki"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="buildYear">Rakennusvuosi</Label>
                    <Input
                      id="buildYear"
                      type="number"
                      placeholder="1985"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={formData.buildYear}
                      onChange={(e) => handleInputChange("buildYear", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="squareMeters">Pinta-ala (m²)</Label>
                    <Input
                      id="squareMeters"
                      type="number"
                      placeholder="1500"
                      min="1"
                      value={formData.squareMeters}
                      onChange={(e) => handleInputChange("squareMeters", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floors">Kerroksia</Label>
                    <Input
                      id="floors"
                      type="number"
                      placeholder="3"
                      min="1"
                      max="100"
                      value={formData.floors}
                      onChange={(e) => handleInputChange("floors", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Lisätiedot</Label>
                  <Textarea
                    id="notes"
                    placeholder="Vapaamuotoiset lisätiedot..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structures Tab - RT Standards */}
          <TabsContent value="structures" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Rakennetiedot - RT-standardit
                </CardTitle>
                <CardDescription>
                  Valitse rakennuksen rakennetyypit. FinnVesta laskee automaattisesti rakennusosien kunnon RT-käyttöikätietojen perusteella.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {componentLifespans.map((component) => (
                    <div key={component.id} className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>{component.name}</span>
                        {structures[component.id as keyof BuildingStructureData] && 
                         structures[component.id as keyof BuildingStructureData] !== 'ei' && (
                          <span className="text-xs text-muted-foreground">
                            Käyttöikä: {component.options.find(o => o.value === structures[component.id as keyof BuildingStructureData])?.lifespanYears || '?'} v
                          </span>
                        )}
                      </Label>
                      <Select
                        value={structures[component.id as keyof BuildingStructureData] || ""}
                        onValueChange={(value) => handleStructureChange(component.id as keyof BuildingStructureData, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Valitse tyyppi" />
                        </SelectTrigger>
                        <SelectContent>
                          {component.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label} ({option.lifespanYears}v)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handlePreviewAssessment}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Esikatsele kuntoarvio
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Luo uusi kuntoarvio näillä rakennetiedoilla
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sub-spaces Tab */}
          <TabsContent value="subspaces" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tilat ja huoneistot</CardTitle>
                    <CardDescription>Jaa rakennus erillisiin tiloihin seurantaa varten</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="hasSubSpaces" className="text-sm">Käytössä</Label>
                    <Switch
                      id="hasSubSpaces"
                      checked={hasSubSpaces}
                      onCheckedChange={setHasSubSpaces}
                    />
                  </div>
                </div>
              </CardHeader>
              {hasSubSpaces && (
                <CardContent className="space-y-4">
                  {subSpaces.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>Ei vielä tiloja. Lisää tila tai generoi automaattisesti.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subSpaces.map((space) => (
                        <div key={space.id} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                          <div className="flex-1 grid gap-3 sm:grid-cols-4">
                            <div className="space-y-1">
                              <Label className="text-xs">Nimi/Numero</Label>
                              <Input
                                placeholder="esim. A 101"
                                value={space.number}
                                onChange={(e) => updateSubSpace(space.id, "number", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tyyppi</Label>
                              <Select
                                value={space.type}
                                onValueChange={(value) => updateSubSpace(space.id, "type", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {spaceTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Pinta-ala (m²)</Label>
                              <Input
                                type="number"
                                placeholder="50"
                                value={space.squareMeters || ""}
                                onChange={(e) => updateSubSpace(space.id, "squareMeters", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Huomiot</Label>
                              <Input
                                placeholder="Lisätiedot..."
                                value={space.notes}
                                onChange={(e) => updateSubSpace(space.id, "notes", e.target.value)}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeSubSpace(space.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={addSubSpace}>
                      <Plus className="h-4 w-4 mr-2" />
                      Lisää tila
                    </Button>
                    <Button type="button" variant="outline" onClick={generateSubSpaces}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generoi tilat
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Assessment Preview Tab */}
          {previewAssessment && previewAssessment.length > 0 && (
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-400" />
                    Uusi kuntoarvio - Esikatselu
                  </CardTitle>
                  <CardDescription>
                    Tämä arvio luodaan tallennuksen yhteydessä RT-standardien perusteella
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">
                        {calculateOverallCondition(previewAssessment).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Yleiskunto (1-5)</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-400">
                        {(calculateTotalRepairDebt(previewAssessment) / 1000).toFixed(0)} k€
                      </div>
                      <div className="text-sm text-muted-foreground">Arvioitu korjausvelka</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">
                        {previewAssessment.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Arvioitua rakennusosaa</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {previewAssessment.map((item) => (
                      <div key={item.categoryId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <ConditionBadge score={item.conditionScore as 1|2|3|4|5} size="sm" />
                          <div>
                            <div className="font-medium text-foreground">{item.categoryName}</div>
                            <div className="text-xs text-muted-foreground">{item.notes}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-amber-400">
                            {item.estimatedRepairCost > 0 ? `${(item.estimatedRepairCost / 1000).toFixed(0)} k€` : '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.remainingLifespan > 0 ? `${item.remainingLifespan}v jäljellä` : 'Uusittava'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex items-center justify-end gap-3 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href={`/app/properties/${propertyId}`}>Peruuta</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Tallennetaan..." : "Tallenna muutokset"}
          </Button>
        </div>
      </form>
    </div>
  )
}
