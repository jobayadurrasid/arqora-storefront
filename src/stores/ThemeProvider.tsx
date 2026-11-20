import { useState, useEffect, useCallback, type ReactNode } from 'react'
import config from '@/config/config'
import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  applyThemeToDocument,
  isValidTheme,
  resolveInitialTheme,
  type ThemeId,
} from '@/config/themes'
import { ThemeContext } from './themeContextDef'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() =>
    resolveInitialTheme(config.app.theme)
  )

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Ignore storage write errors
    }
  }, [])

  const resetTheme = useCallback(() => {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY)
    } catch {
      // Ignore storage remove errors
    }
    const fallback = isValidTheme(config.app.theme)
      ? config.app.theme
      : DEFAULT_THEME
    setThemeState(fallback)
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes: THEMES,
        setTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
