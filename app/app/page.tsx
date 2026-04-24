import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Portfolio-kojelauta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tervetuloa, {user.email}
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Sovellus yhdistetään tietokantaan. Kiinteistötiedot ladataan pian.
        </p>
      </div>
    </div>
  )
}
