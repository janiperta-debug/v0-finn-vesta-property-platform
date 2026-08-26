import { readFileSync, readdirSync } from "node:fs"

const dictDir = "lib/i18n/dictionaries"
const files = readdirSync(dictDir).filter((f) => /^(fi|en|sv|et|lv|lt)\.ts$/.test(f))

// Keys referenced by app/app/vertailu/page.tsx (namespace.key)
const used = [
  "comparison.unnamed",
  "comparison.title",
  "comparison.subtitle",
  "comparison.emptyTitle",
  "comparison.emptyDescription",
  "comparison.addProperty",
  "comparison.propertiesLabel",
  "comparison.avgConditionLabel",
  "comparison.avgRepairDebtPerSqmLabel",
  "comparison.totalRepairDebtLabel",
  "comparison.tableTitle",
  "comparison.tableDescription",
  "comparison.colProperty",
  "comparison.colType",
  "comparison.colArea",
  "comparison.colBuilt",
  "comparison.colCondition",
  "comparison.colRepairDebt",
  "comparison.distributionTitle",
  "comparison.distributionDescription",
  "comparison.condExcellentRange",
  "comparison.condGoodRange",
  "comparison.condSatisfactoryRange",
  "comparison.condPoorRange",
  "comparison.condWeakRange",
  "comparison.unitPcs",
  "comparison.repairDebtByPropertyTitle",
  "comparison.largestRepairDebtsDescription",
  "comparison.varasto",
  "propertyTypes.kerrostalo",
  "propertyTypes.rivitalo",
  "propertyTypes.paritalo",
  "propertyTypes.omakotitalo",
  "propertyTypes.toimisto",
  "propertyTypes.teollisuus",
  "propertyTypes.muu",
]

let missingTotal = 0
for (const file of files) {
  const lang = file.replace(".ts", "")
  const src = readFileSync(`${dictDir}/${file}`, "utf8")
  for (const key of used) {
    const leaf = key.split(".").pop()
    // naive but effective: ensure the leaf key appears as an object key somewhere
    const re = new RegExp(`(^|\\s)${leaf.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}:\\s`, "m")
    if (!re.test(src)) {
      console.log(`MISSING [${lang}] ${key}`)
      missingTotal++
    }
  }
}
console.log(missingTotal === 0 ? "ALL PRESENT" : `TOTAL MISSING: ${missingTotal}`)
