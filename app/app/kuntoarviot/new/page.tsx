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
import { useTranslation } from "@/lib/i18n"

interface Property {
  id: string
  nimi: string
}

function NewKuntoarvioForm() {
  const router = useRouter()
  const { t } = useTranslation()
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
        alert(t('inspectionNew.orgNotFoundAlert'))
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
      alert(t('inspectionNew.createErrorAlert'))
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
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("inspectionNew.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("inspectionNew.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {t("inspectionNew.formTitle")}
            </CardTitle>
            <CardDescription>
              {t("inspectionNew.formDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property">{t("inspectionNew.propertyLabel")}</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t("inspectionNew.propertyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.length === 0 ? (
                      <SelectItem value="placeholder" disabled>{t("inspectionNew.noProperties")}</SelectItem>
                    ) : (
                      properties.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nimi}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{t("inspectionNew.inspectorTypeLabel")}</Label>
                <Select value={inspectionType} onValueChange={setInspectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property_manager">{t("inspectionNew.typePropertyManager")}</SelectItem>
                    <SelectItem value="internal">{t("inspectionNew.typeInternal")}</SelectItem>
                    <SelectItem value="external">{t("inspectionNew.typeExternal")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("inspectionNew.notesLabel")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("inspectionNew.notesPlaceholder")}
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !selectedProperty}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? t("inspectionNew.saving") : t("inspections.createButton")}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/kuntoarviot">{t("common.cancel")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default function NewKuntoarvioPage() {
  const { t } = useTranslation()
  return (
    <Suspense fallback={<div className="p-8">{t("common.loading")}</div>}>
      <NewKuntoarvioForm />
    </Suspense>
  )
}
