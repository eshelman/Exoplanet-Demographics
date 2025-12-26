import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { formatLogTick, AXIS_LABELS } from '../../utils/formatters'
import type { XAxisType, YAxisType } from '../../types'

interface AxesProps {
  xScale: d3.ScaleLogarithmic<number, number>
  yScale: d3.ScaleLogarithmic<number, number>
  width: number
  height: number
  xAxisType: XAxisType
  yAxisType: YAxisType
}

export function Axes({ xScale, yScale, width, height, xAxisType, yAxisType }: AxesProps) {
  const xAxisRef = useRef<SVGGElement>(null)
  const yAxisRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3
        .axisBottom(xScale)
        .tickFormat((d) => formatLogTick(d as number))
        .ticks(8)

      d3.select(xAxisRef.current)
        .transition()
        .duration(300)
        .call(xAxis)
        .selectAll('text')
        .attr('fill', 'var(--color-text)')

      d3.select(xAxisRef.current).selectAll('line, path').attr('stroke', 'var(--color-text)')
    }
  }, [xScale])

  useEffect(() => {
    if (yAxisRef.current) {
      const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => formatLogTick(d as number))
        .ticks(8)

      d3.select(yAxisRef.current)
        .transition()
        .duration(300)
        .call(yAxis)
        .selectAll('text')
        .attr('fill', 'var(--color-text)')

      d3.select(yAxisRef.current).selectAll('line, path').attr('stroke', 'var(--color-text)')
    }
  }, [yScale])

  return (
    <g className="axes">
      {/* X Axis */}
      <g ref={xAxisRef} transform={`translate(0, ${height})`} />

      {/* X Axis Label */}
      <text
        x={width / 2}
        y={height + 40}
        textAnchor="middle"
        fill="var(--color-text)"
        fontSize="14"
      >
        {AXIS_LABELS[xAxisType]}
      </text>

      {/* Y Axis */}
      <g ref={yAxisRef} />

      {/* Y Axis Label */}
      <text
        transform={`translate(-45, ${height / 2}) rotate(-90)`}
        textAnchor="middle"
        fill="var(--color-text)"
        fontSize="14"
      >
        {AXIS_LABELS[yAxisType]}
      </text>
    </g>
  )
}
