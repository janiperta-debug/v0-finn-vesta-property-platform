import { cookies } from "next/headers"
import { defaultLocale, isLocale, type Locale } from "./config"
import { dictionaries, type Dictionary } from "./dictionaries"

// Keep in sync with COOKIE_KEY in ./index.tsx
export const LOCALE_COOKIE = "finnvesta-locale"

type Namespace = keyof Dictionary
type TranslationKey = {
  [N in Namespace]: `${N & string}.${keyof Dictionary[N] & string}`
}[Namespace]

// Reads the locale from the request cookie. Server Components can't see
// localStorage, so the client mirrors the preference into this cookie.
export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : defaultLocale
}

// Server-side translator mirroring the client `t()` (same key type, same
// Finnish → raw-key fallback chain), for use in Server Components.
export async function getTranslation(): Promise<{
  locale: Locale
  t: (key: TranslationKey) => string
}> {
  const locale = await getLocale()
  const t = (key: TranslationKey): string => {
    const [ns, k] = key.split(".") as [Namespace, string]
    const dict = dictionaries[locale] ?? dictionaries[defaultLocale]
    const section = dict[ns] as Record<string, string> | undefined
    return (
      section?.[k] ??
      (dictionaries[defaultLocale][ns] as Record<string, string>)?.[k] ??
      key
    )
  }
  return { locale, t }
}
