"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"
import { IngredientUnitSchema, type IngredientAmount, type IngredientUnit } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { TourSlot } from "./tour"
import { todayKey } from "@/lib/store"
import {
  FOOD_RULE_LABELS,
  KIND_LABELS,
  type FoodRule,
  type MedKind,
  type Medication,
  type Schedule,
} from "@/lib/types"

export type MedFormValue = Omit<Medication, "id" | "personId" | "createdAt" | "updatedAt">

export function emptyMedForm(): MedFormValue {
  return {
    name: "",
    kind: "prescription",
    strength: "",
    dose: "1 tablet",
    ingredients: [],
    unitsPerDose: 1,
    schedule: { type: "daily", times: ["08:00"] },
    foodRule: "any",
    foodGapMinutes: undefined,
    instructions: "",
    reason: "",
    prescriber: "",
    startDate: todayKey(),
    endDate: undefined,
    status: "active",
  }
}

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"]
const PRESETS: { label: string; times: string[] }[] = [
  { label: "Once a day", times: ["08:00"] },
  { label: "Twice a day", times: ["08:00", "20:00"] },
  { label: "3× a day", times: ["08:00", "14:00", "20:00"] },
  { label: "4× a day", times: ["08:00", "12:00", "16:00", "20:00"] },
]

export function MedForm({
  value,
  onChange,
}: {
  value: MedFormValue
  onChange: (next: MedFormValue) => void
}) {
  const set = <K extends keyof MedFormValue>(key: K, v: MedFormValue[K]) =>
    onChange({ ...value, [key]: v })
  const [ingDraft, setIngDraft] = React.useState<{ name: string; amount: string; unit: IngredientUnit }>({
    name: "",
    amount: "",
    unit: "mg",
  })

  const schedule = value.schedule
  const times = "times" in schedule ? schedule.times : []
  const setTimes = (t: string[]) => {
    if (schedule.type === "as_needed") return
    set("schedule", { ...schedule, times: t } as Schedule)
  }
  const setScheduleType = (type: Schedule["type"]) => {
    const keep = times.length ? times : ["08:00"]
    switch (type) {
      case "daily":
        return set("schedule", { type, times: keep })
      case "weekly":
        return set("schedule", { type, days: [1, 3, 5], times: keep })
      case "every_n_days":
        return set("schedule", { type, every: 2, anchor: value.startDate || todayKey(), times: keep })
      case "as_needed":
        return set("schedule", { type })
    }
  }

  const addIngredient = () => {
    const name = ingDraft.name.trim()
    if (!name) return
    const amount = ingDraft.amount.trim() ? Number(ingDraft.amount) : undefined
    const entry: IngredientAmount = amount && amount > 0 ? { name, amount, unit: ingDraft.unit } : { name }
    set("ingredients", [...value.ingredients, entry])
    setIngDraft({ name: "", amount: "", unit: ingDraft.unit })
  }
  const removeIngredient = (i: number) => set("ingredients", value.ingredients.filter((_, j) => j !== i))

  return (
    <div className="space-y-6">
      <Section title="What is it?">
        <Field label="Name" hint="As written on the label or box" tour="name">
          <Input
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Panadol, Vitamin D3, Sertraline"
            autoComplete="off"
            required
          />
        </Field>
        <TourSlot id="name" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={value.kind} onValueChange={(v) => set("kind", v as MedKind)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(KIND_LABELS) as MedKind[]).map((k) => (
                  <SelectItem key={k} value={k}>{KIND_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Strength" hint="e.g. 500 mg">
            <Input value={value.strength ?? ""} onChange={(e) => set("strength", e.target.value)} placeholder="500 mg" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Each dose" hint="How much per dose, in words">
            <Input value={value.dose ?? ""} onChange={(e) => set("dose", e.target.value)} placeholder="1 tablet / 2 capsules / 5 ml" />
          </Field>
          <Field label="Units per dose" hint="e.g. 2 if each dose is 2 tablets">
            <Input
              type="number"
              min={0.25}
              step={0.25}
              value={value.unitsPerDose ?? 1}
              onChange={(e) => set("unitsPerDose", Math.max(0.25, Number(e.target.value) || 1))}
            />
          </Field>
        </div>
        <Field
          tour="ingredients"
          label="Active ingredients"
          hint="Optional, but it makes the clash check much smarter. Enter the amount per single unit (one tablet/capsule) — copy it from the label."
        >
          <div className="grid grid-cols-[1fr_5.5rem_5rem_auto] gap-2">
            <Input
              value={ingDraft.name}
              onChange={(e) => setIngDraft({ ...ingDraft, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addIngredient()
                }
              }}
              placeholder="e.g. Vitamin C"
            />
            <Input
              type="number"
              min={0}
              step="any"
              value={ingDraft.amount}
              onChange={(e) => setIngDraft({ ...ingDraft, amount: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addIngredient()
                }
              }}
              placeholder="amount"
            />
            <Select value={ingDraft.unit} onValueChange={(v) => setIngDraft({ ...ingDraft, unit: v as IngredientUnit })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {IngredientUnitSchema.options.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="secondary" onClick={addIngredient} aria-label="Add ingredient">
              <Plus />
            </Button>
          </div>
          {value.ingredients.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {value.ingredients.map((ing, i) => (
                <span key={`${ing.name}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                  {ing.name}
                  {ing.amount != null && <span className="text-accent-foreground/70">{ing.amount}{ing.unit ?? "mg"}</span>}
                  <button
                    type="button"
                    aria-label={`Remove ${ing.name}`}
                    onClick={() => removeIngredient(i)}
                    className="rounded-full p-0.5 hover:bg-black/10"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>
        <TourSlot id="ingredients" />
      </Section>

      <Section title="When to take it" tour="schedule">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["daily", "Every day"],
              ["weekly", "Certain days"],
              ["every_n_days", "Every N days"],
              ["as_needed", "As needed"],
            ] as [Schedule["type"], string][]
          ).map(([t, label]) => (
            <Chip key={t} active={schedule.type === t} onClick={() => setScheduleType(t)}>
              {label}
            </Chip>
          ))}
        </div>

        {schedule.type === "weekly" && (
          <div className="flex gap-1.5">
            {DAY_NAMES.map((d, i) => {
              const on = schedule.days.includes(i)
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    set("schedule", {
                      ...schedule,
                      days: on ? schedule.days.filter((x) => x !== i) : [...schedule.days, i],
                    })
                  }
                  className={cn(
                    "size-9 rounded-full text-sm font-bold transition-colors",
                    on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {d}
                </button>
              )
            })}
          </div>
        )}

        {schedule.type === "every_n_days" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Every … days">
              <Input
                type="number"
                min={2}
                value={schedule.every}
                onChange={(e) => set("schedule", { ...schedule, every: Math.max(2, Number(e.target.value) || 2) })}
              />
            </Field>
            <Field label="Starting on">
              <Input type="date" value={schedule.anchor} onChange={(e) => set("schedule", { ...schedule, anchor: e.target.value })} />
            </Field>
          </div>
        )}

        {schedule.type !== "as_needed" && (
          <>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Chip
                  key={p.label}
                  small
                  active={times.join() === p.times.join()}
                  onClick={() => setTimes(p.times)}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
            <div className="space-y-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={t}
                    onChange={(e) => setTimes(times.map((x, j) => (j === i ? e.target.value : x)))}
                    className="w-40"
                  />
                  {times.length > 1 && (
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove time" onClick={() => setTimes(times.filter((_, j) => j !== i))}>
                      <X />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setTimes([...times, "12:00"].sort())}>
                <Plus /> Add a time
              </Button>
            </div>
          </>
        )}
      </Section>

      <TourSlot id="schedule" />

      <Section title="Food & instructions">
        <Field label="Food rule">
          <Select value={value.foodRule} onValueChange={(v) => set("foodRule", v as FoodRule)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(FOOD_RULE_LABELS) as FoodRule[]).map((k) => (
                <SelectItem key={k} value={k}>{FOOD_RULE_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {(value.foodRule === "before_food" || value.foodRule === "after_food" || value.foodRule === "empty_stomach") && (
          <Field label="How long before / after eating (minutes)">
            <Input
              type="number"
              min={0}
              step={5}
              value={value.foodGapMinutes ?? ""}
              onChange={(e) => set("foodGapMinutes", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="30"
              className="w-32"
            />
          </Field>
        )}
        <Field label="Other instructions" hint="Anything the pharmacist or label says: avoid alcohol, don't lie down for 30 min…">
          <Textarea value={value.instructions ?? ""} onChange={(e) => set("instructions", e.target.value)} rows={2} />
        </Field>
      </Section>

      <Section title="Details">
        <Field label="What is it for?">
          <Input value={value.reason ?? ""} onChange={(e) => set("reason", e.target.value)} placeholder="Blood pressure, back pain, general health…" />
        </Field>
        <Field label="Prescribed / recommended by">
          <Input value={value.prescriber ?? ""} onChange={(e) => set("prescriber", e.target.value)} placeholder="Dr Chan, naturopath, self" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <Input type="date" value={value.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </Field>
          <Field label="End date" hint="Leave blank if ongoing">
            <Input type="date" value={value.endDate ?? ""} onChange={(e) => set("endDate", e.target.value || undefined)} />
          </Field>
        </div>
      </Section>
    </div>
  )
}

export function Section({ title, children, tour }: { title: string; children: React.ReactNode; tour?: string }) {
  return (
    <section data-tour={tour} className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <h2 className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function Field({ label, hint, children, tour }: { label: string; hint?: string; children: React.ReactNode; tour?: string }) {
  return (
    <div className="space-y-1.5" data-tour={tour}>
      <Label className="text-sm font-bold">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
  small,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  small?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border font-semibold transition-colors",
        small ? "px-3 py-1 text-xs" : "px-3 py-2 text-sm",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}
