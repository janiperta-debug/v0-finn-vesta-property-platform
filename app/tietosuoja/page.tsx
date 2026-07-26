"use client"

import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"

export default function TietosuojaPage() {
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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{t("privacyPolicy.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("privacyPolicy.lastUpdated")}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section1Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              T:mi Janope<br />
              {t("privacyPolicy.emailLabel")} info@janope.fi<br />
              {t("privacyPolicy.phoneLabel")} +358 (0)400 982177
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section2Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacyPolicy.section2Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section3Title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t("privacyPolicy.section3Intro")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t("privacyPolicy.section3Item1")}</li>
              <li>{t("privacyPolicy.section3Item2")}</li>
              <li>{t("privacyPolicy.section3Item3")}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              {t("privacyPolicy.section3Outro")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section4Title")}</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-3">
              <li>
                <strong className="text-foreground">{t("privacyPolicy.section4ControllerLabel")}</strong>{" "}
                {t("privacyPolicy.section4ControllerText")}
              </li>
              <li>
                <strong className="text-foreground">{t("privacyPolicy.section4ProcessorLabel")}</strong>{" "}
                {t("privacyPolicy.section4ProcessorText")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section5Title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t("privacyPolicy.section5Intro")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-foreground">{t("privacyPolicy.section5Item1Label")}</strong> {t("privacyPolicy.section5Item1Text")}</li>
              <li><strong className="text-foreground">{t("privacyPolicy.section5Item2Label")}</strong> {t("privacyPolicy.section5Item2Text")}</li>
              <li><strong className="text-foreground">{t("privacyPolicy.section5Item3Label")}</strong> {t("privacyPolicy.section5Item3Text")}</li>
              <li><strong className="text-foreground">{t("privacyPolicy.section5Item4Label")}</strong> {t("privacyPolicy.section5Item4Text")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section6Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacyPolicy.section6Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section7Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacyPolicy.section7Body")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section8Title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("privacyPolicy.section8Intro")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t("privacyPolicy.section8Item1")}</li>
              <li>{t("privacyPolicy.section8Item2")}</li>
              <li>{t("privacyPolicy.section8Item3")}</li>
              <li>{t("privacyPolicy.section8Item4")}</li>
              <li>{t("privacyPolicy.section8Item5")}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("privacyPolicy.section8ContactText")} info@janope.fi.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("privacyPolicy.section8ComplaintIntro")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li><strong className="text-foreground">{t("privacyPolicy.section8FinlandLabel")}</strong> {t("privacyPolicy.section8FinlandText")}</li>
              <li><strong className="text-foreground">{t("privacyPolicy.section8EstoniaLabel")}</strong> {t("privacyPolicy.section8EstoniaText")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("privacyPolicy.section9Title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("privacyPolicy.section9Body")}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
