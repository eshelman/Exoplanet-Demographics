import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { SimulatedSystem, SimulatedPlanet, OrbitalPosition } from '../../types/simulation'
import { computeSystemPositions } from '../../utils/orbitalMechanics'
import { StarRenderer } from './StarRenderer'
import { PlanetRenderer } from './PlanetRenderer'
import { OrbitPath } from './OrbitPath'
import { HabitableZoneRenderer } from './HabitableZoneRenderer'
import { useSimulationLoop } from '../../hooks/useSimulationLoop'

interface OrbitalCanvasProps {
  system: SimulatedSystem
  selectedPlanetId: string | null
  speed: number
  isPaused: boolean
  showOrbits: boolean
  showLabels: boolean
  showHabitableZone: boolean
  onPlanetSelect: (planet: SimulatedPlanet) => void
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
}: OrbitalCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null)
  const [positions, setPositions] = useState<Map<string, OrbitalPosition>>(new Map())
  const [binaryAngle, setBinaryAngle] = useState(0)

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

  // Calculate scale to fit the system
  const { scale, cx, cy } = useMemo(() => {
    const { width, height } = dimensions
    const centerX = width / 2
    const centerY = height / 2

    // Find the outermost planet
    const maxSemiMajorAxis = Math.max(...system.planets.map((p) => p.semiMajorAxis * (1 + p.eccentricity)))

    // Add padding and calculate scale
    const padding = 80
    const availableRadius = Math.min(width, height) / 2 - padding

    // Pixels per AU
    const pixelsPerAU = availableRadius / maxSemiMajorAxis

    return {
      scale: pixelsPerAU,
      cx: centerX,
      cy: centerY,
    }
  }, [dimensions, system.planets])

  // Animation loop callback
  const handleTick = useCallback(
    (simulationTime: number) => {
      // Update planet positions
      const newPositions = computeSystemPositions(system.planets, simulationTime, system.starMass)
      setPositions(newPositions)

      // Update binary star angle (30-day period for illustration)
      if (system.isBinarySystem && system.binaryType === 'close') {
        const binaryPeriod = 30 // days
        const angle = (simulationTime / binaryPeriod) * 2 * Math.PI
        setBinaryAngle(angle)
      }
    },
    [system]
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #050a14 100%)',
      }}
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
