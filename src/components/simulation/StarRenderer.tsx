import { memo } from 'react'
import { getStarGlowColors } from '../../utils/starColors'

interface StarRendererProps {
  temperature: number
  radius: number // Solar radii
  cx: number // Center x in pixels
  cy: number // Center y in pixels
  isBinaryClose?: boolean
  binaryAngle?: number // For close binary animation (radians)
}

/**
 * Calculate visual star size with min/max bounds
 * Stars are scaled logarithmically from their actual radius
 */
function getVisualStarSize(solarRadii: number): number {
  // Base size: 1 solar radius = 30px
  // Use sqrt for more reasonable scaling (stars don't vary that much visually)
  const baseSize = 30
  const minSize = 15
  const maxSize = 60

  const size = baseSize * Math.sqrt(solarRadii)
  return Math.max(minSize, Math.min(maxSize, size))
}

export const StarRenderer = memo(function StarRenderer({
  temperature,
  radius,
  cx,
  cy,
  isBinaryClose = false,
  binaryAngle = 0,
}: StarRendererProps) {
  const visualSize = getVisualStarSize(radius)
  const { core, glow } = getStarGlowColors(temperature)
  const gradientId = `star-gradient-${temperature}`
  const glowId = `star-glow-${temperature}`

  if (isBinaryClose) {
    // Render two stars orbiting each other
    const orbitRadius = visualSize * 0.8
    const secondarySize = visualSize * 0.7

    const star1X = cx + Math.cos(binaryAngle) * orbitRadius
    const star1Y = cy + Math.sin(binaryAngle) * orbitRadius
    const star2X = cx - Math.cos(binaryAngle) * orbitRadius
    const star2Y = cy - Math.sin(binaryAngle) * orbitRadius

    return (
      <g className="star-binary">
        <defs>
          <radialGradient id={gradientId} cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor={core} />
            <stop offset="100%" stopColor={glow} />
          </radialGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Primary star */}
        <circle
          cx={star1X}
          cy={star1Y}
          r={visualSize}
          fill={`url(#${gradientId})`}
          filter={`url(#${glowId})`}
        />

        {/* Secondary star (slightly smaller, same color for now) */}
        <circle
          cx={star2X}
          cy={star2Y}
          r={secondarySize}
          fill={`url(#${gradientId})`}
          filter={`url(#${glowId})`}
        />

        {/* Label */}
        <text
          x={cx}
          y={cy + visualSize + orbitRadius + 20}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize="10"
          fontStyle="italic"
        >
          Close Binary (illustrative)
        </text>
      </g>
    )
  }

  // Single star rendering
  return (
    <g className="star">
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="30%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor={core} />
          <stop offset="100%" stopColor={glow} />
        </radialGradient>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow */}
      <circle
        cx={cx}
        cy={cy}
        r={visualSize * 1.5}
        fill="none"
        stroke={glow}
        strokeWidth="2"
        opacity="0.3"
        filter={`url(#${glowId})`}
      />

      {/* Main star body */}
      <circle
        cx={cx}
        cy={cy}
        r={visualSize}
        fill={`url(#${gradientId})`}
        filter={`url(#${glowId})`}
      />

      {/* Corona effect */}
      <circle
        cx={cx}
        cy={cy}
        r={visualSize * 1.2}
        fill="none"
        stroke={core}
        strokeWidth="1"
        opacity="0.2"
      />
    </g>
  )
})
