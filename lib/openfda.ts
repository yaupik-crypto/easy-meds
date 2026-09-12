/**
 * openFDA drug-label lookup (free, no key needed, CORS enabled).
 * https://open.fda.gov/apis/drug/label/
 *
 * We fetch the label for a product and pull out the sections that talk
 * about interactions, then look for mentions of the person's other
 * medications inside that text.
 */
import type { Medication } from "./types"
import { matchAgents } from "./interactions"

export type LabelInfo = {
  queried: string
  brandName?: string
  genericName?: string
  interactionsText: string[]
  warningsText: string[]
  foodText: string[]
}

export type LabelMention = {
  other: Pick<Medication, "id" | "name">
  matchedTerm: string
  excerpt: string
}

const BASE = "https://api.fda.gov/drug/label.json"

function esc(s: string) {
  return s.replace(/["\\]/g, " ").replace(/\s+/g, " ").trim()
}

async function query(search: string, signal?: AbortSignal) {
  const url = `${BASE}?search=${encodeURIComponent(search)}&limit=1`
  const res = await fetch(url, { signal })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`openFDA ${res.status}`)
  const json = (await res.json()) as { results?: Record<string, unknown>[] }
  return json.results?.[0] ?? null
}

function asStrings(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string")
  if (typeof v === "string") return [v]
  return []
}

export async function fetchLabel(
  name: string,
  ingredients: string[] = [],
  signal?: AbortSignal,
): Promise<LabelInfo | null> {
  const term = esc(name)
  if (!term) return null
  const firstWord = term.split(" ")[0]
  const attempts = [
    `openfda.brand_name:"${term}"`,
    `openfda.generic_name:"${term}"`,
    `openfda.substance_name:"${term}"`,
    `openfda.brand_name:"${firstWord}"`,
    `openfda.generic_name:"${firstWord}"`,
  ]
  // Brand names from outside the US are often missing; the active ingredient usually is not.
  for (const ing of ingredients.map(esc).filter(Boolean)) {
    attempts.push(`openfda.generic_name:"${ing}"`, `openfda.substance_name:"${ing}"`)
  }
  let result: Record<string, unknown> | null = null
  // Prefer a label that actually has a drug-interactions section (usually the
  // prescription label), then fall back to any label (often OTC).
  for (const s of attempts) {
    result = await query(`${s} AND _exists_:drug_interactions`, signal)
    if (result) break
  }
  if (!result) {
    for (const s of attempts) {
      result = await query(s, signal)
      if (result) break
    }
  }
  if (!result) return null
  const openfda = (result.openfda ?? {}) as Record<string, unknown>
  return {
    queried: name,
    brandName: asStrings(openfda.brand_name)[0],
    genericName: asStrings(openfda.generic_name)[0],
    interactionsText: asStrings(result.drug_interactions),
    warningsText: [
      ...asStrings(result.boxed_warning),
      ...asStrings(result.warnings),
      ...asStrings(result.warnings_and_cautions),
    ],
    foodText: [
      ...asStrings(result.dosage_and_administration),
      ...asStrings(result.information_for_patients),
    ].filter((t) => /food|meal|empty stomach|grapefruit|alcohol/i.test(t)),
  }
}

function sentencesAround(text: string, term: string): string[] {
  const out: string[] = []
  const lower = text.toLowerCase()
  let idx = lower.indexOf(term)
  let guard = 0
  while (idx !== -1 && guard++ < 3) {
    const start = Math.max(0, text.lastIndexOf(". ", idx) + 1)
    const endDot = text.indexOf(". ", idx)
    const end = endDot === -1 ? Math.min(text.length, idx + 240) : Math.min(endDot + 1, idx + 400)
    out.push(text.slice(start, end).trim())
    idx = lower.indexOf(term, end)
  }
  return out
}

/** Search the label's interaction/warning text for the other medications. */
export function findLabelMentions(
  label: LabelInfo,
  others: Pick<Medication, "id" | "name" | "ingredients">[],
): LabelMention[] {
  const corpus = [...label.interactionsText, ...label.warningsText].join("\n")
  if (!corpus) return []
  const out: LabelMention[] = []
  for (const other of others) {
    const terms = new Set<string>()
    const nameWords = other.name.toLowerCase().split(/[\s,()/-]+/).filter((w) => w.length > 3)
    nameWords.forEach((w) => terms.add(w))
    ;(other.ingredients ?? []).forEach((i) => {
      const w = i.name.toLowerCase().trim()
      if (w.length > 3) terms.add(w)
    })
    matchAgents(other).forEach((a) => {
      a.keywords.forEach((k) => k.length > 3 && terms.add(k.trim()))
      ;(a.labelTerms ?? []).forEach((k) => terms.add(k))
    })
    for (const term of terms) {
      const hits = sentencesAround(corpus, term)
      if (hits.length) {
        out.push({ other: { id: other.id, name: other.name }, matchedTerm: term, excerpt: hits[0] })
        break
      }
    }
  }
  return out
}
