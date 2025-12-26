export interface PlanetType {
  id: string
  name: string
  massRange: { min: number; max: number; unit: 'earth' | 'jupiter' }
  radiusRange: { min: number; max: number; unit: 'earth' | 'jupiter' }
  occurrenceRate: {
    value: number
    uncertainty: { low: number; high: number }
    context: string
  }
  characteristics: string[]
  formationNotes: string
  color: string
  examples: string[]
}

export interface SolarSystemPlanet {
  name: string
  mass: number // Earth masses
  radius: number // Earth radii
  period: number // days
  separation: number // AU
  type: string
}

export interface Planet {
  id: string
  name: string
  mass?: number // Earth masses
  massUncertainty?: { low: number; high: number }
  radius?: number // Earth radii
  radiusUncertainty?: { low: number; high: number }
  period: number // days
  separation?: number // AU
  detectionMethod: string
  discoveryYear: number
  hostStar?: string
  distance?: number // light-years
  temperature?: number // Kelvin
  planetType?: string
  isSolarSystem?: boolean
}

export interface ParameterRegion {
  id: string
  name: string
  bounds: {
    mass?: { min: number; max: number }
    radius?: { min: number; max: number }
    period?: { min: number; max: number }
    separation?: { min: number; max: number }
  }
  occurrenceRate: number
  uncertainty: { low: number; high: number }
  dominantPlanetTypes: string[]
  notableFeatures: string[]
}

export interface EtaEarthEstimate {
  year: number
  study: string
  value: number
  uncertainty: { low: number; high: number }
  method: string
  notes?: string
}
