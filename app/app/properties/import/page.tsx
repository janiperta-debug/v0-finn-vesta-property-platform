"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle, X,
  CheckCircle2, AlertTriangle, Eye, Loader2, Building2, ChevronDown, ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n"
import {
  analyseWorkbook, isAcceptedFile, resolvePropertyGroups,
  type ImportAnalysis, type PropertyGroup,
} from "@/lib/property-import"

interface ParsedProperty {
  id: string
  name: string
  address: string
  city?: string
  buildingType?: string
  buildYear?: number
  squareMeters?: number
  valid: boolean
  errors: string[]
  selected: boolean
  raw?: Record<string, string>
}

// Upload → analyse (auto) → mapping → structure → importing → complete
type ImportStep = "upload" | "analyse" | "mapping" | "structure" | "importing" | "complete"

const STEP_ORDER: ImportStep[] = ["upload", "analyse", "mapping", "structure", "importing", "complete"]

export default function ImportPropertiesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<ImportStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null)

  // Mapping / preview / import state (existing logic preserved exactly)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [parsedData, setParsedData] = useState<ParsedProperty[]>([])
  const [groups, setGroups] = useState<PropertyGroup[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 })

  // -------------------------------------------------------------------------
  // File handling
  // -------------------------------------------------------------------------

  const handleFile = useCallback(async (selectedFile: File) => {
    if (!isAcceptedFile(selectedFile.name)) {
      toast.error(t("propertyImport.selectCsvError"))
      return
    }
    setFile(selectedFile)
    setAnalysing(true)
    setStep("analyse")

    try {
      const result = await analyseWorkbook(selectedFile)
      setAnalysis(result)

      // Feed the parsed header + rows into the existing mapping state so the
      // mapping step still works exactly as before.
      setHeaders(result.columns.map((c) => c.header))
      const dataRows = result.rows.map((r) => r.cells)
      setRows(dataRows)

      // Pre-populate mapping from recognised columns.
      const autoMapping: Record<string, string> = {}
      for (const col of result.columns) {
        if (!col.recognisedAs || col.confidence < 0.5) continue
        const field = col.recognisedAs
        // Map analysis field names → import field names
        if (field === "name") autoMapping["name"] = col.header
        else if (field === "address") autoMapping["address"] = col.header
        else if (field === "municipality") autoMapping["city"] = col.header
        else if (field === "construction_year") autoMapping["build_year"] = col.header
        else if (field === "gross_area") autoMapping["square_meters"] = col.header
        else if (field === "building_type") autoMapping["building_type"] = col.header
        else if (field === "property_id") autoMapping["tunnus"] = col.header
      }
      setMapping(autoMapping)
    } catch (err) {
      console.error("[v0] analyseWorkbook error:", err)
      toast.error(t("propertyImport.notEnoughRowsError"))
      setStep("upload")
    } finally {
      setAnalysing(false)
    }
  }, [t])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  // Drag-and-drop handlers
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  // -------------------------------------------------------------------------
  // Existing mapping / preview / import logic — unchanged
  // -------------------------------------------------------------------------

  const handleMappingChange = (field: string, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value === "none" ? "" : value }))
  }

  const processMapping = () => {
    if (!mapping.name || !mapping.address) {
      toast.error(t("propertyImport.nameAddressRequiredError"))
      return
    }

    const parsed: ParsedProperty[] = rows.map((row, index) => {
      const getField = (field: string) => {
        const headerName = mapping[field]
        if (!headerName) return undefined
        const headerIndex = headers.indexOf(headerName)
        return headerIndex >= 0 ? row[headerIndex] : undefined
      }

      const name = getField("name") || ""
      const address = getField("address") || ""
      const errors: string[] = []

      if (!name) errors.push(t("propertyImport.nameMissing"))
      if (!address) errors.push(t("propertyImport.addressMissing"))

      // Build raw record for group resolution
      const raw: Record<string, string> = {}
      headers.forEach((h, i) => { raw[h] = row[i] ?? "" })

      return {
        id: `row-${index}`,
        name,
        address,
        city: getField("city"),
        buildingType: getField("building_type"),
        buildYear: getField("build_year") ? parseInt(getField("build_year")!) : undefined,
        squareMeters: getField("square_meters") ? parseFloat(getField("square_meters")!) : undefined,
        valid: errors.length === 0,
        errors,
        selected: errors.length === 0,
        raw,
      }
    })

    setParsedData(parsed)

    // Build property groups for the structure step
    const resolved = resolvePropertyGroups(
      parsed.map((p, i) => ({
        id: i,
        name: p.name,
        address: p.address,
        city: p.city,
        buildingType: p.buildingType,
        squareMeters: p.squareMeters,
        valid: p.valid,
        errors: p.errors,
        raw: p.raw ?? {},
      })),
      { name: mapping.name, address: mapping.address, city: mapping.city,
        building_type: mapping.building_type, build_year: mapping.build_year,
        square_meters: mapping.square_meters, property_id: mapping.tunnus },
    )
    setGroups(resolved)
    // Pre-expand needs-review groups
    setExpandedGroups(new Set(resolved.filter(g => g.status !== "resolved").map(g => g.key)))
    setStep("structure")
  }

  const toggleSelection = (id: string) => {
    setParsedData(prev => prev.map(p =>
      p.id === id ? { ...p, selected: !p.selected } : p
    ))
  }

  const toggleAll = (selected: boolean) => {
    setParsedData(prev => prev.map(p => ({ ...p, selected: p.valid ? selected : false })))
  }

  const handleImport = async () => {
    const toImport = parsedData.filter(p => p.selected && p.valid)
    if (toImport.length === 0) {
      toast.error(t("propertyImport.selectPropertiesError"))
      return
    }

    setStep("importing")
    setImportProgress(0)

    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t("propertyImport.notLoggedIn"))

      const { data: orgUsers } = await supabase
        .from("org_users")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)

      const orgUser = orgUsers?.[0]
      if (!orgUser) throw new Error(t("maintenanceNew.orgNotFoundAlert"))

      let success = 0
      let failed = 0

      for (let i = 0; i < toImport.length; i++) {
        const item = toImport[i]

        try {
          const { error } = await supabase
            .from("buildings")
            .insert({
              org_id: orgUser.org_id,
              name: item.name,
              address: item.address,
              municipality: item.city || null,
              building_type: item.buildingType || "muu",
              construction_year: item.buildYear || null,
              area_m2: item.squareMeters || null,
              status: "active",
            })

          if (error) throw error
          success++
        } catch (err) {
          console.error("Import error for item:", item.name, err)
          failed++
        }

        setImportProgress(Math.round(((i + 1) / toImport.length) * 100))
      }

      setImportResults({ success, failed })
      setStep("complete")
    } catch (error: any) {
      console.error("Import error:", error)
      toast.error(error.message || t("propertyImport.importFailedError"))
      setStep("structure")
    }
  }

  const resetAll = () => {
    setStep("upload")
    setFile(null)
    setAnalysis(null)
    setHeaders([])
    setRows([])
    setMapping({})
    setParsedData([])
    setGroups([])
    setExpandedGroups(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const selectedCount = parsedData.filter(p => p.selected).length

  const resolvedCount = groups.filter(g => g.status === "resolved").length
  const needsReviewCount = groups.filter(g => g.status === "needs-review").length
  const conflictCount = groups.filter(g => g.status === "conflict").length
  const allResolved = needsReviewCount === 0 && conflictCount === 0

  // -------------------------------------------------------------------------
  // Stepper helpers
  // -------------------------------------------------------------------------

  const stepLabels: Record<ImportStep, string> = {
    upload: t("propertyImport.stepUpload"),
    analyse: t("propertyImport.stepAnalyse"),
    mapping: t("propertyImport.stepMapping"),
    structure: t("propertyImport.stepStructure"),
    importing: t("propertyImport.stepImporting"),
    complete: t("propertyImport.stepComplete"),
  }
  const currentStepIdx = STEP_ORDER.indexOf(step)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/properties">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("propertyImport.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("propertyImport.subtitle")}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {STEP_ORDER.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              step === s
                ? "bg-primary text-primary-foreground"
                : currentStepIdx > i
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}>
              {currentStepIdx > i ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={step === s ? "font-medium text-foreground" : "text-muted-foreground"}>
              {stepLabels[s]}
            </span>
            {i < STEP_ORDER.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Step: Upload                                                         */}
      {/* ------------------------------------------------------------------ */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("propertyImport.uploadTitle")}</CardTitle>
            <CardDescription>{t("propertyImport.uploadDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-14 transition-colors cursor-pointer ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-foreground mb-1">
                {t("propertyImport.dropOrClick")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("propertyImport.acceptedFormats")}
              </p>
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step: Analyse (auto-progress — shown while analyseWorkbook runs)    */}
      {/* ------------------------------------------------------------------ */}
      {step === "analyse" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            {analysing ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div>
                  <p className="font-medium text-foreground">{t("propertyImport.analysingTitle")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{file?.name}</p>
                </div>
              </>
            ) : analysis ? (
              <>
                {/* Analysis result summary */}
                <div className="w-full max-w-lg space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{t("propertyImport.analysisDone")}</p>
                      <p className="text-sm text-muted-foreground">{file?.name}</p>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                      <p className="text-2xl font-bold text-foreground">{analysis.totalRows}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("propertyImport.statRows")}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{analysis.readyCount}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("propertyImport.statReady")}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3 text-center">
                      <p className={`text-2xl font-bold ${analysis.reviewCount > 0 ? "text-amber-500" : "text-foreground"}`}>
                        {analysis.reviewCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("propertyImport.statReview")}</p>
                    </div>
                  </div>

                  {/* Column recognition summary */}
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">{t("propertyImport.columnRecognition")}</p>
                    <div className="flex items-center gap-3">
                      <Progress value={analysis.recognisedPercent} className="h-2 flex-1" />
                      <span className="text-sm font-medium text-foreground w-10 text-right">{analysis.recognisedPercent}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {analysis.columns.filter(c => !c.isEmpty).map(col => (
                        <Badge
                          key={col.index}
                          variant="outline"
                          className={`text-xs ${
                            col.recognisedAs && col.confidence >= 0.75
                              ? "border-green-500/40 text-green-600 dark:text-green-400"
                              : col.recognisedAs
                                ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                                : "border-border text-muted-foreground"
                          }`}
                        >
                          {col.header}
                          {col.recognisedAs && col.confidence >= 0.75 && (
                            <CheckCircle2 className="h-3 w-3 ml-1" />
                          )}
                          {col.recognisedAs && col.confidence < 0.75 && (
                            <AlertTriangle className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetAll}>
                      {t("common.back")}
                    </Button>
                    <Button onClick={() => setStep("mapping")}>
                      {t("propertyImport.continueToMapping")}
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step: Mapping (unchanged)                                            */}
      {/* ------------------------------------------------------------------ */}
      {step === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("propertyImport.mappingTitle")}</CardTitle>
            <CardDescription>{t("propertyImport.mappingDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  {t("propertyImport.nameField")} <span className="text-destructive">*</span>
                </Label>
                <Select value={mapping.name || "none"} onValueChange={(v) => handleMappingChange("name", v)}>
                  <SelectTrigger><SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  {t("propertyImport.addressField")} <span className="text-destructive">*</span>
                </Label>
                <Select value={mapping.address || "none"} onValueChange={(v) => handleMappingChange("address", v)}>
                  <SelectTrigger><SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("propertyImport.cityField")}</Label>
                <Select value={mapping.city || "none"} onValueChange={(v) => handleMappingChange("city", v)}>
                  <SelectTrigger><SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("propertyEdit.buildingTypeLabel")}</Label>
                <Select value={mapping.building_type || "none"} onValueChange={(v) => handleMappingChange("building_type", v)}>
                  <SelectTrigger><SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("propertyEdit.buildYearLabel")}</Label>
                <Select value={mapping.build_year || "none"} onValueChange={(v) => handleMappingChange("build_year", v)}>
                  <SelectTrigger><SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("propertyEdit.squareMetersLabel")}</Label>
                <Select value={mapping.square_meters || "none"} onValueChange={(v) => handleMappingChange("square_meters", v)}>
                  <SelectTrigger><SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("analyse")}>
                {t("common.back")}
              </Button>
              <Button onClick={processMapping}>
                {t("propertyImport.continueToPreview")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step: Structure — property tree, auto-grouping, resolve conflicts   */}
      {/* ------------------------------------------------------------------ */}
      {step === "structure" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("propertyImport.structureTitle")}</CardTitle>
            <CardDescription>{t("propertyImport.structureDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-card p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{groups.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("propertyImport.structureStatProperties")}</p>
              </div>
              <div className={`rounded-lg border p-3 text-center ${needsReviewCount > 0 ? "border-amber-500/30 bg-amber-500/5" : "bg-card"}`}>
                <p className={`text-2xl font-bold ${needsReviewCount > 0 ? "text-amber-500" : "text-foreground"}`}>{needsReviewCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("propertyImport.structureStatReview")}</p>
              </div>
              <div className={`rounded-lg border p-3 text-center ${conflictCount > 0 ? "border-destructive/30 bg-destructive/5" : "bg-card"}`}>
                <p className={`text-2xl font-bold ${conflictCount > 0 ? "text-destructive" : "text-foreground"}`}>{conflictCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("propertyImport.structureStatConflicts")}</p>
              </div>
            </div>

            {/* Property tree */}
            <div className="rounded-lg border divide-y overflow-hidden">
              {groups.map((group) => {
                const isExpanded = expandedGroups.has(group.key)
                const hasMultipleSpaces = group.spaces.length > 1

                return (
                  <div key={group.key}>
                    {/* Group header row */}
                    <button
                      type="button"
                      onClick={() => hasMultipleSpaces && toggleGroup(group.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${hasMultipleSpaces ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {/* Expand chevron */}
                      <span className="w-4 flex-shrink-0 text-muted-foreground">
                        {hasMultipleSpaces
                          ? (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)
                          : null}
                      </span>

                      {/* Building icon */}
                      <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />

                      {/* Name + address */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{group.propertyName}</p>
                        {group.address && (
                          <p className="text-xs text-muted-foreground truncate">{group.address}</p>
                        )}
                      </div>

                      {/* Space count badge */}
                      {hasMultipleSpaces && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {group.spaces.length} {t("propertyImport.structureSpaces")}
                        </Badge>
                      )}

                      {/* Status badge */}
                      {group.status === "resolved" && (
                        <Badge variant="outline" className="text-green-500 border-green-500/30 flex-shrink-0 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("propertyImport.structureResolved")}
                        </Badge>
                      )}
                      {group.status === "needs-review" && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 flex-shrink-0 gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t("propertyImport.structureNeedsReview")}
                        </Badge>
                      )}
                      {group.status === "conflict" && (
                        <Badge variant="outline" className="text-destructive border-destructive/30 flex-shrink-0 gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {t("propertyImport.structureConflict")}
                        </Badge>
                      )}
                    </button>

                    {/* Expanded spaces */}
                    {isExpanded && hasMultipleSpaces && (
                      <div className="border-t bg-muted/30">
                        {group.spaces.map((space, si) => (
                          <div key={si} className="flex items-center gap-3 px-4 py-2.5 pl-11 border-b last:border-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{space.name || "-"}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {[space.buildingType, space.squareMeters ? `${space.squareMeters} m²` : null].filter(Boolean).join(" · ")}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {t("propertyImport.structureRow")} {space.rowIndex + 1}
                            </span>
                          </div>
                        ))}
                        {group.status === "needs-review" && (
                          <div className="flex items-start gap-2 px-4 py-2 pl-11 bg-amber-500/5 border-t">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              {t("propertyImport.structureDuplicateAddressNote")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Unresolved warning */}
            {!allResolved && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {t("propertyImport.structureUnresolvedWarning")}
                </p>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                {t("common.back")}
              </Button>
              <Button onClick={handleImport} disabled={selectedCount === 0}>
                {t("propertyImport.importPrefix")} {selectedCount} {t("propertyImport.propertiesSuffix")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step: Importing                                                      */}
      {/* ------------------------------------------------------------------ */}
      {step === "importing" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-primary mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">{t("propertyImport.importingTitle")}</h3>
            <p className="text-sm text-muted-foreground mb-6">{importProgress}% {t("propertyImport.percentDone")}</p>
            <Progress value={importProgress} className="w-64" />
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Step: Complete                                                        */}
      {/* ------------------------------------------------------------------ */}
      {step === "complete" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t("propertyImport.completeTitle")}</h3>
            <p className="text-muted-foreground mb-6">
              {importResults.success} {t("propertyImport.importedSuccessfully")}
              {importResults.failed > 0 && `, ${importResults.failed} ${t("propertyImport.failedSuffix")}`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetAll}>
                {t("propertyImport.importMore")}
              </Button>
              <Button asChild>
                <Link href="/app/properties">{t("propertyImport.toPropertyList")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
