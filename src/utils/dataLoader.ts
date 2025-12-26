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

// Exoplanet data from NASA Exoplanet Archive JSON
interface ExoplanetData {
  id: string
  name: string
  hostStar: string
  period: number | null
  separation: number | null
  radius: number | null
  mass: number | null
  detectionMethod: string
  discoveryYear: number | null
  planetType: string | null
  isSolarSystem: boolean
}

export async function loadExoplanets(): Promise<Planet[]> {
  const response = await fetch('/data/exoplanets.json')
  const data = await response.json()

  return data.planets
    .filter((p: ExoplanetData) => p.period !== null)
    .map((p: ExoplanetData) => ({
      id: p.id,
      name: p.name,
      hostStar: p.hostStar,
      mass: p.mass,
      radius: p.radius,
      period: p.period,
      separation: p.separation,
      detectionMethod: p.detectionMethod,
      discoveryYear: p.discoveryYear,
      planetType: p.planetType || 'unknown',
      isSolarSystem: false,
    }))
}
