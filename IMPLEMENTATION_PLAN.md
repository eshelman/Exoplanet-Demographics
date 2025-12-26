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
- [x] Planet type filter toggles
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

## Phase 5: Bias Visualization ✅

### Detection Sensitivity Regions
- [x] Semi-transparent overlays showing method sensitivity
- [x] RV sensitivity region
- [x] Transit sensitivity region
- [x] Microlensing sensitivity region
- [x] Direct imaging sensitivity region

### Blind Spot Visualization
- [x] Inverse mode showing where we CAN'T detect
- [x] "Hot Neptune Desert" region highlight
- [x] Animated fade transitions

---

## Phase 6: Information Display ✅

### Tooltip Component
- [x] Planet name/designation
- [x] Mass (Earth masses)
- [x] Radius (Earth radii)
- [x] Orbital period
- [x] Host star info
- [x] Distance (light-years)
- [x] Detection method
- [x] Discovery year
- [x] Position follows cursor

### Side Panel
- [x] Collapsible container
- [x] Planet detail card (when selected)
- [x] Statistics display panel
- [x] Occurrence rate chart
- [x] Insight cards

### Planet Detail Card
- [x] Planet illustration/icon
- [x] Property table (mass, radius, density, period, temperature)
- [x] Context description
- [x] Size comparison visual (vs Earth)
- [x] Link to NASA Exoplanet Archive

---

## Phase 7: Secondary Visualizations ✅

### Occurrence Rate Heatmap
- [x] Grid layout (mass bins × period bins)
- [x] Color scale for log occurrence rate
- [x] Uncertainty indicators
- [x] "??" styling for insufficient data regions
- [x] Click cell to zoom main plot

### η⊕ Estimates Timeline
- [x] Forest plot layout
- [x] Historical estimates from 2011-2020
- [x] Error bars for uncertainty
- [x] Convergence visualization toward 5-50%

### Planet Type Gallery
- [x] Card grid layout
- [x] Visual icon for each type
- [x] Size comparison to Earth/Jupiter
- [x] Key statistics and occurrence rates
- [x] Click to filter main plot

---

## Phase 8: Narrative Mode (Guided Tour) ✅

### Tour Infrastructure
- [x] NarrativeOverlay component
- [x] StoryStep component
- [x] Navigation controls (prev/next/exit)
- [x] Progress indicator

### Tour Steps Content
- [x] Step 1: Welcome - Overview of 4300+ confirmed exoplanets
- [x] Step 2: Detection Methods - How we find planets
- [x] Step 3: The Bias Problem - Why observed ≠ actual
- [x] Step 4: Super-Earths Everywhere - Most common planet type
- [x] Step 5: Hot Neptune Desert - Mysterious absence
- [x] Step 6: Where Are the Earths? - η⊕ discussion
- [x] Step 7: Solar System in Context - How typical are we?
- [x] Step 8: Future - Roman, PLATO, ELTs missions

### Tour Behaviors
- [x] Auto zoom/pan to relevant regions
- [x] Highlight relevant planets per step
- [x] "Learn More" expansion option
- [x] Keyboard navigation (arrow keys)

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

---

## Phase 13: Audio Foundation

### Setup & Infrastructure
- [ ] Install Tone.js dependency
- [ ] Create `AudioManager` singleton class
- [ ] Add audio state to Zustand store (enabled, volume, settings)
- [ ] Create `useAudio` hook for component integration
- [ ] Implement lazy loading for audio assets
- [ ] Add audio context suspend/resume on tab visibility

### Audio Settings UI
- [ ] Audio toggle button in header (off by default)
- [ ] Audio settings panel/modal
- [ ] Master volume slider
- [ ] Category toggles (ambient, UI, sonification, narration)
- [ ] Sonification complexity selector (simple/standard/rich)
- [ ] Persist settings to localStorage

### Audio Asset Structure
- [ ] Create `public/audio/` directory structure
- [ ] Set up audio sprite system for UI sounds
- [ ] Implement preloading strategy

---

## Phase 14: Ambient Soundscape

### Base Layer: "The Void"
- [ ] Create 8-minute seamless ambient loop
- [ ] Sub-bass drone (25-40 Hz)
- [ ] Filtered white noise texture
- [ ] Occasional deep "whale song" tones
- [ ] Implement crossfade looping

### Detection Method Textures
- [ ] Radial Velocity: Doppler-shifted pulse oscillation
- [ ] Transit: Crystalline chimes at irregular intervals
- [ ] Microlensing: Deep crescendo-decrescendo swells
- [ ] Direct Imaging: Warm sustained pad tones
- [ ] Layer mixing based on enabled methods

### Zoom-Responsive Ambience
- [ ] Dense/busy at full view
- [ ] Clearer at mid zoom
- [ ] Sparse/intimate at close zoom
- [ ] Near silence at single planet focus

---

## Phase 15: Data Sonification

### Planet Voice System
- [ ] `periodToFrequency()` - Logarithmic mapping (1 day=2000Hz, 10 years=60Hz)
- [ ] `radiusToVolume()` - Larger planets louder
- [ ] `typeToTimbre()` - Rocky=sine, gas giant=rich harmonics
- [ ] `separationToPan()` - Close=center, far=wide stereo
- [ ] Create `PolySynth` for planet voices

### Hover Sonification
- [ ] Fade in planet voice on hover (500ms attack)
- [ ] Sustain while hovering
- [ ] Fade out on mouse leave (1s decay)
- [ ] Limit polyphony to prevent audio chaos

### Solar System Reference Tones
- [ ] Mercury: Quick high ping
- [ ] Venus: Thick hazy drone
- [ ] Earth: Warm 136.1 Hz "home frequency"
- [ ] Mars: Dusty thin whistle
- [ ] Jupiter: Deep brass-like tone
- [ ] Saturn: Shimmering chorus effect
- [ ] Uranus: Cold, tilted, unsettling
- [ ] Neptune: Deep blue, melancholic

### Selection Sonification
- [ ] Planet select: Resonant ping + voice swell
- [ ] Brush selection: Drawing texture while dragging
- [ ] Brush complete: Satisfying capture sound

---

## Phase 16: UI Audio Feedback

### Button & Toggle Sounds
- [ ] Button hover: Soft breath/air release (80ms)
- [ ] Button click: Gentle mechanical click (120ms)
- [ ] Toggle on: Rising two-note chime (minor 3rd up)
- [ ] Toggle off: Falling two-note chime (minor 3rd down)

### Navigation Sounds
- [ ] Pan start: Subtle woosh onset
- [ ] Pan continuous: Filtered noise tied to velocity
- [ ] Pan end: Gentle deceleration woosh
- [ ] Zoom in: Rising pitch sweep + focus click
- [ ] Zoom out: Falling pitch sweep + expansion

### Transition Sounds
- [ ] Axis switch: Morphing pad crossfade (800ms)
- [ ] View change: Dimensional shift sound
- [ ] Filter apply: Soft sorting/shuffling sound
- [ ] Sidebar open/close: Mechanical slide + airlock seal

---

## Phase 17: Narrative Audio

### Story Progression Sounds
- [ ] Story begin: Subtle orchestral swell (2s)
- [ ] Step advance: Page turn + soft chime
- [ ] Step back: Reverse page turn
- [ ] Story end: Resolve to tonic, fade with reverb (3s)

### Special Moment Sounds
- [ ] Bias overlay reveal: Hollow, unsettling resonance
- [ ] Hot Neptune Desert: Conspicuous silence/absence
- [ ] η⊕ reveal: Hopeful rising sequence, unresolved
- [ ] Solar System context: Home frequency (136.1 Hz) swell

### Optional Voice-Over Support
- [ ] Voice-over audio loading system
- [ ] Sync mechanism with narrative steps
- [ ] Caption display system
- [ ] Voice-over toggle in settings

---

## Phase 18: Occurrence Rate Sonification

### Heatmap Audio
- [ ] Hover-to-play mode for heatmap cells
- [ ] Occurrence rate → volume mapping
- [ ] Mass axis → pitch mapping
- [ ] Period axis → stereo position

### "Play the Galaxy" Mode
- [ ] Auto-sweep through parameter space
- [ ] 30-60 second musical phrase
- [ ] Play/pause controls
- [ ] Visual cursor sync with audio position

---

## Phase 19: Audio Accessibility

### Accessibility Features
- [ ] Screen reader mode with audio announcements
- [ ] Reduced sound mode (essential feedback only)
- [ ] Respect `prefers-reduced-motion` for audio intensity
- [ ] Full captions for any voice-over content
- [ ] Volume memory persistence

### Performance Optimization
- [ ] Audio sprite loading for UI sounds
- [ ] Web Audio voice pooling (limit polyphony to 8)
- [ ] Suspend audio context when tab hidden
- [ ] Reduce ambient complexity on mobile
- [ ] Battery-conscious audio on mobile devices
