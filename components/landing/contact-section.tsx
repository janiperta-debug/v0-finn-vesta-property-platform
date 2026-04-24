"use client"

import { Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ContactSection() {
  return (
    <section id="contact" className="border-t border-border/50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">
            Kiinnostuitko? Ota yhteyttä!
          </h2>
          <p className="mt-4 text-muted-foreground">
            Kerromme mielellämme lisää ja näytämme demon FinnVestasta.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Nimi
                  </label>
                  <Input id="name" placeholder="Etunimi Sukunimi" className="border-border/50 bg-card text-foreground" />
                </div>
                <div>
                  <label htmlFor="org" className="mb-1.5 block text-sm font-medium text-foreground">
                    Organisaatio
                  </label>
                  <Input id="org" placeholder="Organisaation nimi" className="border-border/50 bg-card text-foreground" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Sähköposti
                  </label>
                  <Input id="email" type="email" placeholder="nimi@esimerkki.fi" className="border-border/50 bg-card text-foreground" />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                    Puhelin
                  </label>
                  <Input id="phone" placeholder="+358 40 123 4567" className="border-border/50 bg-card text-foreground" />
                </div>
              </div>
              <div>
                <label htmlFor="properties" className="mb-1.5 block text-sm font-medium text-foreground">
                  Kiinteistöjen määrä
                </label>
                <Input id="properties" placeholder="esim. 25" className="border-border/50 bg-card text-foreground" />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
                  Viesti
                </label>
                <Textarea
                  id="message"
                  placeholder="Kerro tarpeistasi..."
                  rows={4}
                  className="border-border/50 bg-card text-foreground"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Lähetä viesti
              </Button>
            </form>
          </div>

          <div className="md:col-span-2">
            <div className="space-y-6 rounded-xl border border-border/50 bg-card p-6">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  Sähköposti
                </div>
                <a href="mailto:info@janope.fi" className="text-sm text-muted-foreground hover:text-primary">info@janope.fi</a>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  Puhelin
                </div>
                <a href="tel:+358400982177" className="text-sm text-muted-foreground hover:text-primary">+358 (0)400 982177</a>
              </div>

              <div className="border-t border-border/50 pt-4">
                <h4 className="mb-2 text-sm font-semibold text-foreground">Varaa demo</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Näe FinnVesta toiminnassa henkilökohtaisella demolla, joka räätälöidään tarpeisiisi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
