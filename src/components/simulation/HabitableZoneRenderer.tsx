import { memo } from 'react'
import type { HabitableZone } from '../../types/simulation'

interface HabitableZoneRendererProps {
  habitableZone: HabitableZone
  cx: number // Center x in pixels
  cy: number // Center y in pixels
  scale: number // Pixels per AU
  visible: boolean
}

export const HabitableZoneRenderer = memo(function HabitableZoneRenderer({
  habitableZone,
  cx,
  cy,
  scale,
  visible,
}: HabitableZoneRendererProps) {
  if (!visible) return null

  const innerRadius = habitableZone.innerEdge * scale
  const outerRadius = habitableZone.outerEdge * scale
  const gradientId = 'habitable-zone-gradient'

  return (
    <g className="habitable-zone" opacity={0.3}>
      <defs>
        <radialGradient id={gradientId}>
          {/* Inner edge: warmer green */}
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0" />
          <stop offset={`${(innerRadius / outerRadius) * 100}%`} stopColor="#22C55E" stopOpacity="0.4" />
          {/* Middle: green */}
          <stop offset={`${((innerRadius + outerRadius) / 2 / outerRadius) * 100}%`} stopColor="#16A34A" stopOpacity="0.3" />
          {/* Outer edge: cooler green */}
          <stop offset="100%" stopColor="#15803D" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Outer boundary */}
      <circle
        cx={cx}
        cy={cy}
        r={outerRadius}
        fill={`url(#${gradientId})`}
        stroke="#22C55E"
        strokeWidth="1"
        strokeOpacity="0.3"
        strokeDasharray="4 2"
      />

      {/* Inner boundary (cutout effect via mask) */}
      <circle
        cx={cx}
        cy={cy}
        r={innerRadius}
        fill="var(--color-background, #0a0f1c)"
        stroke="#22C55E"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeDasharray="4 2"
      />

      {/* Label */}
      <text
        x={cx + outerRadius + 10}
        y={cy}
        fill="#22C55E"
        fontSize="10"
        opacity="0.7"
        dominantBaseline="middle"
      >
        HZ
      </text>
    </g>
  )
})
