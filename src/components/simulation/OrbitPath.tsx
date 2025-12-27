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
    // Use more points for highly eccentric orbits to keep curves smooth
    // For e=0, 72 points is plenty. For e=0.93, we need ~360+ points
    const basePoints = 72
    const numPoints = Math.round(basePoints + (eccentricity * 300))

    const points = generateOrbitPath(semiMajorAxis, eccentricity, argumentOfPeriapsis, numPoints)

    if (points.length === 0) return ''

    // Convert AU to pixels and build SVG path
    const scaledPoints = points.map((p) => ({
      x: cx + p.x * scale,
      y: cy - p.y * scale, // Invert Y for screen coordinates
    }))

    // Build smooth path using Catmull-Rom to Bezier conversion
    // This creates smooth curves through all points
    if (scaledPoints.length < 3) {
      return scaledPoints.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(' ') + ' Z'
    }

    // Start path
    let path = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`

    // Use quadratic bezier curves for smooth interpolation
    for (let i = 0; i < scaledPoints.length; i++) {
      const p0 = scaledPoints[(i - 1 + scaledPoints.length) % scaledPoints.length]
      const p1 = scaledPoints[i]
      const p2 = scaledPoints[(i + 1) % scaledPoints.length]
      const p3 = scaledPoints[(i + 2) % scaledPoints.length]

      // Catmull-Rom to cubic bezier control points
      const tension = 6 // Higher = tighter curves
      const cp1x = p1.x + (p2.x - p0.x) / tension
      const cp1y = p1.y + (p2.y - p0.y) / tension
      const cp2x = p2.x - (p3.x - p1.x) / tension
      const cp2y = p2.y - (p3.y - p1.y) / tension

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }

    return path
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
