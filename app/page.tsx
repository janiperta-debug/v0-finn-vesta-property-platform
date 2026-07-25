import { redirect } from "next/navigation"

// The marketing landing page now lives at /landing (kept for reference and for
// moving to Janope's site later). The root route sends visitors straight into
// the app; unauthenticated users are redirected to /auth/login by middleware.
export default function Page() {
  redirect("/app")
}
