'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LoginFormProps {
  labels: {
    loginTitle: string
    loginDescription: string
    emailLabel: string
    passwordLabel: string
    loginButton: string
    loggingIn: string
    credentialsHint: string
    genericError: string
    showPassword: string
    hidePassword: string
    tagline: string
  }
}

export function LoginForm({ labels }: LoginFormProps) {
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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/app')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : labels.genericError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <h2 className="text-2xl font-semibold text-white">{labels.loginTitle}</h2>
      <p className="mt-1 text-sm text-white/60">{labels.loginDescription}</p>

      <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white/80">
            {labels.emailLabel}
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
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
            {labels.passwordLabel}
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
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
              aria-label={showPassword ? labels.hidePassword : labels.showPassword}
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white/80"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
        >
          {isLoading ? labels.loggingIn : labels.loginButton}
        </Button>

        <p className="text-center text-sm text-white/50">
          {labels.credentialsHint}
        </p>
      </form>
    </div>
  )
}
