import Link from "next/link"
import { properties, formatEur, getKlaBgColor } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

export function PropertyTable() {
  return (
    <div className="rounded-xl border border-border/50 bg-card">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div>
          <h3 className="font-heading text-base font-semibold text-foreground">Kiinteistot</h3>
          <p className="text-xs text-muted-foreground">
            Nakyvilla 10 / 156 kiinteistoa (demo)
          </p>
        </div>
        <Link
          href="/demo/property/1"
          className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
        >
          Nae kaikki <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 text-left font-medium">Nimi</th>
              <th className="px-5 py-3 text-left font-medium">Tyyppi</th>
              <th className="px-5 py-3 text-right font-medium">Rak. vuosi</th>
              <th className="px-5 py-3 text-right font-medium">m&sup2;</th>
              <th className="px-5 py-3 text-right font-medium">Kla</th>
              <th className="hidden px-5 py-3 text-right font-medium md:table-cell">Jall.hank.arvo</th>
              <th className="hidden px-5 py-3 text-right font-medium lg:table-cell">&euro;/m&sup2;</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop) => (
              <tr
                key={prop.id}
                className="border-b border-border/30 transition-colors last:border-0 hover:bg-accent/50"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/demo/property/${prop.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {prop.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{prop.tunnus}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{prop.type}</td>
                <td className="px-5 py-3 text-right text-muted-foreground">{prop.buildYear}</td>
                <td className="px-5 py-3 text-right text-muted-foreground">
                  {prop.squareMeters.toLocaleString("fi-FI")}
                </td>
                <td className="px-5 py-3 text-right">
                  <Badge variant="secondary" className={`${getKlaBgColor(prop.kuntoluokka)} border-0 font-mono`}>
                    {prop.kuntoluokka}%
                  </Badge>
                </td>
                <td className="hidden px-5 py-3 text-right text-muted-foreground md:table-cell">
                  {formatEur(prop.jalleenhankintaArvo)}
                </td>
                <td className="hidden px-5 py-3 text-right font-mono text-xs text-muted-foreground lg:table-cell">
                  {prop.eurPerM2} &euro;/m&sup2;
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
