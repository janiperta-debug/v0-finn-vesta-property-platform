"use client"

import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"

export default function KayttoehdotPage() {
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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{t("termsOfService.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("termsOfService.lastUpdated")}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section1Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section1Body")}<br />
              {t("termsOfService.section1ContactLabel")} info@janope.fi, +358 (0)400 982177
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section2Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section2Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section3Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section3Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section4Title")}</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t("termsOfService.section4Item1")}</li>
              <li>{t("termsOfService.section4Item2")}</li>
              <li>{t("termsOfService.section4Item3")}</li>
              <li>{t("termsOfService.section4Item4")}</li>
              <li>{t("termsOfService.section4Item5")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section5Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section5Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section6Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section6Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section7Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section7Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section8Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section8Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section9Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section9Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section10Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section10Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("termsOfService.section11Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("termsOfService.section11Body")}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
