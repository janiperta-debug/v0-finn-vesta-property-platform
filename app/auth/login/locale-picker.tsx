'use client'

import { useState, useEffect } from 'react'
import { locales, localeNames, localeFlags, defaultLocale, isLocale } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'

const STORAGE_KEY = 'finnvesta-locale'
const COOKIE_KEY = 'finnvesta-locale'

function writeLocale(locale: Locale) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, locale)
  document.cookie = `${COOKIE_KEY}=${locale};path=/;max-age=31536000;samesite=lax`
}

export function LocalePicker() {
  const [active, setActive] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)finnvesta-locale=([^;]+)/)
    const fromCookie = match?.[1]
    if (isLocale(fromCookie)) {
      setActive(fromCookie)
      return
    }
    const fromStorage = window.localStorage.getItem(STORAGE_KEY)
    if (isLocale(fromStorage)) {
      setActive(fromStorage)
    }
  }, [])

  function handleSelect(locale: Locale) {
    setActive(locale)
    writeLocale(locale)
    // Reload so the server-rendered page picks up the new locale cookie
    window.location.reload()
  }

  return (
    <div className="flex items-center justify-center gap-1.5" role="group" aria-label="Valitse kieli">
      {locales.map((locale) => {
        const isActive = locale === active
        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleSelect(locale)}
            title={localeNames[locale]}
            aria-label={localeNames[locale]}
            aria-pressed={isActive}
            className={[
              'flex h-8 w-8 items-center justify-center rounded-md text-lg transition-all duration-150',
              isActive
                ? 'bg-white/20 ring-1 ring-white/50 opacity-100 scale-110'
                : 'opacity-50 hover:opacity-80 hover:bg-white/10',
            ].join(' ')}
          >
            <span aria-hidden="true">{localeFlags[locale]}</span>
          </button>
        )
      })}
    </div>
  )
}
