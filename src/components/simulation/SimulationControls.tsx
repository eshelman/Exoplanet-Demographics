import { memo } from 'react'
import { motion } from 'framer-motion'
import { SIMULATION_SPEEDS, type SimulationSpeed } from '../../types/simulation'

interface SimulationControlsProps {
  speed: SimulationSpeed
  isPaused: boolean
  showOrbits: boolean
  showLabels: boolean
  showHabitableZone: boolean
  habitableZoneAvailable: boolean
  onSpeedChange: (speed: SimulationSpeed) => void
  onPauseToggle: () => void
  onOrbitsToggle: () => void
  onLabelsToggle: () => void
  onHabitableZoneToggle: () => void
  onReset: () => void
}

export const SimulationControls = memo(function SimulationControls({
  speed,
  isPaused,
  showOrbits,
  showLabels,
  showHabitableZone,
  habitableZoneAvailable,
  onSpeedChange,
  onPauseToggle,
  onOrbitsToggle,
  onLabelsToggle,
  onHabitableZoneToggle,
  onReset,
}: SimulationControlsProps) {
  return (
    <div
      className="flex items-center justify-between px-6 py-3"
      style={{
        backgroundColor: 'rgba(10, 15, 28, 0.9)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Playback controls */}
      <div className="flex items-center gap-2">
        {/* Reset button */}
        <button
          onClick={onReset}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          title="Reset simulation (R)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        {/* Play/Pause button */}
        <button
          onClick={onPauseToggle}
          className="p-2 rounded hover:bg-white/10 transition-colors"
          title={isPaused ? 'Play (Space)' : 'Pause (Space)'}
        >
          {isPaused ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          )}
        </button>
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-1">
        <span className="text-xs opacity-50 mr-2">Speed:</span>
        {SIMULATION_SPEEDS.map((s) => (
          <motion.button
            key={s}
            onClick={() => onSpeedChange(s)}
            className="px-2 py-1 text-xs rounded transition-colors"
            style={{
              backgroundColor: speed === s ? 'var(--color-accent, #60A5FA)' : 'transparent',
              color: speed === s ? 'var(--color-background, #0a0f1c)' : 'inherit',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {s}x
          </motion.button>
        ))}
      </div>

      {/* Toggle controls */}
      <div className="flex items-center gap-4">
        <ToggleButton
          label="Orbits"
          shortcut="O"
          isActive={showOrbits}
          onClick={onOrbitsToggle}
        />
        <ToggleButton
          label="Labels"
          shortcut="L"
          isActive={showLabels}
          onClick={onLabelsToggle}
        />
        {habitableZoneAvailable && (
          <ToggleButton
            label="HZ"
            shortcut="H"
            isActive={showHabitableZone}
            onClick={onHabitableZoneToggle}
          />
        )}
      </div>
    </div>
  )
})

interface ToggleButtonProps {
  label: string
  shortcut: string
  isActive: boolean
  onClick: () => void
}

function ToggleButton({ label, shortcut, isActive, onClick }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-xs transition-colors"
      style={{
        color: isActive ? 'var(--color-accent, #60A5FA)' : 'rgba(255,255,255,0.5)',
      }}
      title={`Toggle ${label} (${shortcut})`}
    >
      <span
        className="w-3 h-3 rounded-full border transition-colors"
        style={{
          backgroundColor: isActive ? 'var(--color-accent, #60A5FA)' : 'transparent',
          borderColor: isActive ? 'var(--color-accent, #60A5FA)' : 'rgba(255,255,255,0.3)',
        }}
      />
      {label}
    </button>
  )
}
