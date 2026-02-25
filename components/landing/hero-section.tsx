import Link from "next/link"
import { ArrowRight, BarChart3, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(215_40%_15%)_0%,transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <span className="text-xs font-medium text-primary">Property Foresight</span>
          </div>

          <h1 className="font-heading text-balance text-4xl font-bold leading-tight text-foreground md:text-6xl">
            Elävää kiinteistöhallintaa{" "}
            <span className="text-primary">ei enää vanhenevia raportteja</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Korvaa kalliit konsulttiarviot reaaliaikaisella kiinteistöjen kuntoarvio- ja PTS-alustalla.
            Suomalaisiin standardeihin rakennettu.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/demo">
              <Button size="lg" className="gap-2 px-8">
                Katso demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#contact">
              <Button size="lg" variant="outline" className="border-primary/30 px-8 text-foreground hover:bg-primary/10 bg-transparent">
                Ota yhteyttä
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Reaaliaikainen data</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Suomalaiset standardit</span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Valmis 8-10 viikossa</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
