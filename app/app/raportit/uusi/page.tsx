import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReportWizard } from "@/components/reports/report-wizard"

export default async function ReportWizardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <ReportWizard />
}
