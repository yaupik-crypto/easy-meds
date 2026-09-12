"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Printer, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEasyMeds } from "@/lib/store"
import { describeSchedule } from "@/lib/schedule"
import { findAllClashes } from "@/lib/interactions"
import { FOOD_RULE_LABELS, KIND_LABELS, RELATION_LABELS, foodRuleHint } from "@/lib/types"
import { Welcome } from "@/components/welcome"
import { SeverityBadge } from "@/components/severity"
import { EASY_MEDS } from "@/lib/config"

/**
 * One page to hand to a doctor or pharmacist: who, what they take, how,
 * why, since when, what they stopped, and the last two weeks of doses.
 */
export default function SummaryPage() {
  const { activePerson, medicationsFor, logsFor } = useEasyMeds()
  if (!activePerson) return <Welcome />

  const meds = medicationsFor(activePerson.id)
  const current = meds.filter((m) => m.status !== "stopped").sort((a, b) => a.name.localeCompare(b.name))
  const past = meds.filter((m) => m.status === "stopped").sort((a, b) => (b.endDate ?? "").localeCompare(a.endDate ?? ""))
  const clashes = findAllClashes(current.filter((m) => m.status === "active"))
  const since = new Date()
  since.setDate(since.getDate() - 14)
  const recent = logsFor(activePerson.id)
    .filter((l) => new Date(l.scheduledAt) >= since)
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
  const medName = (id: string) => meds.find((m) => m.id === id)?.name ?? "Removed item"
  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="space-y-5 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/people" className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <Button size="sm" className="font-bold" onClick={() => window.print()}>
          <Printer /> Print / save PDF
        </Button>
      </div>

      <header>
        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
          <Stethoscope className="size-3.5" /> Medication summary
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{activePerson.name}</h1>
        <p className="text-sm text-muted-foreground">
          {RELATION_LABELS[activePerson.relation]}
          {activePerson.birthYear ? ` · born ${activePerson.birthYear}` : ""} · prepared {today}
        </p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="font-bold text-muted-foreground">Allergies</dt>
          <dd>{activePerson.allergies || "None recorded"}</dd>
          <dt className="font-bold text-muted-foreground">Conditions</dt>
          <dd>{activePerson.conditions || "None recorded"}</dd>
          {activePerson.notes && (
            <>
              <dt className="font-bold text-muted-foreground">Notes</dt>
              <dd>{activePerson.notes}</dd>
            </>
          )}
        </dl>
      </header>

      <Section title={`Currently taking (${current.length})`}>
        {current.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-1.5 pr-2 font-bold">Product</th>
                <th className="py-1.5 pr-2 font-bold">Dose & timing</th>
                <th className="py-1.5 font-bold">For / from</th>
              </tr>
            </thead>
            <tbody>
              {current.map((m) => {
                const hint = foodRuleHint(m.foodRule, m.foodGapMinutes)
                return (
                  <tr key={m.id} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-2">
                      <p className="font-bold">{m.name}{m.status === "paused" ? " (paused)" : ""}</p>
                      <p className="text-xs text-muted-foreground">{KIND_LABELS[m.kind]}{m.strength ? ` · ${m.strength}` : ""}</p>
                      {m.ingredients.length > 0 && <p className="text-xs text-muted-foreground">{m.ingredients.join(", ")}</p>}
                    </td>
                    <td className="py-2 pr-2">
                      <p>{m.dose || "—"}</p>
                      <p className="text-xs text-muted-foreground">{describeSchedule(m.schedule)}</p>
                      {m.foodRule !== "any" && <p className="text-xs text-muted-foreground">{hint || FOOD_RULE_LABELS[m.foodRule]}</p>}
                      {m.instructions && <p className="text-xs text-muted-foreground">{m.instructions}</p>}
                    </td>
                    <td className="py-2">
                      <p>{m.reason || "—"}</p>
                      <p className="text-xs text-muted-foreground">{m.prescriber ? `${m.prescriber} · ` : ""}since {m.startDate}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Section>

      {clashes.length > 0 && (
        <Section title={`Possible interactions flagged by Easy Meds (${clashes.length})`}>
          <ul className="space-y-2 text-sm">
            {clashes.map((c, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2">
                <SeverityBadge severity={c.severity} />
                <span className="font-bold">{c.candidate.name} + {c.other.name}:</span>
                <span className="text-muted-foreground">{c.summary}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {past.length > 0 && (
        <Section title={`Stopped (${past.length})`}>
          <ul className="space-y-1 text-sm">
            {past.map((m) => (
              <li key={m.id}>
                <span className="font-bold">{m.name}</span>
                <span className="text-muted-foreground">
                  {m.strength ? ` ${m.strength}` : ""} · {m.startDate} → {m.endDate ?? "?"}
                  {m.reason ? ` · ${m.reason}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Last 14 days">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No doses logged in the last two weeks.</p>
        ) : (
          <ul className="columns-1 text-sm sm:columns-2">
            {recent.map((l) => (
              <li key={l.id} className="break-inside-avoid">
                <span className="text-muted-foreground">
                  {new Date(l.scheduledAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                </span>{" "}
                {medName(l.medicationId)}
                {l.status === "skipped" && <span className="text-[var(--em-caution)]"> · skipped</span>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Recorded by the person or their carer in {EASY_MEDS.name}. {EASY_MEDS.disclaimer}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-xs print:break-inside-avoid print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <h2 className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}
