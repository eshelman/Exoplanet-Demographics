import { useState, useEffect, useMemo, useCallback } from 'react'
import { ScatterPlot } from './components/visualization'
import { SidePanel } from './components/info'
import { NarrativeOverlay, PlanetTourOverlay } from './components/narrative'
import { SolarSystemModal } from './components/simulation'
import { Header, Footer } from './components/layout'
import { SectionErrorBoundary } from './components/ErrorBoundary'
import { WelcomeModal } from './components/WelcomeModal'
import { loadSolarSystem, loadExoplanets } from './utils'
import { useVizStore, selectVisiblePlanets } from './store'
import { useDeepLink } from './hooks'
import type { Planet } from './types'

function App() {
  const [solarSystem, setSolarSystem] = useState<Planet[]>([])
  const [exoplanets, setExoplanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<Error | null>(null)

  // Get state and actions from store
  const enabledMethods = useVizStore((s) => s.enabledMethods)
  const enabledPlanetTypes = useVizStore((s) => s.enabledPlanetTypes)
  const showSolarSystem = useVizStore((s) => s.showSolarSystem)

  // Simulation state
  const simulationOpen = useVizStore((s) => s.simulationOpen)
  const simulationSystem = useVizStore((s) => s.simulationSystem)
  const simulationPlanetId = useVizStore((s) => s.simulationPlanetId)
  const simulationInitialSpeed = useVizStore((s) => s.simulationInitialSpeed)
  const closeSimulation = useVizStore((s) => s.closeSimulation)

  // Planet tour state
  const planetTourMode = useVizStore((s) => s.planetTourMode)

  // Deep link error state
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null)

  // Combine all planets for deep link hook (needs to be declared before hook)
  const allPlanets = useMemo(() => [...solarSystem, ...exoplanets], [solarSystem, exoplanets])

  // Handle system not found from deep link
  const handleSystemNotFound = useCallback((systemName: string) => {
    setDeepLinkError(`System "${systemName}" not found`)
    // Auto-dismiss after 5 seconds
    setTimeout(() => setDeepLinkError(null), 5000)
  }, [])

  // Deep link URL sync
  useDeepLink({
    planets: allPlanets,
    onSystemNotFound: handleSystemNotFound,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ss, exo] = await Promise.all([loadSolarSystem(), loadExoplanets()])
        setSolarSystem(ss)
        setExoplanets(exo)
      } catch (error) {
        console.error('[App] Failed to load planet data:', error)
        setLoadError(error instanceof Error ? error : new Error('Failed to load data'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Get visible planets for stats panel (re-compute when filters change)
  const visiblePlanets = useMemo(
    () => selectVisiblePlanets(allPlanets),
    [allPlanets, enabledMethods, enabledPlanetTypes, showSolarSystem]
  )
  const visibleCount = visiblePlanets.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{
              borderColor: 'var(--color-accent)',
              borderTopColor: 'transparent',
            }}
          />
          <div className="text-lg" style={{ color: 'var(--color-text)' }}>
            Loading exoplanet data...
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center h-screen p-8"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="max-w-md text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Failed to Load Data
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
            Unable to load exoplanet data. Please check your network connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-background)',
            }}
          >
            Retry
          </button>
          <details className="mt-4 text-left">
            <summary
              className="cursor-pointer text-xs"
              style={{ color: 'var(--color-text)', opacity: 0.5 }}
            >
              Error details
            </summary>
            <pre
              className="mt-2 p-3 rounded text-xs overflow-auto"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'var(--color-text)',
                opacity: 0.7,
              }}
            >
              {loadError.message}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header visibleCount={visibleCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Visualization */}
        <main className="flex-1 p-4 overflow-hidden">
          <SectionErrorBoundary section="Visualization">
            <ScatterPlot planets={allPlanets} />
          </SectionErrorBoundary>
        </main>

        {/* Side Panel - Stats only, details shown in hover tooltip */}
        <SidePanel
          planets={visiblePlanets}
          totalPlanets={allPlanets.length}
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Narrative Overlay (Guided Tour) */}
      <NarrativeOverlay />

      {/* Planet Tour Overlay (Notable Systems) */}
      <PlanetTourOverlay />

      {/* Orbital Simulation Modal */}
      {simulationSystem && (
        <SolarSystemModal
          system={simulationSystem}
          initialPlanetId={simulationPlanetId || undefined}
          initialSpeed={simulationInitialSpeed || undefined}
          isOpen={simulationOpen}
          onClose={closeSimulation}
          disableBackdropClose={planetTourMode}
          tourMode={planetTourMode}
        />
      )}

      {/* Deep Link Error Toast */}
      {deepLinkError && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-sm">{deepLinkError}</span>
          <button
            onClick={() => setDeepLinkError(null)}
            className="ml-2 p-1 rounded hover:bg-white/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Welcome Modal for first-time visitors */}
      <WelcomeModal />
    </div>
  )
}

export default App
