import React from "react"
import type { Metadata } from "next"
import { DemoNav } from "@/components/demo/demo-nav"

export const metadata: Metadata = {
  title: "FinnVesta Demo - Portfolio",
  description: "Kokeile FinnVesta-demoa esimerkkidatalla.",
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DemoNav />

      {/* Demo banner */}
      <div className="sticky top-0 z-30 border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-xs font-medium text-primary lg:top-0 lg:pl-64">
        Tämä on demoympäristö esimerkkidatalla.
      </div>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </div>
  )
}
