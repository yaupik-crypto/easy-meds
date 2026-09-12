/**
 * Daily upper-limit guidance for common vitamins, minerals and OTC drugs,
 * used to catch CUMULATIVE overdose across several products — the gap a
 * pairwise interaction checker misses. Based on adult Tolerable Upper
 * Intake Levels (NIH Office of Dietary Supplements) for nutrients and
 * standard OTC label maximums for drugs. These are general population
 * ceilings, not a prescription: pregnancy, kidney/liver conditions, age
 * and other medications can all lower what's safe for one person.
 */
import type { IngredientUnit } from "./types"

export type NutrientLimit = {
  /** Matches an id in lib/interactions.ts AGENTS. */
  agentId: string
  label: string
  unit: "mg" | "mcg"
  /** Upper limit — most people should not routinely exceed this per day. */
  ul: number
  /** Optional lower "many guidelines suggest staying under this" threshold. */
  caution?: number
  note: string
}

export const NUTRIENT_LIMITS: NutrientLimit[] = [
  { agentId: "vitamin_c", label: "Vitamin C", unit: "mg", ul: 2000, caution: 1000, note: "Above this, the classic effect is stomach upset and diarrhoea." },
  { agentId: "vitamin_d", label: "Vitamin D", unit: "mcg", ul: 100, caution: 50, note: "100 mcg = 4000 IU. Long-term excess can raise blood calcium." },
  { agentId: "vitamin_a", label: "Vitamin A", unit: "mcg", ul: 3000, note: "As retinol/retinyl esters. Avoid high doses in pregnancy." },
  { agentId: "vitamin_e", label: "Vitamin E", unit: "mg", ul: 1000, note: "High doses add to bleeding risk, especially with blood thinners." },
  { agentId: "vitamin_b6", label: "Vitamin B6", unit: "mg", ul: 100, caution: 50, note: "Long-term high doses have been linked to nerve damage." },
  { agentId: "folic_acid", label: "Folic acid", unit: "mcg", ul: 1000, note: "From supplements and fortified food, not food folate." },
  { agentId: "niacin", label: "Niacin (B3)", unit: "mg", ul: 35, note: "Flushing and skin irritation are common well before this." },
  { agentId: "zinc", label: "Zinc", unit: "mg", ul: 40, caution: 25, note: "Regular high doses can cause copper deficiency and nausea." },
  { agentId: "iron", label: "Iron", unit: "mg", ul: 45, caution: 25, note: "Nausea and constipation are common on the way to this limit." },
  { agentId: "calcium", label: "Calcium", unit: "mg", ul: 2500, caution: 2000, note: "Lower (2000 mg) is the usual ceiling for adults over 50." },
  { agentId: "magnesium", label: "Magnesium (supplement)", unit: "mg", ul: 350, note: "This limit is for supplement magnesium only, not food." },
  { agentId: "caffeine", label: "Caffeine", unit: "mg", ul: 400, caution: 200, note: "Roughly 4 cups of coffee. Lower for anyone sensitive or pregnant." },
  { agentId: "paracetamol", label: "Paracetamol / acetaminophen", unit: "mg", ul: 4000, caution: 3000, note: "Many guidelines now suggest staying under 3000 mg/day routinely, especially with regular alcohol use." },
  { agentId: "ibuprofen", label: "Ibuprofen", unit: "mg", ul: 1200, note: "1200 mg/day is the over-the-counter ceiling; a doctor may allow more." },
]

export const NUTRIENT_LIMIT_BY_AGENT = new Map(NUTRIENT_LIMITS.map((n) => [n.agentId, n]))

/** Convert an ingredient's recorded amount into the limit table's unit. Returns null if the units can't be safely compared. */
export function toLimitUnit(amount: number, unit: IngredientUnit | undefined, agentId: string): number | null {
  const limit = NUTRIENT_LIMIT_BY_AGENT.get(agentId)
  if (!limit) return null
  const u = unit ?? limit.unit
  if (u === limit.unit) return amount
  if (u === "mg" && limit.unit === "mcg") return amount * 1000
  if (u === "mcg" && limit.unit === "mg") return amount / 1000
  if (u === "g" && limit.unit === "mg") return amount * 1000
  if (u === "IU") {
    // Only two nutrients here are commonly labelled in IU; everything else can't be converted safely.
    if (agentId === "vitamin_d") return amount / 40 // 40 IU = 1 mcg
    if (agentId === "vitamin_a") return amount / 3.33 // approx, retinol IU -> mcg RAE
    return null
  }
  return null
}
