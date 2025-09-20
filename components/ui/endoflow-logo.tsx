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
      <img
        src="/endoflow-logo.png"
        alt="Endoflow"
        className={`object-contain ${sizeClasses[size]}`}
      />

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