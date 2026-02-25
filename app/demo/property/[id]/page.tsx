import { properties, formatEur, formatEurPerM2, getKlaBgColor, getKlaColor } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  MapPin,
  Calendar,
  Ruler,
  User,
  Component,
  Target,
  FileText,
} from "lucide-react"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = properties.find((p) => p.id === id) || properties[0]

  const korjausVelka = property.jalleenhankintaArvo - property.tekninenArvo
  const korjausVelkaPerM2 = korjausVelka / property.squareMeters

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-foreground">{property.name}</h1>
            <Badge variant="secondary" className={`${getKlaBgColor(property.kuntoluokka)} border-0 font-mono`}>
              Kla {property.kuntoluokka}%
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {property.address}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {property.tunnus}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/demo/components/${property.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-foreground hover:bg-primary/10 bg-transparent">
              <Component className="h-3.5 w-3.5" />
              Komponentit
            </Button>
          </Link>
          <Link href={`/demo/target/${property.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-foreground hover:bg-primary/10 bg-transparent">
              <Target className="h-3.5 w-3.5" />
              Tavoitesuunnittelu
            </Button>
          </Link>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Rakennusvuosi
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">{property.buildYear}</p>
          <p className="mt-1 text-xs text-muted-foreground">{new Date().getFullYear() - property.buildYear} vuotta vanha</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Ruler className="h-3.5 w-3.5" />
            Pinta-ala
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">
            {property.squareMeters.toLocaleString("fi-FI")} m&sup2;
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Ktt: {property.ktt}</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Jälleenhankinta-arvo
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">{formatEur(property.jalleenhankintaArvo)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatEurPerM2(property.jalleenhankintaArvo / property.squareMeters)}</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Tekninen arvo
          </div>
          <p className={`font-heading text-2xl font-bold ${getKlaColor(property.kuntoluokka)}`}>
            {formatEur(property.tekninenArvo)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{formatEurPerM2(property.tekninenArvo / property.squareMeters)}</p>
        </div>
      </div>

      {/* Condition & Debt */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Kuntoluokka</h3>
          <div className="flex items-end gap-4">
            <div className={`font-heading text-5xl font-bold ${getKlaColor(property.kuntoluokka)}`}>
              {property.kuntoluokka}%
            </div>
            <div className="pb-1 text-sm text-muted-foreground">
              {property.kuntoluokka >= 75 ? "Erinomainen kunto" : property.kuntoluokka >= 60 ? "Tyydyttävä kunto" : "Heikko kunto - toimenpiteitä tarvitaan"}
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full ${property.kuntoluokka >= 75 ? "bg-emerald-400" : property.kuntoluokka >= 60 ? "bg-amber-400" : "bg-red-400"}`}
              style={{ width: `${Math.min(property.kuntoluokka, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>60% (tyydyttävä)</span>
            <span>75% (hyvä)</span>
            <span>100%</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Korjausvelka</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Korjausvelka yhteensä</span>
                <span className="font-heading font-bold text-amber-400">{formatEur(korjausVelka)}</span>
              </div>
              <p className="mt-0.5 text-right text-xs text-muted-foreground">{formatEurPerM2(korjausVelkaPerM2)}</p>
            </div>
            <div className="space-y-2 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kunnossapitotarve</span>
                <span className="text-foreground">{formatEur(korjausVelka * 0.35)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Peruskorjaustarve</span>
                <span className="text-foreground">{formatEur(korjausVelka * 0.42)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Perusparannustarve</span>
                <span className="text-foreground">{formatEur(korjausVelka * 0.23)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection info */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Katselmointitiedot</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Viimeisin katselmointi</p>
              <p className="text-sm font-medium text-foreground">{new Date(property.lastInspectionDate).toLocaleDateString("fi-FI")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Katselmoija</p>
              <p className="text-sm font-medium text-foreground">{property.inspector}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tyyppi</p>
              <p className="text-sm font-medium text-foreground">{property.type}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
