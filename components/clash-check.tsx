"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, Layers, ShieldAlert } from "lucide-react"
import type { DoseLog, Medication, Schedule } from "@/lib/types"
import {
  findAllergyMatches,
  findCuratedClashes,
  findOverlaps,
  findSoloCautions,
  type ClashFinding,
  type OverlapFinding,
  type SoloCaution,
} from "@/lib/interactions"
import { fetchLabel, findLabelMentions, type LabelInfo, type LabelMention } from "@/lib/openfda"
import { computeCumulativeFindings, impliedDosesToday, type CumulativeFinding } from "@/lib/cumulative"
import { todayKey } from "@/lib/store"
import { SeverityBadge, severityStyle } from "./severity"

type Candidate = Pick<Medication, "id" | "name" | "ingredients"> & { unitsPerDose?: number; schedule?: Schedule }
type Existing = Medication

export type ClashReport = {
  curated: ClashFinding[]
  overlaps: OverlapFinding[]
  allergies: string[]
  solo: (SoloCaution & { agentLabel: string })[]
  cumulative: CumulativeFinding[]
  label: LabelInfo | null | undefined // undefined = still loading
  mentions: LabelMention[]
  labelError: string | null
}

export function useClashReport(
  candidate: Candidate | null,
  existing: Existing[],
  personAllergies?: string,
  logs: DoseLog[] = [],
): ClashReport {
  const [label, setLabel] = React.useState<LabelInfo | null | undefined>(undefined)
  const [labelError, setLabelError] = React.useState<string | null>(null)
  const name = candidate?.name.trim() ?? ""
  const ingredientsKey = (candidate?.ingredients ?? []).join("|")

  React.useEffect(() => {
    if (!name || name.length < 3) {
      setLabel(null)
      return
    }
    const ctrl = new AbortController()
    setLabel(undefined)
    setLabelError(null)
    const t = window.setTimeout(() => {
      fetchLabel(name, ingredientsKey ? ingredientsKey.split("|") : [], ctrl.signal)
        .then((l) => setLabel(l))
        .catch((err: unknown) => {
          if ((err as Error).name === "AbortError") return
          setLabel(null)
          setLabelError("Could not reach the FDA label service.")
        })
    }, 500)
    return () => {
      window.clearTimeout(t)
      ctrl.abort()
    }
  }, [name, ingredientsKey])

  return React.useMemo(() => {
    if (!candidate) return { curated: [], overlaps: [], allergies: [], solo: [], cumulative: [], label: null, mentions: [], labelError: null }
    const curated = findCuratedClashes(candidate, existing)
    const overlaps = findOverlaps(candidate, existing)
    const allergies = findAllergyMatches(candidate, personAllergies)
    const solo = findSoloCautions(candidate)
    const mentions = label ? findLabelMentions(label, existing) : []
    const dateKey = todayKey()
    const dosesToday = candidate.schedule ? impliedDosesToday(candidate.schedule, dateKey) : 1
    const cumulative = computeCumulativeFindings(candidate, dosesToday, existing, logs, dateKey)
    return { curated, overlaps, allergies, solo, cumulative, label, mentions, labelError }
  }, [candidate, existing, label, labelError, personAllergies, logs])
}

export function ClashResults({
  report,
  candidateName,
  compact = false,
}: {
  report: ClashReport
  candidateName: string
  compact?: boolean
}) {
  const { curated, overlaps, allergies, solo, cumulative, label, mentions, labelError } = report
  const nothingFound =
    curated.length === 0 && overlaps.length === 0 && mentions.length === 0 && allergies.length === 0 && solo.length === 0 && cumulative.length === 0
  const loading = label === undefined

  return (
    <div className="space-y-3">
      {allergies.length > 0 && (
        <div className="em-pop rounded-xl border p-4" style={{ borderColor: "var(--em-avoid)", background: "var(--em-avoid-bg)" }}>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity="avoid" />
            <span className="text-sm font-bold">Listed allergy: {allergies.join(", ")}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            {candidateName} matches something recorded under this person’s allergies.
          </p>
          <p className="mt-1.5 text-sm font-semibold" style={{ color: "var(--em-avoid)" }}>
            Do not take without checking with a doctor or pharmacist.
          </p>
        </div>
      )}

      {cumulative.map((f, i) => {
        const s = severityStyle(f.severity)
        const pct = Math.round((f.total / f.ul) * 100)
        return (
          <div key={`cum${i}`} className="em-pop rounded-xl border p-4" style={{ borderColor: s.color, background: s.bg }}>
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={f.severity} />
              <span className="inline-flex items-center gap-1 text-sm font-bold">
                <AlertTriangle className="size-3.5" /> Today’s {f.label}: {Math.round(f.total)} {f.unit}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              {f.existingTotal > 0 && f.candidateContribution > 0
                ? `${Math.round(f.existingTotal)} ${f.unit} already today + ${Math.round(f.candidateContribution)} ${f.unit} from this = ${Math.round(f.total)} ${f.unit}.`
                : `This item alone comes to ${Math.round(f.total)} ${f.unit} today.`}{" "}
              {f.severity === "avoid"
                ? `That's over the ${f.ul} ${f.unit}/day guideline (${pct}%).`
                : f.severity === "caution"
                  ? `That's above the ${f.caution} ${f.unit} caution level (guideline limit is ${f.ul} ${f.unit}/day).`
                  : `That's ${pct}% of the ${f.ul} ${f.unit}/day guideline — still under it, worth keeping an eye on.`}
            </p>
            <p className="mt-1.5 text-sm font-semibold" style={{ color: s.color }}>{f.note}</p>
          </div>
        )
      })}

      {solo.map((c, i) => {
        const s = severityStyle(c.severity)
        return (
          <div key={`s${i}`} className="em-pop rounded-xl border p-4" style={{ borderColor: s.color, background: s.bg }}>
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={c.severity} />
              <span className="inline-flex items-center gap-1 text-sm font-bold">
                <ShieldAlert className="size-3.5" /> About {c.agentLabel}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{c.summary}</p>
            <p className="mt-1.5 text-sm font-semibold" style={{ color: s.color }}>{c.advice}</p>
          </div>
        )
      })}
      {curated.map((f, i) => {
        const s = severityStyle(f.severity)
        return (
          <div
            key={i}
            className="em-pop rounded-xl border p-4"
            style={{ borderColor: s.color, background: s.bg }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={f.severity} />
              <span className="text-sm font-bold">
                {f.candidate.name} <span className="text-muted-foreground">+</span> {f.other.name}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{f.summary}</p>
            <p className="mt-1.5 text-sm font-semibold" style={{ color: s.color }}>
              {f.advice}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Matched as {f.agentA} + {f.agentB} · curated rule
            </p>
          </div>
        )
      })}

      {overlaps.map((o, i) => (
        <div
          key={`o${i}`}
          className="em-pop rounded-xl border p-4"
          style={{ borderColor: "var(--em-caution)", background: "var(--em-caution-bg)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              style={{ color: "var(--em-caution)", background: "#fff" }}
            >
              <Layers className="size-3" /> Double up
            </span>
            <span className="text-sm font-bold">
              {o.candidate.name} <span className="text-muted-foreground">+</span> {o.other.name}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            Both contain <strong>{o.shared.join(", ")}</strong>. Taking both could mean taking more than intended.
          </p>
        </div>
      ))}

      {mentions.map((m, i) => (
        <div
          key={`m${i}`}
          className="em-pop rounded-xl border p-4"
          style={{ borderColor: "var(--em-info)", background: "var(--em-info-bg)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity="info" />
            <span className="text-sm font-bold">
              The {label?.brandName ?? candidateName} label mentions {m.other.name}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">“{m.excerpt}”</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Matched “{m.matchedTerm}” in the FDA prescribing information. Read the full section below.
          </p>
        </div>
      ))}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Checking the FDA label for {candidateName}…
        </div>
      )}

      {!loading && nothingFound && (
        <div
          className="em-pop flex items-start gap-3 rounded-xl border p-4"
          style={{ borderColor: "var(--em-ok)", background: "var(--em-ok-bg)" }}
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" style={{ color: "var(--em-ok)" }} />
          <div className="text-sm">
            <p className="font-bold">No known clashes found</p>
            <p className="mt-1 text-muted-foreground">
              Nothing in the curated rules{label ? " or the FDA label" : ""} flags {candidateName} against
              this list. That is reassuring, not a guarantee — a pharmacist can double-check.
            </p>
          </div>
        </div>
      )}

      {!loading && !compact && (
        <div className="rounded-xl bg-muted/70 p-4 text-xs text-muted-foreground">
          {label ? (
            <details>
              <summary className="cursor-pointer font-semibold text-foreground">
                FDA label found: {label.brandName ?? label.genericName ?? candidateName}
                {label.genericName && label.brandName ? ` (${label.genericName})` : ""}
              </summary>
              <div className="mt-3 space-y-3">
                <LabelSection title="Drug interactions" text={label.interactionsText} />
                <LabelSection title="Food, alcohol & timing" text={label.foodText} />
                <LabelSection title="Warnings" text={label.warningsText} />
                <a
                  className="inline-flex items-center gap-1 font-semibold text-primary"
                  href={`https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(label.brandName ?? candidateName)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on DailyMed <ExternalLink className="size-3" />
                </a>
              </div>
            </details>
          ) : labelError ? (
            <p>{labelError} Curated rules were still checked.</p>
          ) : (
            <p>
              No FDA label found for “{candidateName}”. Most supplements and non-US products are not
              in that database, so only the curated rules were checked.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function LabelSection({ title, text }: { title: string; text: string[] }) {
  if (!text.length) return null
  const body = text.join("\n\n")
  return (
    <div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-line leading-relaxed">
        {body.length > 2500 ? body.slice(0, 2500) + "…" : body}
      </p>
    </div>
  )
}
