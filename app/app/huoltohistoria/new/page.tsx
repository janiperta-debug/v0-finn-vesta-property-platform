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
import { ArrowLeft, Save, Wrench } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Property {
  id: string
  nimi: string
}

const categories = [
  { value: "lvi", label: "LVI" },
  { value: "sahko", label: "Sähkö" },
  { value: "rakenne", label: "Rakenne" },
  { value: "julkisivu", label: "Julkisivu" },
  { value: "katto", label: "Katto" },
  { value: "piha", label: "Piha-alueet" },
  { value: "sisatilat", label: "Sisätilat" },
  { value: "muu", label: "Muu" },
]

export default function NewHuoltotyoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    property_id: "",
    title: "",
    category: "",
    description: "",
    cost: "",
    completed_date: new Date().toISOString().split('T')[0],
    contractor: "",
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
        .from('huoltotyot')
        .insert({
          organization_id: orgUser.org_id,
          kiinteisto_id: formData.property_id,
          otsikko: formData.title,
          kategoria: formData.category,
          kuvaus: formData.description,
          kustannus: formData.cost ? parseFloat(formData.cost) : null,
          pvm: formData.completed_date,
          urakoitsija: formData.contractor,
          tila: 'completed',
        })

      if (error) throw error

      router.push('/app/huoltohistoria')
    } catch (error) {
      console.error('Error creating maintenance task:', error)
      alert('Virhe huoltotyön luomisessa')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/huoltohistoria">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Lisää huoltotyö</h1>
          <p className="text-sm text-muted-foreground">Kirjaa tehty huolto- tai korjaustyö</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Huoltotyön tiedot
            </CardTitle>
            <CardDescription>
              Täytä huoltotyön perustiedot
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
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Työn kuvaus *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="esim. Kattovuodon korjaus"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Lisätiedot</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tarkempi kuvaus tehdystä työstä"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cost">Kustannus (€)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Valmistumispäivä</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData({...formData, completed_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor">Urakoitsija</Label>
                <Input
                  id="contractor"
                  value={formData.contractor}
                  onChange={(e) => setFormData({...formData, contractor: e.target.value})}
                  placeholder="Yrityksen nimi"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !formData.property_id || !formData.title}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Tallennetaan..." : "Tallenna huoltotyö"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/huoltohistoria">Peruuta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
