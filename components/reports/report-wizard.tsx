"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n"
import {
  REPORT_MODULES,
  REPORT_GROUPS,
  type ReportGroup,
  type ReportModuleConfig,
} from "@/lib/report-modules"
import {
  REPORT_PURPOSES,
  TIME_HORIZONS,
  DETAIL_LEVELS,
  VISUAL_SETTINGS,
  BRANDING_OPTIONS,
  DEFAULT_PURPOSE,
  DEFAULT_TIME_HORIZON,
  DEFAULT_DETAIL_LEVEL,
  DEFAULT_BRANDING,
  defaultVisualSettings,
} from "@/lib/report-options"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  Building,
  Layers,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react"

type Scope = "single" | "multiple" | "portfolio"

const GROUP_LABEL_KEYS: Record<ReportGroup, string> = {
  overview: "reports.groupOverview",
  inspection: "reports.groupInspection",
  maintenance: "reports.groupMaintenance",
  financial: "reports.groupFinancial",
}

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

  // Step 3 – report options state.
  const [reportTitle, setReportTitle] = useState("")
  const [reportLanguage, setReportLanguage] = useState("fi")
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split("T")[0])
  const [purpose, setPurpose] = useState(DEFAULT_PURPOSE)
  const [timeHorizon, setTimeHorizon] = useState(DEFAULT_TIME_HORIZON)
  const [detailLevel, setDetailLevel] = useState(DEFAULT_DETAIL_LEVEL)
  const [visualSettings, setVisualSettings] = useState<Record<string, boolean>>(defaultVisualSettings)
  const [branding, setBranding] = useState(DEFAULT_BRANDING)

  // Step 4 – success screen shown after Generate is pressed.
  const [generated, setGenerated] = useState(false)

  // Step 2 – report composition. Selected modules + which one is expanded.
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    () =>
      new Set(
        REPORT_MODULES.filter((m) => m.defaultSelected || m.required).map((m) => m.id),
      ),
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  function toggleModule(id: string) {
    const mod = REPORT_MODULES.find((m) => m.id === id)
    if (mod?.required) return // required modules can't be deselected
    setSelectedModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function toggleVisual(id: string) {
    setVisualSettings((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Live report summary for step 2, recomputed on every selection change.
  const moduleSummary = useMemo(() => {
    const selected = REPORT_MODULES.filter((m) => selectedModules.has(m.id))
    const multiplier =
      DETAIL_LEVELS.find((d) => d.id === detailLevel)?.pageMultiplier ?? 1
    return {
      count: selected.length,
      pages: Math.round(selected.reduce((sum, m) => sum + m.estimatedPages, 0) * multiplier),
      photos: selected.reduce((sum, m) => sum + m.estimatedPhotos, 0),
      tables: selected.reduce((sum, m) => sum + m.estimatedTables, 0),
    }
  }, [selectedModules, detailLevel])

  // Estimated generation time in minutes (rough heuristic).
  const estimatedGenMinutes = useMemo(
    () => Math.max(1, Math.round(moduleSummary.pages / 8)),
    [moduleSummary.pages],
  )

  function handleScopeSelect(next: Scope) {
    setScope(next)
    setSearch("")
    // Reset selections that don't apply to the newly chosen scope.
    if (next !== "single") setSingleId(null)
    if (next !== "multiple") setMultiIds([])
  }

  // Step 1: needs scope + selection. Steps 2–3: always ok. Step 4: no Next button.
  const canProceed = step === 1 ? step1Complete : step < 4

  function handleNext() {
    if (!canProceed) return
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
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
            disabled={!canProceed}
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

      {step === 1 && (
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
      )}

      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          {/* Main column – grouped report modules */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {t("reports.composeTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("reports.composeSubtitle")}
              </p>
            </div>

            {REPORT_GROUPS.map((group) => {
              const mods = REPORT_MODULES.filter((m) => m.group === group)
              if (mods.length === 0) return null
              return (
                <section key={group} className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(GROUP_LABEL_KEYS[group])}
                  </h3>
                  <div className="space-y-2">
                    {mods.map((mod) => (
                      <ModuleRow
                        key={mod.id}
                        mod={mod}
                        selected={selectedModules.has(mod.id)}
                        expanded={expandedId === mod.id}
                        onToggle={() => toggleModule(mod.id)}
                        onExpand={() => toggleExpand(mod.id)}
                        t={t}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

          {/* Live report summary */}
          <Card className="lg:sticky lg:top-6">
            <CardContent className="space-y-4 py-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {t("reports.summaryTitle")}
                </h3>
              </div>
              <dl className="space-y-3 text-sm">
                <SummaryRow
                  label={t("reports.summaryModulesSelected")}
                  value={String(moduleSummary.count)}
                />
                <SummaryRow
                  label={t("reports.summaryEstPages")}
                  value={String(moduleSummary.pages)}
                />
                <SummaryRow
                  label={t("reports.summaryEstPhotos")}
                  value={String(moduleSummary.photos)}
                />
                <SummaryRow
                  label={t("reports.summaryEstTables")}
                  value={String(moduleSummary.tables)}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          {/* Main column */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {t("reports.optionsTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("reports.optionsSubtitle")}
              </p>
            </div>

            {/* Section 1 – Report information */}
            <OptionsSection label={t("reports.sectionReportInfo")}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t("reports.fieldReportTitle")}
                  </label>
                  <Input
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder={t("reports.reportTitlePlaceholder")}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t("reports.fieldReportLanguage")}
                  </label>
                  <Select value={reportLanguage} onValueChange={setReportLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fi">Suomi</SelectItem>
                      <SelectItem value="sv">Svenska</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="et">Eesti</SelectItem>
                      <SelectItem value="lv">Latviešu</SelectItem>
                      <SelectItem value="lt">Lietuvių</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t("reports.fieldReportDate")}
                  </label>
                  <Input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
                </div>
              </div>
            </OptionsSection>

            {/* Section 2 – Purpose */}
            <OptionsSection label={t("reports.sectionPurpose")}>
              <p className="mb-3 text-xs text-muted-foreground">{t("reports.purposeHint")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {REPORT_PURPOSES.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      purpose === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioDot active={purpose === opt.id} onClick={() => setPurpose(opt.id)} />
                    <span className="text-sm text-foreground">{t(opt.labelKey)}</span>
                  </label>
                ))}
              </div>
            </OptionsSection>

            {/* Section 3 – Time horizon */}
            <OptionsSection label={t("reports.sectionTimeHorizon")}>
              <p className="mb-3 text-xs text-muted-foreground">{t("reports.timeHorizonHint")}</p>
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_HORIZONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </OptionsSection>

            {/* Section 4 – Detail level */}
            <OptionsSection label={t("reports.sectionDetailLevel")}>
              <div className="space-y-2">
                {DETAIL_LEVELS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${
                      detailLevel === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioDot active={detailLevel === opt.id} onClick={() => setDetailLevel(opt.id)} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {t(opt.labelKey)}
                      </span>
                      {opt.descriptionKey && (
                        <span className="block text-xs text-muted-foreground">
                          {t(opt.descriptionKey)}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </OptionsSection>

            {/* Section 5 – Visual settings */}
            <OptionsSection label={t("reports.sectionVisualSettings")}>
              <div className="grid gap-2 sm:grid-cols-2">
                {VISUAL_SETTINGS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      visualSettings[opt.id]
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={!!visualSettings[opt.id]}
                      onCheckedChange={() => toggleVisual(opt.id)}
                    />
                    <span className="text-sm text-foreground">{t(opt.labelKey)}</span>
                  </label>
                ))}
              </div>
            </OptionsSection>

            {/* Section 6 – Branding */}
            <OptionsSection label={t("reports.sectionBranding")}>
              <div className="space-y-2">
                {BRANDING_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      branding === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioDot active={branding === opt.id} onClick={() => setBranding(opt.id)} />
                    <span className="text-sm text-foreground">{t(opt.labelKey)}</span>
                  </label>
                ))}
              </div>
            </OptionsSection>
          </div>

          {/* Sticky summary */}
          <Card className="lg:sticky lg:top-6">
            <CardContent className="space-y-4 py-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {t("reports.summaryTitle")}
                </h3>
              </div>
              <dl className="space-y-3 text-sm">
                {scope === "single" && singleProperty && (
                  <SummaryRow label={t("reports.summaryProperty")} value={singleProperty.name} />
                )}
                {scope === "multiple" && (
                  <SummaryRow label={t("reports.summaryPropertiesLabel")} value={String(multiIds.length)} />
                )}
                {scope === "portfolio" && (
                  <SummaryRow label={t("reports.summaryPropertiesLabel")} value={String(properties.length)} />
                )}
                <SummaryRow label={t("reports.summaryModulesSelected")} value={String(moduleSummary.count)} />
                <SummaryRow label={t("reports.summaryEstPages")} value={String(moduleSummary.pages)} />
                <SummaryRow
                  label={t("reports.summaryLanguage")}
                  value={reportLanguage.toUpperCase()}
                />
                <SummaryRow
                  label={t("reports.summaryDetailLevel")}
                  value={t(DETAIL_LEVELS.find((d) => d.id === detailLevel)?.labelKey ?? "")}
                />
                <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {t("reports.summaryGenTime")}
                  </dt>
                  <dd className="font-medium text-foreground">
                    ~{estimatedGenMinutes} {t("reports.genTimeMinutes")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 4 && !generated && (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          {/* Left – scrollable page previews */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {t("reports.step4Title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("reports.step4Subtitle")}
              </p>
            </div>

            {/* Placeholder validation banner */}
            {!reportTitle && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {t("reports.validationWarning")}
                </p>
                <Button size="sm" variant="outline" onClick={() => setStep(3)}>
                  {t("reports.validationBack")}
                </Button>
              </div>
            )}

            {/* Preview pages – built dynamically from selected modules */}
            <ReportPreview
              selectedModules={selectedModules}
              modules={REPORT_MODULES}
              coverTitle={reportTitle || (singleProperty?.name ?? "")}
              reportDate={reportDate}
              t={t}
            />
          </div>

          {/* Right – sticky summary + generate */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card>
              <CardContent className="space-y-3 py-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-sm font-semibold text-foreground">
                    {t("reports.summaryTitle")}
                  </h3>
                </div>
                <dl className="space-y-2.5 text-sm">
                  {scope === "single" && singleProperty && (
                    <SummaryRow label={t("reports.summaryProperty")} value={singleProperty.name} />
                  )}
                  {scope === "multiple" && (
                    <SummaryRow label={t("reports.summaryPropertiesLabel")} value={String(multiIds.length)} />
                  )}
                  {scope === "portfolio" && (
                    <SummaryRow label={t("reports.summaryPropertiesLabel")} value={String(properties.length)} />
                  )}
                  {reportTitle && (
                    <SummaryRow label={t("reports.fieldReportTitle")} value={reportTitle} />
                  )}
                  <SummaryRow label={t("reports.summaryLanguage")} value={reportLanguage.toUpperCase()} />
                  <SummaryRow
                    label={t("reports.summaryPurpose")}
                    value={t(REPORT_PURPOSES.find((p) => p.id === purpose)?.labelKey ?? "")}
                  />
                  <SummaryRow
                    label={t("reports.summaryDetailLevel")}
                    value={t(DETAIL_LEVELS.find((d) => d.id === detailLevel)?.labelKey ?? "")}
                  />
                  <SummaryRow
                    label={t("reports.summaryTimeHorizon")}
                    value={t(TIME_HORIZONS.find((h) => h.id === timeHorizon)?.labelKey ?? "")}
                  />
                  <SummaryRow label={t("reports.summaryModulesSelected")} value={String(moduleSummary.count)} />
                  <SummaryRow label={t("reports.summaryEstPages")} value={String(moduleSummary.pages)} />
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-2.5">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {t("reports.summaryGenTime")}
                    </dt>
                    <dd className="font-medium text-foreground">
                      ~{estimatedGenMinutes} {t("reports.genTimeMinutes")}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              onClick={() => setGenerated(true)}
            >
              {t("reports.generateButton")}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {t("reports.generateSaveNote")}
            </p>
          </div>
        </div>
      )}

      {step === 4 && generated && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 font-heading text-xl font-bold text-foreground">
              {t("reports.successTitle")}
            </h2>
            <p className="mb-8 max-w-sm text-sm text-muted-foreground">
              {t("reports.successMessage")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.push("/app/raportit")}>
                {t("reports.successOpen")}
              </Button>
              <Button variant="outline" onClick={() => router.push("/app/raportit")}>
                {t("reports.successBackToCenter")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ModuleRow({
  mod,
  selected,
  expanded,
  onToggle,
  onExpand,
  t,
}: {
  mod: ReportModuleConfig
  selected: boolean
  expanded: boolean
  onToggle: () => void
  onExpand: () => void
  t: (key: string) => string
}) {
  const Icon = mod.icon
  return (
    <div
      className={`rounded-lg border transition-colors ${
        selected ? "border-primary/50 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <Checkbox
          checked={selected}
          disabled={mod.required}
          onCheckedChange={onToggle}
          aria-label={t(mod.titleKey)}
        />
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
            selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-foreground">{t(mod.titleKey)}</span>
            {mod.badgeKey && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                {t(mod.badgeKey)}
              </Badge>
            )}
            {mod.metaKey && (
              <span className="text-xs text-muted-foreground">{t(mod.metaKey)}</span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{t(mod.descriptionKey)}</p>
        </div>
        {mod.expandable && (
          <button
            type="button"
            onClick={onExpand}
            aria-expanded={expanded}
            aria-label={t(mod.titleKey)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {mod.expandable && expanded && (
        <div className="space-y-4 border-t border-border px-3 py-3">
          {mod.optionGroups && mod.optionGroups.length > 0 ? (
            mod.optionGroups.map((group) => (
              <div key={group.labelKey} className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">{t(group.labelKey)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.choiceKeys.map((choice) => (
                    <span
                      key={choice}
                      className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {t(choice)}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("reports.expandOptionsPlaceholder")}
            </p>
          )}
        </div>
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

function OptionsSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// ReportPreview – builds preview cards dynamically from the selected modules.
// Cover page is always first; closing summary always last.
// ---------------------------------------------------------------------------

interface ReportPreviewProps {
  selectedModules: Set<string>
  modules: ReportModuleConfig[]
  coverTitle: string
  reportDate: string
  t: (key: string) => string
}

function ReportPreview({ selectedModules, modules, coverTitle, reportDate, t }: ReportPreviewProps) {
  const selected = modules.filter((m) => selectedModules.has(m.id))
  // Total pages: cover (1) + module pages + closing (1)
  const totalPages = 1 + selected.reduce((sum, m) => sum + m.estimatedPages, 0) + 1
  let pageCounter = 0

  function PageCard({
    pageNum,
    title,
    children,
  }: {
    pageNum: number
    title: string
    children: React.ReactNode
  }) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm">
        {/* Page header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <span className="text-xs text-muted-foreground">
            {pageNum} {t("reports.previewPageOf")} {totalPages}
          </span>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Cover page */}
      <PageCard pageNum={++pageCounter} title={t("reports.previewPageCover")}>
        <div className="flex flex-col gap-3 py-2">
          <div className="h-2 w-16 rounded-full bg-primary/60" />
          <div className="h-5 w-3/4 rounded bg-foreground/10" />
          <div className="h-3.5 w-1/2 rounded bg-foreground/8" />
          <div className="mt-2 flex gap-3">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          {coverTitle && (
            <p className="mt-1 text-sm font-medium text-foreground">{coverTitle}</p>
          )}
          {reportDate && (
            <p className="text-xs text-muted-foreground">{reportDate}</p>
          )}
        </div>
      </PageCard>

      {/* One card per selected module */}
      {selected.map((mod) => {
        const Icon = mod.icon
        const startPage = pageCounter + 1
        pageCounter += mod.estimatedPages
        return (
          <PageCard key={mod.id} pageNum={startPage} title={t(mod.titleKey)}>
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-foreground/10" />
                <div className="h-2.5 w-full rounded bg-foreground/7" />
                <div className="h-2.5 w-4/5 rounded bg-foreground/7" />
                {mod.estimatedTables > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {Array.from({ length: Math.min(mod.estimatedTables * 3, 9) }).map((_, i) => (
                      <div key={i} className="h-2 rounded bg-muted" />
                    ))}
                  </div>
                )}
                {mod.estimatedPhotos > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {Array.from({ length: Math.min(mod.estimatedPhotos, 4) }).map((_, i) => (
                      <div key={i} className="aspect-square rounded bg-muted" />
                    ))}
                  </div>
                )}
                <div className="flex justify-end pt-1">
                  <span className="text-xs text-muted-foreground">
                    {mod.estimatedPages}s
                    {mod.estimatedTables > 0 && ` · ${mod.estimatedTables} taulukkoa`}
                    {mod.estimatedPhotos > 0 && ` · ${mod.estimatedPhotos} kuvaa`}
                  </span>
                </div>
              </div>
            </div>
          </PageCard>
        )
      })}

      {/* Closing summary page */}
      <PageCard pageNum={++pageCounter} title={t("reports.previewPageClosing")}>
        <div className="flex flex-col gap-2 py-1">
          <div className="h-3.5 w-1/2 rounded bg-foreground/10" />
          <div className="h-2.5 w-full rounded bg-foreground/7" />
          <div className="h-2.5 w-3/4 rounded bg-foreground/7" />
          <div className="mt-2 flex gap-2">
            <div className="h-3 w-16 rounded bg-primary/20" />
            <div className="h-3 w-20 rounded bg-primary/20" />
          </div>
        </div>
      </PageCard>
    </div>
  )
}

function RadioDot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        active ? "border-primary bg-primary" : "border-muted-foreground bg-transparent"
      }`}
    >
      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
    </button>
  )
}
