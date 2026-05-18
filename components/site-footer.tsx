import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/30 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Image 
                src="/finnvesta-logo.png" 
                alt="FinnVesta" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <span className="font-heading text-xl font-bold text-foreground">FinnVesta</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Property Intelligence
            </p>
            <p className="mt-2 text-xs text-muted-foreground/70">
              Reaaliaikainen kiinteistöhallinta suomalaisille ammattilaisille.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Tuote</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Ominaisuudet
              </Link>
              <Link href="/#pricing" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Hinnoittelu
              </Link>
              <Link href="/demo" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Demo
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Laki</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/tietosuoja" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Tietosuojaseloste
              </Link>
              <Link href="/kayttoehdot" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Käyttöehdot
              </Link>
              <Link href="/evasteet" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Evästekäytäntö
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Muut tuotteet</h4>
            <nav className="flex flex-col gap-3">
              <a
                href="https://finnverdis.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                FinnVerdis
              </a>
              <a
                href="https://gametable.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                GameTable
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground/70">
            &copy; 2025 FinnVesta. Kaikki oikeudet pidätetään.
          </p>
          <p className="text-xs text-muted-foreground/70">
            T:mi Janope
          </p>
        </div>
      </div>
    </footer>
  )
}
