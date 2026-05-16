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
import { ArrowLeft, Building2, Plus, Trash2, Upload } from "lucide-react"
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    const unitsPerFloor = 4
    const generated: SubSpace[] = []
    
    for (let floor = 1; floor <= floors; floor++) {
      for (let unit = 1; unit <= unitsPerFloor; unit++) {
        generated.push({
          id: `temp-${floor}-${unit}`,
          number: `${floor}${String(unit).padStart(2, '0')}`,
          floor,
          squareMeters: 55,
          rooms: "2h+k",
          type: "apartment",
          notes: "",
        })
      }
    }
    setSubSpaces(generated)
    toast.success(`Luotiin ${generated.length} huoneistoa`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Ei kirjautunut sisään")

      // Get user's organization - note: user_id is text type, org_id is the org field
      const { data: orgUser, error: orgError } = await supabase
        .from("org_users")
        .select("org_id")
        .eq("user_id", user.id)
        .single()

      if (orgError || !orgUser) throw new Error("Organisaatiota ei löytynyt")

      // Insert property into kiinteistot table with correct column names
      const { data: property, error: propError } = await supabase
        .from("kiinteistot")
        .insert({
          org_id: orgUser.org_id,
          name: formData.name,
          address: formData.address,
          municipality: formData.city || null,
          building_type: formData.buildingType,
          construction_year: parseInt(formData.buildYear) || null,
          area_m2: parseFloat(formData.squareMeters) || null,
          notes: formData.notes || null,
          status: 'active',
        })
        .select()
        .single()

      if (propError) throw propError

      // Insert sub-spaces if any
      if (hasSubSpaces && subSpaces.length > 0 && property) {
        const subSpaceInserts = subSpaces.map(s => ({
          property_id: property.id,
          number: s.number,
          floor: s.floor,
          square_meters: s.squareMeters,
          rooms: s.rooms,
          type: s.type,
          notes: s.notes || null,
        }))

        const { error: subError } = await supabase
          .from("sub_spaces")
          .insert(subSpaceInserts)

        if (subError) {
          console.error("Sub-space insert error:", subError)
          toast.error("Huoneistojen tallennus epäonnistui osittain")
        }
      }

      toast.success("Kiinteistö lisätty onnistuneesti")
      router.push("/app/properties")
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
          <p className="text-sm text-muted-foreground">Syötä kiinteistön perustiedot</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Perustiedot</TabsTrigger>
            <TabsTrigger value="subspaces" disabled={!hasSubSpaces}>
              Huoneistot / Tilat
              {subSpaces.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {subSpaces.length}
                </span>
              )}
            </TabsTrigger>
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
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={generateSubSpaces}>
                      Generoi huoneistot
                    </Button>
                  </div>
                </CardContent>
              )}
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
                      Hallinnoi kiinteistön huoneistoja ja alatiloja
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={generateSubSpaces}>
                      Generoi
                    </Button>
                    <Button type="button" size="sm" onClick={addSubSpace}>
                      <Plus className="h-4 w-4 mr-1" />
                      Lisää
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subSpaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">Ei huoneistoja vielä</p>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={generateSubSpaces}>
                        Generoi automaattisesti
                      </Button>
                      <Button type="button" onClick={addSubSpace}>
                        <Plus className="h-4 w-4 mr-1" />
                        Lisää huoneisto
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
                            placeholder="m²"
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
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/app/properties">Peruuta</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Tallennetaan..." : "Tallenna kiinteistö"}
          </Button>
        </div>
      </form>
    </div>
  )
}
