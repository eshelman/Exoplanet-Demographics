import { motion } from 'framer-motion'
import type { Planet } from '../../types'
import { formatMass, formatRadius, formatPeriod } from '../../utils/formatters'
import { METHOD_COLORS, PLANET_TYPE_COLORS, SOLAR_SYSTEM_COLOR } from '../../utils/scales'
import { PlanetIcon } from '../info/PlanetIcon'

interface TooltipProps {
  planet: Planet
  x: number
  y: number
  containerWidth?: number
  containerHeight?: number
  onClose?: () => void
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

// Format planet type for display
function formatPlanetType(type: string): string {
  const names: Record<string, string> = {
    rocky: 'Rocky/Terrestrial',
    'super-earth': 'Super-Earth',
    'sub-neptune': 'Sub-Neptune',
    'neptune-like': 'Neptune-like',
    'hot-jupiter': 'Hot Jupiter',
    'cold-jupiter': 'Cold Jupiter',
    'ultra-short-period': 'Ultra-Short Period',
  }
  return names[type] || type.replace(/-/g, ' ')
}

// Get description based on planet type
function getPlanetDescription(planet: Planet): string {
  const type = planet.planetType || 'unknown'
  const descriptions: Record<string, string> = {
    rocky:
      'A small, dense world with a solid surface, similar to Earth or Mars. These planets are composed primarily of silicate rocks and metals.',
    'super-earth':
      'A rocky planet more massive than Earth but smaller than Neptune. These worlds may have thick atmospheres and could potentially harbor liquid water.',
    'sub-neptune':
      'An intermediate-sized planet with a rocky core surrounded by a thick hydrogen-helium envelope. The most common type of planet in our galaxy.',
    'neptune-like':
      'An ice giant with a composition similar to Neptune, featuring a small rocky core, water-ammonia ocean, and thick atmosphere.',
    'hot-jupiter':
      'A gas giant orbiting very close to its star, with surface temperatures exceeding 1000K. These scorched worlds complete orbits in just days.',
    'cold-jupiter':
      'A gas giant at a comfortable distance from its star, similar to Jupiter in our Solar System. May have extensive moon systems.',
    'ultra-short-period':
      'A planet with an orbital period less than one day, experiencing extreme irradiation and tidal forces from its host star.',
  }
  return descriptions[type] || 'An exoplanet with unique characteristics waiting to be explored.'
}

// Calculate approximate density if mass and radius available
function calculateDensity(mass?: number, radius?: number): number | null {
  if (!mass || !radius) return null
  return mass / Math.pow(radius, 3)
}

// Get density interpretation
function getDensityInterpretation(density: number): string {
  if (density < 0.5) return 'Very low - likely gas-dominated'
  if (density < 1) return 'Low - significant gas envelope'
  if (density < 1.5) return 'Earth-like density'
  if (density < 3) return 'High - iron-rich core'
  return 'Very high - extremely dense'
}

export function Tooltip({ planet, x, y, containerWidth = 1200, containerHeight = 800, onClose }: TooltipProps) {
  const color = planet.isSolarSystem
    ? SOLAR_SYSTEM_COLOR
    : METHOD_COLORS[planet.detectionMethod] || METHOD_COLORS.other

  const typeColor = planet.planetType ? PLANET_TYPE_COLORS[planet.planetType] : color
  const density = calculateDensity(planet.mass, planet.radius)
  const radiusRatio = planet.radius || 1

  // Smart positioning to keep tooltip on screen
  const tooltipWidth = 280
  const tooltipHeight = 500
  const offsetX = 20
  const offsetY = -20

  // Calculate position, flipping if needed
  let left = x + offsetX
  let top = y + offsetY

  // Flip horizontally if too close to right edge
  if (left + tooltipWidth > containerWidth - 20) {
    left = x - tooltipWidth - offsetX
  }

  // Flip vertically if too close to bottom
  if (top + tooltipHeight > containerHeight - 20) {
    top = Math.max(20, containerHeight - tooltipHeight - 20)
  }

  // Ensure not off top
  if (top < 20) {
    top = 20
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 rounded-lg overflow-hidden"
      style={{
        left,
        top,
        width: tooltipWidth,
        backgroundColor: 'var(--color-background)',
        border: `1px solid ${color}40`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: `${color}20` }}
      >
        <div className="flex items-center gap-3">
          <PlanetIcon type={planet.planetType || 'unknown'} size={32} />
          <div>
            <h3 className="font-semibold text-sm" style={{ color }}>
              {planet.name}
            </h3>
            {planet.hostStar && (
              <div className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
                Host: {planet.hostStar}
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Planet Type Badge */}
      {planet.planetType && (
        <div className="px-4 pt-3">
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: `${typeColor}30`, color: typeColor }}
          >
            {formatPlanetType(planet.planetType)}
          </span>
        </div>
      )}

      {/* Description */}
      <div className="px-4 py-2">
        <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-text)' }}>
          {getPlanetDescription(planet)}
        </p>
      </div>

      {/* Properties Table */}
      <div className="px-4 pb-2">
        <table className="w-full text-xs" style={{ color: 'var(--color-text)' }}>
          <tbody>
            {planet.mass !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-1.5 opacity-60">Mass</td>
                <td className="py-1.5 text-right">{formatMass(planet.mass)}</td>
              </tr>
            )}
            {planet.radius !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-1.5 opacity-60">Radius</td>
                <td className="py-1.5 text-right">{formatRadius(planet.radius)}</td>
              </tr>
            )}
            {density !== null && (
              <tr className="border-t border-white/10">
                <td className="py-1.5 opacity-60">Density</td>
                <td className="py-1.5 text-right">
                  <span>{density.toFixed(2)} Earth</span>
                  <span className="block text-[10px] opacity-50">{getDensityInterpretation(density)}</span>
                </td>
              </tr>
            )}
            <tr className="border-t border-white/10">
              <td className="py-1.5 opacity-60">Orbital Period</td>
              <td className="py-1.5 text-right">{formatPeriod(planet.period)}</td>
            </tr>
            {planet.separation !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-1.5 opacity-60">Semi-major Axis</td>
                <td className="py-1.5 text-right">{planet.separation.toFixed(2)} AU</td>
              </tr>
            )}
            {planet.distance !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-1.5 opacity-60">Distance</td>
                <td className="py-1.5 text-right">{planet.distance.toFixed(1)} ly</td>
              </tr>
            )}
            {!planet.isSolarSystem && (
              <>
                <tr className="border-t border-white/10">
                  <td className="py-1.5 opacity-60">Detection Method</td>
                  <td className="py-1.5 text-right">{formatMethodName(planet.detectionMethod)}</td>
                </tr>
                {planet.discoveryYear > 0 && (
                  <tr className="border-t border-white/10">
                    <td className="py-1.5 opacity-60">Discovered</td>
                    <td className="py-1.5 text-right">{planet.discoveryYear}</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Size Comparison */}
      {planet.radius !== undefined && (
        <div className="px-4 pb-3">
          <div className="text-xs opacity-60 mb-2" style={{ color: 'var(--color-text)' }}>
            Size Comparison
          </div>
          <div className="flex items-end gap-3 h-14">
            {/* Planet */}
            <div className="flex flex-col items-center">
              <div
                className="rounded-full"
                style={{
                  width: Math.max(8, Math.min(48, radiusRatio * 12)),
                  height: Math.max(8, Math.min(48, radiusRatio * 12)),
                  backgroundColor: typeColor,
                  opacity: 0.8,
                }}
              />
              <span className="text-[9px] mt-1 opacity-60" style={{ color: 'var(--color-text)' }}>
                {planet.name.split(' ')[0]}
              </span>
            </div>
            {/* Earth reference */}
            <div className="flex flex-col items-center">
              <div
                className="rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#3B82F6',
                  opacity: 0.8,
                }}
              />
              <span className="text-[9px] mt-1 opacity-60" style={{ color: 'var(--color-text)' }}>
                Earth
              </span>
            </div>
            {/* Jupiter reference (if planet is large) */}
            {radiusRatio > 4 && (
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full"
                  style={{
                    width: Math.min(48, 11 * 4),
                    height: Math.min(48, 11 * 4),
                    backgroundColor: '#D97706',
                    opacity: 0.5,
                  }}
                />
                <span className="text-[9px] mt-1 opacity-60" style={{ color: 'var(--color-text)' }}>
                  Jupiter
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {planet.isSolarSystem && (
        <div
          className="px-4 py-2 text-xs italic border-t"
          style={{ borderColor: 'rgba(255,255,255,0.1)', color: SOLAR_SYSTEM_COLOR }}
        >
          Our Solar System
        </div>
      )}
    </motion.div>
  )
}
