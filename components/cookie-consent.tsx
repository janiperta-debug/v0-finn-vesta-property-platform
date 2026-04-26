"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("finnvesta-cookie-consent")
    if (!consent) {
      // Small delay to avoid layout shift on initial load
      const timer = setTimeout(() => setShowBanner(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("finnvesta-cookie-consent", "accepted")
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem("finnvesta-cookie-consent", "declined")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-4 md:p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 pr-8">
            <h3 className="font-semibold text-foreground mb-1">Evästeet</h3>
            <p className="text-sm text-muted-foreground">
              Käytämme vain välttämättömiä evästeitä kirjautumisen ja istunnon hallintaan. 
              Emme käytä seuranta- tai mainosevästeitä.{" "}
              <Link href="/evasteet" className="text-primary hover:underline">
                Lue lisää
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="text-muted-foreground"
            >
              Vain välttämättömät
            </Button>
            <Button size="sm" onClick={handleAccept}>
              Hyväksy
            </Button>
          </div>
        </div>
        <button
          onClick={handleDecline}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Sulje"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
