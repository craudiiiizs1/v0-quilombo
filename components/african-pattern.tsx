"use client"

interface AfricanPatternProps {
  className?: string
  variant?: "top" | "bottom" | "full"
}

export function AfricanPattern({ className = "", variant = "full" }: AfricanPatternProps) {
  const patternSvg = (
    <svg
      viewBox="0 0 400 40"
      className={`w-full h-10 ${className}`}
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="africanPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          {/* Padrão geométrico inspirado nos elementos visuais da cartilha */}
          <rect width="40" height="40" fill="#FF6B35" />
          <polygon points="0,0 20,0 10,10" fill="#2D5016" />
          <polygon points="20,0 40,0 30,10" fill="#1A472A" />
          <polygon points="0,20 20,20 10,30" fill="#1A472A" />
          <polygon points="20,20 40,20 30,30" fill="#2D5016" />
          <polygon points="10,10 30,10 20,20" fill="#FFB800" />
          <polygon points="10,30 30,30 20,40" fill="#FFB800" />
          <circle cx="10" cy="20" r="3" fill="#FFFFFF" />
          <circle cx="30" cy="20" r="3" fill="#FFFFFF" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#africanPattern)" />
    </svg>
  )

  if (variant === "top") {
    return <div className="w-full">{patternSvg}</div>
  }

  if (variant === "bottom") {
    return <div className="w-full transform rotate-180">{patternSvg}</div>
  }

  return (
    <div className="w-full">
      {patternSvg}
      <div className="transform rotate-180">{patternSvg}</div>
    </div>
  )
}
