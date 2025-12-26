import { useState, useEffect, useCallback, type RefObject } from 'react'

export interface Dimensions {
  width: number
  height: number
}

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartDimensions extends Dimensions {
  margin: Margin
  innerWidth: number
  innerHeight: number
}

const defaultMargin: Margin = {
  top: 20,
  right: 30,
  bottom: 50,
  left: 60,
}

export function useDimensions(
  containerRef: RefObject<HTMLElement | null>,
  margin: Margin = defaultMargin
): ChartDimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 800,
    height: 600,
  })

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height })
    }
  }, [containerRef])

  useEffect(() => {
    updateDimensions()

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, updateDimensions])

  return {
    ...dimensions,
    margin,
    innerWidth: Math.max(0, dimensions.width - margin.left - margin.right),
    innerHeight: Math.max(0, dimensions.height - margin.top - margin.bottom),
  }
}
