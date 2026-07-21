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
  Search,
  Bell,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

const mainNavItems = [
  { href: "/app", labelKey: "nav.overview", icon: LayoutDashboard },
  { href: "/app/properties", labelKey: "nav.properties", icon: Building2 },
  { href: "/app/kuntoarviot", labelKey: "nav.inspections", icon: ClipboardCheck },
  { href: "/app/timeline", labelKey: "nav.pts", icon: CalendarRange },
  { href: "/app/huoltohistoria", labelKey: "nav.maintenance", icon: Wrench },
  { href: "/app/vertailu", labelKey: "nav.analytics", icon: BarChart3 },
  { href: "/app/raportit", labelKey: "nav.reports", icon: FileText },
] as const

const propertyNavItems = [
  { href: "/app/properties/[id]", labelKey: "nav.propertyOverview", icon: Eye },
  { href: "/app/properties/[id]/komponentit", labelKey: "nav.components", icon: Grid3X3 },
  { href: "/app/properties/[id]/tavoitesuunnittelu", labelKey: "nav.targetPlanning", icon: Target },
] as const

const adminNavItems = [
  { href: "/app/asetukset", labelKey: "nav.settings", icon: Settings },
] as const

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)

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
      {/* Search */}
      <div className="px-3 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("nav.searchPlaceholder")}
            className="w-full rounded-lg border border-border/50 bg-muted/30 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
              {t(item.labelKey)}
            </Link>
          )
        })}

        {/* Property-specific section */}
        <div className="pt-6">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            {t("nav.sectionProperty")}
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                  {t(item.labelKey)}
                </Link>
              )
            })
          ) : (
            <div className="mx-3 rounded-lg border border-border/30 bg-muted/20 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/80">
                  {t("nav.selectPropertyHint")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Admin section */}
        <div className="pt-6">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            {t("nav.sectionAdmin")}
          </div>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {t(item.labelKey)}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Language & Logout */}
      <div className="border-t border-border/30 p-4 space-y-1">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/30 bg-card/95 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border/30 px-4">
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
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-card/95 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
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
        </div>
        <button type="button" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} onKeyDown={() => {}} />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border/30 bg-card pt-14 flex flex-col">
            <NavContent onItemClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
