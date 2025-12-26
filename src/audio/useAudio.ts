import { useCallback, useEffect, useState } from 'react'
import { AudioManager, type AudioSettings, DEFAULT_AUDIO_SETTINGS } from './AudioManager'
import type { DetectionMethodId, Planet } from '../types'

/**
 * Hook for integrating audio functionality into React components
 */
export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync settings from AudioManager
  useEffect(() => {
    setSettings(AudioManager.getSettings())
  }, [])

  /**
   * Initialize audio context (must be called from user interaction)
   */
  const initAudio = useCallback(async () => {
    await AudioManager.init()
    setIsInitialized(true)
    setSettings(AudioManager.getSettings())
  }, [])

  /**
   * Toggle audio on/off
   */
  const toggleAudio = useCallback(async () => {
    if (!isInitialized) {
      await initAudio()
    }
    const newEnabled = !settings.enabled
    AudioManager.setEnabled(newEnabled)
    setSettings(AudioManager.getSettings())
  }, [isInitialized, settings.enabled, initAudio])

  /**
   * Set master volume
   */
  const setVolume = useCallback((volume: number) => {
    AudioManager.setMasterVolume(volume)
    setSettings(AudioManager.getSettings())
  }, [])

  /**
   * Toggle a category
   */
  const toggleCategory = useCallback((category: keyof AudioSettings['categories']) => {
    const current = AudioManager.getSettings()
    AudioManager.setCategoryEnabled(category, !current.categories[category])
    setSettings(AudioManager.getSettings())
  }, [])

  /**
   * Set sonification complexity
   */
  const setComplexity = useCallback((complexity: AudioSettings['sonificationComplexity']) => {
    AudioManager.setSonificationComplexity(complexity)
    setSettings(AudioManager.getSettings())
  }, [])

  // Basic UI sound playback functions
  const playClick = useCallback(() => AudioManager.playClick(), [])
  const playHover = useCallback(() => AudioManager.playHover(), [])
  const playToggleOn = useCallback(() => AudioManager.playToggleOn(), [])
  const playToggleOff = useCallback(() => AudioManager.playToggleOff(), [])

  // Navigation sounds
  const startPan = useCallback(() => AudioManager.startPan(), [])
  const updatePan = useCallback((velocity: number) => AudioManager.updatePan(velocity), [])
  const endPan = useCallback(() => AudioManager.endPan(), [])
  const playZoomIn = useCallback(() => AudioManager.playZoomIn(), [])
  const playZoomOut = useCallback(() => AudioManager.playZoomOut(), [])

  // Transition sounds
  const playAxisSwitch = useCallback(() => AudioManager.playAxisSwitch(), [])
  const playViewChange = useCallback(() => AudioManager.playViewChange(), [])
  const playFilterApply = useCallback(() => AudioManager.playFilterApply(), [])
  const playSidebarOpen = useCallback(() => AudioManager.playSidebarOpen(), [])
  const playSidebarClose = useCallback(() => AudioManager.playSidebarClose(), [])

  // Legacy planet sounds (simple)
  const playPlanetHover = useCallback(
    (period: number, radius: number) => AudioManager.playPlanetHover(period, radius),
    []
  )
  const playPlanetSelect = useCallback(
    (period: number, radius: number) => AudioManager.playPlanetSelect(period, radius),
    []
  )

  // Narrative sounds
  const playStepAdvance = useCallback(() => AudioManager.playStepAdvance(), [])
  const playStepBack = useCallback(() => AudioManager.playStepBack(), [])

  // Ambient soundscape controls
  const setEnabledMethods = useCallback(
    (methods: DetectionMethodId[]) => AudioManager.setEnabledMethods(methods),
    []
  )
  const setZoomLevel = useCallback((level: number) => AudioManager.setZoomLevel(level), [])

  // Advanced planet sonification
  const startPlanetHover = useCallback((planet: Planet) => AudioManager.startPlanetHover(planet), [])
  const stopPlanetHover = useCallback((planet: Planet) => AudioManager.stopPlanetHover(planet), [])
  const stopAllPlanetHovers = useCallback(() => AudioManager.stopAllPlanetHovers(), [])
  const selectPlanet = useCallback((planet: Planet) => AudioManager.selectPlanet(planet), [])

  // Brush selection sonification
  const startBrushSelection = useCallback(() => AudioManager.startBrushSelection(), [])
  const updateBrushSelection = useCallback((size: number) => AudioManager.updateBrushSelection(size), [])
  const endBrushSelection = useCallback(
    (capturedCount: number) => AudioManager.endBrushSelection(capturedCount),
    []
  )
  const cancelBrushSelection = useCallback(() => AudioManager.cancelBrushSelection(), [])

  return {
    // State
    settings,
    isInitialized,

    // Control functions
    initAudio,
    toggleAudio,
    setVolume,
    toggleCategory,
    setComplexity,

    // Basic UI sounds
    playClick,
    playHover,
    playToggleOn,
    playToggleOff,

    // Navigation sounds
    startPan,
    updatePan,
    endPan,
    playZoomIn,
    playZoomOut,

    // Transition sounds
    playAxisSwitch,
    playViewChange,
    playFilterApply,
    playSidebarOpen,
    playSidebarClose,

    // Legacy planet sounds
    playPlanetHover,
    playPlanetSelect,

    // Narrative sounds
    playStepAdvance,
    playStepBack,

    // Ambient soundscape
    setEnabledMethods,
    setZoomLevel,

    // Advanced planet sonification
    startPlanetHover,
    stopPlanetHover,
    stopAllPlanetHovers,
    selectPlanet,

    // Brush selection
    startBrushSelection,
    updateBrushSelection,
    endBrushSelection,
    cancelBrushSelection,
  }
}
