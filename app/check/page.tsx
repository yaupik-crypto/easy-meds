"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Plus, Search, ShieldCheck, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEasyMeds } from "@/lib/store"
import { parseIngredientsText } from "@/lib/ingredient-parse"
import type { IngredientAmount } from "@/lib/types"
import { findAllClashes } from "@/lib/interactions"
import { ClashResults, useClashReport } from "@/components/clash-check"
import { SeverityBadge, severityStyle } from "@/components/severity"
import { Welcome } from "@/components/welcome"
import { TourSlot } from "@/components/tour"
import { EASY_MEDS } from "@/lib/config"

export default function CheckPage() {
  return (
    <React.Suspense fallback={null}>
      <CheckPageInner />
    </React.Suspense>
  )
}

function CheckPageInner() {
  const params = useSearchParams()
  const { activePerson, medicationsFor, logsFor } = useEasyMeds()
  const [name, setName] = React.useState("")
  const [ingredientsText, setIngredientsText] = React.useState("")
  const [submitted, setSubmitted] = React.useState<{ name: string; ingredients: IngredientAmount[] } | null>(null)
  const [showAll, setShowAll] = React.useState(params.get("all") === "1")

  const existing = React.useMemo(
    () => (activePerson ? medicationsFor(activePerson.id).filter((m) => m.status !== "stopped") : []),
    [activePerson, medicationsFor],
  )
  const candidate = React.useMemo(
    () => (submitted ? { id: "__check__", ...submitted } : null),
    [submitted],
  )
  const logs = React.useMemo(() => (activePerson ? logsFor(activePerson.id) : []), [activePerson, logsFor])
  const report = useClashReport(candidate, existing, activePerson?.allergies, logs)
  const allClashes = React.useMemo(() => findAllClashes(existing), [existing])

  if (!activePerson) return <Welcome />

  return (
    <div className="space-y-5">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
          <ShieldCheck className="size-3.5" /> Clash check
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Thinking of taking something?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Type it in and Easy Meds compares it with {activePerson.name}’s {existing.length} current item{existing.length === 1 ? "" : "s"} before it goes anywhere near the list.
        </p>
      </div>

      <form
        data-tour="check-form"
        className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs"
        onSubmit={(e) => {
          e.preventDefault()
          const n = name.trim()
          if (!n) return
          setSubmitted({
            name: n,
            ingredients: parseIngredientsText(ingredientsText),
          })
          setShowAll(false)
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name of the medication or supplement"
            className="pl-9"
            autoComplete="off"
          />
        </div>
        <Input
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          placeholder="Ingredients with amount if you know it (e.g. vitamin C 500mg, zinc 10mg, jujube)"
        />
        <Button type="submit" className="w-full font-bold" disabled={!name.trim()}>Check</Button>
      </form>
      <TourSlot id="check-form" />

      {submitted && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">{submitted.name}</h2>
            <button type="button" onClick={() => setSubmitted(null)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="Clear">
              <X className="size-4" />
            </button>
          </div>
          {existing.length === 0 ? (
            <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              {activePerson.name} has nothing on the list yet, so there is nothing to clash with.
            </p>
          ) : (
            <ClashResults report={report} candidateName={submitted.name} />
          )}
          <Button asChild variant="outline" className="w-full font-bold">
            <Link href={`/medications/new?name=${encodeURIComponent(submitted.name)}`}><Plus /> Add {submitted.name} to the list</Link>
          </Button>
        </section>
      )}

      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-xs"
        >
          <div>
            <p className="font-bold">Everything already on the list</p>
            <p className="text-sm text-muted-foreground">
              {allClashes.length === 0
                ? `No known clashes among ${existing.length} item${existing.length === 1 ? "" : "s"}.`
                : `${allClashes.length} possible clash${allClashes.length === 1 ? "" : "es"} among ${existing.length} items.`}
            </p>
          </div>
          {allClashes.length > 0 && <SeverityBadge severity={allClashes[0].severity} />}
        </button>
        {showAll && allClashes.length > 0 && (
          <div className="space-y-3">
            {allClashes.map((f, i) => {
              const s = severityStyle(f.severity)
              return (
                <div key={i} className="em-pop rounded-xl border p-4" style={{ borderColor: s.color, background: s.bg }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={f.severity} />
                    <span className="text-sm font-bold">{f.candidate.name} <span className="text-muted-foreground">+</span> {f.other.name}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{f.summary}</p>
                  <p className="mt-1.5 text-sm font-semibold" style={{ color: s.color }}>{f.advice}</p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">{EASY_MEDS.disclaimer}</p>
    </div>
  )
}
