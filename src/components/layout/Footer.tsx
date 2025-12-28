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
            <a
              href="https://github.com/eshelman"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)', opacity: 1 }}
              className="hover:underline"
            >
              Eliot Eshelman
            </a>
          </span>
        </div>

      </div>
    </footer>
  )
}
