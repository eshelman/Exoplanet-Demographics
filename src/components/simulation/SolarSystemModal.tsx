import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulatedSystem, SimulatedPlanet, SimulationSpeed } from '../../types/simulation'
import { SIMULATION_SPEEDS, DEFAULT_SIMULATION_STATE } from '../../types/simulation'
import { OrbitalCanvas } from './OrbitalCanvas'
import { SimulationControls } from './SimulationControls'

interface SolarSystemModalProps {
  system: SimulatedSystem
  initialPlanetId?: string
  isOpen: boolean
  onClose: () => void
}

export function SolarSystemModal({
  system,
  initialPlanetId,
  isOpen,
  onClose,
}: SolarSystemModalProps) {
  // Find initial planet or default to first
  const getInitialPlanet = () => {
    if (initialPlanetId) {
      return system.planets.find((p) => p.id === initialPlanetId) || system.planets[0]
    }
    return system.planets[0]
  }

  const [selectedPlanet, setSelectedPlanet] = useState<SimulatedPlanet>(getInitialPlanet)
  const [speed, setSpeed] = useState<SimulationSpeed>(DEFAULT_SIMULATION_STATE.speed as SimulationSpeed)
  const [isPaused, setIsPaused] = useState(DEFAULT_SIMULATION_STATE.isPaused)
  const [showOrbits, setShowOrbits] = useState(DEFAULT_SIMULATION_STATE.showOrbits)
  const [showLabels, setShowLabels] = useState(DEFAULT_SIMULATION_STATE.showLabels)
  const [showHabitableZone, setShowHabitableZone] = useState(DEFAULT_SIMULATION_STATE.showHabitableZone)

  // Reset selected planet when system changes
  useEffect(() => {
    setSelectedPlanet(getInitialPlanet())
  }, [system, initialPlanetId])

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case ' ':
          e.preventDefault()
          setIsPaused((p) => !p)
          break
        case 'ArrowLeft':
          e.preventDefault()
          navigatePlanet(-1)
          break
        case 'ArrowRight':
          e.preventDefault()
          navigatePlanet(1)
          break
        case 'ArrowUp':
          e.preventDefault()
          adjustSpeed(1)
          break
        case 'ArrowDown':
          e.preventDefault()
          adjustSpeed(-1)
          break
        case 'o':
        case 'O':
          e.preventDefault()
          setShowOrbits((s) => !s)
          break
        case 'l':
        case 'L':
          e.preventDefault()
          setShowLabels((s) => !s)
          break
        case 'h':
        case 'H':
          e.preventDefault()
          if (system.habitableZone?.dataAvailable) {
            setShowHabitableZone((s) => !s)
          }
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleReset()
          break
        default:
          // Number keys 1-9 for planet selection
          if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1
            if (index < system.planets.length) {
              setSelectedPlanet(system.planets[index])
            }
          }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, system.planets, selectedPlanet])

  const navigatePlanet = useCallback(
    (direction: number) => {
      const currentIndex = system.planets.findIndex((p) => p.id === selectedPlanet.id)
      const newIndex = (currentIndex + direction + system.planets.length) % system.planets.length
      setSelectedPlanet(system.planets[newIndex])
    },
    [system.planets, selectedPlanet]
  )

  const adjustSpeed = useCallback((direction: number) => {
    setSpeed((currentSpeed) => {
      const currentIndex = SIMULATION_SPEEDS.indexOf(currentSpeed)
      const newIndex = Math.max(0, Math.min(SIMULATION_SPEEDS.length - 1, currentIndex + direction))
      return SIMULATION_SPEEDS[newIndex]
    })
  }, [])

  const handleReset = useCallback(() => {
    setSpeed(1)
    setIsPaused(false)
  }, [])

  const handlePlanetSelect = useCallback((planet: SimulatedPlanet) => {
    setSelectedPlanet(planet)
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal content */}
        <motion.div
          className="relative flex flex-col h-full"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 z-10"
            style={{
              backgroundColor: 'rgba(10, 15, 28, 0.95)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div>
              <h2
                className="text-xl font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                {system.hostStar}
              </h2>
              <p className="text-sm opacity-60" style={{ color: 'var(--color-text)' }}>
                {system.planets.length} planet{system.planets.length !== 1 ? 's' : ''}
                {system.distance && ` • ${system.distance.toFixed(1)} light-years`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Help button */}
              <button
                className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
                title="Keyboard shortcuts"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Close (Esc)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Orbital canvas */}
            <div className="flex-1">
              <OrbitalCanvas
                system={system}
                selectedPlanetId={selectedPlanet.id}
                speed={speed}
                isPaused={isPaused}
                showOrbits={showOrbits}
                showLabels={showLabels}
                showHabitableZone={showHabitableZone}
                onPlanetSelect={handlePlanetSelect}
              />
            </div>

            {/* Stats panel placeholder (Phase 4) */}
            <div
              className="w-80 overflow-y-auto"
              style={{
                backgroundColor: 'rgba(10, 15, 28, 0.95)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="p-4">
                <h3
                  className="text-sm font-medium uppercase tracking-wider mb-4 opacity-60"
                  style={{ color: 'var(--color-text)' }}
                >
                  Selected Planet
                </h3>

                <div className="space-y-3">
                  <div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {selectedPlanet.name}
                    </div>
                    <div className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>
                      {selectedPlanet.planetType || 'Unknown type'}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm" style={{ color: 'var(--color-text)' }}>
                    <StatRow label="Period" value={`${selectedPlanet.period.toFixed(2)} days`} />
                    <StatRow label="Semi-major axis" value={`${selectedPlanet.semiMajorAxis.toFixed(3)} AU`} />
                    <StatRow
                      label="Eccentricity"
                      value={selectedPlanet.eccentricity.toFixed(3)}
                      estimated={selectedPlanet.eccentricityEstimated}
                    />
                    {selectedPlanet.mass && (
                      <StatRow label="Mass" value={`${selectedPlanet.mass.toFixed(2)} M⊕`} />
                    )}
                    {selectedPlanet.radius && (
                      <StatRow
                        label="Radius"
                        value={`${selectedPlanet.radius.toFixed(2)} R⊕`}
                        estimated={selectedPlanet.radiusEstimated}
                      />
                    )}
                  </div>
                </div>

                {/* Planet list */}
                <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <h4 className="text-xs font-medium uppercase tracking-wider mb-3 opacity-60">
                    All Planets
                  </h4>
                  <div className="space-y-1">
                    {system.planets.map((planet, index) => (
                      <button
                        key={planet.id}
                        onClick={() => setSelectedPlanet(planet)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded text-sm text-left transition-colors"
                        style={{
                          backgroundColor: planet.id === selectedPlanet.id ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                          color: planet.id === selectedPlanet.id ? 'var(--color-accent)' : 'var(--color-text)',
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="opacity-40 text-xs">{index + 1}</span>
                          {planet.name}
                        </span>
                        <span className="text-xs opacity-50">
                          {planet.period.toFixed(1)}d
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <SimulationControls
            speed={speed}
            isPaused={isPaused}
            showOrbits={showOrbits}
            showLabels={showLabels}
            showHabitableZone={showHabitableZone}
            habitableZoneAvailable={system.habitableZone?.dataAvailable || false}
            onSpeedChange={setSpeed}
            onPauseToggle={() => setIsPaused((p) => !p)}
            onOrbitsToggle={() => setShowOrbits((s) => !s)}
            onLabelsToggle={() => setShowLabels((s) => !s)}
            onHabitableZoneToggle={() => setShowHabitableZone((s) => !s)}
            onReset={handleReset}
          />

          {/* Keyboard hint */}
          <div
            className="text-center py-2 text-xs opacity-40"
            style={{
              backgroundColor: 'rgba(10, 15, 28, 0.95)',
              color: 'var(--color-text)',
            }}
          >
            ←→ Navigate planets • ↑↓ Adjust speed • Space Pause • O/L/H Toggles • Esc Close
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface StatRowProps {
  label: string
  value: string
  estimated?: boolean
}

function StatRow({ label, value, estimated }: StatRowProps) {
  return (
    <div className="flex justify-between">
      <span className="opacity-60">{label}</span>
      <span className={estimated ? 'italic opacity-70' : ''}>
        {value}
        {estimated && <span className="ml-1 text-xs opacity-50">~</span>}
      </span>
    </div>
  )
}
