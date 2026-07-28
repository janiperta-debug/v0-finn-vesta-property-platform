import { properties, formatEur, formatEurPerM2, getKlaBgColor, getKlaColor } from "@/lib/mock-data"
import { samplePropertyKuntoarvio, categories, getCategoriesForBuildingType, sampleApartments, sampleApartmentEvaluations, getApartmentSummary, getCategoryName } from "@/lib/kuntoarvio-data"
import { getTranslation } from "@/lib/i18n/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  MapPin,
  Calendar,
  Ruler,
  User,
  ClipboardCheck,
  Target,
  FileText,
  History,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  LayoutGrid,
} from "lucide-react"
import { CategoryGrid, CategorySummaryStats } from "@/components/kuntoarvio/category-card"
import { ApartmentSummaryCards, ApartmentGrid, ApartmentFloorPlan } from "@/components/kuntoarvio/apartment-grid"
import { BuildingTypeBadge } from "@/components/kuntoarvio/building-type-selector"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { t } = await getTranslation()
  const property = properties.find((p) => p.id === id) || properties[0]
  
  // Use sample kuntoarvio data for demo
  const kuntoarvio = samplePropertyKuntoarvio
  const enabledCategories = getCategoriesForBuildingType(kuntoarvio.buildingType)

  const korjausVelka = property.jalleenhankintaArvo - property.tekninenArvo
  const korjausVelkaPerM2 = korjausVelka / property.squareMeters

  // Calculate urgency counts from evaluations
  const urgentItems = kuntoarvio.evaluations.filter(e => e.overallScore <= 2).length
  const warningItems = kuntoarvio.evaluations.filter(e => e.overallScore === 3).length

  // Apartment data (only for multi-unit buildings like kerrostalo, rivitalo)
  const hasApartments = ['kerrostalo', 'rivitalo'].includes(kuntoarvio.buildingType)
  const apartmentSummary = hasApartments ? getApartmentSummary(sampleApartments) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-2xl font-bold text-foreground">{property.name}</h1>
            <Badge variant="secondary" className={`${getKlaBgColor(property.kuntoluokka)} border-0 font-mono`}>
              Kla {property.kuntoluokka}%
            </Badge>
            <BuildingTypeBadge type={kuntoarvio.buildingType} />
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
        <div className="flex flex-wrap gap-2">
          <Link href={`/demo/property/${property.id}/arviointi`}>
            <Button size="sm" className="gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Kuntoarvio
            </Button>
          </Link>
          <Link href={`/demo/property/${property.id}/historia`}>
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-foreground hover:bg-primary/10 bg-transparent">
              <History className="h-3.5 w-3.5" />
              Historia
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

      {/* Alert Banner for Urgent Items */}
      {urgentItems > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-400">
              {urgentItems} kategoriaa vaatii kiireellisiä toimenpiteitä
            </p>
            <p className="text-sm text-red-400/80 mt-0.5">
              Ikkunat ja LVI-vesi vaativat välitöntä huomiota
            </p>
          </div>
          <Link href={`/demo/property/${property.id}/arviointi`}>
            <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Tarkastele
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

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

      {/* Tabs for different views */}
      <Tabs defaultValue="kuntoarvio" className="space-y-4">
        <TabsList className="bg-muted/50 w-full overflow-x-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="kuntoarvio" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Kuntoarvio
          </TabsTrigger>
          {hasApartments && (
            <TabsTrigger value="huoneistot" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Huoneistot
              {apartmentSummary && apartmentSummary.needsAttention > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400">
                  {apartmentSummary.needsAttention}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="kuntoluokka" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Kuntoluokka
          </TabsTrigger>
          <TabsTrigger value="korjausvelka" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Korjausvelka
          </TabsTrigger>
        </TabsList>

        {/* Kuntoarvio Tab - New 17-category system */}
        <TabsContent value="kuntoarvio" className="space-y-6">
          {/* Summary Stats */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h3 className="font-heading text-base font-semibold text-foreground mb-4">Arvioinnin yhteenveto</h3>
                <CategorySummaryStats 
                  evaluations={kuntoarvio.evaluations}
                  totalCategories={enabledCategories.length}
                />
              </div>
              <div className="lg:text-right">
                <p className="text-xs text-muted-foreground mb-1">Viimeisin täysi arviointi</p>
                <p className="font-medium">{kuntoarvio.lastFullEvaluation}</p>
                <p className="text-xs text-muted-foreground mt-3 mb-1">Seuraava aikataulutettu</p>
                <p className="font-medium">{kuntoarvio.nextScheduledEvaluation}</p>
              </div>
            </div>
          </div>

          {/* Category Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold text-foreground">
                Arviointikohteet ({enabledCategories.length})
              </h3>
              <Link href={`/demo/property/${property.id}/arviointi`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  Muokkaa arviointeja
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CategoryGrid
              categoryIds={enabledCategories.map(c => c.id)}
              evaluations={kuntoarvio.evaluations}
            />
          </div>

          {/* Urgent Items */}
          {(urgentItems > 0 || warningItems > 0) && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="font-heading text-base font-semibold text-foreground mb-4">Huomioitavat kohteet</h3>
              <div className="space-y-3">
                {kuntoarvio.evaluations
                  .filter(e => e.overallScore <= 3)
                  .sort((a, b) => a.overallScore - b.overallScore)
                  .map(evaluation => {
                    const category = categories.find(c => c.id === evaluation.categoryId)
                    return (
                      <div 
                        key={evaluation.categoryId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <ConditionBadge score={evaluation.overallScore} size="sm" />
                          <div>
                            <p className="font-medium text-sm">{category ? getCategoryName(String(category.id), t) : null}</p>
                            {evaluation.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {evaluation.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <Link href={`/demo/property/${property.id}/arviointi?category=${evaluation.categoryId}`}>
                          <Button variant="ghost" size="sm">
                            Tarkastele
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Kuntoluokka Tab */}
        {/* Huoneistot Tab - Apartment-level tracking */}
        {hasApartments && apartmentSummary && (
          <TabsContent value="huoneistot" className="space-y-6">
            {/* Summary Cards */}
            <ApartmentSummaryCards summary={apartmentSummary} />

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Floor Plan Visualization */}
              <div className="lg:col-span-1">
                <ApartmentFloorPlan apartments={sampleApartments} />
              </div>

              {/* Apartment Grid */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      Huoneistot ({sampleApartments.length})
                    </h3>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      Lisää huoneisto
                    </Button>
                  </div>
                  <ApartmentGrid 
                    apartments={sampleApartments} 
                    evaluations={sampleApartmentEvaluations}
                  />
                </div>
              </div>
            </div>

            {/* Apartments needing attention */}
            {apartmentSummary.needsAttention > 0 && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
                <h3 className="font-heading text-base font-semibold text-red-400 mb-4">
                  Huoneistot jotka vaativat toimenpiteitä ({apartmentSummary.needsAttention})
                </h3>
                <div className="space-y-3">
                  {sampleApartments
                    .filter(a => a.overallCondition <= 2)
                    .map(apt => (
                      <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                          <ConditionBadge score={apt.overallCondition} size="sm" />
                          <div>
                            <p className="font-medium text-sm">{apt.number}</p>
                            <p className="text-xs text-muted-foreground">{apt.rooms} &bull; {apt.squareMeters} m²</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {apt.notes && (
                            <p className="text-sm text-muted-foreground max-w-xs truncate">{apt.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{apt.tenant ? 'Vuokrattu' : 'Vapaa'}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {/* Kuntoluokka Tab */}
        <TabsContent value="kuntoluokka" className="space-y-4">
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

            {/* Inspection info */}
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Katselmointitiedot</h3>
              <div className="space-y-4">
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
        </TabsContent>

        {/* Korjausvelka Tab */}
        <TabsContent value="korjausvelka" className="space-y-4">
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

          {/* Cost estimates from evaluations */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="mb-4 font-heading text-base font-semibold text-foreground">Kustannusarviot kategorioittain</h3>
            <div className="space-y-2">
              {kuntoarvio.evaluations
                .filter(e => e.subItemEvaluations?.some(s => s.estimatedCost))
                .map(evaluation => {
                  const category = categories.find(c => c.id === evaluation.categoryId)
                  const totalCost = evaluation.subItemEvaluations?.reduce((sum, s) => sum + (s.estimatedCost || 0), 0) || 0
                  return (
                    <div key={evaluation.categoryId} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <ConditionBadge score={evaluation.overallScore} size="sm" />
                        <span className="text-sm">{category ? getCategoryName(String(category.id), t) : null}</span>
                      </div>
                      <span className="font-medium">{formatEur(totalCost)}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
