import { useState, useEffect, useMemo } from 'react'
import { ScatterPlot } from './components/visualization'
import { loadSolarSystem, generateSampleExoplanets } from './utils'
import type { Planet, XAxisType, YAxisType } from './types'

function App() {
  const [solarSystem, setSolarSystem] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)
  const [xAxis, setXAxis] = useState<XAxisType>('period')
  const [yAxis, setYAxis] = useState<YAxisType>('mass')

  // Generate sample exoplanets (in production, this would load from API)
  const exoplanets = useMemo(() => generateSampleExoplanets(300), [])

  useEffect(() => {
    loadSolarSystem()
      .then(setSolarSystem)
      .finally(() => setLoading(false))
  }, [])

  const allPlanets = useMemo(() => [...solarSystem, ...exoplanets], [solarSystem, exoplanets])

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

          {/* Axis Controls */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                X Axis:
              </label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value as XAxisType)}
                className="px-3 py-1.5 rounded text-sm"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <option value="period">Orbital Period</option>
                <option value="separation">Semi-major Axis</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                Y Axis:
              </label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value as YAxisType)}
                className="px-3 py-1.5 rounded text-sm"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <option value="mass">Planet Mass</option>
                <option value="radius">Planet Radius</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Visualization */}
      <main className="flex-1 p-4">
        <ScatterPlot planets={allPlanets} xAxisType={xAxis} yAxisType={yAxis} />
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
          <span>{allPlanets.length} planets displayed</span>
        </div>
      </footer>
    </div>
  )
}

export default App
