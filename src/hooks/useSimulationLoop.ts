import { useRef, useEffect, useCallback } from 'react'

interface SimulationLoopOptions {
  speed: number // Simulation speed multiplier (0.5, 1, 2, 5, 10)
  isPaused: boolean
  onTick: (simulationTime: number, deltaTime: number) => void
}

/**
 * Custom hook for managing the orbital simulation animation loop
 * Uses requestAnimationFrame for smooth 60fps animation
 *
 * Time scale: 1 real second = 1 simulated day (at speed=1)
 */
export function useSimulationLoop({ speed, isPaused, onTick }: SimulationLoopOptions) {
  const simulationTimeRef = useRef(0)
  const lastFrameTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const tick = useCallback(
    (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp
      }

      // Calculate real time delta in seconds
      const realDeltaSeconds = (timestamp - lastFrameTimeRef.current) / 1000
      lastFrameTimeRef.current = timestamp

      // Convert to simulation time delta (1 second = 1 day at speed=1)
      const simDeltaDays = realDeltaSeconds * speed

      // Update simulation time
      simulationTimeRef.current += simDeltaDays

      // Call the tick handler with current simulation time
      onTick(simulationTimeRef.current, simDeltaDays)

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(tick)
    },
    [speed, onTick]
  )

  useEffect(() => {
    if (isPaused) {
      // Stop the animation loop
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastFrameTimeRef.current = null
    } else {
      // Start the animation loop
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPaused, tick])

  // Return controls for the simulation
  const reset = useCallback(() => {
    simulationTimeRef.current = 0
    lastFrameTimeRef.current = null
  }, [])

  const setTime = useCallback((time: number) => {
    simulationTimeRef.current = time
  }, [])

  const getTime = useCallback(() => simulationTimeRef.current, [])

  return { reset, setTime, getTime }
}
