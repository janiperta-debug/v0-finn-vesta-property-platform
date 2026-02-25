"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { conditionDistribution, buildingTypeDistribution } from "@/lib/mock-data"

const PIE_COLORS = ["hsl(180, 40%, 45%)", "hsl(215, 60%, 50%)", "hsl(350, 50%, 55%)"]

export function PortfolioCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Condition Distribution */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-1 font-heading text-base font-semibold text-foreground">Kuntoluokkajakauma</h3>
        <p className="mb-4 text-xs text-muted-foreground">156 kiinteistoa</p>
        <div className="flex items-center justify-center gap-6">
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conditionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {conditionDistribution.map((_, index) => (
                    <Cell key={`cell-${conditionDistribution[index].name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {conditionDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                <div>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                  <p className="font-heading text-sm font-semibold text-foreground">{item.value} kpl</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Building Type Distribution */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-1 font-heading text-base font-semibold text-foreground">Rakennustyyppijakauma</h3>
        <p className="mb-4 text-xs text-muted-foreground">Keskimaarainen kuntoluokka tyypeittain</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buildingTypeDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="type"
                tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 35%, 9%)",
                  border: "1px solid hsl(215, 25%, 16%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 20%, 92%)",
                }}
                formatter={(value: number) => [`${value}%`, "Kla"]}
              />
              <Bar dataKey="avgKla" fill="hsl(40, 60%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
