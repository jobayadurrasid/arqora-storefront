export type ThemeId = 'classic' | 'midnight' | 'sand' | 'forest' | 'ocean'

export interface ThemeDefinition {
  id: ThemeId
  label: string
  description: string
  preview: {
    primary: string
    secondary: string
    action: string
  }
}

export const DEFAULT_THEME: ThemeId = 'classic'
export const THEME_STORAGE_KEY = 'arqora_theme'

export const THEMES: ThemeDefinition[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'White, Black & Orange',
    preview: { primary: '#ffffff', secondary: '#000000', action: '#d07601' },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Dark Charcoal & Amber',
    preview: { primary: '#0c0c0e', secondary: '#f5f5f5', action: '#ea8a0c' },
  },
  {
    id: 'sand',
    label: 'Warm Sand',
    description: 'Cream, Espresso & Bronze',
    preview: { primary: '#f7f4ef', secondary: '#1f1b18', action: '#b45309' },
  },
  {
    id: 'forest',
    label: 'Forest',
    description: 'Mint White, Pine & Emerald',
    preview: { primary: '#f6f8f6', secondary: '#14261c', action: '#15803d' },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Slate White, Navy & Cobalt',
    preview: { primary: '#f8fafc', secondary: '#0f172a', action: '#2563eb' },
  },
]

export function isValidTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEMES.some((t) => t.id === value)
}

export function resolveInitialTheme(configuredTheme?: string): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (isValidTheme(saved)) {
      return saved
    }
  } catch {
    // Ignore storage access errors
  }

  if (isValidTheme(configuredTheme)) {
    return configuredTheme
  }

  return DEFAULT_THEME
}

export function applyThemeToDocument(theme: ThemeId): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}
