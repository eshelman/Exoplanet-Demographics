import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SimulationHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SimulationHelpModal = memo(function SimulationHelpModal({
  isOpen,
  onClose,
}: SimulationHelpModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[150] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div
            className="sticky top-0 flex items-center justify-between px-6 py-4"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.98)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Orbital Simulation Help
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              title="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6" style={{ color: 'var(--color-text)' }}>
            {/* Overview */}
            <section>
              <h4 className="text-sm font-medium uppercase tracking-wider opacity-60 mb-2">
                What You're Seeing
              </h4>
              <p className="text-sm opacity-80 leading-relaxed">
                This is a real-time orbital simulation of an exoplanet system. Planets orbit
                their host star based on actual orbital parameters from astronomical data.
                The simulation uses Kepler's laws to calculate accurate positions, velocities,
                and orbital periods.
              </p>
            </section>

            {/* Main View */}
            <section>
              <h4 className="text-sm font-medium uppercase tracking-wider opacity-60 mb-2">
                Main View
              </h4>
              <ul className="text-sm opacity-80 space-y-2">
                <li className="flex gap-2">
                  <span className="text-yellow-400">★</span>
                  <span><strong>Central Star</strong> — The host star, with color based on its temperature (red = cooler, blue = hotter)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">●</span>
                  <span><strong>Planets</strong> — Click any planet to select it and view detailed information</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500/50">◯</span>
                  <span><strong>Habitable Zone</strong> — The green band shows where liquid water could exist (toggle with H key)</span>
                </li>
              </ul>
            </section>

            {/* Stats Panel */}
            <section>
              <h4 className="text-sm font-medium uppercase tracking-wider opacity-60 mb-2">
                Stats Panel (Right Side)
              </h4>
              <ul className="text-sm opacity-80 space-y-2">
                <li className="flex gap-2">
                  <span className="opacity-40">•</span>
                  <span><strong>Host Star</strong> — Mass, radius, temperature, and spectral type of the star</span>
                </li>
                <li className="flex gap-2">
                  <span className="opacity-40">•</span>
                  <span><strong>Characteristics</strong> — System tags like "Multi-planet", "Orbital resonance", or "HZ planet(s)"</span>
                </li>
                <li className="flex gap-2">
                  <span className="opacity-40">•</span>
                  <span><strong>Planets</strong> — Click to select; expand with ▼ for orbital elements and physical properties</span>
                </li>
                <li className="flex gap-2">
                  <span className="italic opacity-60">~</span>
                  <span><strong>Estimated Values</strong> — Italicized values with ~ are estimates derived from other properties</span>
                </li>
              </ul>
            </section>

            {/* Controls */}
            <section>
              <h4 className="text-sm font-medium uppercase tracking-wider opacity-60 mb-2">
                Controls (Bottom)
              </h4>
              <ul className="text-sm opacity-80 space-y-2">
                <li className="flex gap-2">
                  <span className="opacity-40">↺</span>
                  <span><strong>Reset</strong> — Restart simulation at 1× speed</span>
                </li>
                <li className="flex gap-2">
                  <span className="opacity-40">▶</span>
                  <span><strong>Play/Pause</strong> — Toggle simulation (Space bar)</span>
                </li>
                <li className="flex gap-2">
                  <span className="opacity-40">×</span>
                  <span><strong>Speed</strong> — Time multiplier from 0.5× to 10×</span>
                </li>
                <li className="flex gap-2">
                  <span className="opacity-40">◍</span>
                  <span><strong>Toggles</strong> — Show/hide Orbits (O), Labels (L), Habitable Zone (H)</span>
                </li>
              </ul>
            </section>

            {/* Zoom */}
            <section>
              <h4 className="text-sm font-medium uppercase tracking-wider opacity-60 mb-2">
                Zoom Controls (Left Side)
              </h4>
              <ul className="text-sm opacity-80 space-y-2">
                <li className="flex gap-2">
                  <span className="opacity-40">+</span>
                  <span><strong>Zoom In</strong> — Get a closer look at inner planets</span>
                </li>
                <li className="flex gap-2">
                  <span className="opacity-40">−</span>
                  <span><strong>Zoom Out</strong> — See the full system</span>
                </li>
                <li className="flex gap-2">
                  <span className="opacity-40">%</span>
                  <span><strong>Zoom Level</strong> — Current zoom percentage</span>
                </li>
              </ul>
            </section>

            {/* Keyboard Shortcuts */}
            <section>
              <h4 className="text-sm font-medium uppercase tracking-wider opacity-60 mb-2">
                Keyboard Shortcuts
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">←</kbd>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">→</kbd>
                  <span className="opacity-80">Navigate planets</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">↑</kbd>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">↓</kbd>
                  <span className="opacity-80">Adjust speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">Space</kbd>
                  <span className="opacity-80">Pause/Resume</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">R</kbd>
                  <span className="opacity-80">Reset simulation</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">O</kbd>
                  <span className="opacity-80">Toggle orbits</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">L</kbd>
                  <span className="opacity-80">Toggle labels</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">H</kbd>
                  <span className="opacity-80">Toggle HZ</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">1-9</kbd>
                  <span className="opacity-80">Select planet #</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">?</kbd>
                  <span className="opacity-80">Show help</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">Esc</kbd>
                  <span className="opacity-80">Close simulation</span>
                </div>
              </div>
            </section>

            {/* Time Scale */}
            <section
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <h4 className="text-sm font-medium opacity-80 mb-1">
                About Time Scale
              </h4>
              <p className="text-xs opacity-60 leading-relaxed">
                The time indicator (e.g., "1 sec = 1 day") shows how fast time passes in the simulation.
                At 1× speed, one real second equals one day in the simulation. Faster speeds compress
                more orbital time into each second, making it easier to observe longer orbital periods.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 text-center"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--color-text)',
              }}
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})
