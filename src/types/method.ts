export interface DetectionMethod {
  id: string
  name: string
  abbreviation: string
  description: string
  sensitivity: {
    massRange: { min: number; max: number; unit: 'earth' }
    periodRange: { min: number; max: number; unit: 'days' }
    separationRange?: { min: number; max: number; unit: 'au' }
    notes?: string
  }
  biases: string[]
  totalDetections: number
  color: string
  milestones?: {
    year: number
    event: string
  }[]
}

export type DetectionMethodId =
  | 'radial-velocity'
  | 'transit-kepler'
  | 'transit-other'
  | 'microlensing'
  | 'direct-imaging'
  | 'astrometry'
  | 'other'
