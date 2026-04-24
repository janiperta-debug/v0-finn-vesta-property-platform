"use client"

import { Check, Users, Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const pricingComponents = [
  {
    icon: User,
    title: "Pääkäyttäjä",
    price: "XX",
    unit: "/kk",
    description: "Organisaation hallinnoija, joka hallinnoi käyttäjiä ja asetuksia",
  },
  {
    icon: Users,
    title: "Lisäkäyttäjä",
    price: "XX",
    unit: "/käyttäjä/kk",
    description: "Jokainen pääkäyttäjän lisäämä käyttäjä",
  },
  {
    icon: Building2,
    title: "Kiinteistöt",
    price: "Portaittain",
    unit: "",
    description: "Hinnoittelu kiinteistöjen määrän mukaan",
  },
]

const propertyTiers = [
  { tier: "S", range: "1-XX kiinteistöä", price: "XX €/kk" },
  { tier: "M", range: "XX-XX kiinteistöä", price: "XX €/kk" },
  { tier: "L", range: "XX+ kiinteistöä", price: "XX €/kk" },
]

const includedFeatures = [
  "Kaikki ominaisuudet käytössä",
  "17-kategorian kuntoarviojärjestelmä",
  "Automaattinen PTS-suunnittelu",
  "Raportit ja analytiikka",
  "Käyttöönottokoulutus",
  "Tekninen tuki",
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border/50 bg-card/30 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">
            Selkeä ja reilu hinnoittelu
          </h2>
          <p className="mt-4 text-muted-foreground">
            Maksat vain käyttäjistä ja kiinteistöistä. Ei piilokustannuksia.
          </p>
        </div>

        {/* Pricing components */}
        <div className="mx-auto mb-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {pricingComponents.map((component) => (
            <div
              key={component.title}
              className="flex flex-col rounded-xl border border-border/50 bg-card p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <component.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {component.title}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">{component.description}</p>
              <p className="mt-auto text-2xl font-bold text-foreground">
                {component.price}
                {component.unit && (
                  <span className="text-sm font-normal text-muted-foreground"> {component.unit}</span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Property tiers */}
        <div className="mx-auto mb-12 max-w-2xl">
          <h3 className="mb-4 text-center font-heading text-xl font-semibold text-foreground">
            Kiinteistöportaat
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {propertyTiers.map((tier) => (
              <div
                key={tier.tier}
                className="flex flex-col items-center rounded-lg border border-border/50 bg-card p-4 text-center"
              >
                <span className="mb-1 text-2xl font-bold text-primary">{tier.tier}</span>
                <span className="text-sm text-muted-foreground">{tier.range}</span>
                <span className="mt-2 font-semibold text-foreground">{tier.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Included features */}
        <div className="mx-auto max-w-2xl rounded-xl border border-primary/30 bg-card p-6">
          <h3 className="mb-4 text-center font-heading text-lg font-semibold text-foreground">
            Kaikki paketit sisältävät
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {includedFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/#contact">
              <Button>Pyydä tarjous</Button>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Hinnat päivitetään pian. Ota yhteyttä niin sovitaan juuri teille sopiva ratkaisu.
        </p>
      </div>
    </section>
  )
}
