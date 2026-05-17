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
import { ArrowLeft, Loader2 } from "lucide-react"
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

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      setIsLoading(false)
    }

    loadProperty()
  }, [propertyId, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

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
        })
        .eq("id", propertyId)

      if (error) throw error

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
