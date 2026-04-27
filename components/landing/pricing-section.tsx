"use client"

import { Check, Users, Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const pricingComponents = [
  {
    icon: User,
    title: "Pääkäyttäjä",
    price: "79",
    unit: "€/kk",
    yearlyPrice: "948 €/vuosi",
    description: "Organisaation hallinnoija, joka hallinnoi käyttäjiä ja asetuksia",
  },
  {
    icon: Users,
    title: "Lisäkäyttäjä",
    price: "49",
    unit: "€/kk",
    yearlyPrice: "588 €/vuosi",
    description: "Jokainen pääkäyttäjän lisäämä käyttäjä",
  },
]

const buildingTiers = [
  { 
    tier: "S", 
    label: "Pieni",
    range: "< 1 000 m²", 
    price: "9",
    unit: "€/kk/rakennus"
  },
  { 
    tier: "M", 
    label: "Keskikoko",
    range: "1 000 – 5 000 m²", 
    price: "15",
    unit: "€/kk/rakennus"
  },
  { 
    tier: "L", 
    label: "Suuri",
    range: "> 5 000 m²", 
    price: "25",
    unit: "€/kk/rakennus"
  },
]

const includedFeatures = [
  "Kaikki ominaisuudet käytössä",
  "17-kategorian kuntoarviojärjestelmä",
  "Huoneistotason seuranta",
  "Automaattinen PTS-suunnittelu",
  "Raportit ja analytiikka",
  "Käyttöönottokoulutus",
  "Tekninen tuki",
  "Jatkuva kehitys",
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
            Maksat käyttäjistä ja rakennuksista. Ei piilokustannuksia, ei toimittajaloukkua.
          </p>
        </div>

        {/* User licenses */}
        <div className="mx-auto mb-12 max-w-3xl">
          <h3 className="mb-4 text-center font-heading text-xl font-semibold text-foreground">
            Käyttäjälisenssit
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {pricingComponents.map((component) => (
              <div
                key={component.title}
                className="flex flex-col rounded-xl border border-border/50 bg-card p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <component.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-foreground">
                  {component.title}
                </h4>
                <p className="mb-4 text-sm text-muted-foreground">{component.description}</p>
                <div className="mt-auto">
                  <p className="text-3xl font-bold text-foreground">
                    {component.price}
                    <span className="text-base font-normal text-muted-foreground"> {component.unit}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{component.yearlyPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Building tiers */}
        <div className="mx-auto mb-12 max-w-4xl">
          <h3 className="mb-4 text-center font-heading text-xl font-semibold text-foreground">
            <Building2 className="mr-2 inline-block h-5 w-5 text-primary" />
            Rakennusten seuranta
          </h3>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Hinnoittelu perustuu rakennuksen kokoon neliömetreinä
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {buildingTiers.map((tier) => (
              <div
                key={tier.tier}
                className="flex flex-col items-center rounded-xl border border-border/50 bg-card p-5 text-center"
              >
                <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {tier.tier}
                </span>
                <span className="mt-2 font-semibold text-foreground">{tier.label}</span>
                <span className="text-sm text-muted-foreground">{tier.range}</span>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  {tier.price}
                  <span className="text-sm font-normal text-muted-foreground"> €</span>
                </p>
                <span className="text-xs text-muted-foreground">{tier.unit}</span>
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

        {/* Example calculation */}
        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-border/30 bg-muted/30 p-4">
          <p className="text-center text-sm text-muted-foreground">
            <strong className="text-foreground">Esimerkki:</strong> 1 pääkäyttäjä + 2 lisäkäyttäjää + 10 keskikokoista rakennusta = 
            <span className="text-primary font-semibold"> 327 €/kk</span>
          </p>
        </div>
      </div>
    </section>
  )
}
