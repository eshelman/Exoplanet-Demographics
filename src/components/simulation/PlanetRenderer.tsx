import { memo } from 'react'
import { motion } from 'framer-motion'
import { PLANET_TYPE_COLORS } from '../../utils/scales'

interface PlanetRendererProps {
  id: string
  name: string
  planetType?: string
  radius: number // Earth radii
  x: number // Position in pixels
  y: number // Position in pixels
  isSelected: boolean
  isHovered: boolean
  showLabel: boolean
  onClick: () => void
  onHover: (hovered: boolean) => void
}

/**
 * Calculate visual planet size with min/max bounds
 * Uses logarithmic scaling for better visual differentiation
 */
function getVisualPlanetSize(earthRadii: number): number {
  const minSize = 8
  const maxSize = 40

  // Log scale: Earth (1 R⊕) = 12px, Jupiter (11 R⊕) = 32px
  const size = 12 * Math.pow(earthRadii, 0.4)
  return Math.max(minSize, Math.min(maxSize, size))
}

export const PlanetRenderer = memo(function PlanetRenderer({
  id,
  name,
  planetType,
  radius,
  x,
  y,
  isSelected,
  isHovered,
  showLabel,
  onClick,
  onHover,
}: PlanetRendererProps) {
  const visualSize = getVisualPlanetSize(radius)
  const color = PLANET_TYPE_COLORS[planetType || ''] || '#888888'

  // Create unique IDs for gradients
  const gradientId = `planet-gradient-${id}`
  const glowId = `planet-glow-${id}`

  return (
    <motion.g
      className="planet"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isHovered ? 1.2 : 1,
        opacity: 1,
      }}
      transition={{ duration: 0.2 }}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <defs>
        {/* Planet gradient */}
        <radialGradient id={gradientId} cx="35%" cy="35%">
          <stop offset="0%" stopColor={lightenColor(color, 30)} />
          <stop offset="70%" stopColor={color} />
          <stop offset="100%" stopColor={darkenColor(color, 30)} />
        </radialGradient>

        {/* Selection glow filter */}
        {isSelected && (
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Selection glow ring */}
      {isSelected && (
        <motion.circle
          cx={x}
          cy={y}
          r={visualSize + 6}
          fill="none"
          stroke="var(--color-accent, #60A5FA)"
          strokeWidth="2"
          opacity="0.6"
          filter={`url(#${glowId})`}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Hover highlight */}
      {isHovered && !isSelected && (
        <circle
          cx={x}
          cy={y}
          r={visualSize + 4}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
      )}

      {/* Planet body */}
      <circle
        cx={x}
        cy={y}
        r={visualSize}
        fill={`url(#${gradientId})`}
      />

      {/* Atmosphere effect for gas giants */}
      {(planetType === 'hot-jupiter' || planetType === 'cold-jupiter' || planetType === 'neptune-like') && (
        <circle
          cx={x}
          cy={y}
          r={visualSize * 1.05}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
      )}

      {/* Planet label */}
      {(showLabel || isSelected) && (
        <text
          x={x}
          y={y + visualSize + 14}
          textAnchor="middle"
          fill={isSelected ? 'var(--color-accent, #60A5FA)' : 'rgba(255,255,255,0.7)'}
          fontSize="11"
          fontWeight={isSelected ? '600' : '400'}
        >
          {name}
        </text>
      )}
    </motion.g>
  )
})

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
  const B = Math.max(0, (num & 0x0000ff) - amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}
