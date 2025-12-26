import { useState, useEffect, useMemo } from 'react'
import { ScatterPlot } from './components/visualization'
import { ControlPanel } from './components/controls'
import { SidePanel } from './components/info'
import { NarrativeOverlay } from './components/narrative'
import { Header, Footer } from './components/layout'
import { loadSolarSystem, generateSampleExoplanets } from './utils'
import { useVizStore, selectVisiblePlanets } from './store'
import type { Planet } from './types'

function App() {
  const [solarSystem, setSolarSystem] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)

  // Get state and actions from store
  const selectedPlanet = useVizStore((s) => s.selectedPlanet)
  const clearSelection = useVizStore((s) => s.clearSelection)

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
      <Header visibleCount={visibleCount} />

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
      <Footer />

      {/* Narrative Overlay (Guided Tour) */}
      <NarrativeOverlay />
    </div>
  )
}

export default App
