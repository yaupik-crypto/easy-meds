"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Clock, Download, Stethoscope, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEasyMeds } from "@/lib/store"
import { Welcome } from "@/components/welcome"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const { activePerson, medicationsFor, logsFor } = useEasyMeds()
  if (!activePerson) return <Welcome />

  const meds = medicationsFor(activePerson.id)
  const medName = (id: string) => meds.find((m) => m.id === id)?.name ?? "Removed item"
  const logs = logsFor(activePerson.id).slice().sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))

  const byDay = new Map<string, typeof logs>()
  for (const l of logs) {
    const d = new Date(l.scheduledAt)
    const key = d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    byDay.set(key, [...(byDay.get(key) ?? []), l])
  }

  const exportCsv = () => {
    const rows = [["Date", "Time", "Medication", "Status", "Note"]]
    for (const l of logs) {
      const d = new Date(l.scheduledAt)
      rows.push([
        d.toLocaleDateString("en-CA"),
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
        medName(l.medicationId),
        l.status,
        l.note ?? "",
      ])
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `easy-meds-${activePerson.name.replace(/\s+/g, "-").toLowerCase()}-history.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            <Clock className="size-3.5" /> History
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{activePerson.name}’s doses</h1>
        </div>
        {logs.length > 0 && (
          <Button variant="outline" size="sm" className="font-bold" onClick={exportCsv}>
            <Download /> CSV
          </Button>
        )}
      </div>

      <Link href="/summary" className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-accent/60 p-4 text-sm">
        <Stethoscope className="size-5 shrink-0 text-primary" />
        <span>
          <span className="block font-bold">Summary for a doctor</span>
          <span className="text-muted-foreground">Current list, allergies, stopped items and the last two weeks on one printable page.</span>
        </span>
      </Link>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No doses logged yet. Tick them off on Today and they will appear here.
        </div>
      ) : (
        Array.from(byDay.entries()).map(([day, list]) => (
          <section key={day} className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{day}</h2>
            <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              {list.map((l) => (
                <li key={l.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full",
                      l.status === "taken" ? "bg-accent text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {l.status === "taken" ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{medName(l.medicationId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(l.scheduledAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      {l.status === "skipped" ? " · skipped" : ""}
                      {l.note ? ` · ${l.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
