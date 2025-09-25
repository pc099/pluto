'use client'
import React from 'react'

interface PlutoLogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export default function PlutoLogo({ size = 40, className = '', showText = true }: PlutoLogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo SVG */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="drop-shadow-lg"
        >
          {/* Background circle (space) */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="url(#spaceGradient)"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
          
          {/* Pluto planet */}
          <circle
            cx="50"
            cy="50"
            r="18"
            fill="url(#plutoGradient)"
            className="animate-pulse"
          />
          
          {/* Planet surface details */}
          <ellipse cx="45" cy="45" rx="3" ry="2" fill="rgba(255,255,255,0.3)" />
          <ellipse cx="55" cy="55" rx="2" ry="1.5" fill="rgba(255,255,255,0.2)" />
          
          {/* Rocket orbit path */}
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          
          {/* Rocket with dog */}
          <g transform="translate(50,18) rotate(0)">
            {/* Rocket body */}
            <rect
              x="-3"
              y="0"
              width="6"
              height="12"
              fill="url(#rocketGradient)"
              rx="1"
            />
            
            {/* Rocket nose */}
            <polygon
              points="-3,0 0,-4 3,0"
              fill="url(#rocketGradient)"
            />
            
            {/* Rocket fins */}
            <polygon
              points="-3,12 -6,16 -3,14"
              fill="url(#rocketGradient)"
            />
            <polygon
              points="3,12 6,16 3,14"
              fill="url(#rocketGradient)"
            />
            
            {/* Dog head in rocket window */}
            <circle
              cx="0"
              cy="4"
              r="2"
              fill="#8B5CF6"
            />
            
            {/* Dog ears */}
            <ellipse cx="-1.5" cy="2.5" rx="0.8" ry="1.2" fill="#8B5CF6" />
            <ellipse cx="1.5" cy="2.5" rx="0.8" ry="1.2" fill="#8B5CF6" />
            
            {/* Dog eyes */}
            <circle cx="-0.5" cy="3.5" r="0.3" fill="white" />
            <circle cx="0.5" cy="3.5" r="0.3" fill="white" />
            
            {/* Rocket exhaust */}
            <ellipse
              cx="0"
              cy="16"
              rx="2"
              ry="4"
              fill="url(#exhaustGradient)"
              className="animate-pulse"
            />
          </g>
          
          {/* Stars */}
          <circle cx="20" cy="20" r="1" fill="white" className="animate-pulse" />
          <circle cx="80" cy="25" r="0.8" fill="white" className="animate-pulse" />
          <circle cx="25" cy="80" r="0.6" fill="white" className="animate-pulse" />
          <circle cx="75" cy="75" r="1.2" fill="white" className="animate-pulse" />
          
          {/* Gradients */}
          <defs>
            <radialGradient id="spaceGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="100%" stopColor="#16213e" />
            </radialGradient>
            
            <radialGradient id="plutoGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#6D28D9" />
            </radialGradient>
            
            <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E5E7EB" />
              <stop offset="50%" stopColor="#D1D5DB" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
            
            <radialGradient id="exhaustGradient" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Pluto
          </span>
          <span className="text-xs text-gray-500 -mt-1">AI Platform</span>
        </div>
      )}
    </div>
  )
}
