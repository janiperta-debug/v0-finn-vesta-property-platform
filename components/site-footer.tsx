import Link from "next/link"
import { Building2 } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">FinnVesta</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Property Foresight</p>
            <p className="mt-1 text-xs text-muted-foreground">T:mi Janope</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Tuote</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Ominaisuudet
              </Link>
              <Link href="/#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Hinnoittelu
              </Link>
              <Link href="/demo" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Demo
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Laki</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/tietosuoja" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Tietosuojaseloste
              </Link>
              <Link href="/kayttoehdot" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Käyttöehdot
              </Link>
              <Link href="/evasteet" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Evästekäytäntö
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Muut tuotteet</h4>
            <nav className="flex flex-col gap-2">
              <a
                href="https://finnverdis.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                FinnVerdis
              </a>
              <a
                href="https://gametable.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                GameTable
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FinnVesta. Kaikki oikeudet pidätetään.
          </p>
        </div>
      </div>
    </footer>
  )
}
