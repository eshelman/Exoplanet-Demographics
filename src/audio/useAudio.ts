import { useCallback, useEffect, useState } from 'react'
import { AudioManager, type AudioSettings, DEFAULT_AUDIO_SETTINGS } from './AudioManager'

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

  // Sound playback functions
  const playClick = useCallback(() => AudioManager.playClick(), [])
  const playHover = useCallback(() => AudioManager.playHover(), [])
  const playToggleOn = useCallback(() => AudioManager.playToggleOn(), [])
  const playToggleOff = useCallback(() => AudioManager.playToggleOff(), [])
  const playPlanetHover = useCallback(
    (period: number, radius: number) => AudioManager.playPlanetHover(period, radius),
    []
  )
  const playPlanetSelect = useCallback(
    (period: number, radius: number) => AudioManager.playPlanetSelect(period, radius),
    []
  )
  const playStepAdvance = useCallback(() => AudioManager.playStepAdvance(), [])
  const playStepBack = useCallback(() => AudioManager.playStepBack(), [])

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

    // Sound playback
    playClick,
    playHover,
    playToggleOn,
    playToggleOff,
    playPlanetHover,
    playPlanetSelect,
    playStepAdvance,
    playStepBack,
  }
}
