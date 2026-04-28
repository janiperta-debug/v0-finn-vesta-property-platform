"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Plus, 
  Search, 
  Upload,
  MapPin,
  Calendar,
  Ruler,
  ChevronRight
} from "lucide-react"
import { properties, formatEur, getKlaBgColor } from "@/lib/mock-data"

export default function DemoRakennuksetPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Rakennukset</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hallinnoi kiinteistöjäsi (esimerkkidata)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Tuo CSV
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Lisää rakennus
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{properties.length}</p>
                <p className="text-sm text-muted-foreground">Rakennusta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-400/10 p-2">
                <Ruler className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {properties.reduce((sum, p) => sum + p.squareMeters, 0).toLocaleString("fi-FI")}
                </p>
                <p className="text-sm text-muted-foreground">m² yhteensä</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-2xl font-bold">
                {formatEur(properties.reduce((sum, p) => sum + p.jalleenhankintaArvo, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Jälleenhankinta-arvo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-2xl font-bold">
                {formatEur(properties.reduce((sum, p) => sum + p.tekninenArvo, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Tekninen arvo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Hae rakennuksia..." className="pl-9" />
      </div>

      {/* Buildings List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kaikki rakennukset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/demo/property/${property.id}`}
                className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Badge 
                    variant="secondary" 
                    className={`${getKlaBgColor(property.kuntoluokka)} border-0 font-mono text-sm px-2 py-1`}
                  >
                    {property.kuntoluokka}%
                  </Badge>
                  <div>
                    <p className="font-medium">{property.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {property.buildYear}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler className="h-3 w-3" />
                        {property.squareMeters.toLocaleString("fi-FI")} m²
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatEur(property.tekninenArvo)}</p>
                    <p className="text-xs text-muted-foreground">Tekninen arvo</p>
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
