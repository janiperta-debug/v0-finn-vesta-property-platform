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
import { useTranslation } from "@/lib/i18n"

interface Property {
  id: string
  nimi: string
}

export default function NewHuoltotyoPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const categories = [
    { value: "lvi", label: t("maintenanceNew.categoryLvi") },
    { value: "sahko", label: t("maintenanceNew.categorySahko") },
    { value: "rakenne", label: t("maintenanceNew.categoryRakenne") },
    { value: "julkisivu", label: t("maintenanceNew.categoryJulkisivu") },
    { value: "katto", label: t("maintenanceNew.categoryKatto") },
    { value: "piha", label: t("maintenanceNew.categoryPiha") },
    { value: "sisatilat", label: t("maintenanceNew.categorySisatilat") },
    { value: "muu", label: t("maintenanceNew.categoryMuu") },
  ]

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
        alert(t('maintenanceNew.orgNotFoundAlert'))
        return
      }

      const { error } = await supabase
        .from('huoltotyot')
        .insert({
          org_id: orgUser.org_id,
          kiinteisto_id: parseInt(formData.property_id),
          otsikko: formData.title,
          kategoria: formData.category,
          kuvaus: formData.description,
          kustannus: formData.cost ? parseFloat(formData.cost) : null,
          pvm: formData.completed_date,
          urakoitsija: formData.contractor,
          tila: 'complete',
        })

      if (error) throw error

      router.push('/app/huoltohistoria')
    } catch (error) {
      console.error('Error creating maintenance task:', error)
      alert(t('maintenanceNew.createErrorAlert'))
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
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("maintenanceNew.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("maintenanceNew.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {t("maintenanceNew.formTitle")}
            </CardTitle>
            <CardDescription>
              {t("maintenanceNew.formDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property">{t("maintenanceNew.propertyLabel")}</Label>
                <Select 
                  value={formData.property_id} 
                  onValueChange={(v) => setFormData({...formData, property_id: v})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("maintenanceNew.propertyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.length === 0 ? (
                      <SelectItem value="placeholder" disabled>{t("maintenanceNew.noProperties")}</SelectItem>
                    ) : (
                      properties.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nimi}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t("maintenanceNew.categoryLabel")}</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({...formData, category: v})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("maintenanceNew.categoryPlaceholder")} />
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
              <Label htmlFor="title">{t("maintenanceNew.titleLabel")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={t("maintenanceNew.titlePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("maintenanceNew.descriptionLabel")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t("maintenanceNew.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cost">{t("maintenanceNew.costLabel")}</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t("maintenanceNew.dateLabel")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData({...formData, completed_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor">{t("maintenanceNew.contractorLabel")}</Label>
                <Input
                  id="contractor"
                  value={formData.contractor}
                  onChange={(e) => setFormData({...formData, contractor: e.target.value})}
                  placeholder={t("maintenanceNew.contractorPlaceholder")}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !formData.property_id || !formData.title}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? t("maintenanceNew.saving") : t("maintenanceNew.saveButton")}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/huoltohistoria">{t("common.cancel")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
