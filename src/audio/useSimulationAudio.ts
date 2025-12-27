import { useCallback, useEffect, useRef } from 'react'
import { AudioManager } from './AudioManager'
import type { SimulatedSystem, SimulatedPlanet } from '../types/simulation'

/**
 * Hook for simulation-specific audio functionality
 *
 * Provides:
 * - System ambient based on star temperature
 * - Selected planet voice
 * - UI sounds for simulation controls
 * - Special moment sounds (periapsis, orbit complete)
 */
export function useSimulationAudio() {
  // Track if ambient is currently playing
  const isAmbientPlaying = useRef(false)
  const currentSystemRef = useRef<SimulatedSystem | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isAmbientPlaying.current) {
        AudioManager.stopSimulationAmbient()
        AudioManager.stopSimulationPlanetVoice()
      }
    }
  }, [])

  /**
   * Start system ambient when simulation opens
   */
  const startAmbient = useCallback((system: SimulatedSystem) => {
    currentSystemRef.current = system
    AudioManager.startSimulationAmbient(system)
    isAmbientPlaying.current = true
  }, [])

  /**
   * Stop system ambient when simulation closes
   */
  const stopAmbient = useCallback(() => {
    AudioManager.stopSimulationAmbient()
    AudioManager.stopSimulationPlanetVoice()
    isAmbientPlaying.current = false
    currentSystemRef.current = null
  }, [])

  /**
   * Start/update selected planet voice
   */
  const selectPlanet = useCallback((planet: SimulatedPlanet) => {
    AudioManager.stopSimulationPlanetVoice()
    AudioManager.playSimulationPlanetSelect(planet)
    AudioManager.startSimulationPlanetVoice(planet)
  }, [])

  /**
   * Stop selected planet voice
   */
  const deselectPlanet = useCallback(() => {
    AudioManager.stopSimulationPlanetVoice()
  }, [])

  /**
   * Play planet hover sound
   */
  const hoverPlanet = useCallback((planet: SimulatedPlanet) => {
    AudioManager.playSimulationPlanetHover(planet)
  }, [])

  /**
   * Play speed change sound
   */
  const changeSpeed = useCallback((speed: number) => {
    AudioManager.playSimulationSpeedChange(speed)
  }, [])

  /**
   * Play pause sound
   */
  const pause = useCallback(() => {
    AudioManager.playSimulationPause()
  }, [])

  /**
   * Play resume sound
   */
  const resume = useCallback(() => {
    AudioManager.playSimulationResume()
  }, [])

  /**
   * Play toggle sound (orbits, labels, HZ)
   */
  const toggle = useCallback((enabled: boolean) => {
    AudioManager.playSimulationToggle(enabled)
  }, [])

  /**
   * Play modal open sound
   */
  const openModal = useCallback(() => {
    AudioManager.playSimulationModalOpen()
  }, [])

  /**
   * Play modal close sound
   */
  const closeModal = useCallback(() => {
    AudioManager.playSimulationModalClose()
  }, [])

  /**
   * Play periapsis passage sound
   */
  const periapsisPass = useCallback((planet: SimulatedPlanet) => {
    AudioManager.playPeriapsisPass(planet)
  }, [])

  /**
   * Play orbit complete sound
   */
  const orbitComplete = useCallback((planet: SimulatedPlanet) => {
    AudioManager.playOrbitComplete(planet)
  }, [])

  /**
   * Play conjunction sound
   */
  const conjunction = useCallback((planet1: SimulatedPlanet, planet2: SimulatedPlanet) => {
    AudioManager.playConjunction(planet1, planet2)
  }, [])

  return {
    // Ambient control
    startAmbient,
    stopAmbient,

    // Planet sounds
    selectPlanet,
    deselectPlanet,
    hoverPlanet,

    // UI sounds
    changeSpeed,
    pause,
    resume,
    toggle,
    openModal,
    closeModal,

    // Special moments
    periapsisPass,
    orbitComplete,
    conjunction,
  }
}
