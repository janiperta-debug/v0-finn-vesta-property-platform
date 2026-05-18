import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  Building2,
  Euro,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MaintenanceTask {
  id: string
  propertyId: string
  propertyName: string
  title: string
  description: string
  category: string
  date: string
  cost: number
  status: 'planned' | 'in-progress' | 'completed'
  contractor?: string
}

const categoryLabels: Record<string, string> = {
  'hvac': 'LVI',
  'electrical': 'Sähkö',
  'structural': 'Rakenne',
  'roof': 'Katto',
  'facade': 'Julkisivu',
  'interior': 'Sisätilat',
  'outdoor': 'Piha-alueet',
  'other': 'Muu',
}

export default async function HuoltohistoriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let tasks: MaintenanceTask[] = []
  let totalCost = 0
  let completedCount = 0
  let plannedCount = 0

  try {
    const { data: orgUsers } = await supabase
      .from('org_users')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]
    if (orgUser?.org_id) {
      const { data: tasksData } = await supabase
        .from('huoltotyot')
        .select('*')
        .eq('org_id', orgUser.org_id)
        .order('pvm', { ascending: false })

      if (tasksData) {
        // Get building names separately
        const buildingIds = [...new Set(tasksData.map((t: any) => t.kiinteisto_id).filter(Boolean))]
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

        tasks = tasksData.map((t: any) => ({
          id: t.id,
          propertyId: t.kiinteisto_id,
          propertyName: buildingMap.get(t.kiinteisto_id) || 'Tuntematon',
          title: t.otsikko || '-',
          description: t.kuvaus || '',
          category: t.kategoria || 'other',
          date: t.pvm,
          cost: t.kustannus || 0,
          status: t.tila || 'planned',
          contractor: t.urakoitsija,
        }))

        totalCost = tasks.reduce((sum, t) => sum + t.cost, 0)
        completedCount = tasks.filter(t => t.status === 'completed').length
        plannedCount = tasks.filter(t => t.status === 'planned').length
      }
    }
  } catch (error) {
    console.log("[v0] Error fetching maintenance tasks:", error)
  }

  const statusConfig = {
    planned: { label: 'Suunniteltu', variant: 'secondary' as const, icon: Clock },
    'in-progress': { label: 'Käynnissä', variant: 'default' as const, icon: AlertCircle },
    completed: { label: 'Valmis', variant: 'outline' as const, icon: CheckCircle },
  }

  function formatEur(value: number) {
    return new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Huoltohistoria</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seuraa ja hallitse kiinteistöjen huoltotöitä ja korjauksia
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/app/huoltohistoria/new">
            <Plus className="mr-2 h-4 w-4" />
            Lisää huoltotyö
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Huoltotöitä yhteensä</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valmiit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{completedCount}</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Suunnitellut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{plannedCount}</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kustannukset yhteensä</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEur(totalCost)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Task list */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Huoltotyöt</CardTitle>
              <CardDescription>Kaikki huolto- ja korjaustyöt</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Hae..."
                  className="pl-9"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-36">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tila" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Kaikki</SelectItem>
                  <SelectItem value="planned">Suunnitellut</SelectItem>
                  <SelectItem value="in-progress">Käynnissä</SelectItem>
                  <SelectItem value="completed">Valmiit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ei huoltotöitä</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Huoltohistoria on tyhjä. Lisää ensimmäinen huoltotyö aloittaaksesi seurannan.
              </p>
              <Button asChild>
                <Link href="/app/huoltohistoria/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Lisää huoltotyö
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Työ</TableHead>
                  <TableHead>Kiinteistö</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Päivämäärä</TableHead>
                  <TableHead>Kustannus</TableHead>
                  <TableHead>Tila</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const statusInfo = statusConfig[task.status]
                  const StatusIcon = statusInfo.icon
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.contractor && (
                            <p className="text-xs text-muted-foreground">{task.contractor}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {task.propertyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[task.category] || task.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.date).toLocaleDateString('fi-FI')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Euro className="h-4 w-4 text-muted-foreground" />
                          {formatEur(task.cost)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
