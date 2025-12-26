import { useRef, useMemo, useCallback } from 'react'
import { useDimensions } from '../../hooks/useDimensions'
import { useZoom } from '../../hooks/useZoom'
import { useBrush } from '../../hooks/useBrush'
import { useVizStore, selectVisiblePlanets } from '../../store'
import { createXScale, createYScale } from '../../utils/scales'
import { Axes } from './Axes'
import { GridLines } from './GridLines'
import { PlanetPoints } from './PlanetPoints'
import { Tooltip } from './Tooltip'
import { ZoomControls } from './ZoomControls'
import type { Planet, BoundingBox } from '../../types'

interface ScatterPlotProps {
  planets: Planet[]
}

const MARGIN = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 70,
}

export function ScatterPlot({ planets }: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const contentRef = useRef<SVGGElement>(null)
  const brushContainerRef = useRef<SVGGElement>(null)

  const { width, height, innerWidth, innerHeight } = useDimensions(containerRef, MARGIN)

  // Get state from store
  const xAxis = useVizStore((s) => s.xAxis)
  const yAxis = useVizStore((s) => s.yAxis)
  const hoveredPlanet = useVizStore((s) => s.hoveredPlanet)
  const selectedPlanet = useVizStore((s) => s.selectedPlanet)
  const brushSelection = useVizStore((s) => s.brushSelection)

  // Get actions from store
  const setHoveredPlanet = useVizStore((s) => s.setHoveredPlanet)
  const selectPlanet = useVizStore((s) => s.selectPlanet)
  const setBrushSelection = useVizStore((s) => s.setBrushSelection)

  // Filter planets based on store state
  const visiblePlanets = useMemo(() => selectVisiblePlanets(planets), [planets])

  // Mouse position for tooltip (local state is fine for this)
  const mousePos = useRef<{ x: number; y: number } | null>(null)

  const xScale = useMemo(() => createXScale(xAxis, innerWidth), [xAxis, innerWidth])
  const yScale = useMemo(() => createYScale(yAxis, innerHeight), [yAxis, innerHeight])

  // Zoom behavior
  const { resetZoom, zoomIn, zoomOut } = useZoom(svgRef, contentRef, {
    scaleExtent: [0.5, 20],
  })

  // Brush behavior (hold Shift to brush)
  const handleBrushEnd = useCallback(
    (selection: BoundingBox | null) => {
      setBrushSelection(selection)
    },
    [setBrushSelection]
  )

  const { clearBrush } = useBrush(brushContainerRef, xScale, yScale, innerWidth, innerHeight, {
    onBrushEnd: handleBrushEnd,
    modifierKey: 'shift',
  })

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleClearSelection = () => {
    clearBrush()
    setBrushSelection(null)
  }

  // Count planets in brush selection
  const selectedCount = useMemo(() => {
    if (!brushSelection) return 0
    return visiblePlanets.filter((p) => {
      const x = xAxis === 'period' ? p.period : p.separation
      const y = yAxis === 'mass' ? p.mass : p.radius
      if (x === undefined || y === undefined) return false
      return (
        x >= brushSelection.x.min &&
        x <= brushSelection.x.max &&
        y >= brushSelection.y.min &&
        y <= brushSelection.y.max
      )
    }).length
  }, [brushSelection, visiblePlanets, xAxis, yAxis])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px]"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPlanet(null)}
        style={{ cursor: 'grab' }}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Zoomable/pannable content group */}
          <g ref={contentRef}>
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
                planets={visiblePlanets}
                xScale={xScale}
                yScale={yScale}
                xAxisType={xAxis}
                yAxisType={yAxis}
                onHover={setHoveredPlanet}
                onSelect={selectPlanet}
                selectedPlanet={selectedPlanet}
              />
            </g>

            {/* Brush container (inside zoomable group) */}
            <g ref={brushContainerRef} clipPath="url(#plot-area)" />
          </g>

          {/* Axes outside zoom group so they stay fixed */}
          <Axes
            xScale={xScale}
            yScale={yScale}
            width={innerWidth}
            height={innerHeight}
            xAxisType={xAxis}
            yAxisType={yAxis}
          />
        </g>
      </svg>

      {/* Zoom Controls */}
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />

      {/* Brush Selection Info */}
      {brushSelection && (
        <div
          className="absolute top-4 left-4 px-3 py-2 rounded text-sm"
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-accent)',
            color: 'var(--color-text)',
          }}
        >
          <div className="flex items-center gap-3">
            <span>
              <strong>{selectedCount}</strong> planets selected
            </span>
            <button
              onClick={handleClearSelection}
              className="px-2 py-0.5 rounded text-xs hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-background)',
              }}
            >
              Clear
            </button>
          </div>
          <div className="text-xs opacity-60 mt-1">Hold Shift + drag to select</div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredPlanet && mousePos.current && (
        <Tooltip planet={hoveredPlanet} x={mousePos.current.x} y={mousePos.current.y} />
      )}

      {/* Instructions hint */}
      {!brushSelection && (
        <div
          className="absolute bottom-4 left-4 text-xs opacity-50"
          style={{ color: 'var(--color-text)' }}
        >
          Drag to pan • Scroll to zoom • Shift+drag to select
        </div>
      )}
    </div>
  )
}
