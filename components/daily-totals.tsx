"use client"

import { AlertTriangle, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import { computeTodaysTotals } from "@/lib/cumulative"
import type { DoseLog, Medication } from "@/lib/types"
import { severityStyle } from "./severity"

/**
 * "How much of everything today" — sums per-ingredient amounts across all
 * of a person's active medications for the given day and flags anything
 * near or over the daily guideline from lib/nutrient-limits.ts.
 */
export function DailyTotals({
  meds,
  logs,
  dateKey,
}: {
  meds: Medication[]
  logs: DoseLog[]
  dateKey: string
}) {
  const totals = computeTodaysTotals(meds, logs, dateKey)
  if (totals.length === 0) return null

  return (
    <section className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-xs">
      <h2 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
        <Gauge className="size-3.5" /> Today’s totals
      </h2>
      <ul className="space-y-2.5">
        {totals.map((f) => {
          const s = severityStyle(f.severity)
          const pct = Math.min(100, Math.round((f.total / f.ul) * 100))
          return (
            <li key={f.agentId}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="flex items-center gap-1 font-bold">
                  {f.severity !== "info" && <AlertTriangle className="size-3.5" style={{ color: s.color }} />}
                  {f.label}
                </span>
                <span className={cn("font-semibold", f.severity !== "info" && "font-bold")} style={{ color: f.severity !== "info" ? s.color : undefined }}>
                  {Math.round(f.total)} / {f.ul} {f.unit}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Based on doses scheduled today across the active list, added up per ingredient. General adult guidance, not a prescription.
      </p>
    </section>
  )
}
