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

export const locales = ["fi", "en"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "fi"

// Display names shown in the language switcher (in each language's own name).
export const localeNames: Record<Locale, string> = {
  fi: "Suomi",
  en: "English",
}

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}
