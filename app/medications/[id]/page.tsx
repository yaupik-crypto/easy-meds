"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, PauseCircle, PlayCircle, StopCircle, Trash2, ShieldCheck, Utensils } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useEasyMeds, todayKey } from "@/lib/store"
import { describeSchedule } from "@/lib/schedule"
import { FOOD_RULE_LABELS, KIND_LABELS, foodRuleHint } from "@/lib/types"
import { MedForm, type MedFormValue } from "@/components/med-form"
import { ClashResults, useClashReport } from "@/components/clash-check"

export default function MedicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, people, updateMedication, removeMedication, logsFor } = useEasyMeds()
  const med = data.medications.find((m) => m.id === id)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState<MedFormValue | null>(null)

  const owner = people.find((p) => p.id === med?.personId)
  const others = React.useMemo(
    () => (med ? data.medications.filter((m) => m.personId === med.personId && m.id !== med.id && m.status !== "stopped") : []),
    [data.medications, med],
  )
  const report = useClashReport(med && !editing ? med : null, others, owner?.allergies)

  if (!med) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="font-bold">That item no longer exists.</p>
        <Button asChild variant="outline"><Link href="/medications">Back to list</Link></Button>
      </div>
    )
  }

  const logs = logsFor(med.personId).filter((l) => l.medicationId === med.id)
  const takenCount = logs.filter((l) => l.status === "taken").length
  const lastTaken = logs.filter((l) => l.status === "taken").sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0]

  const startEdit = () => {
    const { id: _id, personId: _p, createdAt: _c, updatedAt: _u, ...rest } = med
    setDraft(rest)
    setEditing(true)
  }
  const saveEdit = () => {
    if (!draft || !draft.name.trim()) return
    updateMedication(med.id, { ...draft, name: draft.name.trim() })
    setEditing(false)
    toast("Saved")
  }

  if (editing && draft) {
    return (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          saveEdit()
        }}
      >
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Cancel" onClick={() => setEditing(false)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-extrabold tracking-tight">Edit {med.name}</h1>
        </div>
        <MedForm value={draft} onChange={setDraft} />
        <div className="em-sticky-action flex gap-2">
          <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setEditing(false)}>Cancel</Button>
          <Button type="submit" className="flex-1 font-bold">Save changes</Button>
        </div>
      </form>
    )
  }

  const hint = foodRuleHint(med.foodRule, med.foodGapMinutes)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back">
          <Link href="/medications"><ArrowLeft /></Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            {KIND_LABELS[med.kind]} · {owner?.name}
          </p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{med.name}</h1>
        </div>
        <Button variant="outline" size="sm" className="font-bold" onClick={startEdit}>
          <Pencil /> Edit
        </Button>
      </div>

      {med.status !== "active" && (
        <div className="rounded-xl bg-muted p-3 text-sm font-semibold text-muted-foreground">
          This item is {med.status}. It will not appear on Today.
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <Row k="Dose" v={[med.dose, med.strength].filter(Boolean).join(" · ") || "—"} />
          <Row k="Schedule" v={describeSchedule(med.schedule)} />
          <Row k="Food" v={<span className="inline-flex items-center gap-1">{hint && <Utensils className="size-3.5 text-[var(--em-caution)]" />}{FOOD_RULE_LABELS[med.foodRule]}{hint ? ` — ${hint}` : ""}</span>} />
          {med.instructions && <Row k="Instructions" v={med.instructions} />}
          {med.ingredients.length > 0 && <Row k="Ingredients" v={med.ingredients.join(", ")} />}
          {med.reason && <Row k="For" v={med.reason} />}
          {med.prescriber && <Row k="By" v={med.prescriber} />}
          <Row k="Since" v={`${med.startDate}${med.endDate ? ` → ${med.endDate}` : ""}`} />
          <Row k="Taken" v={takenCount ? `${takenCount} dose${takenCount === 1 ? "" : "s"} logged${lastTaken ? ` · last ${new Date(lastTaken.scheduledAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` : ""}` : "No doses logged yet"} />
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
          <ShieldCheck className="size-3.5" /> Against {owner?.name}’s other {others.length} item{others.length === 1 ? "" : "s"}
        </h2>
        {others.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing else on the list to compare with.</p>
        ) : (
          <ClashResults report={report} candidateName={med.name} compact />
        )}
      </section>

      <section className="grid grid-cols-2 gap-2">
        {med.status === "active" ? (
          <Button variant="outline" className="font-bold" onClick={() => { updateMedication(med.id, { status: "paused" }); toast("Paused") }}>
            <PauseCircle /> Pause
          </Button>
        ) : (
          <Button variant="outline" className="font-bold" onClick={() => { updateMedication(med.id, { status: "active", endDate: undefined }); toast("Resumed") }}>
            <PlayCircle /> Resume
          </Button>
        )}
        {med.status !== "stopped" && (
          <Button variant="outline" className="font-bold" onClick={() => { updateMedication(med.id, { status: "stopped", endDate: todayKey() }); toast("Moved to past medications") }}>
            <StopCircle /> Stop
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="col-span-2 font-bold text-destructive hover:text-destructive">
              <Trash2 /> Delete permanently
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {med.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes it and its dose history. If you just want to keep a record, use “Stop” instead.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => {
                  removeMedication(med.id)
                  toast("Deleted")
                  router.push("/medications")
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <dt className="font-bold text-muted-foreground">{k}</dt>
      <dd className="min-w-0 break-words">{v}</dd>
    </>
  )
}
