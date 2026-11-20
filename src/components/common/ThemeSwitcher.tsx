import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/stores/themeContextDef'

export function ThemeSwitcher() {
  const { theme, themes, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeTheme = themes.find((t) => t.id === theme) || themes[0]

  useEffect(() => {
    if (!isOpen) return

    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Theme: ${activeTheme.label}`}
        className="border border-secondary/20 bg-surface text-secondary hover:border-secondary rounded-md px-2.5 py-1.5 text-xs font-medium flex items-center gap-2 cursor-pointer transition"
      >
        <span className="flex items-center -space-x-1" aria-hidden="true">
          <span
            className="w-3 h-3 rounded-full border border-secondary/25"
            style={{ backgroundColor: activeTheme.preview.primary }}
          />
          <span
            className="w-3 h-3 rounded-full border border-secondary/25"
            style={{ backgroundColor: activeTheme.preview.secondary }}
          />
          <span
            className="w-3 h-3 rounded-full border border-secondary/25"
            style={{ backgroundColor: activeTheme.preview.action }}
          />
        </span>
        <span className="hidden sm:inline">{activeTheme.label}</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select theme"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-secondary/15 bg-surface shadow-lg p-1.5 z-50"
        >
          {themes.map((item) => {
            const isSelected = item.id === theme
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setTheme(item.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-muted text-secondary'
                    : 'text-secondary hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex items-center -space-x-1 shrink-0" aria-hidden="true">
                    <span
                      className="w-3 h-3 rounded-full border border-secondary/25"
                      style={{ backgroundColor: item.preview.primary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-secondary/25"
                      style={{ backgroundColor: item.preview.secondary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-secondary/25"
                      style={{ backgroundColor: item.preview.action }}
                    />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-secondary truncate">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-secondary/55 truncate">
                      {item.description}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <span className="text-xs font-bold text-action shrink-0" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
