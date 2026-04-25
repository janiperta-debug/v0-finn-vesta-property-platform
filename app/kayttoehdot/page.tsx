"use client"

import Link from "next/link"
import { Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function KayttoehdotPage() {
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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Käyttöehdot</h1>
        <p className="text-sm text-muted-foreground mb-8">Päivitetty: 25.4.2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Palveluntarjoaja</h2>
            <p className="text-muted-foreground leading-relaxed">
              FinnVesta-palvelua ("Palvelu") tarjoaa T:mi Janope ("Palveluntarjoaja").<br />
              Yhteystiedot: info@janope.fi, +358 (0)400 982177
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Palvelun kuvaus</h2>
            <p className="text-muted-foreground leading-relaxed">
              FinnVesta on kiinteistösalkunhallintajärjestelmä, joka tarjoaa työkaluja kiinteistöjen 
              kuntoarviointiin, korjausvelan seurantaan ja pitkän tähtäimen suunnitteluun (PTS). 
              Palvelu on tarkoitettu ammattikäyttöön.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Käyttöoikeus</h2>
            <p className="text-muted-foreground leading-relaxed">
              Palvelun käyttö edellyttää voimassa olevaa sopimusta Palveluntarjoajan kanssa. 
              Pääkäyttäjä saa käyttöoikeuden sopimuksen solmimisen yhteydessä ja voi luoda 
              käyttöoikeuksia organisaationsa muille käyttäjille. Käyttöoikeus on henkilökohtainen 
              eikä sitä saa luovuttaa kolmansille osapuolille.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Käyttäjän velvollisuudet</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Käyttäjä vastaa käyttäjätunnuksensa ja salasanansa salassapidosta</li>
              <li>Käyttäjä vastaa syöttämiensä tietojen oikeellisuudesta</li>
              <li>Palvelua saa käyttää vain laillisiin tarkoituksiin</li>
              <li>Käyttäjä ei saa yrittää kiertää palvelun teknisiä suojauksia</li>
              <li>Käyttäjä ilmoittaa viipymättä havaitsemistaan tietoturvaongelmista</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Palveluntarjoajan velvollisuudet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Palveluntarjoaja pyrkii pitämään Palvelun käytettävissä 24/7, mutta ei takaa keskeytyksetöntä 
              toimintaa. Suunnitelluista huoltokatkoista ilmoitetaan etukäteen. Palveluntarjoaja vastaa 
              tietojen varmuuskopioinnista ja asianmukaisesta tietoturvasta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Hinnoittelu ja maksaminen</h2>
            <p className="text-muted-foreground leading-relaxed">
              Palvelun hinnoittelu perustuu käyttäjämäärään ja kiinteistöjen määrään. Tarkka hinnoittelu 
              sovitaan sopimuksessa. Laskutus tapahtuu kuukausittain tai vuosittain sopimuksen mukaan. 
              Hinnanmuutoksista ilmoitetaan vähintään 30 päivää etukäteen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Tietojen omistajuus</h2>
            <p className="text-muted-foreground leading-relaxed">
              Käyttäjän Palveluun syöttämät tiedot ovat käyttäjän omaisuutta. Palveluntarjoajalla on 
              oikeus käyttää anonymisoituja ja aggregoituja tietoja palvelun kehittämiseen. 
              Sopimuksen päättyessä käyttäjällä on oikeus saada tietonsa siirrettävässä muodossa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Vastuunrajoitus</h2>
            <p className="text-muted-foreground leading-relaxed">
              Palvelu tarjotaan "sellaisena kuin se on". Palveluntarjoaja ei vastaa välillisistä vahingoista, 
              kuten saamatta jääneestä voitosta. Palveluntarjoajan kokonaisvastuu rajoittuu käyttäjän 
              maksamiin palvelumaksuihin viimeisen 12 kuukauden ajalta. Palvelu ei korvaa ammattilaisen 
              tekemää kuntoarviota tai -tarkastusta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Sopimuksen voimassaolo ja päättyminen</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sopimus on voimassa toistaiseksi tai määräajan sopimuksen mukaan. Molemmat osapuolet 
              voivat irtisanoa sopimuksen kirjallisesti 30 päivän irtisanomisajalla. 
              Palveluntarjoaja voi purkaa sopimuksen välittömästi, jos käyttäjä rikkoo olennaisesti 
              näitä käyttöehtoja.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Sovellettava laki ja riidanratkaisu</h2>
            <p className="text-muted-foreground leading-relaxed">
              Näihin ehtoihin sovelletaan Suomen lakia. Riidat pyritään ratkaisemaan ensisijaisesti 
              neuvottelemalla. Mikäli sovintoa ei saavuteta, ratkaistaan riita Helsingin käräjäoikeudessa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Muutokset käyttöehtoihin</h2>
            <p className="text-muted-foreground leading-relaxed">
              Palveluntarjoaja voi muuttaa näitä käyttöehtoja. Olennaisista muutoksista ilmoitetaan 
              vähintään 30 päivää etukäteen. Palvelun käytön jatkaminen muutosten jälkeen katsotaan 
              hyväksynnäksi.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
