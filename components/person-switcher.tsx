"use client"

import Link from "next/link"
import { ChevronDown, Plus } from "lucide-react"
import { useEasyMeds } from "@/lib/store"
import { RELATION_LABELS } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PersonAvatar } from "./person-avatar"

export function PersonSwitcher() {
  const { people, activePerson, setActivePerson } = useEasyMeds()
  if (!activePerson) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-semibold shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
        <PersonAvatar person={activePerson} size="sm" />
        <span className="max-w-28 truncate">{activePerson.name}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Whose meds?</DropdownMenuLabel>
        {people.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onSelect={() => setActivePerson(p.id)}
            className="gap-2"
          >
            <PersonAvatar person={p} size="sm" />
            <span className="flex-1 truncate">{p.name}</span>
            <span className="text-xs text-muted-foreground">{RELATION_LABELS[p.relation]}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/people?add=1" className="gap-2">
            <Plus className="size-4" /> Add a person
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
