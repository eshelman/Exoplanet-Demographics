import { useEffect, useRef, useCallback, useState, type RefObject } from 'react'
import * as d3 from 'd3'

export interface ZoomTransform {
  k: number // scale
  x: number // translate x
  y: number // translate y
}

export interface UseZoomOptions {
  scaleExtent?: [number, number]
  onZoomStart?: () => void
  onZoomEnd?: () => void
  enabled?: boolean
}

const defaultOptions: UseZoomOptions = {
  scaleExtent: [0.5, 20],
  enabled: true,
}

export function useZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  options: UseZoomOptions = {}
): {
  transform: d3.ZoomTransform
  resetZoom: () => void
  zoomIn: () => void
  zoomOut: () => void
} {
  const { scaleExtent, onZoomStart, onZoomEnd, enabled } = { ...defaultOptions, ...options }
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity)

  const handleZoom = useCallback(
    (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      setTransform(event.transform)
    },
    []
  )

  useEffect(() => {
    if (!svgRef.current || !enabled) return

    const svg = d3.select(svgRef.current)

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent(scaleExtent!)
      .on('start', () => onZoomStart?.())
      .on('zoom', handleZoom)
      .on('end', () => onZoomEnd?.())

    zoomRef.current = zoom
    svg.call(zoom)

    // Disable double-click zoom (can be confusing)
    svg.on('dblclick.zoom', null)

    return () => {
      svg.on('.zoom', null)
    }
  }, [svgRef, enabled, scaleExtent, handleZoom, onZoomStart, onZoomEnd])

  const resetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return

    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.transform, d3.zoomIdentity)
  }, [svgRef])

  const zoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return

    d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1.5)
  }, [svgRef])

  const zoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return

    d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 0.67)
  }, [svgRef])

  return {
    transform,
    resetZoom,
    zoomIn,
    zoomOut,
  }
}
