import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "490",
    description: "Pienille portfolioille",
    features: [
      "1-5 kiinteistoa",
      "Perus kuntoarviot",
      "PTS-suunnittelu",
      "Raportit (PDF)",
      "Sähköpostituki",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "890",
    description: "Keskikokoisille portfolioille",
    features: [
      "6-20 kiinteistoa",
      "Komponenttiarviot",
      "Portfolio-analytiikka",
      "Skenaarioanalyysi",
      "Prioriteettituki",
      "Excel-vienti",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Räätälöidään",
    description: "Suurille organisaatioille",
    features: [
      "20+ kiinteistoa",
      "Käyttäjähallinta",
      "API-integraatiot",
      "Omistettu tuki",
      "Räätälöidyt raportit",
      "SLA-sopimus",
    ],
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border/50 bg-card/30 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">Hinnoittelu</h2>
          <p className="mt-4 text-muted-foreground">Hinnoittelu sisältää katselmointikäynnit ja käyttöönoton.</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-6 ${
                plan.popular
                  ? "border-2 border-primary/40 bg-card"
                  : "border-border/50 bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Suosituin
                </div>
              )}
              <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mb-6 text-3xl font-bold text-foreground">
                {plan.price === "Räätälöidään" ? (
                  <span className="text-xl">Räätälöidään</span>
                ) : (
                  <>
                    {plan.price} &euro;<span className="text-base font-normal text-muted-foreground">/kk</span>
                  </>
                )}
              </p>
              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/#contact">
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full ${!plan.popular ? "border-primary/30 text-foreground hover:bg-primary/10" : ""}`}
                >
                  Ota yhteyttä
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
