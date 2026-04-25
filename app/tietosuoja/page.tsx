"use client"

import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TietosuojaPage() {
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
                Takaisin
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Tietosuojaseloste</h1>
        <p className="text-sm text-muted-foreground mb-8">Päivitetty: 25.4.2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Rekisterinpitäjä</h2>
            <p className="text-muted-foreground leading-relaxed">
              T:mi Janope<br />
              Sähköposti: info@janope.fi<br />
              Puhelin: +358 (0)400 982177
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Rekisterin nimi</h2>
            <p className="text-muted-foreground leading-relaxed">
              FinnVesta-palvelun asiakasrekisteri
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Henkilötietojen käsittelyn tarkoitus</h2>
            <p className="text-muted-foreground leading-relaxed">
              Henkilötietoja käsitellään asiakassuhteen hoitamiseen, palvelun tuottamiseen ja kehittämiseen, 
              sekä lakisääteisten velvoitteiden täyttämiseen. Tietoja ei käytetä automatisoituun päätöksentekoon 
              tai profilointiin.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Käsiteltävät henkilötiedot</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Nimi ja yhteystiedot (sähköposti, puhelinnumero)</li>
              <li>Organisaation tiedot</li>
              <li>Käyttäjätunnus ja salasana (salattu)</li>
              <li>Palvelun käyttöön liittyvät lokitiedot</li>
              <li>Kiinteistöihin liittyvät tiedot, jotka käyttäjä syöttää palveluun</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Tietojen säilytys ja suojaus</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tiedot säilytetään EU/ETA-alueella sijaitsevilla palvelimilla. Käytämme asianmukaisia teknisiä 
              ja organisatorisia suojatoimia, mukaan lukien salaus, pääsynhallinta ja säännölliset 
              tietoturvatarkastukset. Tietoja säilytetään asiakassuhteen ajan ja lain vaatiman ajan sen päättymisen jälkeen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Tietojen luovutus</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tietoja ei luovuteta kolmansille osapuolille ilman lakisääteistä perustetta. 
              Käytämme alihankkijoita palvelun tekniseen toteuttamiseen (palvelinpalvelut), 
              joiden kanssa on solmittu asianmukaiset tietojenkäsittelysopimukset.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Rekisteröidyn oikeudet</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sinulla on oikeus:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Saada pääsy omiin tietoihisi</li>
              <li>Pyytää tietojen oikaisua tai poistamista</li>
              <li>Rajoittaa tietojen käsittelyä</li>
              <li>Siirtää tiedot järjestelmästä toiseen</li>
              <li>Tehdä valitus valvontaviranomaiselle (Tietosuojavaltuutetun toimisto)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pyyntöjen osalta ota yhteyttä: info@janope.fi
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Muutokset tietosuojaselosteeseen</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pidätämme oikeuden päivittää tätä tietosuojaselostetta. Olennaisista muutoksista ilmoitetaan 
              palvelun kautta tai sähköpostitse.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
