import { useRef, useMemo, useState } from 'react'
import { useDimensions } from '../../hooks/useDimensions'
import { createXScale, createYScale } from '../../utils/scales'
import { Axes } from './Axes'
import { GridLines } from './GridLines'
import { PlanetPoints } from './PlanetPoints'
import { Tooltip } from './Tooltip'
import type { Planet, XAxisType, YAxisType } from '../../types'

interface ScatterPlotProps {
  planets: Planet[]
  xAxisType?: XAxisType
  yAxisType?: YAxisType
  onPlanetSelect?: (planet: Planet) => void
}

const MARGIN = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 70,
}

export function ScatterPlot({
  planets,
  xAxisType = 'period',
  yAxisType = 'mass',
  onPlanetSelect,
}: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width, height, innerWidth, innerHeight } = useDimensions(containerRef, MARGIN)

  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  const xScale = useMemo(() => createXScale(xAxisType, innerWidth), [xAxisType, innerWidth])

  const yScale = useMemo(() => createYScale(yAxisType, innerHeight), [yAxisType, innerHeight])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handlePlanetSelect = (planet: Planet) => {
    setSelectedPlanet(planet)
    onPlanetSelect?.(planet)
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px]"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <svg
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos(null)}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines behind everything */}
          <GridLines xScale={xScale} yScale={yScale} width={innerWidth} height={innerHeight} />

          {/* Clip path for planets */}
          <defs>
            <clipPath id="plot-area">
              <rect width={innerWidth} height={innerHeight} />
            </clipPath>
          </defs>

          {/* Planet points */}
          <g clipPath="url(#plot-area)">
            <PlanetPoints
              planets={planets}
              xScale={xScale}
              yScale={yScale}
              xAxisType={xAxisType}
              yAxisType={yAxisType}
              onHover={setHoveredPlanet}
              onSelect={handlePlanetSelect}
              selectedPlanet={selectedPlanet}
            />
          </g>

          {/* Axes on top */}
          <Axes
            xScale={xScale}
            yScale={yScale}
            width={innerWidth}
            height={innerHeight}
            xAxisType={xAxisType}
            yAxisType={yAxisType}
          />
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPlanet && mousePos && (
        <Tooltip planet={hoveredPlanet} x={mousePos.x} y={mousePos.y} />
      )}
    </div>
  )
}
