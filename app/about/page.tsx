import Link from "next/link"
import { ArrowLeft, Heart } from "lucide-react"
import { EASY_MEDS } from "@/lib/config"
import { AGENTS, RULES } from "@/lib/interactions"

export const metadata = { title: "About" }

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <Link href="/people" className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{EASY_MEDS.name}</h1>
        <p className="mt-1 text-muted-foreground">{EASY_MEDS.tagline}</p>
      </div>

      <section className="rounded-2xl border border-primary/30 bg-card p-5 shadow-xs">
        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
          <Heart className="size-3.5 fill-current" /> Why this exists
        </p>
        <p className="mt-2 leading-relaxed">{EASY_MEDS.dedication}</p>
      </section>

      <section className="space-y-2 text-sm leading-relaxed">
        <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">How the clash check works</h2>
        <p>
          Every new item is compared with the person’s current list in three ways:
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            <strong>Curated rules</strong> — {RULES.length} well-documented interactions across {AGENTS.length} drug and supplement groups (blood thinners, antidepressants, thyroid medication, minerals, St John’s Wort, grapefruit and more).
          </li>
          <li>
            <strong>Double-ups</strong> — the same ingredient appearing in two products, which is how accidental overdoses happen.
          </li>
          <li>
            <strong>FDA label text</strong> — the “drug interactions” and “warnings” sections of the official US label are fetched from openFDA and searched for the other items on the list.
          </li>
        </ol>
        <p>
          Entering the <strong>active ingredients</strong> from the label makes all three far more accurate, especially for supplements and herbal blends.
        </p>
      </section>

      <section className="space-y-2 text-sm leading-relaxed">
        <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Privacy</h2>
        <p>
          Everything lives in this browser on this device. Nothing is sent to a server, except the name of a product when the FDA label is looked up. Use “Back up” on the People page to keep a copy.
        </p>
      </section>

      <section className="rounded-2xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
        {EASY_MEDS.disclaimer}
      </section>
    </div>
  )
}
