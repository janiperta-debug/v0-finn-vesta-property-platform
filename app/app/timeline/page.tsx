import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CalendarRange,
  Plus,
  Euro,
  Building2,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Download,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InvestmentItem {
  id: string
  propertyId: string
  propertyName: string
  title: string
  category: string
  year: number
  estimatedCost: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'planned' | 'approved' | 'completed'
}

const priorityConfig = {
  low: { label: 'Matala', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  medium: { label: 'Normaali', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  high: { label: 'Korkea', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  critical: { label: 'Kriittinen', color: 'text-red-400', bg: 'bg-red-500/20' },
}

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let investments: InvestmentItem[] = []
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i)

  try {
    const { data: orgUser } = await supabase
      .from('org_users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (orgUser?.organization_id) {
      const { data: invData } = await supabase
        .from('investment_plans')
        .select(`
          id,
          property_id,
          title,
          category,
          scheduled_year,
          estimated_cost,
          priority,
          status,
          kiinteistot (name)
        `)
        .eq('organization_id', orgUser.organization_id)
        .order('scheduled_year', { ascending: true })

      if (invData) {
        investments = invData.map((i: any) => ({
          id: i.id,
          propertyId: i.property_id,
          propertyName: i.kiinteistot?.name || 'Tuntematon',
          title: i.title,
          category: i.category || 'other',
          year: i.scheduled_year,
          estimatedCost: i.estimated_cost || 0,
          priority: i.priority || 'medium',
          status: i.status || 'planned',
        }))
      }
    }
  } catch (error) {
    console.log("[v0] Error fetching investments:", error)
  }

  // Group by year
  const investmentsByYear = years.map(year => ({
    year,
    items: investments.filter(i => i.year === year),
    total: investments.filter(i => i.year === year).reduce((sum, i) => sum + i.estimatedCost, 0),
  }))

  const totalInvestment = investments.reduce((sum, i) => sum + i.estimatedCost, 0)
  const criticalCount = investments.filter(i => i.priority === 'critical').length

  function formatEur(value: number) {
    return new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Investointiaikajana</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            15 vuoden pitkän tähtäimen suunnitelma (PTS)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Vie Excel
          </Button>
          <Button size="sm" asChild>
            <Link href="/app/timeline/new">
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
              {investments.length} suunniteltua toimenpidettä
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Seuraavat 5 vuotta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEur(investments.filter(i => i.year <= currentYear + 5).reduce((s, i) => s + i.estimatedCost, 0))}
            </div>
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
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kiinteistö" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Kaikki kiinteistöt</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
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
              Luo pitkän tähtäimen suunnitelma (PTS) lisäämällä tulevia investointeja ja korjaustarpeita.
            </p>
            <Button asChild>
              <Link href="/app/timeline/new">
                <Plus className="mr-2 h-4 w-4" />
                Lisää investointi
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {investmentsByYear.filter(y => y.items.length > 0 || y.year <= currentYear + 5).map(({ year, items, total }) => (
            <Card key={year} className={items.length === 0 ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={year === currentYear ? 'default' : 'outline'} className="text-sm">
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
                      const priority = priorityConfig[item.priority]
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${priority.bg}`}>
                              <div className={`h-2 w-2 rounded-full ${priority.color.replace('text-', 'bg-')}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                {item.propertyName}
                              </div>
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
