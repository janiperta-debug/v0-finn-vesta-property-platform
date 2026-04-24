"use client"

import Link from "next/link"
import { useState } from "react"
import { Building2, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">FinnVesta</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Ominaisuudet
          </Link>
          <Link href="/#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Hinnoittelu
          </Link>
          <Link href="/#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Yhteystiedot
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="sm" className="border-primary/30 text-foreground hover:bg-primary/10 bg-transparent">
              Katso demo
            </Button>
          </Link>
          <Link href="/app">
            <Button variant="outline" size="sm" className="border-primary/30 text-foreground hover:bg-primary/10 bg-transparent">
              Avaa sovellus
            </Button>
          </Link>
          <Link href="/#contact">
            <Button size="sm">Ota yhteyttä</Button>
          </Link>
        </nav>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/#features" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Ominaisuudet
            </Link>
            <Link href="/#pricing" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Hinnoittelu
            </Link>
            <Link href="/#contact" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Yhteystiedot
            </Link>
            <Link href="/demo" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full border-primary/30 text-foreground bg-transparent">
                Katso demo
              </Button>
            </Link>
            <Link href="/app" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full border-primary/30 text-foreground bg-transparent">
                Avaa sovellus
              </Button>
            </Link>
            <Link href="/#contact" onClick={() => setMobileOpen(false)}>
              <Button className="w-full">Ota yhteyttä</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
