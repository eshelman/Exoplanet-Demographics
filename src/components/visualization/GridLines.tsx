import * as d3 from 'd3'

interface GridLinesProps {
  xScale: d3.ScaleLogarithmic<number, number>
  yScale: d3.ScaleLogarithmic<number, number>
  width: number
  height: number
}

export function GridLines({ xScale, yScale, width, height }: GridLinesProps) {
  const xTicks = xScale.ticks(8)
  const yTicks = yScale.ticks(8)

  return (
    <g className="grid-lines" opacity={0.15}>
      {/* Vertical grid lines */}
      {xTicks.map((tick) => (
        <line
          key={`x-${tick}`}
          x1={xScale(tick)}
          x2={xScale(tick)}
          y1={0}
          y2={height}
          stroke="var(--color-text)"
          strokeDasharray="2,4"
        />
      ))}

      {/* Horizontal grid lines */}
      {yTicks.map((tick) => (
        <line
          key={`y-${tick}`}
          x1={0}
          x2={width}
          y1={yScale(tick)}
          y2={yScale(tick)}
          stroke="var(--color-text)"
          strokeDasharray="2,4"
        />
      ))}
    </g>
  )
}
