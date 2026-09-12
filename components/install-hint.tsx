"use client"

import * as React from "react"
import { Share, Smartphone, X } from "lucide-react"

/**
 * Nudges phone users to add Easy Meds to their home screen so it opens like
 * an app. Hidden once installed (standalone mode) or dismissed.
 */
export function InstallHint() {
  const [state, setState] = React.useState<"hidden" | "ios" | "android">("hidden")

  React.useEffect(() => {
    try {
      if (localStorage.getItem("easy-meds:install-hint") === "dismissed") return
    } catch {}
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) return
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) setState("ios")
    else if (/Android/.test(ua)) setState("android")
  }, [])

  if (state === "hidden") return null

  const dismiss = () => {
    try {
      localStorage.setItem("easy-meds:install-hint", "dismissed")
    } catch {}
    setState("hidden")
  }

  return (
    <div className="relative rounded-2xl border border-primary/30 bg-accent/60 p-4 pr-10 text-sm">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground hover:bg-black/5"
      >
        <X className="size-4" />
      </button>
      <p className="flex items-center gap-1.5 font-bold">
        <Smartphone className="size-4 text-primary" /> Put Easy Meds on your home screen
      </p>
      {state === "ios" ? (
        <p className="mt-1 text-muted-foreground">
          In Safari tap <Share className="inline size-3.5 align-text-bottom" /> Share, then{" "}
          <strong>Add to Home Screen</strong>. It opens full-screen like an app and reminders work better.
        </p>
      ) : (
        <p className="mt-1 text-muted-foreground">
          In Chrome open the ⋮ menu and choose <strong>Add to Home screen</strong> or{" "}
          <strong>Install app</strong>.
        </p>
      )}
    </div>
  )
}
