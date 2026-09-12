# Easy Meds

A medication and supplement organiser that lives at `/easy-meds`.

**What it does today**

- People: yourself plus anyone you care for (parents, children…), each with their own list.
- Medications & supplements: name, strength, dose, active ingredients, schedule (daily / certain days / every N days / as needed), food rule (with food, before, after, empty stomach + gap), instructions, reason, prescriber, start/end dates, active / paused / stopped.
- Today: dose checklist grouped by time of day, progress, overdue markers, food hints, as-needed logging.
- Clash check: every new item is checked before it is added, and any product can be checked without adding it.
  1. Curated rules (`lib/easy-meds/interactions.ts`) — documented drug/supplement interactions with severity, plain-English summary and advice.
  2. Double-ups — same ingredient in two products.
  3. openFDA label text — the official label's "drug interactions" / "warnings" sections searched for the other items.
- Reminders: notification + in-app toast at each dose time while the app is open or installed (Notification API).
- History: every taken/skipped dose, exportable as CSV to show a doctor.
- Backup / restore as JSON. All data is stored in the browser (`localStorage`), nothing is uploaded.
- Installable PWA (manifest + icons in `public/easy-meds/`).
- Guided first-run tour (`lib/easy-meds/tour.ts`): inline coach-mark cards placed next to each target via `<TourSlot>`, auto-advancing on the described action; restartable from People.
- **Scan the label**: photo → `POST /api/easy-meds/read-label` (Claude vision, structured output) → confirm dialog → form prefilled. Needs `ANTHROPIC_API_KEY` in the server environment; without it the button shows a friendly "not switched on" message.

**Layout**

```
app/easy-meds/            routes (Today, medications, check, history, people, about) + scoped theme
components/easy-meds/     shell, forms, dose card, clash results
lib/easy-meds/            types (zod), store (context + localStorage), schedule, interactions, openfda, reminders, config
```

Copy and dedication text lives in `lib/easy-meds/config.ts`.

**Natural next steps**

- Photo of the label → auto-fill name, strength and ingredients (OCR / vision model).
- Server-side push so reminders arrive with the app closed.
- Sync between devices (e.g. Supabase) so a carer and the person share one list.
- LLM-backed second opinion on clashes for products with no FDA label.
