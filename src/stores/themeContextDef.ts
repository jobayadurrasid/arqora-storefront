import { createContext, useContext } from 'react'
import type { ThemeDefinition, ThemeId } from '@/config/themes'

export interface ThemeContextType {
  theme: ThemeId
  themes: ThemeDefinition[]
  setTheme: (theme: ThemeId) => void
  resetTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
