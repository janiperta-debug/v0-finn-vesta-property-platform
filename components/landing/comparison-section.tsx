import { Check, X } from "lucide-react"

export function ComparisonSection() {
  return (
    <section className="border-t border-border/50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">
            FinnVesta vs. perinteinen ratkaisu
          </h2>
          <p className="mt-4 text-muted-foreground">
            Katso miksi modernit kiinteistön omistajat valitsevat FinnVestan.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Traditional */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">Perinteinen konsulttiratkaisu</h3>
            <p className="mb-6 text-2xl font-bold text-muted-foreground">
              10 000 - 50 000 &euro;
              <span className="ml-1 text-sm font-normal">+ ylläpito</span>
            </p>
            <ul className="space-y-3">
              {[
                "Toimittajaloukku",
                "Raportti vanhenee heti",
                "Päivitykset maksavat erikseen",
                "Suuri alkuinvestointi",
                "6-12 kuukauden toimitusaika",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* FinnVesta */}
          <div className="relative rounded-xl border-2 border-primary/40 bg-card p-6">
            <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
              Suositeltu
            </div>
            <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">FinnVesta SaaS</h3>
            <p className="mb-6 text-2xl font-bold text-primary">
              Reilu hinnoittelu
              <span className="ml-1 text-sm font-normal text-muted-foreground">maksat vain käytöstä</span>
            </p>
            <ul className="space-y-3">
              {[
                "Ei toimittajaloukkua",
                "Aina ajan tasalla",
                "Automaattiset päivitykset",
                "Maksat käyttäjistä + kiinteistöistä",
                "4-6 viikon käyttöönotto",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
