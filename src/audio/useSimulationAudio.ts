import { useCallback, useEffect, useMemo, useRef } from 'react'
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
      try {
        if (isAmbientPlaying.current) {
          AudioManager.stopSimulationAmbient()
          AudioManager.stopSimulationPlanetVoice()
        }
      } catch {}
    }
  }, [])

  /**
   * Start system ambient when simulation opens
   */
  const startAmbient = useCallback((system: SimulatedSystem) => {
    try {
      currentSystemRef.current = system
      AudioManager.startSimulationAmbient(system)
      isAmbientPlaying.current = true
    } catch (e) {
      console.warn('[useSimulationAudio] startAmbient error:', e)
    }
  }, [])

  /**
   * Stop system ambient when simulation closes
   */
  const stopAmbient = useCallback(() => {
    try {
      AudioManager.stopSimulationAmbient()
      AudioManager.stopSimulationPlanetVoice()
      isAmbientPlaying.current = false
      currentSystemRef.current = null
    } catch {}
  }, [])

  /**
   * Start/update selected planet voice
   */
  const selectPlanet = useCallback((planet: SimulatedPlanet) => {
    try {
      if (!planet) return
      AudioManager.stopSimulationPlanetVoice()
      AudioManager.playSimulationPlanetSelect(planet)
      AudioManager.startSimulationPlanetVoice(planet)
    } catch (e) {
      console.warn('[useSimulationAudio] selectPlanet error:', e)
    }
  }, [])

  /**
   * Stop selected planet voice
   */
  const deselectPlanet = useCallback(() => {
    try { AudioManager.stopSimulationPlanetVoice() } catch {}
  }, [])

  /**
   * Play planet hover sound
   */
  const hoverPlanet = useCallback((planet: SimulatedPlanet) => {
    try { if (planet) AudioManager.playSimulationPlanetHover(planet) } catch {}
  }, [])

  /**
   * Play speed change sound
   */
  const changeSpeed = useCallback((speed: number) => {
    try { AudioManager.playSimulationSpeedChange(speed) } catch {}
  }, [])

  /**
   * Play pause sound
   */
  const pause = useCallback(() => {
    try { AudioManager.playSimulationPause() } catch {}
  }, [])

  /**
   * Play resume sound
   */
  const resume = useCallback(() => {
    try { AudioManager.playSimulationResume() } catch {}
  }, [])

  /**
   * Play toggle sound (orbits, labels, HZ)
   */
  const toggle = useCallback((enabled: boolean) => {
    try { AudioManager.playSimulationToggle(enabled) } catch {}
  }, [])

  /**
   * Play modal open sound
   */
  const openModal = useCallback(() => {
    try { AudioManager.playSimulationModalOpen() } catch {}
  }, [])

  /**
   * Play modal close sound
   */
  const closeModal = useCallback(() => {
    try { AudioManager.playSimulationModalClose() } catch {}
  }, [])

  /**
   * Play orbital chime when planet crosses reference point
   * Creates rhythmic pulses synchronized to orbital motion
   */
  const orbitalChime = useCallback((planet: SimulatedPlanet) => {
    try { if (planet) AudioManager.playOrbitalChime(planet) } catch {}
  }, [])

  /**
   * Play periapsis passage sound
   */
  const periapsisPass = useCallback((planet: SimulatedPlanet) => {
    try { if (planet) AudioManager.playPeriapsisPass(planet) } catch {}
  }, [])

  /**
   * Play orbit complete sound
   */
  const orbitComplete = useCallback((planet: SimulatedPlanet) => {
    try { if (planet) AudioManager.playOrbitComplete(planet) } catch {}
  }, [])

  /**
   * Play conjunction sound
   */
  const conjunction = useCallback((planet1: SimulatedPlanet, planet2: SimulatedPlanet) => {
    try { if (planet1 && planet2) AudioManager.playConjunction(planet1, planet2) } catch {}
  }, [])

  // Memoize the return object to prevent infinite render loops
  // when used as a dependency in useEffect or useCallback
  return useMemo(
    () => ({
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
      orbitalChime,
      periapsisPass,
      orbitComplete,
      conjunction,
    }),
    [
      startAmbient,
      stopAmbient,
      selectPlanet,
      deselectPlanet,
      hoverPlanet,
      changeSpeed,
      pause,
      resume,
      toggle,
      openModal,
      closeModal,
      orbitalChime,
      periapsisPass,
      orbitComplete,
      conjunction,
    ]
  )
}
