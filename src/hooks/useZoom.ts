import { useEffect, useRef, useCallback, useState, type RefObject } from 'react'
import * as d3 from 'd3'

export interface ZoomTransform {
  k: number // scale
  x: number // translate x
  y: number // translate y
}

export interface ZoomRegion {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
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
  zoomToRegion: (
    region: ZoomRegion,
    xScale: d3.ScaleLogarithmic<number, number>,
    yScale: d3.ScaleLogarithmic<number, number>,
    width: number,
    height: number
  ) => void
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

  const zoomToRegion = useCallback(
    (
      region: ZoomRegion,
      xScale: d3.ScaleLogarithmic<number, number>,
      yScale: d3.ScaleLogarithmic<number, number>,
      width: number,
      height: number
    ) => {
      if (!svgRef.current || !zoomRef.current) return

      // Convert data coordinates to pixel coordinates using the base scales
      const x0 = xScale(region.xMin)
      const x1 = xScale(region.xMax)
      const y0 = yScale(region.yMax) // Note: yScale is inverted (larger values at top)
      const y1 = yScale(region.yMin)

      // Calculate the zoom transform to fit this region
      const regionWidth = Math.abs(x1 - x0)
      const regionHeight = Math.abs(y1 - y0)

      // Calculate scale to fit the region (with some padding)
      const padding = 0.9 // Use 90% of available space
      const scaleX = (width * padding) / regionWidth
      const scaleY = (height * padding) / regionHeight
      const k = Math.min(scaleX, scaleY, scaleExtent![1]) // Don't exceed max zoom

      // Calculate center of the region
      const centerX = (x0 + x1) / 2
      const centerY = (y0 + y1) / 2

      // Calculate translation to center the region
      const tx = width / 2 - centerX * k
      const ty = height / 2 - centerY * k

      // Apply the transform
      const newTransform = d3.zoomIdentity.translate(tx, ty).scale(k)

      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, newTransform)
    },
    [svgRef, scaleExtent]
  )

  return {
    transform,
    resetZoom,
    zoomIn,
    zoomOut,
    zoomToRegion,
  }
}
