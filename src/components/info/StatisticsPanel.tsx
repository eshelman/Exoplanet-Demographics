import { useMemo } from 'react'
import type { Planet } from '../../types'
import { METHOD_COLORS, PLANET_TYPE_COLORS } from '../../utils/scales'
import { useVizStore } from '../../store'
import { useAudio } from '../../audio'

interface StatisticsPanelProps {
  planets: Planet[]
  title?: string
}

// Format large numbers
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

// Method display names
const METHOD_NAMES: Record<string, string> = {
  'radial-velocity': 'Radial Velocity',
  'transit-kepler': 'Transit (Kepler)',
  'transit-other': 'Transit (Other)',
  microlensing: 'Microlensing',
  'direct-imaging': 'Direct Imaging',
  astrometry: 'Astrometry',
}

// Planet type display names
const TYPE_NAMES: Record<string, string> = {
  rocky: 'Rocky',
  'super-earth': 'Super-Earth',
  'sub-neptune': 'Sub-Neptune',
  'neptune-like': 'Neptune-like',
  'hot-jupiter': 'Hot Jupiter',
  'cold-jupiter': 'Cold Jupiter',
  'ultra-short-period': 'Ultra-Short',
}

export function StatisticsPanel({ planets, title = 'Statistics' }: StatisticsPanelProps) {
  const togglePlanetType = useVizStore((s) => s.togglePlanetType)
  const enabledPlanetTypes = useVizStore((s) => s.enabledPlanetTypes)
  const { playToggleOn, playToggleOff } = useAudio()

  const handleTypeClick = (type: string) => {
    const wasEnabled = enabledPlanetTypes.size === 0 || enabledPlanetTypes.has(type)
    togglePlanetType(type)
    if (wasEnabled && enabledPlanetTypes.size > 0) {
      playToggleOff()
    } else {
      playToggleOn()
    }
  }

  const stats = useMemo(() => {
    // Filter out Solar System planets for exoplanet stats
    const exoplanets = planets.filter((p) => !p.isSolarSystem)
    const solarSystem = planets.filter((p) => p.isSolarSystem)

    // Count by detection method
    const byMethod: Record<string, number> = {}
    for (const p of exoplanets) {
      byMethod[p.detectionMethod] = (byMethod[p.detectionMethod] || 0) + 1
    }

    // Count by planet type
    const byType: Record<string, number> = {}
    for (const p of exoplanets) {
      if (p.planetType) {
        byType[p.planetType] = (byType[p.planetType] || 0) + 1
      }
    }

    // Calculate mass/radius/period ranges
    const masses = exoplanets.filter((p) => p.mass).map((p) => p.mass!)
    const radii = exoplanets.filter((p) => p.radius).map((p) => p.radius!)
    const periods = exoplanets.map((p) => p.period)

    // Discovery years
    const years = exoplanets.filter((p) => p.discoveryYear > 0).map((p) => p.discoveryYear)
    const yearRange = years.length > 0 ? { min: Math.min(...years), max: Math.max(...years) } : null

    return {
      total: planets.length,
      exoplanets: exoplanets.length,
      solarSystem: solarSystem.length,
      byMethod,
      byType,
      massRange: masses.length > 0 ? { min: Math.min(...masses), max: Math.max(...masses) } : null,
      radiusRange: radii.length > 0 ? { min: Math.min(...radii), max: Math.max(...radii) } : null,
      periodRange: { min: Math.min(...periods), max: Math.max(...periods) },
      yearRange,
    }
  }, [planets])

  // Sort methods and types by count
  const sortedMethods = Object.entries(stats.byMethod).sort(([, a], [, b]) => b - a)
  const sortedTypes = Object.entries(stats.byType).sort(([, a], [, b]) => b - a)

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--color-background)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
      </div>

      {/* Overview */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              {formatCount(stats.total)}
            </div>
            <div className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
              Total Planets
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {formatCount(stats.exoplanets)}
            </div>
            <div className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
              Exoplanets
            </div>
          </div>
        </div>
      </div>

      {/* By Detection Method */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="text-xs uppercase tracking-wide opacity-50 mb-2" style={{ color: 'var(--color-text)' }}>
          By Detection Method
        </div>
        <div className="space-y-2">
          {sortedMethods.slice(0, 5).map(([method, count]) => (
            <div key={method} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: METHOD_COLORS[method] || '#666' }}
              />
              <span className="text-xs flex-1" style={{ color: 'var(--color-text)' }}>
                {METHOD_NAMES[method] || method}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                {count}
              </span>
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(count / stats.exoplanets) * 100}%`,
                    backgroundColor: METHOD_COLORS[method] || '#666',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Planet Type */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="text-xs uppercase tracking-wide opacity-50 mb-2" style={{ color: 'var(--color-text)' }}>
          By Planet Type <span className="normal-case opacity-60">(click to filter)</span>
        </div>
        <div className="space-y-1">
          {sortedTypes.slice(0, 7).map(([type, count]) => {
            // When no types selected, all are "enabled". Otherwise check the set.
            const isEnabled = enabledPlanetTypes.size === 0 || enabledPlanetTypes.has(type)
            return (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                className="w-full flex items-center gap-2 px-2 py-1 rounded transition-all hover:bg-white/5"
                style={{ opacity: isEnabled ? 1 : 0.3 }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PLANET_TYPE_COLORS[type] || '#666' }}
                />
                <span className="text-xs flex-1 text-left" style={{ color: 'var(--color-text)' }}>
                  {TYPE_NAMES[type] || type}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                  {count}
                </span>
                <div className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(count / stats.exoplanets) * 100}%`,
                      backgroundColor: PLANET_TYPE_COLORS[type] || '#666',
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
        {enabledPlanetTypes.size > 0 && (
          <button
            onClick={() => {
              // Clear all filters by toggling each enabled type off
              enabledPlanetTypes.forEach((type) => togglePlanetType(type))
              playToggleOn()
            }}
            className="mt-2 text-xs opacity-60 hover:opacity-100 underline"
            style={{ color: 'var(--color-text)' }}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Parameter Ranges */}
      <div className="px-4 py-3">
        <div className="text-xs uppercase tracking-wide opacity-50 mb-2" style={{ color: 'var(--color-text)' }}>
          Parameter Ranges
        </div>
        <div className="space-y-1 text-xs" style={{ color: 'var(--color-text)' }}>
          {stats.massRange && (
            <div className="flex justify-between">
              <span className="opacity-60">Mass:</span>
              <span>{stats.massRange.min.toFixed(1)} - {stats.massRange.max.toFixed(0)} M⊕</span>
            </div>
          )}
          {stats.radiusRange && (
            <div className="flex justify-between">
              <span className="opacity-60">Radius:</span>
              <span>{stats.radiusRange.min.toFixed(1)} - {stats.radiusRange.max.toFixed(1)} R⊕</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="opacity-60">Period:</span>
            <span>{stats.periodRange.min.toFixed(1)} - {stats.periodRange.max.toFixed(0)} days</span>
          </div>
          {stats.yearRange && (
            <div className="flex justify-between">
              <span className="opacity-60">Discovered:</span>
              <span>{stats.yearRange.min} - {stats.yearRange.max}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
