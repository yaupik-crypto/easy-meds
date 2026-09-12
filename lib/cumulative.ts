/**
 * Cumulative daily-dose checking: adds up how much of one ingredient a
 * person is really taking today across everything on their list, and
 * compares it with lib/nutrient-limits.ts. This is the gap a pairwise
 * interaction checker misses — two products can each look fine alone and
 * still add up to too much together.
 */
import { AGENTS } from "./interactions"
import { NUTRIENT_LIMITS, toLimitUnit } from "./nutrient-limits"
import { isMedicationActiveOn, timesForDate } from "./schedule"
import type { DoseLog, IngredientAmount, Medication, Schedule } from "./types"

export type CumulativeFinding = {
  agentId: string
  label: string
  unit: "mg" | "mcg"
  existingTotal: number
  candidateContribution: number
  total: number
  ul: number
  caution?: number
  severity: "avoid" | "caution" | "info"
  note: string
}

/** How much of one nutrient/drug a single dose of this item contains. */
function perDoseAmount(
  ingredients: IngredientAmount[] | undefined,
  unitsPerDose: number | undefined,
  agentId: string,
): number {
  const agent = AGENTS.find((a) => a.id === agentId)
  if (!agent || !ingredients?.length) return 0
  let total = 0
  for (const ing of ingredients) {
    const nameLower = ing.name.toLowerCase()
    if (!agent.keywords.some((k) => nameLower.includes(k))) continue
    if (ing.amount == null) continue
    const converted = toLimitUnit(ing.amount, ing.unit, agentId)
    if (converted != null) total += converted
  }
  return total * (unitsPerDose && unitsPerDose > 0 ? unitsPerDose : 1)
}

/** How many doses of this medication land on this particular day. */
export function dosesOnDate(med: Medication, logs: DoseLog[], dateKey: string): number {
  if (med.schedule.type === "as_needed") {
    return logs.filter(
      (l) => l.medicationId === med.id && l.status === "taken" && l.scheduledAt.slice(0, 10) === dateKey,
    ).length
  }
  if (!isMedicationActiveOn(med, dateKey)) return 0
  return timesForDate(med.schedule, dateKey).length
}

type CandidateInput = {
  ingredients: IngredientAmount[]
  unitsPerDose?: number
}

/**
 * Findings for adding `candidate` (taken `candidateDosesToday` times today)
 * on top of what `existingActive` already accounts for today.
 */
export function computeCumulativeFindings(
  candidate: CandidateInput,
  candidateDosesToday: number,
  existingActive: Medication[],
  logs: DoseLog[],
  dateKey: string,
): CumulativeFinding[] {
  const findings: CumulativeFinding[] = []
  for (const limit of NUTRIENT_LIMITS) {
    const candidatePerDose = perDoseAmount(candidate.ingredients, candidate.unitsPerDose, limit.agentId)
    const candidateContribution = candidatePerDose * Math.max(0, candidateDosesToday)
    let existingTotal = 0
    for (const med of existingActive) {
      const perDose = perDoseAmount(med.ingredients, med.unitsPerDose, limit.agentId)
      if (perDose <= 0) continue
      existingTotal += perDose * dosesOnDate(med, logs, dateKey)
    }
    const total = existingTotal + candidateContribution
    if (candidatePerDose <= 0 || total <= 0) continue // this item doesn't contain the nutrient at all

    let severity: "avoid" | "caution" | "info" | null = null
    if (total > limit.ul) severity = "avoid"
    else if (limit.caution && total > limit.caution) severity = "caution"
    else if (total > limit.ul * 0.5) severity = "info"
    if (!severity) continue

    findings.push({
      agentId: limit.agentId,
      label: limit.label,
      unit: limit.unit,
      existingTotal,
      candidateContribution,
      total,
      ul: limit.ul,
      caution: limit.caution,
      severity,
      note: limit.note,
    })
  }
  return findings.sort((a, b) => b.total / b.ul - a.total / a.ul)
}

/** Today's running totals for a person's whole active list — for the Today page summary. Independent of any candidate item. */
export function computeTodaysTotals(existingActive: Medication[], logs: DoseLog[], dateKey: string): CumulativeFinding[] {
  const findings: CumulativeFinding[] = []
  for (const limit of NUTRIENT_LIMITS) {
    let total = 0
    for (const med of existingActive) {
      const perDose = perDoseAmount(med.ingredients, med.unitsPerDose, limit.agentId)
      if (perDose <= 0) continue
      total += perDose * dosesOnDate(med, logs, dateKey)
    }
    if (total <= 0) continue

    let severity: "avoid" | "caution" | "info" | null = null
    if (total > limit.ul) severity = "avoid"
    else if (limit.caution && total > limit.caution) severity = "caution"
    else if (total > limit.ul * 0.5) severity = "info"
    if (!severity) continue

    findings.push({
      agentId: limit.agentId,
      label: limit.label,
      unit: limit.unit,
      existingTotal: total,
      candidateContribution: 0,
      total,
      ul: limit.ul,
      caution: limit.caution,
      severity,
      note: limit.note,
    })
  }
  return findings.sort((a, b) => b.total / b.ul - a.total / a.ul)
}

/** Doses-per-day implied by a schedule, for "if I add this, how many times today" — as_needed defaults to 1 (one dose, right now). */
export function impliedDosesToday(schedule: Schedule, dateKey: string): number {
  if (schedule.type === "as_needed") return 1
  return timesForDate(schedule, dateKey).length
}
