"use client"

// useReportData – fetches all data needed to render a full FinnVesta report.
//
// All queries are fired in parallel per building id list derived from the
// ReportConfig. Data is typed directly from lib/database.types.ts.

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ReportConfig } from "@/lib/report-engine"
import type {
  Building,
  Inspection,
  CategoryEvaluation,
  MaintenanceTask,
  InvestmentPlan,
  SubItemEvaluation,
} from "@/lib/database.types"

export interface ReportData {
  buildings: Building[]
  inspections: Inspection[]
  categoryEvaluations: CategoryEvaluation[]
  subItemEvaluations: SubItemEvaluation[]
  maintenanceTasks: MaintenanceTask[]
  investmentPlans: InvestmentPlan[]
}

export interface UseReportDataResult {
  data: ReportData | null
  loading: boolean
  error: string | null
}

const EMPTY: ReportData = {
  buildings: [],
  inspections: [],
  categoryEvaluations: [],
  subItemEvaluations: [],
  maintenanceTasks: [],
  investmentPlans: [],
}

export function useReportData(config: ReportConfig): UseReportDataResult {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stable key: comma-sorted property ids so the effect only re-runs when the
  // property selection actually changes.
  const propertyIdKey = config.properties
    .map((p) => p.id)
    .sort()
    .join(",")

  useEffect(() => {
    if (!propertyIdKey) {
      setData(EMPTY)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchAll() {
      const supabase = createClient()
      const buildingIds = config.properties.map((p) => p.id)

      // All queries run in parallel.
      const [
        buildingsRes,
        inspectionsRes,
        maintenanceRes,
        investmentRes,
      ] = await Promise.all([
        supabase
          .from("buildings")
          .select("*")
          .in("id", buildingIds),
        supabase
          .from("inspections")
          .select("*")
          .in("building_id", buildingIds)
          .order("inspection_date", { ascending: false }),
        supabase
          .from("maintenance_tasks")
          .select("*")
          .in("building_id", buildingIds)
          .order("scheduled_date", { ascending: false }),
        supabase
          .from("investment_plans")
          .select("*")
          .in("building_id", buildingIds)
          .order("plan_year", { ascending: true }),
      ])

      if (cancelled) return

      const firstError =
        buildingsRes.error ||
        inspectionsRes.error ||
        maintenanceRes.error ||
        investmentRes.error

      if (firstError) {
        setError(firstError.message)
        setLoading(false)
        return
      }

      const inspectionIds = (inspectionsRes.data ?? []).map((i) => i.id)

      // Fetch category evaluations and sub-item evaluations only if there are
      // inspections to avoid empty-array .in() calls.
      let categoryEvals: CategoryEvaluation[] = []
      let subItemEvals: SubItemEvaluation[] = []

      if (inspectionIds.length > 0) {
        const [catRes, subRes] = await Promise.all([
          supabase
            .from("category_evaluations")
            .select("*")
            .in("inspection_id", inspectionIds),
          supabase
            .from("sub_item_evaluations")
            .select("*")
            .in("inspection_id", inspectionIds),
        ])
        if (cancelled) return
        if (catRes.error) { setError(catRes.error.message); setLoading(false); return }
        if (subRes.error) { setError(subRes.error.message); setLoading(false); return }
        categoryEvals = catRes.data ?? []
        subItemEvals = subRes.data ?? []
      }

      setData({
        buildings: buildingsRes.data ?? [],
        inspections: inspectionsRes.data ?? [],
        categoryEvaluations: categoryEvals,
        subItemEvaluations: subItemEvals,
        maintenanceTasks: maintenanceRes.data ?? [],
        investmentPlans: investmentRes.data ?? [],
      })
      setLoading(false)
    }

    fetchAll().catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Tuntematon virhe")
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyIdKey])

  return { data, loading, error }
}
