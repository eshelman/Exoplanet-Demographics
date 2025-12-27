import { useState, useEffect, useMemo } from 'react'
import { ScatterPlot } from './components/visualization'
import { SidePanel } from './components/info'
import { NarrativeOverlay } from './components/narrative'
import { SolarSystemModal } from './components/simulation'
import { Header, Footer } from './components/layout'
import { loadSolarSystem, loadExoplanets } from './utils'
import { useVizStore, selectVisiblePlanets } from './store'
import type { Planet } from './types'

function App() {
  const [solarSystem, setSolarSystem] = useState<Planet[]>([])
  const [exoplanets, setExoplanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)

  // Get state and actions from store
  const selectedPlanet = useVizStore((s) => s.selectedPlanet)
  const clearSelection = useVizStore((s) => s.clearSelection)
  const enabledMethods = useVizStore((s) => s.enabledMethods)
  const enabledPlanetTypes = useVizStore((s) => s.enabledPlanetTypes)
  const showSolarSystem = useVizStore((s) => s.showSolarSystem)

  // Simulation state
  const simulationOpen = useVizStore((s) => s.simulationOpen)
  const simulationSystem = useVizStore((s) => s.simulationSystem)
  const simulationPlanetId = useVizStore((s) => s.simulationPlanetId)
  const closeSimulation = useVizStore((s) => s.closeSimulation)

  useEffect(() => {
    Promise.all([loadSolarSystem(), loadExoplanets()])
      .then(([ss, exo]) => {
        setSolarSystem(ss)
        setExoplanets(exo)
      })
      .finally(() => setLoading(false))
  }, [])

  // Combine all planets - filtering happens in ScatterPlot via store
  const allPlanets = useMemo(() => [...solarSystem, ...exoplanets], [solarSystem, exoplanets])

  // Get visible planets for stats panel (re-compute when filters change)
  const visiblePlanets = useMemo(
    () => selectVisiblePlanets(allPlanets),
    [allPlanets, enabledMethods, enabledPlanetTypes, showSolarSystem]
  )
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
          totalPlanets={allPlanets.length}
          onClearSelection={clearSelection}
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Narrative Overlay (Guided Tour) */}
      <NarrativeOverlay />

      {/* Orbital Simulation Modal */}
      {simulationSystem && (
        <SolarSystemModal
          system={simulationSystem}
          initialPlanetId={simulationPlanetId || undefined}
          isOpen={simulationOpen}
          onClose={closeSimulation}
        />
      )}
    </div>
  )
}

export default App
