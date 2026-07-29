import type { Locale } from "../config"
import type { Dictionary } from "./fi"
import fi from "./fi"
import sv from "./sv"
import en from "./en"
import et from "./et"
import lv from "./lv"
import lt from "./lt"

// Register every language dictionary here. Adding a language = add its import
// and one line to this map.
export const dictionaries: Record<Locale, Dictionary> = {
  fi,
  sv,
  en,
  et,
  lv,
  lt,
}

export type { Dictionary }
