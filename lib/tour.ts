import type { StoreData } from "./types"

/**
 * Guided tour steps. Cards render INLINE next to their target (via <TourSlot id>)
 * so they scroll with the page and never cover buttons or the keyboard.
 * Steps whose target is a bottom-nav tab dock a card just above the nav.
 */
export type TourStep = {
  /** Page the step lives on. */
  route: string
  /** TourSlot id (inline) or nav-* (docked above the bottom nav). */
  target: string
  title: string
  body: string
  /** The single concrete thing to do, shown prominently. */
  action: string
  /** Label for the manual next button; omit when the action itself advances. */
  nextLabel?: string
  /** Auto-advance once this becomes true. */
  advanceWhen?: (ctx: { pathname: string; data: StoreData; signals: Set<string> }) => boolean
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: "/",
    target: "add-first",
    title: "This is Today",
    body: "Your daily checklist lives here. Let’s put in one thing you take.",
    action: "Tap the “Add medication or supplement” button above",
    advanceWhen: ({ pathname }) => pathname === "/medications/new",
  },
  {
    route: "/medications/new",
    target: "name",
    title: "Copy the label",
    body: "Fastest way: tap “Scan the label” at the top and take a photo — the name, strength, dose and instructions fill in for you to confirm. Or type the name as the box shows it; strength (like 500 mg) and each-dose amount go in the boxes below.",
    action: "Scan the label or type a name, then tap Next",
    nextLabel: "Next",
  },
  {
    route: "/medications/new",
    target: "ingredients",
    title: "Ingredients make it smart",
    body: "For supplements and herbal blends, add each active ingredient. This is what lets Easy Meds spot clashes the product name alone would hide.",
    action: "Optional — add one if you know it, then tap Next",
    nextLabel: "Next",
  },
  {
    route: "/medications/new",
    target: "schedule",
    title: "When and how",
    body: "Pick the days and times. Further down you can add a food rule — with food, before, after, or empty stomach — and it shows on every reminder.",
    action: "Choose a time, then tap Next",
    nextLabel: "Next",
  },
  {
    route: "/medications/new",
    target: "submit",
    title: "Check, then add",
    body: "Nothing goes on the list without a clash check first.",
    action: "Tap the green “Check for clashes, then add” button below",
    advanceWhen: ({ signals }) => signals.has("clash-shown"),
  },
  {
    route: "/medications/new",
    target: "clash-results",
    title: "The clash check",
    body: "Every new item is compared with what’s already on the list: known interactions, the same ingredient twice, your recorded allergies, and the official FDA label.",
    action: "Tap “Add to list” below to keep it",
    advanceWhen: ({ pathname, data }) => pathname === "/" && data.medications.length > 0,
  },
  {
    route: "/",
    target: "dose",
    title: "Tick it off",
    body: "Here’s the dose for today. Tapping the circle logs it as taken and it goes straight into History. Skip means you didn’t take it.",
    action: "Tap the circle on the dose above",
    nextLabel: "Skip this step",
    advanceWhen: ({ data }) => data.logs.length > 0,
  },
  {
    route: "/",
    target: "reminders",
    title: "Reminders",
    body: "Turn these on to get a nudge at each scheduled time. They work while Easy Meds is open or installed on your home screen.",
    action: "Tap Next (you can turn reminders on any time)",
    nextLabel: "Next",
  },
  {
    route: "/",
    target: "nav-check",
    title: "Before you buy anything new",
    body: "The Check tab tests any product against your list without adding it.",
    action: "Tap “Check” in the bar at the bottom",
    advanceWhen: ({ pathname }) => pathname === "/check",
  },
  {
    route: "/check",
    target: "check-form",
    title: "Ask first",
    body: "Type a name, add ingredients if you have them, and tap Check. Great for “a friend recommended this” moments.",
    action: "Have a look, then tap Next",
    nextLabel: "Next",
  },
  {
    route: "/check",
    target: "nav-people",
    title: "The people you look after",
    body: "Parents, children, anyone — each with their own list and allergies.",
    action: "Tap “People” in the bar at the bottom",
    advanceWhen: ({ pathname }) => pathname === "/people",
  },
  {
    route: "/people",
    target: "people-add",
    title: "Add someone",
    body: "Add creates a person and records their allergies — the clash check uses them. Switch between people from the top-right of any page.",
    action: "Tap Next",
    nextLabel: "Next",
  },
  {
    route: "/people",
    target: "summary",
    title: "For the doctor",
    body: "One printable page with everything they want to know: what’s being taken, since when, why, and what was stopped.",
    action: "Tap Next",
    nextLabel: "Next",
  },
  {
    route: "/people",
    target: "nav-history",
    title: "History",
    body: "Every dose taken or skipped is kept here and can be exported. That’s the tour — restart it any time from this page.",
    action: "Tap Finish",
    nextLabel: "Finish",
  },
]
