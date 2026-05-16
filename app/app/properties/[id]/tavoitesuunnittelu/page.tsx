import { ArrowLeft, Target } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function TavoitesuunnitteluPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/app/properties/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Tavoitesuunnittelu</h1>
          <p className="text-sm text-muted-foreground">Rakennuksen tavoitetason maarittely ja seuranta</p>
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Tavoitesuunnittelu</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Maarittele rakennuksen tavoitetasot eri komponenteille ja seuraa etenemista tavoitteisiin nahden. Luo investointisuunnitelmia tavoitteiden saavuttamiseksi.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
