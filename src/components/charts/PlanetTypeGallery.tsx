import { motion } from 'framer-motion'
import { PlanetIcon } from '../info/PlanetIcon'
import { PLANET_TYPE_COLORS } from '../../utils/scales'

// Planet type data from planet-types.json
const PLANET_TYPES = [
  {
    id: 'rocky',
    name: 'Rocky',
    massRange: '0.1-2 M⊕',
    radiusRange: '0.5-1.5 R⊕',
    occurrence: '~15%',
    context: 'in habitable zone',
    description: 'Earth-like worlds with solid surfaces',
    examples: ['Earth', 'Mars', 'Kepler-452b'],
  },
  {
    id: 'super-earth',
    name: 'Super-Earth',
    massRange: '2-10 M⊕',
    radiusRange: '1.25-2 R⊕',
    occurrence: '~30%',
    context: 'P < 100 days',
    description: 'Larger rocky planets, no Solar System analog',
    examples: ['Kepler-10b', '55 Cancri e'],
  },
  {
    id: 'sub-neptune',
    name: 'Sub-Neptune',
    massRange: '2-20 M⊕',
    radiusRange: '2-4 R⊕',
    occurrence: '~35%',
    context: 'P < 100 days',
    description: 'Most common planet type in the galaxy',
    examples: ['K2-18b', 'GJ 1214b'],
  },
  {
    id: 'neptune-like',
    name: 'Neptune-like',
    massRange: '10-50 M⊕',
    radiusRange: '3.5-6 R⊕',
    occurrence: '~6%',
    context: 'at 1-10 AU',
    description: 'Ice giants with deep atmospheres',
    examples: ['Neptune', 'HAT-P-11b'],
  },
  {
    id: 'hot-jupiter',
    name: 'Hot Jupiter',
    massRange: '100-4000 M⊕',
    radiusRange: '9-20 R⊕',
    occurrence: '~1%',
    context: 'P < 10 days',
    description: 'Gas giants scorched by their stars',
    examples: ['51 Peg b', 'HD 209458b'],
  },
  {
    id: 'cold-jupiter',
    name: 'Cold Jupiter',
    massRange: '100-4000 M⊕',
    radiusRange: '9-12 R⊕',
    occurrence: '~10%',
    context: 'at 1-10 AU',
    description: 'Jupiter analogs at comfortable distances',
    examples: ['Jupiter', '47 UMa b'],
  },
]

interface PlanetTypeGalleryProps {
  onTypeClick?: (typeId: string) => void
  selectedType?: string | null
  compact?: boolean
}

export function PlanetTypeGallery({ onTypeClick, selectedType, compact = false }: PlanetTypeGalleryProps) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--color-background)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          Planet Types
        </h3>
        <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--color-text)' }}>
          Click to filter the main plot
        </p>
      </div>

      {/* Gallery Grid */}
      <div className={`p-3 grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {PLANET_TYPES.map((type, i) => {
          const isSelected = selectedType === type.id
          const color = PLANET_TYPE_COLORS[type.id] || '#888'

          return (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onTypeClick?.(type.id)}
              className="p-3 rounded-lg text-left transition-all"
              style={{
                backgroundColor: isSelected ? `${color}30` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <div className="flex items-start gap-2">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <PlanetIcon type={type.id} size={compact ? 28 : 36} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium text-xs truncate"
                    style={{ color: isSelected ? color : 'var(--color-text)' }}
                  >
                    {type.name}
                  </div>

                  {/* Occurrence badge */}
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className="text-xs font-bold"
                      style={{ color }}
                    >
                      {type.occurrence}
                    </span>
                    {!compact && (
                      <span
                        className="text-[9px] opacity-50"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {type.context}
                      </span>
                    )}
                  </div>

                  {/* Size info */}
                  {!compact && (
                    <div
                      className="text-[10px] mt-1 opacity-60"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {type.radiusRange}
                    </div>
                  )}
                </div>
              </div>

              {/* Description (expanded view only) */}
              {!compact && (
                <p
                  className="text-[10px] mt-2 leading-relaxed opacity-60 line-clamp-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {type.description}
                </p>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Size Comparison Footer */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="text-xs opacity-50 mb-2" style={{ color: 'var(--color-text)' }}>
          Size comparison
        </div>
        <div className="flex items-end gap-1 h-10">
          {/* Rocky */}
          <div className="flex flex-col items-center">
            <div
              className="rounded-full"
              style={{ width: 8, height: 8, backgroundColor: PLANET_TYPE_COLORS.rocky }}
            />
            <span className="text-[8px] mt-0.5 opacity-50" style={{ color: 'var(--color-text)' }}>
              R
            </span>
          </div>
          {/* Super-Earth */}
          <div className="flex flex-col items-center">
            <div
              className="rounded-full"
              style={{ width: 12, height: 12, backgroundColor: PLANET_TYPE_COLORS['super-earth'] }}
            />
            <span className="text-[8px] mt-0.5 opacity-50" style={{ color: 'var(--color-text)' }}>
              SE
            </span>
          </div>
          {/* Sub-Neptune */}
          <div className="flex flex-col items-center">
            <div
              className="rounded-full"
              style={{ width: 20, height: 20, backgroundColor: PLANET_TYPE_COLORS['sub-neptune'] }}
            />
            <span className="text-[8px] mt-0.5 opacity-50" style={{ color: 'var(--color-text)' }}>
              SN
            </span>
          </div>
          {/* Neptune */}
          <div className="flex flex-col items-center">
            <div
              className="rounded-full"
              style={{ width: 28, height: 28, backgroundColor: PLANET_TYPE_COLORS['neptune-like'] }}
            />
            <span className="text-[8px] mt-0.5 opacity-50" style={{ color: 'var(--color-text)' }}>
              N
            </span>
          </div>
          {/* Jupiter */}
          <div className="flex flex-col items-center">
            <div
              className="rounded-full"
              style={{ width: 40, height: 40, backgroundColor: PLANET_TYPE_COLORS['cold-jupiter'] }}
            />
            <span className="text-[8px] mt-0.5 opacity-50" style={{ color: 'var(--color-text)' }}>
              J
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
