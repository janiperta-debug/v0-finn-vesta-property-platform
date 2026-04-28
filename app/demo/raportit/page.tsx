"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Building2,
  TrendingUp,
  ClipboardCheck,
  PieChart
} from "lucide-react"

const reportTypes = [
  {
    id: "portfolio",
    title: "Portfolio-yhteenveto",
    description: "Koko kiinteistökannan tilannekuva",
    icon: PieChart,
    formats: ["PDF", "Excel"],
  },
  {
    id: "property",
    title: "Kiinteistöraportti",
    description: "Yksittäisen kiinteistön tiedot",
    icon: Building2,
    formats: ["PDF"],
  },
  {
    id: "kuntoarvio",
    title: "Kuntoarvioraportti",
    description: "Kuntoarvion tulokset ja suositukset",
    icon: ClipboardCheck,
    formats: ["PDF"],
  },
  {
    id: "pts",
    title: "PTS-raportti",
    description: "Pitkän tähtäimen suunnitelma",
    icon: TrendingUp,
    formats: ["PDF", "Excel"],
  },
]

const recentReports = [
  { name: "Portfolio-yhteenveto Q1 2025", date: "2025-03-15", format: "PDF" },
  { name: "Keskuskoulu - Kuntoarvio", date: "2025-03-10", format: "PDF" },
  { name: "PTS 2025-2040", date: "2025-02-28", format: "Excel" },
]

export default function DemoRaportitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Raportit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Luo ja lataa raportteja kiinteistöistäsi (esimerkkidata)
        </p>
      </div>

      {/* Report Types */}
      <div className="grid gap-4 sm:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex gap-1">
                  {report.formats.map((format) => (
                    <Badge key={format} variant="outline" className="text-xs">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Luo raportti
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Viimeisimmät raportit</CardTitle>
          <CardDescription>Lataa aiemmin luodut raportit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  {report.format === "PDF" ? (
                    <FileText className="h-5 w-5 text-red-400" />
                  ) : (
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.date).toLocaleDateString("fi-FI")}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Lataa
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
