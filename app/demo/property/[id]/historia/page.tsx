"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, User, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConditionBadge } from "@/components/kuntoarvio/condition-badge"
import { categories, samplePropertyKuntoarvio } from "@/lib/kuntoarvio-data"
import type { ConditionScore } from "@/lib/kuntoarvio-types"
import { properties } from "@/lib/mock-data"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts"

// Chart colors
const CHART_COLORS = {
  condition: "hsl(var(--primary))",
  trend: "hsl(var(--muted-foreground))",
  good: "hsl(142, 76%, 36%)",
  warning: "hsl(48, 96%, 53%)",
  bad: "hsl(0, 84%, 60%)",
}

// Mock evaluation history for demo (simulating multiple evaluations over time)
const MOCK_EVALUATION_HISTORY = [
  {
    date: "2022-03-15",
    evaluator: "Pekka Korhonen",
    categories: {
      perustukset: { condition: 4 },
      runko: { condition: 5 },
      julkisivut: { condition: 4 },
      ikkunat: { condition: 3 },
      ovet: { condition: 4 },
      katto: { condition: 4 },
      vesikate: { condition: 4 },
      "sisatilat-pinnat": { condition: 3 },
      "sisatilat-kalusteet": { condition: 3 },
      markatilat: { condition: 3 },
      "lvi-lammitys": { condition: 4 },
      "lvi-vesi": { condition: 3 },
      "lvi-ilmanvaihto": { condition: 4 },
      sahko: { condition: 4 },
      hissi: { condition: 3 },
      piha: { condition: 4 },
      erityisrakenteet: { condition: 4 },
    } as Record<string, { condition: number }>,
  },
  {
    date: "2023-06-20",
    evaluator: "Matti Virtanen",
    categories: {
      perustukset: { condition: 4 },
      runko: { condition: 5 },
      julkisivut: { condition: 3 },
      ikkunat: { condition: 3 },
      ovet: { condition: 4 },
      katto: { condition: 4 },
      vesikate: { condition: 3 },
      "sisatilat-pinnat": { condition: 3 },
      "sisatilat-kalusteet": { condition: 3 },
      markatilat: { condition: 3 },
      "lvi-lammitys": { condition: 4 },
      "lvi-vesi": { condition: 2 },
      "lvi-ilmanvaihto": { condition: 4 },
      sahko: { condition: 4 },
      hissi: { condition: 3 },
      piha: { condition: 3 },
      erityisrakenteet: { condition: 3 },
    } as Record<string, { condition: number }>,
  },
  {
    date: "2024-11-15",
    evaluator: "Matti Virtanen",
    categories: {
      perustukset: { condition: 4 },
      runko: { condition: 5 },
      julkisivut: { condition: 3 },
      ikkunat: { condition: 2 },
      ovet: { condition: 4 },
      katto: { condition: 4 },
      vesikate: { condition: 3 },
      "sisatilat-pinnat": { condition: 3 },
      "sisatilat-kalusteet": { condition: 4 },
      markatilat: { condition: 3 },
      "lvi-lammitys": { condition: 3 },
      "lvi-vesi": { condition: 2 },
      "lvi-ilmanvaihto": { condition: 4 },
      sahko: { condition: 4 },
      hissi: { condition: 4 },
      piha: { condition: 4 },
      erityisrakenteet: { condition: 4 },
    } as Record<string, { condition: number }>,
  },
]

export default function HistoriaPage() {
  const params = useParams()
  const propertyId = params.id as string
  
  const property = properties.find(p => p.id === propertyId)
  
  // Prepare chart data from history
  const chartData = useMemo(() => {
    return MOCK_EVALUATION_HISTORY.map(evaluation => {
      const categoryConditions: Record<string, number | null> = {}
      
      Object.entries(evaluation.categories).forEach(([catId, catEval]) => {
        categoryConditions[catId] = catEval.condition
      })
      
      // Calculate average condition
      const conditions = Object.values(categoryConditions).filter((c): c is number => c !== null)
      const avgCondition = conditions.length > 0 
        ? Math.round((conditions.reduce((a, b) => a + b, 0) / conditions.length) * 10) / 10
        : null
      
      return {
        date: new Date(evaluation.date).toLocaleDateString("fi-FI", { month: "short", year: "numeric" }),
        fullDate: evaluation.date,
        avgCondition,
        evaluator: evaluation.evaluator,
        ...categoryConditions,
      }
    })
  }, [])
  
  // Calculate trends per category
  const categoryTrends = useMemo(() => {
    const trends: Record<string, { current: number | null; previous: number | null; trend: "up" | "down" | "stable" }> = {}
    
    if (MOCK_EVALUATION_HISTORY.length >= 2) {
      const current = MOCK_EVALUATION_HISTORY[MOCK_EVALUATION_HISTORY.length - 1]
      const previous = MOCK_EVALUATION_HISTORY[MOCK_EVALUATION_HISTORY.length - 2]
      
      categories.forEach(cat => {
        const currentVal = current.categories[cat.id]?.condition
        const previousVal = previous.categories[cat.id]?.condition
        
        let trend: "up" | "down" | "stable" = "stable"
        if (currentVal && previousVal) {
          if (currentVal > previousVal) trend = "up" // Higher is better (5=best, 1=worst)
          else if (currentVal < previousVal) trend = "down"
        }
        
        trends[cat.id] = {
          current: currentVal || null,
          previous: previousVal || null,
          trend,
        }
      })
    }
    
    return trends
  }, [])
  
  // Distribution data for bar chart
  const distributionData = useMemo(() => {
    const latest = MOCK_EVALUATION_HISTORY[MOCK_EVALUATION_HISTORY.length - 1]
    const distribution = [
      { rating: "5", count: 0, label: "Erinomainen", color: CHART_COLORS.good },
      { rating: "4", count: 0, label: "Hyvä", color: CHART_COLORS.good },
      { rating: "3", count: 0, label: "Tyydyttävä", color: CHART_COLORS.warning },
      { rating: "2", count: 0, label: "Välttävä", color: CHART_COLORS.bad },
      { rating: "1", count: 0, label: "Heikko", color: CHART_COLORS.bad },
    ]
    
    Object.values(latest.categories).forEach(cat => {
      if (cat.condition) {
        const idx = 5 - cat.condition // Reverse index (5 is first, 1 is last)
        if (distribution[idx]) {
          distribution[idx].count++
        }
      }
    })
    
    return distribution
  }, [])

  if (!property) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Kohdetta ei löytynyt</p>
      </div>
    )
  }
  
  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/demo/property/${propertyId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Kuntohistoria</h1>
            <p className="text-muted-foreground">{property.address}</p>
          </div>
        </div>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Lataa raportti
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Arviointeja yhteensä</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_EVALUATION_HISTORY.length}</div>
            <p className="text-xs text-muted-foreground">
              Ensimmäinen: {new Date(MOCK_EVALUATION_HISTORY[0]?.date).toLocaleDateString("fi-FI")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Viimeisin arviointi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(MOCK_EVALUATION_HISTORY[MOCK_EVALUATION_HISTORY.length - 1]?.date).toLocaleDateString("fi-FI")}
            </div>
            <p className="text-xs text-muted-foreground">
              {MOCK_EVALUATION_HISTORY[MOCK_EVALUATION_HISTORY.length - 1]?.evaluator}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Keskimääräinen kunto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {chartData[chartData.length - 1]?.avgCondition?.toFixed(1) || "-"}
              </div>
              <ConditionBadge 
                score={Math.round(chartData[chartData.length - 1]?.avgCondition || 3) as ConditionScore} 
                size="sm" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kehityssuunta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {(() => {
                const current = chartData[chartData.length - 1]?.avgCondition
                const previous = chartData[chartData.length - 2]?.avgCondition
                if (!current || !previous) return <span className="text-2xl font-bold">-</span>
                
                const diff = current - previous
                if (diff > 0.2) return (
                  <>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <span className="text-2xl font-bold text-green-500">Parantunut</span>
                  </>
                )
                if (diff < -0.2) return (
                  <>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                    <span className="text-2xl font-bold text-red-500">Heikentynyt</span>
                  </>
                )
                return (
                  <>
                    <Minus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-2xl font-bold">Vakaa</span>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Condition Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kunnon kehitys</CardTitle>
            <CardDescription>Keskimääräinen kuntoarvio ajan yli</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis 
                    domain={[1, 5]} 
                    ticks={[1, 2, 3, 4, 5]}
                    className="text-xs"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgCondition" 
                    stroke={CHART_COLORS.condition}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.condition, r: 4 }}
                    name="Keskiarvo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kuntojakauma</CardTitle>
            <CardDescription>Kategorioiden jakautuminen kuntoarvion mukaan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="rating" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value, name, props) => [value, props.payload.label]}
                  />
                  <Bar dataKey="count" name="Kategorioita">
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Category Trends Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kategorioiden kehitys</CardTitle>
          <CardDescription>Vertailu edelliseen arviointiin</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategoria</TableHead>
                <TableHead className="text-center">Edellinen</TableHead>
                <TableHead className="text-center">Nykyinen</TableHead>
                <TableHead className="text-center">Muutos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(category => {
                const trend = categoryTrends[category.id]
                
                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-center">
                      {trend?.previous ? (
                        <ConditionBadge score={trend.previous as ConditionScore} size="sm" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {trend?.current ? (
                        <ConditionBadge score={trend.current as ConditionScore} size="sm" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendIcon trend={trend?.trend || "stable"} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Evaluation History List */}
      <Card>
        <CardHeader>
          <CardTitle>Arviointihistoria</CardTitle>
          <CardDescription>Kaikki tehdyt kuntoarviot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_EVALUATION_HISTORY.slice().reverse().map((evaluation) => (
              <div 
                key={evaluation.date} 
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Kuntoarvio {new Date(evaluation.date).toLocaleDateString("fi-FI")}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {evaluation.evaluator}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(evaluation.date).toLocaleDateString("fi-FI", { 
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Keskiarvo</p>
                    <ConditionBadge 
                      score={Math.round(
                        Object.values(evaluation.categories)
                          .filter(c => c.condition)
                          .reduce((sum, c) => sum + (c.condition || 0), 0) /
                        Object.values(evaluation.categories).filter(c => c.condition).length
                      ) as ConditionScore}
                      size="sm"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    Näytä
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
