"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useEasyMeds } from "@/lib/store"
import { MedForm, emptyMedForm, type MedFormValue } from "@/components/med-form"
import { ClashResults, useClashReport } from "@/components/clash-check"
import { Welcome } from "@/components/welcome"
import { TourSlot, useTourSignal } from "@/components/tour"
import { ScanLabel } from "@/components/scan-label"

export default function NewMedicationPage() {
  return (
    <React.Suspense fallback={null}>
      <NewMedicationInner />
    </React.Suspense>
  )
}

function NewMedicationInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { activePerson, medicationsFor, addMedication } = useEasyMeds()
  const [value, setValue] = React.useState<MedFormValue>(() => ({ ...emptyMedForm(), name: params.get("name") ?? "" }))
  const [step, setStep] = React.useState<"form" | "check">("form")

  const existing = React.useMemo(
    () => (activePerson ? medicationsFor(activePerson.id).filter((m) => m.status !== "stopped") : []),
    [activePerson, medicationsFor],
  )
  const candidate = React.useMemo(
    () => (step === "check" ? { id: "__new__", name: value.name, ingredients: value.ingredients } : null),
    [step, value.name, value.ingredients],
  )
  const report = useClashReport(candidate, existing, activePerson?.allergies)
  useTourSignal("clash-shown", step === "check")

  if (!activePerson) return <Welcome />

  const hasBlocking = report.curated.some((c) => c.severity === "avoid")

  const save = () => {
    addMedication({ ...value, personId: activePerson.id, name: value.name.trim() })
    toast(`${value.name.trim()} added for ${activePerson.name}`)
    router.push("/")
  }

  if (step === "check") {
    return (
      <div className="space-y-5">
        <button type="button" onClick={() => setStep("form")} className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="size-4" /> Back to details
        </button>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="size-3.5" /> Clash check
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            {value.name} + {activePerson.name}’s {existing.length} current item{existing.length === 1 ? "" : "s"}
          </h1>
        </div>

        <div data-tour="clash-results" className="space-y-3">
        <div data-tour-spacer />
        <TourSlot id="clash-results" className="my-0" />
        {existing.length === 0 ? (
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            Nothing to compare against yet — this is the first item on the list. Future additions will be checked against it.
          </div>
        ) : (
          <ClashResults report={report} candidateName={value.name} />
        )}
        </div>

        <div className="em-sticky-action space-y-2">
          <Button size="lg" className="w-full font-bold" onClick={save} variant={hasBlocking ? "outline" : "default"}>
            {hasBlocking ? "Add anyway (I’ve checked with a pharmacist)" : "Add to list"}
          </Button>
          {hasBlocking && (
            <p className="text-center text-xs text-muted-foreground">
              An “avoid” clash was found. Please talk to a doctor or pharmacist before taking both.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.name.trim()) return
        setStep("check")
      }}
    >
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back">
          <Link href="/medications"><ArrowLeft /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Add for {activePerson.name}</h1>
          <p className="text-sm text-muted-foreground">Copy what the pharmacist label or the box says.</p>
        </div>
      </div>

      <ScanLabel value={value} onApply={(next) => { setValue(next); toast("Filled in from the label — check it, then continue") }} />

      <MedForm value={value} onChange={setValue} />

      <div data-tour-spacer />
      <TourSlot id="submit" />
      <div className="em-sticky-action" data-tour="submit">
        <Button type="submit" size="lg" className="w-full font-bold" disabled={!value.name.trim()}>
          <ShieldCheck /> Check for clashes, then add
        </Button>
      </div>
    </form>
  )
}
