import type { Planet } from './planet'

/**
 * Extended planet interface with Keplerian orbital elements for simulation
 */
export interface SimulatedPlanet extends Planet {
  // Orbital elements (Keplerian)
  semiMajorAxis: number // AU (from separation)
  eccentricity: number // 0-1 (measured or estimated)
  inclination: number // degrees (estimated for 2D we use 90)
  longitudeAscendingNode: number // degrees (estimated, cosmetic for 2D)
  argumentOfPeriapsis: number // degrees (estimated if eccentric)
  meanAnomalyAtEpoch: number // degrees (estimated)

  // Provenance flags - which values are estimated vs measured
  eccentricityEstimated: boolean
  inclinationEstimated: boolean
  radiusEstimated: boolean
  argumentOfPeriapsisEstimated: boolean
  meanAnomalyEstimated: boolean

  // Computed orbital parameters
  meanMotion: number // radians/day (2π / period)
}

/**
 * Orbital position at a given time
 */
export interface OrbitalPosition {
  x: number // AU, in orbital plane
  y: number // AU, in orbital plane
  r: number // Distance from star in AU
  trueAnomaly: number // radians
  velocity: number // km/s
}

/**
 * Companion star in a binary/multiple system
 */
export interface CompanionStar {
  designation: string // e.g., "B" for the companion
  mass?: number // Solar masses (if known)
  radius?: number // Solar radii (if known)
  temperature?: number // K (if known)
}

/**
 * Habitable zone boundaries
 */
export interface HabitableZone {
  innerEdge: number // AU (conservative HZ)
  outerEdge: number // AU (optimistic HZ)
  dataAvailable: boolean // true if calculated from real data
}

/**
 * A complete planetary system prepared for simulation
 */
export interface SimulatedSystem {
  // Host star identification
  hostStar: string
  starMass: number // Solar masses
  starRadius: number // Solar radii (measured or estimated)
  starTemperature: number // K (measured or estimated)
  starSpectralType?: string
  distance?: number // Light-years

  // Binary system support
  isBinarySystem: boolean
  binaryType?: 'close' | 'distant' // Based on outermost planet orbit (< 5 AU = close)
  companionStar?: CompanionStar

  // Habitable zone (calculated from star properties)
  habitableZone?: HabitableZone

  // Provenance flags
  starRadiusEstimated: boolean
  starTemperatureEstimated: boolean

  // Planets in the system
  planets: SimulatedPlanet[]

  // System characteristics (computed)
  isMultiPlanet: boolean
  hasEccentricOrbits: boolean // Any e > 0.1
  hasResonantPair: boolean // Period ratios near integers (within 5%)
  hasPlanetsInHZ: boolean // Any planet in habitable zone
}

/**
 * Simulation state for the modal
 */
export interface SimulationState {
  system: SimulatedSystem | null
  selectedPlanetId: string | null
  simulationTime: number // days since epoch
  speed: number // multiplier (0.5, 1, 2, 5, 10)
  isPaused: boolean
  showOrbits: boolean
  showLabels: boolean
  showHabitableZone: boolean
}

/**
 * Speed options for simulation
 */
export const SIMULATION_SPEEDS = [0.5, 1, 2, 5, 10] as const
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number]

/**
 * Default simulation state
 */
export const DEFAULT_SIMULATION_STATE: Omit<SimulationState, 'system' | 'selectedPlanetId'> = {
  simulationTime: 0,
  speed: 1,
  isPaused: false,
  showOrbits: true,
  showLabels: true,
  showHabitableZone: true,
}
