import { cn } from "@/lib/utils"
import type { Person } from "@/lib/types"

export function PersonAvatar({
  person,
  size = "md",
  className,
}: {
  person: Pick<Person, "name" | "color">
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const initials = person.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold text-white",
        size === "sm" && "size-7 text-[11px]",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-14 text-lg",
        className,
      )}
      style={{ background: person.color }}
    >
      {initials || "?"}
    </span>
  )
}
