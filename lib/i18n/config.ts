// i18n configuration for FinnVesta.
//
// Adding a new language later is intentionally trivial:
//   1. Add its code to `locales` below (e.g. "sv").
//   2. Add a matching dictionary file in `lib/i18n/dictionaries/<code>.ts`.
//   3. Register it in `lib/i18n/dictionaries/index.ts`.
// The language switcher and provider pick it up automatically.
//
// Country-based defaults (which languages are offered per market) will layer
// on top of this later — see the planned countries config. For now every
// locale here is selectable everywhere, with Finnish as the default.

export const locales = ["fi", "sv", "en", "et", "lv", "lt"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "fi"

// Display names shown in the language switcher (in each language's own name).
export const localeNames: Record<Locale, string> = {
  fi: "Suomi",
  sv: "Svenska",
  en: "English",
  et: "Eesti",
  lv: "Latviešu",
  lt: "Lietuvių",
}

// ISO 3166-1 alpha-2 country codes used to render real flag images
// (via flagcdn.com). Emoji flags are avoided because Windows/Chrome do not
// render them as flags.
export const localeCountryCodes: Record<Locale, string> = {
  fi: "fi",
  sv: "se",
  en: "gb",
  et: "ee",
  lv: "lv",
  lt: "lt",
}

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}
