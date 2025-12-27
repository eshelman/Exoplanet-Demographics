import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary for the solar system simulation
 * Catches rendering errors and displays a fallback UI
 */
export class SimulationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[SimulationErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-full p-8 text-center"
          style={{
            background: 'radial-gradient(ellipse at center, #0a1628 0%, #050a14 100%)',
            color: 'var(--color-text)',
          }}
        >
          <div
            className="w-16 h-16 mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold mb-2">Simulation Error</h3>
          <p className="text-sm opacity-70 mb-4 max-w-md">
            Something went wrong while rendering the orbital simulation.
            This might be due to unusual system data.
          </p>

          {this.state.error && (
            <details className="text-xs opacity-50 mb-4 max-w-md">
              <summary className="cursor-pointer hover:opacity-70">Technical details</summary>
              <pre className="mt-2 p-2 rounded bg-black/30 text-left overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#60A5FA',
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
