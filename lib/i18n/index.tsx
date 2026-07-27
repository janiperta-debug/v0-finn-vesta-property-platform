"use client"

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { defaultLocale, isLocale, type Locale } from "./config"
import { dictionaries, type Dictionary } from "./dictionaries"

const STORAGE_KEY = "finnvesta-locale"
// Same key is mirrored to a cookie so Server Components can read the locale
// (localStorage is not available on the server). Keep this in sync with
// `LOCALE_COOKIE` in ./server.ts.
const COOKIE_KEY = "finnvesta-locale"

function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return
  // 1 year, root path, Lax so it is sent on top-level navigations (SSR reads it).
  document.cookie = `${COOKIE_KEY}=${locale};path=/;max-age=31536000;samesite=lax`
}

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

function getInitialLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale
  // Read the locale cookie directly so the initial client render matches the
  // server render (both use the cookie value). Avoids hydration mismatch.
  const match = document.cookie.match(/(?:^|;\s*)finnvesta-locale=([^;]+)/)
  const value = match?.[1]
  return isLocale(value) ? value : defaultLocale
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  // Sync localStorage → cookie on first mount (covers users who had only
  // localStorage set before cookie support was added).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLocale(stored) && stored !== locale) {
      setLocaleState(stored)
      writeLocaleCookie(stored)
    } else if (locale !== defaultLocale) {
      writeLocaleCookie(locale)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    writeLocaleCookie(next)
    // Server Components rendered the current page with the old locale, so refresh
    // to re-render them with the new one. Client components already updated via state.
    router.refresh()
  }, [router])

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
