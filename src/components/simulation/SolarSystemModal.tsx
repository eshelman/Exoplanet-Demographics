import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulatedSystem, SimulatedPlanet, SimulationSpeed, OrbitalPosition } from '../../types/simulation'
import { SIMULATION_SPEEDS, DEFAULT_SIMULATION_STATE } from '../../types/simulation'
import { OrbitalCanvas } from './OrbitalCanvas'
import { SimulationControls } from './SimulationControls'
import { SystemStatsPanel } from './SystemStatsPanel'
import { useSimulationAudio } from '../../audio'

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
  const [positions, setPositions] = useState<Map<string, OrbitalPosition>>(new Map())

  // Audio integration
  const audio = useSimulationAudio()

  // Throttle position updates to stats panel (every 100ms instead of every frame)
  const lastPositionUpdate = useRef(0)
  const handlePositionsUpdate = useCallback((newPositions: Map<string, OrbitalPosition>) => {
    const now = Date.now()
    if (now - lastPositionUpdate.current > 100) {
      setPositions(newPositions)
      lastPositionUpdate.current = now
    }
  }, [])

  // Reset selected planet when system changes
  useEffect(() => {
    setSelectedPlanet(getInitialPlanet())
  }, [system, initialPlanetId])

  // Start/stop ambient audio when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      audio.openModal()
      audio.startAmbient(system)
      // Start initial planet voice
      audio.selectPlanet(selectedPlanet)
    } else {
      audio.closeModal()
      audio.stopAmbient()
    }
  }, [isOpen, system])

  // Update planet voice when selection changes
  useEffect(() => {
    if (isOpen && selectedPlanet) {
      audio.selectPlanet(selectedPlanet)
    }
  }, [selectedPlanet, isOpen])

  // Callbacks - defined before useEffects that use them
  const navigatePlanet = useCallback(
    (direction: number) => {
      const currentIndex = system.planets.findIndex((p) => p.id === selectedPlanet.id)
      const newIndex = (currentIndex + direction + system.planets.length) % system.planets.length
      setSelectedPlanet(system.planets[newIndex])
    },
    [system.planets, selectedPlanet]
  )

  const adjustSpeed = useCallback((direction: number) => {
    const currentIndex = SIMULATION_SPEEDS.indexOf(speed)
    const newIndex = Math.max(0, Math.min(SIMULATION_SPEEDS.length - 1, currentIndex + direction))
    const newSpeed = SIMULATION_SPEEDS[newIndex]
    if (newSpeed !== speed) {
      setSpeed(newSpeed)
      audio.changeSpeed(newSpeed)
    }
  }, [audio, speed])

  const handleReset = useCallback(() => {
    setSpeed(1)
    setIsPaused(false)
    audio.resume()
    audio.changeSpeed(1)
  }, [audio])

  const handleSpeedChange = useCallback((newSpeed: SimulationSpeed) => {
    setSpeed(newSpeed)
    audio.changeSpeed(newSpeed)
  }, [audio])

  const handlePauseToggle = useCallback(() => {
    if (isPaused) {
      audio.resume()
    } else {
      audio.pause()
    }
    setIsPaused((p) => !p)
  }, [audio, isPaused])

  const handleOrbitsToggle = useCallback(() => {
    audio.toggle(!showOrbits)
    setShowOrbits((s) => !s)
  }, [audio, showOrbits])

  const handleLabelsToggle = useCallback(() => {
    audio.toggle(!showLabels)
    setShowLabels((s) => !s)
  }, [audio, showLabels])

  const handleHabitableZoneToggle = useCallback(() => {
    audio.toggle(!showHabitableZone)
    setShowHabitableZone((s) => !s)
  }, [audio, showHabitableZone])

  const handlePlanetSelect = useCallback((planet: SimulatedPlanet) => {
    setSelectedPlanet(planet)
  }, [])

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
          handlePauseToggle()
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
          handleOrbitsToggle()
          break
        case 'l':
        case 'L':
          e.preventDefault()
          handleLabelsToggle()
          break
        case 'h':
        case 'H':
          e.preventDefault()
          if (system.habitableZone?.dataAvailable) {
            handleHabitableZoneToggle()
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
  }, [isOpen, system, onClose, navigatePlanet, adjustSpeed, handlePauseToggle, handleOrbitsToggle, handleLabelsToggle, handleHabitableZoneToggle, handleReset])

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
                onPositionsUpdate={handlePositionsUpdate}
              />
            </div>

            {/* Statistics Panel */}
            <div className="w-80">
              <SystemStatsPanel
                system={system}
                selectedPlanetId={selectedPlanet.id}
                positions={positions}
                onPlanetSelect={handlePlanetSelect}
              />
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
            onSpeedChange={handleSpeedChange}
            onPauseToggle={handlePauseToggle}
            onOrbitsToggle={handleOrbitsToggle}
            onLabelsToggle={handleLabelsToggle}
            onHabitableZoneToggle={handleHabitableZoneToggle}
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
