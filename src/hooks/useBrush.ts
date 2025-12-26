import { useEffect, useRef, useCallback, type RefObject } from 'react'
import * as d3 from 'd3'
import type { BoundingBox } from '../types'

export interface UseBrushOptions {
  onBrush?: (selection: BoundingBox | null) => void
  onBrushEnd?: (selection: BoundingBox | null) => void
  enabled?: boolean
  modifierKey?: 'shift' | 'ctrl' | 'alt' | 'meta' | null
}

const defaultOptions: UseBrushOptions = {
  enabled: true,
  modifierKey: 'shift', // Require shift key to brush (allows normal pan/zoom otherwise)
}

export function useBrush(
  containerRef: RefObject<SVGGElement | null>,
  xScale: d3.ScaleLogarithmic<number, number>,
  yScale: d3.ScaleLogarithmic<number, number>,
  width: number,
  height: number,
  options: UseBrushOptions = {}
): {
  clearBrush: () => void
  selection: BoundingBox | null
} {
  const { onBrush, onBrushEnd, enabled, modifierKey } = { ...defaultOptions, ...options }
  const brushRef = useRef<d3.BrushBehavior<unknown> | null>(null)
  const selectionRef = useRef<BoundingBox | null>(null)
  const brushGroupRef = useRef<SVGGElement | null>(null)

  const pixelToData = useCallback(
    (pixelSelection: [[number, number], [number, number]]): BoundingBox => {
      const [[x0, y0], [x1, y1]] = pixelSelection
      return {
        x: {
          min: xScale.invert(x0),
          max: xScale.invert(x1),
        },
        y: {
          min: yScale.invert(y1), // y is inverted in SVG
          max: yScale.invert(y0),
        },
      }
    },
    [xScale, yScale]
  )

  useEffect(() => {
    if (!containerRef.current || !enabled) return

    // Create brush group if it doesn't exist
    const container = d3.select(containerRef.current)
    let brushGroup = container.select<SVGGElement>('.brush-group')

    if (brushGroup.empty()) {
      brushGroup = container.append('g').attr('class', 'brush-group')
    }
    brushGroupRef.current = brushGroup.node()

    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .filter((event: MouseEvent) => {
        // Only allow brush when modifier key is pressed (if specified)
        if (modifierKey === null) return true
        switch (modifierKey) {
          case 'shift':
            return event.shiftKey
          case 'ctrl':
            return event.ctrlKey
          case 'alt':
            return event.altKey
          case 'meta':
            return event.metaKey
          default:
            return true
        }
      })
      .on('brush', (event: d3.D3BrushEvent<unknown>) => {
        if (!event.selection) {
          selectionRef.current = null
          onBrush?.(null)
          return
        }
        const dataSelection = pixelToData(event.selection as [[number, number], [number, number]])
        selectionRef.current = dataSelection
        onBrush?.(dataSelection)
      })
      .on('end', (event: d3.D3BrushEvent<unknown>) => {
        if (!event.selection) {
          selectionRef.current = null
          onBrushEnd?.(null)
          return
        }
        const dataSelection = pixelToData(event.selection as [[number, number], [number, number]])
        selectionRef.current = dataSelection
        onBrushEnd?.(dataSelection)
      })

    brushRef.current = brush
    brushGroup.call(brush)

    // Style the brush
    brushGroup.selectAll('.selection').attr('fill', 'var(--color-accent)').attr('fill-opacity', 0.2)

    brushGroup.selectAll('.handle').attr('fill', 'var(--color-accent)').attr('fill-opacity', 0.5)

    return () => {
      brushGroup.remove()
    }
  }, [containerRef, enabled, width, height, modifierKey, onBrush, onBrushEnd, pixelToData])

  const clearBrush = useCallback(() => {
    if (brushGroupRef.current && brushRef.current) {
      d3.select(brushGroupRef.current).call(brushRef.current.clear)
      selectionRef.current = null
    }
  }, [])

  return {
    clearBrush,
    selection: selectionRef.current,
  }
}
