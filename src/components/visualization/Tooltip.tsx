import { motion } from 'framer-motion'
import type { Planet } from '../../types'
import { formatMass, formatRadius, formatPeriod } from '../../utils/formatters'
import { METHOD_COLORS, SOLAR_SYSTEM_COLOR } from '../../utils/scales'

interface TooltipProps {
  planet: Planet
  x: number
  y: number
}

// Format detection method name for display
function formatMethodName(method: string): string {
  const names: Record<string, string> = {
    'radial-velocity': 'Radial Velocity',
    'transit-kepler': 'Transit (Kepler)',
    'transit-other': 'Transit',
    microlensing: 'Microlensing',
    'direct-imaging': 'Direct Imaging',
    astrometry: 'Astrometry',
  }
  return names[method] || method.replace(/-/g, ' ')
}

// Format distance in light-years
function formatDistance(ly: number): string {
  if (ly < 100) return `${ly.toFixed(1)} ly`
  if (ly < 1000) return `${Math.round(ly)} ly`
  return `${(ly / 1000).toFixed(1)}k ly`
}

export function Tooltip({ planet, x, y }: TooltipProps) {
  const color = planet.isSolarSystem
    ? SOLAR_SYSTEM_COLOR
    : METHOD_COLORS[planet.detectionMethod] || METHOD_COLORS.other

  // Offset tooltip to avoid cursor, with boundary awareness
  const offsetX = 15
  const offsetY = -10

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none z-50"
      style={{
        left: x + offsetX,
        top: y + offsetY,
        backgroundColor: 'var(--color-background)',
        border: `1px solid ${color}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '200px',
        maxWidth: '280px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Planet name */}
      <div className="font-semibold text-sm mb-1" style={{ color }}>
        {planet.name}
      </div>

      {/* Host star (if available) */}
      {planet.hostStar && (
        <div className="text-xs opacity-60 mb-2" style={{ color: 'var(--color-text)' }}>
          Host: {planet.hostStar}
        </div>
      )}

      {/* Properties */}
      <div className="space-y-1 text-xs" style={{ color: 'var(--color-text)' }}>
        {planet.mass !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Mass:</span>
            <span>{formatMass(planet.mass)}</span>
          </div>
        )}
        {planet.radius !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Radius:</span>
            <span>{formatRadius(planet.radius)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="opacity-70">Orbital Period:</span>
          <span>{formatPeriod(planet.period)}</span>
        </div>
        {planet.separation !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Semi-major Axis:</span>
            <span>{planet.separation.toFixed(2)} AU</span>
          </div>
        )}
        {planet.distance !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Distance:</span>
            <span>{formatDistance(planet.distance)}</span>
          </div>
        )}
        {!planet.isSolarSystem && (
          <>
            <div className="flex justify-between gap-4">
              <span className="opacity-70">Detection:</span>
              <span>{formatMethodName(planet.detectionMethod)}</span>
            </div>
            {planet.discoveryYear > 0 && (
              <div className="flex justify-between gap-4">
                <span className="opacity-70">Discovered:</span>
                <span>{planet.discoveryYear}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Planet type badge */}
      {planet.planetType && (
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'var(--color-text)',
            }}
          >
            {planet.planetType.replace(/-/g, ' ')}
          </span>
        </div>
      )}

      {planet.isSolarSystem && (
        <div
          className="mt-2 pt-2 text-xs italic"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: SOLAR_SYSTEM_COLOR }}
        >
          Our Solar System
        </div>
      )}
    </motion.div>
  )
}
