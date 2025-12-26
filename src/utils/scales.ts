import * as d3 from 'd3'

// Default axis domains based on exoplanet data ranges
export const AXIS_DOMAINS = {
  period: [0.5, 100000] as [number, number], // days
  separation: [0.01, 100] as [number, number], // AU
  mass: [0.01, 10000] as [number, number], // Earth masses
  radius: [0.3, 25] as [number, number], // Earth radii
}

export function createXScale(
  type: 'period' | 'separation',
  width: number
): d3.ScaleLogarithmic<number, number> {
  return d3.scaleLog().domain(AXIS_DOMAINS[type]).range([0, width]).nice()
}

export function createYScale(
  type: 'mass' | 'radius',
  height: number
): d3.ScaleLogarithmic<number, number> {
  return d3.scaleLog().domain(AXIS_DOMAINS[type]).range([height, 0]).nice()
}

export function createRadiusScale(
  minRadius: number = 2,
  maxRadius: number = 20
): d3.ScaleLogarithmic<number, number> {
  // Scale planet visual size based on actual radius
  return d3.scaleLog().domain([0.3, 25]).range([minRadius, maxRadius]).clamp(true)
}

// Color scales for detection methods
export const METHOD_COLORS: Record<string, string> = {
  'radial-velocity': '#E63946',
  'transit-kepler': '#457B9D',
  'transit-other': '#A8DADC',
  microlensing: '#2A9D8F',
  'direct-imaging': '#E9C46A',
  astrometry: '#9B59B6',
  other: '#6C757D',
}

// Color scales for planet types
export const PLANET_TYPE_COLORS: Record<string, string> = {
  rocky: '#8B4513',
  'super-earth': '#CD853F',
  'sub-neptune': '#4682B4',
  'neptune-like': '#1E90FF',
  'hot-jupiter': '#FF6347',
  'cold-jupiter': '#CD5C5C',
}

export const SOLAR_SYSTEM_COLOR = '#FFD700'
