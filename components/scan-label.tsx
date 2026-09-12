"use client"

import * as React from "react"
import { Camera, Check, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { LabelRead } from "@/lib/label-schema"
import { FOOD_RULE_LABELS, KIND_LABELS } from "@/lib/types"
import type { MedFormValue } from "./med-form"
import { cn } from "@/lib/utils"

const TIMES_BY_COUNT: Record<number, string[]> = {
  1: ["08:00"],
  2: ["08:00", "20:00"],
  3: ["08:00", "14:00", "20:00"],
  4: ["08:00", "12:00", "16:00", "20:00"],
  5: ["07:00", "11:00", "15:00", "19:00", "23:00"],
  6: ["06:00", "10:00", "14:00", "18:00", "22:00", "02:00"],
}

/** Turn what the reader saw into form values, keeping anything the person already typed. */
export function applyLabelRead(current: MedFormValue, r: LabelRead): MedFormValue {
  const next: MedFormValue = { ...current }
  if (r.name) next.name = r.name
  if (r.strength) next.strength = r.strength
  if (r.dose) next.dose = r.dose
  if (r.kind !== "unknown") next.kind = r.kind
  if (r.ingredients.length) next.ingredients = Array.from(new Set([...current.ingredients, ...r.ingredients]))
  if (r.asNeeded) next.schedule = { type: "as_needed" }
  else if (r.everyNDays >= 2) next.schedule = { type: "every_n_days", every: r.everyNDays, anchor: current.startDate, times: TIMES_BY_COUNT[1] }
  else if (r.daysOfWeek.length) next.schedule = { type: "weekly", days: r.daysOfWeek, times: TIMES_BY_COUNT[Math.max(1, r.timesPerDay)] ?? TIMES_BY_COUNT[1] }
  else if (r.timesPerDay > 0) next.schedule = { type: "daily", times: TIMES_BY_COUNT[Math.min(6, r.timesPerDay)] }
  if (r.foodRule !== "unknown") next.foodRule = r.foodRule
  if (r.foodGapMinutes > 0) next.foodGapMinutes = r.foodGapMinutes
  if (r.instructions) next.instructions = [current.instructions, r.instructions].filter(Boolean).join(" ")
  if (r.reason) next.reason = r.reason
  if (r.prescriber) next.prescriber = r.prescriber
  if (r.courseDays > 0) {
    const d = new Date(current.startDate)
    d.setDate(d.getDate() + r.courseDays - 1)
    next.endDate = d.toISOString().slice(0, 10)
  }
  return next
}

async function fileToJpegBase64(file: File, maxSide = 1600): Promise<{ data: string; mediaType: "image/jpeg" }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas")
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const url = canvas.toDataURL("image/jpeg", 0.85)
  return { data: url.split(",")[1], mediaType: "image/jpeg" }
}

const ERROR_TEXT: Record<string, string> = {
  not_configured: "Photo reading isn’t switched on for this server yet. You can still type the details below.",
  refused: "The reader couldn’t work with that photo. Try a clearer shot of just the label.",
  unreadable: "Couldn’t make out a label in that photo. Try again closer, with good light.",
  busy: "The reader is busy right now. Try again in a moment.",
  network: "No connection. Check your signal and try again.",
  upstream: "The reader hit a problem. Try again in a moment.",
  failed: "Something went wrong reading the photo.",
}

export function ScanLabel({
  value,
  onApply,
  className,
}: {
  value: MedFormValue
  onApply: (next: MedFormValue) => void
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [status, setStatus] = React.useState<"idle" | "reading" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [read, setRead] = React.useState<LabelRead | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setStatus("reading")
    setError(null)
    try {
      const { data, mediaType } = await fileToJpegBase64(file)
      setPreview(`data:${mediaType};base64,${data}`)
      const res = await fetch("/api/read-label", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: data, mediaType }),
      })
      const json = (await res.json().catch(() => ({}))) as { fields?: LabelRead; error?: string }
      if (!res.ok || !json.fields) {
        setError(ERROR_TEXT[json.error ?? "failed"] ?? ERROR_TEXT.failed)
        setStatus("error")
        return
      }
      setRead(json.fields)
      setStatus("idle")
    } catch {
      setError(ERROR_TEXT.network)
      setStatus("error")
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const rows: [string, string][] = read
    ? ([
        ["Name", read.name],
        ["Strength", read.strength],
        ["Each dose", read.dose],
        ["Type", read.kind !== "unknown" ? KIND_LABELS[read.kind] : ""],
        ["Ingredients", read.ingredients.join(", ")],
        [
          "How often",
          read.asNeeded
            ? "As needed"
            : read.everyNDays >= 2
              ? `Every ${read.everyNDays} days`
              : read.timesPerDay
                ? `${read.timesPerDay}× a day`
                : "",
        ],
        ["Food", read.foodRule !== "unknown" ? FOOD_RULE_LABELS[read.foodRule] + (read.foodGapMinutes ? ` (${read.foodGapMinutes} min)` : "") : ""],
        ["Instructions", read.instructions],
        ["For", read.reason],
        ["From", read.prescriber],
        ["Course", read.courseDays ? `${read.courseDays} days` : ""],
      ] as [string, string][]).filter(([, v]) => v)
    : []

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
        aria-label="Take a photo of the label"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "reading"}
        data-tour="scan"
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-accent/50 p-4 text-left transition-colors hover:bg-accent disabled:opacity-70"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          {status === "reading" ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold">{status === "reading" ? "Reading the label…" : "Scan the label"}</span>
          <span className="block text-sm text-muted-foreground">
            {status === "reading" ? "Usually takes a few seconds." : "Take a photo — name, strength, dose and instructions fill in for you to confirm."}
          </span>
        </span>
        {status !== "reading" && <Sparkles className="size-4 shrink-0 text-primary" />}
      </button>
      {status === "error" && error && (
        <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground" role="alert">{error}</p>
      )}

      <Dialog open={!!read} onOpenChange={(o) => !o && setRead(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Here’s what the label says</DialogTitle>
            <DialogDescription>
              {read?.confidence === "low"
                ? "The photo was hard to read — check every line carefully."
                : read?.confidence === "medium"
                  ? "Mostly clear. Check the strength and how often before you confirm."
                  : "Check it matches the label, then use it."}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Your photo of the label" className="max-h-40 w-full rounded-xl object-cover" />
          )}
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing usable was read from this photo.</p>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {rows.map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="font-bold text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 break-words font-semibold">{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}
          {read?.notes && <p className="rounded-xl bg-[var(--em-caution-bg)] px-3 py-2 text-sm text-[var(--em-caution)]">{read.notes}</p>}
          {read?.patientName && (
            <p className="text-xs text-muted-foreground">Label is addressed to <strong>{read.patientName}</strong>. Make sure you’re adding it to the right person.</p>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="font-bold" onClick={() => { setRead(null); inputRef.current?.click() }}>
              <RefreshCw /> Retake
            </Button>
            <Button
              type="button"
              className="font-bold"
              disabled={rows.length === 0}
              onClick={() => {
                if (read) onApply(applyLabelRead(value, read))
                setRead(null)
              }}
            >
              <Check /> Use these details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
