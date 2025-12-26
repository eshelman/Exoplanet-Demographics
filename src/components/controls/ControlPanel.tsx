import { useState } from 'react'
import { useVizStore } from '../../store'
import { METHOD_COLORS, PLANET_TYPE_COLORS } from '../../utils/scales'
import type { DetectionMethodId, XAxisType, YAxisType } from '../../types'

const DETECTION_METHODS: { id: DetectionMethodId; name: string }[] = [
  { id: 'radial-velocity', name: 'Radial Velocity' },
  { id: 'transit-kepler', name: 'Transit (Kepler)' },
  { id: 'transit-other', name: 'Transit (Other)' },
  { id: 'microlensing', name: 'Microlensing' },
  { id: 'direct-imaging', name: 'Direct Imaging' },
  { id: 'astrometry', name: 'Astrometry' },
]

const PLANET_TYPES: { id: string; name: string }[] = [
  { id: 'rocky', name: 'Rocky/Terrestrial' },
  { id: 'super-earth', name: 'Super-Earth' },
  { id: 'sub-neptune', name: 'Sub-Neptune' },
  { id: 'neptune-like', name: 'Neptune-like' },
  { id: 'hot-jupiter', name: 'Hot Jupiter' },
  { id: 'cold-jupiter', name: 'Cold Jupiter' },
  { id: 'ultra-short-period', name: 'Ultra-Short Period' },
]

export function ControlPanel() {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const xAxis = useVizStore((s) => s.xAxis)
  const yAxis = useVizStore((s) => s.yAxis)
  const enabledMethods = useVizStore((s) => s.enabledMethods)
  const enabledPlanetTypes = useVizStore((s) => s.enabledPlanetTypes)
  const showSolarSystem = useVizStore((s) => s.showSolarSystem)
  const showBiasOverlay = useVizStore((s) => s.showBiasOverlay)

  const setXAxis = useVizStore((s) => s.setXAxis)
  const setYAxis = useVizStore((s) => s.setYAxis)
  const toggleMethod = useVizStore((s) => s.toggleMethod)
  const togglePlanetType = useVizStore((s) => s.togglePlanetType)
  const toggleSolarSystem = useVizStore((s) => s.toggleSolarSystem)
  const toggleBiasOverlay = useVizStore((s) => s.toggleBiasOverlay)
  const enableAllMethods = useVizStore((s) => s.enableAllMethods)
  const disableAllMethods = useVizStore((s) => s.disableAllMethods)

  const selectStyle = {
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    border: '1px solid rgba(255,255,255,0.2)',
  }

  const typeFilterActive = enabledPlanetTypes.size > 0

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

      {/* Planet Type Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          className="px-3 py-1 rounded text-sm flex items-center gap-2"
          style={{
            backgroundColor: typeFilterActive ? 'var(--color-accent)' : 'transparent',
            color: typeFilterActive ? 'var(--color-background)' : 'var(--color-text)',
            border: '1px solid var(--color-accent)',
          }}
        >
          <span>Types</span>
          {typeFilterActive && (
            <span className="text-xs">({enabledPlanetTypes.size})</span>
          )}
          <span className="text-xs">{showTypeDropdown ? '▲' : '▼'}</span>
        </button>

        {showTypeDropdown && (
          <div
            className="absolute top-full left-0 mt-1 py-2 rounded shadow-lg z-50 min-w-[180px]"
            style={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div className="px-3 py-1 text-xs opacity-50 border-b border-white/10 mb-1" style={{ color: 'var(--color-text)' }}>
              Filter by planet type
            </div>
            {PLANET_TYPES.map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={enabledPlanetTypes.has(type.id)}
                  onChange={() => togglePlanetType(type.id)}
                  className="rounded"
                />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PLANET_TYPE_COLORS[type.id] }}
                />
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                  {type.name}
                </span>
              </label>
            ))}
            {typeFilterActive && (
              <div className="border-t border-white/10 mt-1 pt-1 px-3">
                <button
                  onClick={() => {
                    PLANET_TYPES.forEach((t) => {
                      if (enabledPlanetTypes.has(t.id)) {
                        togglePlanetType(t.id)
                      }
                    })
                  }}
                  className="text-xs opacity-60 hover:opacity-100"
                  style={{ color: 'var(--color-text)' }}
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        )}
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
