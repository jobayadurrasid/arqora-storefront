import { useState } from 'react'
import config from '@/config/config'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  className?: string
}

function isOnlineUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const IMG_SIZE_CLASSES: Record<BrandLogoSize, string> = {
  sm: 'h-5 max-w-[120px]',
  md: 'h-8 max-w-[160px]',
  lg: 'h-9 sm:h-10 max-w-[180px]',
}

const TEXT_SIZE_CLASSES: Record<BrandLogoSize, string> = {
  sm: 'text-xs tracking-widest',
  md: 'text-xl sm:text-2xl tracking-[0.22em]',
  lg: 'text-2xl sm:text-3xl tracking-[0.22em]',
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const logoValue = config.app.logo
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const imageFailed = failedUrl === logoValue
  const shouldRenderImage = isOnlineUrl(logoValue) && !imageFailed

  if (shouldRenderImage) {
    return (
      <img
        src={logoValue}
        alt={config.app.name}
        referrerPolicy="no-referrer"
        onError={() => {
          console.warn(
            `[BrandLogo] Failed to load online image from VITE_LOGO="${logoValue}". Ensure it is a direct image URL (e.g. https://.../logo.png or .svg), not an HTML webpage.`
          )
          setFailedUrl(logoValue)
        }}
        className={`object-contain w-auto ${IMG_SIZE_CLASSES[size]} ${className}`.trim()}
      />
    )
  }

  const displayText = imageFailed ? config.app.name || 'ARQORA' : logoValue
  const isArqora = displayText.trim().toUpperCase() === 'ARQORA'

  return (
    <span
      className={`inline-block font-bold uppercase text-secondary ${TEXT_SIZE_CLASSES[size]} ${className}`.trim()}
    >
      {isArqora ? (
        <>
          A<span className="text-action">R</span>QO
          <span className="text-action">R</span>A
        </>
      ) : (
        displayText
      )}
    </span>
  )
}
