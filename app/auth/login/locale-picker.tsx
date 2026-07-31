'use client'

import { useState } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { locales, localeNames, localeCountryCodes } from '@/lib/i18n/config'
import type { Locale } from '@/lib/i18n/config'
import { useTranslation } from '@/lib/i18n'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export function LocalePicker() {
  const { locale: active, setLocale, t } = useTranslation()
  const [open, setOpen] = useState(false)

  function handleSelect(next: Locale) {
    setOpen(false)
    if (next !== active) {
      // setLocale persists the cookie + localStorage and refreshes Server
      // Components so the server-rendered login page picks up the new locale.
      setLocale(next)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('languages.selectLabel')}
          className="flex h-11 min-w-[10rem] items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-medium text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-white/80" aria-hidden="true" />
            {localeNames[active]}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-white/70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-64 rounded-xl border-white/10 bg-slate-900/95 p-1.5 text-white shadow-xl backdrop-blur-md"
      >
        <ul role="listbox" aria-label={t('languages.selectLabel')} className="flex flex-col">
          {locales.map((locale) => {
            const isActive = locale === active
            const code = localeCountryCodes[locale]
            return (
              <li key={locale}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(locale)}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    isActive ? 'bg-white/10' : 'hover:bg-white/5',
                  ].join(' ')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/w80/${code}.png`}
                    srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
                    alt=""
                    width={28}
                    height={21}
                    className="h-[21px] w-7 shrink-0 rounded-sm object-cover shadow-sm"
                    loading="eager"
                  />
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-semibold text-white">
                      {localeNames[locale]}
                    </span>
                    <span className="truncate text-xs text-white/50">
                      {t(`languages.${locale}`)}
                    </span>
                  </span>
                  {isActive && (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
