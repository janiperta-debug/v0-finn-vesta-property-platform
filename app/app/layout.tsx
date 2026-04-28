import React from "react"
import type { Metadata } from "next"
import { AppNav } from "@/components/app/app-nav"

export const metadata: Metadata = {
  title: "FinnVesta - Portfolio",
  description: "Kiinteistösalkunhallinta",
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <div className="lg:pl-64 overflow-x-hidden">
        <main className="mx-auto max-w-7xl px-4 py-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
