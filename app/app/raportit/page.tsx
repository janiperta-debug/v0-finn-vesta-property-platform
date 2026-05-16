import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Download,
  Building2,
  ClipboardCheck,
  CalendarRange,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Mail,
} from "lucide-react"

const reportTypes = [
  {
    id: 'portfolio-summary',
    title: 'Portfolio-yhteenveto',
    description: 'Yleiskatsaus kaikkien kiinteistöjen tilasta, korjausvelasta ja kuntoluokista.',
    icon: Building2,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'condition-report',
    title: 'Kuntoarvioraportti',
    description: 'Yksityiskohtainen raportti kiinteistön kuntoarviosta 17 kategorian mukaan.',
    icon: ClipboardCheck,
    formats: ['PDF'],
  },
  {
    id: 'pts-report',
    title: 'PTS-raportti',
    description: '15 vuoden pitkän tähtäimen suunnitelma investoinneista ja korjauksista.',
    icon: CalendarRange,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'comparison-report',
    title: 'Vertailuraportti',
    description: 'Kiinteistöjen välinen vertailu tunnuslukujen ja kunnon osalta.',
    icon: BarChart3,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'repair-debt-report',
    title: 'Korjausvelkaraportti',
    description: 'Erittely korjausvelasta kiinteistöittäin ja komponenteittain.',
    icon: TrendingUp,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'maintenance-report',
    title: 'Huoltohistoriaraportti',
    description: 'Yhteenveto tehdyistä huoltotöistä ja korjauksista.',
    icon: FileSpreadsheet,
    formats: ['PDF', 'Excel'],
  },
]

export default async function RaportitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch properties for report generation
  let propertyCount = 0

  try {
    const { data: orgUsers } = await supabase
      .from('org_users')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]
    if (orgUser?.org_id) {
      const { count } = await supabase
        .from('buildings')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgUser.org_id)

      propertyCount = count || 0
    }
  } catch (error) {
    console.log("[v0] Error fetching property count:", error)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Raportit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Luo ja lataa raportteja kiinteistöportfoliostasi
          </p>
        </div>
      </div>

      {propertyCount === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ei raportoitavaa dataa</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Lisää kiinteistöjä portfolioosi luodaksesi raportteja.
            </p>
            <Button asChild>
              <a href="/app/properties/new">
                <Building2 className="mr-2 h-4 w-4" />
                Lisää kiinteistö
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Pikatoiminnot</CardTitle>
              <CardDescription>Luo yleisimmät raportit yhdellä klikkauksella</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Lataa portfolio-yhteenveto (PDF)
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Vie kiinteistötiedot (Excel)
                </Button>
                <Button variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Tulosta PTS-raportti
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report types */}
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Raporttityypit</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reportTypes.map((report) => {
                const Icon = report.icon
                return (
                  <Card key={report.id} className="hover:bg-muted/30 transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{report.title}</CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            {report.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {report.formats.map((format) => (
                            <Badge key={format} variant="secondary" className="text-xs">
                              {format}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Download className="h-3.5 w-3.5" />
                          Luo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Scheduled reports */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ajastetut raportit</CardTitle>
                  <CardDescription>Automaattisesti lähetettävät raportit</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Lisää ajastus
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Ei ajastettuja raportteja</p>
                <p className="text-xs mt-1">
                  Voit ajastaa raporttien lähetyksen sähköpostiin viikoittain tai kuukausittain.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
