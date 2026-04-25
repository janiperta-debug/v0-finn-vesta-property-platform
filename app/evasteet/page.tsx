"use client"

import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EvasteetPage() {
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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Evästekäytäntö</h1>
        <p className="text-sm text-muted-foreground mb-8">Päivitetty: 25.4.2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Mitä evästeet ovat?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Evästeet (cookies) ovat pieniä tekstitiedostoja, jotka tallennetaan laitteellesi kun 
              vierailet verkkosivustolla. Ne auttavat sivustoa muistamaan tietoja vierailustasi, 
              kuten kirjautumistiedot ja asetukset.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Käyttämämme evästeet</h2>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Välttämättömät evästeet</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nämä evästeet ovat välttämättömiä palvelun toiminnalle. Ilman näitä evästeitä 
              kirjautuminen ja palvelun perustoiminnot eivät toimi.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-foreground">Eväste</th>
                    <th className="text-left py-2 text-foreground">Tarkoitus</th>
                    <th className="text-left py-2 text-foreground">Voimassaolo</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">sb-auth-token</td>
                    <td className="py-2">Käyttäjän tunnistautuminen</td>
                    <td className="py-2">Istunto / 7 päivää</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">sb-refresh-token</td>
                    <td className="py-2">Istunnon uusiminen</td>
                    <td className="py-2">7 päivää</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Toiminnalliset evästeet</h3>
            <p className="text-muted-foreground leading-relaxed">
              Nämä evästeet parantavat käyttökokemusta muistamalla valitsemasi asetukset, 
              kuten käyttöliittymän tilan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Kolmansien osapuolten evästeet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Emme käytä markkinointi- tai seurantaevästeitä. Palvelu ei sisällä kolmansien osapuolten 
              analytiikka- tai mainostyökaluja, jotka asettaisivat evästeitä.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Evästeiden hallinta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Voit hallita evästeitä selaimesi asetuksista. Huomaa, että välttämättömien evästeiden 
              estäminen voi vaikuttaa palvelun toimintaan. Useimmat selaimet sallivat evästeiden 
              poistamisen ja estämisen seuraavasti:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li><strong>Chrome:</strong> Asetukset → Tietosuoja ja turvallisuus → Evästeet</li>
              <li><strong>Firefox:</strong> Asetukset → Tietosuoja ja turvallisuus → Evästeet</li>
              <li><strong>Safari:</strong> Asetukset → Tietosuoja → Evästeet</li>
              <li><strong>Edge:</strong> Asetukset → Evästeet ja sivuston käyttöoikeudet</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Yhteydenotto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Jos sinulla on kysyttävää evästekäytännöstämme, ota yhteyttä:<br />
              info@janope.fi
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Muutokset</h2>
            <p className="text-muted-foreground leading-relaxed">
              Voimme päivittää tätä evästekäytäntöä ajoittain. Suosittelemme tarkistamaan tämän 
              sivun säännöllisesti.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
