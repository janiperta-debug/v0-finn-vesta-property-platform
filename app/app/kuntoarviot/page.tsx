"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ClipboardCheck,
  Plus,
  Search,
  Calendar,
  User,
  ChevronRight,
} from "lucide-react"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"
import type { ConditionScore } from "@/lib/kuntoarvio-types"

interface Inspection {
  id: string
  propertyId: string
  propertyName: string
  date: string
  inspector: string
  overallScore: ConditionScore
  status: string
  categoriesEvaluated: number
}

export default function KuntoarviotPage() {
  const router = useRouter()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: orgUsers } = await supabase
        .from('org_users')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)

      const orgUser = orgUsers?.[0]
      if (!orgUser?.org_id) {
        setIsLoading(false)
        return
      }

      // Fetch inspections
      const { data: inspectionsData } = await supabase
        .from('inspections')
        .select('*')
        .eq('org_id', orgUser.org_id)
        .order('inspection_date', { ascending: false })

      if (inspectionsData && inspectionsData.length > 0) {
        // Fetch building names
        const buildingIds = [...new Set(inspectionsData.map(i => i.building_id).filter(Boolean))]
        let buildingMap = new Map<number, string>()

        if (buildingIds.length > 0) {
          const { data: buildingsData } = await supabase
            .from('buildings')
            .select('id, name')
            .in('id', buildingIds)
          if (buildingsData) {
            buildingMap = new Map(buildingsData.map(b => [b.id, b.name]))
          }
        }

        setInspections(inspectionsData.map((i: any) => ({
          id: String(i.id),
          propertyId: String(i.building_id),
          propertyName: buildingMap.get(i.building_id) || 'Tuntematon',
          date: i.inspection_date || '',
          inspector: i.inspector_name || '-',
          overallScore: (i.overall_score ? Math.round(i.overall_score) : 3) as ConditionScore,
          status: i.status || 'draft',
          categoriesEvaluated: 0,
        })))
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router])

  const completedCount = inspections.filter(i => i.status === "completed" || i.status === "approved").length
  const inProgressCount = inspections.filter(i => i.status === "draft" || i.status === "in-progress").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Ladataan...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Kuntoarviot</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hallinnoi ja seuraa kuntoarvioita
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/app/kuntoarviot/new">
            <Plus className="h-4 w-4" />
            Uusi kuntoarvio
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inspections.length}</p>
                <p className="text-sm text-muted-foreground">Kuntoarviota yhteensä</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-400/10 p-2">
                <ClipboardCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Valmista</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-400/10 p-2">
                <ClipboardCheck className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">Kesken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Hae kuntoarvioita..." className="pl-9" />
      </div>

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kuntoarviot</CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ei kuntoarvioita</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Aloita luomalla ensimmäinen kuntoarvio kiinteistöllesi.
              </p>
              <Button asChild>
                <Link href="/app/kuntoarviot/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Luo kuntoarvio
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {inspections.map((inspection) => (
                <Link
                  key={inspection.id}
                  href={`/app/kuntoarviot/${inspection.id}`}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <ConditionBadge score={inspection.overallScore} size="lg" />
                    <div>
                      <p className="font-medium">{inspection.propertyName}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(inspection.date).toLocaleDateString("fi-FI")}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {inspection.inspector}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge variant={inspection.status === "completed" || inspection.status === "approved" ? "default" : "secondary"}>
                        {inspection.status === "completed" || inspection.status === "approved" ? "Valmis" : "Kesken"}
                      </Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
