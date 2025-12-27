import * as Tone from 'tone'

/**
 * BellSynth - A bell-like synthesizer with inharmonic partials
 *
 * Creates pleasant, non-grating tones suitable for repeated exposure.
 * Uses inharmonic partial ratios that create a bell/chime quality
 * rather than the harsh sound of pure harmonic overtones.
 *
 * Design principles:
 * - Fast attack, natural decay (no sustain)
 * - Higher partials decay faster than fundamental
 * - Inharmonic ratios create shimmer without harshness
 */

/**
 * Inharmonic partial ratios for bell-like timbre
 * These ratios create the characteristic "shimmer" of bells
 * without the harshness of pure harmonic overtones
 */
const BELL_PARTIAL_RATIOS = [
  { ratio: 1.0, amplitude: 1.0, decayMult: 1.0 }, // Fundamental
  { ratio: 2.4, amplitude: 0.6, decayMult: 0.7 }, // Slightly sharp "octave"
  { ratio: 4.5, amplitude: 0.4, decayMult: 0.5 }, // Shimmer partial
  { ratio: 6.8, amplitude: 0.25, decayMult: 0.3 }, // High sparkle (decays fast)
]

/**
 * Envelope presets for different use cases
 */
export const BELL_ENVELOPES = {
  /** Quick chime - for hover acknowledgment */
  chime: {
    attack: 0.01,
    decay: 0.3,
    sustain: 0,
    release: 0.5,
  },
  /** Gentle bell - for selection */
  gentle: {
    attack: 0.02,
    decay: 0.5,
    sustain: 0,
    release: 0.8,
  },
  /** Resonant - for special moments */
  resonant: {
    attack: 0.01,
    decay: 0.8,
    sustain: 0.1,
    release: 1.2,
  },
  /** Pad-like - for ambient layers */
  pad: {
    attack: 0.5,
    decay: 1.0,
    sustain: 0.3,
    release: 2.0,
  },
} as const

export type BellEnvelopeType = keyof typeof BELL_ENVELOPES

interface BellVoice {
  oscillators: Tone.Oscillator[]
  gains: Tone.Gain[]
  envelope: Tone.AmplitudeEnvelope
  frequency: number
}

/**
 * BellSynth creates bell-like tones with inharmonic partials
 * Suitable for planet chimes and selection sounds
 */
export class BellSynth {
  private outputGain: Tone.Gain
  private reverb: Tone.Reverb | null = null
  private voices: Map<number, BellVoice> = new Map()
  private maxVoices: number
  private envelopeType: BellEnvelopeType
  private initialized = false

  constructor(
    output: Tone.ToneAudioNode,
    options: {
      maxVoices?: number
      envelope?: BellEnvelopeType
      reverbWet?: number
    } = {}
  ) {
    this.maxVoices = options.maxVoices ?? 6
    this.envelopeType = options.envelope ?? 'chime'

    this.outputGain = new Tone.Gain(0.7).connect(output)
  }

  /**
   * Initialize the synth (creates reverb)
   */
  async init(): Promise<void> {
    if (this.initialized) return

    try {
      this.reverb = new Tone.Reverb({
        decay: 2.5,
        wet: 0.3,
      })
      await this.reverb.generate()
      this.reverb.connect(this.outputGain)

      this.initialized = true
    } catch (error) {
      console.error('[BellSynth] Failed to initialize:', error)
      // Fallback: connect directly without reverb
      this.initialized = true
    }
  }

  /**
   * Set the envelope type
   */
  setEnvelope(type: BellEnvelopeType): void {
    this.envelopeType = type
  }

  /**
   * Create a bell voice at the given frequency
   */
  private createVoice(frequency: number): BellVoice {
    const envelope = BELL_ENVELOPES[this.envelopeType]
    const destination = this.reverb ?? this.outputGain

    // Create envelope
    const ampEnvelope = new Tone.AmplitudeEnvelope({
      attack: envelope.attack,
      decay: envelope.decay,
      sustain: envelope.sustain,
      release: envelope.release,
    }).connect(destination)

    const oscillators: Tone.Oscillator[] = []
    const gains: Tone.Gain[] = []

    // Create partials
    for (const partial of BELL_PARTIAL_RATIOS) {
      const partialFreq = frequency * partial.ratio

      // Skip partials that would exceed our frequency ceiling
      if (partialFreq > 800) continue

      const osc = new Tone.Oscillator({
        frequency: partialFreq,
        type: 'sine',
      })

      // Each partial gets its own gain for amplitude control
      const gain = new Tone.Gain(partial.amplitude)

      osc.connect(gain)
      gain.connect(ampEnvelope)

      oscillators.push(osc)
      gains.push(gain)
    }

    return {
      oscillators,
      gains,
      envelope: ampEnvelope,
      frequency,
    }
  }

  /**
   * Trigger a bell tone at the given frequency
   */
  triggerAttack(frequency: number, time?: Tone.Unit.Time, velocity = 1): void {
    if (!this.initialized) return

    // Voice stealing if at max
    if (this.voices.size >= this.maxVoices) {
      const oldestKey = this.voices.keys().next().value
      if (oldestKey !== undefined) {
        this.releaseVoice(oldestKey)
      }
    }

    const voice = this.createVoice(frequency)

    // Apply velocity to all partial gains
    for (const gain of voice.gains) {
      gain.gain.value *= velocity
    }

    // Start oscillators
    const startTime = time ?? Tone.now()
    for (const osc of voice.oscillators) {
      osc.start(startTime)
    }

    // Trigger envelope
    voice.envelope.triggerAttack(startTime)

    this.voices.set(frequency, voice)
  }

  /**
   * Release a bell tone
   */
  triggerRelease(frequency: number, time?: Tone.Unit.Time): void {
    const voice = this.voices.get(frequency)
    if (!voice) return

    const releaseTime = time ?? Tone.now()
    voice.envelope.triggerRelease(releaseTime)

    // Schedule cleanup after release completes
    const envelope = BELL_ENVELOPES[this.envelopeType]
    const cleanupTime = (envelope.release + 0.1) * 1000

    setTimeout(() => {
      this.disposeVoice(voice)
      this.voices.delete(frequency)
    }, cleanupTime)
  }

  /**
   * Trigger attack and release (for one-shot sounds)
   */
  triggerAttackRelease(
    frequency: number,
    duration: Tone.Unit.Time,
    time?: Tone.Unit.Time,
    velocity = 1
  ): void {
    if (!this.initialized) return

    // Voice stealing if at max
    if (this.voices.size >= this.maxVoices) {
      const oldestKey = this.voices.keys().next().value
      if (oldestKey !== undefined) {
        this.releaseVoice(oldestKey)
      }
    }

    const voice = this.createVoice(frequency)

    // Apply velocity to all partial gains
    for (const gain of voice.gains) {
      gain.gain.value *= velocity
    }

    // Start oscillators
    const startTime = time ?? Tone.now()
    for (const osc of voice.oscillators) {
      osc.start(startTime)
    }

    // Trigger envelope with attack-release
    voice.envelope.triggerAttackRelease(duration, startTime)

    // Use a unique key for one-shot voices to avoid conflicts
    const voiceKey = frequency + Math.random() * 0.001
    this.voices.set(voiceKey, voice)

    // Schedule cleanup
    const durationMs = Tone.Time(duration).toMilliseconds()
    const envelope = BELL_ENVELOPES[this.envelopeType]
    const cleanupTime = durationMs + (envelope.release + 0.2) * 1000

    setTimeout(() => {
      this.disposeVoice(voice)
      this.voices.delete(voiceKey)
    }, cleanupTime)
  }

  /**
   * Release a voice by key
   */
  private releaseVoice(key: number): void {
    const voice = this.voices.get(key)
    if (!voice) return

    voice.envelope.triggerRelease()

    const envelope = BELL_ENVELOPES[this.envelopeType]
    setTimeout(() => {
      this.disposeVoice(voice)
      this.voices.delete(key)
    }, (envelope.release + 0.1) * 1000)
  }

  /**
   * Dispose of a voice's resources
   */
  private disposeVoice(voice: BellVoice): void {
    for (const osc of voice.oscillators) {
      try {
        osc.stop()
        osc.dispose()
      } catch {
        // Ignore errors during cleanup
      }
    }
    for (const gain of voice.gains) {
      try {
        gain.dispose()
      } catch {
        // Ignore errors during cleanup
      }
    }
    try {
      voice.envelope.dispose()
    } catch {
      // Ignore errors during cleanup
    }
  }

  /**
   * Release all voices
   */
  releaseAll(): void {
    for (const [key] of this.voices) {
      this.releaseVoice(key)
    }
  }

  /**
   * Set output volume
   */
  setVolume(volume: number): void {
    this.outputGain.gain.rampTo(volume, 0.1)
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.releaseAll()

    // Wait for releases to complete
    setTimeout(() => {
      this.reverb?.dispose()
      this.outputGain.dispose()
    }, 500)
  }
}

/**
 * Factory function to create envelope configurations
 * for existing Tone.js synths to match the bell-like feel
 */
export function createBellEnvelope(type: BellEnvelopeType = 'chime'): {
  attack: number
  decay: number
  sustain: number
  release: number
} {
  return { ...BELL_ENVELOPES[type] }
}

/**
 * Envelope configurations for different sound purposes
 * Use these to update existing synths for more musical sound
 */
export const MUSICAL_ENVELOPES = {
  /** Planet hover - quick acknowledgment, no sustain */
  planetHover: {
    attack: 0.05,
    decay: 0.3,
    sustain: 0,
    release: 0.4,
  },
  /** Planet select - slightly longer, still percussive */
  planetSelect: {
    attack: 0.02,
    decay: 0.4,
    sustain: 0.1,
    release: 0.6,
  },
  /** UI click - very quick */
  uiClick: {
    attack: 0.005,
    decay: 0.08,
    sustain: 0,
    release: 0.1,
  },
  /** Ambient pad - slow and evolving */
  ambientPad: {
    attack: 2.0,
    decay: 1.0,
    sustain: 0.6,
    release: 3.0,
  },
  /** Star drone - very slow, mostly sustain */
  starDrone: {
    attack: 3.0,
    decay: 2.0,
    sustain: 0.7,
    release: 4.0,
  },
  /** Orbit chime - bell-like for orbital events */
  orbitChime: {
    attack: 0.01,
    decay: 0.5,
    sustain: 0,
    release: 0.8,
  },
  /** Modal open/close - medium attack for smooth transitions */
  modalTransition: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.3,
    release: 0.5,
  },
} as const

export type MusicalEnvelopeType = keyof typeof MUSICAL_ENVELOPES
