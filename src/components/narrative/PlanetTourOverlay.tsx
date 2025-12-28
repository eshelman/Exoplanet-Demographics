import { useEffect, useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVizStore, PLANET_TOUR_STEPS } from '../../store/vizStore'
import { PLANET_TOUR_CONTENT, getPlanetTourStepContent } from './planetTourContent'
import { buildSimulatedSystem, groupPlanetsBySystem } from '../../utils/systemGrouping'
import { loadExoplanets } from '../../utils'
import { useAudio } from '../../audio'
import type { Planet } from '../../types'
import type { SimulatedSystem, SimulatedPlanet, SimulationSpeed } from '../../types/simulation'

export function PlanetTourOverlay() {
  const [planets, setPlanets] = useState<Planet[]>([])

  // Load planets on mount
  useEffect(() => {
    loadExoplanets().then(setPlanets)
  }, [])
  const planetTourMode = useVizStore((s) => s.planetTourMode)
  const planetTourStep = useVizStore((s) => s.planetTourStep)
  const nextPlanetTourStep = useVizStore((s) => s.nextPlanetTourStep)
  const prevPlanetTourStep = useVizStore((s) => s.prevPlanetTourStep)
  const exitPlanetTour = useVizStore((s) => s.exitPlanetTour)
  const openSimulation = useVizStore((s) => s.openSimulation)
  const closeSimulation = useVizStore((s) => s.closeSimulation)
  const simulationOpen = useVizStore((s) => s.simulationOpen)

  const { playClick } = useAudio()

  const currentStepId = PLANET_TOUR_STEPS[planetTourStep]
  const currentContent = getPlanetTourStepContent(currentStepId)
  const totalSteps = PLANET_TOUR_STEPS.length
  const isFirstStep = planetTourStep === 0
  const isLastStep = planetTourStep === totalSteps - 1

  // Check if current step has a system to show
  const hasSystem = currentContent?.systemConfig !== undefined

  // Memoize the system preparation to avoid recalculating on every render
  const currentSystem = useMemo((): SimulatedSystem | null => {
    if (!currentContent?.systemConfig || !planets.length) return null

    const config = currentContent.systemConfig
    try {
      // Group planets by system and find the matching one
      const systems = groupPlanetsBySystem(planets)
      const systemPlanets = systems.get(config.hostStar)

      if (!systemPlanets || systemPlanets.length === 0) {
        console.warn(`[PlanetTourOverlay] Could not find system: ${config.hostStar}`)
        return null
      }

      return buildSimulatedSystem(config.hostStar, systemPlanets)
    } catch (e) {
      console.warn(`[PlanetTourOverlay] Error building system: ${config.hostStar}`, e)
      return null
    }
  }, [currentContent?.systemConfig, planets])

  // Open/close simulation based on current step
  useEffect(() => {
    if (!planetTourMode) return

    if (currentSystem && currentContent?.systemConfig) {
      const config = currentContent.systemConfig
      // Find the planet to highlight
      let planetId = currentSystem.planets[0]?.id || ''
      if (config.highlightPlanet) {
        const matchingPlanet = currentSystem.planets.find(
          (p: SimulatedPlanet) => p.name.endsWith(` ${config.highlightPlanet}`) || p.name.endsWith(config.highlightPlanet!)
        )
        if (matchingPlanet) {
          planetId = matchingPlanet.id
        }
      }
      openSimulation(currentSystem, planetId, config.initialSpeed as SimulationSpeed | undefined)
    } else {
      // No system for this step, close simulation
      closeSimulation()
    }
  }, [planetTourStep, planetTourMode, currentSystem])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!planetTourMode) return
      // Don't intercept if simulation modal has focus for its own controls
      // Allow arrow left/right for navigation
      switch (e.key) {
        case 'ArrowRight':
          if (!simulationOpen) {
            e.preventDefault()
            if (!isLastStep) nextPlanetTourStep()
          }
          break
        case 'ArrowLeft':
          if (!simulationOpen) {
            e.preventDefault()
            if (!isFirstStep) prevPlanetTourStep()
          }
          break
        case 'Escape':
          e.preventDefault()
          exitPlanetTour()
          break
      }
    },
    [planetTourMode, simulationOpen, isFirstStep, isLastStep, nextPlanetTourStep, prevPlanetTourStep, exitPlanetTour]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!planetTourMode || !currentContent) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] pointer-events-none"
      >
        {/* Semi-transparent backdrop - only on left where panel is */}
        {!simulationOpen && (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)',
            }}
          />
        )}

        {/* Content panel - narrower when simulation is open */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute left-0 top-0 bottom-0 p-6 flex flex-col pointer-events-auto"
          style={{
            width: simulationOpen ? '320px' : '400px',
            backgroundColor: 'rgba(10, 15, 28, 0.98)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            zIndex: 110, // Above simulation modal
          }}
        >
          {/* Header with exit button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: 'var(--color-accent)' }}
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
              </svg>
              <div
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: 'var(--color-accent)' }}
              >
                Planet Tour
              </div>
            </div>
            <button
              onClick={() => {
                playClick()
                exitPlanetTour()
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: 'var(--color-text)' }}
              title="Exit tour (Esc)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step dots */}
          <div className="flex justify-between mb-6">
            {PLANET_TOUR_CONTENT.map((step, i) => (
              <button
                key={step.id}
                onClick={() => {
                  playClick()
                  useVizStore.getState().goToPlanetTourStep(i)
                }}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i <= planetTourStep ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
                  transform: i === planetTourStep ? 'scale(1.5)' : 'scale(1)',
                }}
                title={step.title}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step counter */}
                <div
                  className="text-xs mb-2 opacity-50"
                  style={{ color: 'var(--color-text)' }}
                >
                  Stop {planetTourStep + 1} of {totalSteps}
                </div>

                {/* Title */}
                <h2
                  className="text-xl font-semibold mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  {currentContent.title}
                </h2>

                {/* Subtitle */}
                {currentContent.subtitle && (
                  <p
                    className="text-sm mb-4 opacity-70"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {currentContent.subtitle}
                  </p>
                )}

                {/* Content */}
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: 'var(--color-text)', opacity: 0.9 }}
                >
                  {currentContent.content}
                </p>

                {/* Learn More */}
                {currentContent.learnMore && (
                  <details className="group">
                    <summary
                      className="text-xs font-medium cursor-pointer mb-2 flex items-center gap-1"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="transition-transform group-open:rotate-90"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                      Learn More
                    </summary>
                    <p
                      className="text-xs leading-relaxed pl-4 opacity-70"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {currentContent.learnMore}
                    </p>
                  </details>
                )}

                {/* System indicator */}
                {hasSystem && currentSystem && (
                  <div
                    className="mt-4 p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Viewing: {currentSystem.hostStar}
                      </span>
                    </div>
                    <div
                      className="text-xs mt-1 opacity-60"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {currentSystem.planets.length} planet{currentSystem.planets.length !== 1 ? 's' : ''}
                      {currentSystem.distance && ` • ${currentSystem.distance.toFixed(1)} ly`}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation controls */}
          <div
            className="flex items-center justify-between mt-6 pt-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <button
              onClick={() => {
                playClick()
                prevPlanetTourStep()
              }}
              disabled={isFirstStep}
              className="flex items-center gap-2 px-3 py-2 rounded transition-all"
              style={{
                color: isFirstStep ? 'rgba(255,255,255,0.3)' : 'var(--color-text)',
                cursor: isFirstStep ? 'not-allowed' : 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="text-sm">Back</span>
            </button>

            {isLastStep ? (
              <button
                onClick={() => {
                  playClick()
                  exitPlanetTour()
                }}
                className="flex items-center gap-2 px-4 py-2 rounded font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-background)',
                }}
              >
                <span className="text-sm">Finish Tour</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  playClick()
                  nextPlanetTourStep()
                }}
                className="flex items-center gap-2 px-4 py-2 rounded font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-background)',
                }}
              >
                <span className="text-sm">Next Stop</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Keyboard hint */}
          <div
            className="text-center mt-3 text-xs opacity-40"
            style={{ color: 'var(--color-text)' }}
          >
            Esc to exit tour
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
