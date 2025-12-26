import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ScaleLogarithmic } from 'd3-scale'
import type { XAxisType, YAxisType, DetectionMethodId } from '../../types'
import { METHOD_COLORS } from '../../utils/scales'

// Detection method sensitivity regions based on detection-methods.json
type SensitivityRegion = {
  mass: { min: number; max: number }
  period: { min: number; max: number }
  separation?: { min: number; max: number }
}

const DETECTION_SENSITIVITIES: Partial<Record<DetectionMethodId, SensitivityRegion>> = {
  'radial-velocity': {
    mass: { min: 3, max: 10000 },
    period: { min: 1, max: 10000 },
  },
  'transit-kepler': {
    mass: { min: 0.5, max: 5000 },
    period: { min: 0.5, max: 500 },
  },
  'transit-other': {
    mass: { min: 1, max: 5000 },
    period: { min: 0.5, max: 30 },
  },
  microlensing: {
    mass: { min: 0.1, max: 10000 },
    period: { min: 365, max: 36500 },
    separation: { min: 0.5, max: 10 },
  },
  'direct-imaging': {
    mass: { min: 500, max: 25000 },
    period: { min: 3650, max: 365000 },
    separation: { min: 10, max: 1000 },
  },
  astrometry: {
    mass: { min: 50, max: 10000 },
    period: { min: 365, max: 7300 },
  },
}

// Notable regions from occurrence-rates.json
const NOTABLE_REGIONS = [
  {
    id: 'hot-neptune-desert',
    name: 'Hot Neptune Desert',
    description: 'Few Neptune-mass planets with P < 3 days',
    bounds: {
      mass: { min: 10, max: 100 },
      period: { min: 0.5, max: 3 },
    },
    color: '#FF6B6B',
  },
  {
    id: 'brown-dwarf-desert',
    name: 'Brown Dwarf Desert',
    description: 'Very few 10-80 Mj companions close in',
    bounds: {
      mass: { min: 3000, max: 25000 },
      period: { min: 1, max: 1000 },
    },
    color: '#FFE66D',
  },
]

interface BiasOverlayProps {
  xScale: ScaleLogarithmic<number, number>
  yScale: ScaleLogarithmic<number, number>
  width: number
  height: number
  xAxisType: XAxisType
  yAxisType: YAxisType
  enabledMethods: Set<DetectionMethodId>
  showBlindSpots?: boolean
}

export function BiasOverlay({
  xScale,
  yScale,
  width: _width,
  height: _height,
  xAxisType,
  yAxisType,
  enabledMethods,
  showBlindSpots = false,
}: BiasOverlayProps) {
  // width and height reserved for future use (e.g., full-plot blind spot mask)
  void _width
  void _height
  // Convert period to separation using Kepler's 3rd law (assuming solar mass)
  const periodToSeparation = (period: number) => Math.pow((period / 365.25) ** 2, 1 / 3)

  // Get the bounds for x-axis based on axis type
  const getXBounds = (
    periodBounds: { min: number; max: number },
    separationBounds?: { min: number; max: number }
  ) => {
    if (xAxisType === 'period') {
      return periodBounds
    }
    // Use separation bounds if provided, otherwise convert from period
    if (separationBounds) {
      return separationBounds
    }
    return {
      min: periodToSeparation(periodBounds.min),
      max: periodToSeparation(periodBounds.max),
    }
  }

  // Calculate sensitivity region rectangles
  const sensitivityRegions = useMemo(() => {
    const regions: {
      id: DetectionMethodId
      x: number
      y: number
      width: number
      height: number
      color: string
    }[] = []

    for (const [methodId, sensitivity] of Object.entries(DETECTION_SENSITIVITIES)) {
      if (!enabledMethods.has(methodId as DetectionMethodId)) continue

      // Only show mass-based overlays when yAxis is mass
      if (yAxisType !== 'mass') continue

      const xBounds = getXBounds(sensitivity.period, sensitivity.separation)

      // Clamp to visible scale domain
      const xDomain = xScale.domain()
      const yDomain = yScale.domain()

      const xMin = Math.max(xBounds.min, xDomain[0])
      const xMax = Math.min(xBounds.max, xDomain[1])
      const yMin = Math.max(sensitivity.mass.min, yDomain[0])
      const yMax = Math.min(sensitivity.mass.max, yDomain[1])

      // Skip if region is outside visible area
      if (xMin >= xMax || yMin >= yMax) continue

      const x = xScale(xMin)
      const y = yScale(yMax) // yScale is inverted
      const regionWidth = xScale(xMax) - xScale(xMin)
      const regionHeight = yScale(yMin) - yScale(yMax)

      regions.push({
        id: methodId as DetectionMethodId,
        x,
        y,
        width: Math.max(0, regionWidth),
        height: Math.max(0, regionHeight),
        color: METHOD_COLORS[methodId as DetectionMethodId],
      })
    }

    return regions
  }, [enabledMethods, xScale, yScale, xAxisType, yAxisType])

  // Calculate notable region rectangles (Hot Neptune Desert, etc.)
  const notableRegions = useMemo(() => {
    if (yAxisType !== 'mass') return []

    const regions: {
      id: string
      name: string
      description: string
      x: number
      y: number
      width: number
      height: number
      color: string
    }[] = []

    for (const region of NOTABLE_REGIONS) {
      const xBounds = getXBounds(region.bounds.period)

      // Clamp to visible scale domain
      const xDomain = xScale.domain()
      const yDomain = yScale.domain()

      const xMin = Math.max(xBounds.min, xDomain[0])
      const xMax = Math.min(xBounds.max, xDomain[1])
      const yMin = Math.max(region.bounds.mass.min, yDomain[0])
      const yMax = Math.min(region.bounds.mass.max, yDomain[1])

      // Skip if region is outside visible area
      if (xMin >= xMax || yMin >= yMax) continue

      const x = xScale(xMin)
      const y = yScale(yMax)
      const regionWidth = xScale(xMax) - xScale(xMin)
      const regionHeight = yScale(yMin) - yScale(yMax)

      regions.push({
        id: region.id,
        name: region.name,
        description: region.description,
        x,
        y,
        width: Math.max(0, regionWidth),
        height: Math.max(0, regionHeight),
        color: region.color,
      })
    }

    return regions
  }, [xScale, yScale, xAxisType, yAxisType])

  // Calculate blind spots (regions where NO method can detect)
  const blindSpotMask = useMemo(() => {
    if (!showBlindSpots || yAxisType !== 'mass') return null

    // Create a composite of all detection regions
    // For simplicity, we'll highlight a known blind spot: small planets at long periods
    const xDomain = xScale.domain()
    const yDomain = yScale.domain()

    // Blind spot: Earth-sized planets at >100 day periods (hard for all methods)
    const blindSpots = [
      {
        id: 'long-period-small',
        xMin: Math.max(100, xDomain[0]),
        xMax: xDomain[1],
        yMin: yDomain[0],
        yMax: Math.min(2, yDomain[1]),
      },
      {
        id: 'close-in-massive',
        xMin: xDomain[0],
        xMax: Math.min(0.5, xDomain[1]),
        yMin: Math.max(500, yDomain[0]),
        yMax: yDomain[1],
      },
    ]

    return blindSpots
      .map((spot) => {
        if (spot.xMin >= spot.xMax || spot.yMin >= spot.yMax) return null
        return {
          id: spot.id,
          x: xScale(spot.xMin),
          y: yScale(spot.yMax),
          width: xScale(spot.xMax) - xScale(spot.xMin),
          height: yScale(spot.yMin) - yScale(spot.yMax),
        }
      })
      .filter(Boolean)
  }, [showBlindSpots, xScale, yScale, xAxisType, yAxisType])

  return (
    <g className="bias-overlay">
      {/* Detection sensitivity regions */}
      <AnimatePresence>
        {sensitivityRegions.map((region) => (
          <motion.rect
            key={`sensitivity-${region.id}`}
            x={region.x}
            y={region.y}
            width={region.width}
            height={region.height}
            fill={region.color}
            fillOpacity={0.08}
            stroke={region.color}
            strokeOpacity={0.3}
            strokeWidth={1}
            strokeDasharray="4,4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </AnimatePresence>

      {/* Notable regions (deserts, gaps) */}
      <AnimatePresence>
        {notableRegions.map((region) => (
          <motion.g key={`notable-${region.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <rect
              x={region.x}
              y={region.y}
              width={region.width}
              height={region.height}
              fill={region.color}
              fillOpacity={0.15}
              stroke={region.color}
              strokeOpacity={0.6}
              strokeWidth={2}
            />
            {/* Label for notable region */}
            {region.width > 60 && region.height > 30 && (
              <text
                x={region.x + region.width / 2}
                y={region.y + region.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={region.color}
                fontSize={11}
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {region.name}
              </text>
            )}
          </motion.g>
        ))}
      </AnimatePresence>

      {/* Blind spots overlay */}
      <AnimatePresence>
        {blindSpotMask?.map((spot) =>
          spot ? (
            <motion.rect
              key={`blind-${spot.id}`}
              x={spot.x}
              y={spot.y}
              width={spot.width}
              height={spot.height}
              fill="url(#blind-spot-pattern)"
              fillOpacity={0.4}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          ) : null
        )}
      </AnimatePresence>

      {/* Definitions for patterns */}
      <defs>
        <pattern id="blind-spot-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
          <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        </pattern>
      </defs>
    </g>
  )
}
