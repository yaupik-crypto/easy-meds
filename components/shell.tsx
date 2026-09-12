"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarCheck, Pill, ShieldCheck, Users, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { EASY_MEDS } from "@/lib/config"
import { TEXT_SCALE } from "@/lib/types"
import { useEasyMeds } from "@/lib/store"
import { Toaster } from "@/components/ui/sonner"
import { PersonSwitcher } from "./person-switcher"
import { ReminderRunner } from "./reminder-runner"
import { TourProvider } from "./tour"

const NAV = [
  { href: "/", label: "Today", icon: CalendarCheck, exact: true, tour: "nav-today" },
  { href: "/medications", label: "Meds", icon: Pill, tour: "nav-meds" },
  { href: "/check", label: "Check", icon: ShieldCheck, tour: "nav-check" },
  { href: "/history", label: "History", icon: Clock, tour: "nav-history" },
  { href: "/people", label: "People", icon: Users, tour: "nav-people" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { hydrated, data } = useEasyMeds()
  const scale = TEXT_SCALE[data.settings.textScale ?? "normal"].percent

  return (
    <TourProvider>
    <div
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col"
      style={{ fontSize: `${scale}%` }}
    >
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">{EASY_MEDS.name}</span>
          </Link>
          <PersonSwitcher />
        </div>
      </header>

      <main className="em-safe-bottom flex-1 px-4 pt-4">
        {hydrated ? children : <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>}
      </main>

      <nav className="em-nav fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md">
        <ul className="mx-auto grid max-w-2xl grid-cols-5">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-tour={item.tour}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-12 place-items-center rounded-full transition-colors",
                      active && "bg-accent",
                    )}
                  >
                    <item.icon className="size-5" />
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <ReminderRunner />
      <Toaster position="top-center" richColors />
    </div>
    </TourProvider>
  )
}
