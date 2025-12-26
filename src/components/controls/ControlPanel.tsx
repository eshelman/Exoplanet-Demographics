import { useVizStore } from '../../store'
import { METHOD_COLORS } from '../../utils/scales'
import type { DetectionMethodId, XAxisType, YAxisType } from '../../types'

const DETECTION_METHODS: { id: DetectionMethodId; name: string }[] = [
  { id: 'radial-velocity', name: 'Radial Velocity' },
  { id: 'transit-kepler', name: 'Transit (Kepler)' },
  { id: 'transit-other', name: 'Transit (Other)' },
  { id: 'microlensing', name: 'Microlensing' },
  { id: 'direct-imaging', name: 'Direct Imaging' },
  { id: 'astrometry', name: 'Astrometry' },
]

export function ControlPanel() {
  const xAxis = useVizStore((s) => s.xAxis)
  const yAxis = useVizStore((s) => s.yAxis)
  const enabledMethods = useVizStore((s) => s.enabledMethods)
  const showSolarSystem = useVizStore((s) => s.showSolarSystem)
  const showBiasOverlay = useVizStore((s) => s.showBiasOverlay)

  const setXAxis = useVizStore((s) => s.setXAxis)
  const setYAxis = useVizStore((s) => s.setYAxis)
  const toggleMethod = useVizStore((s) => s.toggleMethod)
  const toggleSolarSystem = useVizStore((s) => s.toggleSolarSystem)
  const toggleBiasOverlay = useVizStore((s) => s.toggleBiasOverlay)
  const enableAllMethods = useVizStore((s) => s.enableAllMethods)
  const disableAllMethods = useVizStore((s) => s.disableAllMethods)

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
            onChange={(e) => setXAxis(e.target.value as XAxisType)}
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
            onChange={(e) => setYAxis(e.target.value as YAxisType)}
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

      {/* Detection Method Toggles */}
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-70 mr-1" style={{ color: 'var(--color-text)' }}>
          Methods:
        </span>
        {DETECTION_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => toggleMethod(method.id)}
            className="px-2 py-1 rounded text-xs transition-opacity"
            style={{
              backgroundColor: enabledMethods.has(method.id)
                ? METHOD_COLORS[method.id]
                : 'transparent',
              color: enabledMethods.has(method.id) ? '#fff' : 'var(--color-text)',
              border: `1px solid ${METHOD_COLORS[method.id]}`,
              opacity: enabledMethods.has(method.id) ? 1 : 0.5,
            }}
            title={method.name}
          >
            {method.name.split(' ')[0]}
          </button>
        ))}
        <button
          onClick={enableAllMethods}
          className="px-2 py-1 rounded text-xs opacity-60 hover:opacity-100"
          style={{ color: 'var(--color-text)' }}
        >
          All
        </button>
        <button
          onClick={disableAllMethods}
          className="px-2 py-1 rounded text-xs opacity-60 hover:opacity-100"
          style={{ color: 'var(--color-text)' }}
        >
          None
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-white/20" />

      {/* Toggle Options */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showSolarSystem}
            onChange={toggleSolarSystem}
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
            onChange={toggleBiasOverlay}
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
