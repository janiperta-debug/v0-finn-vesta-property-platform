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

export default function AddSpacePage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [parentBuilding, setParentBuilding] = useState<{ name: string; org_id: number } | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    type: "other",
    floor: "1",
    squareMeters: "",
    rooms: "",
    notes: "",
  })

  useEffect(() => {
    async function loadParentBuilding() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("buildings")
        .select("name, org_id")
        .eq("id", propertyId)
        .single()

      if (error || !data) {
        toast.error("Kiinteistöä ei löytynyt")
        router.push("/app/properties")
        return
      }

      setParentBuilding(data)
      setIsLoading(false)
    }

    loadParentBuilding()
  }, [propertyId, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Tilan nimi on pakollinen")
      return
    }

    if (!parentBuilding) {
      toast.error("Päärakennusta ei löytynyt")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const insertData = {
        org_id: parentBuilding.org_id,
        property_id: parseInt(propertyId),
        name: formData.name,
        usage_category: formData.type,
        area_m2: parseFloat(formData.squareMeters) || 0,
        notes: formData.notes || null,
        construction_year: 0,
        cost_per_m2: 0,
        status: "active",
        is_sub_building: true,
      }
      
      console.log("[v0] Inserting sub-space:", insertData)
      
      const { data, error } = await supabase.from("buildings").insert(insertData).select()
      
      console.log("[v0] Insert result:", data, "error:", error)

      if (error) throw error

      toast.success("Tila lisätty")
      router.push(`/app/properties/${propertyId}`)
    } catch (error: any) {
      console.error("Insert error:", error)
      toast.error(error.message || "Tilan lisäys epäonnistui")
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
          <h1 className="font-heading text-2xl font-bold text-foreground">Lisää tila</h1>
          <p className="text-sm text-muted-foreground">{parentBuilding?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Tilan tiedot</CardTitle>
            <CardDescription>
              Lisää huoneisto, toimisto, keittiö tai muu tila kiinteistöön
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tilan nimi / numero *</Label>
                <Input
                  id="name"
                  placeholder="esim. A 101, Keittiö 1, Liikuntasali"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tilatyyppi</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {spaceTypes.map(type => (
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
                <Label htmlFor="squareMeters">Pinta-ala (m²)</Label>
                <Input
                  id="squareMeters"
                  type="number"
                  placeholder="55"
                  value={formData.squareMeters}
                  onChange={(e) => handleInputChange("squareMeters", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Kerros</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => handleInputChange("floor", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rooms">Huonejako (valinnainen)</Label>
              <Input
                id="rooms"
                placeholder="esim. 2h+k, 3 huonetta"
                value={formData.rooms}
                onChange={(e) => handleInputChange("rooms", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Lisätiedot</Label>
              <Textarea
                id="notes"
                placeholder="Muut huomiot tilasta..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" asChild>
            <Link href={`/app/properties/${propertyId}`}>Peruuta</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lisää tila
          </Button>
        </div>
      </form>
    </div>
  )
}
