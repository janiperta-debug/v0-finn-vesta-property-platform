import { createClient } from "@/lib/supabase/server"
import { getTranslation } from "@/lib/i18n/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Building2 } from "lucide-react"
import { ReportCenter } from "@/components/reports/report-center"

export default async function RaportitPage() {
  const supabase = await createClient()
  const { t } = await getTranslation()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch property count — reports are generated from portfolio data.
  let propertyCount = 0

  try {
    const { data: orgUsers } = await supabase
      .from('org_users')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)

    const orgUser = orgUsers?.[0]
    if (orgUser?.org_id) {
      const { count } = await supabase
        .from('buildings')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgUser.org_id)

      propertyCount = count || 0
    }
  } catch (error) {
    console.log("[v0] Error fetching property count:", error)
  }

  if (propertyCount === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("reports.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{t("reports.emptyTitle")}</h3>
            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
              {t("reports.emptyDescription")}
            </p>
            <Button asChild>
              <a href="/app/properties/new">
                <Building2 className="mr-2 h-4 w-4" />
                {t("dashboard.addProperty")}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <ReportCenter />
}
