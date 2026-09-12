"use client"

import * as React from "react"
import {
  StoreSchema,
  type DoseLog,
  type Medication,
  type Person,
  type Settings,
  type StoreData,
  PERSON_COLORS,
} from "./types"

const STORAGE_KEY = "easy-meds:v1"

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const EMPTY: StoreData = {
  version: 1,
  activePersonId: null,
  people: [],
  medications: [],
  logs: [],
  settings: { remindersEnabled: false, onboarded: false, textScale: "normal", tourStep: -1 },
}

function load(): StoreData {
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = StoreSchema.safeParse(JSON.parse(raw))
    if (parsed.success) return parsed.data
    console.warn("Easy Meds: stored data failed validation, starting fresh", parsed.error)
    return EMPTY
  } catch (err) {
    console.warn("Easy Meds: could not read storage", err)
    return EMPTY
  }
}

function persist(data: StoreData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.warn("Easy Meds: could not save", err)
  }
}

type Action =
  | { type: "hydrate"; data: StoreData }
  | { type: "replace"; data: StoreData }
  | { type: "addPerson"; person: Person }
  | { type: "updatePerson"; id: string; patch: Partial<Person> }
  | { type: "removePerson"; id: string }
  | { type: "setActivePerson"; id: string }
  | { type: "addMedication"; medication: Medication }
  | { type: "updateMedication"; id: string; patch: Partial<Medication> }
  | { type: "removeMedication"; id: string }
  | { type: "upsertLog"; log: DoseLog }
  | { type: "removeLog"; id: string }
  | { type: "updateSettings"; patch: Partial<Settings> }

function reducer(state: StoreData, action: Action): StoreData {
  switch (action.type) {
    case "hydrate":
    case "replace":
      return action.data
    case "addPerson": {
      const people = [...state.people, action.person]
      return {
        ...state,
        people,
        activePersonId: state.activePersonId ?? action.person.id,
      }
    }
    case "updatePerson":
      return {
        ...state,
        people: state.people.map((p) =>
          p.id === action.id ? { ...p, ...action.patch, id: p.id } : p,
        ),
      }
    case "removePerson": {
      const people = state.people.filter((p) => p.id !== action.id)
      return {
        ...state,
        people,
        medications: state.medications.filter((m) => m.personId !== action.id),
        logs: state.logs.filter((l) => l.personId !== action.id),
        activePersonId:
          state.activePersonId === action.id
            ? (people[0]?.id ?? null)
            : state.activePersonId,
      }
    }
    case "setActivePerson":
      return { ...state, activePersonId: action.id }
    case "addMedication":
      return { ...state, medications: [...state.medications, action.medication] }
    case "updateMedication":
      return {
        ...state,
        medications: state.medications.map((m) =>
          m.id === action.id
            ? { ...m, ...action.patch, id: m.id, updatedAt: nowIso() }
            : m,
        ),
      }
    case "removeMedication":
      return {
        ...state,
        medications: state.medications.filter((m) => m.id !== action.id),
        logs: state.logs.filter((l) => l.medicationId !== action.id),
      }
    case "upsertLog": {
      const idx = state.logs.findIndex(
        (l) =>
          l.medicationId === action.log.medicationId &&
          l.scheduledAt === action.log.scheduledAt,
      )
      if (idx === -1) return { ...state, logs: [...state.logs, action.log] }
      const logs = state.logs.slice()
      logs[idx] = { ...action.log, id: logs[idx].id }
      return { ...state, logs }
    }
    case "removeLog":
      return { ...state, logs: state.logs.filter((l) => l.id !== action.id) }
    case "updateSettings":
      return { ...state, settings: { ...state.settings, ...action.patch } }
    default:
      return state
  }
}

type StoreContextValue = {
  data: StoreData
  hydrated: boolean
  activePerson: Person | null
  people: Person[]
  medicationsFor: (personId: string | null) => Medication[]
  logsFor: (personId: string | null) => DoseLog[]
  addPerson: (input: Omit<Person, "id" | "createdAt" | "color"> & { color?: string }) => Person
  updatePerson: (id: string, patch: Partial<Person>) => void
  removePerson: (id: string) => void
  setActivePerson: (id: string) => void
  addMedication: (
    input: Omit<Medication, "id" | "createdAt" | "updatedAt">,
  ) => Medication
  updateMedication: (id: string, patch: Partial<Medication>) => void
  removeMedication: (id: string) => void
  upsertLog: (input: Omit<DoseLog, "id" | "loggedAt">) => void
  removeLog: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  exportJson: () => string
  importJson: (json: string) => { ok: true } | { ok: false; error: string }
  resetAll: () => void
}

const StoreContext = React.createContext<StoreContextValue | null>(null)

export function EasyMedsStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = React.useReducer(reducer, EMPTY)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    dispatch({ type: "hydrate", data: load() })
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (hydrated) persist(data)
  }, [data, hydrated])

  // Keep multiple tabs in sync.
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) dispatch({ type: "hydrate", data: load() })
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const value = React.useMemo<StoreContextValue>(() => {
    const activePerson =
      data.people.find((p) => p.id === data.activePersonId) ?? data.people[0] ?? null
    return {
      data,
      hydrated,
      activePerson,
      people: data.people,
      medicationsFor: (personId) =>
        personId ? data.medications.filter((m) => m.personId === personId) : [],
      logsFor: (personId) =>
        personId ? data.logs.filter((l) => l.personId === personId) : [],
      addPerson: (input) => {
        const person: Person = {
          ...input,
          id: uid(),
          createdAt: nowIso(),
          color:
            input.color ?? PERSON_COLORS[data.people.length % PERSON_COLORS.length],
        }
        dispatch({ type: "addPerson", person })
        return person
      },
      updatePerson: (id, patch) => dispatch({ type: "updatePerson", id, patch }),
      removePerson: (id) => dispatch({ type: "removePerson", id }),
      setActivePerson: (id) => dispatch({ type: "setActivePerson", id }),
      addMedication: (input) => {
        const medication: Medication = {
          ...input,
          id: uid(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }
        dispatch({ type: "addMedication", medication })
        return medication
      },
      updateMedication: (id, patch) => dispatch({ type: "updateMedication", id, patch }),
      removeMedication: (id) => dispatch({ type: "removeMedication", id }),
      upsertLog: (input) =>
        dispatch({ type: "upsertLog", log: { ...input, id: uid(), loggedAt: nowIso() } }),
      removeLog: (id) => dispatch({ type: "removeLog", id }),
      updateSettings: (patch) => dispatch({ type: "updateSettings", patch }),
      exportJson: () => JSON.stringify(data, null, 2),
      importJson: (json) => {
        try {
          const parsed = StoreSchema.safeParse(JSON.parse(json))
          if (!parsed.success) return { ok: false, error: "That file is not an Easy Meds backup." }
          dispatch({ type: "replace", data: parsed.data })
          return { ok: true }
        } catch {
          return { ok: false, error: "Could not read that file." }
        }
      },
      resetAll: () => dispatch({ type: "replace", data: EMPTY }),
    }
  }, [data, hydrated])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useEasyMeds(): StoreContextValue {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useEasyMeds must be used inside EasyMedsStoreProvider")
  return ctx
}
