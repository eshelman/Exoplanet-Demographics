import { PLANET_TYPE_COLORS } from '../../utils/scales'

interface PlanetIconProps {
  type: string
  size?: number
}

export function PlanetIcon({ type, size = 24 }: PlanetIconProps) {
  const color = PLANET_TYPE_COLORS[type] || '#888'

  // Different visual styles based on planet type
  switch (type) {
    case 'rocky':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={color} />
          <circle cx="8" cy="10" r="2" fill="rgba(0,0,0,0.2)" />
          <circle cx="14" cy="14" r="1.5" fill="rgba(0,0,0,0.15)" />
          <circle cx="16" cy="8" r="1" fill="rgba(0,0,0,0.1)" />
        </svg>
      )

    case 'super-earth':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={color} />
          <ellipse cx="12" cy="12" rx="10" ry="3" fill="rgba(255,255,255,0.15)" />
          <circle cx="7" cy="9" r="2.5" fill="rgba(0,0,0,0.15)" />
          <circle cx="15" cy="13" r="2" fill="rgba(0,0,0,0.1)" />
        </svg>
      )

    case 'sub-neptune':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={color} />
          <ellipse cx="12" cy="8" rx="8" ry="2" fill="rgba(255,255,255,0.2)" />
          <ellipse cx="12" cy="12" rx="9" ry="2" fill="rgba(255,255,255,0.15)" />
          <ellipse cx="12" cy="16" rx="7" ry="1.5" fill="rgba(255,255,255,0.1)" />
        </svg>
      )

    case 'neptune-like':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={color} />
          <ellipse cx="12" cy="7" rx="7" ry="1.5" fill="rgba(255,255,255,0.25)" />
          <ellipse cx="12" cy="11" rx="8" ry="2" fill="rgba(255,255,255,0.2)" />
          <ellipse cx="12" cy="15" rx="7" ry="1.5" fill="rgba(255,255,255,0.15)" />
          <ellipse cx="12" cy="18" rx="5" ry="1" fill="rgba(255,255,255,0.1)" />
        </svg>
      )

    case 'hot-jupiter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <defs>
            <radialGradient id="hot-gradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor="#7C2D12" />
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#hot-gradient)" />
          <ellipse cx="12" cy="10" rx="8" ry="1.5" fill="rgba(255,255,255,0.2)" />
          <ellipse cx="12" cy="14" rx="7" ry="2" fill="rgba(255,255,255,0.15)" />
        </svg>
      )

    case 'cold-jupiter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={color} />
          <ellipse cx="12" cy="8" rx="8" ry="2" fill="rgba(255,255,255,0.2)" />
          <ellipse cx="12" cy="12" rx="9" ry="2.5" fill="rgba(200,150,100,0.3)" />
          <ellipse cx="12" cy="16" rx="7" ry="1.5" fill="rgba(255,255,255,0.15)" />
          {/* Great Red Spot analog */}
          <ellipse cx="15" cy="12" rx="2" ry="1.5" fill="rgba(180,80,60,0.5)" />
        </svg>
      )

    case 'ultra-short-period':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <defs>
            <radialGradient id="usp-gradient" cx="20%" cy="30%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#DC2626" />
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="10" fill="url(#usp-gradient)" />
          {/* Lava cracks */}
          <path d="M8 8 Q12 12 8 16" stroke="rgba(255,200,0,0.5)" strokeWidth="0.5" fill="none" />
          <path d="M14 6 Q16 12 14 18" stroke="rgba(255,200,0,0.4)" strokeWidth="0.5" fill="none" />
        </svg>
      )

    default:
      // Generic planet icon
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={color || '#666'} />
          <ellipse cx="12" cy="12" rx="10" ry="3" fill="rgba(255,255,255,0.1)" />
        </svg>
      )
  }
}
