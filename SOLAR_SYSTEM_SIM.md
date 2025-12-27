# Solar System Simulation Modal

## Overview

When a user clicks on an exoplanet, a full-screen modal opens displaying an animated orbital simulation of that planetary system. The simulation shows all known planets orbiting their host star, with the selected planet highlighted. The goal is to convey the excitement and diversity of planetary systems viscerally—transforming abstract data points into living, breathing worlds.

**Time Scale**: 1 second of user time = 1 day of simulated time

---

## User Journey

1. User clicks an exoplanet point on the scatter plot
2. Modal slides in with a brief "entering system" transition
3. Star appears at center, planets begin orbiting from their current calculated positions
4. Selected planet is highlighted (glow, label, enhanced audio)
5. Right-hand statistics panel shows system data (measured vs estimated)
6. User can:
   - Click other planets in the system to re-focus
   - Adjust simulation speed (0.5x, 1x, 2x, 5x, 10x)
   - Pause/resume simulation
   - Toggle orbital paths visibility
   - Toggle planet labels
   - Close modal (Esc or X button) to return to main visualization

---

## Data Architecture

### Available Data (from NASA Exoplanet Archive)

| Parameter | Coverage | Notes |
|-----------|----------|-------|
| `period` | 100% | Orbital period in days |
| `separation` | 100% | Semi-major axis in AU |
| `eccentricity` | 44.4% | Orbital eccentricity |
| `mass` | 100% | Planet mass (Earth masses) |
| `radius` | 78.8% | Planet radius (Earth radii) |
| `hostStar` | 100% | System grouping identifier |
| `starMass` | 100% | Host star mass (solar masses) |
| `starRadius` | 78.8% | Host star radius (solar radii) |
| `starTemperature` | 28% | Effective temperature (K) |
| `starSpectralType` | 21.3% | Spectral classification |
| `insolation` | 15.6% | Stellar flux in Earth units (for HZ calculation) |

### Binary/Multiple Star Systems

**99 planets** orbit in **88 known binary/trinary systems** (identified by "A"/"B" suffix in `hostStar`).

No explicit companion star separation data exists in the dataset. Binary systems are classified as **close** or **distant** based on the outermost planet's orbit:

**Classification Heuristic**:
- If outermost planet has semi-major axis < 5 AU → assume **close binary** (companion at center)
- If outermost planet has semi-major axis ≥ 5 AU → assume **distant companion** (companion in background)

This heuristic reflects that planets in wide orbits cannot coexist with a close stellar companion (gravitational disruption).

**Close Binary Rendering** (companion at center):
- Both stars orbit a common barycenter at center
- Gentle, illustrative orbit (~30-day period, not simulated)
- Stars rendered at relative sizes if data available
- Label: "Close Binary (stellar orbit illustrative)"

**Distant Companion Rendering** (companion in background):
- Primary star at center as normal
- Companion rendered as a distant bright star in the background sky
- Position fixed (no orbital motion shown)
- Labeled with companion designation and "Distant Companion"
- Optional: show estimated separation if calculable from system dynamics

Notable binary systems:
- **GJ 676 A** (4 planets, outermost at 5.2 AU) - Distant companion, show in background
- **16 Cyg B** (1 planet at 1.7 AU) - Could be close binary presentation
- **KELT-4 A** (1 hot Jupiter at 0.04 AU) - Hierarchical triple, close binary at center
- **TOI-4336 A** (1 sub-Neptune at 0.09 AU) - Close binary presentation

### Habitable Zone Data

The `insolation` field (stellar flux received, in Earth units) enables habitable zone visualization:
- **Conservative HZ**: 0.95–1.37 Earth insolation (16 planets)
- **Optimistic HZ**: 0.25–1.77 Earth insolation (65 planets)

When `insolation` is unavailable, calculate from:
```
insolation = (starRadius² × (starTemperature/5778)⁴) / separation²
```

Display HZ as a translucent green annulus around the star when data is available.

### Missing Data (Must Be Estimated)

| Parameter | Estimation Strategy |
|-----------|---------------------|
| `inclination` | Default 90° (edge-on) for transiting planets; randomize 0-15° for RV; display as estimated |
| `longitudeAscendingNode` | Randomize 0-360°; cosmetic only for 2D view |
| `argumentOfPeriapsis` | Randomize 0-360° if eccentricity known; 0° if circular |
| `meanAnomalyAtEpoch` | Derive from discovery year or randomize; planets start at plausible positions |
| `planetRadius` (if missing) | Estimate from mass using mass-radius relations |
| `starTemperature` (if missing) | Estimate from spectral type or default by star mass |

### Data Interface Extension

```typescript
interface SimulatedPlanet extends Planet {
  // Orbital elements (Keplerian)
  semiMajorAxis: number          // AU (from separation)
  eccentricity: number           // 0-1 (measured or estimated)
  inclination: number            // degrees (estimated)
  longitudeAscendingNode: number // degrees (estimated)
  argumentOfPeriapsis: number    // degrees (estimated)
  meanAnomalyAtEpoch: number     // degrees (estimated)

  // Provenance flags
  eccentricityEstimated: boolean
  inclinationEstimated: boolean
  radiusEstimated: boolean

  // Computed values
  meanMotion: number             // radians/day
  orbitalVelocity: number        // km/s at current position
  currentTrueAnomaly: number     // degrees (updates in real-time)
}

interface SimulatedSystem {
  hostStar: string
  starMass: number               // Solar masses
  starRadius: number             // Solar radii (measured or estimated)
  starTemperature: number        // K (measured or estimated)
  starSpectralType?: string
  distance?: number              // Light-years

  // Binary system support
  isBinarySystem: boolean
  binaryType?: 'close' | 'distant'  // Based on outermost planet orbit (< 5 AU = close)
  companionStar?: {
    designation: string          // e.g., "B" for the companion
    mass?: number                // Solar masses (if known)
    radius?: number              // Solar radii (if known)
    temperature?: number         // K (if known)
  }

  // Habitable zone (calculated from star properties)
  habitableZone?: {
    innerEdge: number            // AU (conservative)
    outerEdge: number            // AU (optimistic)
    dataAvailable: boolean       // true if calculated from real data
  }

  // Provenance flags
  starRadiusEstimated: boolean
  starTemperatureEstimated: boolean

  planets: SimulatedPlanet[]

  // System characteristics
  isMultiPlanet: boolean
  hasEccentricOrbits: boolean    // Any e > 0.1
  hasResonantPair: boolean       // Period ratios near integers
  hasPlanetsInHZ: boolean        // Any planet in habitable zone
}
```

---

## Orbital Mechanics Simulation

### Keplerian Orbit Calculation

For each frame, compute planet position using classical orbital mechanics:

```typescript
function computeOrbitalPosition(planet: SimulatedPlanet, daysSinceEpoch: number) {
  // Mean anomaly at current time
  const M = (planet.meanAnomalyAtEpoch + planet.meanMotion * daysSinceEpoch) % (2 * Math.PI)

  // Solve Kepler's equation for eccentric anomaly (Newton-Raphson)
  let E = M
  for (let i = 0; i < 10; i++) {
    E = E - (E - planet.eccentricity * Math.sin(E) - M) / (1 - planet.eccentricity * Math.cos(E))
  }

  // True anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + planet.eccentricity) * Math.sin(E / 2),
    Math.sqrt(1 - planet.eccentricity) * Math.cos(E / 2)
  )

  // Distance from star
  const r = planet.semiMajorAxis * (1 - planet.eccentricity * Math.cos(E))

  // Position in orbital plane (2D top-down view)
  const x = r * Math.cos(nu + planet.argumentOfPeriapsis)
  const y = r * Math.sin(nu + planet.argumentOfPeriapsis)

  return { x, y, r, trueAnomaly: nu, velocity: computeVelocity(planet, r) }
}
```

### Eccentric Orbit Visualization

- Orbits with e > 0.05 render as visible ellipses
- Periapsis marked with subtle indicator
- Velocity varies visibly (faster at periapsis, slower at apoapsis)
- Hot Jupiters on tight eccentric orbits create dramatic speed variations

### Time Controls

| Speed | Real:Sim Ratio | Use Case |
|-------|----------------|----------|
| 0.5x | 1s = 0.5 days | Detailed observation of close-in planets |
| 1x | 1s = 1 day | Default viewing speed |
| 2x | 1s = 2 days | Moderate acceleration |
| 5x | 1s = 5 days | See full inner system orbits |
| 10x | 1s = 10 days | See outer planet motion |

For very long-period planets (>1000 days), consider auto-scaling or showing orbital path completion percentage.

---

## Visual Design

### Aesthetic Direction

**Theme**: "Observatory at Night" — dark, reverent, scientifically grounded but emotionally resonant

**Color Palette**:
- Background: Deep space gradient (near-black to deep blue, subtle star field)
- Star: Color-coded by temperature (M=red, K=orange, G=yellow, F=white, A=blue-white)
- Planets: Use existing `PLANET_TYPE_COLORS` with luminosity based on insolation
- Selected planet: Glowing halo in accent color, pulsing subtly
- Orbital paths: Thin, low-opacity lines; brighter for selected planet
- Estimated data: Dashed lines, italicized text, subtle "?" icon

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [X Close]                           System Name            [?] Help│
├─────────────────────────────────────────────────────────────────────┤
│                                                    │                │
│                                                    │   STATISTICS   │
│                                                    │   ──────────   │
│                                                    │                │
│                    ┌─────┐                         │   Host Star    │
│                    │  ☆  │                         │   Mass: 1.2 M☉ │
│            ○       └─────┘        ●                │   Temp: 5800 K │
│         ╭─────────────────────────────╮            │   Type: G2V    │
│         │                             │            │                │
│    ○    │                             │            │   ──────────   │
│         │                             │            │                │
│         ╰─────────────────────────────╯            │   [Planet b]   │
│                         ○                          │   Period: 4.2d │
│                                                    │   Mass: 1.8 M⊕ │
│                                                    │   Ecc: 0.02*   │
│                                                    │                │
│                                                    │   * Estimated  │
│                                                    │                │
├─────────────────────────────────────────────────────────────────────┤
│  ◀◀  ▶/❚❚  ▶▶   [0.5x] [1x] [2x] [5x] [10x]   ○ Paths ○ Labels ○ HZ│
└─────────────────────────────────────────────────────────────────────┘
```

### Star Rendering

- Central position, size proportional to `starRadius` (with min/max bounds)
- Subtle glow/corona effect
- Color derived from `starTemperature`:
  - <3500K: Deep red (#FF4500)
  - 3500-5000K: Orange (#FFA500)
  - 5000-6000K: Yellow-white (#FFFACD)
  - 6000-7500K: White (#FFFFFF)
  - >7500K: Blue-white (#ADD8E6)

### Binary Star Rendering

For systems with "A"/"B" suffix in `hostStar`, rendering depends on `binaryType`:

**Close Binary** (`binaryType: 'close'`):
- Two stars rendered orbiting a common center point
- Gentle, illustrative orbit (~30-day period, circular)
- Relative sizes based on available radius data (or estimated from mass)
- Each star colored by its temperature
- Small label: "Close Binary (stellar orbit illustrative)"

**Distant Companion** (`binaryType: 'distant'`):
- Primary star rendered at center as normal
- Companion star rendered as bright point in background star field
- Fixed position (upper corner or based on arbitrary angle)
- Subtle glow effect, sized smaller than primary
- Label near companion: "[Name] B - Distant Companion"
- No orbital motion (separation too large to be meaningful at this scale)

### Habitable Zone Rendering

When star data is sufficient to calculate HZ boundaries:
- Translucent green annulus between inner and outer edges
- Inner edge (conservative): `sqrt(luminosity/1.37)` AU
- Outer edge (optimistic): `sqrt(luminosity/0.25)` AU
- Subtle gradient from inner (warmer green) to outer (cooler green)
- Toggle in controls: "Show Habitable Zone"
- If planet orbits within HZ, subtle indicator in stats panel

### Planet Rendering

- Size proportional to `radius` (logarithmic scale with bounds)
- Minimum visible size: 8px; Maximum: 40px
- Color from `PLANET_TYPE_COLORS` with brightness modulation
- Selected planet:
  - Outer glow ring in accent color
  - Name label always visible
  - Connecting line to stats panel entry
- Hover state: Subtle scale-up (1.2x), tooltip with name

### Orbital Path Rendering

- SVG `<ellipse>` or computed path points
- Stroke: 1px, rgba(255,255,255,0.15) default
- Selected orbit: 2px, accent color at 0.4 opacity
- Eccentric orbits show periapsis marker (small dot)
- Optional: Velocity gradient (brighter where faster)

### Transitions

- **Modal Enter**: Fade in backdrop (0.3s), then zoom-in star field effect (0.5s)
- **Modal Exit**: Reverse zoom, fade out (0.4s total)
- **Planet Selection**: Smooth camera pan if needed, highlight transition (0.2s)
- **Speed Change**: Brief time-warp visual effect (subtle radial blur, 0.15s)

---

## Soundscape Design

### Audio Layers

Building on existing audio architecture:

#### 1. Ambient Layer (via AmbientSoundscape)
- **System Drone**: Low frequency based on star temperature
  - Hot stars (>6000K): Higher fundamental, brighter harmonics
  - Cool stars (<4000K): Deep, warm drone
- **Orbital Whispers**: Subtle whoosh sounds as planets pass viewing threshold
- Volume: 20-30% of master

#### 2. Planet Voices (via PlanetSonification)
- Reuse existing mappings:
  - Period → Pitch (shorter = higher)
  - Radius → Volume (larger = louder)
  - Type → Timbre (rocky=sine, gas=sawtooth)
- **Selected Planet**: Sustained tone, slightly louder
- **Passing Planets**: Brief voice trigger as they cross cardinal points
- **Close Approaches**: Two planets near each other create harmonic beating

#### 3. UI Sounds
- **Modal Open**: `playSidebarOpen()` + custom "telescope focusing" sound
- **Modal Close**: `playSidebarClose()` + "lens closing" sound
- **Planet Click**: `playClick()` + planet voice preview
- **Speed Change**: Pitch-shifted click (higher for faster)
- **Pause/Resume**: Soft "tape stop/start" effect

#### 4. Special Moments
- **Periapsis Passage**: Subtle acceleration whoosh for eccentric orbits
- **Conjunction**: When two planets align, harmonic chord
- **Full Orbit Complete**: Gentle chime (once per planet per viewing session)

### Audio Implementation

```typescript
// New methods for AudioManager
class AudioManager {
  // System ambient
  startSystemAmbient(system: SimulatedSystem): void
  stopSystemAmbient(): void

  // Planet voices in simulation context
  startPlanetVoice(planet: SimulatedPlanet, isSelected: boolean): void
  stopPlanetVoice(planet: SimulatedPlanet): void
  updatePlanetVoice(planet: SimulatedPlanet, velocity: number): void

  // Events
  playPeriapsisPass(planet: SimulatedPlanet): void
  playConjunction(planet1: SimulatedPlanet, planet2: SimulatedPlanet): void
  playOrbitComplete(planet: SimulatedPlanet): void

  // Simulation controls
  playSimulationSpeedChange(newSpeed: number): void
  playSimulationPause(): void
  playSimulationResume(): void
}
```

---

## Statistics Panel

### Layout Structure

The right-hand panel (320px width) displays all system data with clear measured/estimated distinction.

```
┌────────────────────────────────┐
│ 55 Cancri System               │
│ ════════════════════════════   │
│                                │
│ HOST STAR                      │
│ ───────────                    │
│ Name        55 Cnc (Copernicus)│
│ Mass        0.91 M☉            │
│ Radius      0.94 R☉            │
│ Temperature 5196 K             │
│ Type        G8 V               │
│ Distance    41 ly              │
│                                │
│ PLANETS (5)                    │
│ ───────────                    │
│                                │
│ ● 55 Cnc e  [SELECTED]         │
│   Period      0.74 days        │
│   Semi-major  0.015 AU         │
│   Eccentricity 0.05            │
│   Mass        7.99 M⊕          │
│   Radius      1.88 R⊕          │
│   Inclination 83°  ⚠️ EST      │
│                                │
│ ○ 55 Cnc b                     │
│   Period      14.65 days       │
│   ...                          │
│                                │
│ ○ 55 Cnc c                     │
│ ○ 55 Cnc f                     │
│ ○ 55 Cnc d                     │
│                                │
│ ════════════════════════════   │
│ ⚠️ EST = Estimated value       │
│ Values without marker are      │
│ measured/observed              │
└────────────────────────────────┘
```

### Data Display Rules

**Measured Values**:
- Normal text weight
- Full opacity
- No marker

**Estimated Values**:
- Italic text
- Slightly reduced opacity (0.7)
- "⚠️ EST" or "~" prefix
- Tooltip explaining estimation method on hover

### Expandable Sections

Each planet entry can expand to show:
- Full orbital elements (a, e, i, Ω, ω, M₀)
- Physical properties (mass, radius, density, temperature)
- Detection information (method, year, facility)
- Estimation notes (why/how values were estimated)

### Real-Time Updates

- Current orbital velocity (updates each frame)
- Current distance from star (for eccentric orbits)
- Time to next periapsis/apoapsis
- Orbital phase (% of orbit completed)

---

## UI Components

### Modal Container

```typescript
interface SolarSystemModalProps {
  system: SimulatedSystem
  initialPlanet: SimulatedPlanet
  onClose: () => void
}

function SolarSystemModal({ system, initialPlanet, onClose }: SolarSystemModalProps) {
  const [selectedPlanet, setSelectedPlanet] = useState(initialPlanet)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showHabitableZone, setShowHabitableZone] = useState(true)
  const [simulationTime, setSimulationTime] = useState(0) // days since epoch

  // HZ is only available if we have star data to calculate it
  const habitableZoneAvailable = system.habitableZone?.dataAvailable ?? false

  // ... render logic
}
```

### Control Bar

```typescript
interface SimulationControlsProps {
  speed: number
  isPaused: boolean
  showOrbits: boolean
  showLabels: boolean
  showHabitableZone: boolean
  habitableZoneAvailable: boolean  // false if insufficient star data
  onSpeedChange: (speed: number) => void
  onPauseToggle: () => void
  onOrbitsToggle: () => void
  onLabelsToggle: () => void
  onHabitableZoneToggle: () => void
}
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Esc` | Close modal |
| `Space` | Pause/Resume |
| `←` / `→` | Previous/Next planet |
| `↑` / `↓` | Increase/Decrease speed |
| `O` | Toggle orbital paths |
| `L` | Toggle labels |
| `H` | Toggle habitable zone |
| `R` | Reset to initial state |
| `1-9` | Select planet by index |

---

## Tour Integration

The simulation modal will be integrated into future tour steps:

### Potential Tour Steps

1. **"A System Like Ours"** - Show a Sun-like star with multiple planets
2. **"Hot Jupiter Discovery"** - 51 Pegasi b, first exoplanet around Sun-like star
3. **"Compact Systems"** - TRAPPIST-1 with 7 Earth-sized planets
4. **"Eccentric Worlds"** - HD 80606 b with e=0.93
5. **"Resonant Chains"** - GJ 876 with orbital resonances

### Tour ViewConfig Extension

```typescript
interface NarrativeStepContent {
  // ... existing fields
  viewConfig?: {
    // ... existing fields

    // New simulation trigger
    openSimulation?: {
      systemId: string           // Host star name
      highlightPlanet?: string   // Planet to select
      initialSpeed?: number      // Simulation speed
      showOrbits?: boolean
      showLabels?: boolean
      zoomLevel?: number         // Focus on inner/outer system
    }
  }
}
```

### Tour Narration Integration

When simulation opens during tour:
- Narrative panel repositions (left side, narrower)
- Tour text describes what user is seeing
- "Next" advances to next tour step (may close simulation or change focus)
- Special tour-only annotations can highlight orbital mechanics concepts

---

## Implementation Phases

### Phase 1: Core Simulation Engine
- [ ] Create `SimulatedPlanet` and `SimulatedSystem` interfaces
- [ ] Implement Keplerian orbit calculation
- [ ] Build data preparation utility (estimate missing values)
- [ ] Create system grouping utility (group planets by `hostStar`)
- [ ] Unit tests for orbital mechanics

### Phase 2: Basic Visual Rendering
- [ ] Create `SolarSystemModal` component shell
- [ ] Implement star rendering (position, size, color)
- [ ] Implement planet rendering (position, size, color)
- [ ] Add orbital path rendering (ellipses)
- [ ] Implement animation loop with requestAnimationFrame
- [ ] Add time controls (speed, pause)

### Phase 3: Interaction & Selection
- [ ] Planet click detection and selection
- [ ] Keyboard navigation
- [ ] Hover states and tooltips
- [ ] Selected planet highlighting
- [ ] Camera/viewport adjustments for different system scales

### Phase 4: Statistics Panel
- [ ] Design measured vs estimated visual distinction
- [ ] Implement collapsible planet entries
- [ ] Add real-time orbital data updates
- [ ] Implement estimation explanation tooltips

### Phase 5: Audio Integration
- [ ] System ambient sound based on star type
- [ ] Planet voice triggers
- [ ] UI sound feedback
- [ ] Special moment sounds (periapsis, conjunction)

### Phase 6: Polish & Edge Cases
- [ ] Handle single-planet systems gracefully
- [ ] Handle very long-period planets (>10,000 days)
- [ ] Handle extreme eccentricities (e > 0.9)
- [ ] Performance optimization for systems with 7+ planets
- [ ] Loading states and error handling
- [ ] Mobile/touch support

### Phase 7: Tour Integration
- [ ] Add simulation trigger to tour viewConfig
- [ ] Implement tour-mode layout adjustments
- [ ] Create tour-specific simulation steps
- [ ] Test full tour flow with simulation interruptions

### Phase 8: Deep Linking
- [ ] Define URL schema for direct system access (e.g., `?system=TRAPPIST-1&planet=d`)
- [ ] Parse URL parameters on app load
- [ ] Auto-open simulation modal when deep link detected
- [ ] Update URL when user navigates to different systems (without page reload)
- [ ] Support sharing: "Copy Link" button in simulation modal
- [ ] Handle invalid/unknown system names gracefully (show error, fall back to main viz)
- [ ] Preserve simulation state in URL (speed, selected planet, HZ toggle)
- [ ] SEO-friendly system pages for notable systems (optional: server-side rendering)

**URL Examples**:
```
/                                    # Main visualization
/?system=TRAPPIST-1                  # Open TRAPPIST-1 simulation
/?system=55-Cnc&planet=e             # 55 Cancri system, planet e selected
/?system=HD-80606&speed=5            # HD 80606 at 5x speed
/?system=Kepler-11&hz=1              # Kepler-11 with HZ overlay
```

---

## Technical Considerations

### Performance

- Use `requestAnimationFrame` for smooth animation
- Batch position calculations for all planets
- Consider Web Workers for complex orbital mechanics
- Throttle statistics panel updates (every 100ms, not every frame)
- Use CSS transforms for planet positioning (GPU-accelerated)

### Canvas vs SVG

**Recommendation**: Hybrid approach
- **SVG** for orbital paths (crisp, zoomable, easy styling)
- **Canvas** for star glow effects and particle effects
- **DOM** for planet elements (easier interaction, accessibility)

### State Management

Extend vizStore with simulation state:

```typescript
interface VizState {
  // ... existing state

  // Simulation state
  simulationMode: boolean
  simulationSystem: SimulatedSystem | null
  simulationSelectedPlanet: SimulatedPlanet | null
  simulationSpeed: number
  simulationPaused: boolean
  simulationTime: number

  // Simulation actions
  openSimulation: (planetId: string) => void
  closeSimulation: () => void
  selectSimulationPlanet: (planet: SimulatedPlanet) => void
  setSimulationSpeed: (speed: number) => void
  toggleSimulationPause: () => void
}
```

### Accessibility

- All interactive elements keyboard-accessible
- Screen reader announcements for planet selection
- Pause functionality for users who need time to process
- Alternative text descriptions in statistics panel
- Respect `prefers-reduced-motion` for animations
- Audio can be independently disabled

### Data Estimation Documentation

For transparency, include tooltips explaining each estimation:

| Estimated Value | Explanation |
|-----------------|-------------|
| Inclination | "Estimated from detection method bias. Transit detections assume near edge-on (85-90°). RV detections are unconstrained; shown as average inclination." |
| Eccentricity | "No measured eccentricity; assuming circular orbit (e=0). Many short-period planets are tidally circularized." |
| Radius | "Estimated from mass using empirical mass-radius relation for [planet type]." |
| Star Temperature | "Estimated from spectral type [X] using standard stellar classification." |

---

## File Structure

```
src/
├── components/
│   └── simulation/
│       ├── SolarSystemModal.tsx       # Main modal container
│       ├── OrbitalCanvas.tsx          # Simulation rendering
│       ├── SimulationControls.tsx     # Speed, pause, toggles
│       ├── SystemStatsPanel.tsx       # Right-hand statistics
│       ├── StarRenderer.tsx           # Star visualization
│       ├── PlanetRenderer.tsx         # Planet visualization
│       ├── OrbitPath.tsx              # Orbital ellipse rendering
│       └── index.ts                   # Barrel export
├── hooks/
│   ├── useOrbitalMechanics.ts         # Kepler calculations
│   ├── useSimulationLoop.ts           # Animation frame management
│   └── useSystemData.ts               # Data preparation & estimation
├── utils/
│   ├── orbitalMechanics.ts            # Pure orbital calculation functions
│   ├── dataEstimation.ts              # Missing value estimation
│   ├── systemGrouping.ts              # Group planets by host star
│   ├── habitableZone.ts               # HZ boundary calculations
│   └── deepLinking.ts                 # URL parsing and generation
└── types/
    └── simulation.ts                  # SimulatedPlanet, SimulatedSystem
```

---

## Success Metrics

1. **Emotional Impact**: Users spend >30s in simulation (vs quick glance)
2. **Educational Value**: Users explore multiple planets per session
3. **Scientific Accuracy**: Orbital positions match published ephemerides within 1%
4. **Performance**: Smooth 60fps animation on mid-range devices
5. **Accessibility**: Full keyboard navigation, screen reader compatible
6. **Tour Enhancement**: Simulation steps increase tour completion rate

---

## Open Questions

1. **Moons**: Include known exomoons when data becomes available?
2. **Share/Export**: Beyond deep links, allow image/video export of simulations?

### Resolved Decisions

- **2D only**: Top-down view, no 3D toggle planned
- **Binary systems**: Show stars slowly orbiting center (illustrative, not simulated)
- **Habitable zone**: Include when data available (15.6% of planets have insolation data)
- **No comparison mode**: Focus on the selected system only
- **Deep linking**: Implemented via URL parameters for direct system access

---

## References

- NASA Exoplanet Archive: https://exoplanetarchive.ipac.caltech.edu/
- Kepler's Laws: https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion
- Mass-Radius Relations: Chen & Kipping (2017)
- Stellar Classification: https://en.wikipedia.org/wiki/Stellar_classification
