import { useVizStore } from '../../store'
import { useAudio } from '../../audio'
import type { XAxisType, YAxisType } from '../../types'

export function ControlPanel() {
  // Audio
  const { playToggleOn, playToggleOff, playAxisSwitch } = useAudio()

  const xAxis = useVizStore((s) => s.xAxis)
  const yAxis = useVizStore((s) => s.yAxis)
  const showSolarSystem = useVizStore((s) => s.showSolarSystem)
  const showBiasOverlay = useVizStore((s) => s.showBiasOverlay)

  const setXAxis = useVizStore((s) => s.setXAxis)
  const setYAxis = useVizStore((s) => s.setYAxis)
  const toggleSolarSystem = useVizStore((s) => s.toggleSolarSystem)
  const toggleBiasOverlay = useVizStore((s) => s.toggleBiasOverlay)

  const selectStyle = {
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    border: '1px solid rgba(255,255,255,0.2)',
  }

  return (
    <div
      className="flex items-center gap-6 px-6 py-3 border-b flex-wrap"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Axis Selectors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
            X:
          </label>
          <select
            value={xAxis}
            onChange={(e) => {
              setXAxis(e.target.value as XAxisType)
              playAxisSwitch()
            }}
            className="px-2 py-1 rounded text-sm"
            style={selectStyle}
          >
            <option value="period">Orbital Period</option>
            <option value="separation">Semi-major Axis</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
            Y:
          </label>
          <select
            value={yAxis}
            onChange={(e) => {
              setYAxis(e.target.value as YAxisType)
              playAxisSwitch()
            }}
            className="px-2 py-1 rounded text-sm"
            style={selectStyle}
          >
            <option value="mass">Planet Mass</option>
            <option value="radius">Planet Radius</option>
          </select>
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-white/20" />

      {/* Toggle Options */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showSolarSystem}
            onChange={() => {
              toggleSolarSystem()
              showSolarSystem ? playToggleOff() : playToggleOn()
            }}
            className="rounded"
          />
          <span className="text-sm" style={{ color: 'var(--color-solar-system)' }}>
            Solar System
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showBiasOverlay}
            onChange={() => {
              toggleBiasOverlay()
              showBiasOverlay ? playToggleOff() : playToggleOn()
            }}
            className="rounded"
          />
          <span className="text-sm" style={{ color: 'var(--color-text)' }}>
            Show Biases
          </span>
        </label>
      </div>
    </div>
  )
}
