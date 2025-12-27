import * as Tone from 'tone'
import type { Planet } from '../types'
import {
  periodToMusicalNote,
  getConsonantInterval,
  MAX_SUSTAINED_FREQUENCY,
} from './musicalScales'

/**
 * Sonification complexity levels
 */
export type SonificationComplexity = 'simple' | 'standard' | 'rich'

/**
 * Solar System planet sound configurations
 */
const SOLAR_SYSTEM_SOUNDS: Record<string, {
  frequency: number
  oscillatorType: OscillatorType
  attack: number
  decay: number
  sustain: number
  release: number
  effects?: 'chorus' | 'vibrato' | 'distortion'
  description: string
}> = {
  Mercury: {
    frequency: 784, // G5 - highest allowed in pentatonic scale (was 880, capped for comfort)
    oscillatorType: 'triangle',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.1,
    release: 0.3,
    description: 'Quick high ping',
  },
  Venus: {
    frequency: 220,
    oscillatorType: 'sawtooth',
    attack: 0.5,
    decay: 0.3,
    sustain: 0.7,
    release: 1,
    effects: 'chorus',
    description: 'Thick hazy drone',
  },
  Earth: {
    frequency: 136.1, // "Om" frequency - Earth year
    oscillatorType: 'sine',
    attack: 0.3,
    decay: 0.2,
    sustain: 0.8,
    release: 0.5,
    description: 'Warm home frequency',
  },
  Mars: {
    frequency: 290,
    oscillatorType: 'triangle',
    attack: 0.1,
    decay: 0.2,
    sustain: 0.3,
    release: 0.8,
    description: 'Dusty thin whistle',
  },
  Jupiter: {
    frequency: 55, // Deep A
    oscillatorType: 'sawtooth',
    attack: 0.4,
    decay: 0.3,
    sustain: 0.6,
    release: 1.5,
    description: 'Deep brass-like tone',
  },
  Saturn: {
    frequency: 73.4,
    oscillatorType: 'sine',
    attack: 0.5,
    decay: 0.4,
    sustain: 0.5,
    release: 2,
    effects: 'chorus',
    description: 'Shimmering chorus effect',
  },
  Uranus: {
    frequency: 110,
    oscillatorType: 'square',
    attack: 0.3,
    decay: 0.5,
    sustain: 0.4,
    release: 1.5,
    effects: 'vibrato',
    description: 'Cold, tilted, unsettling',
  },
  Neptune: {
    frequency: 82.4, // Low E
    oscillatorType: 'sine',
    attack: 0.8,
    decay: 0.5,
    sustain: 0.6,
    release: 2.5,
    description: 'Deep blue, melancholic',
  },
}

/**
 * PlanetSonification - Handles all planet-related audio
 */
export class PlanetSonification {
  private initialized = false
  private complexity: SonificationComplexity = 'standard'

  // Output node
  private outputGain: Tone.Gain | null = null

  // Main planet synth (polyphonic for multiple hovers)
  private planetSynth: Tone.PolySynth | null = null
  private planetGain: Tone.Gain | null = null

  // Effects
  private reverb: Tone.Reverb | null = null
  private chorus: Tone.Chorus | null = null
  private panner: Tone.Panner | null = null

  // Currently hovering planets (for sustain)
  private hoveringPlanets: Map<string, { frequency: number; startTime: number }> = new Map()

  // Polyphony limit
  private readonly MAX_POLYPHONY = 4

  // Selection synth
  private selectSynth: Tone.PolySynth | null = null
  private selectGain: Tone.Gain | null = null

  // Brush synth
  private brushNoise: Tone.Noise | null = null
  private brushFilter: Tone.Filter | null = null
  private brushGain: Tone.Gain | null = null

  constructor(outputNode: Tone.ToneAudioNode) {
    this.outputGain = new Tone.Gain(0.8).connect(outputNode)
  }

  /**
   * Initialize sonification system
   */
  async init(): Promise<void> {
    if (this.initialized || !this.outputGain) return

    try {
      // Create effects chain
      this.reverb = new Tone.Reverb({ decay: 3, wet: 0.3 })
      await this.reverb.generate()

      this.chorus = new Tone.Chorus({ frequency: 2, depth: 0.5, wet: 0.3 }).start()
      this.panner = new Tone.Panner(0)

      // Chain: synth -> panner -> chorus -> reverb -> gain -> output
      this.reverb.connect(this.outputGain)
      this.chorus.connect(this.reverb)
      this.panner.connect(this.chorus)

      // Planet gain
      this.planetGain = new Tone.Gain(0.6).connect(this.panner)

      // Main planet synth
      this.planetSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.5, // 500ms fade in
          decay: 0.2,
          sustain: 0.6,
          release: 1, // 1s fade out
        },
      }).connect(this.planetGain)

      // Selection synth (more percussive)
      this.selectGain = new Tone.Gain(0.5).connect(this.outputGain)
      this.selectSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.2,
          release: 0.8,
        },
      }).connect(this.selectGain)

      // Brush noise
      this.brushGain = new Tone.Gain(0).connect(this.outputGain)
      this.brushFilter = new Tone.Filter({
        type: 'bandpass',
        frequency: 2000,
        Q: 2,
      }).connect(this.brushGain)
      this.brushNoise = new Tone.Noise({ type: 'pink' }).connect(this.brushFilter)

      this.initialized = true
      console.log('[PlanetSonification] Initialized')
    } catch (error) {
      console.error('[PlanetSonification] Failed to initialize:', error)
    }
  }

  /**
   * Set sonification complexity level
   */
  setComplexity(complexity: SonificationComplexity): void {
    this.complexity = complexity

    // Adjust reverb/chorus based on complexity (use rampTo to avoid clicks)
    if (this.reverb) {
      this.reverb.wet.rampTo(complexity === 'simple' ? 0.1 : complexity === 'standard' ? 0.3 : 0.5, 0.1)
    }
    if (this.chorus) {
      this.chorus.wet.rampTo(complexity === 'simple' ? 0 : complexity === 'standard' ? 0.3 : 0.5, 0.1)
    }
  }

  // ============ Mapping Functions ============

  /**
   * Map orbital period to frequency using pentatonic scale
   *
   * Redesigned for "Music of the Spheres" - pleasant, non-grating frequencies:
   * - All frequencies snap to C major pentatonic scale (C, D, E, G, A)
   * - Maximum frequency capped at 440Hz for sustained tones (A4)
   * - Range: ~65Hz (C2) to ~440Hz (A4)
   *
   * Short period = higher note, long period = lower note
   */
  periodToFrequency(periodDays: number): number {
    return periodToMusicalNote(periodDays, {
      allowHighOctave: false, // Sustained tones stay below 440Hz
      minPeriod: 0.5,
      maxPeriod: 10000,
    })
  }

  /**
   * Map planet radius to volume
   * Larger planets = louder (0.1 to 0.8)
   */
  radiusToVolume(radiusEarthRadii: number): number {
    const minRadius = 0.3
    const maxRadius = 25
    const minVolume = 0.15
    const maxVolume = 0.7

    const clampedRadius = Math.max(minRadius, Math.min(maxRadius, radiusEarthRadii))
    const logRadius = Math.log10(clampedRadius)
    const logMin = Math.log10(minRadius)
    const logMax = Math.log10(maxRadius)

    const normalized = (logRadius - logMin) / (logMax - logMin)
    return minVolume + normalized * (maxVolume - minVolume)
  }

  /**
   * Map planet type to oscillator type (timbre)
   */
  typeToTimbre(planet: Planet): OscillatorType {
    const mass = planet.mass ?? 1
    const radius = planet.radius ?? 1

    // Rocky planets (small, dense): pure sine
    if (radius < 1.5 && mass < 5) {
      return 'sine'
    }

    // Super-Earths / Sub-Neptunes: triangle
    if (radius < 4 && mass < 20) {
      return 'triangle'
    }

    // Ice giants: square (hollow sound)
    if (radius < 6 && mass < 50) {
      return 'square'
    }

    // Gas giants: sawtooth (rich harmonics)
    return 'sawtooth'
  }

  /**
   * Map semi-major axis (separation) to stereo pan position
   * Close planets = center, far planets = wide stereo
   */
  separationToPan(separationAU: number): number {
    const minAU = 0.01
    const maxAU = 100

    const clampedAU = Math.max(minAU, Math.min(maxAU, separationAU))
    const logAU = Math.log10(clampedAU)
    const logMin = Math.log10(minAU)
    const logMax = Math.log10(maxAU)

    // Map to -0.8 to 0.8 (leave some center)
    const normalized = (logAU - logMin) / (logMax - logMin)

    // Alternate left/right based on some hash of the position
    const side = Math.sin(separationAU * 100) > 0 ? 1 : -1
    return normalized * 0.8 * side
  }

  // ============ Hover Sonification ============

  /**
   * Start playing a planet's voice on hover
   */
  startHover(planet: Planet): void {
    if (!this.initialized || !this.planetSynth) return

    const planetId = planet.name || `${planet.period}-${planet.mass}`

    // Check polyphony limit
    if (this.hoveringPlanets.size >= this.MAX_POLYPHONY) {
      // Remove oldest hovering planet
      const oldest = [...this.hoveringPlanets.entries()].sort(
        (a, b) => a[1].startTime - b[1].startTime
      )[0]
      if (oldest) {
        this.stopHover({ name: oldest[0] } as Planet)
      }
    }

    // Calculate sonification parameters
    const frequency = this.periodToFrequency(planet.period)
    const volume = this.radiusToVolume(planet.radius ?? 1)
    const pan = this.separationToPan(planet.separation ?? planet.period / 365)

    // Set pan position
    if (this.panner) {
      this.panner.pan.rampTo(pan, 0.1)
    }

    // Note: In a more complex implementation, we could use typeToTimbre(planet)
    // to set different oscillator types per planet. PolySynth doesn't easily
    // allow per-note timbre changes, so this would require voice allocation.

    // Start the note
    this.planetSynth.triggerAttack(frequency, undefined, volume)

    // Track hovering planet
    this.hoveringPlanets.set(planetId, { frequency, startTime: Date.now() })
  }

  /**
   * Stop playing a planet's voice on hover end
   */
  stopHover(planet: Planet): void {
    if (!this.initialized || !this.planetSynth) return

    const planetId = planet.name || `${planet.period}-${planet.mass}`
    const hoverData = this.hoveringPlanets.get(planetId)

    if (hoverData) {
      this.planetSynth.triggerRelease(hoverData.frequency)
      this.hoveringPlanets.delete(planetId)
    }
  }

  /**
   * Stop all hovering sounds
   */
  stopAllHovers(): void {
    if (!this.planetSynth) return

    this.hoveringPlanets.forEach((data) => {
      this.planetSynth?.triggerRelease(data.frequency)
    })
    this.hoveringPlanets.clear()
  }

  // ============ Solar System Tones ============

  /**
   * Play a Solar System planet's unique tone
   */
  playSolarSystemTone(planetName: string): void {
    if (!this.initialized || !this.selectSynth) return

    const config = SOLAR_SYSTEM_SOUNDS[planetName]
    if (!config) return

    const now = Tone.now()

    // Play the characteristic tone
    this.selectSynth.triggerAttackRelease(
      config.frequency,
      config.attack + config.decay + 0.5,
      now,
      0.5
    )

    // Add harmonics for richer planets
    if (config.oscillatorType === 'sawtooth' && this.complexity !== 'simple') {
      // Add octave
      this.selectSynth.triggerAttackRelease(config.frequency * 2, 0.3, now + 0.05, 0.2)
    }

    // Earth gets a special warm chord
    if (planetName === 'Earth') {
      this.selectSynth.triggerAttackRelease(config.frequency * 1.5, 0.5, now + 0.1, 0.3) // Fifth
      this.selectSynth.triggerAttackRelease(config.frequency * 2, 0.4, now + 0.15, 0.2) // Octave
    }
  }

  // ============ Selection Sonification ============

  /**
   * Play planet selection sound
   */
  playSelect(planet: Planet): void {
    if (!this.initialized || !this.selectSynth) return

    // Check if it's a Solar System planet
    if (planet.isSolarSystem && planet.name) {
      this.playSolarSystemTone(planet.name)
      return
    }

    const frequency = this.periodToFrequency(planet.period)
    const volume = this.radiusToVolume(planet.radius ?? 1)
    const pan = this.separationToPan(planet.separation ?? planet.period / 365)

    if (this.panner) {
      this.panner.pan.rampTo(pan, 0.05)
    }

    const now = Tone.now()

    // Resonant ping
    this.selectSynth.triggerAttackRelease(frequency, '8n', now, volume)

    // Add harmonics based on complexity (using consonant intervals, capped at 800Hz)
    if (this.complexity !== 'simple') {
      const fifth = getConsonantInterval(frequency, 'fifth')
      const octave = getConsonantInterval(frequency, 'octave')
      this.selectSynth.triggerAttackRelease(fifth, '16n', now + 0.05, volume * 0.6)
      this.selectSynth.triggerAttackRelease(octave, '16n', now + 0.1, volume * 0.4)
    }

    if (this.complexity === 'rich') {
      // For rich mode, add another fifth above the octave (capped)
      const highFifth = Math.min(getConsonantInterval(frequency, 'octave') * 1.5, MAX_SUSTAINED_FREQUENCY)
      this.selectSynth.triggerAttackRelease(highFifth, '32n', now + 0.15, volume * 0.2)
    }
  }

  // ============ Brush Selection Sonification ============

  /**
   * Start brush selection sound
   */
  startBrush(): void {
    if (!this.initialized || !this.brushNoise || !this.brushGain) return

    // Ensure gain is 0 before starting to avoid clicks
    this.brushGain.gain.value = 0
    this.brushNoise.start()
    this.brushGain.gain.rampTo(0.15, 0.1)
  }

  /**
   * Update brush sound based on selection size
   * @param size Normalized size (0-1)
   */
  updateBrush(size: number): void {
    if (!this.brushFilter || !this.brushGain) return

    // Larger selection = lower frequency, louder
    const frequency = 3000 - size * 2000
    this.brushFilter.frequency.rampTo(frequency, 0.05)
    this.brushGain.gain.rampTo(0.1 + size * 0.2, 0.05)
  }

  /**
   * End brush selection with satisfying sound
   */
  endBrush(capturedCount: number): void {
    if (!this.initialized || !this.brushNoise || !this.brushGain || !this.selectSynth) return

    // Fade out brush noise - wait for fade before stopping to avoid clicks
    this.brushGain.gain.rampTo(0, 0.25)
    setTimeout(() => this.brushNoise?.stop(), 300)

    // Play capture sound based on count
    if (capturedCount > 0) {
      const now = Tone.now()
      const baseFreq = 200 + Math.min(capturedCount, 100) * 5

      this.selectSynth.triggerAttackRelease(baseFreq, '8n', now, 0.4)
      this.selectSynth.triggerAttackRelease(baseFreq * 1.25, '8n', now + 0.08, 0.3) // Major third
      this.selectSynth.triggerAttackRelease(baseFreq * 1.5, '8n', now + 0.16, 0.25) // Fifth
    }
  }

  /**
   * Cancel brush without capture sound
   */
  cancelBrush(): void {
    if (!this.brushNoise || !this.brushGain) return

    // Fade out before stopping to avoid clicks
    this.brushGain.gain.rampTo(0, 0.15)
    setTimeout(() => this.brushNoise?.stop(), 200)
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    if (this.outputGain) {
      this.outputGain.gain.rampTo(volume * 0.8, 0.1)
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopAllHovers()

    // Fade out brush noise before stopping to avoid clicks
    if (this.brushGain) {
      this.brushGain.gain.rampTo(0, 0.1)
    }
    setTimeout(() => {
      this.brushNoise?.stop()
      this.brushNoise?.dispose()
    }, 150)
    this.brushFilter?.dispose()
    this.brushGain?.dispose()

    this.planetSynth?.dispose()
    this.planetGain?.dispose()
    this.selectSynth?.dispose()
    this.selectGain?.dispose()

    this.reverb?.dispose()
    this.chorus?.dispose()
    this.panner?.dispose()
    this.outputGain?.dispose()

    this.initialized = false
  }
}
