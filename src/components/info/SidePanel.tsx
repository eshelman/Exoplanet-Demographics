import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Planet } from '../../types'
import { PlanetDetailCard } from './PlanetDetailCard'
import { StatisticsPanel } from './StatisticsPanel'
import { OccurrenceRateHeatmap, EtaEarthTimeline, PlanetTypeGallery } from '../charts'
import { useAudio } from '../../audio'
import { useVizStore } from '../../store'

interface SidePanelProps {
  selectedPlanet: Planet | null
  planets: Planet[]
  onClearSelection: () => void
}

type TabId = 'details' | 'stats' | 'charts'

export function SidePanel({ selectedPlanet, planets, onClearSelection }: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>(selectedPlanet ? 'details' : 'stats')

  const { playSidebarOpen, playSidebarClose, playClick, playToggleOn, playToggleOff } = useAudio()

  // Planet type filtering from store
  const togglePlanetType = useVizStore((s) => s.togglePlanetType)
  const enabledPlanetTypes = useVizStore((s) => s.enabledPlanetTypes)

  // Auto-switch to details tab when a planet is selected
  if (selectedPlanet && activeTab !== 'details') {
    setActiveTab('details')
  }

  const handleTypeClick = (typeId: string) => {
    const wasEnabled = enabledPlanetTypes.size === 0 || enabledPlanetTypes.has(typeId)
    togglePlanetType(typeId)
    if (wasEnabled && enabledPlanetTypes.size > 0) {
      playToggleOff()
    } else {
      playToggleOn()
    }
  }

  // Determine which type is "selected" for visual feedback
  // If only one type is enabled, that one is selected
  const selectedChartType = enabledPlanetTypes.size === 1
    ? Array.from(enabledPlanetTypes)[0]
    : null

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 48 : 320 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-full"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => {
          const wasCollapsed = isCollapsed
          setIsCollapsed(!isCollapsed)
          wasCollapsed ? playSidebarOpen() : playSidebarClose()
        }}
        className="absolute -left-3 top-4 z-10 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'var(--color-text)',
        }}
        title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Collapsed State */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-4 gap-4"
          >
            {/* Vertical text */}
            <div
              className="text-xs font-medium tracking-widest"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                color: 'var(--color-text)',
                opacity: 0.6,
              }}
            >
              INFO PANEL
            </div>
            {selectedPlanet && (
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-accent)' }}
                title={`Selected: ${selectedPlanet.name}`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Tab Header */}
            <div
              className="flex border-b"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <button
                onClick={() => {
                  setActiveTab('details')
                  playClick()
                }}
                className="flex-1 px-2 py-3 text-xs font-medium transition-colors relative"
                style={{
                  color: activeTab === 'details' ? 'var(--color-accent)' : 'var(--color-text)',
                  opacity: activeTab === 'details' ? 1 : 0.6,
                }}
              >
                Details
                {activeTab === 'details' && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('stats')
                  playClick()
                }}
                className="flex-1 px-2 py-3 text-xs font-medium transition-colors relative"
                style={{
                  color: activeTab === 'stats' ? 'var(--color-accent)' : 'var(--color-text)',
                  opacity: activeTab === 'stats' ? 1 : 0.6,
                }}
              >
                Stats
                {activeTab === 'stats' && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('charts')
                  playClick()
                }}
                className="flex-1 px-2 py-3 text-xs font-medium transition-colors relative"
                style={{
                  color: activeTab === 'charts' ? 'var(--color-accent)' : 'var(--color-text)',
                  opacity: activeTab === 'charts' ? 1 : 0.6,
                }}
              >
                Charts
                {activeTab === 'charts' && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {selectedPlanet ? (
                      <PlanetDetailCard planet={selectedPlanet} onClose={onClearSelection} />
                    ) : (
                      <div
                        className="text-center py-8"
                        style={{ color: 'var(--color-text)', opacity: 0.5 }}
                      >
                        <svg
                          className="mx-auto mb-3"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                        </svg>
                        <p className="text-sm">No planet selected</p>
                        <p className="text-xs mt-1 opacity-60">
                          Click a planet on the chart to view details
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StatisticsPanel planets={planets} title="Visible Planets" />
                  </motion.div>
                )}
                {activeTab === 'charts' && (
                  <motion.div
                    key="charts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <PlanetTypeGallery
                      compact
                      onTypeClick={handleTypeClick}
                      selectedType={selectedChartType}
                    />
                    <OccurrenceRateHeatmap compact />
                    <EtaEarthTimeline compact />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
