import { MessageSquare, FileSpreadsheet, LogIn, RefreshCw } from "lucide-react"

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Ota yhteyttä",
    description: "Kerro kiinteistöistäsi ja tarpeistasi. Suunnittelemme yhdessä parhaan ratkaisun.",
  },
  {
    icon: FileSpreadsheet,
    step: "02",
    title: "Toimita kiinteistölista",
    description: "Lähetä meille listaus kiinteistöistäsi. Me perustamme ne valmiiksi järjestelmään.",
  },
  {
    icon: LogIn,
    step: "03",
    title: "Käyttöönotto",
    description: "Saat kirjautumistiedot ja pääset alkuun. Kaikki data valmiina alustalla.",
  },
  {
    icon: RefreshCw,
    step: "04",
    title: "Jatkuva päivitys",
    description: "Päivitä tietoja aina kun teette korjauksia. Data pysyy ajan tasalla.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="border-t border-border/50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">Näin se toimii</h2>
          <p className="mt-4 text-muted-foreground">Neljässä vaiheessa kohti modernimpaa kiinteistöhallintaa.</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-border/50 lg:block" />
              )}
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.step}
                </span>
              </div>
              <h3 className="mb-2 font-heading text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
