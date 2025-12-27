import type { SimulatedPlanet, OrbitalPosition } from '../types/simulation'

/**
 * Gravitational constant times solar mass (AU^3 / day^2)
 * GM☉ = 2.959122e-4 AU³/day²
 */
const GM_SUN = 2.959122e-4

/**
 * AU to km conversion
 */
const AU_TO_KM = 1.496e8

/**
 * Solve Kepler's equation using Newton-Raphson iteration
 * M = E - e * sin(E) => solve for E
 *
 * @param M - Mean anomaly in radians
 * @param e - Eccentricity (0-1)
 * @param tolerance - Convergence tolerance (default 1e-8)
 * @param maxIterations - Maximum iterations (default 15)
 * @returns Eccentric anomaly in radians
 */
export function solveKeplerEquation(
  M: number,
  e: number,
  tolerance: number = 1e-8,
  maxIterations: number = 15
): number {
  // Normalize M to [0, 2π)
  M = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  // For circular orbits, E = M
  if (e < 1e-10) {
    return M
  }

  // Initial guess: M for low eccentricity, π for high
  let E = e < 0.8 ? M : Math.PI

  // Newton-Raphson iteration
  for (let i = 0; i < maxIterations; i++) {
    const sinE = Math.sin(E)
    const cosE = Math.cos(E)
    const f = E - e * sinE - M
    const fPrime = 1 - e * cosE

    // Check for convergence
    if (Math.abs(f) < tolerance) {
      return E
    }

    // Newton step with protection against division by near-zero
    if (Math.abs(fPrime) < 1e-12) {
      E = E - f / 1e-12
    } else {
      E = E - f / fPrime
    }
  }

  // Return best estimate if didn't converge
  return E
}

/**
 * Convert eccentric anomaly to true anomaly
 *
 * @param E - Eccentric anomaly in radians
 * @param e - Eccentricity
 * @returns True anomaly in radians
 */
export function eccentricToTrueAnomaly(E: number, e: number): number {
  // ν = 2 * atan2(sqrt(1+e) * sin(E/2), sqrt(1-e) * cos(E/2))
  const halfE = E / 2
  const numerator = Math.sqrt(1 + e) * Math.sin(halfE)
  const denominator = Math.sqrt(1 - e) * Math.cos(halfE)
  return 2 * Math.atan2(numerator, denominator)
}

/**
 * Calculate orbital distance from star at given eccentric anomaly
 *
 * @param a - Semi-major axis (AU)
 * @param e - Eccentricity
 * @param E - Eccentric anomaly in radians
 * @returns Distance from star in AU
 */
export function orbitalDistance(a: number, e: number, E: number): number {
  return a * (1 - e * Math.cos(E))
}

/**
 * Calculate orbital velocity at a given distance
 * Using vis-viva equation: v² = GM(2/r - 1/a)
 *
 * @param r - Current distance from star in AU
 * @param a - Semi-major axis in AU
 * @param starMass - Star mass in solar masses (default 1)
 * @returns Velocity in km/s
 */
export function orbitalVelocity(r: number, a: number, starMass: number = 1): number {
  // v² = GM * (2/r - 1/a)
  const GM = GM_SUN * starMass
  const v2 = GM * (2 / r - 1 / a)

  // Convert from AU/day to km/s
  // 1 AU/day = 1.496e8 km / 86400 s ≈ 1731.5 km/s
  const AU_PER_DAY_TO_KM_S = AU_TO_KM / 86400

  return Math.sqrt(Math.max(0, v2)) * AU_PER_DAY_TO_KM_S
}

/**
 * Calculate mean motion (angular velocity) from period
 *
 * @param period - Orbital period in days
 * @returns Mean motion in radians/day
 */
export function calculateMeanMotion(period: number): number {
  // Guard against zero/negative/NaN periods
  if (!period || period <= 0 || !Number.isFinite(period)) {
    return 0.01 // Default to very slow motion
  }
  return (2 * Math.PI) / period
}

/**
 * Compute orbital position at a given time
 *
 * @param planet - Planet with orbital elements
 * @param daysSinceEpoch - Time since epoch in days
 * @param starMass - Host star mass in solar masses (default 1)
 * @returns Position and velocity data
 */
export function computeOrbitalPosition(
  planet: SimulatedPlanet,
  daysSinceEpoch: number,
  starMass: number = 1
): OrbitalPosition {
  // Defensive defaults for missing/invalid values
  const semiMajorAxis = Number.isFinite(planet.semiMajorAxis) && planet.semiMajorAxis > 0
    ? planet.semiMajorAxis
    : 1
  const eccentricity = Number.isFinite(planet.eccentricity) && planet.eccentricity >= 0 && planet.eccentricity < 1
    ? planet.eccentricity
    : 0
  const argumentOfPeriapsis = Number.isFinite(planet.argumentOfPeriapsis)
    ? planet.argumentOfPeriapsis
    : 0
  const meanAnomalyAtEpoch = Number.isFinite(planet.meanAnomalyAtEpoch)
    ? planet.meanAnomalyAtEpoch
    : 0
  const meanMotion = Number.isFinite(planet.meanMotion) && planet.meanMotion > 0
    ? planet.meanMotion
    : 0.01

  // Mean anomaly at current time (radians)
  const M = meanAnomalyAtEpoch * (Math.PI / 180) + meanMotion * daysSinceEpoch

  // Solve Kepler's equation for eccentric anomaly
  const E = solveKeplerEquation(M, eccentricity)

  // True anomaly
  const nu = eccentricToTrueAnomaly(E, eccentricity)

  // Distance from star
  const r = orbitalDistance(semiMajorAxis, eccentricity, E)

  // Position in orbital plane (2D top-down view)
  // Include argument of periapsis to orient the orbit
  const omega = argumentOfPeriapsis * (Math.PI / 180)
  const angle = nu + omega

  const x = r * Math.cos(angle)
  const y = r * Math.sin(angle)

  // Velocity
  const velocity = orbitalVelocity(r, semiMajorAxis, starMass)

  // Final NaN check - return safe defaults if any calculation produced NaN
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(r)) {
    return {
      x: semiMajorAxis,
      y: 0,
      r: semiMajorAxis,
      trueAnomaly: 0,
      velocity: 30,
    }
  }

  return {
    x,
    y,
    r,
    trueAnomaly: nu,
    velocity: Number.isFinite(velocity) ? velocity : 30,
  }
}

/**
 * Compute positions for all planets in a system at a given time
 *
 * @param planets - Array of planets with orbital elements
 * @param daysSinceEpoch - Time since epoch in days
 * @param starMass - Host star mass in solar masses
 * @returns Map of planet ID to position
 */
export function computeSystemPositions(
  planets: SimulatedPlanet[],
  daysSinceEpoch: number,
  starMass: number = 1
): Map<string, OrbitalPosition> {
  const positions = new Map<string, OrbitalPosition>()

  for (const planet of planets) {
    positions.set(planet.id, computeOrbitalPosition(planet, daysSinceEpoch, starMass))
  }

  return positions
}

/**
 * Generate points along an orbital ellipse for rendering
 *
 * @param a - Semi-major axis in AU
 * @param e - Eccentricity
 * @param omega - Argument of periapsis in degrees
 * @param numPoints - Number of points to generate (default 100)
 * @returns Array of {x, y} points in AU
 */
export function generateOrbitPath(
  a: number,
  e: number,
  omega: number = 0,
  numPoints: number = 100
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = []
  const omegaRad = omega * (Math.PI / 180)

  for (let i = 0; i <= numPoints; i++) {
    // True anomaly from 0 to 2π
    const nu = (i / numPoints) * 2 * Math.PI

    // Distance at this true anomaly
    // r = a(1 - e²) / (1 + e*cos(ν))
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu))

    // Position including argument of periapsis
    const angle = nu + omegaRad
    points.push({
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
    })
  }

  return points
}

/**
 * Calculate periapsis and apoapsis distances
 *
 * @param a - Semi-major axis in AU
 * @param e - Eccentricity
 * @returns Periapsis and apoapsis distances in AU
 */
export function calculateApsides(
  a: number,
  e: number
): { periapsis: number; apoapsis: number } {
  return {
    periapsis: a * (1 - e),
    apoapsis: a * (1 + e),
  }
}

/**
 * Check if two planets are near orbital resonance
 * (period ratio is within tolerance of a simple integer ratio)
 *
 * @param period1 - First planet's period
 * @param period2 - Second planet's period
 * @param tolerance - How close to integer ratio (default 0.05 = 5%)
 * @returns True if planets appear to be in resonance
 */
export function checkResonance(period1: number, period2: number, tolerance: number = 0.05): boolean {
  // Ensure period1 is the shorter period
  const [shorter, longer] = period1 < period2 ? [period1, period2] : [period2, period1]
  const ratio = longer / shorter

  // Check common resonances: 2:1, 3:2, 4:3, 5:4, 5:3, 3:1
  const commonResonances = [
    2 / 1,
    3 / 2,
    4 / 3,
    5 / 4,
    5 / 3,
    3 / 1,
    4 / 1,
    5 / 2,
  ]

  for (const resonance of commonResonances) {
    if (Math.abs(ratio - resonance) / resonance < tolerance) {
      return true
    }
  }

  return false
}

/**
 * Calculate time to next periapsis from current position
 *
 * @param currentMeanAnomaly - Current mean anomaly in radians
 * @param period - Orbital period in days
 * @returns Days until next periapsis
 */
export function timeToNextPeriapsis(currentMeanAnomaly: number, period: number): number {
  // Normalize to [0, 2π)
  const M = ((currentMeanAnomaly % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  // Periapsis is at M = 0
  const remainingAngle = 2 * Math.PI - M

  return (remainingAngle / (2 * Math.PI)) * period
}

/**
 * Calculate what fraction of orbit has been completed
 *
 * @param currentMeanAnomaly - Current mean anomaly in radians
 * @returns Fraction from 0 to 1
 */
export function orbitProgress(currentMeanAnomaly: number): number {
  const M = ((currentMeanAnomaly % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  return M / (2 * Math.PI)
}
