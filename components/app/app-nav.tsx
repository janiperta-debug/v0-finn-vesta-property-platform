"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Wrench,
  CalendarRange,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  Grid3X3,
  Target,
  Info,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// Main navigation items
const mainNavItems = [
  { href: "/app", label: "Portfolio", icon: LayoutDashboard },
  { href: "/app/properties", label: "Rakennukset", icon: Building2 },
  { href: "/app/kuntoarviot", label: "Kuntoarviot", icon: ClipboardCheck },
  { href: "/app/huoltohistoria", label: "Huoltohistoria", icon: Wrench },
  { href: "/app/timeline", label: "Investointiaikajana", icon: CalendarRange },
  { href: "/app/vertailu", label: "Vertailu", icon: BarChart3 },
  { href: "/app/raportit", label: "Raportit", icon: FileText },
]

// Property-specific navigation (shown when a property is selected)
const propertyNavItems = [
  { href: "/app/property/[id]", label: "Yleiskatsaus", icon: Eye },
  { href: "/app/property/[id]/komponentit", label: "Komponentit", icon: Grid3X3 },
  { href: "/app/property/[id]/tavoitesuunnittelu", label: "Tavoitesuunnittelu", icon: Target },
]

// Admin navigation
const adminNavItems = [
  { href: "/app/asetukset", label: "Asetukset", icon: Settings },
]

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Check if we're viewing a specific property
  const propertyMatch = pathname.match(/\/app\/properties\/([^/]+)/)
  const selectedPropertyId = propertyMatch ? propertyMatch[1] : null
  const isOnPropertyPage = selectedPropertyId && selectedPropertyId !== 'new' && selectedPropertyId !== 'import'

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        {/* Property-specific section */}
        <div className="pt-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Kiinteistö
          </div>
          {isOnPropertyPage ? (
            propertyNavItems.map((item) => {
              const href = item.href.replace('[id]', selectedPropertyId)
              const isActive = pathname === href
              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })
          ) : (
            <div className="mx-3 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Valitse kiinteistö Portfoliosta tai Rakennukset-sivulta
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Admin section */}
        <div className="pt-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Hallinta
          </div>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-border/50 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Kirjaudu ulos
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/50 bg-card lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border/50 px-4">
          <Image 
            src="/finnvesta-logo.png" 
            alt="FinnVesta" 
            width={36} 
            height={36}
            className="rounded-lg"
          />
          <span className="font-heading text-lg font-bold text-foreground">FinnVesta</span>
        </div>
        <NavContent />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/50 bg-card px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Image 
          src="/finnvesta-logo.png" 
          alt="FinnVesta" 
          width={28} 
          height={28}
          className="rounded-md"
        />
        <span className="font-heading text-base font-bold text-foreground">FinnVesta</span>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setMobileOpen(false)} onKeyDown={() => {}} />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border/50 bg-card pt-14 flex flex-col">
            <NavContent onItemClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
