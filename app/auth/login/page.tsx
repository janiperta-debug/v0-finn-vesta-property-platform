'use client'

import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">FinnVesta</h1>
            <p className="text-sm text-muted-foreground">{t("auth.tagline")}</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("auth.loginTitle")}</CardTitle>
              <CardDescription>
                {t("auth.loginDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("auth.emailLabel")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nimi@yritys.fi"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {t("auth.credentialsHint")}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
