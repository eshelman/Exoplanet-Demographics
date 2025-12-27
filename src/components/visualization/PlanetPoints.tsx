import { useMemo } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import type { Planet } from '../../types'
import { METHOD_COLORS, SOLAR_SYSTEM_COLOR, createRadiusScale } from '../../utils/scales'
import type { XAxisType, YAxisType } from '../../types'
import { useAudio } from '../../audio'

interface PlanetPointsProps {
  planets: Planet[]
  xScale: d3.ScaleLogarithmic<number, number>
  yScale: d3.ScaleLogarithmic<number, number>
  xAxisType: XAxisType
  yAxisType: YAxisType
  onHover?: (planet: Planet | null) => void
  onSelect?: (planet: Planet) => void
  onSimulate?: (planet: Planet) => void
  selectedPlanet?: Planet | null
}

export function PlanetPoints({
  planets,
  xScale,
  yScale,
  xAxisType,
  yAxisType,
  onHover,
  onSelect,
  onSimulate,
  selectedPlanet,
}: PlanetPointsProps) {
  const {
    startPlanetHover,
    stopPlanetHover,
    selectPlanet: selectPlanetSound,
  } = useAudio()

  const radiusScale = useMemo(() => createRadiusScale(3, 15), [])

  const getXValue = (planet: Planet): number | null => {
    if (xAxisType === 'period') return planet.period
    return planet.separation ?? null
  }

  const getYValue = (planet: Planet): number | null => {
    if (yAxisType === 'mass') return planet.mass ?? null
    return planet.radius ?? null
  }

  const visiblePlanets = useMemo(() => {
    return planets.filter((planet) => {
      const x = getXValue(planet)
      const y = getYValue(planet)
      if (x === null || y === null) return false

      const xDomain = xScale.domain()
      const yDomain = yScale.domain()
      return x >= xDomain[0] && x <= xDomain[1] && y >= yDomain[0] && y <= yDomain[1]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planets, xAxisType, yAxisType, xScale.domain().join(','), yScale.domain().join(',')])

  return (
    <g className="planet-points">
      <AnimatePresence>
        {visiblePlanets.map((planet) => {
          const x = getXValue(planet)
          const y = getYValue(planet)
          if (x === null || y === null) return null

          const cx = xScale(x)
          const cy = yScale(y)
          const r = radiusScale(planet.radius ?? 1)
          const isSolarSystem = planet.isSolarSystem
          const isSelected = selectedPlanet?.id === planet.id
          const color = isSolarSystem
            ? SOLAR_SYSTEM_COLOR
            : METHOD_COLORS[planet.detectionMethod] || METHOD_COLORS.other

          return (
            <motion.g
              key={planet.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={isSolarSystem ? 'transparent' : color}
                stroke={color}
                strokeWidth={isSolarSystem ? 2 : isSelected ? 2 : 0}
                opacity={isSolarSystem ? 1 : 0.7}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => {
                  onHover?.(planet)
                  onSelect?.(planet)
                  startPlanetHover(planet)
                }}
                onMouseLeave={() => {
                  onHover?.(null)
                  stopPlanetHover(planet)
                }}
                onClick={() => {
                  selectPlanetSound(planet)
                  // Open simulation on click (non-solar-system planets only)
                  if (!planet.isSolarSystem) {
                    onSimulate?.(planet)
                  }
                }}
              />
              {/* Label for Solar System planets */}
              {isSolarSystem && (
                <text
                  x={cx + r + 4}
                  y={cy + 4}
                  fontSize="11"
                  fill={SOLAR_SYSTEM_COLOR}
                  fontWeight="500"
                >
                  {planet.name}
                </text>
              )}
            </motion.g>
          )
        })}
      </AnimatePresence>
    </g>
  )
}
