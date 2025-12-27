import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// Global error handlers for uncaught errors outside React's tree

// Handle uncaught JavaScript errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[GlobalError] Uncaught error:', {
    message,
    source,
    lineno,
    colno,
    error,
  })
  // Return false to allow default browser error handling
  return false
}

// Handle unhandled Promise rejections
window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  console.error('[GlobalError] Unhandled Promise rejection:', event.reason)
  // Prevent the default handling (which would log to console again)
  // event.preventDefault()
}

// Handle errors in resource loading (images, scripts, etc.)
window.addEventListener('error', (event) => {
  if (event.target && (event.target as HTMLElement).tagName) {
    const target = event.target as HTMLElement
    console.error('[GlobalError] Resource failed to load:', {
      tagName: target.tagName,
      src: (target as HTMLImageElement).src || (target as HTMLScriptElement).src,
    })
  }
}, true) // Use capture phase to catch resource errors

// Log when the app mounts successfully
console.log('[Exoplanets] Application starting...')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // This is where you could send errors to a logging service
        console.error('[ErrorBoundary] React error caught:', error.message)
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
      }}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
