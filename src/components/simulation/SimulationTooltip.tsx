import { memo } from 'react'
import { motion } from 'framer-motion'
import type { SimulatedPlanet, OrbitalPosition } from '../../types/simulation'
import { PLANET_TYPE_COLORS } from '../../utils/scales'

interface SimulationTooltipProps {
  planet: SimulatedPlanet
  position: OrbitalPosition
  x: number // Screen position
  y: number // Screen position
  containerWidth: number
  containerHeight: number
}

export const SimulationTooltip = memo(function SimulationTooltip({
  planet,
  position,
  x,
  y,
  containerWidth,
  containerHeight,
}: SimulationTooltipProps) {
  const color = PLANET_TYPE_COLORS[planet.planetType || ''] || '#888888'

  // Calculate tooltip position to keep it on screen
  const tooltipWidth = 200
  const tooltipHeight = 180
  const padding = 15

  let tooltipX = x + padding
  let tooltipY = y - tooltipHeight / 2

  // Adjust if too close to right edge
  if (tooltipX + tooltipWidth > containerWidth - padding) {
    tooltipX = x - tooltipWidth - padding
  }

  // Adjust if too close to top/bottom
  if (tooltipY < padding) {
    tooltipY = padding
  } else if (tooltipY + tooltipHeight > containerHeight - padding) {
    tooltipY = containerHeight - tooltipHeight - padding
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none z-50"
      style={{
        left: tooltipX,
        top: tooltipY,
        width: tooltipWidth,
        backgroundColor: 'rgba(10, 15, 28, 0.95)',
        border: `1px solid ${color}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Planet name */}
      <div className="font-semibold text-sm mb-2" style={{ color }}>
        {planet.name}
      </div>

      {/* Real-time orbital data */}
      <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text)' }}>
        <DataRow
          label="Current distance"
          value={`${position.r.toFixed(3)} AU`}
        />
        <DataRow
          label="Velocity"
          value={`${position.velocity.toFixed(1)} km/s`}
        />
        <DataRow
          label="Orbital period"
          value={formatPeriod(planet.period)}
        />

        <div className="border-t border-white/10 my-2" />

        <DataRow
          label="Semi-major axis"
          value={`${planet.semiMajorAxis.toFixed(3)} AU`}
        />
        <DataRow
          label="Eccentricity"
          value={planet.eccentricity.toFixed(3)}
          estimated={planet.eccentricityEstimated}
        />
        {planet.mass && (
          <DataRow
            label="Mass"
            value={`${planet.mass.toFixed(2)} M⊕`}
          />
        )}
        {planet.radius && (
          <DataRow
            label="Radius"
            value={`${planet.radius.toFixed(2)} R⊕`}
            estimated={planet.radiusEstimated}
          />
        )}
      </div>

      {/* Planet type badge */}
      {planet.planetType && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <span
            className="text-xs px-2 py-0.5 rounded-full capitalize"
            style={{
              backgroundColor: `${color}20`,
              color,
            }}
          >
            {planet.planetType.replace(/-/g, ' ')}
          </span>
        </div>
      )}
    </motion.div>
  )
})

interface DataRowProps {
  label: string
  value: string
  estimated?: boolean
}

function DataRow({ label, value, estimated }: DataRowProps) {
  return (
    <div className="flex justify-between gap-2">
      <span className="opacity-60">{label}</span>
      <span className={estimated ? 'italic opacity-70' : ''}>
        {value}
        {estimated && <span className="ml-1 opacity-50">~</span>}
      </span>
    </div>
  )
}

function formatPeriod(days: number): string {
  if (days < 1) {
    return `${(days * 24).toFixed(1)} hours`
  } else if (days < 365) {
    return `${days.toFixed(1)} days`
  } else {
    return `${(days / 365.25).toFixed(2)} years`
  }
}
