# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive web visualization for exploring exoplanet demographics, based on ["The Demographics of Exoplanets"](https://arxiv.org/abs/2011.04703) (Gaudi, Christiansen & Meyer 2020). Transforms academic findings into an explorable experience showing planet distributions, detection biases, and occurrence rates.

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + CSS Modules
- **Visualization**: D3.js v7 (React for DOM, D3 for math)
- **State**: Zustand
- **Animation**: Framer Motion (UI) + D3 transitions (data)
- **Audio**: Tone.js (Web Audio synthesis for data sonification)
- **Deployment**: Static (Vercel/Netlify)

## Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

## Architecture

### D3 + React Pattern
Use "React for DOM, D3 for math":
- React manages component lifecycle and container elements
- D3 calculates scales, generates paths, handles data joins
- Use React refs for D3 to bind to DOM nodes
- useEffect hooks trigger D3 updates on data/dimension changes

```tsx
// Example: D3 binds to React ref, React controls lifecycle
const svgRef = useRef<SVGSVGElement>(null);
useEffect(() => {
  const svg = d3.select(svgRef.current);
  // D3 rendering logic here
}, [data, dimensions]);
```

### Key Directory Structure
```
src/
├── components/
│   ├── visualization/   # D3-powered viz components (ScatterPlot, Axes, etc.)
│   ├── controls/        # UI controls (AxisSelector, MethodToggle, etc.)
│   ├── cards/           # Info display cards
│   └── narrative/       # Guided tour components
├── hooks/               # Custom hooks (useD3, useZoom, useBrush, useDimensions)
├── store/               # Zustand state management
├── utils/               # Scale calculations, data generators, formatters
└── types/               # TypeScript interfaces for planets, methods, viz state

public/data/             # Static JSON data files
public/audio/            # Audio assets (ambient, UI sounds, solar system tones)
```

### State Management (Zustand)
Central store manages:
- View state (axis selection, zoom, pan)
- Filters (detection methods, planet types, bias overlay)
- Selection (selected planet, brush selection)
- Narrative mode (step tracking)

### Data Flow
- Static JSON files in `public/data/` define planet types, detection methods, occurrence rates
- Synthetic populations generated using power-law distributions from the paper
- Solar System planets shown as reference points

## Visualization Conventions

- **Axes**: Log scale for both mass/radius (Y) and period/separation (X)
- **Colors**: Detection methods have distinct colors (RV=#E63946, Transit=#457B9D, Microlensing=#2A9D8F, Direct=#E9C46A)
- **Solar System**: Gold (#FFD700) with outline styling
- **Performance**: Switch to Canvas for >5000 points; use quadtree for hover detection

## Key Design Principles

1. Progressive disclosure: start simple, reveal complexity on demand
2. Bias transparency: always show detection blind spots, not just detections
3. Solar System context always visible for reference
4. Mobile-first responsive design

## Audio/Soundscape

The visualization includes an optional "cosmic ambient minimalism" soundscape. See `exoplanet-viz-soundscape.md` for full design document.

### Audio Philosophy
- Sound off by default; opt-in experience
- Subtlety first: enhance, never overwhelm (default 30% volume)
- Data as music: sonify actual planetary properties
- All audio has visual equivalents (accessibility)

### Planet Voice System
Planets have unique sounds derived from properties:
- **Pitch**: Orbital period (shorter = higher, 60Hz-2000Hz range)
- **Timbre**: Planet type (rocky=sine, gas giant=rich harmonics)
- **Volume**: Planet radius (larger = louder)
- **Stereo**: Semi-major axis (close=center, far=wide)

### Audio Layers
1. **Ambient**: "The Void" - subtle cosmic drone, detection method textures
2. **Data Sonification**: Planet voices on hover/select
3. **UI Feedback**: Soft spacecraft-like clicks, chimes, transitions
4. **Narrative**: Story progression sounds, special moment reveals
