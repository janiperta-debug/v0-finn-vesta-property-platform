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
import { useTranslation } from "@/lib/i18n"

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
  const { t } = useTranslation()

  const buildingTypes = [
    { value: "kerrostalo", label: t("propertyTypes.kerrostalo") },
    { value: "rivitalo", label: t("propertyTypes.rivitalo") },
    { value: "paritalo", label: t("propertyTypes.paritalo") },
    { value: "omakotitalo", label: t("propertyTypes.omakotitalo") },
    { value: "toimisto", label: t("propertyTypes.toimisto") },
    { value: "koulu", label: t("propertyTypes.kouluPaivakoti") },
    { value: "liikunta", label: t("propertyTypes.liikunta") },
    { value: "teollisuus", label: t("propertyTypes.teollisuus") },
    { value: "muu", label: t("propertyTypes.muu") },
  ]

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
      toast.error(t("propertyEdit.missingBasicsError"))
      return
    }

    // Check that at least some structures are selected
    const filledStructures = Object.entries(structures).filter(([key, value]) => value && value !== 'ei').length
    if (filledStructures < 3) {
      toast.error(t("propertyEdit.minStructuresError"))
      return
    }

    const assessment = generateInitialAssessment(buildYear, squareMeters, structures)
    setPreviewAssessment(assessment)
    toast.success(t("propertyEdit.previewGenerated"))
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
      toast.success(`${t("propertyEdit.spacesCreatedPrefix")} ${generated.length} ${t("propertyEdit.spaceSingular")}`)
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
    toast.success(`${t("propertyEdit.spacesCreatedPrefix")} ${generated.length} ${buildingType === "toimisto" || buildingType === "teollisuus" ? t("propertyEdit.spacePlural") : t("propertyNew.apartmentsPlural")}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t("propertyEdit.notLoggedIn"))

      const { data: orgUsers, error: orgError } = await supabase
        .from("org_users")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)

      const orgUser = orgUsers?.[0]
      if (orgError || !orgUser) throw new Error(t("maintenanceNew.orgNotFoundAlert"))

      // Generate assessment if enabled (even if not previewed)
      let assessmentToSave = previewAssessment
      if (generateAssessment && !assessmentToSave) {
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
          toast.error(t("propertyNew.subSpacesSaveError"))
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
            inspector_name: t("propertyEdit.autoInspectorName"),
            inspector_type: 'property_manager',
            status: 'complete',
            overall_score: overallScore,
            notes: `${t('propertyEdit.autoNotesPrefix')} ${formData.buildYear}. ${t('propertyNew.autoNotesExtra')}`,
          })
          .select()
          .single()

        if (inspError) {
          console.error("Inspection insert error:", inspError)
        } else if (inspection) {
          // Map urgency number to text for database
          const urgencyMap: Record<number, string> = {
            1: 'immediate',
            2: 'soon',
            3: 'planned',
            4: 'monitoring',
          }
          
          // Save category evaluations with correct column names
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

          const { error: catError } = await supabase
            .from("category_evaluations")
            .insert(categoryEvals)

          if (catError) {
            console.error("Category evaluation insert error:", catError)
          }
        }
      }

      toast.success(t("propertyNew.createSuccess"))
      router.push(`/app/properties/${property.id}`)
    } catch (error: any) {
      console.error("Submit error:", error)
      toast.error(error.message || t("propertyNew.createError"))
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
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("propertyNew.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("propertyNew.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">{t("propertyEdit.tabBasic")}</TabsTrigger>
            <TabsTrigger value="structures">
              {t("propertyEdit.tabStructures")}
              {Object.values(structures).filter(v => v && v !== 'ei').length > 0 && (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {Object.values(structures).filter(v => v && v !== 'ei').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="subspaces" disabled={!hasSubSpaces}>
              {t("propertyDetail.apartmentsLabel")}
              {subSpaces.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {subSpaces.length}
                </span>
              )}
            </TabsTrigger>
            {previewAssessment && previewAssessment.length > 0 && (
              <TabsTrigger value="preview">
                {t("propertyEdit.tabInspectionPreview")}
                <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                  {t("propertyEdit.previewBadge")}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("propertyEdit.propertyInfoTitle")}</CardTitle>
                <CardDescription>{t("propertyEdit.propertyInfoDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("propertyEdit.nameLabel")}</Label>
                    <Input
                      id="name"
                      placeholder={t("propertyEdit.namePlaceholder")}
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tunnus">{t("propertyNew.identifierLabel")}</Label>
                    <Input
                      id="tunnus"
                      placeholder={t("propertyNew.identifierPlaceholder")}
                      value={formData.tunnus}
                      onChange={(e) => handleInputChange("tunnus", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("propertyEdit.addressLabel")}</Label>
                    <Input
                      id="address"
                      placeholder={t("propertyEdit.addressPlaceholder")}
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">{t("propertyNew.postalCodeLabel")}</Label>
                      <Input
                        id="postalCode"
                        placeholder="00100"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("propertyImport.cityField")}</Label>
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
                    <Label htmlFor="buildingType">{t("propertyNew.buildingTypeRequiredLabel")}</Label>
                    <Select
                      value={formData.buildingType}
                      onValueChange={(value) => handleInputChange("buildingType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("propertyEdit.selectTypePlaceholder")} />
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
                    <Label htmlFor="buildYear">{t("propertyNew.buildYearRequiredLabel")}</Label>
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
                    <Label htmlFor="floors">{t("propertyEdit.floorsLabel")}</Label>
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
                  <Label htmlFor="squareMeters">{t("propertyNew.squareMetersRequiredLabel")}</Label>
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
                  <Label htmlFor="notes">{t("propertyEdit.notesLabel")}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t("propertyEdit.notesPlaceholder")}
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
                    <CardTitle>{t("propertyNew.subSpacesTitle")}</CardTitle>
                  <CardDescription>
                    {t("propertyNew.subSpacesDescription")}
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
                    {t("propertyNew.subSpacesHint")}
                  </p>
                  <Button type="button" variant="outline" onClick={generateSubSpaces}>
                    {t("propertyNew.generateApartments")}
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
                  {t("propertyEdit.structuresTitle")}
                </CardTitle>
                <CardDescription>
                  {t("propertyNew.structuresDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-200">
                      <p className="font-medium mb-1">{t("propertyNew.howItWorksTitle")}</p>
                      <p className="text-amber-200/80">
                        {t("propertyNew.howItWorksDescription")}
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
                          <SelectValue placeholder={t("propertyEdit.selectTypePlaceholder")} />
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
                    <Label>{t("propertyNew.autoGenerateLabel")}</Label>
                  </div>
                  <Button type="button" variant="outline" onClick={handlePreviewAssessment}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t("propertyNew.previewAssessmentButton")}
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
                    <CardTitle>{t("propertyNew.apartmentsAndSpacesTitle")} ({subSpaces.length})</CardTitle>
                    <CardDescription>
                      {t("propertyNew.manageApartmentsDescription")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={generateSubSpaces}>
                      {t("propertyNew.generateShort")}
                    </Button>
                    <Button type="button" size="sm" onClick={addSubSpace}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t("common.add")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subSpaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">{t("propertyNew.noApartmentsYet")}</p>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={generateSubSpaces}>
                        {t("propertyNew.generateAutomatically")}
                      </Button>
                      <Button type="button" onClick={addSubSpace}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t("propertyNew.addApartment")}
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
                            placeholder={t("propertyNew.numberPlaceholder")}
                            value={space.number}
                            onChange={(e) => updateSubSpace(space.id, "number", e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder={t("propertyNew.floorPlaceholder")}
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
                            placeholder={t("propertyNew.roomsPlaceholder")}
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
                              <SelectItem value="apartment">{t("propertyEdit.spaceTypeApartment")}</SelectItem>
                              <SelectItem value="commercial">{t("propertyEdit.spaceTypeCommercial")}</SelectItem>
                              <SelectItem value="storage">{t("propertyEdit.spaceTypeStorage")}</SelectItem>
                              <SelectItem value="parking">{t("propertyEdit.spaceTypeParking")}</SelectItem>
                              <SelectItem value="other">{t("propertyTypes.muu")}</SelectItem>
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
                    {t("propertyNew.previewInspectionTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("propertyNew.previewInspectionDescPrefix")} ({formData.buildYear}) {t("propertyNew.previewInspectionDescSuffix")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">{t("propertyNew.overallConditionLabel")}</div>
                      <div className="text-3xl font-bold text-amber-400">
                        {calculateOverallCondition(previewAssessment).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">/ 5.0</div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">{t("propertyEdit.estimatedRepairDebtLabel")}</div>
                      <div className="text-2xl font-bold text-red-400">
                        {(calculateTotalRepairDebt(previewAssessment) / 1000).toFixed(0)} k
                      </div>
                      <div className="text-xs text-muted-foreground">{t("propertyNew.eurosLabel")}</div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">{t("propertyNew.estimatedItemsLabel")}</div>
                      <div className="text-2xl font-bold">{previewAssessment.length}</div>
                      <div className="text-xs text-muted-foreground">{t("propertyNew.componentsLabel")}</div>
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
                                {assessment.urgencyClass === 1 ? t('propertyDetail.urgencyImmediate') : t('propertyNew.urgent')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{assessment.notes}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{t('propertyNew.remainingLabel')} {assessment.remainingLifespan > 0 ? `${assessment.remainingLifespan}v` : t('propertyNew.exceededLabel')}</span>
                            {assessment.estimatedRepairCost > 0 && (
                              <span>{t("propertyNew.repairCostLabel")} {(assessment.estimatedRepairCost / 1000).toFixed(0)}k EUR</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <p className="text-sm text-blue-200">
                      <strong>{t("propertyNew.noteLabel")}</strong> {t("propertyNew.disclaimerText")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Submit button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/app/properties">{t("common.cancel")}</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("maintenanceNew.saving") : t("propertyNew.saveButton")}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
