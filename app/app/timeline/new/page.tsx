"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, CalendarRange } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Property {
  id: string
  nimi: string
}

const priorities = [
  { value: "critical", label: "Kriittinen (0-1v)", color: "text-red-500" },
  { value: "high", label: "Korkea (1-3v)", color: "text-amber-500" },
  { value: "medium", label: "Keskitaso (3-5v)", color: "text-yellow-500" },
  { value: "low", label: "Matala (5-10v)", color: "text-blue-500" },
]

const categories = [
  "Katto",
  "Julkisivu",
  "Ikkunat ja ovet",
  "LVI-järjestelmät",
  "Sähköjärjestelmät",
  "Sisätilat",
  "Piha-alueet",
  "Perustukset",
  "Muu",
]

export default function NewInvestointiPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    property_id: "",
    title: "",
    category: "",
    description: "",
    estimated_cost: "",
    priority: "medium",
    planned_year: new Date().getFullYear() + 1,
  })

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

      if (data) setProperties(data.map(p => ({ id: String(p.id), nimi: p.name || '' })))
    }
    fetchProperties()
  }, [])

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

      const { error } = await supabase
        .from('investment_plans')
        .insert({
          organization_id: orgUser.org_id,
          kiinteisto_id: formData.property_id,
          otsikko: formData.title,
          kategoria: formData.category,
          kuvaus: formData.description,
          arvioitu_kustannus: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
          prioriteetti: formData.priority,
          vuosi: formData.planned_year,
          tila: 'planned',
        })

      if (error) throw error

      router.push('/app/timeline')
    } catch (error) {
      console.error('Error creating investment plan:', error)
      alert('Virhe investoinnin luomisessa')
    } finally {
      setIsLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 16 }, (_, i) => currentYear + i)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/timeline">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Lisää investointi</h1>
          <p className="text-sm text-muted-foreground">Lisää uusi investointi PTS-suunnitelmaan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5" />
              Investoinnin tiedot
            </CardTitle>
            <CardDescription>
              Määritä investoinnin perustiedot ja aikataulu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property">Kiinteistö *</Label>
                <Select 
                  value={formData.property_id} 
                  onValueChange={(v) => setFormData({...formData, property_id: v})}
                  required
                >
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
                <Label htmlFor="category">Kategoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({...formData, category: v})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse kategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Investoinnin kuvaus *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="esim. Katon uusiminen"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Lisätiedot</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tarkempi kuvaus investoinnista"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cost">Arvioitu kustannus (€) *</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Kiireellisyys *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => setFormData({...formData, priority: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className={p.color}>{p.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Suunniteltu vuosi *</Label>
                <Select 
                  value={formData.planned_year.toString()} 
                  onValueChange={(v) => setFormData({...formData, planned_year: parseInt(v)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !formData.property_id || !formData.title || !formData.estimated_cost}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Tallennetaan..." : "Tallenna investointi"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/timeline">Peruuta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
