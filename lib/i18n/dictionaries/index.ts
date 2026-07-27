import type { Locale } from "../config"
import type { Dictionary } from "./fi"
import fi from "./fi"
import en from "./en"

// Register every language dictionary here. Adding a language = add its import
// and one line to this map.
// Languages without a full translation yet fall back to English.
export const dictionaries: Record<Locale, Dictionary> = {
  fi,
  sv: en,
  en,
  et: en,
  lv: en,
  lt: en,
}

export type { Dictionary }
