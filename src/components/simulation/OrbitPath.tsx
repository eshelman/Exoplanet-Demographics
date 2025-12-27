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

  // Calculate periapsis and apoapsis positions for markers
  const apsisPositions = useMemo(() => {
    if (eccentricity < 0.05) return null // Don't show for near-circular orbits

    const periapsisDistance = semiMajorAxis * (1 - eccentricity)
    const apoapsisDistance = semiMajorAxis * (1 + eccentricity)
    const omega = (argumentOfPeriapsis * Math.PI) / 180

    return {
      periapsis: {
        x: cx + periapsisDistance * scale * Math.cos(omega),
        y: cy - periapsisDistance * scale * Math.sin(omega),
        distance: periapsisDistance,
      },
      apoapsis: {
        x: cx + apoapsisDistance * scale * Math.cos(omega + Math.PI),
        y: cy - apoapsisDistance * scale * Math.sin(omega + Math.PI),
        distance: apoapsisDistance,
      },
      isHighlyEccentric: eccentricity > 0.3, // Show labels for highly eccentric orbits
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
      {apsisPositions && (
        <>
          {/* Periapsis (closest approach) */}
          <circle
            cx={apsisPositions.periapsis.x}
            cy={apsisPositions.periapsis.y}
            r={isSelected ? 4 : 3}
            fill={isSelected ? '#F59E0B' : 'rgba(245, 158, 11, 0.5)'}
            opacity={0.8}
          />
          {/* Periapsis label for highly eccentric selected orbits */}
          {isSelected && apsisPositions.isHighlyEccentric && (
            <text
              x={apsisPositions.periapsis.x}
              y={apsisPositions.periapsis.y - 8}
              fontSize="9"
              fill="rgba(245, 158, 11, 0.9)"
              textAnchor="middle"
            >
              Periapsis
            </text>
          )}

          {/* Apoapsis (farthest point) - only for highly eccentric orbits */}
          {apsisPositions.isHighlyEccentric && (
            <>
              <circle
                cx={apsisPositions.apoapsis.x}
                cy={apsisPositions.apoapsis.y}
                r={isSelected ? 4 : 3}
                fill={isSelected ? '#3B82F6' : 'rgba(59, 130, 246, 0.5)'}
                opacity={0.8}
              />
              {isSelected && (
                <text
                  x={apsisPositions.apoapsis.x}
                  y={apsisPositions.apoapsis.y - 8}
                  fontSize="9"
                  fill="rgba(96, 165, 250, 0.9)"
                  textAnchor="middle"
                >
                  Apoapsis
                </text>
              )}
            </>
          )}
        </>
      )}
    </g>
  )
})
