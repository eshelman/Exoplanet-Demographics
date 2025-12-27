import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Planet, XAxisType, YAxisType, ColorMode, BoundingBox, DetectionMethodId, SimulatedSystem } from '../types'

// Narrative tour steps
export const NARRATIVE_STEPS = [
  'welcome',
  'detection-methods',
  'bias-problem',
  'super-earths',
  'hot-neptune-desert',
  'eta-earth',
  'solar-system-context',
  'future',
] as const

export type NarrativeStepId = (typeof NARRATIVE_STEPS)[number]

// Planet tour steps (notable systems to visit)
export const PLANET_TOUR_STEPS = [
  'intro',
  'trappist-1',
  '51-peg',
  'kepler-11',
  'hd-80606',
  '55-cnc',
  'hr-8799',
  'finale',
] as const

export type PlanetTourStepId = (typeof PLANET_TOUR_STEPS)[number]

interface VizState {
  // View state
  xAxis: XAxisType
  yAxis: YAxisType
  colorMode: ColorMode

  // Filter state
  enabledMethods: Set<DetectionMethodId>
  enabledPlanetTypes: Set<string>
  showSolarSystem: boolean
  showBiasOverlay: boolean

  // Selection state
  selectedPlanet: Planet | null
  hoveredPlanet: Planet | null
  brushSelection: BoundingBox | null

  // Narrative state
  narrativeMode: boolean
  narrativeStep: number

  // Planet tour state (simulation-focused tour)
  planetTourMode: boolean
  planetTourStep: number

  // Simulation state
  simulationOpen: boolean
  simulationSystem: SimulatedSystem | null
  simulationPlanetId: string | null

  // View actions
  setXAxis: (axis: XAxisType) => void
  setYAxis: (axis: YAxisType) => void
  setColorMode: (mode: ColorMode) => void

  // Filter actions
  toggleMethod: (method: DetectionMethodId) => void
  setMethodEnabled: (method: DetectionMethodId, enabled: boolean) => void
  enableAllMethods: () => void
  disableAllMethods: () => void
  togglePlanetType: (type: string) => void
  setEnabledPlanetTypes: (types: string[]) => void
  toggleSolarSystem: () => void
  toggleBiasOverlay: () => void

  // Selection actions
  selectPlanet: (planet: Planet | null) => void
  setHoveredPlanet: (planet: Planet | null) => void
  setBrushSelection: (selection: BoundingBox | null) => void
  clearSelection: () => void

  // Narrative actions
  startNarrative: () => void
  exitNarrative: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Planet tour actions
  startPlanetTour: () => void
  exitPlanetTour: () => void
  nextPlanetTourStep: () => void
  prevPlanetTourStep: () => void
  goToPlanetTourStep: (step: number) => void

  // Simulation actions
  openSimulation: (system: SimulatedSystem, planetId: string) => void
  closeSimulation: () => void

  // Reset
  reset: () => void
}

const ALL_METHODS: DetectionMethodId[] = [
  'radial-velocity',
  'transit-kepler',
  'transit-other',
  'microlensing',
  'direct-imaging',
  'astrometry',
  'other',
]

const initialState = {
  // View
  xAxis: 'period' as XAxisType,
  yAxis: 'mass' as YAxisType,
  colorMode: 'method' as ColorMode,

  // Filters
  enabledMethods: new Set<DetectionMethodId>(ALL_METHODS),
  enabledPlanetTypes: new Set<string>(),
  showSolarSystem: true,
  showBiasOverlay: false,

  // Selection
  selectedPlanet: null,
  hoveredPlanet: null,
  brushSelection: null,

  // Narrative
  narrativeMode: false,
  narrativeStep: 0,

  // Planet tour
  planetTourMode: false,
  planetTourStep: 0,

  // Simulation
  simulationOpen: false,
  simulationSystem: null,
  simulationPlanetId: null,
}

export const useVizStore = create<VizState>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    // View actions
    setXAxis: (axis) => set({ xAxis: axis }),
    setYAxis: (axis) => set({ yAxis: axis }),
    setColorMode: (mode) => set({ colorMode: mode }),

    // Filter actions
    toggleMethod: (method) =>
      set((state) => {
        const newMethods = new Set(state.enabledMethods)
        if (newMethods.has(method)) {
          newMethods.delete(method)
        } else {
          newMethods.add(method)
        }
        return { enabledMethods: newMethods }
      }),

    setMethodEnabled: (method, enabled) =>
      set((state) => {
        const newMethods = new Set(state.enabledMethods)
        if (enabled) {
          newMethods.add(method)
        } else {
          newMethods.delete(method)
        }
        return { enabledMethods: newMethods }
      }),

    enableAllMethods: () => set({ enabledMethods: new Set(ALL_METHODS) }),

    disableAllMethods: () => set({ enabledMethods: new Set() }),

    togglePlanetType: (type) =>
      set((state) => {
        const newTypes = new Set(state.enabledPlanetTypes)
        if (newTypes.has(type)) {
          newTypes.delete(type)
        } else {
          newTypes.add(type)
        }
        return { enabledPlanetTypes: newTypes }
      }),

    setEnabledPlanetTypes: (types) => set({ enabledPlanetTypes: new Set(types) }),

    toggleSolarSystem: () => set((state) => ({ showSolarSystem: !state.showSolarSystem })),

    toggleBiasOverlay: () => set((state) => ({ showBiasOverlay: !state.showBiasOverlay })),

    // Selection actions
    selectPlanet: (planet) => set({ selectedPlanet: planet }),

    setHoveredPlanet: (planet) => set({ hoveredPlanet: planet }),

    setBrushSelection: (selection) => set({ brushSelection: selection }),

    clearSelection: () =>
      set({
        selectedPlanet: null,
        brushSelection: null,
      }),

    // Narrative actions
    startNarrative: () => set({ narrativeMode: true, narrativeStep: 0 }),

    exitNarrative: () => set({ narrativeMode: false }),

    nextStep: () =>
      set((state) => ({
        narrativeStep: Math.min(state.narrativeStep + 1, NARRATIVE_STEPS.length - 1),
      })),

    prevStep: () =>
      set((state) => ({
        narrativeStep: Math.max(state.narrativeStep - 1, 0),
      })),

    goToStep: (step) =>
      set({
        narrativeStep: Math.max(0, Math.min(step, NARRATIVE_STEPS.length - 1)),
      }),

    // Planet tour actions
    startPlanetTour: () => set({ planetTourMode: true, planetTourStep: 0 }),

    exitPlanetTour: () => set({ planetTourMode: false, simulationOpen: false }),

    nextPlanetTourStep: () =>
      set((state) => ({
        planetTourStep: Math.min(state.planetTourStep + 1, PLANET_TOUR_STEPS.length - 1),
      })),

    prevPlanetTourStep: () =>
      set((state) => ({
        planetTourStep: Math.max(state.planetTourStep - 1, 0),
      })),

    goToPlanetTourStep: (step) =>
      set({
        planetTourStep: Math.max(0, Math.min(step, PLANET_TOUR_STEPS.length - 1)),
      }),

    // Simulation actions
    openSimulation: (system, planetId) =>
      set({
        simulationOpen: true,
        simulationSystem: system,
        simulationPlanetId: planetId,
      }),

    closeSimulation: () =>
      set({
        simulationOpen: false,
        simulationSystem: null,
        simulationPlanetId: null,
      }),

    // Reset
    reset: () => set(initialState),
  }))
)

// Selectors
export const selectVisiblePlanets = (planets: Planet[]) => {
  const state = useVizStore.getState()

  return planets.filter((planet) => {
    // Filter by Solar System
    if (planet.isSolarSystem && !state.showSolarSystem) {
      return false
    }

    // Filter by detection method (skip for Solar System planets)
    if (!planet.isSolarSystem) {
      const method = planet.detectionMethod as DetectionMethodId
      if (!state.enabledMethods.has(method)) {
        return false
      }
    }

    // Filter by planet type if any types are selected
    if (state.enabledPlanetTypes.size > 0 && planet.planetType) {
      if (!state.enabledPlanetTypes.has(planet.planetType)) {
        return false
      }
    }

    return true
  })
}

export const selectPlanetsInBrush = (planets: Planet[]) => {
  const state = useVizStore.getState()
  const { brushSelection, xAxis, yAxis } = state

  if (!brushSelection) return []

  return planets.filter((planet) => {
    const x = xAxis === 'period' ? planet.period : planet.separation
    const y = yAxis === 'mass' ? planet.mass : planet.radius

    if (x === undefined || y === undefined) return false

    return (
      x >= brushSelection.x.min &&
      x <= brushSelection.x.max &&
      y >= brushSelection.y.min &&
      y <= brushSelection.y.max
    )
  })
}

export const selectCurrentNarrativeStep = () => {
  const state = useVizStore.getState()
  return NARRATIVE_STEPS[state.narrativeStep]
}
