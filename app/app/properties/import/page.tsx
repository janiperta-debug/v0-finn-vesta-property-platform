"use client"

import { useState, useCallback } from "react"
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
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n"

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
}

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "complete"

const REQUIRED_FIELDS = ["name", "address"]
const OPTIONAL_FIELDS = ["city", "postal_code", "building_type", "build_year", "square_meters", "floors", "tunnus", "notes"]

export default function ImportPropertiesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [step, setStep] = useState<ImportStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [parsedData, setParsedData] = useState<ParsedProperty[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error(t("propertyImport.selectCsvError"))
      return
    }

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error(t("propertyImport.notEnoughRowsError"))
        return
      }

      // Parse headers (first row)
      const headerRow = lines[0].split(";").map(h => h.trim().replace(/"/g, ""))
      setHeaders(headerRow)

      // Parse data rows
      const dataRows = lines.slice(1).map(line => 
        line.split(";").map(cell => cell.trim().replace(/"/g, ""))
      )
      setRows(dataRows)

      // Auto-map headers
      const autoMapping: Record<string, string> = {}
      headerRow.forEach((header, index) => {
        const lowerHeader = header.toLowerCase()
        if (lowerHeader.includes("nimi") || lowerHeader === "name") {
          autoMapping["name"] = header
        } else if (lowerHeader.includes("osoite") || lowerHeader === "address") {
          autoMapping["address"] = header
        } else if (lowerHeader.includes("kaupunki") || lowerHeader === "city") {
          autoMapping["city"] = header
        } else if (lowerHeader.includes("rakennus") && lowerHeader.includes("vuosi") || lowerHeader.includes("build_year")) {
          autoMapping["build_year"] = header
        } else if (lowerHeader.includes("pinta") || lowerHeader.includes("m2") || lowerHeader.includes("square")) {
          autoMapping["square_meters"] = header
        } else if (lowerHeader.includes("tyyppi") || lowerHeader.includes("type")) {
          autoMapping["building_type"] = header
        } else if (lowerHeader.includes("tunnus") || lowerHeader.includes("id")) {
          autoMapping["tunnus"] = header
        }
      })
      setMapping(autoMapping)

      setStep("mapping")
    }
    reader.readAsText(file, "UTF-8")
  }

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
      }
    })

    setParsedData(parsed)
    setStep("preview")
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
      
      // Get user's organization
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
              status: 'active',
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
      setStep("preview")
    }
  }

  const selectedCount = parsedData.filter(p => p.selected).length
  const validCount = parsedData.filter(p => p.valid).length

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
      <div className="flex items-center gap-2 text-sm">
        {["upload", "mapping", "preview", "importing", "complete"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              step === s 
                ? "bg-primary text-primary-foreground" 
                : ["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <span className={step === s ? "font-medium" : "text-muted-foreground"}>
              {s === "upload" && t("propertyImport.stepUpload")}
              {s === "mapping" && t("propertyImport.stepMapping")}
              {s === "preview" && t("propertyImport.stepPreview")}
              {s === "importing" && t("propertyImport.stepImporting")}
              {s === "complete" && t("propertyImport.stepComplete")}
            </span>
            {i < 4 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("propertyImport.uploadTitle")}</CardTitle>
            <CardDescription>
              {t("propertyImport.uploadDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary hover:underline">{t("propertyImport.selectFile")}</span>
                <span className="text-muted-foreground"> {t("propertyImport.orDragHere")}</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              {file && (
                <p className="mt-4 text-sm text-muted-foreground">{file.name}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Mapping */}
      {step === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("propertyImport.mappingTitle")}</CardTitle>
            <CardDescription>
              {t("propertyImport.mappingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Required fields */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  {t("propertyImport.nameField")} <span className="text-destructive">*</span>
                </Label>
                <Select value={mapping.name || "none"} onValueChange={(v) => handleMappingChange("name", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  {t("propertyImport.addressField")} <span className="text-destructive">*</span>
                </Label>
                <Select value={mapping.address || "none"} onValueChange={(v) => handleMappingChange("address", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optional fields */}
              <div className="space-y-2">
                <Label>{t("propertyImport.cityField")}</Label>
                <Select value={mapping.city || "none"} onValueChange={(v) => handleMappingChange("city", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("propertyEdit.buildingTypeLabel")}</Label>
                <Select value={mapping.building_type || "none"} onValueChange={(v) => handleMappingChange("building_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("propertyEdit.buildYearLabel")}</Label>
                <Select value={mapping.build_year || "none"} onValueChange={(v) => handleMappingChange("build_year", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("propertyEdit.squareMetersLabel")}</Label>
                <Select value={mapping.square_meters || "none"} onValueChange={(v) => handleMappingChange("square_meters", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("propertyImport.selectColumnPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("propertyImport.notSelected")}</SelectItem>
                    {headers.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("upload")}>
                {t("common.back")}
              </Button>
              <Button onClick={processMapping}>
                {t("propertyImport.continueToPreview")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("propertyImport.previewTitle")}</CardTitle>
                <CardDescription>
                  {selectedCount} / {validCount} {t("propertyImport.selectedForImport")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
                  {t("propertyImport.selectAll")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
                  {t("propertyImport.deselectAll")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>{t("propertyImport.nameField")}</TableHead>
                    <TableHead>{t("propertyImport.addressField")}</TableHead>
                    <TableHead>{t("propertyImport.cityField")}</TableHead>
                    <TableHead>{t("propertyEdit.typeLabel")}</TableHead>
                    <TableHead className="text-right">{t("propertyDetail.areaLabel")}</TableHead>
                    <TableHead>{t("inspectionDetail.statusLabel")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((item) => (
                    <TableRow key={item.id} className={!item.valid ? "opacity-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleSelection(item.id)}
                          disabled={!item.valid}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name || "-"}</TableCell>
                      <TableCell>{item.address || "-"}</TableCell>
                      <TableCell>{item.city || "-"}</TableCell>
                      <TableCell>{item.buildingType || "-"}</TableCell>
                      <TableCell className="text-right">
                        {item.squareMeters ? `${item.squareMeters} m²` : "-"}
                      </TableCell>
                      <TableCell>
                        {item.valid ? (
                          <Badge variant="outline" className="text-green-500 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-destructive border-destructive/30">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {item.errors.join(", ")}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between pt-4">
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

      {/* Step: Importing */}
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

      {/* Step: Complete */}
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
              <Button variant="outline" onClick={() => {
                setStep("upload")
                setFile(null)
                setHeaders([])
                setRows([])
                setMapping({})
                setParsedData([])
              }}>
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
