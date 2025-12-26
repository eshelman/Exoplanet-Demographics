import { useState, useEffect, useMemo } from 'react'
import { ScatterPlot } from './components/visualization'
import { ControlPanel } from './components/controls'
import { loadSolarSystem, generateSampleExoplanets } from './utils'
import { useVizStore } from './store'
import type { Planet } from './types'

function App() {
  const [solarSystem, setSolarSystem] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)

  // Get selected planet from store for potential side panel display
  const selectedPlanet = useVizStore((s) => s.selectedPlanet)
  const showSolarSystem = useVizStore((s) => s.showSolarSystem)

  // Generate sample exoplanets (in production, this would load from API)
  const exoplanets = useMemo(() => generateSampleExoplanets(500), [])

  useEffect(() => {
    loadSolarSystem()
      .then(setSolarSystem)
      .finally(() => setLoading(false))
  }, [])

  // Combine all planets - filtering happens in ScatterPlot via store
  const allPlanets = useMemo(() => [...solarSystem, ...exoplanets], [solarSystem, exoplanets])

  // Count visible planets
  const visibleCount = useMemo(() => {
    const enabledMethods = useVizStore.getState().enabledMethods
    return allPlanets.filter((p) => {
      if (p.isSolarSystem) return showSolarSystem
      return enabledMethods.has(p.detectionMethod as any)
    }).length
  }, [allPlanets, showSolarSystem])

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

          {/* Selected Planet Info */}
          {selectedPlanet && (
            <div
              className="px-4 py-2 rounded"
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-accent)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--color-accent)' }}>
                Selected: <strong>{selectedPlanet.name}</strong>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Control Panel */}
      <ControlPanel />

      {/* Main Visualization */}
      <main className="flex-1 p-4">
        <ScatterPlot planets={allPlanets} />
      </main>

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
          <span>{visibleCount} planets displayed</span>
        </div>
      </footer>
    </div>
  )
}

export default App
