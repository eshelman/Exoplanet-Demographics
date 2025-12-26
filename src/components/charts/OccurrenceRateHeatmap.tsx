import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { scaleSequentialLog } from 'd3-scale'
import { interpolateYlOrRd } from 'd3-scale-chromatic'

// Occurrence rate data from occurrence-rates.json
const MASS_BINS = [
  { min: 0.5, max: 2, label: '<2 M⊕' },
  { min: 2, max: 10, label: '2-10 M⊕' },
  { min: 10, max: 100, label: '10-100 M⊕' },
  { min: 100, max: 1000, label: '100-1000 M⊕' },
  { min: 1000, max: 10000, label: '>1000 M⊕' },
]

const PERIOD_BINS = [
  { min: 1, max: 10, label: '<10d' },
  { min: 10, max: 100, label: '10-100d' },
  { min: 100, max: 1000, label: '100-1000d' },
  { min: 1000, max: 10000, label: '>1000d' },
]

// Rate data: [massIndex][periodIndex] = { rate, quality }
const RATE_DATA: { rate: number | null; quality: string }[][] = [
  // <2 M⊕
  [
    { rate: 0.05, quality: 'uncertain' },
    { rate: 0.15, quality: 'uncertain' },
    { rate: null, quality: 'unknown' },
    { rate: null, quality: 'unknown' },
  ],
  // 2-10 M⊕
  [
    { rate: 0.10, quality: 'good' },
    { rate: 0.25, quality: 'good' },
    { rate: 0.20, quality: 'uncertain' },
    { rate: null, quality: 'unknown' },
  ],
  // 10-100 M⊕
  [
    { rate: 0.02, quality: 'good' },
    { rate: 0.05, quality: 'good' },
    { rate: 0.08, quality: 'moderate' },
    { rate: 0.10, quality: 'uncertain' },
  ],
  // 100-1000 M⊕
  [
    { rate: 0.01, quality: 'good' },
    { rate: 0.02, quality: 'good' },
    { rate: 0.05, quality: 'moderate' },
    { rate: 0.08, quality: 'moderate' },
  ],
  // >1000 M⊕
  [
    { rate: 0.001, quality: 'good' },
    { rate: 0.002, quality: 'good' },
    { rate: 0.01, quality: 'moderate' },
    { rate: 0.03, quality: 'uncertain' },
  ],
]

interface OccurrenceRateHeatmapProps {
  onCellClick?: (massRange: { min: number; max: number }, periodRange: { min: number; max: number }) => void
  compact?: boolean
}

export function OccurrenceRateHeatmap({ onCellClick, compact = false }: OccurrenceRateHeatmapProps) {
  const colorScale = useMemo(
    () => scaleSequentialLog(interpolateYlOrRd).domain([0.001, 0.5]),
    []
  )

  const cellSize = compact ? 40 : 56
  const labelWidth = compact ? 60 : 80
  const labelHeight = compact ? 24 : 32

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
          Occurrence Rates
        </h3>
        <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--color-text)' }}>
          Planets per star by mass and period
        </p>
      </div>

      {/* Heatmap Grid */}
      <div className="p-4 overflow-x-auto">
        <svg
          width={labelWidth + PERIOD_BINS.length * cellSize + 20}
          height={labelHeight + MASS_BINS.length * cellSize + 40}
        >
          {/* Period labels (top) */}
          <g transform={`translate(${labelWidth}, 0)`}>
            {PERIOD_BINS.map((bin, i) => (
              <text
                key={bin.label}
                x={i * cellSize + cellSize / 2}
                y={labelHeight - 8}
                textAnchor="middle"
                fontSize={compact ? 9 : 10}
                fill="var(--color-text)"
                opacity={0.7}
              >
                {bin.label}
              </text>
            ))}
          </g>

          {/* Mass labels (left) */}
          <g transform={`translate(0, ${labelHeight})`}>
            {MASS_BINS.map((bin, i) => (
              <text
                key={bin.label}
                x={labelWidth - 8}
                y={i * cellSize + cellSize / 2 + 4}
                textAnchor="end"
                fontSize={compact ? 9 : 10}
                fill="var(--color-text)"
                opacity={0.7}
              >
                {bin.label}
              </text>
            ))}
          </g>

          {/* Cells */}
          <g transform={`translate(${labelWidth}, ${labelHeight})`}>
            {MASS_BINS.map((massBin, mi) => (
              PERIOD_BINS.map((periodBin, pi) => {
                const data = RATE_DATA[mi][pi]
                const hasData = data.rate !== null

                return (
                  <motion.g
                    key={`${mi}-${pi}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (mi * PERIOD_BINS.length + pi) * 0.02 }}
                  >
                    <rect
                      x={pi * cellSize + 1}
                      y={mi * cellSize + 1}
                      width={cellSize - 2}
                      height={cellSize - 2}
                      rx={4}
                      fill={hasData ? colorScale(data.rate!) : 'rgba(255,255,255,0.05)'}
                      stroke={data.quality === 'good' ? 'transparent' : 'rgba(255,255,255,0.2)'}
                      strokeWidth={1}
                      strokeDasharray={data.quality === 'uncertain' ? '2,2' : undefined}
                      style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                      onClick={() => onCellClick?.(massBin, periodBin)}
                    />
                    <text
                      x={pi * cellSize + cellSize / 2}
                      y={mi * cellSize + cellSize / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={compact ? 9 : 11}
                      fontWeight={hasData ? 'bold' : 'normal'}
                      fill={hasData ? (data.rate! > 0.1 ? '#000' : '#fff') : 'var(--color-text)'}
                      opacity={hasData ? 1 : 0.4}
                    >
                      {hasData ? `${(data.rate! * 100).toFixed(data.rate! < 0.01 ? 1 : 0)}%` : '??'}
                    </text>
                  </motion.g>
                )
              })
            ))}
          </g>

          {/* Axis titles */}
          <text
            x={labelWidth + (PERIOD_BINS.length * cellSize) / 2}
            y={labelHeight + MASS_BINS.length * cellSize + 28}
            textAnchor="middle"
            fontSize={11}
            fill="var(--color-text)"
            opacity={0.8}
          >
            Orbital Period
          </text>
          <text
            x={12}
            y={labelHeight + (MASS_BINS.length * cellSize) / 2}
            textAnchor="middle"
            fontSize={11}
            fill="var(--color-text)"
            opacity={0.8}
            transform={`rotate(-90, 12, ${labelHeight + (MASS_BINS.length * cellSize) / 2})`}
          >
            Planet Mass
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div
        className="px-4 py-3 border-t flex items-center justify-between"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
            0.1%
          </span>
          <div className="flex h-3">
            {[0.001, 0.005, 0.02, 0.05, 0.1, 0.2, 0.5].map((v, i) => (
              <div
                key={i}
                className="w-4 h-full"
                style={{ backgroundColor: colorScale(v) }}
              />
            ))}
          </div>
          <span className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
            50%
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text)' }}>
          <span className="flex items-center gap-1">
            <span className="opacity-40">??</span>
            <span className="opacity-60">= unknown</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border border-dashed rounded" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
            <span className="opacity-60">= uncertain</span>
          </span>
        </div>
      </div>
    </div>
  )
}
