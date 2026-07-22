import type { Locale } from "../config"
import type { Dictionary } from "./fi"
import fi from "./fi"
import en from "./en"

// Register every language dictionary here. Adding a language = add its import
// and one line to this map.
export const dictionaries: Record<Locale, Dictionary> = {
  fi,
  en,
}

export type { Dictionary }
