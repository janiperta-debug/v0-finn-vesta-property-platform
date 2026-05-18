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
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    buildingType: "",
    buildYear: "",
    squareMeters: "",
    notes: "",
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

      setFormData({
        name: data.name || "",
        address: data.address || "",
        city: data.municipality || "",
        buildingType: data.building_type || "",
        buildYear: data.construction_year ? String(data.construction_year) : "",
        squareMeters: data.area_m2 ? String(data.area_m2) : "",
        notes: data.notes || "",
      })

      // Load existing sub-spaces (child buildings where property_id = this building's id)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

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
          notes: formData.notes || null,
          is_sub_building: hasSubSpaces,
        })
        .eq("id", propertyId)

      if (error) throw error

      // Handle sub-spaces if enabled
      if (hasSubSpaces && subSpaces.length > 0) {
        // Get user's org_id
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Ei kirjautunut sisään")
        
        const { data: orgUsers } = await supabase
          .from("org_users")
          .select("org_id")
          .eq("user_id", user.id)
          .limit(1)
        
        const orgId = orgUsers?.[0]?.org_id
        if (!orgId) throw new Error("Organisaatiota ei löytynyt")

        // Process each sub-space
        for (const space of subSpaces) {
          if (space.isNew) {
            // Insert new sub-space as a child building
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
            // Update existing sub-space
            await supabase.from("buildings").update({
              name: space.number || "Tila",
              area_m2: space.squareMeters || 0,
              usage_category: space.type,
              notes: space.notes || null,
            }).eq("id", space.id)
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
          <p className="text-sm text-muted-foreground">Päivitä kiinteistön tiedot</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Info */}
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

              <div className="grid gap-4 sm:grid-cols-2">
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

          {/* Sub-spaces */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tilat ja huoneistot</CardTitle>
                  <CardDescription>Jaa rakennus erillisiin tiloihin (asunnot, toimistot, keittiöt, liikuntasalit jne.)</CardDescription>
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
                    <p>Ei vielä tiloja. Lisää ensimmäinen tila alta.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subSpaces.map((space, index) => (
                      <div key={space.id} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                        <div className="flex-1 grid gap-3 sm:grid-cols-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Nimi/Numero</Label>
                            <Input
                              placeholder="esim. A 101, Keittiö 1"
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
                <Button type="button" variant="outline" onClick={addSubSpace} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Lisää tila
                </Button>
              </CardContent>
            )}
          </Card>
        </div>

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
