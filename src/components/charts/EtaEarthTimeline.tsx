import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { scaleLinear } from 'd3-scale'

// η⊕ estimates from eta-earth-estimates.json
const ETA_EARTH_ESTIMATES = [
  { year: 2011, study: 'Catanzarite & Shao', value: 0.019, low: 0.006, high: 0.064 },
  { year: 2013, study: 'Petigura et al.', value: 0.22, low: 0.08, high: 0.40 },
  { year: 2013, study: 'Dressing & Charbonneau', value: 0.15, low: 0.06, high: 0.50 },
  { year: 2014, study: 'Foreman-Mackey et al.', value: 0.12, low: 0.03, high: 0.46 },
  { year: 2015, study: 'Burke et al.', value: 0.10, low: 0.04, high: 0.25 },
  { year: 2018, study: 'Zink & Hansen', value: 0.36, low: 0.14, high: 0.60 },
  { year: 2019, study: 'Hsu et al.', value: 0.16, low: 0.08, high: 0.32 },
  { year: 2020, study: 'Kunimoto & Matthews', value: 0.18, low: 0.09, high: 0.35 },
  { year: 2020, study: 'Bryson et al.', value: 0.37, low: 0.15, high: 0.60 },
]

interface EtaEarthTimelineProps {
  compact?: boolean
}

export function EtaEarthTimeline({ compact = false }: EtaEarthTimelineProps) {
  const [hoveredStudy, setHoveredStudy] = useState<string | null>(null)

  const width = compact ? 280 : 360
  const height = compact ? 200 : 280
  const margin = { top: 20, right: 20, bottom: 40, left: compact ? 100 : 140 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Scales
  const xScale = useMemo(
    () => scaleLinear().domain([0, 0.7]).range([0, innerWidth]),
    [innerWidth]
  )

  const yScale = useMemo(
    () => scaleLinear().domain([2010, 2021]).range([0, innerHeight]),
    [innerHeight]
  )

  // Convergence zone (5-50%)
  const convergenceZone = {
    left: xScale(0.05),
    right: xScale(0.50),
    width: xScale(0.50) - xScale(0.05),
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--color-background)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          η⊕ (Eta-Earth) Estimates
        </h3>
        <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--color-text)' }}>
          Fraction of Sun-like stars with Earth-like planets
        </p>
      </div>

      {/* Forest Plot */}
      <div className="p-4">
        <svg width={width} height={height}>
          <defs>
            <linearGradient id="convergence-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.05} />
              <stop offset="50%" stopColor="var(--color-accent)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Convergence zone */}
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              x={convergenceZone.left}
              y={0}
              width={convergenceZone.width}
              height={innerHeight}
              fill="url(#convergence-gradient)"
            />
            <motion.line
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              x1={xScale(0.15)}
              y1={0}
              x2={xScale(0.15)}
              y2={innerHeight}
              stroke="var(--color-accent)"
              strokeWidth={2}
              strokeDasharray="4,4"
              opacity={0.6}
            />

            {/* X axis ticks */}
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((tick) => (
              <g key={tick} transform={`translate(${xScale(tick)}, ${innerHeight})`}>
                <line y2={6} stroke="var(--color-text)" opacity={0.3} />
                <text
                  y={20}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--color-text)"
                  opacity={0.6}
                >
                  {(tick * 100).toFixed(0)}%
                </text>
              </g>
            ))}

            {/* X axis label */}
            <text
              x={innerWidth / 2}
              y={innerHeight + 35}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-text)"
              opacity={0.8}
            >
              η⊕ (fraction of stars)
            </text>

            {/* Data points */}
            {ETA_EARTH_ESTIMATES.map((est, i) => {
              const y = yScale(est.year + (i % 2) * 0.3) // Slight offset for same-year studies
              const isHovered = hoveredStudy === est.study

              return (
                <motion.g
                  key={est.study}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onMouseEnter={() => setHoveredStudy(est.study)}
                  onMouseLeave={() => setHoveredStudy(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Error bar */}
                  <line
                    x1={xScale(est.low)}
                    x2={xScale(est.high)}
                    y1={y}
                    y2={y}
                    stroke={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                    strokeWidth={isHovered ? 2 : 1.5}
                    opacity={isHovered ? 1 : 0.6}
                  />
                  {/* Error bar caps */}
                  <line
                    x1={xScale(est.low)}
                    x2={xScale(est.low)}
                    y1={y - 4}
                    y2={y + 4}
                    stroke={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                    strokeWidth={isHovered ? 2 : 1}
                    opacity={isHovered ? 1 : 0.6}
                  />
                  <line
                    x1={xScale(est.high)}
                    x2={xScale(est.high)}
                    y1={y - 4}
                    y2={y + 4}
                    stroke={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                    strokeWidth={isHovered ? 2 : 1}
                    opacity={isHovered ? 1 : 0.6}
                  />
                  {/* Center point */}
                  <circle
                    cx={xScale(est.value)}
                    cy={y}
                    r={isHovered ? 5 : 4}
                    fill={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                  />
                  {/* Study label */}
                  <text
                    x={-8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={compact ? 9 : 10}
                    fill={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                    opacity={isHovered ? 1 : 0.8}
                    fontWeight={isHovered ? 'bold' : 'normal'}
                  >
                    {compact ? est.study.split(' ')[0] : est.study} ({est.year})
                  </text>
                </motion.g>
              )
            })}

            {/* Best estimate annotation */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <text
                x={xScale(0.15)}
                y={-8}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-accent)"
                fontWeight="bold"
              >
                ~15%
              </text>
            </motion.g>
          </g>
        </svg>
      </div>

      {/* Summary */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
          Estimates converge to <strong style={{ color: 'var(--color-accent)' }}>5-50%</strong> of Sun-like stars
          hosting an Earth-sized planet in the habitable zone—implying{' '}
          <strong>billions of potential Earths</strong> in our galaxy.
        </p>
      </div>
    </div>
  )
}
