import { useCallback, useRef } from 'react'
import type { SimulatedPlanet, OrbitalPosition } from '../types/simulation'

/**
 * Reference angle for orbital chimes (radians)
 * 0 = top of orbit (12 o'clock position when viewed from above)
 */
const CHIME_REFERENCE_ANGLE = 0

/**
 * Minimum time between chimes for the same planet (ms)
 * Prevents rapid-fire chimes for very fast orbits
 */
const MIN_CHIME_INTERVAL = 200

/**
 * Configuration for orbital chime behavior
 */
interface OrbitalChimeConfig {
  /** Callback when a planet crosses the reference point */
  onChime: (planet: SimulatedPlanet) => void
  /** Callback when a planet passes periapsis (closest to star) */
  onPeriapsis?: (planet: SimulatedPlanet) => void
  /** Whether chimes are enabled */
  enabled?: boolean
}

/**
 * Tracking state for each planet
 */
interface PlanetChimeState {
  lastAngle: number
  lastChimeTime: number
  lastPeriapsisTime: number
}

/**
 * Hook for tracking orbital positions and triggering chimes
 * when planets cross reference points in their orbits.
 *
 * Creates natural rhythm from orbital mechanics:
 * - Faster orbits = more frequent chimes (rhythm, not pitch)
 * - Each planet "chimes" when crossing the reference point
 * - Avoids sustained high-frequency exposure
 */
export function useOrbitalChimes(config: OrbitalChimeConfig) {
  const { onChime, onPeriapsis, enabled = true } = config

  // Track previous angle for each planet
  const planetStates = useRef<Map<string, PlanetChimeState>>(new Map())

  /**
   * Check if angle crossed the reference point
   * Handles wraparound at 2π
   */
  const crossedReference = useCallback(
    (prevAngle: number, currentAngle: number): boolean => {
      // Normalize to 0-2π range
      const twoPi = Math.PI * 2
      const prev = ((prevAngle % twoPi) + twoPi) % twoPi
      const curr = ((currentAngle % twoPi) + twoPi) % twoPi
      const ref = ((CHIME_REFERENCE_ANGLE % twoPi) + twoPi) % twoPi

      // Check if we crossed the reference going forward
      // Case 1: Normal crossing (prev < ref < curr) or
      // Case 2: Wraparound crossing (prev > curr and either prev < ref or curr > ref doesn't apply)
      if (prev <= curr) {
        // Normal forward motion, no wraparound
        return prev < ref && curr >= ref
      } else {
        // Wraparound occurred (went from ~2π back to ~0)
        // Check if reference is in the wrapped region
        return prev < ref || curr >= ref
      }
    },
    []
  )

  /**
   * Check if planet is near periapsis (closest approach to star)
   * For eccentric orbits, periapsis is at true anomaly = 0
   */
  const isNearPeriapsis = useCallback(
    (prevAngle: number, currentAngle: number, eccentricity: number): boolean => {
      // Only trigger for notably eccentric orbits
      if (eccentricity < 0.1) return false

      const twoPi = Math.PI * 2
      const prev = ((prevAngle % twoPi) + twoPi) % twoPi
      const curr = ((currentAngle % twoPi) + twoPi) % twoPi

      // Periapsis is at true anomaly = 0 (already our reference angle)
      // But we may want a slightly different check - periapsis is closest approach
      // True anomaly = 0 at periapsis for prograde orbits

      // Check if we crossed 0 (periapsis)
      if (prev <= curr) {
        return prev < 0.1 && curr >= 0.1 // Small window around 0
      } else {
        return prev < 0.1 || curr >= 0.1
      }
    },
    []
  )

  /**
   * Update tracking with new positions and trigger chimes
   * Call this on every animation frame with updated positions
   */
  const update = useCallback(
    (planets: SimulatedPlanet[], positions: Map<string, OrbitalPosition>) => {
      if (!enabled) return

      const now = Date.now()

      for (const planet of planets) {
        const position = positions.get(planet.id)
        if (!position) continue

        const currentAngle = position.trueAnomaly

        // Get or create state for this planet
        let state = planetStates.current.get(planet.id)
        if (!state) {
          state = {
            lastAngle: currentAngle,
            lastChimeTime: 0,
            lastPeriapsisTime: 0,
          }
          planetStates.current.set(planet.id, state)
          continue // Skip first frame to establish baseline
        }

        // Check for reference point crossing
        if (crossedReference(state.lastAngle, currentAngle)) {
          // Throttle rapid chimes
          if (now - state.lastChimeTime >= MIN_CHIME_INTERVAL) {
            onChime(planet)
            state.lastChimeTime = now
          }
        }

        // Check for periapsis passage
        if (onPeriapsis && isNearPeriapsis(state.lastAngle, currentAngle, planet.eccentricity)) {
          if (now - state.lastPeriapsisTime >= MIN_CHIME_INTERVAL) {
            onPeriapsis(planet)
            state.lastPeriapsisTime = now
          }
        }

        // Update state
        state.lastAngle = currentAngle
      }
    },
    [enabled, onChime, onPeriapsis, crossedReference, isNearPeriapsis]
  )

  /**
   * Reset tracking state (call when simulation restarts or system changes)
   */
  const reset = useCallback(() => {
    planetStates.current.clear()
  }, [])

  return {
    update,
    reset,
  }
}
