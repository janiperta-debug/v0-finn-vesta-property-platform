"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Wrench, 
  Plus, 
  Search,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"
import { formatEur } from "@/lib/mock-data"

const maintenanceItems = [
  {
    id: "1",
    title: "Kattoremontti",
    property: "Keskuskoulu",
    category: "Katto",
    status: "completed",
    date: "2025-02-15",
    cost: 45000,
    description: "Huopakaton uusiminen",
  },
  {
    id: "2",
    title: "Ilmanvaihdon huolto",
    property: "Puiston päiväkoti",
    category: "LVI",
    status: "in-progress",
    date: "2025-03-20",
    cost: 3500,
    description: "Ilmanvaihtokoneen vuosihuolto ja suodattimien vaihto",
  },
  {
    id: "3",
    title: "Sähkötarkastus",
    property: "Virastotalo",
    category: "Sähkö",
    status: "planned",
    date: "2025-04-10",
    cost: 1200,
    description: "Lakisääteinen sähkötarkastus",
  },
  {
    id: "4",
    title: "Julkisivumaalaus",
    property: "Pääkirjasto",
    category: "Julkisivu",
    status: "completed",
    date: "2025-01-20",
    cost: 28000,
    description: "Julkisivun pesurimaalaus",
  },
  {
    id: "5",
    title: "Putkistosaneeraus",
    property: "Keskuskoulu",
    category: "LVI",
    status: "planned",
    date: "2025-06-01",
    cost: 180000,
    description: "B-siiven käyttövesiputkiston uusiminen",
  },
]

const statusConfig = {
  completed: { label: "Valmis", icon: CheckCircle, color: "text-emerald-400 bg-emerald-400/10" },
  "in-progress": { label: "Käynnissä", icon: Clock, color: "text-amber-400 bg-amber-400/10" },
  planned: { label: "Suunniteltu", icon: Calendar, color: "text-blue-400 bg-blue-400/10" },
}

export default function DemoHuoltohistoriaPage() {
  const totalCost = maintenanceItems.reduce((sum, item) => sum + item.cost, 0)
  const completedCount = maintenanceItems.filter(i => i.status === "completed").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Huoltohistoria</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Huolto- ja korjaustoimenpiteet (esimerkkidata)
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Lisää huoltotyö
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maintenanceItems.length}</p>
                <p className="text-sm text-muted-foreground">Huoltotyötä yhteensä</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-400/10 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Valmistunutta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-400/10 p-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatEur(totalCost)}</p>
                <p className="text-sm text-muted-foreground">Kokonaiskustannukset</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Hae huoltotöitä..." className="pl-9" />
      </div>

      {/* Maintenance List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Huoltotyöt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maintenanceItems.map((item) => {
              const status = statusConfig[item.status as keyof typeof statusConfig]
              const StatusIcon = status.icon
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-2 ${status.color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {item.property}
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatEur(item.cost)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("fi-FI")}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
