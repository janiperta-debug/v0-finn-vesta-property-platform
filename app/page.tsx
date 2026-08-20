import { redirect } from "next/navigation"

// The root route sends visitors straight into the app; unauthenticated users
// are redirected to /auth/login by middleware.
export default function Page() {
  redirect("/app")
}
