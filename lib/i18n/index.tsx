"use client"

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"
import { defaultLocale, isLocale, type Locale } from "./config"
import { dictionaries, type Dictionary } from "./dictionaries"

const STORAGE_KEY = "finnvesta-locale"

// A dot-path into the dictionary, e.g. "nav.overview". This gives editor
// autocomplete and catches typos at build time for the top two levels.
type Namespace = keyof Dictionary
type TranslationKey = {
  [N in Namespace]: `${N & string}.${keyof Dictionary[N] & string}`
}[Namespace]

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  // Load the saved preference on mount (client-only, so no hydration mismatch
  // for the default render which always uses `defaultLocale`).
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
    if (isLocale(stored)) {
      setLocaleState(stored)
    }
  }, [])

  // Keep <html lang> in sync for accessibility and SEO.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      const [ns, k] = key.split(".") as [Namespace, string]
      const dict = dictionaries[locale] ?? dictionaries[defaultLocale]
      const section = dict[ns] as Record<string, string> | undefined
      // Fall back to Finnish, then to the raw key, so nothing ever renders blank.
      return section?.[k] ?? (dictionaries[defaultLocale][ns] as Record<string, string>)?.[k] ?? key
    },
    [locale]
  )

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider")
  }
  return ctx
}
