'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface TropeRecord {
  readonly idx: string
  readonly label?: string
  readonly core: boolean
}

interface DevContextValue {
  readonly tropes: ReadonlyArray<TropeRecord>
  readonly disabled: ReadonlySet<string>
  readonly panelOpen: boolean
  readonly register: (record: TropeRecord) => void
  readonly unregister: (idx: string) => void
  readonly setEnabled: (idx: string, enabled: boolean) => void
  readonly resetAll: () => void
  readonly togglePanel: () => void
  readonly setPanelOpen: (open: boolean) => void
}

const DevContext = createContext<DevContextValue | null>(null)

const STORAGE_KEY = 'lf-dev-disabled-tropes'

function readDisabled(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr.filter((x): x is string => typeof x === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

function writeDisabled(set: ReadonlySet<string>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)))
  } catch {}
}

export function DevProvider({ children }: { children: ReactNode }) {
  const [tropes, setTropes] = useState<ReadonlyArray<TropeRecord>>([])
  const [disabled, setDisabled] = useState<ReadonlySet<string>>(() => new Set())
  const [panelOpen, setPanelOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDisabled(readDisabled())
    setHydrated(true)
  }, [])

  const register = useCallback((record: TropeRecord) => {
    setTropes((prev) => {
      const existing = prev.find((t) => t.idx === record.idx)
      if (existing) {
        if (existing.core === record.core && existing.label === record.label) return prev
        return prev.map((t) => (t.idx === record.idx ? { ...t, ...record } : t))
      }
      return [...prev, record]
    })
  }, [])

  const unregister = useCallback((idx: string) => {
    setTropes((prev) => prev.filter((t) => t.idx !== idx))
  }, [])

  const setEnabled = useCallback((idx: string, enabled: boolean) => {
    setDisabled((prev) => {
      const next = new Set(prev)
      if (enabled) next.delete(idx)
      else next.add(idx)
      writeDisabled(next)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setDisabled(() => {
      const next = new Set<string>()
      writeDisabled(next)
      return next
    })
  }, [])

  const togglePanel = useCallback(() => setPanelOpen((v) => !v), [])

  const value = useMemo<DevContextValue>(
    () => ({
      tropes,
      disabled: hydrated ? disabled : new Set<string>(),
      panelOpen,
      register,
      unregister,
      setEnabled,
      resetAll,
      togglePanel,
      setPanelOpen,
    }),
    [tropes, disabled, hydrated, panelOpen, register, unregister, setEnabled, resetAll, togglePanel],
  )

  return <DevContext.Provider value={value}>{children}</DevContext.Provider>
}

export function useDev(): DevContextValue {
  const ctx = useContext(DevContext)
  if (!ctx) {
    return {
      tropes: [],
      disabled: new Set(),
      panelOpen: false,
      register: () => {},
      unregister: () => {},
      setEnabled: () => {},
      resetAll: () => {},
      togglePanel: () => {},
      setPanelOpen: () => {},
    }
  }
  return ctx
}

export const IS_DEV = process.env.NODE_ENV === 'development'
