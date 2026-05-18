import Image from "next/image"
import {
  RefreshCw,
  Flag,
  PiggyBank,
  Building2,
  Target,
  CalendarRange,
  LayoutGrid,
  Eye,
  TrendingUp,
  Shield,
  Lightbulb,
} from "lucide-react"

const features = [
  {
    icon: RefreshCw,
    title: "Reaaliaikainen päivitys",
    description: "Konsulttiraportit vanhenevat heti. FinnVesta pysyy ajan tasalla automaattisesti.",
  },
  {
    icon: Flag,
    title: "Suomalaiset standardit",
    description: "RT-kortisto, Talo 2000 -nimikkeistö, kuntoluokka ja korjausvelka sisäänrakennettuina.",
  },
  {
    icon: PiggyBank,
    title: "Kustannustehokas",
    description: "80-95% edullisempi kuin perinteiset konsulttiarviot. Kuukausimaksu sisältää kaiken.",
  },
  {
    icon: Building2,
    title: "Portfolio-hallinta",
    description: "Näe kaikki kiinteistösi yhdellä silmäyksellä. Aggregoidut mittarit ja analytiikka.",
  },
  {
    icon: LayoutGrid,
    title: "Huoneistotason seuranta",
    description: "Jaa rakennus tiloihin ja huoneistoihin. Seuraa kuntoa tila- ja komponenttitasolla.",
  },
  {
    icon: Target,
    title: "Skenaarioanalyysi",
    description: "Kokeile eri tavoitekuntoja ja näe investointitarpeet reaaliajassa.",
  },
  {
    icon: CalendarRange,
    title: "15v PTS-suunnittelu",
    description: "RT 18-11131 -mukainen pitkän tähtäimen suunnittelu ja visualisointi.",
  },
]

const benefits = [
  {
    icon: Eye,
    title: "Ennakoitavuutta",
    description: "Näe tulevat investoinnit, riskit ja tarpeet ennen kuin ne yllättävät.",
  },
  {
    icon: TrendingUp,
    title: "Tarkentuu ajan myötä",
    description: "Tarkastukset ja toimenpiteet tekevät mallista yhä tarkemman.",
  },
  {
    icon: Shield,
    title: "Hallitse kokonaisuutta",
    description: "Kaikki kiinteistösi yhdessä näkymässä – mistä ja milloin tahansa.",
  },
  {
    icon: Lightbulb,
    title: "Päätä paremmin",
    description: "RT- ja Talo2000-tietoon pohjautuva järjestelmä tukee päätöksiäsi.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border/50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Benefits Bar - matching mockup style */}
        <div className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">
            Miksi FinnVesta?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Moderni alusta, joka tekee kiinteistöhallinnasta läpinäkyvän ja ennakoivan.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Building Types Preview */}
        <div className="mt-20">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h3 className="font-heading text-2xl font-bold text-foreground">Kaikki kiinteistötyypit</h3>
            <p className="mt-2 text-muted-foreground">
              Asuintalot, toimistot, liiketilat, teollisuus ja julkiset rakennukset.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <Image
              src="/images/building-types.jpg"
              alt="Eri kiinteistötyypit"
              width={1200}
              height={600}
              className="w-full"
              quality={85}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
