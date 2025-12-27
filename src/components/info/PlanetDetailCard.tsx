import { motion } from 'framer-motion'
import type { Planet } from '../../types'
import { formatMass, formatRadius, formatPeriod } from '../../utils/formatters'
import { METHOD_COLORS, PLANET_TYPE_COLORS, SOLAR_SYSTEM_COLOR } from '../../utils/scales'
import { PlanetIcon } from './PlanetIcon'

interface PlanetDetailCardProps {
  planet: Planet
  onClose: () => void
  onViewSimulation?: () => void
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
  // Density relative to Earth: ρ = M / R³ (since ρ_Earth = 5.51 g/cm³)
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

export function PlanetDetailCard({ planet, onClose, onViewSimulation }: PlanetDetailCardProps) {
  const color = planet.isSolarSystem
    ? SOLAR_SYSTEM_COLOR
    : METHOD_COLORS[planet.detectionMethod] || METHOD_COLORS.other

  const typeColor = planet.planetType ? PLANET_TYPE_COLORS[planet.planetType] : color
  const density = calculateDensity(planet.mass, planet.radius)

  // Calculate size comparison to Earth
  const radiusRatio = planet.radius || 1

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--color-background)',
        border: `1px solid ${color}40`,
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
            <h3 className="font-semibold" style={{ color }}>
              {planet.name}
            </h3>
            {planet.hostStar && (
              <div className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
                Host: {planet.hostStar}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: 'var(--color-text)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
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
      <div className="px-4 py-3">
        <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--color-text)' }}>
          {getPlanetDescription(planet)}
        </p>
      </div>

      {/* Properties Table */}
      <div className="px-4 pb-3">
        <table className="w-full text-xs" style={{ color: 'var(--color-text)' }}>
          <tbody>
            {planet.mass !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-2 opacity-60">Mass</td>
                <td className="py-2 text-right">{formatMass(planet.mass)}</td>
              </tr>
            )}
            {planet.radius !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-2 opacity-60">Radius</td>
                <td className="py-2 text-right">{formatRadius(planet.radius)}</td>
              </tr>
            )}
            {density !== null && (
              <tr className="border-t border-white/10">
                <td className="py-2 opacity-60">Density</td>
                <td className="py-2 text-right">
                  <span>{density.toFixed(2)} Earth</span>
                  <span className="block text-[10px] opacity-50">{getDensityInterpretation(density)}</span>
                </td>
              </tr>
            )}
            <tr className="border-t border-white/10">
              <td className="py-2 opacity-60">Orbital Period</td>
              <td className="py-2 text-right">{formatPeriod(planet.period)}</td>
            </tr>
            {planet.separation !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-2 opacity-60">Semi-major Axis</td>
                <td className="py-2 text-right">{planet.separation.toFixed(3)} AU</td>
              </tr>
            )}
            {planet.temperature !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-2 opacity-60">Temperature</td>
                <td className="py-2 text-right">{planet.temperature} K</td>
              </tr>
            )}
            {planet.distance !== undefined && (
              <tr className="border-t border-white/10">
                <td className="py-2 opacity-60">Distance</td>
                <td className="py-2 text-right">{planet.distance.toFixed(1)} ly</td>
              </tr>
            )}
            {!planet.isSolarSystem && (
              <>
                <tr className="border-t border-white/10">
                  <td className="py-2 opacity-60">Detection Method</td>
                  <td className="py-2 text-right">{formatMethodName(planet.detectionMethod)}</td>
                </tr>
                {planet.discoveryYear > 0 && (
                  <tr className="border-t border-white/10">
                    <td className="py-2 opacity-60">Discovered</td>
                    <td className="py-2 text-right">{planet.discoveryYear}</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Size Comparison */}
      {planet.radius !== undefined && (
        <div className="px-4 pb-4">
          <div className="text-xs opacity-60 mb-2" style={{ color: 'var(--color-text)' }}>
            Size Comparison
          </div>
          <div className="flex items-end gap-3 h-16">
            {/* Planet */}
            <div className="flex flex-col items-center">
              <div
                className="rounded-full"
                style={{
                  width: Math.max(8, Math.min(64, radiusRatio * 16)),
                  height: Math.max(8, Math.min(64, radiusRatio * 16)),
                  backgroundColor: typeColor,
                  opacity: 0.8,
                }}
              />
              <span className="text-[10px] mt-1 opacity-60" style={{ color: 'var(--color-text)' }}>
                {planet.name.split(' ')[0]}
              </span>
            </div>
            {/* Earth reference */}
            <div className="flex flex-col items-center">
              <div
                className="rounded-full"
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: '#3B82F6',
                  opacity: 0.8,
                }}
              />
              <span className="text-[10px] mt-1 opacity-60" style={{ color: 'var(--color-text)' }}>
                Earth
              </span>
            </div>
            {/* Jupiter reference (if planet is large) */}
            {radiusRatio > 5 && (
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full"
                  style={{
                    width: Math.min(64, 11 * 5),
                    height: Math.min(64, 11 * 5),
                    backgroundColor: '#D97706',
                    opacity: 0.5,
                  }}
                />
                <span className="text-[10px] mt-1 opacity-60" style={{ color: 'var(--color-text)' }}>
                  Jupiter
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Orbital Simulation Button */}
      {!planet.isSolarSystem && onViewSimulation && (
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={onViewSimulation}
            className="w-full text-xs flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-background)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
            </svg>
            View Orbital Simulation
          </button>
        </div>
      )}

      {/* NASA Archive Link */}
      {!planet.isSolarSystem && (
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <a
            href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(planet.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-2 hover:underline"
            style={{ color: 'var(--color-accent)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            View on NASA Exoplanet Archive
          </a>
        </div>
      )}
    </motion.div>
  )
}
