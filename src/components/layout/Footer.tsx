export function Footer() {
  return (
    <footer
      className="px-6 py-3 border-t"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: 'var(--color-text)',
      }}
    >
      <div className="flex items-center justify-between text-xs">
        {/* Left: Data Sources */}
        <div className="flex items-center gap-4 opacity-60">
          <span>
            Data:{' '}
            <a
              href="https://exoplanetarchive.ipac.caltech.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              NASA Exoplanet Archive
            </a>
          </span>
          <span className="opacity-40">|</span>
          <span>
            Based on{' '}
            <a
              href="https://arxiv.org/abs/2011.04703"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              The Demographics of Exoplanets
            </a>{' '}
            (Gaudi, Christiansen & Meyer 2020)
          </span>
        </div>

        {/* Center: Credits */}
        <div className="flex items-center gap-4 opacity-60">
          <span>
            Visualization by{' '}
            <span style={{ color: 'var(--color-accent)', opacity: 1 }}>NVIDIA</span>
          </span>
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://exoplanetarchive.ipac.caltech.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>Exoplanet Archive</span>
          </a>
          <a
            href="https://arxiv.org/abs/2011.04703"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Paper</span>
          </a>
          <span className="opacity-40 text-xs">Click a planet to view details</span>
        </div>
      </div>
    </footer>
  )
}
