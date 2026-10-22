import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeContextValue } from './theme-context'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'h-immo-vitrine-theme'

function getInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Le thème système reste disponible si le navigateur bloque le stockage local.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#101918' : '#f3f7f5',
    )

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // L’application fonctionne aussi lorsque la préférence ne peut pas être mémorisée.
    }
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light') }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
