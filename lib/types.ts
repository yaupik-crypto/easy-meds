import { z } from "zod"

export const RelationSchema = z.enum([
  "self",
  "partner",
  "parent",
  "child",
  "grandparent",
  "sibling",
  "friend",
  "other",
])
export type Relation = z.infer<typeof RelationSchema>

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  relation: RelationSchema,
  birthYear: z.number().int().optional(),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  notes: z.string().optional(),
  color: z.string(),
  createdAt: z.string(),
})
export type Person = z.infer<typeof PersonSchema>

export const MedKindSchema = z.enum(["prescription", "otc", "supplement"])
export type MedKind = z.infer<typeof MedKindSchema>

export const FoodRuleSchema = z.enum([
  "any",
  "with_food",
  "before_food",
  "after_food",
  "empty_stomach",
])
export type FoodRule = z.infer<typeof FoodRuleSchema>

export const ScheduleSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("daily"), times: z.array(z.string()) }),
  z.object({
    type: z.literal("weekly"),
    days: z.array(z.number().int().min(0).max(6)),
    times: z.array(z.string()),
  }),
  z.object({
    type: z.literal("every_n_days"),
    every: z.number().int().min(2),
    anchor: z.string(), // YYYY-MM-DD
    times: z.array(z.string()),
  }),
  z.object({ type: z.literal("as_needed") }),
])
export type Schedule = z.infer<typeof ScheduleSchema>

export const MedStatusSchema = z.enum(["active", "paused", "stopped"])
export type MedStatus = z.infer<typeof MedStatusSchema>

export const IngredientUnitSchema = z.enum(["mg", "mcg", "g", "IU", "ml", "other"])
export type IngredientUnit = z.infer<typeof IngredientUnitSchema>

/**
 * One active ingredient in a product, with the amount contained in ONE dose
 * unit (one tablet / one capsule / one 5ml spoon — whatever "dose" below
 * describes). This is what lets Easy Meds add up how much of something a
 * person is really taking across everything on their list.
 */
export const IngredientAmountSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive().optional(),
  unit: IngredientUnitSchema.optional(),
})
export type IngredientAmount = z.infer<typeof IngredientAmountSchema>

export const MedicationSchema = z.object({
  id: z.string(),
  personId: z.string(),
  name: z.string().min(1),
  kind: MedKindSchema,
  strength: z.string().optional(), // e.g. "500 mg"
  dose: z.string().optional(), // e.g. "1 tablet"
  /** Per-unit-dose ingredients, e.g. one tablet = Vitamin C 500 mg + Zinc 10 mg. */
  ingredients: z.array(IngredientAmountSchema).default([]),
  /** How many of that unit dose are taken each time (e.g. 2 tablets per dose). */
  unitsPerDose: z.number().positive().default(1),
  schedule: ScheduleSchema,
  foodRule: FoodRuleSchema.default("any"),
  foodGapMinutes: z.number().int().optional(),
  instructions: z.string().optional(),
  reason: z.string().optional(),
  prescriber: z.string().optional(),
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string().optional(),
  status: MedStatusSchema.default("active"),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Medication = z.infer<typeof MedicationSchema>

export const DoseLogSchema = z.object({
  id: z.string(),
  personId: z.string(),
  medicationId: z.string(),
  scheduledAt: z.string(), // ISO; for as-needed doses this equals takenAt
  loggedAt: z.string(),
  status: z.enum(["taken", "skipped"]),
  note: z.string().optional(),
})
export type DoseLog = z.infer<typeof DoseLogSchema>

export const TextScaleSchema = z.enum(["normal", "large", "xl"])
export type TextScale = z.infer<typeof TextScaleSchema>

export const TEXT_SCALE: Record<TextScale, { label: string; percent: number }> = {
  normal: { label: "Standard", percent: 100 },
  large: { label: "Large", percent: 115 },
  xl: { label: "Extra large", percent: 130 },
}

export const SettingsSchema = z.object({
  remindersEnabled: z.boolean().default(false),
  onboarded: z.boolean().default(false),
  textScale: TextScaleSchema.default("normal"),
  /** Guided tour: index of the current step, or -1 when finished / skipped. */
  tourStep: z.number().int().default(-1),
})
export type Settings = z.infer<typeof SettingsSchema>

export const StoreSchema = z.object({
  version: z.literal(1),
  activePersonId: z.string().nullable(),
  people: z.array(PersonSchema),
  medications: z.array(MedicationSchema),
  logs: z.array(DoseLogSchema),
  settings: SettingsSchema,
})
export type StoreData = z.infer<typeof StoreSchema>

export const PERSON_COLORS = [
  "#5B8A72",
  "#C0704D",
  "#6B7FB3",
  "#B8860B",
  "#8E6BA8",
  "#3F8F9A",
  "#C25B78",
  "#7A8B5A",
]

export const RELATION_LABELS: Record<Relation, string> = {
  self: "Me",
  partner: "Partner",
  parent: "Parent",
  child: "Child",
  grandparent: "Grandparent",
  sibling: "Sibling",
  friend: "Friend",
  other: "Other",
}

export const KIND_LABELS: Record<MedKind, string> = {
  prescription: "Prescription",
  otc: "Over the counter",
  supplement: "Supplement / herbal",
}

export const FOOD_RULE_LABELS: Record<FoodRule, string> = {
  any: "No food restriction",
  with_food: "Take with food",
  before_food: "Take before eating",
  after_food: "Take after eating",
  empty_stomach: "Take on an empty stomach",
}

export function foodRuleHint(rule: FoodRule, gap?: number): string {
  const g = gap ? `${gap} min` : null
  switch (rule) {
    case "with_food":
      return "With a meal or snack"
    case "before_food":
      return g ? `At least ${g} before eating` : "Before eating"
    case "after_food":
      return g ? `About ${g} after eating` : "After eating"
    case "empty_stomach":
      return g
        ? `Empty stomach: ${g} before or 2 h after food`
        : "Empty stomach: 1 h before or 2 h after food"
    default:
      return ""
  }
}
