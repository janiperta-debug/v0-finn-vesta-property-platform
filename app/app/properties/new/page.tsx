"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Building2, Plus, Trash2, Sparkles, Info } from "lucide-react"
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

interface SubSpace {
  id: string
  number: string
  floor: number
  squareMeters: number
  rooms: string
  type: "apartment" | "commercial" | "storage" | "parking" | "other"
  notes: string
}

export default function NewPropertyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubSpaces, setHasSubSpaces] = useState(false)
  const [subSpaces, setSubSpaces] = useState<SubSpace[]>([])
  const [generateAssessment, setGenerateAssessment] = useState(true)
  const [previewAssessment, setPreviewAssessment] = useState<ReturnType<typeof generateInitialAssessment> | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    postalCode: "",
    city: "",
    buildingType: "",
    buildYear: "",
    squareMeters: "",
    floors: "",
    tunnus: "",
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

    // Check that at least some structures are selected
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
    const newSubSpace: SubSpace = {
      id: `temp-${Date.now()}`,
      number: "",
      floor: 1,
      squareMeters: 0,
      rooms: "",
      type: "apartment",
      notes: "",
    }
    setSubSpaces(prev => [...prev, newSubSpace])
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
    
    // Adjust units per floor based on building type
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
        id: `temp-1-1`,
        number: "A",
        floor: 1,
        squareMeters: totalArea || 120,
        rooms: "4h+k",
        type: "apartment",
        notes: "",
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
          id: `temp-1-${unit}`,
          number: String.fromCharCode(64 + unit),
          floor: 1,
          squareMeters: defaultSize,
          rooms: defaultRooms,
          type: "apartment",
          notes: "",
        })
      }
    } else {
      for (let floor = 1; floor <= floors; floor++) {
        for (let unit = 1; unit <= unitsPerFloor; unit++) {
          generated.push({
            id: `temp-${floor}-${unit}`,
            number: `${floor}${String(unit).padStart(2, '0')}`,
            floor,
            squareMeters: defaultSize,
            rooms: defaultRooms,
            type: buildingType === "toimisto" || buildingType === "teollisuus" ? "commercial" : "apartment",
            notes: "",
          })
        }
      }
    }
    
    setSubSpaces(generated)
    setHasSubSpaces(true)
    toast.success(`Luotiin ${generated.length} ${buildingType === "toimisto" || buildingType === "teollisuus" ? "tilaa" : "huoneistoa"}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Ei kirjautunut sisään")

      const { data: orgUsers, error: orgError } = await supabase
        .from("org_users")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)

      const orgUser = orgUsers?.[0]
      if (orgError || !orgUser) throw new Error("Organisaatiota ei löytynyt")

      // Generate assessment if enabled (even if not previewed)
      let assessmentToSave = previewAssessment
      if (generateAssessment && !assessmentToSave) {
        const buildYear = parseInt(formData.buildYear)
        const area = parseFloat(formData.squareMeters) || 500
        if (buildYear > 0) {
          assessmentToSave = generateInitialAssessment(buildYear, area, structures)
        }
      }

      // Calculate overall condition if assessment is generated
      let conditionClass = null
      if (generateAssessment && assessmentToSave && assessmentToSave.length > 0) {
        conditionClass = calculateOverallCondition(assessmentToSave)
      }

      // Combine notes with structure data as JSON
      const buildingMetadata = {
        userNotes: formData.notes || '',
        structures: structures,
      }

      const insertData = {
        org_id: orgUser.org_id,
        name: formData.name,
        address: formData.address || '',
        municipality: formData.city || null,
        building_type: formData.buildingType || null,
        construction_year: parseInt(formData.buildYear) || 0,
        area_m2: parseFloat(formData.squareMeters) || 0,
        cost_per_m2: 2500, // Default replacement cost per m²
        notes: JSON.stringify(buildingMetadata),
        status: 'active',
      }

      const { data: property, error: propError } = await supabase
        .from("buildings")
        .insert(insertData)
        .select()
        .single()

      if (propError) throw propError

      // Insert sub-spaces if any
      if (hasSubSpaces && subSpaces.length > 0 && property) {
        const subSpaceInserts = subSpaces.map(s => ({
          org_id: orgUser.org_id,
          property_id: property.id,
          name: s.number,
          area_m2: s.squareMeters || null,
          usage_category: s.type,
          notes: s.notes || null,
          is_sub_building: true,
          status: 'active',
          construction_year: parseInt(formData.buildYear) || 0,
        }))

        const { error: subError } = await supabase
          .from("buildings")
          .insert(subSpaceInserts)

        if (subError) {
          console.error("Sub-space insert error:", subError)
          toast.error("Huoneistojen tallennus epäonnistui osittain")
        }
      }

      // Create initial inspection with RT assessment if enabled
      if (generateAssessment && assessmentToSave && assessmentToSave.length > 0 && property) {
        const overallScore = calculateOverallCondition(assessmentToSave)
        
        // Create inspection
        const { data: inspection, error: inspError } = await supabase
          .from("inspections")
          .insert({
            org_id: orgUser.org_id,
            building_id: property.id,
            inspection_date: new Date().toISOString().split('T')[0],
            inspector_name: "RT-standardi (automaattinen)",
            inspector_type: null,
            status: 'completed',
            overall_score: overallScore,
            notes: `Automaattisesti generoitu kuntoarvio RT-standardien käyttöikätietojen perusteella. Rakennusvuosi: ${formData.buildYear}. Arvio perustuu tyypillisiin käyttöikiin eikä huomioi tehtyjä korjauksia.`,
          })
          .select()
          .single()

        if (inspError) {
          console.error("Inspection insert error:", inspError)
        } else if (inspection) {
          // Save category evaluations with correct column names
          const categoryEvals = assessmentToSave.map(a => ({
            inspection_id: inspection.id,
            category_id: a.categoryId,
            score: a.conditionScore,
            urgency: a.urgencyClass,
            comment: a.notes,
            cost_estimate: a.estimatedRepairCost,
            mode: 'basic',
            is_applicable: true,
            is_migrated: false,
          }))

          const { error: catError } = await supabase
            .from("category_evaluations")
            .insert(categoryEvals)

          if (catError) {
            console.error("Category evaluation insert error:", catError)
          }
        }
      }

      toast.success("Kiinteistö lisätty onnistuneesti")
      router.push(`/app/properties/${property.id}`)
    } catch (error: any) {
      console.error("Submit error:", error)
      toast.error(error.message || "Kiinteistön lisäys epäonnistui")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/properties">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Lisää kiinteistö</h1>
          <p className="text-sm text-muted-foreground">Syötä kiinteistön perustiedot ja rakennetiedot</p>
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
            <TabsTrigger value="subspaces" disabled={!hasSubSpaces}>
              Huoneistot
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
                    <Label htmlFor="tunnus">Tunnus</Label>
                    <Input
                      id="tunnus"
                      placeholder="esim. KT-001"
                      value={formData.tunnus}
                      onChange={(e) => handleInputChange("tunnus", e.target.value)}
                    />
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postinumero</Label>
                      <Input
                        id="postalCode"
                        placeholder="00100"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Kaupunki</Label>
                      <Input
                        id="city"
                        placeholder="Helsinki"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="buildingType">Rakennustyyppi *</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="buildYear">Rakennusvuosi *</Label>
                    <Input
                      id="buildYear"
                      type="number"
                      placeholder="1985"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={formData.buildYear}
                      onChange={(e) => handleInputChange("buildYear", e.target.value)}
                      required
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
                  <Label htmlFor="squareMeters">Pinta-ala (m2) *</Label>
                  <Input
                    id="squareMeters"
                    type="number"
                    placeholder="1500"
                    min="1"
                    value={formData.squareMeters}
                    onChange={(e) => handleInputChange("squareMeters", e.target.value)}
                    required
                  />
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

            {/* Sub-spaces toggle */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Huoneistot / Alatilat</CardTitle>
                  <CardDescription>
                    Jaa kiinteistö huoneistoihin tai muihin alatiloihin seurantaa varten
                    </CardDescription>
                  </div>
                  <Switch
                    checked={hasSubSpaces}
                    onCheckedChange={setHasSubSpaces}
                  />
                </div>
              </CardHeader>
              {hasSubSpaces && (
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Voit lisätä huoneistot seuraavalla välilehdellä tai generoida ne automaattisesti kerrosten perusteella.
                  </p>
                  <Button type="button" variant="outline" onClick={generateSubSpaces}>
                    Generoi huoneistot
                  </Button>
                </CardContent>
              )}
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
                  Valitse rakenteiden tyypit. FinnVesta laskee automaattisesti rakennuksen lahtotilanteen RT-korttien kayttoikatietojen perusteella.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-200">
                      <p className="font-medium mb-1">Miten tama toimii?</p>
                      <p className="text-amber-200/80">
                        Kun valitset rakenteiden tyypit, FinnVesta laskee kunkin osan kunnon kayttaen RT-korttien mukaisia tyypillisia kayttoikia. 
                        Esimerkiksi 1975 rakennetun talon huopakatto (kayttoika 25v) saa automaattisesti heikon arvosanan, 
                        kun taas tiilijulkisivu (kayttoika 60v) on yha tyydyttavassa kunnossa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {componentLifespans.map((component) => (
                    <div key={component.id} className="space-y-2">
                      <Label htmlFor={component.id}>{component.name}</Label>
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

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={generateAssessment}
                      onCheckedChange={setGenerateAssessment}
                    />
                    <Label>Luo automaattinen kuntoarvio lisayksen yhteydessa</Label>
                  </div>
                  <Button type="button" variant="outline" onClick={handlePreviewAssessment}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Esikatsele arvio
                  </Button>
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
                    <CardTitle>Huoneistot ja tilat ({subSpaces.length})</CardTitle>
                    <CardDescription>
                      Hallinnoi kiinteiston huoneistoja ja alatiloja
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={generateSubSpaces}>
                      Generoi
                    </Button>
                    <Button type="button" size="sm" onClick={addSubSpace}>
                      <Plus className="h-4 w-4 mr-1" />
                      Lisaa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subSpaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">Ei huoneistoja viela</p>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={generateSubSpaces}>
                        Generoi automaattisesti
                      </Button>
                      <Button type="button" onClick={addSubSpace}>
                        <Plus className="h-4 w-4 mr-1" />
                        Lisaa huoneisto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subSpaces.map((space) => (
                      <div
                        key={space.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                      >
                        <div className="grid flex-1 gap-3 sm:grid-cols-5">
                          <Input
                            placeholder="Numero"
                            value={space.number}
                            onChange={(e) => updateSubSpace(space.id, "number", e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Kerros"
                            value={space.floor}
                            onChange={(e) => updateSubSpace(space.id, "floor", parseInt(e.target.value) || 1)}
                          />
                          <Input
                            type="number"
                            placeholder="m2"
                            value={space.squareMeters || ""}
                            onChange={(e) => updateSubSpace(space.id, "squareMeters", parseFloat(e.target.value) || 0)}
                          />
                          <Input
                            placeholder="Huoneet"
                            value={space.rooms}
                            onChange={(e) => updateSubSpace(space.id, "rooms", e.target.value)}
                          />
                          <Select
                            value={space.type}
                            onValueChange={(value) => updateSubSpace(space.id, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="apartment">Asunto</SelectItem>
                              <SelectItem value="commercial">Liiketila</SelectItem>
                              <SelectItem value="storage">Varasto</SelectItem>
                              <SelectItem value="parking">Autopaikka</SelectItem>
                              <SelectItem value="other">Muu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubSpace(space.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Preview Tab */}
          {previewAssessment && previewAssessment.length > 0 && (
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    RT-standardien mukainen kuntoarvio (esikatselu)
                  </CardTitle>
                  <CardDescription>
                    Automaattisesti generoitu arvio perustuen rakennusvuoteen ({formData.buildYear}) ja rakennetyyppeihin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Kokonaiskunto</div>
                      <div className="text-3xl font-bold text-amber-400">
                        {calculateOverallCondition(previewAssessment).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">/ 5.0</div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Arvioitu korjausvelka</div>
                      <div className="text-2xl font-bold text-red-400">
                        {(calculateTotalRepairDebt(previewAssessment) / 1000).toFixed(0)} k
                      </div>
                      <div className="text-xs text-muted-foreground">euroa</div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Arvioidut kohteet</div>
                      <div className="text-2xl font-bold">{previewAssessment.length}</div>
                      <div className="text-xs text-muted-foreground">rakennusosaa</div>
                    </div>
                  </div>

                  {/* Category list */}
                  <div className="space-y-3">
                    {previewAssessment.map((assessment) => (
                      <div
                        key={assessment.categoryId}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                      >
                        <ConditionBadge score={assessment.conditionScore as 1|2|3|4|5} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{assessment.categoryName}</span>
                            {assessment.urgencyClass <= 2 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                {assessment.urgencyClass === 1 ? 'Valiton' : 'Kiireellinen'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{assessment.notes}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Jaljella: {assessment.remainingLifespan > 0 ? `${assessment.remainingLifespan}v` : 'Ylittynyt'}</span>
                            {assessment.estimatedRepairCost > 0 && (
                              <span>Korjauskustannus: {(assessment.estimatedRepairCost / 1000).toFixed(0)}k EUR</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <p className="text-sm text-blue-200">
                      <strong>Huom:</strong> Tama on arvio tyypillisten kayttoikien perusteella. Todelliset kustannukset ja kunto voivat poiketa merkittavasti 
                      riippuen tehdyista korjauksista, huollosta ja rakennuksen erityispiirteista. Paivita arviot tarkastusten yhteydessa.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Submit button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/app/properties">Peruuta</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Tallennetaan..." : "Tallenna kiinteisto"}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
