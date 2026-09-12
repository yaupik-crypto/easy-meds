import { z } from "zod/v4"

/** What the photo reader returns. Empty strings / arrays mean "not on the label". */
export const LabelReadSchema = z.object({
  name: z.string().describe("Product or drug name as printed, e.g. 'Panadol', 'Amoxicillin', 'Nature's Way Vitamin D3'. Empty if unreadable."),
  strength: z.string().describe("Strength per unit as printed, e.g. '500 mg', '1000 IU', '5 mg/5 ml'. Empty if not shown. Never guess."),
  dose: z.string().describe("Amount per dose in plain words, e.g. '1 tablet', '2 capsules', '5 ml'. Empty if not shown."),
  kind: z.enum(["prescription", "otc", "supplement", "unknown"]).describe("prescription = dispensed by a clinic/pharmacy with a patient name or doctor; otc = over-the-counter medicine; supplement = vitamin/herbal/nutritional product."),
  ingredients: z.array(z.string()).describe("Active ingredients as printed, one per entry, without amounts. Empty if not shown."),
  timesPerDay: z.number().int().min(0).max(6).describe("How many times per day, from wording like 'twice daily', 'tid', '每日三次'. 0 if unknown or as-needed."),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).describe("Only if the label restricts to certain weekdays (0=Sunday). Usually empty."),
  everyNDays: z.number().int().min(0).describe("If taken every N days (e.g. weekly = 7). 0 if daily or unknown."),
  asNeeded: z.boolean().describe("True if wording says as needed / when necessary / prn / 需要時."),
  foodRule: z.enum(["any", "with_food", "before_food", "after_food", "empty_stomach", "unknown"]).describe("Food instruction on the label. 'unknown' if none printed."),
  foodGapMinutes: z.number().int().min(0).describe("Minutes before/after food if stated (e.g. 30). 0 if not stated."),
  instructions: z.string().describe("Other instructions printed on the label, e.g. 'Avoid alcohol', 'Do not lie down for 30 minutes', 'Complete the course'. Empty if none."),
  reason: z.string().describe("What it is for, only if printed (e.g. 'for pain', '高血壓'). Empty otherwise."),
  prescriber: z.string().describe("Doctor, clinic or pharmacy name if printed. Empty otherwise."),
  patientName: z.string().describe("Patient name if printed on a dispensing label. Empty otherwise."),
  courseDays: z.number().int().min(0).describe("Length of course in days if printed (e.g. '7 days'). 0 otherwise."),
  language: z.string().describe("Main language of the label, e.g. 'en', 'zh-Hant', 'mixed'."),
  confidence: z.enum(["high", "medium", "low"]).describe("high = crisp, fully readable; medium = mostly readable; low = blurry, partial or not a medication label."),
  notes: z.string().describe("One short sentence for the person about anything uncertain or unreadable. Empty if everything was clear."),
})
export type LabelRead = z.infer<typeof LabelReadSchema>
