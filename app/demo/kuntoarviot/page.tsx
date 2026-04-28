"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ClipboardCheck, 
  Plus, 
  Search,
  Calendar,
  Building2,
  User,
  ChevronRight
} from "lucide-react"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"
import type { ConditionScore } from "@/lib/kuntoarvio-types"

const inspections = [
  {
    id: "1",
    propertyId: "1",
    propertyName: "Keskuskoulu",
    date: "2025-03-15",
    inspector: "Demo Tarkastaja",
    overallScore: 3 as ConditionScore,
    status: "completed",
    categoriesEvaluated: 17,
  },
  {
    id: "2",
    propertyId: "2",
    propertyName: "Puiston päiväkoti",
    date: "2025-03-10",
    inspector: "Demo Tarkastaja",
    overallScore: 4 as ConditionScore,
    status: "completed",
    categoriesEvaluated: 15,
  },
  {
    id: "3",
    propertyId: "3",
    propertyName: "Keskustan liikuntahalli",
    date: "2025-02-28",
    inspector: "Demo Tarkastaja",
    overallScore: 4 as ConditionScore,
    status: "completed",
    categoriesEvaluated: 17,
  },
  {
    id: "4",
    propertyId: "4",
    propertyName: "Virastotalo",
    date: "2025-04-01",
    inspector: "Demo Tarkastaja",
    overallScore: 3 as ConditionScore,
    status: "in-progress",
    categoriesEvaluated: 8,
  },
]

export default function DemoKuntoarviotPage() {
  const completedCount = inspections.filter(i => i.status === "completed").length
  const inProgressCount = inspections.filter(i => i.status === "in-progress").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Kuntoarviot</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hallinnoi ja seuraa kuntoarvioita (esimerkkidata)
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Uusi kuntoarvio
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
          <div className="space-y-3">
            {inspections.map((inspection) => (
              <Link
                key={inspection.id}
                href={`/demo/property/${inspection.propertyId}/arviointi`}
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
                    <Badge variant={inspection.status === "completed" ? "default" : "secondary"}>
                      {inspection.status === "completed" ? "Valmis" : "Kesken"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inspection.categoriesEvaluated}/17 kategoriaa
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
