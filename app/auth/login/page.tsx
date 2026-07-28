import { getTranslation } from '@/lib/i18n/server'
import { LoginForm } from './login-form'
import { LocalePicker } from './locale-picker'

export default async function Page() {
  const { t } = await getTranslation()

  return (
    <main
      className="flex min-h-svh w-full items-center justify-center p-6"
      style={{
        backgroundImage: "url('/images/login-blueprint-desktop.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        {/* Emblem + wordmark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-0">
            <div
              className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-2xl"
              aria-hidden="true"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/finnvesta-login-logo.png"
              alt="FinnVesta"
              className="h-auto w-64 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] sm:w-72"
            />
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.35em] text-white/90">
            {t('auth.tagline')}
          </p>
          <div className="mt-4">
            <LocalePicker />
          </div>
        </div>

        {/* Interactive login form — client component */}
        <LoginForm
          labels={{
            loginTitle: t('auth.loginTitle'),
            loginDescription: t('auth.loginDescription'),
            emailLabel: t('auth.emailLabel'),
            passwordLabel: t('auth.passwordLabel'),
            loginButton: t('auth.loginButton'),
            loggingIn: t('auth.loggingIn'),
            credentialsHint: t('auth.credentialsHint'),
            genericError: t('auth.genericError'),
            showPassword: t('auth.showPassword'),
            hidePassword: t('auth.hidePassword'),
            tagline: t('auth.tagline'),
          }}
        />
      </div>
    </main>
  )
}
