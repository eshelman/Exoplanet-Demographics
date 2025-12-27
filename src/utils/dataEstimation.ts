import type { Planet } from '../types/planet'
import type { SimulatedPlanet } from '../types/simulation'
import { calculateMeanMotion } from './orbitalMechanics'

/**
 * Mass-radius relationship exponents by planet type
 * Based on Chen & Kipping (2017) and other empirical studies
 */
const MASS_RADIUS_RELATIONS = {
  rocky: { exponent: 0.27, scale: 1.0 }, // R ∝ M^0.27 for terrestrial
  'super-earth': { exponent: 0.27, scale: 1.0 },
  'sub-neptune': { exponent: 0.55, scale: 1.2 }, // Transition regime
  'neptune-like': { exponent: 0.55, scale: 1.0 },
  'hot-jupiter': { exponent: 0.0, scale: 11.2 }, // Roughly constant radius
  'cold-jupiter': { exponent: 0.0, scale: 11.2 },
  'hot-neptune': { exponent: 0.55, scale: 1.0 },
  default: { exponent: 0.27, scale: 1.0 },
} as const

/**
 * Stellar temperature estimates by spectral type
 * Values in Kelvin
 */
const SPECTRAL_TYPE_TEMPERATURES: Record<string, number> = {
  O: 35000,
  B: 20000,
  A: 8500,
  F: 6500,
  G: 5500,
  K: 4500,
  M: 3200,
  L: 2000,
  T: 1200,
}

/**
 * Default stellar temperature estimate based on mass
 * Using main sequence relations
 */
function estimateTemperatureFromMass(starMass: number): number {
  // T ∝ M^0.5 for main sequence stars (rough approximation)
  // Solar temperature is 5778 K
  return Math.round(5778 * Math.pow(starMass, 0.5))
}

/**
 * Estimate stellar radius from mass
 * For main sequence: R ∝ M^0.8
 */
function estimateStellarRadiusFromMass(starMass: number): number {
  return Math.pow(starMass, 0.8)
}

/**
 * Estimate planet radius from mass using empirical relations
 */
export function estimatePlanetRadiusFromMass(
  mass: number,
  planetType?: string
): number {
  const relation = MASS_RADIUS_RELATIONS[planetType as keyof typeof MASS_RADIUS_RELATIONS]
    || MASS_RADIUS_RELATIONS.default

  // R = scale * M^exponent (in Earth radii, mass in Earth masses)
  return relation.scale * Math.pow(mass, relation.exponent)
}

/**
 * Parse spectral type to extract base type (e.g., "G2V" -> "G")
 */
function parseSpectralType(spectralType: string): string | null {
  if (!spectralType) return null
  const match = spectralType.match(/^([OBAFGKMLTY])/i)
  return match ? match[1].toUpperCase() : null
}

/**
 * Estimate stellar temperature from spectral type
 */
export function estimateTemperatureFromSpectralType(
  spectralType: string | null | undefined,
  starMass?: number
): { temperature: number; estimated: boolean } {
  if (spectralType) {
    const baseType = parseSpectralType(spectralType)
    if (baseType && SPECTRAL_TYPE_TEMPERATURES[baseType]) {
      return {
        temperature: SPECTRAL_TYPE_TEMPERATURES[baseType],
        estimated: false, // Derived from data, though approximate
      }
    }
  }

  // Fall back to mass-based estimate
  if (starMass && starMass > 0) {
    return {
      temperature: estimateTemperatureFromMass(starMass),
      estimated: true,
    }
  }

  // Default to solar
  return { temperature: 5778, estimated: true }
}

/**
 * Generate a deterministic pseudo-random number from a seed string
 * Used for consistent estimation across sessions
 */
function seededRandom(seed: string, offset: number = 0): number {
  let hash = 0
  const str = seed + offset.toString()
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return (Math.abs(hash) % 1000) / 1000
}

/**
 * Estimate missing orbital elements for a planet
 */
export function estimateMissingOrbitalElements(
  planet: Planet,
  seed?: string
): {
  eccentricity: number
  eccentricityEstimated: boolean
  argumentOfPeriapsis: number
  argumentOfPeriapsisEstimated: boolean
  meanAnomalyAtEpoch: number
  meanAnomalyEstimated: boolean
  inclination: number
  inclinationEstimated: boolean
} {
  const planetSeed = seed || planet.id

  // Get eccentricity from the raw planet data
  // Note: TypeScript Planet interface may not include eccentricity,
  // but our JSON data does have it
  const rawPlanet = planet as Planet & { eccentricity?: number | null }
  const hasEccentricity = rawPlanet.eccentricity !== null && rawPlanet.eccentricity !== undefined

  let eccentricity: number
  let eccentricityEstimated: boolean

  if (hasEccentricity) {
    eccentricity = rawPlanet.eccentricity as number
    eccentricityEstimated = false
  } else {
    // Estimate based on period
    // Short-period planets tend to be circularized by tidal forces
    if (planet.period < 10) {
      eccentricity = 0.01 + seededRandom(planetSeed, 1) * 0.04 // 0.01-0.05
    } else if (planet.period < 100) {
      eccentricity = 0.05 + seededRandom(planetSeed, 1) * 0.15 // 0.05-0.2
    } else {
      eccentricity = 0.1 + seededRandom(planetSeed, 1) * 0.3 // 0.1-0.4
    }
    eccentricityEstimated = true
  }

  // Argument of periapsis - always estimated for 2D visualization
  // Use deterministic random based on planet ID
  const argumentOfPeriapsis = seededRandom(planetSeed, 2) * 360
  const argumentOfPeriapsisEstimated = true

  // Mean anomaly at epoch - determines starting position
  // Use discovery year to add some variation, or random if not available
  let meanAnomalyAtEpoch: number
  if (planet.discoveryYear) {
    // Use discovery year as a proxy for phase
    const yearOffset = (planet.discoveryYear - 2000) * 47 // Arbitrary multiplier
    meanAnomalyAtEpoch = (yearOffset + seededRandom(planetSeed, 3) * 180) % 360
  } else {
    meanAnomalyAtEpoch = seededRandom(planetSeed, 3) * 360
  }
  const meanAnomalyEstimated = true

  // Inclination - for 2D top-down view, we use 90° (edge-on) as reference
  // but store the estimated value for stats display
  let inclination: number
  let inclinationEstimated: boolean

  // Transit planets are near edge-on (high inclination ~85-90°)
  // RV planets could be anywhere, but we show edge-on for visualization
  if (planet.detectionMethod.includes('transit')) {
    inclination = 85 + seededRandom(planetSeed, 4) * 5 // 85-90°
    inclinationEstimated = true // Still estimated, though constrained
  } else {
    // For RV and other methods, inclination is unconstrained
    // We'll use 90° for display but mark as estimated
    inclination = 90
    inclinationEstimated = true
  }

  return {
    eccentricity,
    eccentricityEstimated,
    argumentOfPeriapsis,
    argumentOfPeriapsisEstimated,
    meanAnomalyAtEpoch,
    meanAnomalyEstimated,
    inclination,
    inclinationEstimated,
  }
}

/**
 * Convert a raw Planet to a SimulatedPlanet with all required orbital elements
 */
export function prepareSimulatedPlanet(planet: Planet): SimulatedPlanet {
  // Estimate missing orbital elements
  const orbitalElements = estimateMissingOrbitalElements(planet)

  // Handle missing radius
  let radius: number
  let radiusEstimated: boolean

  if (planet.radius && planet.radius > 0) {
    radius = planet.radius
    radiusEstimated = false
  } else if (planet.mass && planet.mass > 0) {
    radius = estimatePlanetRadiusFromMass(planet.mass, planet.planetType)
    radiusEstimated = true
  } else {
    // No mass or radius - use a default based on planet type
    radius = planet.planetType === 'hot-jupiter' || planet.planetType === 'cold-jupiter'
      ? 11.2
      : planet.planetType === 'neptune-like' || planet.planetType === 'hot-neptune'
        ? 4.0
        : planet.planetType === 'sub-neptune'
          ? 2.5
          : 1.5 // Default to super-Earth size
    radiusEstimated = true
  }

  // Semi-major axis from separation (they should be the same)
  const semiMajorAxis = planet.separation || calculateSemiMajorAxis(planet.period, 1.0)

  return {
    ...planet,
    radius,
    semiMajorAxis,
    eccentricity: orbitalElements.eccentricity,
    inclination: orbitalElements.inclination,
    longitudeAscendingNode: 0, // Not used in 2D view
    argumentOfPeriapsis: orbitalElements.argumentOfPeriapsis,
    meanAnomalyAtEpoch: orbitalElements.meanAnomalyAtEpoch,
    meanMotion: calculateMeanMotion(planet.period),
    eccentricityEstimated: orbitalElements.eccentricityEstimated,
    inclinationEstimated: orbitalElements.inclinationEstimated,
    radiusEstimated,
    argumentOfPeriapsisEstimated: orbitalElements.argumentOfPeriapsisEstimated,
    meanAnomalyEstimated: orbitalElements.meanAnomalyEstimated,
  }
}

/**
 * Calculate semi-major axis from period using Kepler's third law
 * a³ = (P²×G×M)/(4π²)
 *
 * @param period - Orbital period in days
 * @param starMass - Star mass in solar masses
 * @returns Semi-major axis in AU
 */
export function calculateSemiMajorAxis(period: number, starMass: number): number {
  // Kepler's third law: a³/P² = GM/(4π²)
  // For solar units: a(AU)³/P(years)² = M(solar masses)
  // Convert period from days to years
  const periodYears = period / 365.25
  // a = (P² × M)^(1/3)
  return Math.pow(periodYears * periodYears * starMass, 1 / 3)
}

/**
 * Estimate stellar properties if missing
 */
export function estimateStellarProperties(
  starMass: number,
  starRadius?: number | null,
  starTemperature?: number | null,
  starSpectralType?: string | null
): {
  radius: number
  radiusEstimated: boolean
  temperature: number
  temperatureEstimated: boolean
} {
  // Radius
  let radius: number
  let radiusEstimated: boolean

  if (starRadius && starRadius > 0) {
    radius = starRadius
    radiusEstimated = false
  } else {
    radius = estimateStellarRadiusFromMass(starMass)
    radiusEstimated = true
  }

  // Temperature
  let temperature: number
  let temperatureEstimated: boolean

  if (starTemperature && starTemperature > 0) {
    temperature = starTemperature
    temperatureEstimated = false
  } else {
    const tempEstimate = estimateTemperatureFromSpectralType(starSpectralType, starMass)
    temperature = tempEstimate.temperature
    temperatureEstimated = tempEstimate.estimated
  }

  return {
    radius,
    radiusEstimated,
    temperature,
    temperatureEstimated,
  }
}
