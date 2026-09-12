"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Plus, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEasyMeds } from "@/lib/store"
import { describeSchedule } from "@/lib/schedule"
import { KIND_LABELS, foodRuleHint, type Medication } from "@/lib/types"
import { Welcome } from "@/components/welcome"
import { cn } from "@/lib/utils"

export default function MedicationsPage() {
  const { activePerson, medicationsFor } = useEasyMeds()
  const [tab, setTab] = React.useState<"current" | "past">("current")
  if (!activePerson) return <Welcome />

  const meds = medicationsFor(activePerson.id)
  const current = meds.filter((m) => m.status !== "stopped")
  const past = meds.filter((m) => m.status === "stopped")
  const list = (tab === "current" ? current : past).slice().sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">{activePerson.name}’s list</h1>
        <Button asChild size="sm" className="font-bold">
          <Link href="/medications/new"><Plus /> Add</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-bold">
        {(["current", "past"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full py-1.5 transition-colors",
              tab === t ? "bg-card shadow-xs" : "text-muted-foreground",
            )}
          >
            {t === "current" ? `Current (${current.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {tab === "current" ? "Nothing here yet. Add the first medication or supplement." : "Stopped items will show up here, so there is always a record of what was taken before."}
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((m) => <MedRow key={m.id} med={m} />)}
        </ul>
      )}
    </div>
  )
}

function MedRow({ med }: { med: Medication }) {
  const hint = foodRuleHint(med.foodRule, med.foodGapMinutes)
  return (
    <li>
      <Link
        href={`/medications/${med.id}`}
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs transition-colors hover:bg-muted/40"
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl text-[10px] font-extrabold uppercase",
            med.kind === "supplement" ? "bg-[#fdf1e2] text-[var(--em-caution)]" : med.kind === "otc" ? "bg-[#e9f1f9] text-[var(--em-info)]" : "bg-accent text-accent-foreground",
          )}
        >
          {med.kind === "prescription" ? "Rx" : med.kind === "otc" ? "OTC" : "Sup"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold">{med.name}</p>
            {med.status === "paused" && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Paused</span>}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {[med.dose, med.strength].filter(Boolean).join(" · ") || KIND_LABELS[med.kind]} · {describeSchedule(med.schedule)}
          </p>
          {hint && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-[var(--em-caution)]">
              <Utensils className="size-3" /> {hint}
            </p>
          )}
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  )
}
