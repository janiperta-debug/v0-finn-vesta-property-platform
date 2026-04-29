"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, ClipboardCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function NewKuntoarvioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState("")
  const [inspectionType, setInspectionType] = useState("perus")
  const [notes, setNotes] = useState("")

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

      // Get user's organization
      const { data: orgUser } = await supabase
        .from('org_users')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (!orgUser) {
        alert('Organisaatiota ei löytynyt')
        return
      }

      const { error } = await supabase
        .from('inspections')
        .insert({
          organization_id: orgUser.organization_id,
          property_id: selectedProperty,
          inspection_type: inspectionType,
          status: 'scheduled',
          notes: notes,
          scheduled_date: new Date().toISOString(),
        })

      if (error) throw error

      router.push('/app/kuntoarviot')
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
                    <SelectItem value="placeholder">Lisää ensin kiinteistöjä</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Arvioinnin tyyppi *</Label>
                <Select value={inspectionType} onValueChange={setInspectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perus">Perusarviointi</SelectItem>
                    <SelectItem value="tarkennettu">Tarkennettu arviointi</SelectItem>
                    <SelectItem value="laaja">Laaja kuntotutkimus</SelectItem>
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
