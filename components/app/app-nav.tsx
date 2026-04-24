"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  Home,
  ClipboardCheck,
  History,
  Target,
  CalendarRange,
  BarChart3,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/app", label: "Portfolio", icon: LayoutDashboard },
  { href: "/app/properties", label: "Kiinteistöt", icon: Home },
  { href: "/app/timeline", label: "Investointiaikajana", icon: CalendarRange },
  { href: "/app/comparison", label: "Vertailu", icon: BarChart3 },
]

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/50 bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border/50 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">FinnVesta</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
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
        </nav>

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
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Building2 className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-heading text-base font-bold text-foreground">FinnVesta</span>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setMobileOpen(false)} onKeyDown={() => {}} />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border/50 bg-card pt-16">
            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
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
            </nav>
            <div className="border-t border-border/50 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Kirjaudu ulos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
