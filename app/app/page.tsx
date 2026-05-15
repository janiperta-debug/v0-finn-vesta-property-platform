import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Calendar,
  Euro,
  Ruler,
  ClipboardCheck,
} from "lucide-react"

// Portfolio stats type
interface PortfolioStats {
  totalProperties: number
  totalSquareMeters: number
  avgCondition: number
  totalValue: number
  repairDebt: number
  urgentItems: number
  upcomingInspections: number
}

// Mock data until database is connected
const mockStats: PortfolioStats = {
  totalProperties: 0,
  totalSquareMeters: 0,
  avgCondition: 0,
  totalValue: 0,
  repairDebt: 0,
  urgentItems: 0,
  upcomingInspections: 0,
}

function formatEur(value: number) {
  return new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fi-FI").format(value)
}

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch organization and properties
  let stats = mockStats
  let recentProperties: Array<{ id: string; name: string; address: string; condition: number; type: string }> = []
  let hasData = false
  let hasOrganization = false

  try {
    // Get user's organization
    const { data: orgUser } = await supabase
      .from('org_users')
      .select('org_id, rooli')
      .eq('user_id', user.id)
      .single()

    if (orgUser?.org_id) {
      hasOrganization = true
      // Fetch properties
      const { data: properties } = await supabase
        .from('kiinteistot')
        .select('*')
        .eq('org_id', orgUser.org_id)
        .order('luotu', { ascending: false })

      if (properties && properties.length > 0) {
        hasData = true
        const totalSqm = properties.reduce((sum, p) => sum + (p.pinta_ala || 0), 0)
        const totalValue = properties.reduce((sum, p) => sum + (p.markkina_arvo || 0), 0)
        // Use status as condition indicator for now
        const avgCondition = 70 // Default value until proper condition tracking

        stats = {
          totalProperties: properties.length,
          totalSquareMeters: totalSqm,
          avgCondition: avgCondition,
          totalValue: totalValue,
          repairDebt: 0,
          urgentItems: 0,
          upcomingInspections: 0,
        }

        recentProperties = properties.slice(0, 5).map(p => ({
          id: p.id,
          name: p.nimi || '',
          address: p.osoite || '',
          condition: 70,
          type: p.tyyppi || 'muu',
        }))
      }
    }
  } catch (error) {
    console.log("[v0] Error fetching portfolio data:", error)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Portfolio-kojelauta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yleiskatsaus kiinteistökannan tilasta
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/raportit">
              Luo raportti
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/app/properties/new">
              Lisää kiinteistö
            </Link>
          </Button>
        </div>
      </div>

      {!hasOrganization ? (
        /* No organization state */
        <Card className="border-dashed border-amber-500/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-amber-500/10 p-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ei organisaatiota</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Käyttäjätiliäsi ei ole vielä liitetty mihinkään organisaatioon. Ota yhteyttä organisaatiosi pääkäyttäjään tai FinnVestan tukeen.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="mailto:info@janope.fi">Ota yhteyttä tukeen</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/auth/logout">Kirjaudu ulos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !hasData ? (
        /* Empty state */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ei vielä kiinteistöjä</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Aloita lisäämällä ensimmäinen kiinteistö portfolioosi. Voit lisätä kiinteistöjä yksitellen tai tuoda ne CSV-tiedostosta.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/app/properties/import">Tuo CSV-tiedostosta</Link>
              </Button>
              <Button asChild>
                <Link href="/app/properties/new">Lisää kiinteistö</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Kiinteistöt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats.totalSquareMeters)} m² yhteensä
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Keskimääräinen kuntoluokka
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stats.avgCondition}%</span>
                  {stats.avgCondition >= 60 ? (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Hyvä</Badge>
                  ) : stats.avgCondition >= 40 ? (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">Tyydyttävä</Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-500 border-red-500/30">Heikko</Badge>
                  )}
                </div>
                <Progress value={stats.avgCondition} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Korjausvelka
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEur(stats.repairDebt)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatEur(stats.totalSquareMeters > 0 ? stats.repairDebt / stats.totalSquareMeters : 0)} /m²
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Kiireelliset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stats.urgentItems}</span>
                  {stats.urgentItems === 0 ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  kiinteistöä vaatii huomiota
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent properties and quick actions */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent properties */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Viimeisimmät kiinteistöt</CardTitle>
                <CardDescription>Viimeksi lisätyt tai muokatut kiinteistöt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentProperties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/app/properties/${property.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{property.name}</p>
                          <p className="text-sm text-muted-foreground">{property.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{property.condition}%</p>
                          <p className="text-xs text-muted-foreground">Kuntoluokka</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/app/properties">
                      Näytä kaikki kiinteistöt
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Pikatoiminnot</CardTitle>
                <CardDescription>Yleisimmät toiminnot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/app/properties/new">
                    <Building2 className="h-4 w-4" />
                    Lisää kiinteistö
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/app/kuntoarviot">
                    <ClipboardCheck className="h-4 w-4" />
                    Uusi kuntoarvio
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/app/timeline">
                    <Calendar className="h-4 w-4" />
                    Investointisuunnitelma
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/app/raportit">
                    <TrendingUp className="h-4 w-4" />
                    Luo raportti
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
