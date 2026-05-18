import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Building2, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-cityscape.jpg"
          alt="Kaupunkinäkymä"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Property Intelligence</span>
          </div>

          <h1 className="font-heading text-balance text-4xl font-bold leading-[1.1] text-foreground md:text-5xl lg:text-6xl">
            Elävää kiinteistöhallintaa{" "}
            <span className="text-primary">ei enää vanhenevia raportteja</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Korvaa kalliit konsulttiarviot reaaliaikaisella kiinteistöjen kuntoarvio- ja PTS-alustalla. 
            Suomalaisiin standardeihin rakennettu.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo">
              <Button size="lg" className="w-full gap-2 px-8 sm:w-auto">
                Katso demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/#contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-primary/30 bg-background/50 px-8 text-foreground backdrop-blur-sm hover:bg-primary/10 sm:w-auto"
              >
                Ota yhteyttä
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">128+</p>
              <p className="text-sm text-muted-foreground">Hallinnoitua kiinteistöä</p>
            </div>
          </div>
          <div className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">89%</p>
              <p className="text-sm text-muted-foreground">Käyttöaste</p>
            </div>
          </div>
          <div className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/80 p-5 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">RT & Talo2000</p>
              <p className="text-sm text-muted-foreground">Suomalaiset standardit</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
