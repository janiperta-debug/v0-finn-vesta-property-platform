"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  CalendarRange,
  Plus,
  AlertTriangle,
  Download,
} from "lucide-react"
import { toast } from "sonner"

interface InvestmentItem {
  id: string
  propertyId: number
  title: string
  category: string
  year: number
  estimatedCost: number
  priority: "low" | "medium" | "high" | "critical"
  status: "planned" | "approved" | "completed"
}

const priorityConfig = {
  low: { label: "Matala", color: "text-slate-400", bg: "bg-slate-500/20" },
  medium: { label: "Normaali", color: "text-blue-400", bg: "bg-blue-500/20" },
  high: { label: "Korkea", color: "text-amber-400", bg: "bg-amber-500/20" },
  critical: { label: "Kriittinen", color: "text-red-400", bg: "bg-red-500/20" },
}

const categoryLabels: Record<string, string> = {
  roof: "Vesikatto",
  facade: "Julkisivu",
  windows: "Ikkunat",
  hvac: "LVIA",
  electrical: "Sähkö",
  plumbing: "Putkistot",
  foundation: "Perustukset",
  interior: "Sisätilat",
  yard: "Piha-alueet",
  other: "Muu",
}

export default function TavoitesuunnitteluPage() {
  const params = useParams()
  const propertyId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState<any>(null)
  const [investments, setInvestments] = useState<InvestmentItem[]>([])
  const [filterPriority, setFilterPriority] = useState<string>("all")

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i)

  useEffect(() => {
    loadData()
  }, [propertyId])

  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()

      // Load property
      const { data: prop } = await supabase
        .from("buildings")
        .select("*")
        .eq("id", parseInt(propertyId))
        .single()

      if (prop) setProperty(prop)

      // Load investments for this building only
      const { data: invData, error } = await supabase
        .from("investment_plans")
        .select("*")
        .eq("kiinteisto_id", parseInt(propertyId))
        .order("vuosi", { ascending: true })

      if (error) {
        console.error("Investment load error:", error)
      }

      if (invData) {
        setInvestments(invData.map((i: any) => ({
          id: i.id,
          propertyId: i.kiinteisto_id,
          title: i.otsikko || "-",
          category: i.kategoria || "other",
          year: i.vuosi,
          estimatedCost: i.arvioitu_kustannus || 0,
          priority: i.prioriteetti || "medium",
          status: i.tila || "planned",
        })))
      }
    } catch (error) {
      console.error("Load error:", error)
      toast.error("Tietojen lataus epäonnistui")
    } finally {
      setLoading(false)
    }
  }

  // Filter investments
  const filteredInvestments = filterPriority === "all" 
    ? investments 
    : investments.filter(i => i.priority === filterPriority)

  // Group by year
  const investmentsByYear = years.map(year => ({
    year,
    items: filteredInvestments.filter(i => i.year === year),
    total: filteredInvestments.filter(i => i.year === year).reduce((sum, i) => sum + i.estimatedCost, 0),
  }))

  const totalInvestment = filteredInvestments.reduce((sum, i) => sum + i.estimatedCost, 0)
  const next5YearsTotal = filteredInvestments
    .filter(i => i.year <= currentYear + 5)
    .reduce((sum, i) => sum + i.estimatedCost, 0)
  const criticalCount = filteredInvestments.filter(i => i.priority === "critical").length

  function formatEur(value: number) {
    return new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/properties/${propertyId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Tavoitesuunnittelu</h1>
            <p className="text-sm text-muted-foreground">{property?.name} - 15v PTS</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Vie Excel
          </Button>
          <Button size="sm" asChild>
            <Link href={`/app/timeline/new?building_id=${propertyId}`}>
              <Plus className="mr-2 h-4 w-4" />
              Lisää investointi
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Investoinnit yhteensä (15v)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEur(totalInvestment)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredInvestments.length} suunniteltua toimenpidettä
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Seuraavat 5 vuotta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEur(next5YearsTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentYear} - {currentYear + 5}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kriittiset toimenpiteet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{criticalCount}</span>
              {criticalCount > 0 && <AlertTriangle className="h-5 w-5 text-red-500" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Prioriteetti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Kaikki</SelectItem>
            <SelectItem value="critical">Kriittinen</SelectItem>
            <SelectItem value="high">Korkea</SelectItem>
            <SelectItem value="medium">Normaali</SelectItem>
            <SelectItem value="low">Matala</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {investments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CalendarRange className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ei investointisuunnitelmaa</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Luo pitkän tähtäimen suunnitelma (PTS) lisäämällä tulevia investointeja ja korjaustarpeita tälle kiinteistölle.
            </p>
            <Button asChild>
              <Link href={`/app/timeline/new?building_id=${propertyId}`}>
                <Plus className="mr-2 h-4 w-4" />
                Lisää investointi
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {investmentsByYear.filter(y => y.items.length > 0 || y.year <= currentYear + 5).map(({ year, items, total }) => (
            <Card key={year} className={items.length === 0 ? "opacity-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={year === currentYear ? "default" : "outline"} className="text-sm">
                      {year}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {items.length} toimenpidettä
                    </span>
                  </div>
                  <span className="font-semibold">{formatEur(total)}</span>
                </div>
              </CardHeader>
              {items.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {items.map((item) => {
                      const priority = priorityConfig[item.priority] || priorityConfig.medium
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${priority.bg}`}>
                              <div className={`h-2 w-2 rounded-full ${priority.color.replace("text-", "bg-")}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {categoryLabels[item.category] || item.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className={priority.color}>
                              {priority.label}
                            </Badge>
                            <span className="text-sm font-medium">{formatEur(item.estimatedCost)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
