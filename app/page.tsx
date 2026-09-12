"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, BellOff, BellRing, ChevronRight, Plus, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEasyMeds, todayKey } from "@/lib/store"
import { slotsForDate, timeOfDayLabel, nextDose, formatTime, type DoseSlot } from "@/lib/schedule"
import { findAllClashes } from "@/lib/interactions"
import { requestNotificationPermission, notificationsSupported } from "@/lib/reminders"
import { Welcome } from "@/components/welcome"
import { DoseCard } from "@/components/dose-card"
import { SeverityBadge } from "@/components/severity"
import { InstallHint } from "@/components/install-hint"
import { DailyTotals } from "@/components/daily-totals"
import { TourSlot } from "@/components/tour"
import { toast } from "sonner"

export default function TodayPage() {
  const { activePerson, people, medicationsFor, logsFor, upsertLog, removeLog, data, updateSettings } = useEasyMeds()
  const [dateKey, setDateKey] = React.useState(todayKey())

  React.useEffect(() => {
    const i = window.setInterval(() => setDateKey(todayKey()), 60_000)
    return () => window.clearInterval(i)
  }, [])

  if (!activePerson || people.length === 0) return <Welcome />

  const meds = medicationsFor(activePerson.id)
  const logs = logsFor(activePerson.id)
  const slots = slotsForDate(meds, logs, dateKey)
  const active = meds.filter((m) => m.status === "active")
  const asNeeded = active.filter((m) => m.schedule.type === "as_needed")
  const clashes = findAllClashes(active)
  const takenCount = slots.filter((s) => s.log?.status === "taken").length
  const upcoming = nextDose(meds, logs)

  const groups = new Map<string, DoseSlot[]>()
  for (const s of slots) {
    const k = timeOfDayLabel(s.time)
    groups.set(k, [...(groups.get(k) ?? []), s])
  }

  const mark = (slot: DoseSlot, status: "taken" | "skipped") =>
    upsertLog({
      personId: activePerson.id,
      medicationId: slot.medication.id,
      scheduledAt: slot.scheduledAt,
      status,
    })

  const enableReminders = async () => {
    if (!notificationsSupported()) {
      updateSettings({ remindersEnabled: true })
      toast("Reminders on", { description: "This browser cannot show notifications, so you will see in-app alerts while Easy Meds is open." })
      return
    }
    const perm = await requestNotificationPermission()
    updateSettings({ remindersEnabled: true })
    toast(perm === "granted" ? "Reminders on" : "Reminders on (in-app only)", {
      description:
        perm === "granted"
          ? "You will get a notification at each dose time while Easy Meds is open or installed."
          : "Notifications were not allowed, so alerts will show inside the app.",
    })
  }

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            <Sun className="size-3.5" /> {dateLabel}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            {greeting()}, {activePerson.name.split(" ")[0]}
          </h1>
        </div>
        {slots.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-extrabold text-primary">
              {takenCount}<span className="text-base text-muted-foreground">/{slots.length}</span>
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">taken</p>
          </div>
        )}
      </div>

      {slots.length > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.round((takenCount / slots.length) * 100)}%` }}
          />
        </div>
      )}

      {clashes.length > 0 && (
        <Link
          href="/check?all=1"
          className="flex items-center gap-3 rounded-2xl border p-4"
          style={{ borderColor: "var(--em-caution)", background: "var(--em-caution-bg)" }}
        >
          <AlertTriangle className="size-5 shrink-0" style={{ color: "var(--em-caution)" }} />
          <div className="min-w-0 flex-1">
            <p className="font-bold">
              {clashes.length} possible clash{clashes.length > 1 ? "es" : ""} in {activePerson.name}’s list
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {clashes[0].candidate.name} + {clashes[0].other.name}
              {clashes.length > 1 ? ` and ${clashes.length - 1} more` : ""}
            </p>
          </div>
          <SeverityBadge severity={clashes[0].severity} />
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      )}

      <DailyTotals meds={active} logs={logs} dateKey={dateKey} />

      {!data.settings.remindersEnabled && active.length > 0 && (
        <button
          type="button"
          data-tour="reminders"
          onClick={enableReminders}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-xs hover:bg-muted/50"
        >
          <BellOff className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-bold">Turn on dose reminders</p>
            <p className="text-sm text-muted-foreground">Get a nudge at each scheduled time.</p>
          </div>
          <BellRing className="size-4 text-primary" />
        </button>
      )}
      <TourSlot id="reminders" />

      {meds.length > 0 && <InstallHint />}

      {meds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-bold">No medications yet for {activePerson.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">Add the first one from the label or box.</p>
          <Button asChild className="mt-4 font-bold" data-tour="add-first">
            <Link href="/medications/new"><Plus /> Add medication or supplement</Link>
          </Button>
          <TourSlot id="add-first" className="text-left" />
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-bold">Nothing scheduled today</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {upcoming
              ? `Next dose: ${upcoming.medication.name} on ${new Date(upcoming.scheduledAt).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} at ${formatTime(upcoming.time)}.`
              : "Nothing is scheduled. Add times to a medication to see it here."}
          </p>
        </div>
      ) : (
        Array.from(groups.entries()).map(([label, list]) => (
          <section key={label} className="space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{label}</h2>
            {list.map((slot, i) => (
              <div key={slot.medication.id + slot.scheduledAt} data-tour={label === Array.from(groups.keys())[0] && i === 0 ? "dose" : undefined}>
              <DoseCard
                slot={slot}
                onTaken={() => mark(slot, "taken")}
                onSkipped={() => mark(slot, "skipped")}
                onUndo={() => slot.log && removeLog(slot.log.id)}
              />
              </div>
            ))}
            {label === Array.from(groups.keys())[0] && <TourSlot id="dose" />}
          </section>
        ))
      )}

      {asNeeded.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">As needed</h2>
          {asNeeded.map((m, i) => (
            <div key={m.id} data-tour={slots.length === 0 && i === 0 ? "dose" : undefined} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs">
              <Link href={`/medications/${m.id}`} className="min-w-0 flex-1">
                <p className="truncate font-bold">{m.name}</p>
                <p className="truncate text-sm text-muted-foreground">{[m.dose, m.strength].filter(Boolean).join(" · ")}</p>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                className="font-bold"
                onClick={() => {
                  const now = new Date().toISOString()
                  upsertLog({ personId: activePerson.id, medicationId: m.id, scheduledAt: now, status: "taken" })
                  toast(`Logged ${m.name}`, { description: `Taken at ${new Date(now).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` })
                }}
              >
                Took one
              </Button>
            </div>
          ))}
          {slots.length === 0 && <TourSlot id="dose" />}
        </section>
      )}

      {meds.length > 0 && (
        <>
          <Button asChild variant="outline" className="w-full font-bold" data-tour="add-first">
            <Link href="/medications/new"><Plus /> Add medication or supplement</Link>
          </Button>
          <TourSlot id="add-first" />
        </>
      )}
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return "Good night"
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}
