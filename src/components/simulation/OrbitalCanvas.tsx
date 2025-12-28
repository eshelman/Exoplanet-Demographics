import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SimulatedSystem, SimulatedPlanet, OrbitalPosition } from '../../types/simulation'
import { computeSystemPositions } from '../../utils/orbitalMechanics'
import { StarRenderer } from './StarRenderer'
import { PlanetRenderer } from './PlanetRenderer'
import { OrbitPath } from './OrbitPath'
import { HabitableZoneRenderer } from './HabitableZoneRenderer'
import { SimulationTooltip } from './SimulationTooltip'
import { useSimulationLoop } from '../../hooks/useSimulationLoop'
import { useOrbitalChimes } from '../../hooks/useOrbitalChimes'

// Thresholds for special handling
const LONG_PERIOD_THRESHOLD = 1000 // days - planets with longer periods get progress indicators

// Zoom level bounds
const MIN_ZOOM = 0.25
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25

interface OrbitalCanvasProps {
  system: SimulatedSystem
  selectedPlanetId: string | null
  speed: number
  isPaused: boolean
  showOrbits: boolean
  showLabels: boolean
  showHabitableZone: boolean
  onPlanetSelect: (planet: SimulatedPlanet) => void
  onPositionsUpdate?: (positions: Map<string, OrbitalPosition>) => void
  /** Callback when a planet crosses the orbital reference point (rhythmic chime) */
  onOrbitalChime?: (planet: SimulatedPlanet) => void
  /** Callback when a planet passes periapsis (closest approach to star) */
  onPeriapsisPass?: (planet: SimulatedPlanet) => void
  /** Whether orbital chimes are enabled */
  orbitalChimesEnabled?: boolean
}

export function OrbitalCanvas({
  system,
  selectedPlanetId,
  speed,
  isPaused,
  showOrbits,
  showLabels,
  showHabitableZone,
  onPlanetSelect,
  onPositionsUpdate,
  onOrbitalChime,
  onPeriapsisPass,
  orbitalChimesEnabled = true,
}: OrbitalCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [positions, setPositions] = useState<Map<string, OrbitalPosition>>(new Map())
  const [binaryAngle, setBinaryAngle] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [simulationTime, setSimulationTime] = useState(0)

  // Orbital chimes - rhythmic pulses synchronized to orbital motion
  const handleOrbitalChime = useCallback(
    (planet: SimulatedPlanet) => {
      onOrbitalChime?.(planet)
    },
    [onOrbitalChime]
  )

  const handlePeriapsisPass = useCallback(
    (planet: SimulatedPlanet) => {
      onPeriapsisPass?.(planet)
    },
    [onPeriapsisPass]
  )

  const orbitalChimes = useOrbitalChimes({
    onChime: handleOrbitalChime,
    onPeriapsis: handlePeriapsisPass,
    enabled: orbitalChimesEnabled && !isPaused,
  })

  // Reset chime tracking when system changes
  useEffect(() => {
    orbitalChimes.reset()
  }, [system, orbitalChimes])

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  // Calculate base scale to fit the system
  const { baseScale, cx, cy, maxSemiMajorAxis } = useMemo(() => {
    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2

    // Find the outermost planet
    const maxAxis = Math.max(...system.planets.map((p) => p.semiMajorAxis * (1 + p.eccentricity)))

    // Add padding and calculate scale
    const padding = 80
    const availableRadius = Math.min(width, height) / 2 - padding

    // Pixels per AU (base scale, before zoom)
    const pixelsPerAU = availableRadius / maxAxis

    return {
      baseScale: pixelsPerAU,
      cx: centerX,
      cy: centerY,
      maxSemiMajorAxis: maxAxis,
    }
  }, [dimensions, system.planets])

  // Apply zoom to scale
  const scale = baseScale * zoomLevel

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1)
  }, [])

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    setZoomLevel((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)))
  }, [])

  // Track mouse position for tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }, [])

  // Animation loop callback
  const handleTick = useCallback(
    (time: number) => {
      // Track simulation time for orbit progress calculations
      setSimulationTime(time)

      // Update planet positions
      const newPositions = computeSystemPositions(system.planets, time, system.starMass)
      setPositions(newPositions)

      // Update orbital chimes - triggers rhythmic pulses when planets cross reference point
      orbitalChimes.update(system.planets, newPositions)

      // Notify parent of position updates (throttled by animation frame)
      onPositionsUpdate?.(newPositions)

      // Update binary star angle (30-day period for illustration)
      if (system.isBinarySystem && system.binaryType === 'close') {
        const binaryPeriod = 30 // days
        const angle = (time / binaryPeriod) * 2 * Math.PI
        setBinaryAngle(angle)
      }
    },
    [system, onPositionsUpdate, orbitalChimes]
  )

  // Start the simulation loop
  useSimulationLoop({
    speed,
    isPaused,
    onTick: handleTick,
  })

  // Initialize positions on mount
  useEffect(() => {
    handleTick(0)
  }, [handleTick])

  // Get hovered planet data for tooltip
  const hoveredPlanet = hoveredPlanetId
    ? system.planets.find((p) => p.id === hoveredPlanetId)
    : null
  const hoveredPosition = hoveredPlanetId ? positions.get(hoveredPlanetId) : null

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #050a14 100%)',
      }}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
    >
      {/* Star field background */}
      <StarFieldBackground width={dimensions.width} height={dimensions.height} />

      {/* Distant companion star for binary systems */}
      {system.isBinarySystem && system.binaryType === 'distant' && system.companionStar && (
        <DistantCompanion
          designation={system.companionStar.designation}
          x={dimensions.width - 80}
          y={60}
        />
      )}

      {/* Main SVG canvas */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      >
        {/* Habitable zone (render behind everything) */}
        {system.habitableZone && (
          <HabitableZoneRenderer
            habitableZone={system.habitableZone}
            cx={cx}
            cy={cy}
            scale={scale}
            visible={showHabitableZone}
          />
        )}

        {/* Orbital paths */}
        {showOrbits &&
          system.planets.map((planet) => (
            <OrbitPath
              key={`orbit-${planet.id}`}
              semiMajorAxis={planet.semiMajorAxis}
              eccentricity={planet.eccentricity}
              argumentOfPeriapsis={planet.argumentOfPeriapsis}
              cx={cx}
              cy={cy}
              scale={scale}
              isSelected={planet.id === selectedPlanetId}
              isEstimated={planet.eccentricityEstimated}
            />
          ))}

        {/* Star at center */}
        <StarRenderer
          temperature={system.starTemperature}
          radius={system.starRadius}
          cx={cx}
          cy={cy}
          isBinaryClose={system.isBinarySystem && system.binaryType === 'close'}
          binaryAngle={binaryAngle}
        />

        {/* Planets */}
        {system.planets.map((planet) => {
          const pos = positions.get(planet.id)
          if (!pos) return null

          const planetX = cx + pos.x * scale
          const planetY = cy - pos.y * scale // Invert Y for screen coordinates

          return (
            <PlanetRenderer
              key={planet.id}
              id={planet.id}
              name={planet.name}
              planetType={planet.planetType}
              radius={planet.radius || 1}
              x={planetX}
              y={planetY}
              isSelected={planet.id === selectedPlanetId}
              isHovered={planet.id === hoveredPlanetId}
              showLabel={showLabels}
              onClick={() => onPlanetSelect(planet)}
              onHover={(hovered) => setHoveredPlanetId(hovered ? planet.id : null)}
            />
          )
        })}
      </svg>

      {/* Simulation info overlay */}
      <div
        className="absolute top-4 left-4 text-xs opacity-50"
        style={{ color: 'var(--color-text)' }}
      >
        1 sec = 1 day × {speed}
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-4 left-4 flex flex-col gap-1"
        style={{ color: 'var(--color-text)' }}
      >
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= MAX_ZOOM}
          className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-30"
          title="Zoom in (+)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          onClick={handleZoomReset}
          className="w-8 h-8 rounded flex items-center justify-center text-xs transition-colors hover:bg-white/10"
          title="Reset zoom"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= MIN_ZOOM}
          className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-30"
          title="Zoom out (-)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>

      {/* Scale indicator */}
      <div
        className="absolute bottom-4 right-4 text-xs opacity-50"
        style={{ color: 'var(--color-text)' }}
      >
        {maxSemiMajorAxis.toFixed(1)} AU max
      </div>

      {/* Single-planet system indicator */}
      {system.planets.length === 1 && (
        <SinglePlanetIndicator planetName={system.planets[0].name} />
      )}

      {/* Long-period planet progress indicators */}
      <LongPeriodProgress
        planets={system.planets}
        simulationTime={simulationTime}
        speed={speed}
        selectedPlanetId={selectedPlanetId}
      />

      {/* Planet tooltip */}
      <AnimatePresence>
        {hoveredPlanet && hoveredPosition && (
          <SimulationTooltip
            planet={hoveredPlanet}
            position={hoveredPosition}
            x={mousePos.x}
            y={mousePos.y}
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Simple star field background using CSS
 */
function StarFieldBackground({ width, height }: { width: number; height: number }) {
  // Generate random star positions (memoized for performance)
  const stars = useMemo(() => {
    const count = Math.floor((width * height) / 8000) // ~1 star per 8000px²
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  }, [width, height])

  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    >
      {stars.map((star, index) => (
        <circle
          key={index}
          cx={star.x}
          cy={star.y}
          r={star.size}
          fill="white"
          opacity={star.opacity}
        />
      ))}
    </svg>
  )
}

/**
 * Distant companion star indicator
 */
function DistantCompanion({ designation, x, y }: { designation: string; x: number; y: number }) {
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: x, top: y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div
        className="w-4 h-4 rounded-full"
        style={{
          background: 'radial-gradient(circle, #FFFACD 0%, #FFA500 50%, transparent 70%)',
          boxShadow: '0 0 10px 3px rgba(255, 200, 100, 0.4)',
        }}
      />
      <span
        className="mt-1 text-xs"
        style={{ color: 'rgba(255, 200, 100, 0.7)' }}
      >
        {designation} ★
      </span>
      <span
        className="text-xs opacity-50"
        style={{ color: 'var(--color-text)' }}
      >
        Distant
      </span>
    </motion.div>
  )
}

/**
 * Single planet system indicator
 */
const SinglePlanetIndicator = memo(function SinglePlanetIndicator({ planetName }: { planetName: string }) {
  return (
    <motion.div
      className="absolute top-4 right-4 text-xs px-3 py-2 rounded-lg"
      style={{
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: 'rgba(147, 197, 253, 0.9)',
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="font-medium">Single Planet System</div>
      <div className="opacity-70 mt-0.5">Only {planetName} detected</div>
    </motion.div>
  )
})

/**
 * Long-period planet orbit progress indicators
 */
const LongPeriodProgress = memo(function LongPeriodProgress({
  planets,
  simulationTime,
  speed,
  selectedPlanetId,
}: {
  planets: SimulatedPlanet[]
  simulationTime: number
  speed: number
  selectedPlanetId: string | null
}) {
  // Filter for long-period planets
  const longPeriodPlanets = planets.filter((p) => p.period > LONG_PERIOD_THRESHOLD)

  if (longPeriodPlanets.length === 0) return null

  // Calculate recommended speed for seeing orbits complete
  const longestPeriod = Math.max(...longPeriodPlanets.map((p) => p.period))
  const recommendedSpeed = longestPeriod > 10000 ? 10 : longestPeriod > 3000 ? 5 : 2

  return (
    <div
      className="absolute top-14 left-4 space-y-2"
      style={{ color: 'var(--color-text)' }}
    >
      {/* Speed recommendation */}
      {speed < recommendedSpeed && (
        <motion.div
          className="text-xs px-2 py-1.5 rounded"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'rgba(252, 211, 77, 0.9)',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tip: Use {recommendedSpeed}x speed to see outer orbits
        </motion.div>
      )}

      {/* Individual planet progress */}
      {longPeriodPlanets.map((planet) => {
        const orbitProgress = ((simulationTime % planet.period) / planet.period) * 100
        const isSelected = planet.id === selectedPlanetId

        return (
          <div
            key={planet.id}
            className="text-xs"
            style={{ opacity: isSelected ? 1 : 0.6 }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="truncate max-w-[100px]">{planet.name}</span>
              <span className="opacity-50">{formatPeriodCompact(planet.period)}</span>
            </div>
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${orbitProgress}%`,
                  backgroundColor: isSelected ? '#60A5FA' : 'rgba(255,255,255,0.4)',
                }}
                initial={false}
                animate={{ width: `${orbitProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
})

/**
 * Compact period format for progress indicators
 */
function formatPeriodCompact(days: number): string {
  if (days < 365) {
    return `${Math.round(days)}d`
  } else {
    return `${(days / 365.25).toFixed(1)}y`
  }
}
