import type { Planet } from '../types/planet'
import type { SimulatedPlanet, SimulatedSystem, CompanionStar } from '../types/simulation'
import { prepareSimulatedPlanet, estimateStellarProperties } from './dataEstimation'
import { calculateHabitableZone, isPlanetInHabitableZone } from './habitableZone'
import { checkResonance } from './orbitalMechanics'

/**
 * Threshold for classifying binary systems as close vs distant
 * If outermost planet is < 5 AU, assume close binary
 */
const BINARY_CLASSIFICATION_THRESHOLD_AU = 5

/**
 * Extended planet data as it appears in our JSON (includes stellar properties)
 */
interface RawPlanetData extends Planet {
  eccentricity?: number | null
  insolation?: number | null
  starTemperature?: number | null
  starRadius?: number | null
  starMass?: number | null
  starSpectralType?: string | null
}

/**
 * Group planets by their host star
 *
 * @param planets - Array of all planets
 * @returns Map of host star name to array of planets
 */
export function groupPlanetsBySystem(planets: Planet[]): Map<string, Planet[]> {
  const systems = new Map<string, Planet[]>()

  for (const planet of planets) {
    // Skip solar system planets
    if (planet.isSolarSystem) continue

    const hostStar = planet.hostStar || 'Unknown'

    if (!systems.has(hostStar)) {
      systems.set(hostStar, [])
    }
    systems.get(hostStar)!.push(planet)
  }

  return systems
}

/**
 * Check if a host star name indicates a binary system
 * Binary systems typically have " A" or " B" suffix
 *
 * @param hostStar - Host star name
 * @returns Object with binary info
 */
export function detectBinarySystem(hostStar: string): {
  isBinary: boolean
  primaryDesignation?: string
  companionDesignation?: string
} {
  // Check for " A" or " B" suffix (with space before letter)
  const binaryMatch = hostStar.match(/^(.+)\s+([AB])$/i)

  if (binaryMatch) {
    const designation = binaryMatch[2].toUpperCase()

    return {
      isBinary: true,
      primaryDesignation: designation,
      companionDesignation: designation === 'A' ? 'B' : 'A',
    }
  }

  // Check for "A" or "B" directly attached to name (e.g., "HD 131399A")
  const attachedMatch = hostStar.match(/^(.+?)([AB])$/i)
  if (attachedMatch && attachedMatch[1].length > 3) {
    const designation = attachedMatch[2].toUpperCase()

    // Avoid false positives like "WASP-12b" (planet designation, not star)
    // Star binary designations are uppercase A/B
    if (designation === attachedMatch[2]) {
      return {
        isBinary: true,
        primaryDesignation: designation,
        companionDesignation: designation === 'A' ? 'B' : 'A',
      }
    }
  }

  return { isBinary: false }
}

/**
 * Classify binary system as close or distant based on outermost planet
 *
 * @param planets - Planets in the system
 * @returns 'close' if outermost planet < 5 AU, 'distant' otherwise
 */
export function classifyBinaryType(planets: Planet[]): 'close' | 'distant' {
  if (planets.length === 0) return 'distant'

  // Find outermost planet by semi-major axis (separation)
  let maxSeparation = 0
  for (const planet of planets) {
    const separation = planet.separation || 0
    if (separation > maxSeparation) {
      maxSeparation = separation
    }
  }

  return maxSeparation < BINARY_CLASSIFICATION_THRESHOLD_AU ? 'close' : 'distant'
}

/**
 * Check if any pair of planets in the system is in orbital resonance
 */
function hasResonantPlanets(planets: SimulatedPlanet[]): boolean {
  if (planets.length < 2) return false

  for (let i = 0; i < planets.length - 1; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      if (checkResonance(planets[i].period, planets[j].period)) {
        return true
      }
    }
  }

  return false
}

/**
 * Check if any planet has significant eccentricity
 */
function hasSignificantEccentricity(planets: SimulatedPlanet[]): boolean {
  return planets.some((p) => p.eccentricity > 0.1)
}

/**
 * Build a complete SimulatedSystem from a group of planets
 *
 * @param hostStar - Name of the host star
 * @param planets - Planets orbiting this star
 * @returns Complete SimulatedSystem ready for simulation
 */
export function buildSimulatedSystem(hostStar: string, planets: Planet[]): SimulatedSystem {
  if (planets.length === 0) {
    throw new Error(`Cannot build system with no planets: ${hostStar}`)
  }

  // Get stellar properties from first planet (they should all have same star data)
  const firstPlanet = planets[0] as RawPlanetData

  // Estimate any missing stellar properties
  const starMass = firstPlanet.starMass || 1.0 // Default to solar mass
  const stellarProps = estimateStellarProperties(
    starMass,
    firstPlanet.starRadius,
    firstPlanet.starTemperature,
    firstPlanet.starSpectralType
  )

  // Detect binary system
  const binaryInfo = detectBinarySystem(hostStar)

  // Prepare simulated planets
  const simulatedPlanets = planets
    .map((p) => prepareSimulatedPlanet(p))
    .sort((a, b) => a.semiMajorAxis - b.semiMajorAxis) // Sort by distance from star

  // Calculate habitable zone
  const habitableZone = calculateHabitableZone(
    stellarProps.temperature,
    stellarProps.radius,
    !stellarProps.temperatureEstimated || !stellarProps.radiusEstimated
  )

  // Check for planets in HZ
  const hasPlanetsInHZ = habitableZone
    ? simulatedPlanets.some((p) => isPlanetInHabitableZone(p.semiMajorAxis, habitableZone))
    : false

  // Build companion star info if binary
  let companionStar: CompanionStar | undefined
  let binaryType: 'close' | 'distant' | undefined

  if (binaryInfo.isBinary) {
    binaryType = classifyBinaryType(planets)
    companionStar = {
      designation: binaryInfo.companionDesignation || 'B',
      // We don't have detailed companion data, so leave optional fields undefined
    }
  }

  return {
    hostStar,
    starMass,
    starRadius: stellarProps.radius,
    starTemperature: stellarProps.temperature,
    starSpectralType: firstPlanet.starSpectralType || undefined,
    distance: firstPlanet.distance || undefined,

    isBinarySystem: binaryInfo.isBinary,
    binaryType,
    companionStar,

    habitableZone,

    starRadiusEstimated: stellarProps.radiusEstimated,
    starTemperatureEstimated: stellarProps.temperatureEstimated,

    planets: simulatedPlanets,

    isMultiPlanet: simulatedPlanets.length > 1,
    hasEccentricOrbits: hasSignificantEccentricity(simulatedPlanets),
    hasResonantPair: hasResonantPlanets(simulatedPlanets),
    hasPlanetsInHZ,
  }
}

/**
 * Get or create a SimulatedSystem for a given planet
 *
 * @param planet - The planet to find the system for
 * @param allPlanets - All planets in the dataset
 * @returns SimulatedSystem containing this planet
 */
export function getSystemForPlanet(planet: Planet, allPlanets: Planet[]): SimulatedSystem {
  const hostStar = planet.hostStar || planet.name

  // Find all planets in this system
  const systemPlanets = allPlanets.filter(
    (p) => !p.isSolarSystem && (p.hostStar === hostStar || (!p.hostStar && p.id === planet.id))
  )

  return buildSimulatedSystem(hostStar, systemPlanets)
}

/**
 * Build all systems from a planet dataset
 *
 * @param planets - All planets
 * @returns Map of host star name to SimulatedSystem
 */
export function buildAllSystems(planets: Planet[]): Map<string, SimulatedSystem> {
  const grouped = groupPlanetsBySystem(planets)
  const systems = new Map<string, SimulatedSystem>()

  for (const [hostStar, systemPlanets] of grouped) {
    systems.set(hostStar, buildSimulatedSystem(hostStar, systemPlanets))
  }

  return systems
}

/**
 * Find systems with specific characteristics
 */
export function findNotableSystems(systems: Map<string, SimulatedSystem>): {
  multiPlanet: SimulatedSystem[]
  eccentric: SimulatedSystem[]
  resonant: SimulatedSystem[]
  withHZPlanets: SimulatedSystem[]
  binary: SimulatedSystem[]
} {
  const multiPlanet: SimulatedSystem[] = []
  const eccentric: SimulatedSystem[] = []
  const resonant: SimulatedSystem[] = []
  const withHZPlanets: SimulatedSystem[] = []
  const binary: SimulatedSystem[] = []

  for (const system of systems.values()) {
    if (system.isMultiPlanet) multiPlanet.push(system)
    if (system.hasEccentricOrbits) eccentric.push(system)
    if (system.hasResonantPair) resonant.push(system)
    if (system.hasPlanetsInHZ) withHZPlanets.push(system)
    if (system.isBinarySystem) binary.push(system)
  }

  // Sort by number of planets (most interesting first)
  multiPlanet.sort((a, b) => b.planets.length - a.planets.length)

  return { multiPlanet, eccentric, resonant, withHZPlanets, binary }
}
