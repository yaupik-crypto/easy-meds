import { AlertOctagon, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { SEVERITY_LABELS, type Severity } from "@/lib/interactions"

const STYLES: Record<Severity, { color: string; bg: string; Icon: typeof Info }> = {
  avoid: { color: "var(--em-avoid)", bg: "var(--em-avoid-bg)", Icon: AlertOctagon },
  caution: { color: "var(--em-caution)", bg: "var(--em-caution-bg)", Icon: AlertTriangle },
  info: { color: "var(--em-info)", bg: "var(--em-info-bg)", Icon: Info },
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const s = STYLES[severity]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        className,
      )}
      style={{ color: s.color, background: s.bg }}
    >
      <s.Icon className="size-3" />
      {SEVERITY_LABELS[severity]}
    </span>
  )
}

export function severityStyle(severity: Severity) {
  return STYLES[severity]
}
