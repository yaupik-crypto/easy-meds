"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HeartHandshake, ShieldCheck, BellRing, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEasyMeds } from "@/lib/store"
import { EASY_MEDS } from "@/lib/config"

export function Welcome() {
  const router = useRouter()
  const { addPerson, updateSettings } = useEasyMeds()
  const [name, setName] = React.useState("")

  const start = (e: React.FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    addPerson({ name: n, relation: "self" })
    updateSettings({ onboarded: true, tourStep: 0 })
    router.push("/")
  }

  return (
    <div className="em-pop space-y-6 py-6">
      <div className="space-y-2 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Welcome to</p>
        <h1 className="text-4xl font-extrabold tracking-tight">{EASY_MEDS.name}</h1>
        <p className="mx-auto max-w-sm text-balance text-muted-foreground">{EASY_MEDS.tagline}</p>
      </div>

      <ul className="grid gap-3">
        {[
          [HeartHandshake, "Everything in one place", "Prescriptions, over-the-counter and supplements, with dose and food instructions — for you and the people you care for."],
          [ShieldCheck, "Check before you add", "Each new item is checked against the existing list for known clashes and double-ups."],
          [BellRing, "Gentle reminders", "A clear list of what is due today, with “before food” and “empty stomach” hints built in."],
          [Users, "Family friendly", "Switch between yourself, parents and children in one tap."],
        ].map(([Icon, title, body]) => {
          const I = Icon as typeof HeartHandshake
          return (
            <li key={title as string} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <I className="size-5" />
              </span>
              <div>
                <p className="font-bold">{title as string}</p>
                <p className="text-sm text-muted-foreground">{body as string}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <form onSubmit={start} className="space-y-3 rounded-2xl border border-primary/30 bg-card p-4 shadow-sm">
        <Label htmlFor="welcome-name" className="font-bold">What should we call you?</Label>
        <Input
          id="welcome-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
          autoComplete="given-name"
        />
        <Button type="submit" size="lg" className="w-full font-bold" disabled={!name.trim()}>
          Let’s go
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Everything stays on this device. Nothing is uploaded.
        </p>
      </form>
    </div>
  )
}
