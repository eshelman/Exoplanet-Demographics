import { useAudio } from '../../audio'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const { playZoomIn, playZoomOut, playClick } = useAudio()

  const buttonStyle = {
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    border: '1px solid rgba(255,255,255,0.2)',
  }

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1">
      <button
        onClick={() => {
          onZoomIn()
          playZoomIn()
        }}
        className="w-8 h-8 rounded flex items-center justify-center text-lg hover:opacity-80 transition-opacity"
        style={buttonStyle}
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => {
          onZoomOut()
          playZoomOut()
        }}
        className="w-8 h-8 rounded flex items-center justify-center text-lg hover:opacity-80 transition-opacity"
        style={buttonStyle}
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={() => {
          onReset()
          playClick()
        }}
        className="w-8 h-8 rounded flex items-center justify-center text-xs hover:opacity-80 transition-opacity mt-1"
        style={buttonStyle}
        title="Reset view"
      >
        ⟲
      </button>
    </div>
  )
}
