"use client"

import type { DoseSlot } from "./schedule"
import { foodRuleHint } from "./types"

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied"
  if (Notification.permission === "granted") return "granted"
  try {
    return await Notification.requestPermission()
  } catch {
    return "denied"
  }
}

export function showDoseNotification(slot: DoseSlot, personName: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return
  const med = slot.medication
  const hint = foodRuleHint(med.foodRule, med.foodGapMinutes)
  const body = [
    [med.dose, med.strength].filter(Boolean).join(" · "),
    hint,
    med.instructions,
  ]
    .filter(Boolean)
    .join("\n")
  try {
    new Notification(`${personName}: time for ${med.name}`, {
      body: body || "Time to take this dose.",
      tag: `easy-meds-${med.id}-${slot.scheduledAt}`,
      icon: "/icon.svg",
    })
  } catch (err) {
    console.warn("Easy Meds: notification failed", err)
  }
}
