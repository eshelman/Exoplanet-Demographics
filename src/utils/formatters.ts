import * as d3 from 'd3'

// Format numbers for axis ticks on log scale
export function formatLogTick(value: number): string {
  if (value >= 1000) {
    return d3.format('.0s')(value)
  }
  if (value >= 1) {
    return d3.format('.0f')(value)
  }
  if (value >= 0.1) {
    return d3.format('.1f')(value)
  }
  return d3.format('.2f')(value)
}

// Format for tooltips with units
export function formatMass(mass: number): string {
  if (mass >= 100) {
    return `${d3.format('.0f')(mass)} M⊕`
  }
  if (mass >= 1) {
    return `${d3.format('.1f')(mass)} M⊕`
  }
  return `${d3.format('.2f')(mass)} M⊕`
}

export function formatRadius(radius: number): string {
  if (radius >= 10) {
    return `${d3.format('.1f')(radius)} R⊕`
  }
  return `${d3.format('.2f')(radius)} R⊕`
}

export function formatPeriod(period: number): string {
  if (period >= 365) {
    const years = period / 365.25
    return `${d3.format('.1f')(years)} years`
  }
  if (period >= 1) {
    return `${d3.format('.1f')(period)} days`
  }
  return `${d3.format('.1f')(period * 24)} hours`
}

export function formatSeparation(separation: number): string {
  return `${d3.format('.2f')(separation)} AU`
}

// Axis labels
export const AXIS_LABELS = {
  period: 'Orbital Period (days)',
  separation: 'Semi-major Axis (AU)',
  mass: 'Planet Mass (Earth masses)',
  radius: 'Planet Radius (Earth radii)',
}
