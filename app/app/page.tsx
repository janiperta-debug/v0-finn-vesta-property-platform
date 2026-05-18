import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Euro,
  ClipboardCheck,
  BarChart3,
  Bell,
  Search,
} from "lucide-react"

interface PortfolioStats {
  totalProperties: number
  totalSquareMeters: number
  avgCondition: number
  totalValue: number
  repairDebt: number
  urgentItems: number
  upcomingInspections: number
}

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
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)} mrd €`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} M€`
  }
  return new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 10) return "Hyvää huomenta"
  if (hour < 18) return "Hyvää päivää"
  return "Hyvää iltaa"
}

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let userName = user.email?.split("@")[0] || "käyttäjä"
  let stats = mockStats
  let recentProperties: Array<{ id: string; name: string; address: string; condition: number; type: string }> = []
  let hasData = false
  let hasOrganization = false

  try {
    const { data: orgUsers } = await supabase
      .from('org_users')
      .select('org_id, user_name')
      .eq('user_id', user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]
    if (orgUser?.user_name) {
      userName = orgUser.user_name.split(" ")[0]
    }
    
    if (orgUser?.org_id) {
      hasOrganization = true
      const { data: properties } = await supabase
        .from('buildings')
        .select('*')
        .eq('org_id', orgUser.org_id)
        .is('property_id', null)

      if (properties && properties.length > 0) {
        hasData = true
        const totalSqm = properties.reduce((sum, p) => sum + (p.area_m2 || 0), 0)
        const totalValue = properties.reduce((sum, p) => sum + (p.cost_per_m2 || 0) * (p.area_m2 || 0), 0)

        stats = {
          totalProperties: properties.length,
          totalSquareMeters: totalSqm,
          avgCondition: 77,
          totalValue: totalValue || 1260000000,
          repairDebt: 22400000,
          urgentItems: 3,
          upcomingInspections: 2,
        }

        recentProperties = properties.slice(0, 5).map(p => ({
          id: String(p.id),
          name: p.name || '',
          address: p.address || '',
          condition: 70 + Math.floor(Math.random() * 25),
          type: p.building_type || 'muu',
        }))
      }
    }
  } catch (error) {
    console.log("[v0] Error fetching portfolio data:", error)
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Large Image - Responsive images for different orientations */}
      <div className="relative overflow-hidden rounded-2xl min-h-[400px] md:min-h-[450px]">
        {/* Desktop landscape image */}
        <div className="absolute inset-0 hidden md:block">
          <Image
            src="/images/hero-cityscape.jpg"
            alt="Portfolio näkymä"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Mobile portrait image */}
        <div className="absolute inset-0 md:hidden">
          <Image
            src="/images/hero-cityscape-mobile.jpg"
            alt="Portfolio näkymä"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        
        <div className="relative flex h-full min-h-[400px] md:min-h-[450px] flex-col justify-between px-6 py-8 md:px-8">
          {/* Top: Header with greeting */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                {getGreeting()}, {userName}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Tässä on kiinteistösalkkusi tilannekuva
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70">
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Hae kiinteistöjä</span>
                <span className="sm:hidden">Hae</span>
              </Button>
              <Button variant="outline" size="icon" className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bottom: Key stats overlaid on image */}
          {hasData && (
            <div className="mt-auto grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">Salkun arvo</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{formatEur(stats.totalValue)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
                  <TrendingUp className="h-3 w-3" />
                  +4,7%
                </p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">Kiinteistöjä</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{stats.totalProperties}</p>
                <p className="mt-1 text-xs text-muted-foreground">+3 kpl</p>
              </div>

              <div className="rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md">
                <p className="text-xs text-muted-foreground">Käyttöaste</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">89%</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
                  <TrendingUp className="h-3 w-3" />
                  +2,1%
                </p>
              </div>

              <div className="hidden rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md md:block">
                <p className="text-xs text-muted-foreground">Riskiscore</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">41<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
                  <TrendingDown className="h-3 w-3" />
                  -5
                </p>
              </div>

              <div className="hidden rounded-xl border border-border/30 bg-card/60 p-4 backdrop-blur-md lg:block">
                <p className="text-xs text-muted-foreground">Kunnossapitovelka</p>
                <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{formatEur(stats.repairDebt)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <TrendingDown className="h-3 w-3" />
                  -3,2 M€
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasOrganization ? (
        <Card className="border-dashed border-amber-500/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-amber-500/10 p-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ei organisaatiota</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Käyttäjätiliäsi ei ole vielä liitetty mihinkään organisaatioon.
            </p>
            <Button variant="outline" asChild>
              <Link href="mailto:info@janope.fi">Ota yhteyttä tukeen</Link>
            </Button>
          </CardContent>
        </Card>
      ) : !hasData ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ei vielä kiinteistöjä</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Aloita lisäämällä ensimmäinen kiinteistö portfolioosi.
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent properties */}
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Kiinteistöt</CardTitle>
                  <CardDescription>Viimeksi muokatut</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/properties">
                    Näytä kaikki
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/app/properties/${property.id}`}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4 transition-all hover:border-primary/30 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{property.name}</p>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${property.condition >= 70 ? 'bg-emerald-500' : property.condition >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="font-medium">{property.condition}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Kuntoluokka</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Pikatoiminnot</CardTitle>
              <CardDescription>Yleisimmät toiminnot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50 bg-muted/30 hover:bg-muted/50" asChild>
                <Link href="/app/properties/new">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  Lisää kiinteistö
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50 bg-muted/30 hover:bg-muted/50" asChild>
                <Link href="/app/kuntoarviot/new">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  Uusi kuntoarvio
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50 bg-muted/30 hover:bg-muted/50" asChild>
                <Link href="/app/timeline">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  Investointisuunnitelma
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50 bg-muted/30 hover:bg-muted/50" asChild>
                <Link href="/app/raportit">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <BarChart3 className="h-4 w-4 text-amber-500" />
                  </div>
                  Luo raportti
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
