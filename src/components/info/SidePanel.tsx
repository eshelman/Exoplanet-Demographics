import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Planet, DetectionMethodId } from '../../types'
import { OccurrenceRateHeatmap, EtaEarthTimeline } from '../charts'
import { PlanetIcon } from './PlanetIcon'
import { useAudio } from '../../audio'
import { useVizStore } from '../../store'
import { METHOD_COLORS, PLANET_TYPE_COLORS } from '../../utils/scales'

interface SidePanelProps {
  planets: Planet[]
  totalPlanets: number
}

// Planet type data
const PLANET_TYPES = [
  { id: 'rocky', name: 'Rocky', occurrence: '~15%' },
  { id: 'super-earth', name: 'Super-Earth', occurrence: '~30%' },
  { id: 'sub-neptune', name: 'Sub-Neptune', occurrence: '~35%' },
  { id: 'neptune-like', name: 'Neptune-like', occurrence: '~6%' },
  { id: 'hot-jupiter', name: 'Hot Jupiter', occurrence: '~1%' },
  { id: 'cold-jupiter', name: 'Cold Jupiter', occurrence: '~10%' },
]

// Detection methods - terminology from "The Demographics of Exoplanets" paper
const DETECTION_METHODS: { id: DetectionMethodId; name: string }[] = [
  { id: 'radial-velocity', name: 'Radial Velocity' },
  { id: 'transit-kepler', name: 'Transit (Kepler/K2)' },
  { id: 'transit-other', name: 'Transit (TESS/Other)' },
  { id: 'microlensing', name: 'Microlensing' },
  { id: 'direct-imaging', name: 'Direct Imaging' },
  { id: 'astrometry', name: 'Astrometry' },
  { id: 'other', name: 'Other Methods' },
]

export function SidePanel({ planets, totalPlanets }: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const { playSidebarOpen, playSidebarClose, playToggleOn, playToggleOff } = useAudio()

  // Planet type filtering from store
  const togglePlanetType = useVizStore((s) => s.togglePlanetType)
  const enabledPlanetTypes = useVizStore((s) => s.enabledPlanetTypes)

  // Detection method filtering from store
  const toggleMethod = useVizStore((s) => s.toggleMethod)
  const enabledMethods = useVizStore((s) => s.enabledMethods)
  const enableAllMethods = useVizStore((s) => s.enableAllMethods)

  const handleTypeClick = (typeId: string) => {
    const wasEnabled = enabledPlanetTypes.size === 0 || enabledPlanetTypes.has(typeId)
    togglePlanetType(typeId)
    if (wasEnabled && enabledPlanetTypes.size > 0) {
      playToggleOff()
    } else {
      playToggleOn()
    }
  }

  const handleMethodClick = (methodId: DetectionMethodId) => {
    const wasEnabled = enabledMethods.has(methodId)
    toggleMethod(methodId)
    wasEnabled ? playToggleOff() : playToggleOn()
  }

  // Compute stats
  const stats = useMemo(() => {
    const exoplanets = planets.filter((p) => !p.isSolarSystem)

    // Count by detection method
    const byMethod: Record<string, number> = {}
    for (const p of exoplanets) {
      byMethod[p.detectionMethod] = (byMethod[p.detectionMethod] || 0) + 1
    }

    // Parameter ranges
    const masses = exoplanets.filter((p) => p.mass).map((p) => p.mass!)
    const radii = exoplanets.filter((p) => p.radius).map((p) => p.radius!)
    const periods = exoplanets.map((p) => p.period)
    const years = exoplanets.filter((p) => p.discoveryYear > 0).map((p) => p.discoveryYear)

    return {
      total: planets.length,
      exoplanets: exoplanets.length,
      byMethod,
      massRange: masses.length > 0 ? { min: Math.min(...masses), max: Math.max(...masses) } : null,
      radiusRange: radii.length > 0 ? { min: Math.min(...radii), max: Math.max(...radii) } : null,
      periodRange: { min: Math.min(...periods), max: Math.max(...periods) },
      yearRange: years.length > 0 ? { min: Math.min(...years), max: Math.max(...years) } : null,
    }
  }, [planets])

  const hasActiveFilter = enabledPlanetTypes.size > 0

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 48 : 320 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-full"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => {
          const wasCollapsed = isCollapsed
          setIsCollapsed(!isCollapsed)
          wasCollapsed ? playSidebarOpen() : playSidebarClose()
        }}
        className="absolute -left-3 top-4 z-10 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'var(--color-text)',
        }}
        title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Collapsed State */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-4 gap-4"
          >
            <div
              className="text-xs font-medium tracking-widest"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                color: 'var(--color-text)',
                opacity: 0.6,
              }}
            >
              STATS
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Stats Content */}
            <div className="flex-1 overflow-y-auto">
              <div
                className="divide-y"
                style={{ color: 'var(--color-text)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                    {/* 1. Total Planets */}
                    <div className="px-4 py-3">
                      <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                        {stats.total.toLocaleString()}
                        {stats.total < totalPlanets && (
                          <span className="text-lg font-normal opacity-60">
                            {' '}of {totalPlanets.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-60">Planets Visible</div>
                    </div>

                    {/* 2. Size Comparison */}
                    <div className="px-4 py-3">
                      <div className="text-xs uppercase tracking-wide opacity-50 mb-3">
                        Size Comparison
                      </div>
                      <div className="flex items-end justify-around h-12">
                        {[
                          { id: 'rocky', label: 'R', size: 8 },
                          { id: 'super-earth', label: 'SE', size: 12 },
                          { id: 'sub-neptune', label: 'SN', size: 20 },
                          { id: 'neptune-like', label: 'N', size: 28 },
                          { id: 'cold-jupiter', label: 'J', size: 40 },
                        ].map((t) => (
                          <div key={t.id} className="flex flex-col items-center">
                            <div
                              className="rounded-full"
                              style={{
                                width: t.size,
                                height: t.size,
                                backgroundColor: PLANET_TYPE_COLORS[t.id],
                              }}
                            />
                            <span className="text-[9px] mt-1 opacity-50">{t.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Planet Types (clickable filter) */}
                    <div className="px-4 py-3">
                      <div className="text-xs uppercase tracking-wide opacity-50 mb-2">
                        Planet Types <span className="normal-case opacity-60">(click to filter)</span>
                      </div>
                      <div className="space-y-1">
                        {PLANET_TYPES.map((type) => {
                          const isEnabled = !hasActiveFilter || enabledPlanetTypes.has(type.id)
                          const isSelected = !hasActiveFilter || enabledPlanetTypes.has(type.id)
                          const color = PLANET_TYPE_COLORS[type.id] || '#888'

                          return (
                            <button
                              key={type.id}
                              onClick={() => handleTypeClick(type.id)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all hover:bg-white/5"
                              style={{
                                opacity: isEnabled ? 1 : 0.3,
                                backgroundColor: isSelected ? `${color}15` : 'transparent',
                                border: `1px solid ${isSelected ? `${color}40` : 'transparent'}`,
                              }}
                            >
                              <PlanetIcon type={type.id} size={20} />
                              <span className="text-xs flex-1 text-left">{type.name}</span>
                              <span className="text-xs font-medium" style={{ color }}>
                                {type.occurrence}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {hasActiveFilter && (
                        <button
                          onClick={() => {
                            enabledPlanetTypes.forEach((type) => togglePlanetType(type))
                            playToggleOn()
                          }}
                          className="mt-2 text-xs opacity-60 hover:opacity-100 underline"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>

                    {/* 4. By Detection Method (clickable filter) */}
                    <div className="px-4 py-3">
                      <div className="text-xs uppercase tracking-wide opacity-50 mb-2">
                        Detection Method <span className="normal-case opacity-60">(click to filter)</span>
                      </div>
                      <div className="space-y-1">
                        {DETECTION_METHODS.map((method) => {
                          const count = stats.byMethod[method.id] || 0
                          const isEnabled = enabledMethods.has(method.id)
                          const color = METHOD_COLORS[method.id] || '#666'

                          return (
                            <button
                              key={method.id}
                              onClick={() => handleMethodClick(method.id)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all hover:bg-white/5"
                              style={{
                                opacity: isEnabled ? 1 : 0.3,
                                backgroundColor: isEnabled ? `${color}15` : 'transparent',
                                border: `1px solid ${isEnabled ? `${color}40` : 'transparent'}`,
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs flex-1 text-left">{method.name}</span>
                              <span className="text-xs font-medium">{count}</span>
                              <div
                                className="w-12 h-1.5 rounded-full overflow-hidden flex-shrink-0"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(count / stats.exoplanets) * 100}%`,
                                    backgroundColor: color,
                                  }}
                                />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      {enabledMethods.size < DETECTION_METHODS.length && (
                        <button
                          onClick={() => {
                            enableAllMethods()
                            playToggleOn()
                          }}
                          className="mt-2 text-xs opacity-60 hover:opacity-100 underline"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>

                    {/* 5. Parameter Ranges */}
                    <div className="px-4 py-3">
                      <div className="text-xs uppercase tracking-wide opacity-50 mb-2">
                        Parameter Ranges
                      </div>
                      <div className="space-y-1 text-xs">
                        {stats.massRange && (
                          <div className="flex justify-between">
                            <span className="opacity-60">Mass:</span>
                            <span>{stats.massRange.min.toFixed(1)} – {stats.massRange.max.toFixed(0)} M⊕</span>
                          </div>
                        )}
                        {stats.radiusRange && (
                          <div className="flex justify-between">
                            <span className="opacity-60">Radius:</span>
                            <span>{stats.radiusRange.min.toFixed(1)} – {stats.radiusRange.max.toFixed(1)} R⊕</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="opacity-60">Period:</span>
                          <span>{stats.periodRange.min.toFixed(1)} – {stats.periodRange.max.toFixed(0)} days</span>
                        </div>
                        {stats.yearRange && (
                          <div className="flex justify-between">
                            <span className="opacity-60">Discovered:</span>
                            <span>{stats.yearRange.min} – {stats.yearRange.max}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 6. Occurrence Rates */}
                    <div className="px-4 py-3">
                      <OccurrenceRateHeatmap compact />
                    </div>

                {/* 7. Eta-Earth Estimates */}
                <div className="px-4 py-3">
                  <EtaEarthTimeline compact />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
