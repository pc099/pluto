'use client'
import React from 'react'
import Image from 'next/image'
import PlutoWordmark from '../../layouts/Pluto.svg'
import PlutoMascot from '../../layouts/Elle.png'

interface PlutoLogoProps {
  size?: number
  className?: string
  showText?: boolean
  iconOnly?: boolean
}

export default function PlutoLogo({ size = 40, className = "", showText = true, iconOnly = false }: PlutoLogoProps) {
  const logoHeight = size
  const aspectRatio = iconOnly ? 1 : 4
  const logoWidth = Math.round(logoHeight * aspectRatio)
  const image = iconOnly ? PlutoMascot : PlutoWordmark
  const altText = iconOnly ? 'Pluto mascot logo' : 'Pluto wordmark'

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo image */}
      <div className="relative flex items-center" style={{ height: logoHeight }}>
        <Image
          src={image}
          alt={altText}
          width={logoWidth}
          height={logoHeight}
          className="h-full w-auto"
          priority
        />
      </div>

      {/* Logo Text */}
      {showText && !iconOnly && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-primary">
            Pluto
          </span>
          <span className="text-xs text-gray-500 -mt-1">AI Platform</span>
        </div>
      )}
    </div>
  )
}
