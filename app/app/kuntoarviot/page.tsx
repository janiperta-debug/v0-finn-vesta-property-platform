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
  ClipboardCheck,
  Plus,
  Search,
  Calendar,
  Building2,
  User,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface Inspection {
  id: string
  propertyId: string
  propertyName: string
  date: string
  inspector: string
  status: 'draft' | 'completed' | 'approved'
  overallCondition: number
  urgentItems: number
}

export default async function KuntoarviotPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch inspections from database
  let inspections: Inspection[] = []
  let properties: Array<{ id: string; name: string }> = []

  try {
    const { data: orgUsers } = await supabase
      .from('org_users')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]
    if (orgUser?.org_id) {
      // Fetch properties for "new inspection" selection
      const { data: propsData } = await supabase
        .from('buildings')
        .select('id, name')
        .eq('org_id', orgUser.org_id)
        .order('name')

      if (propsData) {
        properties = propsData.map(p => ({ id: String(p.id), name: p.name || '' }))
      }

      // Fetch inspections from kuntotarkastukset table
      const { data: inspectionsData } = await supabase
        .from('kuntotarkastukset')
        .select(`
          id,
          kiinteisto_id,
          tarkastuspvm,
          tarkastaja,
          tila,
          yleiskunto,
          kiinteistot (nimi)
        `)
        .eq('org_id', orgUser.org_id)
        .order('tarkastuspvm', { ascending: false })

      if (inspectionsData) {
        inspections = inspectionsData.map((i: any) => ({
          id: i.id,
          propertyId: i.kiinteisto_id,
          propertyName: i.kiinteistot?.nimi || 'Tuntematon',
          date: i.tarkastuspvm,
          inspector: i.tarkastaja || '-',
          status: i.tila || 'draft',
          overallCondition: i.yleiskunto ? Math.round((i.yleiskunto / 5) * 100) : 0,
          urgentItems: 0,
        }))
      }
    }
  } catch (error) {
    console.log("[v0] Error fetching inspections:", error)
  }

  const statusLabels = {
    draft: { label: 'Luonnos', variant: 'secondary' as const, icon: Clock },
    completed: { label: 'Valmis', variant: 'default' as const, icon: CheckCircle },
    approved: { label: 'Hyväksytty', variant: 'default' as const, icon: CheckCircle },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Kuntoarviot</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hallitse kiinteistöjen kuntoarvioita ja tarkastuksia
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/app/kuntoarviot/new">
            <Plus className="mr-2 h-4 w-4" />
            Uusi kuntoarvio
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kuntoarvioita yhteensä</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inspections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Luonnoksia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inspections.filter(i => i.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tarkastettavia kiinteistöjä</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inspections list */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Kaikki kuntoarviot</CardTitle>
              <CardDescription>Kiinteistöjen kuntoarviot aikajärjestyksessä</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Hae kuntoarvioita..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ei kuntoarvioita</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                {properties.length > 0 
                  ? "Aloita luomalla ensimmäinen kuntoarvio kiinteistöllesi."
                  : "Lisää ensin kiinteistö, jonka jälkeen voit luoda sille kuntoarvion."
                }
              </p>
              {properties.length > 0 ? (
                <Button asChild>
                  <Link href="/app/kuntoarviot/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Luo kuntoarvio
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/app/properties/new">
                    <Building2 className="mr-2 h-4 w-4" />
                    Lisää kiinteistö
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kiinteistö</TableHead>
                  <TableHead>Päivämäärä</TableHead>
                  <TableHead>Tarkastaja</TableHead>
                  <TableHead>Kuntoluokka</TableHead>
                  <TableHead>Tila</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map((inspection) => {
                  const statusInfo = statusLabels[inspection.status]
                  const StatusIcon = statusInfo.icon
                  return (
                    <TableRow key={inspection.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{inspection.propertyName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(inspection.date).toLocaleDateString('fi-FI')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {inspection.inspector}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{inspection.overallCondition}%</span>
                          {inspection.urgentItems > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {inspection.urgentItems}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/app/kuntoarviot/${inspection.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
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
