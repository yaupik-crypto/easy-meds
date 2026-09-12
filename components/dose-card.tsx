"use client"

import Link from "next/link"
import { Check, RotateCcw, Utensils, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DoseSlot } from "@/lib/schedule"
import { formatTime } from "@/lib/schedule"
import { foodRuleHint } from "@/lib/types"

export function DoseCard({
  slot,
  onTaken,
  onSkipped,
  onUndo,
}: {
  slot: DoseSlot
  onTaken: () => void
  onSkipped: () => void
  onUndo: () => void
}) {
  const med = slot.medication
  const done = slot.log?.status === "taken"
  const skipped = slot.log?.status === "skipped"
  const overdue = !slot.log && new Date(slot.scheduledAt).getTime() < Date.now() - 60 * 60 * 1000
  const hint = foodRuleHint(med.foodRule, med.foodGapMinutes)

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs transition-opacity",
        (done || skipped) && "opacity-60",
      )}
    >
      <button
        type="button"
        aria-label={done ? `Undo ${med.name}` : `Mark ${med.name} as taken`}
        onClick={done || skipped ? onUndo : onTaken}
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full border-2 transition-all",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : skipped
              ? "border-border bg-muted text-muted-foreground"
              : "border-primary/40 bg-background text-transparent hover:border-primary hover:text-primary/40",
        )}
      >
        {skipped ? <X className="size-5" /> : <Check className="size-5" strokeWidth={3} />}
      </button>

      <Link href={`/medications/${med.id}`} className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className={cn("truncate font-bold", done && "line-through decoration-2")}>{med.name}</p>
          <span className={cn("shrink-0 text-xs font-semibold", overdue ? "text-[var(--em-avoid)]" : "text-muted-foreground")}>
            {formatTime(slot.time)}
            {overdue && " · overdue"}
          </span>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {[med.dose, med.strength].filter(Boolean).join(" · ")}
        </p>
        {hint && (
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[var(--em-caution)]">
            <Utensils className="size-3" /> {hint}
          </p>
        )}
        {med.instructions && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{med.instructions}</p>
        )}
      </Link>

      {!slot.log ? (
        <button
          type="button"
          onClick={onSkipped}
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted"
        >
          Skip
        </button>
      ) : (
        <button
          type="button"
          onClick={onUndo}
          aria-label="Undo"
          className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <RotateCcw className="size-4" />
        </button>
      )}
    </div>
  )
}
