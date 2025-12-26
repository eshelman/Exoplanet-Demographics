import { useState } from 'react'
import { useVizStore } from '../../store'
import { useAudio } from '../../audio'

interface HeaderProps {
  visibleCount: number
}

type TabId = 'explore' | 'compare' | 'about'

export function Header({ visibleCount }: HeaderProps) {
  const [activeTab, setActiveTab] = useState<TabId>('explore')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false)

  const startNarrative = useVizStore((s) => s.startNarrative)
  const showSolarSystem = useVizStore((s) => s.showSolarSystem)
  const showBiasOverlay = useVizStore((s) => s.showBiasOverlay)
  const toggleSolarSystem = useVizStore((s) => s.toggleSolarSystem)
  const toggleBiasOverlay = useVizStore((s) => s.toggleBiasOverlay)

  // Audio
  const {
    settings: audioSettings,
    toggleAudio,
    setVolume,
    toggleCategory,
    setComplexity,
  } = useAudio()

  const tabs: { id: TabId; label: string }[] = [
    { id: 'explore', label: 'Explore' },
    { id: 'compare', label: 'Compare' },
    { id: 'about', label: 'About' },
  ]

  return (
    <header
      className="px-6 py-4 border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Title and Navigation */}
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Exoplanet Demographics
            </h1>
            <p className="text-sm opacity-60" style={{ color: 'var(--color-text)' }}>
              Interactive visualization of planetary occurrence rates
            </p>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text)',
                  opacity: activeTab === tab.id ? 1 : 0.6,
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Take the Tour button */}
          <button
            onClick={startNarrative}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-background)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            Take the Tour
          </button>

          {/* Planet count badge */}
          <div
            className="px-3 py-1.5 rounded text-sm"
            style={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--color-text)',
            }}
          >
            <span className="opacity-60">Showing </span>
            <strong style={{ color: 'var(--color-accent)' }}>{visibleCount}</strong>
            <span className="opacity-60"> planets</span>
          </div>

          {/* Audio Toggle & Settings */}
          <div className="relative">
            <button
              onClick={toggleAudio}
              onContextMenu={(e) => {
                e.preventDefault()
                setAudioSettingsOpen(!audioSettingsOpen)
              }}
              className="p-2 rounded transition-all hover:bg-white/10"
              style={{ color: audioSettings.enabled ? 'var(--color-accent)' : 'var(--color-text)' }}
              title={audioSettings.enabled ? 'Sound On (right-click for settings)' : 'Sound Off (click to enable)'}
            >
              {audioSettings.enabled ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>

            {/* Audio Settings Dropdown */}
            {audioSettingsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAudioSettingsOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-lg shadow-xl z-50 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wider border-b"
                    style={{
                      color: 'var(--color-text)',
                      opacity: 0.6,
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    Audio Settings
                  </div>

                  {/* Master Volume */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                        Master Volume
                      </span>
                      <span className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
                        {Math.round(audioSettings.masterVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioSettings.masterVolume * 100}
                      onChange={(e) => setVolume(Number(e.target.value) / 100)}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(--color-accent) ${audioSettings.masterVolume * 100}%, rgba(255,255,255,0.2) ${audioSettings.masterVolume * 100}%)`,
                      }}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

                  {/* Category Toggles */}
                  <div className="px-4 py-2">
                    <div
                      className="text-xs font-medium uppercase tracking-wider mb-2"
                      style={{ color: 'var(--color-text)', opacity: 0.6 }}
                    >
                      Categories
                    </div>
                    {(['ambient', 'ui', 'sonification', 'narration'] as const).map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className="w-full px-2 py-2 flex items-center justify-between hover:bg-white/5 rounded transition-colors"
                      >
                        <span className="text-sm capitalize" style={{ color: 'var(--color-text)' }}>
                          {category}
                        </span>
                        <div
                          className="w-8 h-5 rounded-full p-0.5 transition-colors"
                          style={{
                            backgroundColor: audioSettings.categories[category]
                              ? 'var(--color-accent)'
                              : 'rgba(255,255,255,0.2)',
                          }}
                        >
                          <div
                            className="w-4 h-4 rounded-full bg-white transition-transform"
                            style={{
                              transform: audioSettings.categories[category]
                                ? 'translateX(12px)'
                                : 'translateX(0)',
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

                  {/* Sonification Complexity */}
                  <div className="px-4 py-3">
                    <div
                      className="text-xs font-medium uppercase tracking-wider mb-2"
                      style={{ color: 'var(--color-text)', opacity: 0.6 }}
                    >
                      Sonification Detail
                    </div>
                    <div className="flex gap-2">
                      {(['simple', 'standard', 'rich'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setComplexity(level)}
                          className="flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all capitalize"
                          style={{
                            backgroundColor:
                              audioSettings.sonificationComplexity === level
                                ? 'var(--color-accent)'
                                : 'rgba(255,255,255,0.1)',
                            color:
                              audioSettings.sonificationComplexity === level
                                ? 'var(--color-background)'
                                : 'var(--color-text)',
                          }}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 rounded transition-all hover:bg-white/10"
              style={{ color: 'var(--color-text)' }}
              title="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Settings Dropdown */}
            {settingsOpen && (
              <>
                {/* Backdrop to close menu */}
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />

                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-xl z-50 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wider border-b"
                    style={{
                      color: 'var(--color-text)',
                      opacity: 0.6,
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    Display Settings
                  </div>

                  {/* Solar System Toggle */}
                  <button
                    onClick={toggleSolarSystem}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ color: 'var(--color-solar-system)' }}
                      >
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                        Show Solar System
                      </span>
                    </div>
                    <div
                      className="w-10 h-6 rounded-full p-1 transition-colors"
                      style={{
                        backgroundColor: showSolarSystem ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-white transition-transform"
                        style={{
                          transform: showSolarSystem ? 'translateX(16px)' : 'translateX(0)',
                        }}
                      />
                    </div>
                  </button>

                  {/* Bias Overlay Toggle */}
                  <button
                    onClick={toggleBiasOverlay}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ color: 'var(--color-text)', opacity: 0.8 }}
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                        Show Detection Bias
                      </span>
                    </div>
                    <div
                      className="w-10 h-6 rounded-full p-1 transition-colors"
                      style={{
                        backgroundColor: showBiasOverlay ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full bg-white transition-transform"
                        style={{
                          transform: showBiasOverlay ? 'translateX(16px)' : 'translateX(0)',
                        }}
                      />
                    </div>
                  </button>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

                  {/* Help Link */}
                  <a
                    href="https://exoplanetarchive.ipac.caltech.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: 'var(--color-text)', opacity: 0.8 }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                      NASA Exoplanet Archive
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="ml-auto opacity-40"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
