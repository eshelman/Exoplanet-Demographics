import { useEffect, useRef, useCallback } from 'react'
import { useVizStore } from '../store'
import { parseDeepLink, updateBrowserUrl, systemNameToSlug, extractPlanetLetter } from '../utils/deepLinks'
import { buildSimulatedSystem, groupPlanetsBySystem } from '../utils/systemGrouping'
import type { Planet } from '../types'

interface UseDeepLinkOptions {
  planets: Planet[]
  onSystemNotFound?: (systemName: string) => void
}

/**
 * Hook that synchronizes URL with simulation state
 *
 * - On mount: parses URL and opens simulation if system param present
 * - On simulation open/close: updates URL to reflect current state
 */
export function useDeepLink({ planets, onSystemNotFound }: UseDeepLinkOptions) {
  const openSimulation = useVizStore((s) => s.openSimulation)
  const closeSimulation = useVizStore((s) => s.closeSimulation)
  const simulationOpen = useVizStore((s) => s.simulationOpen)
  const simulationSystem = useVizStore((s) => s.simulationSystem)
  const simulationPlanetId = useVizStore((s) => s.simulationPlanetId)

  // Track if we've done initial URL processing
  const initializedRef = useRef(false)

  // Track if initial URL has been processed (to prevent premature clearing)
  const initialUrlProcessedRef = useRef(false)

  // Track if we're programmatically updating URL to avoid loops
  const updatingUrlRef = useRef(false)

  /**
   * Find a system by name (case-insensitive, slug-aware)
   */
  const findSystemByName = useCallback(
    (systemName: string): { hostStar: string; planets: Planet[] } | null => {
      const systems = groupPlanetsBySystem(planets)
      const normalizedSearch = systemName.toLowerCase()

      // Try exact match first
      for (const [hostStar, systemPlanets] of systems) {
        if (hostStar.toLowerCase() === normalizedSearch) {
          return { hostStar, planets: systemPlanets }
        }
      }

      // Try slug match
      const searchSlug = systemNameToSlug(systemName)
      for (const [hostStar, systemPlanets] of systems) {
        if (systemNameToSlug(hostStar) === searchSlug) {
          return { hostStar, planets: systemPlanets }
        }
      }

      // Try partial match (for cases like "trappist" matching "TRAPPIST-1")
      for (const [hostStar, systemPlanets] of systems) {
        if (hostStar.toLowerCase().includes(normalizedSearch)) {
          return { hostStar, planets: systemPlanets }
        }
      }

      return null
    },
    [planets]
  )

  /**
   * Find a planet by letter within a system
   */
  const findPlanetByLetter = useCallback(
    (systemPlanets: Planet[], letter: string): Planet | null => {
      const normalizedLetter = letter.toLowerCase()

      for (const planet of systemPlanets) {
        const planetLetter = extractPlanetLetter(planet.name)
        if (planetLetter === normalizedLetter) {
          return planet
        }
      }

      // Also try matching by name containing the letter
      for (const planet of systemPlanets) {
        if (planet.name.toLowerCase().endsWith(` ${normalizedLetter}`)) {
          return planet
        }
      }

      return null
    },
    []
  )

  /**
   * Process URL params and open simulation if system specified
   * Returns true if a system was found and opened
   */
  const processUrl = useCallback((): boolean => {
    if (planets.length === 0) return false

    const params = parseDeepLink(window.location.search)

    if (!params.system) return false

    const systemInfo = findSystemByName(params.system)

    if (!systemInfo) {
      console.warn(`[DeepLink] System not found: ${params.system}`)
      onSystemNotFound?.(params.system)
      return false
    }

    try {
      const system = buildSimulatedSystem(systemInfo.hostStar, systemInfo.planets)

      // Find the planet to select (if specified)
      let planetId: string | undefined
      if (params.planet) {
        const planet = findPlanetByLetter(systemInfo.planets, params.planet)
        if (planet) {
          planetId = planet.id
        }
      }

      // Default to first planet if none specified
      if (!planetId && system.planets.length > 0) {
        planetId = system.planets[0].id
      }

      updatingUrlRef.current = true
      openSimulation(system, planetId || system.planets[0]?.id || '')

      // Store speed preference if provided (could be used by simulation)
      if (params.speed) {
        // Speed is stored for the simulation component to pick up
        sessionStorage.setItem('simulation-speed', params.speed.toString())
      }

      if (params.hz) {
        sessionStorage.setItem('simulation-hz', 'true')
      }

      updatingUrlRef.current = false
      return true
    } catch (error) {
      console.error('[DeepLink] Failed to build system:', error)
      onSystemNotFound?.(params.system)
      return false
    }
  }, [planets, findSystemByName, findPlanetByLetter, openSimulation, onSystemNotFound])

  // Process URL on initial load (once planets are loaded)
  useEffect(() => {
    if (initializedRef.current || planets.length === 0) return
    initializedRef.current = true

    // Process URL immediately (no delay needed)
    processUrl()
    // Mark initial URL as processed so URL-clearing effect can run
    initialUrlProcessedRef.current = true
  }, [planets, processUrl])

  // Update URL when simulation state changes
  useEffect(() => {
    // Don't update URL if we're in the middle of programmatic updates
    if (updatingUrlRef.current) return

    // Don't clear URL until initial URL has been processed
    // This prevents the URL from being cleared before we can read it on page load
    if (!initialUrlProcessedRef.current) return

    if (simulationOpen && simulationSystem) {
      // Find the selected planet letter
      let planetLetter: string | undefined
      if (simulationPlanetId) {
        const planet = simulationSystem.planets.find((p) => p.id === simulationPlanetId)
        if (planet) {
          planetLetter = extractPlanetLetter(planet.name) || undefined
        }
      }

      updateBrowserUrl({
        system: simulationSystem.hostStar,
        planet: planetLetter,
      })
    } else {
      // Clear URL params when simulation is closed
      updateBrowserUrl(null)
    }
  }, [simulationOpen, simulationSystem, simulationPlanetId])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = parseDeepLink(window.location.search)

      if (params.system) {
        // URL has system param, try to open
        processUrl()
      } else if (simulationOpen) {
        // URL is clear but simulation is open, close it
        closeSimulation()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [processUrl, simulationOpen, closeSimulation])

  return {
    findSystemByName,
    findPlanetByLetter,
  }
}
