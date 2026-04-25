import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

export type ThemeMode = 'dark' | 'light'

type ThemeContextValue = {
  themeMode: ThemeMode
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'growth-tree-os.theme'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function readInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(readInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.documentElement.style.colorScheme = themeMode
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  }, [themeMode])

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      toggleTheme: () => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))
    }),
    [themeMode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeMode() {
  const value = useContext(ThemeContext)
  if (!value) {
    throw new Error('useThemeMode must be used inside ThemeProvider')
  }
  return value
}
