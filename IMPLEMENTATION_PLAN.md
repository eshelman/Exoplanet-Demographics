# Implementation Plan: Exoplanet Demographics Visualization

## Phase 1: Project Foundation ✅

### Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS
- [x] Install dependencies (D3, Zustand, Framer Motion)
- [x] Set up ESLint and Prettier
- [x] Create base directory structure

### TypeScript Types
- [x] `PlanetType` interface (mass/radius ranges, occurrence rates, characteristics)
- [x] `DetectionMethod` interface (sensitivity ranges, biases, color)
- [x] `ParameterRegion` interface (bounds, occurrence rates)
- [x] `SolarSystemPlanet` interface
- [x] `Planet` interface for individual planet data
- [x] `VizState` interface for Zustand store

### Static Data Files
- [x] `planet-types.json` - 8-10 canonical planet categories
- [x] `detection-methods.json` - RV, Transit, Microlensing, Direct Imaging, Astrometry
- [x] `occurrence-rates.json` - Grid of rates across parameter space
- [x] `solar-system.json` - Reference planets with mass, radius, period, separation
- [x] `eta-earth-estimates.json` - Historical η⊕ values from literature
- [x] `power-laws.json` - Mathematical relationships for generating distributions

---

## Phase 2: Core Visualization ✅

### ScatterPlot Component
- [x] Create SVG container with React ref
- [x] Implement log-scale X axis (Period in days)
- [x] Implement log-scale Y axis (Mass in Earth masses)
- [x] Add axis labels and tick marks
- [x] Add grid lines
- [x] Implement responsive container with useDimensions hook

### Planet Rendering
- [x] Render planet points as circles
- [x] Size scaling based on radius
- [x] Color coding by detection method
- [x] Opacity handling for dense regions
- [x] Solar System planets with special styling (gold outline, labels)

### D3 Integration Hooks
- [x] `useD3.ts` - Base D3 bindings
- [x] `useDimensions.ts` - Responsive sizing
- [x] `useZoom.ts` - Pan and zoom behavior
- [x] `useBrush.ts` - Brush selection

---

## Phase 3: State Management & Interactivity ✅

### Zustand Store
- [x] View state (xAxis, yAxis, zoomLevel, panOffset)
- [x] Filter state (enabledMethods, enabledPlanetTypes, showSolarSystem, showBiasOverlay)
- [x] Selection state (selectedPlanet, brushSelection)
- [x] Narrative state (narrativeMode, narrativeStep)
- [x] Action creators for all state mutations
- [x] Selectors for derived data

### Interactions
- [x] Hover tooltip on planet points
- [x] Click to select planet
- [x] Pan via mouse drag
- [x] Zoom via scroll wheel / pinch
- [x] Brush selection (Shift+drag) for aggregate stats
- [x] Animated transitions on state changes

### Axis Switching
- [x] Toggle X axis: Period ↔ Semi-major Axis (AU)
- [x] Toggle Y axis: Mass ↔ Radius
- [x] Smooth animated transitions between views

---

## Phase 4: Controls & Filters ✅

### Control Panel Component
- [x] Container layout
- [x] Axis selector dropdowns
- [x] Detection method toggles (checkboxes with colors)
- [ ] Planet type filter toggles
- [x] Bias overlay toggle button
- [x] Solar System visibility toggle

### Detection Method Toggles
- [x] Radial Velocity toggle
- [x] Transit (Kepler) toggle
- [x] Transit (Other) toggle
- [x] Microlensing toggle
- [x] Direct Imaging toggle
- [x] Animate show/hide on toggle

---

## Phase 5: Bias Visualization

### Detection Sensitivity Regions
- [ ] Semi-transparent overlays showing method sensitivity
- [ ] RV sensitivity region
- [ ] Transit sensitivity region
- [ ] Microlensing sensitivity region
- [ ] Direct imaging sensitivity region

### Blind Spot Visualization
- [ ] Inverse mode showing where we CAN'T detect
- [ ] "Hot Neptune Desert" region highlight
- [ ] Animated fade transitions

---

## Phase 6: Information Display

### Tooltip Component
- [ ] Planet name/designation
- [ ] Mass (Earth masses)
- [ ] Radius (Earth radii)
- [ ] Orbital period
- [ ] Host star info
- [ ] Distance (light-years)
- [ ] Detection method
- [ ] Discovery year
- [ ] Position follows cursor

### Side Panel
- [ ] Collapsible container
- [ ] Planet detail card (when selected)
- [ ] Statistics display panel
- [ ] Occurrence rate chart
- [ ] Insight cards

### Planet Detail Card
- [ ] Planet illustration/icon
- [ ] Property table (mass, radius, density, period, temperature)
- [ ] Context description
- [ ] Size comparison visual (vs Earth)
- [ ] Link to NASA Exoplanet Archive

---

## Phase 7: Secondary Visualizations

### Occurrence Rate Heatmap
- [ ] Grid layout (mass bins × period bins)
- [ ] Color scale for log occurrence rate
- [ ] Uncertainty indicators
- [ ] "??" styling for insufficient data regions
- [ ] Click cell to zoom main plot

### η⊕ Estimates Timeline
- [ ] Forest plot layout
- [ ] Historical estimates from 2011-2020
- [ ] Error bars for uncertainty
- [ ] Convergence visualization toward 5-50%

### Planet Type Gallery
- [ ] Card grid layout
- [ ] Visual icon for each type
- [ ] Size comparison to Earth/Jupiter
- [ ] Key statistics and occurrence rates
- [ ] Click to filter main plot

---

## Phase 8: Narrative Mode (Guided Tour)

### Tour Infrastructure
- [ ] NarrativeOverlay component
- [ ] StoryStep component
- [ ] Navigation controls (prev/next/exit)
- [ ] Progress indicator

### Tour Steps Content
- [ ] Step 1: Welcome - Overview of 4300+ confirmed exoplanets
- [ ] Step 2: Detection Methods - How we find planets
- [ ] Step 3: The Bias Problem - Why observed ≠ actual
- [ ] Step 4: Super-Earths Everywhere - Most common planet type
- [ ] Step 5: Hot Neptune Desert - Mysterious absence
- [ ] Step 6: Where Are the Earths? - η⊕ discussion
- [ ] Step 7: Solar System in Context - How typical are we?
- [ ] Step 8: Future - Roman, PLATO, ELTs missions

### Tour Behaviors
- [ ] Auto zoom/pan to relevant regions
- [ ] Highlight relevant planets per step
- [ ] "Learn More" expansion option
- [ ] Keyboard navigation (arrow keys)

---

## Phase 9: Layout Components

### Header
- [ ] Title
- [ ] Navigation tabs
- [ ] Settings menu

### Footer
- [ ] Data sources attribution
- [ ] Credits
- [ ] Links to paper/NASA Archive

### Responsive Layout
- [ ] Desktop (>1200px): Side-by-side viz + sidebar
- [ ] Tablet (768-1200px): Full width viz, collapsible sidebar
- [ ] Mobile (<768px): Stacked layout, bottom sheet for details

---

## Phase 10: Mobile & Accessibility

### Mobile Interactions
- [ ] Tap for tooltips (instead of hover)
- [ ] Swipe for panning
- [ ] Pinch zoom
- [ ] Bottom sheet for detailed info
- [ ] Simplified control buttons

### Accessibility
- [ ] Keyboard navigation for all controls
- [ ] ARIA labels on interactive elements
- [ ] Screen reader announcements for state changes
- [ ] High contrast mode option
- [ ] Reduced motion option (prefers-reduced-motion)
- [ ] Data table alternative view for screen readers

---

## Phase 11: Performance Optimization

### Rendering Optimization
- [ ] Canvas fallback for >5000 points
- [ ] Quadtree for efficient hover detection
- [ ] Viewport virtualization (only render visible points)
- [ ] Memoize scale calculations
- [ ] Memoize filtered datasets
- [ ] React.memo for stable components

### Event Handling
- [ ] Debounce resize handlers (200ms)
- [ ] Throttle pan updates (16ms / 60fps)

---

## Phase 12: Polish & Launch

### Loading & Error States
- [ ] Loading spinner/skeleton
- [ ] Error boundary components
- [ ] Graceful fallbacks

### Testing
- [ ] Unit tests for utility functions
- [ ] Component tests for key visualizations
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing

### Deployment
- [ ] Production build optimization
- [ ] SEO metadata
- [ ] Open Graph / social sharing cards
- [ ] Analytics integration
- [ ] Deploy to Vercel/Netlify
- [ ] Custom domain setup (if applicable)

---

## Data Generation Utilities

### Synthetic Population Generators
- [ ] `generateRVPopulation()` - Cumming et al. 2008 power law
- [ ] `generateMicrolensingPopulation()` - Suzuki et al. 2016 broken power law
- [ ] `generateTransitPopulation()` - Kepler occurrence rates

### Utility Functions
- [ ] Scale generators (log scales for mass, period, etc.)
- [ ] Unit converters (Earth masses ↔ Jupiter masses, days ↔ AU)
- [ ] Formatters (scientific notation, significant figures)
- [ ] Color interpolators for heatmaps
