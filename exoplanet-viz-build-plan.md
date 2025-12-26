# Exoplanet Demographics Interactive Visualization
## Build Plan & Technical Specification

---

## 1. Project Overview

### 1.1 Vision Statement
Create an interactive web visualization that transforms the academic findings from ["The Demographics of Exoplanets"](https://arxiv.org/abs/2011.04703) (Gaudi, Christiansen & Meyer 2020) into an engaging, explorable experience. Users should be able to:

- **Discover** the diversity and distribution of known exoplanets
- **Understand** detection biases that shape our observed catalog
- **Explore** what makes certain planet types common vs. rare
- **Compare** exoplanets to our Solar System
- **Grasp** the key statistical findings about planetary occurrence rates

### 1.2 Target Audience
- Science-curious general public
- Students (high school through undergraduate)
- Science communicators and educators
- Researchers wanting a quick reference tool

### 1.3 Core Design Principles
1. **Progressive Disclosure**: Start simple, reveal complexity on demand
2. **Context Always Available**: Solar System reference points always visible
3. **Bias Transparency**: Always show what we *can't* see, not just what we can
4. **Narrative Flow**: Guide users through key insights with optional deep-dives
5. **Mobile-First Responsive**: Full functionality on all devices

---

## 2. Data Architecture

### 2.1 Primary Data Structures

```typescript
// Core planet type definitions
interface PlanetType {
  id: string;
  name: string;
  massRange: { min: number; max: number; unit: 'earth' | 'jupiter' };
  radiusRange: { min: number; max: number; unit: 'earth' | 'jupiter' };
  occurrenceRate: {
    value: number;
    uncertainty: { low: number; high: number };
    context: string; // e.g., "per FGK star within 1 AU"
  };
  characteristics: string[];
  formationNotes: string;
  color: string; // for visualization
  icon: string; // emoji or SVG reference
}

// Detection method properties
interface DetectionMethod {
  id: string;
  name: string;
  sensitivity: {
    massRange: { min: number; max: number };
    periodRange: { min: number; max: number };
    separationRange: { min: number; max: number };
  };
  biases: string[];
  totalDetections: number;
  color: string;
  description: string;
}

// Region in parameter space
interface ParameterRegion {
  id: string;
  name: string;
  bounds: {
    mass?: { min: number; max: number };
    radius?: { min: number; max: number };
    period?: { min: number; max: number };
    separation?: { min: number; max: number };
  };
  occurrenceRate: number;
  uncertainty: { low: number; high: number };
  dominantPlanetTypes: string[];
  notableFeatures: string[];
}

// Solar system reference
interface SolarSystemPlanet {
  name: string;
  mass: number; // Earth masses
  radius: number; // Earth radii
  period: number; // days
  separation: number; // AU
  type: string;
}
```

### 2.2 Static Data Files

```
/data
├── planet-types.json          # 8-10 canonical planet categories
├── detection-methods.json     # RV, Transit, Microlensing, Direct Imaging, Astrometry
├── occurrence-rates.json      # Grid of rates across parameter space
├── solar-system.json          # Reference planets
├── eta-earth-estimates.json   # Historical η⊕ values from literature
├── notable-discoveries.json   # Highlighted individual planets
└── power-laws.json            # Mathematical relationships for generating distributions
```

### 2.3 Derived/Computed Data

The visualization will generate synthetic planet populations for display using the power-law relationships from the paper:

```typescript
// Generate synthetic population following Cumming et al. 2008
function generateRVPopulation(n: number): Planet[] {
  // dN/d(ln m)d(ln P) ∝ m^(-0.31) × P^(0.26)
  // with normalization: 10% of stars have ≥1 planet with m>0.3MJup, P<2000d
}

// Generate population following Suzuki et al. 2016 microlensing
function generateMicrolensingPopulation(n: number): Planet[] {
  // Broken power law at Neptune/Sun mass ratio
  // Slope -0.93 above, +0.6 below
}
```

---

## 3. Component Architecture

### 3.1 High-Level Structure

```
<App>
├── <Header>
│   ├── <Title>
│   ├── <NavigationTabs>
│   └── <SettingsMenu>
│
├── <MainVisualization>
│   ├── <ControlPanel>
│   │   ├── <AxisSelector>
│   │   ├── <DetectionMethodToggles>
│   │   ├── <PlanetTypeFilters>
│   │   ├── <BiasOverlayToggle>
│   │   └── <SolarSystemToggle>
│   │
│   ├── <ScatterPlotCanvas>
│   │   ├── <Axes>
│   │   ├── <GridLines>
│   │   ├── <DetectionSensitivityRegions>
│   │   ├── <PlanetPoints>
│   │   ├── <SolarSystemMarkers>
│   │   ├── <AnnotationLabels>
│   │   └── <ZoomControls>
│   │
│   └── <Tooltip>
│
├── <SidePanel>
│   ├── <PlanetTypeCard>
│   ├── <StatisticsDisplay>
│   ├── <OccurrenceRateChart>
│   └── <InsightCards>
│
├── <NarrativeOverlay> (optional guided tour)
│   ├── <StoryStep>
│   └── <NavigationControls>
│
└── <Footer>
    ├── <DataSources>
    └── <Credits>
```

### 3.2 Key Component Specifications

#### ScatterPlotCanvas
- **Library**: D3.js for rendering (within React wrapper)
- **Dimensions**: Responsive, min 600x400, max 1200x800
- **Axes**: 
  - X: Orbital Period (days) OR Semi-major Axis (AU) — log scale
  - Y: Planet Mass (Earth masses) OR Planet Radius (Earth radii) — log scale
  - Switchable via control
- **Interactions**:
  - Pan and zoom (bounded)
  - Hover for tooltip
  - Click to select/highlight
  - Brush selection for statistics

#### DetectionSensitivityRegions
- Semi-transparent colored overlays showing where each method is sensitive
- Inverse option: show "blind spots" where we CAN'T detect
- Animated transitions when toggling

#### PlanetPoints
- Size: Scaled by radius (or mass if radius view)
- Color: By detection method OR by planet type (toggle)
- Opacity: Can reduce for dense regions
- Special styling for Solar System planets (outlined, labeled)

#### OccurrenceRateChart
- Heatmap showing occurrence rates across mass-period grid
- Color scale: log occurrence rate
- Overlaid uncertainty indicators
- Click cell to zoom main plot to that region

---

## 4. Visualization Specifications

### 4.1 Primary View: Mass-Period Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  Planet Mass vs Orbital Period                          [Settings] │
├─────────────────────────────────────────────────────────────────────┤
│         │                                                          │
│   10⁴   │  ● ●●●●●●●●●●●●●●●●●●                                    │
│         │   ●●●●●●●●●●●●●●●●●●●●●●  ○ Jupiter                      │
│   10³   │    ●●●●●●●●●●●●●●●●●●●●●●                                │
│  Mass   │      ●●●●●●●●●●●○Saturn●●●                               │
│ (M⊕)   │        ●●●●●●●●●●●●●●●●●●●                               │
│   10²   │           ○Uranus ○Neptune                               │
│         │  [Hot Neptune    ████████████                            │
│   10¹   │    Desert]      █DETECTION█                              │
│         │     ●●●●●●●●●●●●█ BLIND  █                              │
│   10⁰   │  ○Venus○Earth   █  ZONE  █  ○Mars                       │
│         │    ○Mercury     ████████████                             │
│   10⁻¹  │                                                          │
│         └──────────────────────────────────────────────────────────│
│              10⁰    10¹    10²    10³    10⁴    10⁵               │
│                        Orbital Period (days)                       │
├─────────────────────────────────────────────────────────────────────┤
│ Detection: [●RV] [●Transit] [●Microlens] [●Direct] │ Show Biases □ │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Secondary Views

#### 4.2.1 Radius-Period Diagram
- Same structure, Y-axis = radius
- Highlights the "radius valley" bimodality
- Better for showing Kepler results

#### 4.2.2 Occurrence Rate Heatmap
```
┌─────────────────────────────────────────┐
│     Planets per 100 Stars               │
├─────────────────────────────────────────┤
│         │ <10d │10-100│100-1k│ >1000d  │
│─────────┼──────┼──────┼──────┼─────────│
│ >100 M⊕ │  1%  │  2%  │  5%  │   3%    │
│ 10-100  │  2%  │  5%  │  8%  │   ??    │
│ 1-10    │  10% │  25% │  ??  │   ??    │
│ <1 M⊕   │  ??  │  ??  │  ??  │   ??    │
└─────────────────────────────────────────┘
  Color: ■■■■■■ 0.1%          50%+ ■■■■■■
         ?? = insufficient data
```

#### 4.2.3 η⊕ Estimates Timeline
- Forest plot showing historical estimates
- From 2011-2020 data in Figure 2
- Shows convergence toward 5-50%

#### 4.2.4 Planet Type Gallery
- Visual cards for each planet type
- Size comparison to Earth/Jupiter
- Key statistics and occurrence rates
- Click to filter main plot

### 4.3 Color Palette

```scss
// Detection Methods
$color-rv: #E63946;           // Red - Radial Velocity
$color-transit-kepler: #457B9D; // Blue - Kepler
$color-transit-other: #A8DADC;  // Light Blue - Other Transit
$color-microlensing: #2A9D8F;   // Teal
$color-direct: #E9C46A;         // Gold
$color-other: #6C757D;          // Gray

// Planet Types
$color-rocky: #8B4513;          // Brown
$color-super-earth: #CD853F;    // Peru
$color-sub-neptune: #4682B4;    // Steel Blue
$color-neptune: #1E90FF;        // Dodger Blue
$color-gas-giant: #FF6347;      // Tomato
$color-brown-dwarf: #8B0000;    // Dark Red

// UI
$color-background: #0D1B2A;     // Dark blue-black (space)
$color-surface: #1B263B;        // Slightly lighter
$color-text: #E0E1DD;           // Off-white
$color-accent: #00B4D8;         // Cyan
$color-solar-system: #FFD700;   // Gold (for SS planets)
```

---

## 5. Interaction Design

### 5.1 Core Interactions

| Interaction | Trigger | Response |
|-------------|---------|----------|
| Hover planet | Mouse enter | Show tooltip with planet details |
| Click planet | Mouse click | Select, show detailed card in sidebar |
| Drag | Mouse drag on canvas | Pan view |
| Scroll/Pinch | Scroll wheel / pinch | Zoom in/out (bounded) |
| Toggle method | Click checkbox | Animate show/hide of that method's planets |
| Toggle bias overlay | Click button | Fade in/out detection blind spots |
| Brush select | Shift+drag | Select region, show aggregate stats |
| Axis switch | Click dropdown | Animate transition between mass↔radius, period↔separation |

### 5.2 Guided Tour (Narrative Mode)

A 6-8 step guided experience highlighting key findings:

1. **Welcome**: Overview of the 4300+ confirmed exoplanets
2. **Detection Methods**: How we find planets, each method's strengths
3. **The Bias Problem**: Why what we see isn't what exists
4. **Super-Earths Everywhere**: The most common planet type we lack
5. **The Hot Neptune Desert**: A mysterious absence
6. **Where Are the Earths?**: η⊕ and the search for habitable worlds
7. **Solar System in Context**: How typical (or not) we are
8. **Future**: What Roman, PLATO, and ELTs will reveal

Each step:
- Zooms/pans to relevant region
- Highlights relevant planets
- Shows explanatory text overlay
- Includes "Learn More" expansion

### 5.3 Responsive Behavior

| Breakpoint | Layout Changes |
|------------|---------------|
| Desktop (>1200px) | Side-by-side: main viz + sidebar |
| Tablet (768-1200px) | Main viz full width, sidebar collapsible |
| Mobile (<768px) | Stacked: viz on top, cards below, simplified controls |

Mobile-specific:
- Tap instead of hover for tooltips
- Swipe for panning
- Pinch zoom
- Bottom sheet for detailed info
- Simplified toggle buttons

---

## 6. Technical Implementation

### 6.1 Technology Stack

```json
{
  "framework": "React 18+",
  "language": "TypeScript",
  "styling": "Tailwind CSS + CSS Modules for complex components",
  "visualization": "D3.js v7 (bindind to React)",
  "state": "Zustand (lightweight, perfect for viz state)",
  "animation": "Framer Motion (UI) + D3 transitions (data)",
  "build": "Vite",
  "deployment": "Vercel / Netlify static"
}
```

### 6.2 Key Technical Decisions

#### D3 + React Integration
Use the "React for DOM, D3 for math" pattern:
- React manages component lifecycle and container elements
- D3 calculates scales, generates paths, handles data joins
- React refs for D3 to bindind to actual DOM nodes
- useEffect hooks for D3 updates on data/dimension changes

```tsx
// Example pattern
function ScatterPlot({ data, width, height }) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const xScale = d3.scaleLog().domain([1, 1e6]).range([0, width]);
    const yScale = d3.scaleLog().domain([0.1, 1e4]).range([height, 0]);
    
    svg.selectAll('circle')
      .data(data, d => d.id)
      .join(
        enter => enter.append('circle')
          .attr('cx', d => xScale(d.period))
          .attr('cy', d => yScale(d.mass))
          .attr('r', 0)
          .call(enter => enter.transition().attr('r', d => radiusScale(d.radius))),
        update => update.call(update => update.transition()
          .attr('cx', d => xScale(d.period))
          .attr('cy', d => yScale(d.mass))),
        exit => exit.call(exit => exit.transition().attr('r', 0).remove())
      );
  }, [data, width, height]);
  
  return <svg ref={svgRef} width={width} height={height} />;
}
```

#### State Management
```typescript
// store.ts
interface VizState {
  // View state
  xAxis: 'period' | 'separation';
  yAxis: 'mass' | 'radius';
  zoomLevel: number;
  panOffset: { x: number; y: number };
  
  // Filter state
  enabledMethods: Set<DetectionMethod>;
  enabledPlanetTypes: Set<PlanetType>;
  showSolarSystem: boolean;
  showBiasOverlay: boolean;
  
  // Selection state
  selectedPlanet: Planet | null;
  brushSelection: BoundingBox | null;
  
  // Narrative state
  narrativeMode: boolean;
  narrativeStep: number;
  
  // Actions
  setAxis: (axis: 'x' | 'y', value: string) => void;
  toggleMethod: (method: DetectionMethod) => void;
  selectPlanet: (planet: Planet | null) => void;
  // ... etc
}
```

### 6.3 Performance Considerations

1. **Canvas for Large Point Counts**
   - If showing >5000 points, switch from SVG circles to Canvas
   - Use quadtree for efficient hover detection
   
2. **Virtualization**
   - Only render points within current viewport + buffer
   - Recalculate on pan/zoom

3. **Debouncing**
   - Debounce resize handlers (200ms)
   - Throttle pan updates (16ms / 60fps)

4. **Memoization**
   - Memoize scale calculations
   - Memoize filtered datasets
   - Use React.memo for stable child components

### 6.4 Accessibility

- Keyboard navigation for all controls
- ARIA labels on interactive elements
- Screen reader announcements for state changes
- High contrast mode option
- Reduced motion option (respects prefers-reduced-motion)
- Data table alternative view for screen readers

---

## 7. Development Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Basic visualization rendering with static data

- [ ] Project setup (Vite + React + TypeScript + Tailwind)
- [ ] Data structure definitions and JSON data files
- [ ] Basic ScatterPlot component with D3
- [ ] Log-scale axes with labels
- [ ] Static planet points rendering
- [ ] Solar System reference planets
- [ ] Basic responsive container

**Deliverable**: Static mass-period diagram with Solar System context

### Phase 2: Interactivity (Week 3-4)
**Goal**: Full interactive exploration

- [ ] Zustand store setup
- [ ] Pan and zoom controls
- [ ] Hover tooltips
- [ ] Click selection with sidebar detail
- [ ] Detection method toggle filters
- [ ] Planet type filters
- [ ] Axis switching (mass↔radius, period↔separation)
- [ ] Animated transitions

**Deliverable**: Fully interactive exploration mode

### Phase 3: Bias Visualization (Week 5)
**Goal**: Show detection limitations

- [ ] Detection sensitivity region overlays
- [ ] "Blind spot" inverse overlay mode
- [ ] Visual explanation of each method's bias
- [ ] Occurrence rate heatmap secondary view
- [ ] Statistical summary panel

**Deliverable**: Users can understand observational biases

### Phase 4: Narrative & Polish (Week 6-7)
**Goal**: Guided experience and refinement

- [ ] Guided tour implementation
- [ ] Step-by-step narrative content
- [ ] η⊕ timeline visualization
- [ ] Planet type gallery cards
- [ ] Mobile responsive refinement
- [ ] Accessibility audit and fixes
- [ ] Performance optimization
- [ ] Loading states and error handling

**Deliverable**: Complete, polished application

### Phase 5: Launch Prep (Week 8)
**Goal**: Production ready

- [ ] Cross-browser testing
- [ ] Analytics integration
- [ ] SEO metadata
- [ ] Social sharing cards
- [ ] Documentation
- [ ] Deployment pipeline
- [ ] Final QA

**Deliverable**: Deployed, shareable visualization

---

## 8. Content & Copy

### 8.1 Key Messages to Communicate

1. **Scale**: Over 4,300 confirmed exoplanets as of 2020 (now 5,500+)
2. **Diversity**: Planets come in far more varieties than our Solar System suggested
3. **Commonality**: Super-Earths and sub-Neptunes are the most common—yet we have none
4. **Bias**: What we see is heavily filtered by our detection capabilities
5. **Uncertainty**: η⊕ (Earth-like planet frequency) is still 5-50%—a 10x range
6. **Future**: New missions will fill in the gaps

### 8.2 Tooltip Content Template

```
┌─────────────────────────────────────┐
│ Planet Name (or designation)        │
├─────────────────────────────────────┤
│ Mass: XX Earth masses               │
│ Radius: X.X Earth radii             │
│ Period: XXX days                    │
│ Star: [Star name/type]              │
│ Distance: XX light-years            │
│ Detected via: [Method]              │
│ Year discovered: XXXX               │
├─────────────────────────────────────┤
│ [Click for more details]            │
└─────────────────────────────────────┘
```

### 8.3 Sidebar Detail Card Template

```
┌─────────────────────────────────────┐
│        [Planet Illustration]        │
│                                     │
│    Planet Name                      │
│    "Super-Earth"                    │
├─────────────────────────────────────┤
│ PROPERTIES                          │
│ ─────────────────────────           │
│ Mass      │ 5.2 ± 0.3 M⊕           │
│ Radius    │ 1.8 ± 0.1 R⊕           │
│ Density   │ 5.1 g/cm³ (rocky?)     │
│ Period    │ 12.4 days              │
│ Temp      │ ~600 K (hot)           │
├─────────────────────────────────────┤
│ CONTEXT                             │
│ This planet is in the most common   │
│ size range—super-Earths—which our   │
│ Solar System lacks entirely.        │
├─────────────────────────────────────┤
│ COMPARISON                          │
│ [Visual size comparison to Earth]   │
│         ○        ●                  │
│       Earth   This planet           │
├─────────────────────────────────────┤
│ [View on NASA Exoplanet Archive →]  │
└─────────────────────────────────────┘
```

---

## 9. Data Sources & Attribution

### 9.1 Primary Data Sources

1. **NASA Exoplanet Archive**
   - https://exoplanetarchive.ipac.caltech.edu/
   - Confirmed planets table
   - Composite planet data table
   
2. **Paper References for Occurrence Rates**
   - Cumming et al. 2008 (RV power laws)
   - Suzuki et al. 2016 (Microlensing mass-ratio function)
   - Howard et al. 2012 (Kepler occurrence rates)
   - Kunimoto & Matthews 2020 (η⊕ estimates)

3. **Solar System Data**
   - NASA Planetary Fact Sheets

### 9.2 Required Attribution

```
Data sources:
- NASA Exoplanet Archive (Caltech/IPAC)
- "The Demographics of Exoplanets" - Gaudi, Christiansen & Meyer (2020)

This visualization is not affiliated with NASA or Caltech.
```

---

## 10. Future Enhancements (v2+)

### 10.1 Potential Additions

1. **Live Data Updates**
   - API connection to NASA Exoplanet Archive
   - Show newly confirmed planets
   
2. **3D Visualization**
   - Three.js orbital view
   - Actual planetary systems in 3D space

3. **Habitability Layer**
   - Habitable zone boundaries
   - Earth Similarity Index overlays
   
4. **Comparison Tool**
   - Select multiple planets to compare
   - Generate comparison cards
   
5. **Educational Quizzes**
   - Interactive questions
   - Test understanding of biases

6. **Embeddable Widget**
   - Iframe-able mini version
   - For use in articles/blogs

### 10.2 Maintenance Considerations

- Yearly data refresh from NASA Archive
- Update η⊕ estimates as new papers publish
- Add new missions as they launch (Roman, PLATO)

---

## Appendix A: Complete File Structure

```
exoplanet-demographics/
├── public/
│   ├── data/
│   │   ├── planet-types.json
│   │   ├── detection-methods.json
│   │   ├── occurrence-rates.json
│   │   ├── solar-system.json
│   │   ├── eta-earth-estimates.json
│   │   └── power-laws.json
│   ├── images/
│   │   ├── planet-icons/
│   │   └── method-icons/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── SidePanel.tsx
│   │   ├── visualization/
│   │   │   ├── ScatterPlot.tsx
│   │   │   ├── Axes.tsx
│   │   │   ├── PlanetPoint.tsx
│   │   │   ├── DetectionRegion.tsx
│   │   │   ├── SolarSystemMarker.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── ZoomControls.tsx
│   │   ├── controls/
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── AxisSelector.tsx
│   │   │   ├── MethodToggle.tsx
│   │   │   ├── TypeFilter.tsx
│   │   │   └── BiasToggle.tsx
│   │   ├── cards/
│   │   │   ├── PlanetDetailCard.tsx
│   │   │   ├── PlanetTypeCard.tsx
│   │   │   ├── StatisticsCard.tsx
│   │   │   └── InsightCard.tsx
│   │   ├── narrative/
│   │   │   ├── NarrativeOverlay.tsx
│   │   │   ├── StoryStep.tsx
│   │   │   └── narrativeContent.ts
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Toggle.tsx
│   │       ├── Select.tsx
│   │       └── Modal.tsx
│   ├── hooks/
│   │   ├── useD3.ts
│   │   ├── useDimensions.ts
│   │   ├── useZoom.ts
│   │   └── useBrush.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── vizStore.ts
│   │   └── selectors.ts
│   ├── utils/
│   │   ├── scales.ts
│   │   ├── generators.ts
│   │   ├── formatters.ts
│   │   └── calculations.ts
│   ├── types/
│   │   ├── planet.ts
│   │   ├── method.ts
│   │   └── viz.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── components/
│   └── utils/
├── .eslintrc.js
├── .prettierrc
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## Appendix B: Sample Data Snippets

### planet-types.json (excerpt)
```json
{
  "planetTypes": [
    {
      "id": "rocky",
      "name": "Rocky/Terrestrial",
      "massRange": { "min": 0.1, "max": 2, "unit": "earth" },
      "radiusRange": { "min": 0.5, "max": 1.5, "unit": "earth" },
      "occurrenceRate": {
        "value": 0.15,
        "uncertainty": { "low": 0.05, "high": 0.50 },
        "context": "per FGK star in habitable zone (η⊕)"
      },
      "characteristics": [
        "Solid surface",
        "Iron/silicate composition",
        "Thin or no atmosphere",
        "Potential for liquid water"
      ],
      "formationNotes": "Form from rocky planetesimals inside the snow line",
      "color": "#8B4513",
      "examples": ["Earth", "Venus", "Mars", "Kepler-452b"]
    },
    {
      "id": "super-earth",
      "name": "Super-Earth",
      "massRange": { "min": 2, "max": 10, "unit": "earth" },
      "radiusRange": { "min": 1.5, "max": 2.0, "unit": "earth" },
      "occurrenceRate": {
        "value": 0.30,
        "uncertainty": { "low": 0.20, "high": 0.45 },
        "context": "per star with P < 100 days"
      },
      "characteristics": [
        "No Solar System analog",
        "May be rocky or have thick atmosphere",
        "Very common around other stars",
        "Often found in compact multi-planet systems"
      ],
      "formationNotes": "Most common planet type; may form in-situ or migrate inward",
      "color": "#CD853F",
      "examples": ["Kepler-10b", "55 Cancri e", "LHS 1140b"]
    }
  ]
}
```

### detection-methods.json (excerpt)
```json
{
  "methods": [
    {
      "id": "radial-velocity",
      "name": "Radial Velocity",
      "abbreviation": "RV",
      "description": "Measures stellar wobble caused by orbiting planet's gravity",
      "sensitivity": {
        "massRange": { "min": 3, "max": 10000, "unit": "earth" },
        "periodRange": { "min": 1, "max": 10000, "unit": "days" },
        "notes": "Sensitivity degrades with period; requires quiet stars"
      },
      "biases": [
        "Favors massive planets (larger signal)",
        "Favors short periods (more observations per orbit)",
        "Requires bright, quiet host stars",
        "Cannot measure true mass (only m×sin(i))"
      ],
      "totalDetections": 917,
      "color": "#E63946",
      "milestones": [
        { "year": 1995, "event": "51 Pegasi b - first around main-sequence star" }
      ]
    }
  ]
}
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: Build planning for exoplanet demographics visualization*
