import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVizStore } from '../store'
import { useAudio } from '../audio'

const STORAGE_KEY = 'exoplanet-viz-visited'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  const startNarrative = useVizStore((s) => s.startNarrative)
  const startPlanetTour = useVizStore((s) => s.startPlanetTour)
  const { playClick } = useAudio()

  // Check if first visit on mount
  useEffect(() => {
    const hasVisited = localStorage.getItem(STORAGE_KEY)
    if (!hasVisited) {
      setIsOpen(true)
    }
  }, [])

  const handleChoice = (choice: 'notable-systems' | 'demographics') => {
    playClick()
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)

    // Small delay to let modal close animation start
    setTimeout(() => {
      if (choice === 'notable-systems') {
        startPlanetTour()
      } else {
        startNarrative()
      }
    }, 150)
  }

  const handleSkip = () => {
    playClick()
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text)' }}
              >
                Welcome to Exoplanet Demographics
              </h2>
              <p
                className="text-sm opacity-70"
                style={{ color: 'var(--color-text)' }}
              >
                Explore thousands of planets discovered beyond our solar system
              </p>
            </div>

            {/* Tour Options */}
            <div className="space-y-3 mb-6">
              {/* Notable Systems Tour */}
              <button
                onClick={() => handleChoice('notable-systems')}
                className="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-accent)', opacity: 0.9 }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-background)"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="12" y1="2" x2="12" y2="4" />
                      <line x1="12" y1="20" x2="12" y2="22" />
                      <line x1="2" y1="12" x2="4" y2="12" />
                      <line x1="20" y1="12" x2="22" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Visit Notable Systems
                    </h3>
                    <p
                      className="text-sm opacity-60"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Tour remarkable exoplanet systems with interactive simulations.
                      See TRAPPIST-1, Kepler-16, and more.
                    </p>
                  </div>
                </div>
              </button>

              {/* Demographics Tour */}
              <button
                onClick={() => handleChoice('demographics')}
                className="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-accent)', opacity: 0.9 }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-background)"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" fill="var(--color-background)" />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Tour Exoplanet Demographics
                    </h3>
                    <p
                      className="text-sm opacity-60"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Learn how we find exoplanets, what types exist, and what
                      this tells us about planets in the universe.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Skip option */}
            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-sm opacity-50 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-text)' }}
              >
                Skip and explore on my own
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
