'use client'

import { useState, useEffect } from 'react'
import { locales, localeNames, localeCountryCodes, defaultLocale, isLocale } from '@/lib/i18n/config'
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
    <div className="flex items-center justify-center gap-2.5" role="group" aria-label="Valitse kieli">
      {locales.map((locale) => {
        const isActive = locale === active
        const code = localeCountryCodes[locale]
        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleSelect(locale)}
            title={localeNames[locale]}
            aria-label={localeNames[locale]}
            aria-pressed={isActive}
            className={[
              'flex items-center justify-center rounded-md p-1 transition-all duration-150',
              isActive
                ? 'bg-white/20 ring-2 ring-white/60 opacity-100 scale-110'
                : 'opacity-60 hover:opacity-100 hover:bg-white/10',
            ].join(' ')}
          >
            <img
              src={`https://flagcdn.com/w80/${code}.png`}
              srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
              alt={localeNames[locale]}
              width={36}
              height={27}
              className="h-[27px] w-9 rounded-sm object-cover shadow-sm"
              loading="eager"
            />
          </button>
        )
      })}
    </div>
  )
}
