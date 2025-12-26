import { useRef, useEffect, type RefObject } from 'react'
import * as d3 from 'd3'

type D3Selection = d3.Selection<SVGSVGElement, unknown, null, undefined>

export function useD3<T>(
  renderFn: (selection: D3Selection, data: T) => void,
  data: T,
  dependencies: React.DependencyList = []
): RefObject<SVGSVGElement | null> {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (ref.current) {
      const selection = d3.select(ref.current)
      renderFn(selection, data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ...dependencies])

  return ref
}
