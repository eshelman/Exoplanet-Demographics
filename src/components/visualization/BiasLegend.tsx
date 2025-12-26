import { motion } from 'framer-motion'
import type { DetectionMethodId } from '../../types'
import { METHOD_COLORS } from '../../utils/scales'

const METHOD_NAMES: Partial<Record<DetectionMethodId, string>> = {
  'radial-velocity': 'Radial Velocity',
  'transit-kepler': 'Transit (Kepler)',
  'transit-other': 'Transit (Other)',
  microlensing: 'Microlensing',
  'direct-imaging': 'Direct Imaging',
  astrometry: 'Astrometry',
}

const NOTABLE_REGIONS = [
  { id: 'hot-neptune-desert', name: 'Hot Neptune Desert', color: '#FF6B6B' },
  { id: 'brown-dwarf-desert', name: 'Brown Dwarf Desert', color: '#FFE66D' },
]

interface BiasLegendProps {
  enabledMethods: Set<DetectionMethodId>
}

export function BiasLegend({ enabledMethods }: BiasLegendProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="absolute top-4 right-4 p-3 rounded text-xs"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'var(--color-text)',
        maxWidth: '200px',
      }}
    >
      <div className="font-semibold mb-2 opacity-80">Detection Biases</div>

      {/* Method sensitivity regions */}
      <div className="space-y-1 mb-3">
        <div className="opacity-60 text-[10px] uppercase tracking-wide">Sensitivity Regions</div>
        {Array.from(enabledMethods)
          .filter((methodId) => METHOD_NAMES[methodId])
          .map((methodId) => (
            <div key={methodId} className="flex items-center gap-2">
              <div
                className="w-4 h-3 border"
                style={{
                  backgroundColor: `${METHOD_COLORS[methodId]}20`,
                  borderColor: `${METHOD_COLORS[methodId]}60`,
                  borderStyle: 'dashed',
                }}
              />
              <span style={{ color: METHOD_COLORS[methodId] }}>{METHOD_NAMES[methodId]}</span>
            </div>
          ))}
      </div>

      {/* Notable regions */}
      <div className="space-y-1 mb-3">
        <div className="opacity-60 text-[10px] uppercase tracking-wide">Population Gaps</div>
        {NOTABLE_REGIONS.map((region) => (
          <div key={region.id} className="flex items-center gap-2">
            <div
              className="w-4 h-3 border-2"
              style={{
                backgroundColor: `${region.color}30`,
                borderColor: region.color,
              }}
            />
            <span style={{ color: region.color }}>{region.name}</span>
          </div>
        ))}
      </div>

      {/* Blind spots */}
      <div className="space-y-1">
        <div className="opacity-60 text-[10px] uppercase tracking-wide">Blind Spots</div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-3"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.2) 2px,
                rgba(255,255,255,0.2) 4px
              )`,
            }}
          />
          <span className="opacity-70">Hard to detect</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-white/10 opacity-50 text-[10px]">
        Dashed regions show where each method is most sensitive
      </div>
    </motion.div>
  )
}
