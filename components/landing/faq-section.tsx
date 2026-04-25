import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Miten FinnVesta eroaa perinteisista konsulttiraporteista?",
    answer:
      "Perinteiset konsulttiraportit ovat staattisia PDF-dokumentteja, jotka vanhenevat heti. FinnVesta on elavaa kiinteistohallintaa - data paivittyy reaaliajassa, voit kokeilla eri skenaarioita ja seurata kunnon kehitysta ajan yli.",
  },
  {
    question: "Mitä standardeja FinnVesta noudattaa?",
    answer:
      "FinnVesta perustuu RT-kortiston ohjeisiin ja Talo 2000 -nimikkeistöön. Käytämme tuttuja suomalaisia käsitteitä: kuntoluokka, korjausvelka, jälleenhankinta-arvo sekä 17 rakennusosan komponenttiarviointi.",
  },
  {
    question: "Kuinka kauan kayttoonotto kestaa?",
    answer:
      "Tyypillinen kayttoonotto kestaa 8-10 viikkoa. Tama sisaltaa katselmointikaynnit, datan syoton ja kayttajakoulutuksen.",
  },
  {
    question: "Voimmeko tuoda olemassa olevan datan?",
    answer:
      "Kylla, FinnVesta tukee datan tuontia Excel- ja CSV-muodoissa. Autamme mielellaamme datan siirrossa osana kayttoonottoa.",
  },
  {
    question: "Mita katselmointikaynti sisaltaa?",
    answer:
      "Katselmointikaynti sisaltaa ammattimaisen kuntoarvion kaikista 9 rakennusosasta (runko, julkisivu, katto, ikkunat, ovet, valiseinat, LVI, sahko, piha-alueet) seka yksityiskohtaisen raportoinnin.",
  },
]

export function FaqSection() {
  return (
    <section className="border-t border-border/50 bg-card/30 py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">
            Usein kysytyt kysymykset
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={`faq-${i}`}
              value={`faq-${i}`}
              className="rounded-xl border border-border/50 bg-card px-6 data-[state=open]:border-primary/20"
            >
              <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
