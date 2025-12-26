import type { Planet, SolarSystemPlanet, PlanetType, DetectionMethod } from '../types'

export async function loadSolarSystem(): Promise<Planet[]> {
  const response = await fetch('/data/solar-system.json')
  const data = await response.json()

  return data.planets.map((p: SolarSystemPlanet) => ({
    id: `ss-${p.name.toLowerCase()}`,
    name: p.name,
    mass: p.mass,
    radius: p.radius,
    period: p.period,
    separation: p.separation,
    detectionMethod: 'solar-system',
    discoveryYear: 0,
    planetType: p.type,
    isSolarSystem: true,
  }))
}

export async function loadPlanetTypes(): Promise<PlanetType[]> {
  const response = await fetch('/data/planet-types.json')
  const data = await response.json()
  return data.planetTypes
}

export async function loadDetectionMethods(): Promise<DetectionMethod[]> {
  const response = await fetch('/data/detection-methods.json')
  const data = await response.json()
  return data.methods
}

// Classify planet by mass and period into a type
function classifyPlanet(mass: number, radius: number, period: number): string {
  // Ultra-short period: P < 1 day and small
  if (period < 1 && mass < 10) {
    return 'ultra-short-period'
  }

  // Hot Jupiter: massive + short period
  if (mass > 100 && period < 10) {
    return 'hot-jupiter'
  }

  // Cold Jupiter: massive + long period
  if (mass > 100) {
    return 'cold-jupiter'
  }

  // Neptune-like: 10-50 Earth masses
  if (mass >= 10 && mass < 50) {
    return 'neptune-like'
  }

  // Sub-Neptune: 2-20 Earth masses, radius 2-4 Earth radii
  if (radius >= 2 && radius < 4) {
    return 'sub-neptune'
  }

  // Super-Earth: 2-10 Earth masses, radius 1.25-2 Earth radii
  if (mass >= 2 && mass < 10 && radius < 2) {
    return 'super-earth'
  }

  // Rocky: < 2 Earth masses
  if (mass < 2) {
    return 'rocky'
  }

  // Default to sub-neptune for anything else
  return 'sub-neptune'
}

// Generate sample exoplanets for visualization
// In a real app, this would load from NASA Exoplanet Archive
export function generateSampleExoplanets(count: number = 200): Planet[] {
  const methods = [
    'radial-velocity',
    'transit-kepler',
    'transit-other',
    'microlensing',
    'direct-imaging',
  ]
  const methodWeights = [0.2, 0.5, 0.15, 0.1, 0.05]

  const planets: Planet[] = []

  for (let i = 0; i < count; i++) {
    // Weighted random method selection
    const rand = Math.random()
    let cumulative = 0
    let method = methods[0]
    for (let j = 0; j < methods.length; j++) {
      cumulative += methodWeights[j]
      if (rand < cumulative) {
        method = methods[j]
        break
      }
    }

    // Generate planet properties based on method biases
    let period: number
    let mass: number
    let radius: number

    switch (method) {
      case 'transit-kepler':
      case 'transit-other':
        // Transit favors short periods, wide range of radii
        period = Math.pow(10, Math.random() * 2.5 - 0.3) // 0.5 to ~150 days
        radius = Math.pow(10, Math.random() * 1.2 - 0.2) // 0.6 to ~10 R⊕
        mass = radius < 1.5 ? radius ** 3.3 : radius ** 2.1 * 2 // rough M-R relation
        break

      case 'radial-velocity':
        // RV favors massive planets
        period = Math.pow(10, Math.random() * 3.5) // 1 to ~3000 days
        mass = Math.pow(10, Math.random() * 3 + 0.5) // ~3 to 3000 M⊕
        radius = mass < 10 ? mass ** 0.28 : mass ** 0.06 * 4 // rough M-R relation
        break

      case 'microlensing':
        // Microlensing: cold planets at several AU
        period = Math.pow(10, Math.random() * 1.5 + 2.8) // ~600 to 20000 days
        mass = Math.pow(10, Math.random() * 2.5 + 0.5) // ~3 to 1000 M⊕
        radius = mass < 10 ? mass ** 0.28 : mass ** 0.06 * 4
        break

      case 'direct-imaging':
        // Direct imaging: massive, young, wide separation
        period = Math.pow(10, Math.random() * 1 + 4) // ~10000 to 100000 days
        mass = Math.pow(10, Math.random() * 1.5 + 2.5) // ~300 to 10000 M⊕
        radius = 10 + Math.random() * 5 // Large gas giants
        break

      default:
        period = Math.pow(10, Math.random() * 4)
        mass = Math.pow(10, Math.random() * 3)
        radius = Math.pow(10, Math.random() * 1.2)
    }

    // Calculate separation from period (Kepler's 3rd law, assuming solar mass)
    const separation = Math.pow((period / 365.25) ** 2, 1 / 3)

    // Classify planet type based on properties
    const planetType = classifyPlanet(mass, radius, period)

    planets.push({
      id: `exo-${i}`,
      name: `Exoplanet ${i + 1}`,
      mass,
      radius,
      period,
      separation,
      detectionMethod: method,
      discoveryYear: 2000 + Math.floor(Math.random() * 24),
      planetType,
      isSolarSystem: false,
    })
  }

  return planets
}
