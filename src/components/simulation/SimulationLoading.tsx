import { memo } from 'react'
import { motion } from 'framer-motion'

interface SimulationLoadingProps {
  systemName?: string
}

/**
 * Loading state for the solar system simulation
 */
export const SimulationLoading = memo(function SimulationLoading({
  systemName,
}: SimulationLoadingProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #050a14 100%)',
        color: 'var(--color-text)',
      }}
    >
      {/* Animated star/orbit loading indicator */}
      <div className="relative w-24 h-24 mb-6">
        {/* Central "star" */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full"
          style={{
            backgroundColor: '#FDB813',
            boxShadow: '0 0 20px 4px rgba(253, 184, 19, 0.4)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Orbiting "planet" 1 */}
        <motion.div
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: '#60A5FA',
            top: '50%',
            left: '50%',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: '#60A5FA',
              transform: 'translateX(30px) translateY(-50%)',
            }}
          />
        </motion.div>

        {/* Orbiting "planet" 2 */}
        <motion.div
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: '#10B981',
            top: '50%',
            left: '50%',
          }}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: '#10B981',
              transform: 'translateX(45px) translateY(-50%)',
            }}
          />
        </motion.div>

        {/* Orbit path hints */}
        <div
          className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full border border-white/10"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full border border-white/5"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Loading text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium mb-1">Preparing Simulation</p>
        {systemName && (
          <p className="text-xs opacity-60">Loading {systemName} system...</p>
        )}
      </motion.div>

      {/* Loading dots */}
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
})
