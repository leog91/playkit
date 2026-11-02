import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { civilizations } from '@/features/games/age-of-empires-ii/data'

type Preferences = { favorites: string[]; compact: boolean }
const defaults: Preferences = { favorites: [], compact: false }
const key = 'playkit:preferences:v1'
const validIds = new Set(civilizations.map((civ) => civ.id))
const Context = createContext<{
  preferences: Preferences
  ready: boolean
  storageError: boolean
  toggleFavorite: (id: string) => void
  setCompact: (value: boolean) => void
} | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaults)
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          const value = parsed as Record<string, unknown>
          setPreferences({
            favorites: Array.isArray(value.favorites)
              ? [
                  ...new Set(
                    value.favorites.filter(
                      (id): id is string =>
                        typeof id === 'string' && validIds.has(id),
                    ),
                  ),
                ]
              : [],
            compact: value.compact === true,
          })
        }
      }
    } catch {
      setStorageError(true)
    }
    setReady(true)
  }, [])
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(key, JSON.stringify(preferences))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [preferences, ready])

  return (
    <Context.Provider
      value={{
        preferences,
        ready,
        storageError,
        toggleFavorite: (id) => {
          if (!ready || !validIds.has(id)) return
          setPreferences((previous) => ({
            ...previous,
            favorites: previous.favorites.includes(id)
              ? previous.favorites.filter((item) => item !== id)
              : [...previous.favorites, id],
          }))
        },
        setCompact: (compact) => {
          if (ready) setPreferences((previous) => ({ ...previous, compact }))
        },
      }}
    >
      {children}
    </Context.Provider>
  )
}

export function usePreferences() {
  const value = useContext(Context)
  if (!value) throw new Error('PreferencesProvider is required')
  return value
}
