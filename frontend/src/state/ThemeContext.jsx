import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ipt.theme.v1'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    return 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    const effective = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme

    root.classList.toggle('dark', effective === 'dark')
    root.dataset.theme = effective
  }, [theme])

  const value = useMemo(() => {
    function set(next) {
      setTheme(next)
      localStorage.setItem(STORAGE_KEY, next)
    }
    function toggle() {
      set(theme === 'dark' ? 'light' : 'dark')
    }
    return { theme, setTheme: set, toggle }
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

