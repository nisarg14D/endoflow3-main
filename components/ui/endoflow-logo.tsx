import React from 'react'

interface EndoflowLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

export function EndoflowLogo({ className = '', size = 'md', showText = true }: EndoflowLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ENDOFLOW Tooth Logo */}
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer tooth shape with gradient */}
          <defs>
            <radialGradient id="toothGradient" cx="0.5" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="40%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0e7490" />
            </radialGradient>
            <radialGradient id="innerGradient" cx="0.5" cy="0.4" r="0.6">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </radialGradient>
          </defs>

          {/* Main tooth body */}
          <path
            d="M20 45 C15 35, 15 25, 25 20 L75 20 C85 25, 85 35, 80 45 L80 70 C80 85, 70 95, 60 100 L55 115 C52 118, 48 118, 45 115 L40 100 C30 95, 20 85, 20 70 Z"
            fill="url(#toothGradient)"
            stroke="#0e7490"
            strokeWidth="2"
          />

          {/* Inner tooth cavity */}
          <path
            d="M30 45 C28 40, 28 35, 32 32 L68 32 C72 35, 72 40, 70 45 L70 65 C70 75, 65 82, 58 86 L53 95 C51 96, 49 96, 47 95 L42 86 C35 82, 30 75, 30 65 Z"
            fill="url(#innerGradient)"
            stroke="#0891b2"
            strokeWidth="1"
          />

          {/* Root canals */}
          <ellipse cx="42" cy="105" rx="3" ry="8" fill="#0e7490" />
          <ellipse cx="58" cy="105" rx="3" ry="8" fill="#0e7490" />

          {/* Decorative dots around the tooth */}
          <circle cx="15" cy="30" r="2" fill="#0891b2" opacity="0.6" />
          <circle cx="85" cy="35" r="2" fill="#0891b2" opacity="0.6" />
          <circle cx="90" cy="55" r="1.5" fill="#7dd3fc" opacity="0.8" />
          <circle cx="10" cy="50" r="1.5" fill="#7dd3fc" opacity="0.8" />
          <circle cx="12" cy="70" r="1" fill="#0891b2" opacity="0.5" />
          <circle cx="88" cy="75" r="1" fill="#0891b2" opacity="0.5" />
          <circle cx="85" cy="25" r="1" fill="#7dd3fc" opacity="0.7" />
          <circle cx="15" cy="25" r="1" fill="#7dd3fc" opacity="0.7" />

          {/* Crown highlights */}
          <ellipse cx="45" cy="28" rx="8" ry="3" fill="#ffffff" opacity="0.4" />
          <ellipse cx="55" cy="32" rx="6" ry="2" fill="#ffffff" opacity="0.3" />
        </svg>
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-gray-900 tracking-tight">
            ENDOFLOW
          </div>
          <div className="text-sm text-gray-600 -mt-1">
            AI-Powered Dental Suite
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for navigation
export function EndoflowLogoCompact({ className = '', size = 'sm' }: Omit<EndoflowLogoProps, 'showText'>) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <EndoflowLogo size={size} showText={false} />
      <span className="text-lg font-semibold text-gray-900">ENDOFLOW</span>
    </div>
  )
}