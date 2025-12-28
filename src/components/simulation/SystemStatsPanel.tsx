import { useState, memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulatedSystem, SimulatedPlanet, OrbitalPosition } from '../../types/simulation'
import { PLANET_TYPE_COLORS } from '../../utils/scales'
import { getSpectralTypeFromTemperature } from '../../utils/starColors'
import { isPlanetInHabitableZone } from '../../utils/habitableZone'

interface SystemStatsPanelProps {
  system: SimulatedSystem
  selectedPlanetId: string
  positions: Map<string, OrbitalPosition>
  onPlanetSelect: (planet: SimulatedPlanet) => void
}

export const SystemStatsPanel = memo(function SystemStatsPanel({
  system,
  selectedPlanetId,
  positions,
  onPlanetSelect,
}: SystemStatsPanelProps) {
  const [expandedPlanetId, setExpandedPlanetId] = useState<string | null>(selectedPlanetId)

  const toggleExpanded = useCallback((planetId: string) => {
    setExpandedPlanetId((current) => (current === planetId ? null : planetId))
  }, [])

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        backgroundColor: 'rgba(10, 15, 28, 0.95)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* System Header */}
      <div
        className="px-4 py-3 sticky top-0 z-10"
        style={{
          backgroundColor: 'rgba(10, 15, 28, 0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          {system.hostStar}
        </h2>
        <p className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>
          {system.planets.length} planet{system.planets.length !== 1 ? 's' : ''}
          {system.distance && ` • ${system.distance.toFixed(1)} light-years`}
        </p>
      </div>

      {/* Host Star Section */}
      <HostStarSection system={system} />

      {/* System Characteristics */}
      <SystemCharacteristics system={system} />

      {/* Planets Section */}
      <div className="px-4 py-3">
        <SectionHeader title="Planets" count={system.planets.length} />

        <div className="space-y-2 mt-3">
          {system.planets.map((planet) => (
            <PlanetEntry
              key={planet.id}
              planet={planet}
              isSelected={planet.id === selectedPlanetId}
              isExpanded={planet.id === expandedPlanetId}
              position={positions.get(planet.id)}
              inHabitableZone={
                system.habitableZone
                  ? isPlanetInHabitableZone(planet.semiMajorAxis, system.habitableZone)
                  : false
              }
              onSelect={() => onPlanetSelect(planet)}
              onToggleExpand={() => toggleExpanded(planet.id)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        className="px-4 py-3 mt-2 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-2 text-xs opacity-50" style={{ color: 'var(--color-text)' }}>
          <span className="italic">Italic</span>
          <span>= Estimated value</span>
        </div>
      </div>
    </div>
  )
})

// Section Header Component
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div
      className="text-xs font-medium uppercase tracking-wider opacity-50 flex items-center gap-2"
      style={{ color: 'var(--color-text)' }}
    >
      {title}
      {count !== undefined && (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10">{count}</span>
      )}
    </div>
  )
}

// Host Star Section
function HostStarSection({ system }: { system: SimulatedSystem }) {
  const spectralType = system.starSpectralType || getSpectralTypeFromTemperature(system.starTemperature)

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
      <SectionHeader title="Host Star" />

      <div className="mt-3 space-y-1.5 text-sm" style={{ color: 'var(--color-text)' }}>
        <DataRow label="Mass" value={`${system.starMass.toFixed(2)} M\u2609`} />
        <DataRow
          label="Radius"
          value={`${system.starRadius.toFixed(2)} R\u2609`}
          estimated={system.starRadiusEstimated}
          tooltip="Estimated from stellar mass using mass-radius relation"
        />
        <DataRow
          label="Temperature"
          value={`${Math.round(system.starTemperature)} K`}
          estimated={system.starTemperatureEstimated}
          tooltip="Estimated from spectral type or stellar mass"
        />
        <DataRow
          label="Spectral Type"
          value={spectralType}
          estimated={!system.starSpectralType}
          tooltip="Derived from effective temperature"
        />
        {system.distance && <DataRow label="Distance" value={`${system.distance.toFixed(1)} ly`} />}

        {/* Binary system indicator */}
        {system.isBinarySystem && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 text-xs">
              <span className="opacity-60">Binary System:</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                {system.binaryType === 'close' ? 'Close Binary' : 'Distant Companion'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// System Characteristics
function SystemCharacteristics({ system }: { system: SimulatedSystem }) {
  const characteristics = []

  if (system.isMultiPlanet) {
    characteristics.push({ label: 'Multi-planet', color: '#60A5FA' })
  }
  if (system.hasEccentricOrbits) {
    characteristics.push({ label: 'Eccentric orbits', color: '#F59E0B' })
  }
  if (system.hasResonantPair) {
    characteristics.push({ label: 'Orbital resonance', color: '#8B5CF6' })
  }
  if (system.hasPlanetsInHZ) {
    characteristics.push({ label: 'HZ planet(s)', color: '#10B981' })
  }

  if (characteristics.length === 0) return null

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
      <SectionHeader title="Characteristics" />
      <div className="flex flex-wrap gap-1.5 mt-2">
        {characteristics.map((c) => (
          <span
            key={c.label}
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${c.color}20`, color: c.color }}
          >
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// Planet Entry Component
interface PlanetEntryProps {
  planet: SimulatedPlanet
  isSelected: boolean
  isExpanded: boolean
  position?: OrbitalPosition
  inHabitableZone: boolean
  onSelect: () => void
  onToggleExpand: () => void
}

function PlanetEntry({
  planet,
  isSelected,
  isExpanded,
  position,
  inHabitableZone,
  onSelect,
  onToggleExpand,
}: PlanetEntryProps) {
  const color = PLANET_TYPE_COLORS[planet.planetType || ''] || '#888888'

  return (
    <div
      className="rounded-lg overflow-hidden transition-colors"
      style={{
        backgroundColor: isSelected ? `${color}15` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? `${color}40` : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      {/* Planet Header (clickable) */}
      <button
        onClick={onSelect}
        className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/5"
      >
        {/* Planet indicator */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* Planet name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium truncate"
              style={{ color: isSelected ? color : 'var(--color-text)' }}
            >
              {planet.name}
            </span>
            {inHabitableZone && (
              <span
                className="text-[10px] px-1 py-0.5 rounded bg-green-500/20 text-green-400"
                title="In habitable zone"
              >
                HZ
              </span>
            )}
          </div>
          <div className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>
            {planet.planetType?.replace(/-/g, ' ') || 'Unknown type'}
          </div>
        </div>

        {/* Quick stats */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
            {formatPeriod(planet.period)}
          </div>
          <div className="text-[10px] opacity-50" style={{ color: 'var(--color-text)' }}>
            {planet.semiMajorAxis.toFixed(2)} AU
          </div>
        </div>

        {/* Expand toggle */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              onToggleExpand()
            }
          }}
          className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
          style={{ color: 'var(--color-text)' }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-3 pb-3 pt-1 space-y-3 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              {/* Real-time data */}
              {position && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">
                    Current State
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <DataRow
                      label="Distance"
                      value={`${position.r.toFixed(3)} AU`}
                      small
                    />
                    <DataRow
                      label="Velocity"
                      value={`${position.velocity.toFixed(1)} km/s`}
                      small
                    />
                  </div>
                </div>
              )}

              {/* Orbital elements */}
              <div>
                <div className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">
                  Orbital Elements
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <DataRow label="Period" value={`${planet.period.toFixed(2)} days`} small />
                  <DataRow label="Semi-major axis" value={`${planet.semiMajorAxis.toFixed(3)} AU`} small />
                  <DataRow
                    label="Eccentricity"
                    value={planet.eccentricity.toFixed(3)}
                    estimated={planet.eccentricityEstimated}
                    tooltip="Assumed circular orbit (e=0) when not measured"
                    small
                  />
                  <DataRow
                    label="Inclination"
                    value={`${planet.inclination.toFixed(1)}°`}
                    estimated={planet.inclinationEstimated}
                    tooltip="Estimated from detection method. Transit: ~90°, RV: randomized"
                    small
                  />
                </div>
              </div>

              {/* Physical properties */}
              {(planet.mass || planet.radius) && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-40 mb-1.5">
                    Physical Properties
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {planet.mass && (
                      <DataRow label="Mass" value={`${planet.mass.toFixed(2)} M⊕`} small />
                    )}
                    {planet.radius && (
                      <DataRow
                        label="Radius"
                        value={`${planet.radius.toFixed(2)} R⊕`}
                        estimated={planet.radiusEstimated}
                        tooltip="Estimated from mass using empirical mass-radius relation"
                        small
                      />
                    )}
                    {planet.mass && planet.radius && (
                      <DataRow
                        label="Density"
                        value={`${(planet.mass / Math.pow(planet.radius, 3)).toFixed(2)} ρ⊕`}
                        small
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Data Row Component with estimation support
interface DataRowProps {
  label: string
  value: string
  estimated?: boolean
  tooltip?: string
  small?: boolean
}

function DataRow({ label, value, estimated, tooltip, small }: DataRowProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className={`flex justify-between gap-2 ${small ? 'text-xs' : 'text-sm'}`}
      style={{ color: 'var(--color-text)' }}
    >
      <span className="opacity-60">{label}</span>
      <span
        className={`relative ${estimated ? 'italic opacity-70' : ''}`}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {value}
        {estimated && (
          <span className="ml-1 text-[10px] opacity-50" title={tooltip}>
            ~
          </span>
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute right-0 top-full mt-1 z-50 w-48 p-2 rounded text-xs text-left normal-case not-italic"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'var(--color-text)',
                opacity: 1,
              }}
            >
              {tooltip}
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </div>
  )
}

// Helper to format orbital period
function formatPeriod(days: number): string {
  if (days < 1) {
    return `${(days * 24).toFixed(1)} hours`
  } else if (days < 365) {
    return `${days.toFixed(1)} days`
  } else {
    return `${(days / 365.25).toFixed(2)} years`
  }
}
