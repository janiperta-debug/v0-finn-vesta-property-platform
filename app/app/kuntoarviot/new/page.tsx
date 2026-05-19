"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, ClipboardCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Property {
  id: string
  nimi: string
}

function NewKuntoarvioForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedBuildingId = searchParams.get("building_id")
  
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState(preselectedBuildingId || "")
  const [inspectionType, setInspectionType] = useState("property_manager")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function fetchProperties() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: orgUsers } = await supabase
        .from('org_users')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)

      const orgUser = orgUsers?.[0]
      if (!orgUser) return

      const { data } = await supabase
        .from('buildings')
        .select('id, name')
        .eq('org_id', orgUser.org_id)
        .order('name')

      if (data) {
        setProperties(data.map(p => ({ id: String(p.id), nimi: p.name || '' })))
        // If preselected building_id, ensure it's set
        if (preselectedBuildingId && !selectedProperty) {
          setSelectedProperty(preselectedBuildingId)
        }
      }
    }
    fetchProperties()
  }, [preselectedBuildingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: orgUsers2 } = await supabase
        .from('org_users')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)

      const orgUser = orgUsers2?.[0]
      if (!orgUser) {
        alert('Organisaatiota ei löytynyt')
        return
      }

      const insertData = {
        org_id: orgUser.org_id,
        building_id: parseInt(selectedProperty),
        inspector_type: inspectionType,
        status: 'draft',
        notes: notes || '',
        inspection_date: new Date().toISOString().split('T')[0],
        inspector_name: '-',
      }
      
      const { data, error } = await supabase
        .from('inspections')
        .insert(insertData)
        .select()

      if (error) throw error

      // Redirect to the created inspection to continue filling it
      if (data && data[0]) {
        router.push(`/app/kuntoarviot/${data[0].id}`)
      } else {
        router.push('/app/kuntoarviot')
      }
    } catch (error) {
      console.error('Error creating inspection:', error)
      alert('Virhe kuntoarvion luomisessa')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/kuntoarviot">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Uusi kuntoarvio</h1>
          <p className="text-sm text-muted-foreground">Luo uusi kuntoarvio kiinteistölle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Kuntoarvion tiedot
            </CardTitle>
            <CardDescription>
              Valitse kiinteistö ja arvioinnin tyyppi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property">Kiinteistö *</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse kiinteistö" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.length === 0 ? (
                      <SelectItem value="placeholder" disabled>Ei kiinteistöjä</SelectItem>
                    ) : (
                      properties.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nimi}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tarkastajan tyyppi *</Label>
                <Select value={inspectionType} onValueChange={setInspectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property_manager">Isännöitsijä</SelectItem>
                    <SelectItem value="internal">Sisäinen</SelectItem>
                    <SelectItem value="external">Ulkoinen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Lisätiedot</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Erityishuomiot, keskittymisalueet tms."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !selectedProperty}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Tallennetaan..." : "Luo kuntoarvio"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/kuntoarviot">Peruuta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default function NewKuntoarvioPage() {
  return (
    <Suspense fallback={<div className="p-8">Ladataan...</div>}>
      <NewKuntoarvioForm />
    </Suspense>
  )
}
