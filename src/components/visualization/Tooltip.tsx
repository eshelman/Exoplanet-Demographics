import { motion } from 'framer-motion'
import type { Planet } from '../../types'
import { formatMass, formatRadius, formatPeriod } from '../../utils/formatters'
import { METHOD_COLORS, SOLAR_SYSTEM_COLOR } from '../../utils/scales'

interface TooltipProps {
  planet: Planet
  x: number
  y: number
}

export function Tooltip({ planet, x, y }: TooltipProps) {
  const color = planet.isSolarSystem
    ? SOLAR_SYSTEM_COLOR
    : METHOD_COLORS[planet.detectionMethod] || METHOD_COLORS.other

  // Offset tooltip to avoid cursor
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
        minWidth: '180px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Planet name */}
      <div className="font-semibold text-sm mb-2" style={{ color }}>
        {planet.name}
      </div>

      {/* Properties */}
      <div className="space-y-1 text-xs" style={{ color: 'var(--color-text)' }}>
        {planet.mass && (
          <div className="flex justify-between">
            <span className="opacity-70">Mass:</span>
            <span>{formatMass(planet.mass)}</span>
          </div>
        )}
        {planet.radius && (
          <div className="flex justify-between">
            <span className="opacity-70">Radius:</span>
            <span>{formatRadius(planet.radius)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="opacity-70">Period:</span>
          <span>{formatPeriod(planet.period)}</span>
        </div>
        {planet.separation && (
          <div className="flex justify-between">
            <span className="opacity-70">Distance:</span>
            <span>{planet.separation.toFixed(2)} AU</span>
          </div>
        )}
        {!planet.isSolarSystem && (
          <>
            <div className="flex justify-between">
              <span className="opacity-70">Detected:</span>
              <span>{planet.detectionMethod.replace('-', ' ')}</span>
            </div>
            {planet.discoveryYear && (
              <div className="flex justify-between">
                <span className="opacity-70">Year:</span>
                <span>{planet.discoveryYear}</span>
              </div>
            )}
          </>
        )}
      </div>

      {planet.isSolarSystem && (
        <div
          className="mt-2 pt-2 text-xs italic opacity-70"
          style={{ borderTop: '1px solid var(--color-text)', opacity: 0.3 }}
        >
          Solar System
        </div>
      )}
    </motion.div>
  )
}
