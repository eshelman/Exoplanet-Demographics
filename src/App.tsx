import { useState, useEffect, useMemo } from 'react'
import { ScatterPlot } from './components/visualization'
import { ControlPanel } from './components/controls'
import { SidePanel } from './components/info'
import { NarrativeOverlay } from './components/narrative'
import { loadSolarSystem, generateSampleExoplanets } from './utils'
import { useVizStore, selectVisiblePlanets } from './store'
import type { Planet } from './types'

function App() {
  const [solarSystem, setSolarSystem] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)

  // Get state and actions from store
  const selectedPlanet = useVizStore((s) => s.selectedPlanet)
  const clearSelection = useVizStore((s) => s.clearSelection)
  const startNarrative = useVizStore((s) => s.startNarrative)

  // Generate sample exoplanets (in production, this would load from API)
  const exoplanets = useMemo(() => generateSampleExoplanets(500), [])

  useEffect(() => {
    loadSolarSystem()
      .then(setSolarSystem)
      .finally(() => setLoading(false))
  }, [])

  // Combine all planets - filtering happens in ScatterPlot via store
  const allPlanets = useMemo(() => [...solarSystem, ...exoplanets], [solarSystem, exoplanets])

  // Get visible planets for stats panel
  const visiblePlanets = useMemo(() => selectVisiblePlanets(allPlanets), [allPlanets])
  const visibleCount = visiblePlanets.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg" style={{ color: 'var(--color-text)' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Exoplanet Demographics
            </h1>
            <p className="text-sm opacity-60" style={{ color: 'var(--color-text)' }}>
              Interactive visualization of planetary occurrence rates
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Take the Tour button */}
            <button
              onClick={startNarrative}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-background)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
              Take the Tour
            </button>

            {/* Planet count badge */}
            <div
              className="px-3 py-1.5 rounded text-sm"
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'var(--color-text)',
              }}
            >
              <span className="opacity-60">Showing </span>
              <strong style={{ color: 'var(--color-accent)' }}>{visibleCount}</strong>
              <span className="opacity-60"> planets</span>
            </div>
          </div>
        </div>
      </header>

      {/* Control Panel */}
      <ControlPanel />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Visualization */}
        <main className="flex-1 p-4 overflow-hidden">
          <ScatterPlot planets={allPlanets} />
        </main>

        {/* Side Panel */}
        <SidePanel
          selectedPlanet={selectedPlanet}
          planets={visiblePlanets}
          onClearSelection={clearSelection}
        />
      </div>

      {/* Footer */}
      <footer
        className="px-6 py-3 border-t text-xs opacity-60"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'rgba(255,255,255,0.1)',
          color: 'var(--color-text)',
        }}
      >
        <div className="flex justify-between">
          <span>
            Data: NASA Exoplanet Archive | Based on{' '}
            <a
              href="https://arxiv.org/abs/2011.04703"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              The Demographics of Exoplanets
            </a>{' '}
            (Gaudi, Christiansen & Meyer 2020)
          </span>
          <span>Click a planet to view details</span>
        </div>
      </footer>

      {/* Narrative Overlay (Guided Tour) */}
      <NarrativeOverlay />
    </div>
  )
}

export default App
