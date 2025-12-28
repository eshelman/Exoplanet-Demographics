import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVizStore, NARRATIVE_STEPS } from '../../store/vizStore'
import { StoryStep } from './StoryStep'
import { NARRATIVE_CONTENT, getStepContent } from './narrativeContent'

export function NarrativeOverlay() {
  const narrativeMode = useVizStore((s) => s.narrativeMode)
  const narrativeStep = useVizStore((s) => s.narrativeStep)
  const nextStep = useVizStore((s) => s.nextStep)
  const prevStep = useVizStore((s) => s.prevStep)
  const exitNarrative = useVizStore((s) => s.exitNarrative)
  const setMethodEnabled = useVizStore((s) => s.setMethodEnabled)
  const toggleSolarSystem = useVizStore((s) => s.toggleSolarSystem)
  const toggleBiasOverlay = useVizStore((s) => s.toggleBiasOverlay)
  const showSolarSystem = useVizStore((s) => s.showSolarSystem)
  const showBiasOverlay = useVizStore((s) => s.showBiasOverlay)
  const enableAllMethods = useVizStore((s) => s.enableAllMethods)
  const setEnabledPlanetTypes = useVizStore((s) => s.setEnabledPlanetTypes)
  const setZoomRegion = useVizStore((s) => s.setZoomRegion)

  const currentStepId = NARRATIVE_STEPS[narrativeStep]
  const currentContent = getStepContent(currentStepId)
  const totalSteps = NARRATIVE_STEPS.length
  const isFirstStep = narrativeStep === 0
  const isLastStep = narrativeStep === totalSteps - 1

  // Apply view configuration when step changes
  useEffect(() => {
    if (!narrativeMode || !currentContent?.viewConfig) return

    const config = currentContent.viewConfig
    const allMethods = ['radial-velocity', 'transit-kepler', 'transit-other', 'microlensing', 'direct-imaging', 'astrometry', 'other'] as const

    // Apply showSolarSystem if specified
    if (config.showSolarSystem !== undefined && config.showSolarSystem !== showSolarSystem) {
      toggleSolarSystem()
    }

    // Apply showBiasOverlay if specified
    if (config.showBiasOverlay !== undefined && config.showBiasOverlay !== showBiasOverlay) {
      toggleBiasOverlay()
    }

    // Apply enabled methods if specified
    if (config.enabledMethods !== undefined) {
      if (config.enabledMethods.length === 0) {
        // Disable all methods (show only solar system)
        allMethods.forEach((m) => setMethodEnabled(m, false))
      } else {
        // Enable only specified methods
        allMethods.forEach((m) => setMethodEnabled(m, config.enabledMethods!.includes(m)))
      }
    } else {
      // Default: enable all methods
      enableAllMethods()
    }

    // Apply enabled planet types if specified
    if (config.enabledPlanetTypes !== undefined) {
      setEnabledPlanetTypes(config.enabledPlanetTypes)
    } else {
      // Default: show all planet types (empty set means no filter)
      setEnabledPlanetTypes([])
    }

    // Apply zoom region if specified
    if (config.zoomRegion) {
      setZoomRegion(config.zoomRegion)
    } else {
      // Reset zoom when no region specified
      setZoomRegion(null)
    }
  }, [narrativeStep, narrativeMode])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!narrativeMode) return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault()
          if (!isLastStep) nextStep()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          if (!isFirstStep) prevStep()
          break
        case 'Escape':
          e.preventDefault()
          exitNarrative()
          break
      }
    },
    [narrativeMode, isFirstStep, isLastStep, nextStep, prevStep, exitNarrative]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!narrativeMode || !currentContent) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Semi-transparent backdrop on edges */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Content panel */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute left-0 top-0 bottom-0 w-[420px] p-8 flex flex-col pointer-events-auto"
          style={{
            backgroundColor: 'rgba(10, 15, 28, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Header with exit button */}
          <div className="flex items-center justify-between mb-8">
            <div
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: 'var(--color-accent)' }}
            >
              Guided Tour
            </div>
            <button
              onClick={exitNarrative}
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
          <div className="flex justify-between mb-8">
            {NARRATIVE_CONTENT.map((step, i) => (
              <button
                key={step.id}
                onClick={() => useVizStore.getState().goToStep(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i <= narrativeStep ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
                  transform: i === narrativeStep ? 'scale(1.5)' : 'scale(1)',
                }}
                title={step.title}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <StoryStep
                key={currentStepId}
                step={currentContent}
                stepNumber={narrativeStep + 1}
                totalSteps={totalSteps}
              />
            </AnimatePresence>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className="flex items-center gap-2 px-4 py-2 rounded transition-all"
              style={{
                color: isFirstStep ? 'rgba(255,255,255,0.3)' : 'var(--color-text)',
                cursor: isFirstStep ? 'not-allowed' : 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span className="text-sm">Previous</span>
            </button>

            {isLastStep ? (
              <button
                onClick={exitNarrative}
                className="flex items-center gap-2 px-6 py-2 rounded font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-background)',
                }}
              >
                <span className="text-sm">Explore on Your Own</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 rounded font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-background)',
                }}
              >
                <span className="text-sm">Next</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Keyboard hint */}
          <div
            className="text-center mt-4 text-xs opacity-40"
            style={{ color: 'var(--color-text)' }}
          >
            Use arrow keys to navigate, Esc to exit
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
