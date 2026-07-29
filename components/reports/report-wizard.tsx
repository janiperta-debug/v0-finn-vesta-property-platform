"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "@/lib/i18n"
import {
  Building2,
  Building,
  Layers,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  CheckCircle2,
} from "lucide-react"

type Scope = "single" | "multiple" | "portfolio"

interface WizardProperty {
  id: number
  name: string
  address: string | null
}

const TOTAL_STEPS = 4

export function ReportWizard() {
  const { t } = useTranslation()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [scope, setScope] = useState<Scope | null>(null)
  const [properties, setProperties] = useState<WizardProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [singleId, setSingleId] = useState<number | null>(null)
  const [multiIds, setMultiIds] = useState<number[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: orgUsers } = await supabase
        .from("org_users")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)

      const orgUser = orgUsers?.[0]
      if (!orgUser) { setLoading(false); return }

      const { data } = await supabase
        .from("buildings")
        .select("id, name, address")
        .eq("org_id", orgUser.org_id)
        .is("property_id", null)
        .order("name", { ascending: true })

      if (data) setProperties(data as WizardProperty[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return properties.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q),
    )
  }, [properties, search])

  // Step 1 is complete when a scope is chosen AND its required selection is done.
  const step1Complete = useMemo(() => {
    if (scope === "single") return singleId !== null
    if (scope === "multiple") return multiIds.length > 0
    if (scope === "portfolio") return true
    return false
  }, [scope, singleId, multiIds])

  function toggleMulti(id: number) {
    setMultiIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleScopeSelect(next: Scope) {
    setScope(next)
    setSearch("")
    // Reset selections that don't apply to the newly chosen scope.
    if (next !== "single") setSingleId(null)
    if (next !== "multiple") setMultiIds([])
  }

  function handleNext() {
    if (step === 1 && step1Complete) {
      setStep(2)
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  const singleProperty = properties.find((p) => p.id === singleId) ?? null

  // Placeholder summary data.
  const ESTIMATED_ASSETS = 126
  const LATEST_INSPECTION = "14.7.2026"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header with progress + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {t("reports.createReportTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("reports.wizardStepLabel")} {step} / {TOTAL_STEPS}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t("reports.wizardBack")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push("/app/raportit")}
          >
            <X className="h-4 w-4" />
            {t("reports.wizardClose")}
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleNext}
            disabled={!step1Complete}
          >
            {t("reports.wizardNext")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          {/* Main column */}
          <div className="space-y-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {t("reports.step1Question")}
            </h2>

            {/* Scope cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <ScopeCard
                icon={<Building2 className="h-6 w-6" />}
                title={t("reports.scopeSingleTitle")}
                description={t("reports.scopeSingleDesc")}
                active={scope === "single"}
                onClick={() => handleScopeSelect("single")}
              />
              <ScopeCard
                icon={<Building className="h-6 w-6" />}
                title={t("reports.scopeMultipleTitle")}
                description={t("reports.scopeMultipleDesc")}
                active={scope === "multiple"}
                onClick={() => handleScopeSelect("multiple")}
              />
              <ScopeCard
                icon={<Layers className="h-6 w-6" />}
                title={t("reports.scopePortfolioTitle")}
                description={t("reports.scopePortfolioDesc")}
                active={scope === "portfolio"}
                onClick={() => handleScopeSelect("portfolio")}
              />
            </div>

            {/* Dynamic content */}
            {scope === "single" && (
              <Card>
                <CardContent className="space-y-3 py-5">
                  <label className="text-sm font-medium text-foreground">
                    {t("reports.selectPropertyLabel")}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t("reports.searchPropertyPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <PropertyList
                    loading={loading}
                    loadingText={t("reports.loadingProperties")}
                    emptyText={t("reports.noPropertyFound")}
                    properties={filtered}
                    renderRow={(p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSingleId(p.id)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          singleId === p.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {p.name}
                          </span>
                          {p.address && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {p.address}
                            </span>
                          )}
                        </span>
                        {singleId === p.id && (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {scope === "multiple" && (
              <Card>
                <CardContent className="space-y-3 py-5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      {t("reports.selectPropertyLabel")}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {t("reports.selectedPropertiesCount")} {multiIds.length}
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t("reports.searchPropertyPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <PropertyList
                    loading={loading}
                    loadingText={t("reports.loadingProperties")}
                    emptyText={t("reports.noPropertyFound")}
                    properties={filtered}
                    renderRow={(p) => (
                      <label
                        key={p.id}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                          multiIds.includes(p.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={multiIds.includes(p.id)}
                          onCheckedChange={() => toggleMulti(p.id)}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {p.name}
                          </span>
                          {p.address && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {p.address}
                            </span>
                          )}
                        </span>
                      </label>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {scope === "portfolio" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-start gap-3 py-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm text-foreground">{t("reports.portfolioInfo")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("reports.portfolioNoSelection")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Live summary */}
          <Card className="lg:sticky lg:top-6">
            <CardContent className="space-y-4 py-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {t("reports.summaryTitle")}
                </h3>
              </div>

              {!scope ? (
                <p className="text-sm text-muted-foreground">{t("reports.summaryEmpty")}</p>
              ) : (
                <dl className="space-y-3 text-sm">
                  <SummaryRow
                    label={t("reports.summaryTitle")}
                    value={
                      scope === "single"
                        ? t("reports.scopeSingleTitle")
                        : scope === "multiple"
                          ? t("reports.scopeMultipleTitle")
                          : t("reports.scopePortfolioTitle")
                    }
                  />

                  {scope === "single" && singleProperty && (
                    <SummaryRow
                      label={t("reports.summaryProperty")}
                      value={singleProperty.name}
                    />
                  )}

                  {scope === "multiple" && (
                    <SummaryRow
                      label={t("reports.summaryPropertiesLabel")}
                      value={String(multiIds.length)}
                    />
                  )}

                  {scope === "portfolio" && (
                    <SummaryRow
                      label={t("reports.summaryPropertiesLabel")}
                      value={String(properties.length)}
                    />
                  )}

                  <SummaryRow
                    label={t("reports.summaryEstimatedAssets")}
                    value={String(ESTIMATED_ASSETS)}
                  />
                  <SummaryRow
                    label={t("reports.summaryLatestInspection")}
                    value={LATEST_INSPECTION}
                  />
                </dl>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Step 2 placeholder
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 font-heading text-lg font-semibold text-foreground">
              {t("reports.step2Title")}
            </h2>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              {t("reports.step2Description")}
            </p>
            <Button variant="outline" onClick={() => router.push("/app/raportit")}>
              {t("reports.backToReports")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ScopeCard({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-full flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all ${
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="font-heading text-base font-semibold text-foreground">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </button>
  )
}

function PropertyList({
  loading,
  loadingText,
  emptyText,
  properties,
  renderRow,
}: {
  loading: boolean
  loadingText: string
  emptyText: string
  properties: WizardProperty[]
  renderRow: (p: WizardProperty) => React.ReactNode
}) {
  if (loading) {
    return <p className="py-4 text-center text-sm text-muted-foreground">{loadingText}</p>
  }
  if (properties.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
  }
  return (
    <div className="max-h-72 space-y-2 overflow-y-auto">
      {properties.map(renderRow)}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  )
}
