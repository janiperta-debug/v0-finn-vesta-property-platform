import { createClient } from "@/lib/supabase/server"
import { getTranslation } from "@/lib/i18n/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BarChart3,
  Building2,
  ArrowUpDown,
  Euro,
  Ruler,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PropertyComparison {
  id: string
  name: string
  address: string
  buildingType: string
  yearBuilt: number
  squareMeters: number
  conditionClass: number
  repairDebt: number
  repairDebtPerSqm: number
  technicalValue: number
  replacementValue: number
}

export default async function VertailuPage() {
  const { locale, t } = await getTranslation()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let properties: PropertyComparison[] = []

  try {
    const { data: orgUsers } = await supabase
      .from('org_users')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]
    if (orgUser?.org_id) {
      const { data: propsData } = await supabase
        .from('buildings')
        .select('*')
        .eq('org_id', orgUser.org_id)
        .order('name')

      if (propsData) {
        properties = propsData.map((p: any) => {
          const replacementValue = (p.area_m2 || 0) * (p.cost_per_m2 || 2500)
          const technicalValue = replacementValue * ((p.condition_class || 70) / 100)
          const repairDebt = replacementValue - technicalValue
          return {
            id: p.id,
            name: p.name || t("comparison.unnamed"),
            address: p.address || '',
            buildingType: p.building_type || 'muu',
            yearBuilt: p.construction_year || 0,
            squareMeters: p.area_m2 || 0,
            conditionClass: p.condition_class || 0,
            repairDebt: repairDebt,
            repairDebtPerSqm: p.area_m2 ? repairDebt / p.area_m2 : 0,
            technicalValue: technicalValue,
            replacementValue: replacementValue,
          }
        })
      }
    }
  } catch (error) {
    console.log("[v0] Error fetching properties:", error)
  }

  // Calculate averages
  const avgCondition = properties.length > 0 
    ? Math.round(properties.reduce((s, p) => s + p.conditionClass, 0) / properties.length)
    : 0
  const avgRepairDebtPerSqm = properties.length > 0
    ? properties.reduce((s, p) => s + p.repairDebtPerSqm, 0) / properties.length
    : 0

  function formatEur(value: number) {
    return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat(locale).format(value)
  }

  const buildingTypeLabels: Record<string, string> = {
    kerrostalo: t("propertyTypes.kerrostalo"),
    rivitalo: t("propertyTypes.rivitalo"),
    paritalo: t("propertyTypes.paritalo"),
    omakotitalo: t("propertyTypes.omakotitalo"),
    toimisto: t("propertyTypes.toimisto"),
    varasto: t("comparison.varasto"),
    teollisuus: t("propertyTypes.teollisuus"),
    muu: t("propertyTypes.muu"),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("comparison.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("comparison.subtitle")}
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("comparison.emptyTitle")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {t("comparison.emptyDescription")}
            </p>
            <Button asChild>
              <Link href="/app/properties/new">
                <Building2 className="mr-2 h-4 w-4" />
                {t("comparison.addProperty")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("comparison.propertiesLabel")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{properties.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("comparison.avgConditionLabel")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{avgCondition}%</span>
                  {avgCondition >= 60 ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  ) : avgCondition >= 40 ? (
                    <TrendingDown className="h-5 w-5 text-amber-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("comparison.avgRepairDebtPerSqmLabel")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatEur(avgRepairDebtPerSqm)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("comparison.totalRepairDebtLabel")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatEur(properties.reduce((s, p) => s + p.repairDebt, 0))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison table */}
          <Card>
            <CardHeader>
              <CardTitle>Kiinteistövertailu</CardTitle>
              <CardDescription>Vertaa kiinteistöjen tunnuslukuja</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Kiinteistö</TableHead>
                      <TableHead>Tyyppi</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Ruler className="h-4 w-4" />
                          Pinta-ala
                        </div>
                      </TableHead>
                      <TableHead>Rakennettu</TableHead>
                      <TableHead>Kuntoluokka</TableHead>
                      <TableHead className="text-right">Korjausvelka</TableHead>
                      <TableHead className="text-right">€/m²</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <Link 
                            href={`/app/properties/${property.id}`}
                            className="hover:underline"
                          >
                            <div>
                              <p className="font-medium">{property.name}</p>
                              <p className="text-xs text-muted-foreground">{property.address}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {buildingTypeLabels[property.buildingType] || property.buildingType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(property.squareMeters)} m²
                        </TableCell>
                        <TableCell>{property.yearBuilt || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={property.conditionClass} 
                              className="w-16 h-2"
                            />
                            <span className={`text-sm font-medium ${
                              property.conditionClass >= 60 ? 'text-emerald-500' :
                              property.conditionClass >= 40 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {property.conditionClass}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatEur(property.repairDebt)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatEur(property.repairDebtPerSqm)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Condition distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Kuntoluokkajakauma</CardTitle>
                <CardDescription>Kiinteistöt kuntoluokan mukaan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Erinomainen (80-100%)', min: 80, max: 100, color: 'bg-emerald-500' },
                    { label: 'Hyvä (60-79%)', min: 60, max: 79, color: 'bg-emerald-400' },
                    { label: 'Tyydyttävä (40-59%)', min: 40, max: 59, color: 'bg-amber-500' },
                    { label: 'Välttävä (20-39%)', min: 20, max: 39, color: 'bg-orange-500' },
                    { label: 'Heikko (0-19%)', min: 0, max: 19, color: 'bg-red-500' },
                  ].map(({ label, min, max, color }) => {
                    const count = properties.filter(p => p.conditionClass >= min && p.conditionClass <= max).length
                    const percentage = properties.length > 0 ? (count / properties.length) * 100 : 0
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{label}</span>
                          <span className="font-medium">{count} kpl</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full ${color} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Korjausvelka kiinteistöittäin</CardTitle>
                <CardDescription>Suurimmat korjausvelat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...properties]
                    .sort((a, b) => b.repairDebt - a.repairDebt)
                    .slice(0, 5)
                    .map((property) => {
                      const maxDebt = Math.max(...properties.map(p => p.repairDebt))
                      const percentage = maxDebt > 0 ? (property.repairDebt / maxDebt) * 100 : 0
                      return (
                        <div key={property.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium truncate max-w-[60%]">{property.name}</span>
                            <span>{formatEur(property.repairDebt)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
