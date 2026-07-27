'use client'

import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'

export default function Page() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/app')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('auth.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#0a1420] p-6">
      {/* Blueprint backdrop — single element, breakpoint handled via inline <style> to avoid hydration mismatch */}
      <style>{`
        .login-bg {
          background-image: url('/images/login-blueprint-mobile.jpg');
          background-size: cover;
          background-position: center;
        }
        @media (min-width: 768px) {
          .login-bg {
            background-image: url('/images/login-blueprint-desktop.jpg');
          }
        }
      `}</style>
      <div className="login-bg absolute inset-0 -z-10" aria-hidden="true" />
      {/* Vignette to keep the form readable over the drawing */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,14,24,0.75)_100%)]" aria-hidden="true" />

      <div className="flex w-full max-w-sm flex-col items-center">
        {/* Emblem + wordmark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div
              className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-2xl"
              aria-hidden="true"
            />
            <Image
              src="/finnvesta-logo.png"
              alt="FinnVesta"
              width={132}
              height={132}
              priority
              className="h-28 w-28 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] sm:h-32 sm:w-32"
            />
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white">
            FinnVesta
          </h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.35em] text-primary/80">
            {t('auth.tagline')}
          </p>
        </div>

        {/* Glass login card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-semibold text-white">{t('auth.loginTitle')}</h2>
          <p className="mt-1 text-sm text-white/60">{t('auth.loginDescription')}</p>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white/80">
                {t('auth.emailLabel')}
              </Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="nimi@yritys.fi"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-white/10 bg-white/5 pl-10 text-base text-white placeholder:text-white/40 focus-visible:border-primary/50 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white/80">
                {t('auth.passwordLabel')}
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-white/10 bg-white/5 pl-10 pr-11 text-base text-white placeholder:text-white/40 focus-visible:border-primary/50 focus-visible:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white/80"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
            >
              {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
            </Button>

            <p className="text-center text-sm text-white/50">
              {t('auth.credentialsHint')}
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
