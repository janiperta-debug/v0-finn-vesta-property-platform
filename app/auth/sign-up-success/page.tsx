import { getTranslation } from '@/lib/i18n/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function Page() {
  const { t } = await getTranslation()
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {t("auth.signUpSuccessTitle")}
              </CardTitle>
              <CardDescription>{t("auth.signUpSuccessDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("auth.signUpSuccessBody")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
