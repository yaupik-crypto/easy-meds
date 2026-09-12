"use client"

import * as React from "react"
import { toast } from "sonner"
import { useEasyMeds, todayKey } from "@/lib/store"
import { slotsForDate } from "@/lib/schedule"
import { showDoseNotification } from "@/lib/reminders"

/**
 * While the app is open, fire a notification + toast at each scheduled dose
 * time for every person. (Background push needs a server; this is the
 * foundation that works today on any device with the tab or installed app open.)
 */
export function ReminderRunner() {
  const { data, hydrated } = useEasyMeds()
  const firedRef = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    if (!hydrated || !data.settings.remindersEnabled) return

    const tick = () => {
      const now = Date.now()
      const key = todayKey()
      for (const person of data.people) {
        const meds = data.medications.filter((m) => m.personId === person.id)
        const logs = data.logs.filter((l) => l.personId === person.id)
        for (const slot of slotsForDate(meds, logs, key)) {
          if (slot.log) continue
          const at = new Date(slot.scheduledAt).getTime()
          const id = `${slot.medication.id}|${slot.scheduledAt}`
          // Fire within a 90-second window after the scheduled time.
          if (now >= at && now - at < 90_000 && !firedRef.current.has(id)) {
            firedRef.current.add(id)
            showDoseNotification(slot, person.name)
            toast(`${person.name}: time for ${slot.medication.name}`, {
              description: [slot.medication.dose, slot.medication.strength]
                .filter(Boolean)
                .join(" · "),
              duration: 15_000,
            })
          }
        }
      }
    }

    tick()
    const interval = window.setInterval(tick, 30_000)
    return () => window.clearInterval(interval)
  }, [data, hydrated])

  return null
}
