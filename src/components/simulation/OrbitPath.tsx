import { memo, useMemo } from 'react'
import { generateOrbitPath } from '../../utils/orbitalMechanics'

interface OrbitPathProps {
  semiMajorAxis: number // AU
  eccentricity: number
  argumentOfPeriapsis: number // degrees
  cx: number // Center x in pixels
  cy: number // Center y in pixels
  scale: number // Pixels per AU
  isSelected: boolean
  isEstimated?: boolean
  color?: string
}

export const OrbitPath = memo(function OrbitPath({
  semiMajorAxis,
  eccentricity,
  argumentOfPeriapsis,
  cx,
  cy,
  scale,
  isSelected,
  isEstimated = false,
  color,
}: OrbitPathProps) {
  // Generate orbit path points
  const pathD = useMemo(() => {
    const points = generateOrbitPath(semiMajorAxis, eccentricity, argumentOfPeriapsis, 72)

    if (points.length === 0) return ''

    // Convert AU to pixels and build SVG path
    const scaledPoints = points.map((p) => ({
      x: cx + p.x * scale,
      y: cy - p.y * scale, // Invert Y for screen coordinates
    }))

    // Build path string
    const pathParts = scaledPoints.map((p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    })

    return pathParts.join(' ') + ' Z'
  }, [semiMajorAxis, eccentricity, argumentOfPeriapsis, cx, cy, scale])

  // Calculate periapsis position for marker
  const periapsisPos = useMemo(() => {
    if (eccentricity < 0.05) return null // Don't show for near-circular orbits

    const periapsisDistance = semiMajorAxis * (1 - eccentricity)
    const omega = (argumentOfPeriapsis * Math.PI) / 180

    return {
      x: cx + periapsisDistance * scale * Math.cos(omega),
      y: cy - periapsisDistance * scale * Math.sin(omega),
    }
  }, [semiMajorAxis, eccentricity, argumentOfPeriapsis, cx, cy, scale])

  const strokeColor = color || (isSelected ? 'var(--color-accent, #60A5FA)' : 'rgba(255,255,255,0.15)')
  const strokeWidth = isSelected ? 2 : 1
  const strokeOpacity = isSelected ? 0.6 : 0.3
  const strokeDasharray = isEstimated ? '4 2' : 'none'

  return (
    <g className="orbit-path">
      {/* Main orbit ellipse */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
      />

      {/* Periapsis marker for eccentric orbits */}
      {periapsisPos && (
        <circle
          cx={periapsisPos.x}
          cy={periapsisPos.y}
          r={3}
          fill={isSelected ? strokeColor : 'rgba(255,255,255,0.3)'}
          opacity={0.6}
        />
      )}
    </g>
  )
})
