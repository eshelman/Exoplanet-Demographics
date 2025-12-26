import type { Planet } from './planet'
import type { DetectionMethodId } from './method'

export type XAxisType = 'period' | 'separation'
export type YAxisType = 'mass' | 'radius'
export type ColorMode = 'method' | 'type'

export interface BoundingBox {
  x: { min: number; max: number }
  y: { min: number; max: number }
}

export interface ViewState {
  xAxis: XAxisType
  yAxis: YAxisType
  colorMode: ColorMode
  zoomLevel: number
  panOffset: { x: number; y: number }
}

export interface FilterState {
  enabledMethods: Set<DetectionMethodId>
  enabledPlanetTypes: Set<string>
  showSolarSystem: boolean
  showBiasOverlay: boolean
}

export interface SelectionState {
  selectedPlanet: Planet | null
  hoveredPlanet: Planet | null
  brushSelection: BoundingBox | null
}

export interface NarrativeState {
  narrativeMode: boolean
  narrativeStep: number
  totalSteps: number
}

export interface VizState extends ViewState, FilterState, SelectionState, NarrativeState {
  // Actions
  setXAxis: (axis: XAxisType) => void
  setYAxis: (axis: YAxisType) => void
  setColorMode: (mode: ColorMode) => void
  setZoom: (level: number) => void
  setPan: (offset: { x: number; y: number }) => void
  toggleMethod: (method: DetectionMethodId) => void
  togglePlanetType: (type: string) => void
  toggleSolarSystem: () => void
  toggleBiasOverlay: () => void
  selectPlanet: (planet: Planet | null) => void
  setHoveredPlanet: (planet: Planet | null) => void
  setBrushSelection: (box: BoundingBox | null) => void
  startNarrative: () => void
  exitNarrative: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  reset: () => void
}
