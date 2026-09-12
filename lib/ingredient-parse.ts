import type { IngredientAmount, IngredientUnit } from "./types"

const UNIT_MAP: Record<string, IngredientUnit> = {
  mg: "mg", milligram: "mg", milligrams: "mg",
  mcg: "mcg", µg: "mcg", ug: "mcg", microgram: "mcg", micrograms: "mcg",
  g: "g", gram: "g", grams: "g",
  iu: "IU",
  ml: "ml",
}

const TRAILING_AMOUNT = /^(.*?)\s+([\d.]+)\s*(mg|mcg|µg|ug|g|iu|ml)s?\.?$/i

/**
 * Parses loose free text like "vitamin C 500mg, zinc 10 mg, jujube" into
 * structured ingredients. Anything without a recognisable trailing amount
 * is kept as a name-only entry.
 */
export function parseIngredientsText(text: string): IngredientAmount[] {
  return text
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((chunk) => {
      const m = chunk.match(TRAILING_AMOUNT)
      if (m) {
        const [, name, amountStr, unitRaw] = m
        const unit = UNIT_MAP[unitRaw.toLowerCase()]
        const amount = Number(amountStr)
        if (name.trim() && unit && amount > 0) {
          return { name: name.trim(), amount, unit }
        }
      }
      return { name: chunk }
    })
}
