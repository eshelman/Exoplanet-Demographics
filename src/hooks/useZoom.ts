import { useEffect, useRef, useCallback, type RefObject } from 'react'
import * as d3 from 'd3'

export interface ZoomState {
  k: number // scale
  x: number // translate x
  y: number // translate y
}

export interface UseZoomOptions {
  scaleExtent?: [number, number]
  onZoom?: (state: ZoomState) => void
  enabled?: boolean
}

const defaultOptions: UseZoomOptions = {
  scaleExtent: [0.5, 20],
  enabled: true,
}

export function useZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  contentRef: RefObject<SVGGElement | null>,
  options: UseZoomOptions = {}
): {
  zoomState: ZoomState
  resetZoom: () => void
  zoomIn: () => void
  zoomOut: () => void
} {
  const { scaleExtent, onZoom, enabled } = { ...defaultOptions, ...options }
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const zoomStateRef = useRef<ZoomState>({ k: 1, x: 0, y: 0 })

  const handleZoom = useCallback(
    (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      if (!contentRef.current) return

      const { k, x, y } = event.transform
      zoomStateRef.current = { k, x, y }

      d3.select(contentRef.current).attr('transform', event.transform.toString())

      onZoom?.({ k, x, y })
    },
    [contentRef, onZoom]
  )

  useEffect(() => {
    if (!svgRef.current || !enabled) return

    const svg = d3.select(svgRef.current)

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent(scaleExtent!)
      .on('zoom', handleZoom)

    zoomRef.current = zoom
    svg.call(zoom)

    // Disable double-click zoom (can be confusing)
    svg.on('dblclick.zoom', null)

    return () => {
      svg.on('.zoom', null)
    }
  }, [svgRef, enabled, scaleExtent, handleZoom])

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
    zoomState: zoomStateRef.current,
    resetZoom,
    zoomIn,
    zoomOut,
  }
}
