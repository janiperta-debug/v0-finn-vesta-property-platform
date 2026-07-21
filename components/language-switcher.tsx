"use client"

import { Globe, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n"
import { locales, localeNames, type Locale } from "@/lib/i18n/config"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const select = (next: Locale) => {
    setLocale(next)
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        <span className="flex-1 text-left">{localeNames[locale]}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute bottom-full left-0 mb-1 w-full overflow-hidden rounded-lg border border-border/50 bg-card shadow-lg"
        >
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === locale}
              onClick={() => select(code)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                code === locale ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {localeNames[code]}
              {code === locale && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
