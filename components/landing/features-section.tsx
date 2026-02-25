import {
  RefreshCw,
  Flag,
  PiggyBank,
  Building2,
  Target,
  CalendarRange,
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
    description: "Kuntoluokka, korjausvelka, PTS 2040 - kaikki tutut käsitteet sisäänrakennettuina.",
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
    icon: Target,
    title: "Skenaarioanalyysi",
    description: "Kokeile eri tavoitekuntoja ja näe investointitarpeet reaaliajassa.",
  },
  {
    icon: CalendarRange,
    title: "15v PTS-suunnittelu",
    description: "Trellum PTS 2040 -yhteensopiva pitkän tähtäimen suunnittelu ja visualisointi.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border/50 bg-card/30 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">Miksi FinnVesta?</h2>
          <p className="mt-4 text-muted-foreground">
            Moderni alusta, joka tekee kiinteistöhallinnasta läpinäkyvän ja ennakoivan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:bg-accent/50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
