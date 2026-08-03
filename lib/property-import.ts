import * as XLSX from "xlsx"

// ---------------------------------------------------------------------------
// Property Import — Phase 1 analysis engine.
//
// This module ONLY analyses an uploaded spreadsheet. It never imports data,
// never creates properties, and never mutates anything. The analysis result is
// produced once and is intended to be stored and reused by later phases
// (column mapping, relationship resolution, actual import).
// ---------------------------------------------------------------------------

/** Canonical property fields FinnVesta tries to recognise automatically. */
export type CanonicalField =
  | "name"
  | "address"
  | "construction_year"
  | "building_type"
  | "property_id"
  | "building_id"
  | "gross_area"
  | "heating"
  | "roof"
  | "facade"
  | "owner"
  | "municipality"
  | "postal_code"

/** A column detected in the source worksheet. */
export interface DetectedColumn {
  index: number
  header: string
  /** Recognised canonical field, or null when unknown. */
  recognisedAs: CanonicalField | null
  /** 0–1 confidence of the recognition match. */
  confidence: number
  /** Detected primary data type of the column's values. */
  dataType: "text" | "number" | "year" | "empty" | "mixed"
  isEmpty: boolean
  isDuplicate: boolean
}

export type RowStatus = "ready" | "review" | "ignored"

export interface AnalysedRow {
  /** 0-based index within the data rows (header excluded). */
  index: number
  /** Raw cell values aligned to the detected columns. */
  cells: string[]
  status: RowStatus
  /** Human-readable reasons that drove the status (i18n-agnostic codes). */
  reasons: RowReason[]
}

export type RowReason =
  | "blank"
  | "summary"
  | "duplicate"
  | "duplicate-address"
  | "missing-address"
  | "missing-name"
  | "missing-year"

export interface ImportAnalysis {
  fileName: string
  /** All worksheet names in the workbook. */
  sheetNames: string[]
  /** The worksheet that was analysed. */
  activeSheet: string
  /** 0-based index of the detected header row within the raw sheet. */
  headerRowIndex: number
  totalRows: number
  totalColumns: number
  emptyColumns: number
  duplicateColumns: number
  columns: DetectedColumn[]
  rows: AnalysedRow[]
  recognisedCount: number
  reviewFieldCount: number
  recognisedPercent: number
  readyCount: number
  reviewCount: number
  ignoredCount: number
}

// --- Field recognition dictionary -----------------------------------------
// Each canonical field maps to a set of lower-cased substrings (FI + EN) that,
// when found in a header, indicate a match. Order matters: more specific
// patterns should be matched before generic ones.

const FIELD_PATTERNS: Record<CanonicalField, string[]> = {
  construction_year: ["rakennusvuosi", "rakennus vuosi", "valmistumisvuosi", "construction year", "build year", "year built", "vuosi", "year"],
  gross_area: ["bruttoala", "kokonaisala", "pinta-ala", "pinta ala", "gross area", "area", "m2", "m²", "neliö", "neliot", "kerrosala"],
  building_type: ["rakennustyyppi", "rakennuksen tyyppi", "kiinteistötyyppi", "building type", "property type", "tyyppi", "type"],
  property_id: ["kiinteistötunnus", "kiinteistö tunnus", "property id", "property code", "kiinteistön tunnus"],
  building_id: ["rakennustunnus", "rakennuksen tunnus", "building id", "building code", "vtj-prt", "prt"],
  postal_code: ["postinumero", "postinro", "postal code", "zip", "zipcode", "posti"],
  municipality: ["kaupunki", "kunta", "paikkakunta", "city", "municipality", "town"],
  address: ["osoite", "katuosoite", "address", "street", "katu"],
  name: ["nimi", "kiinteistön nimi", "rakennuksen nimi", "kohteen nimi", "name", "property name", "kohde"],
  heating: ["lämmitys", "lammitys", "lämmitysmuoto", "heating", "heat"],
  roof: ["katto", "kattotyyppi", "vesikatto", "roof"],
  facade: ["julkisivu", "julkisivut", "ulkoseinä", "facade", "exterior wall", "seinä"],
  owner: ["omistaja", "omistus", "owner", "landlord"],
}

/** Words that, when they dominate a row, mark it as a summary/notes row. */
const SUMMARY_TOKENS = [
  "yhteensä", "yht.", "summa", "keskiarvo", "ka.", "total", "sum", "average",
  "huom", "huomautus", "note", "notes", "muistiinpano",
]

// --- Recognition ------------------------------------------------------------

function normalise(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ")
}

function recogniseHeader(header: string): { field: CanonicalField | null; confidence: number } {
  const h = normalise(header)
  if (!h) return { field: null, confidence: 0 }

  let best: { field: CanonicalField | null; confidence: number } = { field: null, confidence: 0 }

  for (const field of Object.keys(FIELD_PATTERNS) as CanonicalField[]) {
    for (const pattern of FIELD_PATTERNS[field]) {
      if (h === pattern) {
        // Exact match — highest confidence, return immediately.
        return { field, confidence: 1 }
      }
      if (h.includes(pattern)) {
        // Substring match — confidence scaled by how much of the header it covers.
        const conf = Math.min(0.9, 0.5 + (pattern.length / h.length) * 0.4)
        if (conf > best.confidence) best = { field, confidence: conf }
      }
    }
  }

  return best
}

// --- Data type detection ----------------------------------------------------

function detectColumnType(values: string[]): DetectedColumn["dataType"] {
  const nonEmpty = values.filter((v) => v && v.trim() !== "")
  if (nonEmpty.length === 0) return "empty"

  let numbers = 0
  let years = 0
  let text = 0

  for (const v of nonEmpty) {
    const cleaned = v.replace(/\s/g, "").replace(",", ".")
    const num = Number(cleaned)
    if (!Number.isNaN(num) && cleaned !== "") {
      numbers++
      if (Number.isInteger(num) && num >= 1800 && num <= 2100) years++
    } else {
      text++
    }
  }

  if (text > numbers) return "text"
  if (years >= nonEmpty.length * 0.8) return "year"
  if (numbers >= nonEmpty.length * 0.8) return "number"
  return "mixed"
}

// --- Header row detection ---------------------------------------------------
// The header row is the first row where most cells are non-empty text and it is
// followed by at least one data row. Falls back to the first non-empty row.

function detectHeaderRow(matrix: string[][]): number {
  const maxScan = Math.min(matrix.length, 15)
  let bestIdx = 0
  let bestScore = -1

  for (let i = 0; i < maxScan; i++) {
    const row = matrix[i]
    if (!row) continue
    const nonEmpty = row.filter((c) => c && c.trim() !== "")
    if (nonEmpty.length < 2) continue

    // A good header has mostly short, text-like, distinct cells.
    const textCells = nonEmpty.filter((c) => Number.isNaN(Number(c.replace(",", ".")))).length
    const distinct = new Set(nonEmpty.map((c) => normalise(c))).size
    const score = textCells + distinct * 0.5 + nonEmpty.length * 0.25

    if (score > bestScore) {
      bestScore = score
      bestIdx = i
    }
  }

  return bestIdx
}

// --- Row classification -----------------------------------------------------

function isBlankRow(cells: string[]): boolean {
  return cells.every((c) => !c || c.trim() === "")
}

function isSummaryRow(cells: string[]): boolean {
  const filled = cells.filter((c) => c && c.trim() !== "")
  if (filled.length === 0) return false
  // Summary rows typically have very few filled cells, one of which is a token.
  const hasToken = filled.some((c) => SUMMARY_TOKENS.some((t) => normalise(c).includes(t)))
  const sparse = filled.length <= Math.max(1, Math.floor(cells.length * 0.25))
  return hasToken && sparse
}

// --- Main entry point -------------------------------------------------------

export async function analyseWorkbook(file: File): Promise<ImportAnalysis> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })

  const sheetNames = workbook.SheetNames
  const activeSheet = sheetNames[0]
  const sheet = workbook.Sheets[activeSheet]

  // Raw matrix of strings; blank cells become "".
  const matrix: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: true,
  })

  const headerRowIndex = detectHeaderRow(matrix)
  const headerRow = (matrix[headerRowIndex] ?? []).map((c) => String(c ?? "").trim())
  const totalColumns = headerRow.length

  const dataMatrix = matrix.slice(headerRowIndex + 1)

  // --- Columns ---
  const seenHeaders = new Map<string, number>()
  const columns: DetectedColumn[] = headerRow.map((header, index) => {
    const columnValues = dataMatrix.map((r) => String(r[index] ?? "").trim())
    const dataType = detectColumnType(columnValues)
    const isEmpty = header.trim() === "" && dataType === "empty"
    const norm = normalise(header)
    const isDuplicate = norm !== "" && seenHeaders.has(norm)
    if (norm !== "") seenHeaders.set(norm, index)

    const { field, confidence } = recogniseHeader(header)

    return {
      index,
      header: header || `(sarake ${index + 1})`,
      recognisedAs: field,
      confidence,
      dataType,
      isEmpty,
      isDuplicate,
    }
  })

  const emptyColumns = columns.filter((c) => c.isEmpty).length
  const duplicateColumns = columns.filter((c) => c.isDuplicate).length

  const recognisedCount = columns.filter((c) => c.recognisedAs && c.confidence >= 0.75).length
  const reviewFieldCount = columns.filter(
    (c) => !c.isEmpty && (!c.recognisedAs || c.confidence < 0.75),
  ).length
  const recognisedPercent =
    totalColumns > 0 ? Math.round((recognisedCount / totalColumns) * 100) : 0

  // Column indices for the fields we need to classify rows.
  const nameCol = columns.find((c) => c.recognisedAs === "name")?.index ?? -1
  const addressCol = columns.find((c) => c.recognisedAs === "address")?.index ?? -1
  const yearCol = columns.find((c) => c.recognisedAs === "construction_year")?.index ?? -1

  // --- Rows ---
  const seenRowKeys = new Set<string>()
  const seenAddresses = new Set<string>()

  const rows: AnalysedRow[] = dataMatrix.map((raw, index) => {
    const cells = headerRow.map((_, ci) => String(raw[ci] ?? "").trim())
    const reasons: RowReason[] = []
    let status: RowStatus

    if (isBlankRow(cells)) {
      reasons.push("blank")
      status = "ignored"
    } else if (isSummaryRow(cells)) {
      reasons.push("summary")
      status = "ignored"
    } else {
      // Duplicate whole-row detection.
      const rowKey = cells.join("|").toLowerCase()
      if (seenRowKeys.has(rowKey)) reasons.push("duplicate")
      seenRowKeys.add(rowKey)

      const name = nameCol >= 0 ? cells[nameCol] : ""
      const address = addressCol >= 0 ? cells[addressCol] : ""
      const year = yearCol >= 0 ? cells[yearCol] : ""

      if (nameCol >= 0 && !name) reasons.push("missing-name")
      if (addressCol >= 0 && !address) reasons.push("missing-address")
      if (yearCol >= 0 && !year) reasons.push("missing-year")

      if (address) {
        const addrKey = normalise(address)
        if (seenAddresses.has(addrKey)) reasons.push("duplicate-address")
        seenAddresses.add(addrKey)
      }

      status = reasons.length > 0 ? "review" : "ready"
    }

    return { index, cells, status, reasons }
  })

  const readyCount = rows.filter((r) => r.status === "ready").length
  const reviewCount = rows.filter((r) => r.status === "review").length
  const ignoredCount = rows.filter((r) => r.status === "ignored").length

  return {
    fileName: file.name,
    sheetNames,
    activeSheet,
    headerRowIndex,
    totalRows: rows.length,
    totalColumns,
    emptyColumns,
    duplicateColumns,
    columns,
    rows,
    recognisedCount,
    reviewFieldCount,
    recognisedPercent,
    readyCount,
    reviewCount,
    ignoredCount,
  }
}

// ── Property group resolution ─────────────────────────────────────────────────
// Takes the mapped + validated rows and clusters them into a property tree.
// Spaces (multiple rows sharing the same property/address) are grouped under
// one PropertyGroup. The tree is UI-only — buildings are still written as flat
// rows to `buildings` (spaces = separate rows) until the schema evolves.

export type GroupStatus = "resolved" | "needs-review" | "conflict"

export interface PropertySpace {
  rowIndex: number
  name: string
  address: string
  city?: string
  buildingType?: string
  squareMeters?: number
  raw: Record<string, string>
}

export interface PropertyGroup {
  key: string
  propertyName: string
  address: string
  spaces: PropertySpace[]
  status: GroupStatus
  issues: string[]
}

// Shared mapping / parsed-row shapes used by both the page and this function.
export interface ImportColumnMapping {
  name?: string
  address?: string
  city?: string
  building_type?: string
  build_year?: string
  square_meters?: string
  property_id?: string
}

export interface ImportParsedRow {
  id: number
  name: string
  address: string
  city?: string
  buildingType?: string
  squareMeters?: number
  valid: boolean
  errors: string[]
  raw: Record<string, string>
}

function normaliseAddr(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ")
}

export function resolvePropertyGroups(
  rows: ImportParsedRow[],
  mapping: ImportColumnMapping,
): PropertyGroup[] {
  const groups = new Map<string, PropertyGroup>()

  rows.forEach((row) => {
    const space: PropertySpace = {
      rowIndex: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      buildingType: row.buildingType,
      squareMeters: row.squareMeters,
      raw: row.raw,
    }

    // Priority 1 — explicit property_id column
    const propId = mapping.property_id ? row.raw[mapping.property_id]?.trim() : undefined
    if (propId) {
      const key = `pid:${propId}`
      const g = groups.get(key)
      if (g) {
        g.spaces.push(space)
      } else {
        groups.set(key, { key, propertyName: propId, address: row.address, spaces: [space], status: "resolved", issues: [] })
      }
      return
    }

    // Priority 2 — shared normalised address (soft grouping)
    if (row.address) {
      const key = `addr:${normaliseAddr(row.address)}`
      const g = groups.get(key)
      if (g) {
        g.spaces.push(space)
        if (g.status === "resolved") {
          g.status = "needs-review"
          g.issues.push("duplicate-address")
        }
      } else {
        groups.set(key, { key, propertyName: row.name || row.address, address: row.address, spaces: [space], status: "resolved", issues: [] })
      }
      return
    }

    // Priority 3 — ungrouped singleton
    const key = `singleton:${row.id}`
    groups.set(key, {
      key,
      propertyName: row.name || `Rivi ${row.id + 1}`,
      address: "",
      spaces: [space],
      status: row.valid ? "resolved" : "conflict",
      issues: row.valid ? [] : row.errors,
    })
  })

  return Array.from(groups.values())
}

// ── Phase 2: Property structure review ──────────────────────────────────────
// buildInitialStructure clusters rows into properties ONLY when a reliable
// identifier exists (property_id or address). Rows with neither are left
// UNRESOLVED (assignment = null) so the user must decide — FinnVesta never
// guesses relationships from names alone.

export interface StructureProperty {
  key: string
  name: string
  address: string
  identifier?: string
  /** true when created by automatic grouping (reliable identifier) */
  auto: boolean
}

export interface InitialStructure {
  properties: StructureProperty[]
  /** rowId ("row-N") -> propertyKey, or null when unresolved */
  assignments: Record<string, string | null>
}

export function buildInitialStructure(
  rows: ImportParsedRow[],
  mapping: ImportColumnMapping,
): InitialStructure {
  const properties = new Map<string, StructureProperty>()
  const assignments: Record<string, string | null> = {}
  const groupNames = new Map<string, Map<string, number>>()

  const ensureProp = (key: string, base: Omit<StructureProperty, "key">) => {
    if (!properties.has(key)) properties.set(key, { key, ...base })
  }
  const recordName = (key: string, name: string) => {
    if (!name) return
    if (!groupNames.has(key)) groupNames.set(key, new Map())
    const m = groupNames.get(key)!
    m.set(name, (m.get(name) ?? 0) + 1)
  }

  for (const r of rows) {
    const id = `row-${r.id}`
    const identifier = mapping.property_id ? r.raw[mapping.property_id]?.trim() : ""

    // Priority 1 — reliable identifier
    if (identifier) {
      const key = `pid:${identifier}`
      ensureProp(key, { name: identifier, address: r.address, identifier, auto: true })
      assignments[id] = key
      recordName(key, r.name)
      continue
    }

    // Priority 2 — address (a single address = standalone property, shared = grouped)
    if (r.address) {
      const key = `addr:${normaliseAddr(r.address)}`
      ensureProp(key, { name: r.name || r.address, address: r.address, auto: true })
      assignments[id] = key
      recordName(key, r.name)
      continue
    }

    // Priority 3 — no reliable identifier → unresolved
    assignments[id] = null
  }

  // Choose the most common non-empty name for each auto group.
  for (const [key, names] of groupNames) {
    const prop = properties.get(key)
    if (!prop) continue
    let best = ""
    let bestCount = 0
    for (const [nm, count] of names) {
      if (count > bestCount) { best = nm; bestCount = count }
    }
    if (best) prop.name = best
  }

  return { properties: Array.from(properties.values()), assignments }
}

/** Accepted file extensions for the uploader. */
export const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"]

export function isAcceptedFile(name: string): boolean {
  const lower = name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}
