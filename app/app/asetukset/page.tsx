import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  User,
  Building2,
  Users,
  CreditCard,
  Bell,
  Shield,
  Mail,
  Phone,
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default async function AsetuksetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch organization data
  let organization: { name: string; id: string } | null = null
  let orgUsers: Array<{ id: string; email: string; role: string }> = []
  let propertyCount = 0

  try {
    const { data: orgUser } = await supabase
      .from('org_users')
      .select('organization_id, role, organizations (name)')
      .eq('user_id', user.id)
      .single()

    if (orgUser?.organization_id) {
      organization = {
        id: orgUser.organization_id,
        name: (orgUser.organizations as any)?.name || 'Organisaatio',
      }

      // Fetch users in organization
      const { data: users } = await supabase
        .from('org_users')
        .select('id, user_id, role')
        .eq('organization_id', orgUser.organization_id)

      if (users) {
        // This is simplified - in production you'd fetch user emails
        orgUsers = users.map(u => ({
          id: u.id,
          email: u.user_id === user.id ? user.email || '' : 'käyttäjä@esimerkki.fi',
          role: u.role || 'user',
        }))
      }

      // Count properties
      const { count } = await supabase
        .from('kiinteistot')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgUser.organization_id)

      propertyCount = count || 0
    }
  } catch (error) {
    console.log("[v0] Error fetching settings data:", error)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Asetukset</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hallitse tiliäsi, organisaatiota ja sovelluksen asetuksia
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

        {/* Profile tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profiilitiedot</CardTitle>
              <CardDescription>Omat tili- ja yhteystietosi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Sähköposti</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input id="email" value={user.email || ''} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Puhelinnumero</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder="+358 40 123 4567" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Etunimi</Label>
                  <Input id="firstName" placeholder="Matti" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sukunimi</Label>
                  <Input id="lastName" placeholder="Meikäläinen" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Tallenna muutokset</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ilmoitukset</CardTitle>
              <CardDescription>Hallitse sähköposti-ilmoituksia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Kuntoarviomuistutukset</p>
                  <p className="text-sm text-muted-foreground">Saat muistutuksen kun kuntoarvio vanhenee</p>
                </div>
                <Button variant="outline" size="sm">Käytössä</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Viikkoraportti</p>
                  <p className="text-sm text-muted-foreground">Viikoittainen yhteenveto portfolion tilasta</p>
                </div>
                <Button variant="outline" size="sm">Pois käytöstä</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organisaation tiedot</CardTitle>
              <CardDescription>Perustiedot organisaatiostasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organisaation nimi</Label>
                  <Input id="orgName" defaultValue={organization?.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgId">Organisaation tunnus</Label>
                  <Input id="orgId" value={organization?.id?.slice(0, 8) || ''} disabled className="bg-muted font-mono" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Tallenna muutokset</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tilastot</CardTitle>
              <CardDescription>Organisaation käyttötilastot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">{propertyCount}</p>
                  <p className="text-sm text-muted-foreground">Kiinteistöjä</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">{orgUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Käyttäjiä</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Kuntoarvioita</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Käyttäjät</CardTitle>
                  <CardDescription>Hallitse organisaation käyttäjiä</CardDescription>
                </div>
                <Button size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Kutsu käyttäjä
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orgUsers.map((orgUser) => (
                  <div key={orgUser.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{orgUser.email}</p>
                        <Badge variant={orgUser.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                          {orgUser.role === 'admin' ? 'Pääkäyttäjä' : 'Käyttäjä'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Muokkaa</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tilaus</CardTitle>
              <CardDescription>Nykyinen tilauksesi ja laskutustiedot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">FinnVesta SaaS</p>
                    <p className="text-sm text-muted-foreground">
                      {orgUsers.length} käyttäjää, {propertyCount} kiinteistöä
                    </p>
                  </div>
                  <Badge>Aktiivinen</Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Käyttäjämaksut</p>
                  <p className="text-xl font-bold mt-1">
                    {79 + (orgUsers.length - 1) * 49} €/kk
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 pääkäyttäjä + {orgUsers.length - 1} lisäkäyttäjää
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Kiinteistömaksut</p>
                  <p className="text-xl font-bold mt-1">
                    ~{propertyCount * 15} €/kk
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {propertyCount} kiinteistöä (arvio)
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="text-sm text-muted-foreground">Yhteensä (arvio)</p>
                  <p className="text-xl font-bold mt-1 text-primary">
                    ~{79 + (orgUsers.length - 1) * 49 + propertyCount * 15} €/kk
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Laskutustiedot</CardTitle>
              <CardDescription>Laskutusosoite ja maksutiedot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billingName">Yrityksen nimi</Label>
                  <Input id="billingName" placeholder="Oy Yritys Ab" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatId">Y-tunnus</Label>
                  <Input id="vatId" placeholder="1234567-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Laskutusosoite</Label>
                <Input id="billingAddress" placeholder="Esimerkkikatu 1, 00100 Helsinki" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Laskutussähköposti</Label>
                <Input id="billingEmail" type="email" placeholder="laskutus@yritys.fi" />
              </div>
              <div className="flex justify-end">
                <Button>Tallenna laskutustiedot</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
