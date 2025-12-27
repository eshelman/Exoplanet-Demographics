import { describe, it, expect } from 'vitest'
import {
  solveKeplerEquation,
  eccentricToTrueAnomaly,
  orbitalDistance,
  orbitalVelocity,
  calculateMeanMotion,
  computeOrbitalPosition,
  generateOrbitPath,
  calculateApsides,
  checkResonance,
  timeToNextPeriapsis,
  orbitProgress,
} from './orbitalMechanics'
import type { SimulatedPlanet } from '../types/simulation'

describe('solveKeplerEquation', () => {
  it('returns M for circular orbit (e=0)', () => {
    const M = 1.5 // radians
    const result = solveKeplerEquation(M, 0)
    expect(result).toBeCloseTo(M, 8)
  })

  it('solves correctly for low eccentricity', () => {
    // For e=0.1, M=1.0, the solution should be approximately E≈1.084
    const M = 1.0
    const e = 0.1
    const E = solveKeplerEquation(M, e)

    // Verify: M = E - e * sin(E)
    const reconstructedM = E - e * Math.sin(E)
    expect(reconstructedM).toBeCloseTo(M, 6)
  })

  it('solves correctly for high eccentricity', () => {
    const M = 2.0
    const e = 0.8
    const E = solveKeplerEquation(M, e)

    // Verify: M = E - e * sin(E)
    const reconstructedM = E - e * Math.sin(E)
    expect(reconstructedM).toBeCloseTo(M, 6)
  })

  it('handles edge case at periapsis (M=0)', () => {
    const E = solveKeplerEquation(0, 0.5)
    expect(E).toBeCloseTo(0, 6)
  })

  it('handles edge case at apoapsis (M=π)', () => {
    const E = solveKeplerEquation(Math.PI, 0.5)
    expect(E).toBeCloseTo(Math.PI, 6)
  })
})

describe('eccentricToTrueAnomaly', () => {
  it('returns 0 when E=0', () => {
    expect(eccentricToTrueAnomaly(0, 0.5)).toBeCloseTo(0, 8)
  })

  it('returns π when E=π', () => {
    expect(eccentricToTrueAnomaly(Math.PI, 0.5)).toBeCloseTo(Math.PI, 6)
  })

  it('equals E for circular orbit', () => {
    const E = 1.2
    expect(eccentricToTrueAnomaly(E, 0)).toBeCloseTo(E, 8)
  })

  it('true anomaly leads eccentric anomaly for e>0', () => {
    // For elliptical orbits, ν > E in the first half
    const E = 1.0
    const e = 0.5
    const nu = eccentricToTrueAnomaly(E, e)
    expect(nu).toBeGreaterThan(E)
  })
})

describe('orbitalDistance', () => {
  it('returns a at apoapsis (E=π) for e>0', () => {
    const a = 1.0
    const e = 0.5
    // At apoapsis: r = a(1+e)
    const r = orbitalDistance(a, e, Math.PI)
    expect(r).toBeCloseTo(a * (1 + e), 6)
  })

  it('returns a at periapsis (E=0) for e>0', () => {
    const a = 1.0
    const e = 0.5
    // At periapsis: r = a(1-e)
    const r = orbitalDistance(a, e, 0)
    expect(r).toBeCloseTo(a * (1 - e), 6)
  })

  it('returns a for circular orbit', () => {
    const a = 2.5
    const r = orbitalDistance(a, 0, Math.PI / 3)
    expect(r).toBeCloseTo(a, 8)
  })
})

describe('orbitalVelocity', () => {
  it('returns approximately 30 km/s for Earth-like orbit', () => {
    // Earth: a ≈ 1 AU, circular, v ≈ 29.78 km/s
    const v = orbitalVelocity(1, 1, 1)
    expect(v).toBeCloseTo(29.78, 0)
  })

  it('velocity is higher at periapsis than apoapsis', () => {
    const a = 1.0
    const e = 0.5
    const rPeri = a * (1 - e)
    const rApo = a * (1 + e)

    const vPeri = orbitalVelocity(rPeri, a)
    const vApo = orbitalVelocity(rApo, a)

    expect(vPeri).toBeGreaterThan(vApo)
  })
})

describe('calculateMeanMotion', () => {
  it('returns 2π for 1-day period', () => {
    expect(calculateMeanMotion(1)).toBeCloseTo(2 * Math.PI, 8)
  })

  it('returns π for 2-day period', () => {
    expect(calculateMeanMotion(2)).toBeCloseTo(Math.PI, 8)
  })

  it('Earth mean motion is approximately 0.0172 rad/day', () => {
    // Earth period ≈ 365.25 days
    const n = calculateMeanMotion(365.25)
    expect(n).toBeCloseTo(0.01721, 4)
  })
})

describe('computeOrbitalPosition', () => {
  const makeTestPlanet = (overrides: Partial<SimulatedPlanet> = {}): SimulatedPlanet => ({
    id: 'test',
    name: 'Test Planet',
    period: 365.25,
    detectionMethod: 'transit',
    discoveryYear: 2020,
    semiMajorAxis: 1.0,
    eccentricity: 0,
    inclination: 90,
    longitudeAscendingNode: 0,
    argumentOfPeriapsis: 0,
    meanAnomalyAtEpoch: 0,
    meanMotion: calculateMeanMotion(365.25),
    eccentricityEstimated: false,
    inclinationEstimated: true,
    radiusEstimated: false,
    argumentOfPeriapsisEstimated: true,
    meanAnomalyEstimated: true,
    ...overrides,
  })

  it('starts at periapsis when meanAnomalyAtEpoch=0', () => {
    const planet = makeTestPlanet({ eccentricity: 0.5 })
    const pos = computeOrbitalPosition(planet, 0)

    // At periapsis, x should be positive (assuming ω=0), y≈0
    expect(pos.r).toBeCloseTo(0.5, 6) // a(1-e) = 1*(1-0.5)
    expect(pos.trueAnomaly).toBeCloseTo(0, 6)
  })

  it('returns correct position for circular orbit', () => {
    const planet = makeTestPlanet({ eccentricity: 0 })
    const pos = computeOrbitalPosition(planet, 0)

    expect(pos.r).toBeCloseTo(1.0, 6)
    expect(pos.x).toBeCloseTo(1.0, 6)
    expect(pos.y).toBeCloseTo(0, 6)
  })

  it('position changes with time', () => {
    const planet = makeTestPlanet()
    const pos1 = computeOrbitalPosition(planet, 0)
    const pos2 = computeOrbitalPosition(planet, 90) // ~quarter orbit

    // After ~90 days (quarter of year), angle should be ~π/2
    expect(Math.abs(pos2.x - pos1.x)).toBeGreaterThan(0.5)
  })

  it('completes full orbit in one period', () => {
    const planet = makeTestPlanet()
    const pos0 = computeOrbitalPosition(planet, 0)
    const posT = computeOrbitalPosition(planet, 365.25)

    expect(pos0.x).toBeCloseTo(posT.x, 4)
    expect(pos0.y).toBeCloseTo(posT.y, 4)
  })
})

describe('generateOrbitPath', () => {
  it('generates correct number of points', () => {
    const path = generateOrbitPath(1, 0, 0, 50)
    expect(path).toHaveLength(51) // 50 + 1 to close the loop
  })

  it('circular orbit has constant radius', () => {
    const path = generateOrbitPath(2.0, 0, 0)
    for (const point of path) {
      const r = Math.sqrt(point.x * point.x + point.y * point.y)
      expect(r).toBeCloseTo(2.0, 6)
    }
  })

  it('elliptical orbit has varying radius', () => {
    const a = 1.0
    const e = 0.5
    const path = generateOrbitPath(a, e, 0)

    const radii = path.map((p) => Math.sqrt(p.x * p.x + p.y * p.y))
    const minR = Math.min(...radii)
    const maxR = Math.max(...radii)

    expect(minR).toBeCloseTo(a * (1 - e), 2) // periapsis
    expect(maxR).toBeCloseTo(a * (1 + e), 2) // apoapsis
  })
})

describe('calculateApsides', () => {
  it('calculates correct periapsis and apoapsis', () => {
    const a = 5.0
    const e = 0.6
    const { periapsis, apoapsis } = calculateApsides(a, e)

    expect(periapsis).toBeCloseTo(2.0, 6) // 5 * (1 - 0.6)
    expect(apoapsis).toBeCloseTo(8.0, 6) // 5 * (1 + 0.6)
  })

  it('periapsis equals apoapsis for circular orbit', () => {
    const { periapsis, apoapsis } = calculateApsides(1.0, 0)
    expect(periapsis).toEqual(apoapsis)
  })
})

describe('checkResonance', () => {
  it('detects 2:1 resonance', () => {
    expect(checkResonance(100, 200)).toBe(true)
    expect(checkResonance(200, 100)).toBe(true) // Order independent
  })

  it('detects 3:2 resonance', () => {
    expect(checkResonance(100, 150)).toBe(true)
  })

  it('does not detect non-resonant periods', () => {
    // 1.8:1 is between 5:3 (1.667) and 2:1, not near either with 5% tolerance
    expect(checkResonance(100, 180)).toBe(false)
    // 2.3:1 is not close enough to 2:1 or 5:2 (2.5) with 5% tolerance
    expect(checkResonance(100, 230)).toBe(false)
  })

  it('detects near-resonance within tolerance', () => {
    // 2:1 with 5% tolerance
    expect(checkResonance(100, 205)).toBe(true) // 2.05:1
    expect(checkResonance(100, 195)).toBe(true) // 1.95:1
  })
})

describe('timeToNextPeriapsis', () => {
  it('returns period when at periapsis', () => {
    const period = 365.25
    const time = timeToNextPeriapsis(0, period)
    expect(time).toBeCloseTo(period, 6)
  })

  it('returns half period when at apoapsis', () => {
    const period = 100
    const time = timeToNextPeriapsis(Math.PI, period)
    expect(time).toBeCloseTo(50, 6)
  })

  it('returns quarter period when 3/4 through orbit', () => {
    const period = 100
    const M = 1.5 * Math.PI // 3/4 of orbit
    const time = timeToNextPeriapsis(M, period)
    expect(time).toBeCloseTo(25, 6)
  })
})

describe('orbitProgress', () => {
  it('returns 0 at periapsis', () => {
    expect(orbitProgress(0)).toBeCloseTo(0, 8)
  })

  it('returns 0.5 at apoapsis', () => {
    expect(orbitProgress(Math.PI)).toBeCloseTo(0.5, 8)
  })

  it('returns 0.25 at quarter orbit', () => {
    expect(orbitProgress(Math.PI / 2)).toBeCloseTo(0.25, 8)
  })

  it('handles values greater than 2π', () => {
    expect(orbitProgress(3 * Math.PI)).toBeCloseTo(0.5, 8) // Same as π
  })
})
