"use client"

import { cn } from "@/lib/utils"
import { useEasyMeds } from "@/lib/store"
import { TEXT_SCALE, type TextScale } from "@/lib/types"

export function TextSizeControl() {
  const { data, updateSettings } = useEasyMeds()
  const current = data.settings.textScale ?? "normal"
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Text size">
      {(Object.keys(TEXT_SCALE) as TextScale[]).map((k) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={current === k}
          onClick={() => updateSettings({ textScale: k })}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center rounded-xl border px-2 py-2 font-bold transition-colors",
            current === k
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted",
          )}
        >
          <span style={{ fontSize: `${TEXT_SCALE[k].percent}%` }}>Aa</span>
          <span className="text-[11px] font-semibold">{TEXT_SCALE[k].label}</span>
        </button>
      ))}
    </div>
  )
}
