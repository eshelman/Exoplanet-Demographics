import type { HabitableZone } from '../types/simulation'

/**
 * Solar constants
 */
const SOLAR_TEMPERATURE = 5778 // K

// Habitable zone insolation boundaries (Earth units)
// Based on Kopparapu et al. (2013) conservative and optimistic estimates
// Note: Insolation = L_star / d^2, so d = sqrt(L_star / S)
// Conservative values used: inner S=1.1 (moist greenhouse), outer S=0.36 (max greenhouse)
// Optimistic values: inner S=1.8 (recent Venus), outer S=0.25 (early Mars)

/**
 * Calculate stellar luminosity from temperature and radius
 * L = (R/R☉)² × (T/T☉)⁴
 *
 * @param temperature - Stellar temperature in Kelvin
 * @param radius - Stellar radius in solar radii
 * @returns Luminosity in solar luminosities
 */
export function calculateStellarLuminosity(temperature: number, radius: number): number {
  const tempRatio = temperature / SOLAR_TEMPERATURE
  return radius * radius * Math.pow(tempRatio, 4)
}

/**
 * Calculate insolation (stellar flux) at a given distance
 *
 * @param luminosity - Stellar luminosity in solar luminosities
 * @param distance - Distance from star in AU
 * @returns Insolation in Earth units (Earth = 1)
 */
export function calculateInsolation(luminosity: number, distance: number): number {
  // S = L / d²
  return luminosity / (distance * distance)
}

/**
 * Calculate habitable zone boundaries for a star
 *
 * @param temperature - Stellar temperature in Kelvin
 * @param radius - Stellar radius in solar radii
 * @param dataAvailable - Whether this is from real data or estimates
 * @returns HabitableZone object with inner and outer edges
 */
export function calculateHabitableZone(
  temperature: number,
  radius: number,
  dataAvailable: boolean = false
): HabitableZone {
  const luminosity = calculateStellarLuminosity(temperature, radius)

  // Calculate boundaries using d = sqrt(L/S)
  // For conservative HZ:
  // Inner edge: where insolation = 1.37 Earth (runaway greenhouse)
  // Outer edge: where insolation = 0.95 Earth (early Mars, but inverted relationship)
  // Actually the conservative inner is closer and outer is farther

  // Conservative: 0.95-1.37 insolation means
  // Inner at high insolation (close), outer at low insolation (far)
  // But the names are confusing - let's use physical distance:
  // innerEdge = sqrt(L/1.37) - where it's too hot
  // outerEdge = sqrt(L/0.95) - wait, that gives outer closer than inner

  // Let me reconsider:
  // Insolation S = L/d², so d = sqrt(L/S)
  // Higher S means closer to star
  // For the habitable zone:
  // - Inner edge (close to star, high insolation): S = 1.37 (conservative) or 1.77 (optimistic)
  // - Outer edge (far from star, low insolation): S = 0.95 (conservative) or 0.25 (optimistic)

  // Wait, that's backwards. Let me check:
  // Conservative HZ inner = recent Venus = 0.75 AU for Sun (S ≈ 1.78)
  // Conservative HZ outer = early Mars = 1.77 AU for Sun (S ≈ 0.32)

  // The values I had were inverted. Let me use correct values:
  // Inner edge (conservative): S ≈ 1.11 (moist greenhouse)
  // Outer edge (conservative): S ≈ 0.36 (maximum greenhouse)
  // Inner edge (optimistic): S ≈ 1.78 (recent Venus)
  // Outer edge (optimistic): S ≈ 0.32 (early Mars)

  // For simplicity, I'll use:
  // Conservative: inner at S=1.1, outer at S=0.36
  // Optimistic: inner at S=1.8, outer at S=0.32

  const conservativeInnerS = 1.1
  const conservativeOuterS = 0.36

  const innerEdge = Math.sqrt(luminosity / conservativeInnerS)
  const outerEdge = Math.sqrt(luminosity / conservativeOuterS)

  return {
    innerEdge,
    outerEdge,
    dataAvailable,
  }
}

/**
 * Check if a planet is within the habitable zone
 *
 * @param semiMajorAxis - Planet's semi-major axis in AU
 * @param habitableZone - The habitable zone boundaries
 * @returns true if planet is within HZ
 */
export function isPlanetInHabitableZone(
  semiMajorAxis: number,
  habitableZone: HabitableZone
): boolean {
  return semiMajorAxis >= habitableZone.innerEdge && semiMajorAxis <= habitableZone.outerEdge
}

/**
 * Check if a planet is within the optimistic habitable zone
 * (wider than conservative)
 *
 * @param semiMajorAxis - Planet's semi-major axis in AU
 * @param temperature - Stellar temperature in K
 * @param radius - Stellar radius in solar radii
 * @returns true if planet is within optimistic HZ
 */
export function isPlanetInOptimisticHZ(
  semiMajorAxis: number,
  temperature: number,
  radius: number
): boolean {
  const luminosity = calculateStellarLuminosity(temperature, radius)

  const optimisticInnerS = 1.8
  const optimisticOuterS = 0.25

  const innerEdge = Math.sqrt(luminosity / optimisticInnerS)
  const outerEdge = Math.sqrt(luminosity / optimisticOuterS)

  return semiMajorAxis >= innerEdge && semiMajorAxis <= outerEdge
}

/**
 * Get the insolation received by a planet
 *
 * @param semiMajorAxis - Planet's semi-major axis in AU
 * @param temperature - Stellar temperature in K
 * @param radius - Stellar radius in solar radii
 * @returns Insolation in Earth units
 */
export function getPlanetInsolation(
  semiMajorAxis: number,
  temperature: number,
  radius: number
): number {
  const luminosity = calculateStellarLuminosity(temperature, radius)
  return calculateInsolation(luminosity, semiMajorAxis)
}

/**
 * Classify a planet's thermal zone based on insolation
 */
export type ThermalZone = 'too_hot' | 'habitable' | 'too_cold' | 'optimistic_hot' | 'optimistic_cold'

export function classifyThermalZone(insolation: number): ThermalZone {
  if (insolation > 1.8) return 'too_hot'
  if (insolation > 1.1) return 'optimistic_hot'
  if (insolation >= 0.36) return 'habitable'
  if (insolation >= 0.25) return 'optimistic_cold'
  return 'too_cold'
}

/**
 * Get habitable zone as SVG ellipse parameters for rendering
 *
 * @param hz - Habitable zone boundaries
 * @param scale - Pixels per AU
 * @returns SVG ellipse parameters
 */
export function getHZRenderParams(
  hz: HabitableZone,
  scale: number
): { innerRadius: number; outerRadius: number } {
  return {
    innerRadius: hz.innerEdge * scale,
    outerRadius: hz.outerEdge * scale,
  }
}
