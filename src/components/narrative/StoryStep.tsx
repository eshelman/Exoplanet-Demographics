import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { NarrativeStepContent } from './narrativeContent'

interface StoryStepProps {
  step: NarrativeStepContent
  stepNumber: number
  totalSteps: number
}

export function StoryStep({ step, stepNumber, totalSteps }: StoryStepProps) {
  const [showLearnMore, setShowLearnMore] = useState(false)

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg"
    >
      {/* Step indicator */}
      <div
        className="text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-accent)', opacity: 0.8 }}
      >
        Step {stepNumber} of {totalSteps}
      </div>

      {/* Title */}
      <h2
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--color-text)' }}
      >
        {step.title}
      </h2>

      {/* Subtitle */}
      {step.subtitle && (
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-accent)' }}
        >
          {step.subtitle}
        </p>
      )}

      {/* Main content */}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: 'var(--color-text)', opacity: 0.9 }}
      >
        {step.content}
      </p>

      {/* Learn More toggle */}
      {step.learnMore && (
        <div>
          <button
            onClick={() => setShowLearnMore(!showLearnMore)}
            className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-accent)' }}
          >
            <span>{showLearnMore ? 'Show less' : 'Learn more'}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: showLearnMore ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <AnimatePresence>
            {showLearnMore && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p
                  className="text-xs leading-relaxed mt-3 pl-3"
                  style={{
                    color: 'var(--color-text)',
                    opacity: 0.7,
                    borderLeft: '2px solid var(--color-accent)',
                  }}
                >
                  {step.learnMore}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
