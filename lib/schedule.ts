import type { DoseLog, Medication, Schedule } from "./types"
import { todayKey } from "./store"

export type DoseSlot = {
  medication: Medication
  time: string // HH:mm
  scheduledAt: string // ISO
  log?: DoseLog
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function daysBetween(a: Date, b: Date): number {
  const ms = 24 * 60 * 60 * 1000
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((ub - ua) / ms)
}

export function isMedicationActiveOn(med: Medication, dateKey: string): boolean {
  if (med.status !== "active") return false
  if (med.startDate && dateKey < med.startDate) return false
  if (med.endDate && dateKey > med.endDate) return false
  return true
}

export function timesForDate(schedule: Schedule, dateKey: string): string[] {
  const date = parseDateKey(dateKey)
  switch (schedule.type) {
    case "daily":
      return schedule.times
    case "weekly":
      return schedule.days.includes(date.getDay()) ? schedule.times : []
    case "every_n_days": {
      const diff = daysBetween(parseDateKey(schedule.anchor), date)
      return diff >= 0 && diff % schedule.every === 0 ? schedule.times : []
    }
    case "as_needed":
      return []
  }
}

export function scheduledAtIso(dateKey: string, time: string): string {
  const [h, m] = time.split(":").map(Number)
  const d = parseDateKey(dateKey)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

export function slotsForDate(
  medications: Medication[],
  logs: DoseLog[],
  dateKey: string = todayKey(),
): DoseSlot[] {
  const slots: DoseSlot[] = []
  for (const med of medications) {
    if (!isMedicationActiveOn(med, dateKey)) continue
    for (const time of timesForDate(med.schedule, dateKey)) {
      const scheduledAt = scheduledAtIso(dateKey, time)
      const log = logs.find(
        (l) => l.medicationId === med.id && l.scheduledAt === scheduledAt,
      )
      slots.push({ medication: med, time, scheduledAt, log })
    }
  }
  return slots.sort((a, b) => a.time.localeCompare(b.time))
}

export function describeSchedule(schedule: Schedule): string {
  const fmtTimes = (times: string[]) =>
    times.length ? times.map(formatTime).join(", ") : "no set time"
  switch (schedule.type) {
    case "daily":
      return `${schedule.times.length}× daily · ${fmtTimes(schedule.times)}`
    case "weekly": {
      const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const days = schedule.days
        .slice()
        .sort()
        .map((d) => names[d])
        .join(" ")
      return `${days || "no days"} · ${fmtTimes(schedule.times)}`
    }
    case "every_n_days":
      return `Every ${schedule.every} days · ${fmtTimes(schedule.times)}`
    case "as_needed":
      return "As needed"
  }
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number)
  if (Number.isNaN(h)) return time
  const suffix = h >= 12 ? "pm" : "am"
  const hour = h % 12 === 0 ? 12 : h % 12
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`
}

export function timeOfDayLabel(time: string): "Morning" | "Midday" | "Afternoon" | "Evening" | "Night" {
  const h = Number(time.split(":")[0])
  if (h < 11) return "Morning"
  if (h < 14) return "Midday"
  if (h < 18) return "Afternoon"
  if (h < 22) return "Evening"
  return "Night"
}

/** Next upcoming dose across all active medications, from `from` onwards (looks 14 days ahead). */
export function nextDose(
  medications: Medication[],
  logs: DoseLog[],
  from = new Date(),
): DoseSlot | null {
  for (let i = 0; i < 14; i++) {
    const d = new Date(from)
    d.setDate(d.getDate() + i)
    const key = todayKey(d)
    const slots = slotsForDate(medications, logs, key)
    const upcoming = slots.find(
      (s) => !s.log && new Date(s.scheduledAt).getTime() > from.getTime(),
    )
    if (upcoming) return upcoming
  }
  return null
}
