"use client"

import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"

export default function EvasteetPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">FinnVesta</span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("common.back")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{t("cookiePolicy.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("cookiePolicy.lastUpdated")}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("cookiePolicy.section1Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("cookiePolicy.section1Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("cookiePolicy.section2Title")}</h2>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">{t("cookiePolicy.necessaryTitle")}</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("cookiePolicy.necessaryBody")}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-foreground">{t("cookiePolicy.colCookie")}</th>
                    <th className="text-left py-2 text-foreground">{t("cookiePolicy.colPurpose")}</th>
                    <th className="text-left py-2 text-foreground">{t("cookiePolicy.colDuration")}</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">sb-auth-token</td>
                    <td className="py-2">{t("cookiePolicy.authTokenPurpose")}</td>
                    <td className="py-2">{t("cookiePolicy.authTokenDuration")}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">sb-refresh-token</td>
                    <td className="py-2">{t("cookiePolicy.refreshTokenPurpose")}</td>
                    <td className="py-2">{t("cookiePolicy.sevenDays")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">{t("cookiePolicy.functionalTitle")}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("cookiePolicy.functionalBody")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("cookiePolicy.thirdPartyTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("cookiePolicy.thirdPartyBody")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("cookiePolicy.managementTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("cookiePolicy.managementBody")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li><strong>Chrome:</strong> {t("cookiePolicy.chromePath")}</li>
              <li><strong>Firefox:</strong> {t("cookiePolicy.firefoxPath")}</li>
              <li><strong>Safari:</strong> {t("cookiePolicy.safariPath")}</li>
              <li><strong>Edge:</strong> {t("cookiePolicy.edgePath")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("cookiePolicy.contactTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("cookiePolicy.contactBody")}<br />
              info@janope.fi
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("cookiePolicy.changesTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("cookiePolicy.changesBody")}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
