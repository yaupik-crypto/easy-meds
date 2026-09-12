"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Bell, Check, Download, Info, Pencil, Plus, Sparkles, Stethoscope, Trash2, Type, Upload, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useEasyMeds } from "@/lib/store"
import { PERSON_COLORS, RELATION_LABELS, type Person, type Relation } from "@/lib/types"
import { requestNotificationPermission } from "@/lib/reminders"
import { PersonAvatar } from "@/components/person-avatar"
import { Welcome } from "@/components/welcome"
import { TextSizeControl } from "@/components/text-size-control"
import { InstallHint } from "@/components/install-hint"
import { TourSlot } from "@/components/tour"
import { cn } from "@/lib/utils"

type Draft = { name: string; relation: Relation; birthYear: string; allergies: string; conditions: string; notes: string; color: string }
const emptyDraft = (i: number): Draft => ({ name: "", relation: "parent", birthYear: "", allergies: "", conditions: "", notes: "", color: PERSON_COLORS[i % PERSON_COLORS.length] })

export default function PeoplePage() {
  return (
    <React.Suspense fallback={null}>
      <PeoplePageInner />
    </React.Suspense>
  )
}

function PeoplePageInner() {
  const params = useSearchParams()
  const router = useRouter()
  const { people, activePerson, data, addPerson, updatePerson, removePerson, setActivePerson, updateSettings, exportJson, importJson, medicationsFor } = useEasyMeds()
  const [open, setOpen] = React.useState(params.get("add") === "1")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<Draft>(() => emptyDraft(people.length))
  const fileRef = React.useRef<HTMLInputElement>(null)

  if (!activePerson) return <Welcome />

  const openAdd = () => {
    setEditingId(null)
    setDraft(emptyDraft(people.length))
    setOpen(true)
  }
  const openEdit = (p: Person) => {
    setEditingId(p.id)
    setDraft({
      name: p.name,
      relation: p.relation,
      birthYear: p.birthYear ? String(p.birthYear) : "",
      allergies: p.allergies ?? "",
      conditions: p.conditions ?? "",
      notes: p.notes ?? "",
      color: p.color,
    })
    setOpen(true)
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = draft.name.trim()
    if (!name) return
    const patch = {
      name,
      relation: draft.relation,
      birthYear: draft.birthYear ? Number(draft.birthYear) : undefined,
      allergies: draft.allergies.trim() || undefined,
      conditions: draft.conditions.trim() || undefined,
      notes: draft.notes.trim() || undefined,
      color: draft.color,
    }
    if (editingId) {
      updatePerson(editingId, patch)
      toast("Saved")
    } else {
      const p = addPerson(patch)
      setActivePerson(p.id)
      toast(`${name} added`)
    }
    setOpen(false)
  }

  const toggleReminders = async (on: boolean) => {
    if (on) await requestNotificationPermission()
    updateSettings({ remindersEnabled: on })
  }

  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `easy-meds-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const onImportFile = async (file: File | undefined) => {
    if (!file) return
    const res = importJson(await file.text())
    toast(res.ok ? "Backup restored" : res.error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            <Users className="size-3.5" /> People
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Who you look after</h1>
        </div>
        <Button size="sm" className="font-bold" onClick={openAdd} data-tour="people-add"><Plus /> Add</Button>
      </div>
      <TourSlot id="people-add" />

      <ul className="space-y-2">
        {people.map((p) => {
          const count = medicationsFor(p.id).filter((m) => m.status !== "stopped").length
          const active = p.id === activePerson.id
          return (
            <li key={p.id} className={cn("flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-xs", active ? "border-primary" : "border-border")}>
              <button type="button" onClick={() => setActivePerson(p.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <PersonAvatar person={p} />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-bold">
                    <span className="truncate">{p.name}</span>
                    {active && <Check className="size-4 text-primary" />}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {RELATION_LABELS[p.relation]} · {count} current item{count === 1 ? "" : "s"}
                    {p.allergies ? ` · allergies: ${p.allergies}` : ""}
                  </p>
                </div>
              </button>
              <Button variant="ghost" size="icon-sm" aria-label={`Edit ${p.name}`} onClick={() => openEdit(p)}><Pencil /></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Remove ${p.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {p.name}?</AlertDialogTitle>
                    <AlertDialogDescription>All of {p.name}’s medications and history will be deleted from this device.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { removePerson(p.id); toast(`${p.name} removed`) }}>Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          )
        })}
      </ul>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">Settings</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Type className="size-5 text-primary" />
            <div>
              <p className="font-bold">Text size</p>
              <p className="text-xs text-muted-foreground">Makes everything in Easy Meds bigger.</p>
            </div>
          </div>
          <TextSizeControl />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-primary" />
            <div>
              <p className="font-bold">Dose reminders</p>
              <p className="text-xs text-muted-foreground">Notify at each scheduled time while the app is open or installed.</p>
            </div>
          </div>
          <Switch checked={data.settings.remindersEnabled} onCheckedChange={toggleReminders} aria-label="Dose reminders" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" className="font-bold" onClick={download}><Download /> Back up</Button>
          <Button variant="outline" className="font-bold" onClick={() => fileRef.current?.click()}><Upload /> Restore</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => onImportFile(e.target.files?.[0])} />
        </div>
        <p className="text-xs text-muted-foreground">
          Everything is stored on this device only. Back up before switching phones or clearing the browser.
        </p>
        <Button variant="ghost" size="sm" className="w-full font-bold" onClick={() => { updateSettings({ tourStep: 0 }); router.push("/") }}>
          <Sparkles /> Show me around again
        </Button>
      </section>

      <InstallHint />

      <Link href="/summary" data-tour="summary" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <Stethoscope className="size-5 text-primary" />
        <span className="font-bold">Print {activePerson.name}’s summary for a doctor</span>
      </Link>
      <TourSlot id="summary" />

      <Link href="/about" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <Info className="size-5 text-primary" />
        <span className="font-bold">About Easy Meds</span>
      </Link>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit person" : "Add a person"}</DialogTitle>
              <DialogDescription>Someone whose medications you help keep track of.</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Relationship</Label>
                <Select value={draft.relation} onValueChange={(v) => setDraft({ ...draft, relation: v as Relation })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RELATION_LABELS) as Relation[]).map((r) => (
                      <SelectItem key={r} value={r}>{RELATION_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-year">Birth year</Label>
                <Input id="p-year" type="number" inputMode="numeric" placeholder="1950" value={draft.birthYear} onChange={(e) => setDraft({ ...draft, birthYear: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-allergies">Allergies</Label>
              <Input id="p-allergies" placeholder="Penicillin, shellfish…" value={draft.allergies} onChange={(e) => setDraft({ ...draft, allergies: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-conditions">Conditions</Label>
              <Input id="p-conditions" placeholder="High blood pressure, diabetes…" value={draft.conditions} onChange={(e) => setDraft({ ...draft, conditions: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-notes">Notes</Label>
              <Textarea id="p-notes" rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Colour</Label>
              <div className="flex flex-wrap gap-2">
                {PERSON_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Colour ${c}`}
                    aria-pressed={draft.color === c}
                    onClick={() => setDraft({ ...draft, color: c })}
                    className={cn("size-8 rounded-full border-2 transition-transform", draft.color === c ? "scale-110 border-foreground" : "border-transparent")}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="font-bold" disabled={!draft.name.trim()}>{editingId ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
