import { motion } from 'framer-motion'
import type { NarrativeStepContent } from './narrativeContent'

interface StoryStepProps {
  step: NarrativeStepContent
  stepNumber: number
  totalSteps: number
}

export function StoryStep({ step, stepNumber, totalSteps }: StoryStepProps) {
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

      {/* Learn More */}
      {step.learnMore && (
        <div className="mt-4">
          <hr
            className="mb-4"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
          />
          <p
            className="text-xs leading-relaxed opacity-70"
            style={{ color: 'var(--color-text)' }}
          >
            {step.learnMore}
          </p>
        </div>
      )}
    </motion.div>
  )
}
