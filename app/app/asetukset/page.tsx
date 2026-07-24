import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslation } from "@/lib/i18n/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Building2,
  Users,
  Mail,
  Phone,
  Crown,
  Shield,
  UserPlus,
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default async function AsetuksetPage() {
  const supabase = await createClient()
  const { t } = await getTranslation()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch organization data
  let organization: { name: string; id: string } | null = null
  let orgUsers: Array<{ id: string; email: string; role: string }> = []
  let isPaakayttaja = false
  let buildingStats = { small: 0, medium: 0, large: 0 }
  let userStats = { paakayttajat: 0, kayttajat: 0 }

  try {
    const { data: orgUserRows } = await supabase
      .from('org_users')
      .select('org_id, org_role, user_email, organizations (name)')
      .eq('user_id', user.id)
      .limit(1)

    const orgUser = orgUserRows?.[0]
    if (orgUser?.org_id) {
      organization = {
        id: String(orgUser.org_id),
        name: (orgUser.organizations as any)?.name || t("settings.orgDefaultName"),
      }
      isPaakayttaja = orgUser.org_role === 'paakayttaja'

      // Fetch users in organization
      const { data: users } = await supabase
        .from('org_users')
        .select('id, user_id, org_role, user_email, user_name')
        .eq('org_id', orgUser.org_id)

      if (users) {
        orgUsers = users.map(u => ({
          id: String(u.id),
          email: u.user_email || (u.user_id === user.id ? user.email || '' : t("settings.userManagementUnknownUser")),
          role: u.org_role || 'kayttaja',
        }))
        userStats.paakayttajat = users.filter(u => u.org_role === 'paakayttaja').length
        userStats.kayttajat = users.filter(u => u.org_role !== 'paakayttaja').length
      }

      // Count buildings by size for billing stats
      const { data: buildings } = await supabase
        .from('buildings')
        .select('area_m2')
        .eq('org_id', orgUser.org_id)

      if (buildings) {
        buildingStats.small = buildings.filter(b => (b.area_m2 || 0) < 1000).length
        buildingStats.medium = buildings.filter(b => (b.area_m2 || 0) >= 1000 && (b.area_m2 || 0) < 5000).length
        buildingStats.large = buildings.filter(b => (b.area_m2 || 0) >= 5000).length
      }
    }
  } catch (error) {
    console.log("[v0] Error fetching settings data:", error)
  }

  // Calculate monthly cost estimate
  const monthlyCost =
    userStats.paakayttajat * 79 +
    userStats.kayttajat * 49 +
    buildingStats.small * 9 +
    buildingStats.medium * 15 +
    buildingStats.large * 25

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full overflow-x-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            {t("settings.tabProfile")}
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t("settings.tabOrganization")}
          </TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profileTitle")}</CardTitle>
              <CardDescription>{t("settings.profileDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.emailLabel")}</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input id="email" value={user.email || ''} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("settings.phoneLabel")}</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder={t("settings.phonePlaceholder")} />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("settings.firstNameLabel")}</Label>
                  <Input id="firstName" placeholder={t("settings.firstNamePlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("settings.lastNameLabel")}</Label>
                  <Input id="lastName" placeholder={t("settings.lastNamePlaceholder")} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>{t("settings.saveButton")}</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notificationsTitle")}</CardTitle>
              <CardDescription>{t("settings.notificationsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("settings.inspectionRemindersTitle")}</p>
                  <p className="text-sm text-muted-foreground">{t("settings.inspectionRemindersDescription")}</p>
                </div>
                <Button variant="outline" size="sm">{t("settings.notificationsEnabled")}</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("settings.weeklyReportTitle")}</p>
                  <p className="text-sm text-muted-foreground">{t("settings.weeklyReportDescription")}</p>
                </div>
                <Button variant="outline" size="sm">{t("settings.notificationsDisabled")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization tab */}
        <TabsContent value="organization" className="space-y-6">
          {/* Billing Stats - Informative only */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.orgStatsTitle")}</CardTitle>
              <CardDescription>{t("settings.orgStatsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("settings.orgUsersLabel")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{userStats.paakayttajat}</span>
                    <span className="text-sm text-muted-foreground">{t("settings.orgAdmins")}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold">{userStats.kayttajat}</span>
                    <span className="text-sm text-muted-foreground">{t("settings.orgUsers")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("settings.orgUserPricingLine")}
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("settings.orgBuildingsBySizeLabel")}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t("settings.orgSmall")}</span>
                      <span className="font-medium">{buildingStats.small} × 9 €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("settings.orgMedium")}</span>
                      <span className="font-medium">{buildingStats.medium} × 15 €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("settings.orgLarge")}</span>
                      <span className="font-medium">{buildingStats.large} × 25 €</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("settings.orgEstimatedMonthlyLabel")}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{monthlyCost}</span>
                    <span className="text-sm text-muted-foreground">€/kk</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("settings.orgBillingNote")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management - Only for pääkäyttäjä */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t("settings.userManagementTitle")}
                  </CardTitle>
                  <CardDescription>
                    {isPaakayttaja
                      ? t("settings.userManagementDescriptionAdmin")
                      : t("settings.userManagementDescriptionNonAdmin")}
                  </CardDescription>
                </div>
                {isPaakayttaja && (
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("settings.userManagementInviteButton")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {orgUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("settings.userManagementEmptyTitle")}</p>
                  {isPaakayttaja && (
                    <p className="text-sm">{t("settings.userManagementEmptyDescription")}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {orgUsers.map((orgUser) => (
                    <div key={orgUser.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{orgUser.email}</p>
                          <Badge
                            variant={orgUser.role === 'paakayttaja' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {orgUser.role === 'paakayttaja' ? (
                              <><Crown className="mr-1 h-3 w-3" /> {t("settings.userManagementRoleAdmin")}</>
                            ) : (
                              <><Shield className="mr-1 h-3 w-3" /> {t("settings.userManagementRoleUser")}</>
                            )}
                          </Badge>
                        </div>
                      </div>
                      {isPaakayttaja && orgUser.email !== user.email && (
                        <div className="flex items-center gap-2">
                          {orgUser.role === 'kayttaja' ? (
                            <Button variant="outline" size="sm">
                              <Crown className="mr-1 h-4 w-4" />
                              {t("settings.userManagementPromoteButton")}
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              {t("settings.userManagementDemoteButton")}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            {t("settings.userManagementRemoveButton")}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isPaakayttaja && orgUsers.length > 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  {t("settings.userManagementContactAdminNote")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
