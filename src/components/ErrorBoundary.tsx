import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Root-level error boundary for catching React rendering errors.
 * Provides a full-page fallback UI when the app crashes.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Application error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    this.props.onError?.(error, errorInfo)
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-8"
          style={{
            background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
            color: '#e5e5e5',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Cosmic background decoration */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ opacity: 0.3 }}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  backgroundColor: '#fff',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.8 + 0.2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-lg text-center">
            {/* Error icon */}
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-3" style={{ color: '#f5f5f5' }}>
              Houston, We Have a Problem
            </h1>

            <p className="text-base mb-6" style={{ color: '#a0a0a0' }}>
              Something unexpected happened while exploring the cosmos.
              The visualization encountered an error and needs to restart.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                style={{
                  background: 'transparent',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  cursor: 'pointer',
                }}
              >
                Try to Recover
              </button>
            </div>

            {/* Error details (collapsible) */}
            {this.state.error && (
              <details className="text-left">
                <summary
                  className="cursor-pointer text-sm mb-2 hover:opacity-80"
                  style={{ color: '#888' }}
                >
                  Technical Details
                </summary>
                <div
                  className="p-4 rounded-lg text-xs overflow-auto max-h-48"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="mb-2">
                    <strong style={{ color: '#EF4444' }}>Error:</strong>{' '}
                    <span style={{ color: '#e5e5e5' }}>{this.state.error.message}</span>
                  </div>
                  {this.state.error.stack && (
                    <pre
                      className="whitespace-pre-wrap break-words"
                      style={{ color: '#888', fontSize: '10px' }}
                    >
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Lightweight error boundary for specific sections.
 * Shows inline error without crashing the whole page.
 */
export class SectionErrorBoundary extends Component<
  { children: ReactNode; section?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; section?: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[${this.props.section || 'Section'}Error]`, error, errorInfo.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center p-6 rounded-lg m-4"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#e5e5e5',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            className="mb-2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm">
            {this.props.section ? `${this.props.section} failed to load` : 'This section encountered an error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-xs px-3 py-1 rounded"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#60A5FA',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
