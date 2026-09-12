"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Hand, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEasyMeds } from "@/lib/store"
import { TOUR_STEPS, type TourStep } from "@/lib/tour"

type TourContextValue = {
  stepIndex: number
  step: TourStep | undefined
  onRoute: boolean
  next: () => void
  finish: () => void
  signal: (name: string) => void
}

const TourContext = React.createContext<TourContextValue>({
  stepIndex: -1,
  step: undefined,
  onRoute: false,
  next: () => {},
  finish: () => {},
  signal: () => {},
})

export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data, hydrated, updateSettings } = useEasyMeds()
  const stepIndex = hydrated ? (data.settings.tourStep ?? -1) : -1
  const step = stepIndex >= 0 ? TOUR_STEPS[stepIndex] : undefined
  const signalsRef = React.useRef<Set<string>>(new Set())
  const [, bump] = React.useReducer((x: number) => x + 1, 0)

  const finish = React.useCallback(() => updateSettings({ tourStep: -1 }), [updateSettings])
  const next = React.useCallback(() => {
    signalsRef.current.clear()
    updateSettings({ tourStep: stepIndex + 1 >= TOUR_STEPS.length ? -1 : stepIndex + 1 })
  }, [stepIndex, updateSettings])
  const signal = React.useCallback((name: string) => {
    if (!signalsRef.current.has(name)) {
      signalsRef.current.add(name)
      bump()
    }
  }, [])

  // Auto-advance when the described action has happened.
  React.useEffect(() => {
    if (!step?.advanceWhen) return
    const check = () => {
      if (step.advanceWhen?.({ pathname, data, signals: signalsRef.current })) next()
    }
    check()
    const i = window.setInterval(check, 400)
    return () => window.clearInterval(i)
  }, [step, pathname, data, next])

  const value = React.useMemo<TourContextValue>(
    () => ({ stepIndex, step, onRoute: !!step && step.route === pathname, next, finish, signal }),
    [stepIndex, step, pathname, next, finish, signal],
  )

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourOffRouteNudge />
      <TourNavCard />
    </TourContext.Provider>
  )
}

export function useTour() {
  return React.useContext(TourContext)
}

/** Call from a page when something the tour waits for has happened. */
export function useTourSignal(name: string, when: boolean) {
  const { signal } = useTour()
  React.useEffect(() => {
    if (when) signal(name)
  }, [when, name, signal])
}

function TourCardBody({ step, stepIndex, next, finish, className }: { step: TourStep; stepIndex: number; next: () => void; finish: () => void; className?: string }) {
  return (
    <div className={cn("em-pop rounded-2xl border-2 border-primary bg-card p-4 shadow-lg", className)} role="note" aria-label={`Tour step ${stepIndex + 1}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
          Step {stepIndex + 1} of {TOUR_STEPS.length}
        </p>
        <button type="button" onClick={finish} className="-mr-1 -mt-1 rounded-full px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted">
          Skip tour
        </button>
      </div>
      <p className="mt-1 text-lg font-extrabold leading-tight">{step.title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{step.body}</p>
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground">
        <Hand className="mt-0.5 size-4 shrink-0" /> {step.action}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-1">
          {TOUR_STEPS.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full", i === stepIndex ? "w-4 bg-primary" : i < stepIndex ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted-foreground/30")} />
          ))}
        </div>
        {step.nextLabel ? (
          <Button size="sm" className="font-bold" onClick={next}>{step.nextLabel}</Button>
        ) : (
          <button type="button" onClick={next} className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline">
            Skip this step
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Place right after the element a step points at. Renders the step card inline
 * when that step is active, and puts a highlight ring on the previous sibling.
 */
export function TourSlot({ id, className }: { id: string; className?: string }) {
  const { step, stepIndex, onRoute, next, finish } = useTour()
  const ref = React.useRef<HTMLDivElement>(null)
  const active = !!step && onRoute && step.target === id

  React.useEffect(() => {
    if (!active) return
    const prev = ref.current?.previousElementSibling as HTMLElement | null
    const target = prev && !prev.hasAttribute("data-tour-spacer") ? prev : null
    target?.classList.add("em-tour-target")
    // Give the layout a beat, then bring target + card into view.
    const t = window.setTimeout(() => {
      ;(target ?? ref.current)?.scrollIntoView({ block: "center", behavior: "smooth" })
    }, 120)
    return () => {
      window.clearTimeout(t)
      target?.classList.remove("em-tour-target")
    }
  }, [active])

  if (!active || !step) return <div ref={ref} hidden />
  return (
    <div ref={ref} className={cn("my-3", className)} data-tour-slot={id}>
      <TourCardBody step={step} stepIndex={stepIndex} next={next} finish={finish} />
    </div>
  )
}

/** Steps that point at a bottom-nav tab: card docked just above the nav. */
function TourNavCard() {
  const { step, stepIndex, onRoute, next, finish } = useTour()
  const active = !!step && onRoute && step.target.startsWith("nav-")

  React.useEffect(() => {
    if (!active || !step) return
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    el?.classList.add("em-tour-target")
    return () => el?.classList.remove("em-tour-target")
  }, [active, step])

  if (!active || !step) return null
  return (
    <div className="em-nav-card fixed inset-x-0 z-40 mx-auto w-[calc(100%-1rem)] max-w-md">
      <TourCardBody step={step} stepIndex={stepIndex} next={next} finish={finish} />
    </div>
  )
}

/** Small nudge when the person wanders off the page the current step lives on. */
function TourOffRouteNudge() {
  const { step, stepIndex, onRoute, finish } = useTour()
  if (!step || onRoute) return null
  return (
    <div className="em-nav-card fixed inset-x-0 z-40 mx-auto w-[calc(100%-1rem)] max-w-md">
      <div className="em-pop flex items-center gap-3 rounded-2xl border border-primary/30 bg-card p-3 shadow-lg">
        <Sparkles className="size-5 shrink-0 text-primary" />
        <p className="flex-1 text-sm">
          <span className="font-bold">Tour paused.</span> Step {stepIndex + 1} of {TOUR_STEPS.length} is on another page.
        </p>
        <Button asChild size="sm" className="font-bold">
          <Link href={step.route}>Go there</Link>
        </Button>
        <button type="button" onClick={finish} aria-label="End tour" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
