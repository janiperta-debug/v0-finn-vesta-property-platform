"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Building2, 
  Users, 
  CreditCard,
  Lock
} from "lucide-react"

export default function DemoAsetuksetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Asetukset</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hallinnoi profiilia ja organisaation asetuksia (esimerkkidata)
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profiili
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organisaatio
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Käyttäjät
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Laskutus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profiilitiedot</CardTitle>
              <CardDescription>Omat tietosi järjestelmässä</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nimi</Label>
                  <Input defaultValue="Demo Käyttäjä" />
                </div>
                <div className="space-y-2">
                  <Label>Sähköposti</Label>
                  <Input defaultValue="demo@esimerkki.fi" />
                </div>
                <div className="space-y-2">
                  <Label>Puhelin</Label>
                  <Input defaultValue="+358 40 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label>Rooli</Label>
                  <Input defaultValue="Pääkäyttäjä" disabled />
                </div>
              </div>
              <Button>Tallenna muutokset</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organisaation tiedot</CardTitle>
              <CardDescription>Organisaation perustiedot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Organisaation nimi</Label>
                  <Input defaultValue="Esimerkkikunta" />
                </div>
                <div className="space-y-2">
                  <Label>Y-tunnus</Label>
                  <Input defaultValue="1234567-8" />
                </div>
                <div className="space-y-2">
                  <Label>Osoite</Label>
                  <Input defaultValue="Esimerkkikatu 1" />
                </div>
                <div className="space-y-2">
                  <Label>Postinumero ja -toimipaikka</Label>
                  <Input defaultValue="00100 Helsinki" />
                </div>
              </div>
              <Button>Tallenna muutokset</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Käyttäjähallinta</CardTitle>
                <CardDescription>Organisaation käyttäjät</CardDescription>
              </div>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Lisää käyttäjä
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Demo Käyttäjä</p>
                      <p className="text-sm text-muted-foreground">demo@esimerkki.fi</p>
                    </div>
                  </div>
                  <Badge>Pääkäyttäjä</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Toinen Käyttäjä</p>
                      <p className="text-sm text-muted-foreground">toinen@esimerkki.fi</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Käyttäjä</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Laskutustiedot</CardTitle>
              <CardDescription>Nykyinen tilaus ja laskutus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Nykyinen tilaus</h3>
                  <Badge className="bg-emerald-500">Aktiivinen</Badge>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pääkäyttäjä</span>
                    <span>79 €/kk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lisäkäyttäjiä (1 kpl)</span>
                    <span>49 €/kk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rakennukset (10 kpl keskikoko)</span>
                    <span>150 €/kk</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Yhteensä</span>
                    <span>278 €/kk</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                Maksutietojen muuttaminen vaatii yhteydenoton asiakaspalveluun
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
