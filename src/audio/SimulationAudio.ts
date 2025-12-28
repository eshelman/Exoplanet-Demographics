import * as Tone from 'tone'
import type { SimulatedSystem, SimulatedPlanet } from '../types/simulation'
import {
  periodToMusicalNote,
  starTemperatureToNote,
  getConsonantInterval,
} from './musicalScales'
import { MUSICAL_ENVELOPES } from './BellSynth'

/**
 * SimulationAudio - Handles audio for orbital simulation modal
 *
 * Features:
 * - Three-layer ambient system (Phase 4: Music of the Spheres)
 *   - Base Layer: Sub-bass rumble with slow volume undulation
 *   - Harmonic Layer: Generative chord pad from visible planets
 *   - Texture Layer: Filtered noise bursts (stellar wind)
 * - Planet voice sonification
 * - Simulation control sounds
 * - Special moment sounds (periapsis, orbit complete)
 */
export class SimulationAudio {
  private initialized = false

  // Output node
  private outputGain: Tone.Gain | null = null

  // ===== AMBIENT LAYER 1: Sub-bass rumble =====
  private bassRumble: Tone.Synth | null = null
  private bassRumbleGain: Tone.Gain | null = null
  private bassRumbleLfo: Tone.LFO | null = null

  // ===== AMBIENT LAYER 2: Harmonic chord pad =====
  private chordPad: Tone.PolySynth | null = null
  private chordPadGain: Tone.Gain | null = null
  private chordPadReverb: Tone.Reverb | null = null
  private chordPadFilter: Tone.Filter | null = null
  private chordEvolutionInterval: ReturnType<typeof setInterval> | null = null
  private currentChordNotes: number[] = []
  private currentSystem: SimulatedSystem | null = null

  // ===== AMBIENT LAYER 3: Texture (stellar wind) =====
  private textureNoise: Tone.Noise | null = null
  private textureFilter: Tone.Filter | null = null
  private textureGain: Tone.Gain | null = null
  private textureBurstInterval: ReturnType<typeof setInterval> | null = null

  // Legacy star drone (kept for compatibility, now integrated into bass rumble)
  private starDrone: Tone.Synth | null = null
  private starDroneGain: Tone.Gain | null = null
  private starLfo: Tone.LFO | null = null
  private starFilter: Tone.Filter | null = null

  // Planet voices
  private planetSynth: Tone.PolySynth | null = null
  private planetGain: Tone.Gain | null = null
  private planetReverb: Tone.Reverb | null = null

  // UI sounds for simulation
  private uiSynth: Tone.Synth | null = null
  private uiGain: Tone.Gain | null = null

  // Special moment sounds
  private momentSynth: Tone.PolySynth | null = null
  private momentGain: Tone.Gain | null = null

  // Track selected planet voice
  private selectedPlanetFreq: number | null = null

  // Track completed orbits to avoid repeated sounds
  private completedOrbits: Set<string> = new Set()

  constructor(outputNode: Tone.ToneAudioNode) {
    this.outputGain = new Tone.Gain(0.6).connect(outputNode)
  }

  /**
   * Initialize simulation audio
   */
  async init(): Promise<void> {
    if (this.initialized || !this.outputGain) return

    try {
      // ===== AMBIENT LAYER 1: Sub-bass rumble (30-60Hz) =====
      // "The Void" - felt more than heard, slow volume undulation
      this.bassRumbleGain = new Tone.Gain(0).connect(this.outputGain)
      this.bassRumble = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 4,
          decay: 2,
          sustain: 1,
          release: 6,
        },
      }).connect(this.bassRumbleGain)

      // LFO for slow volume undulation (20-40 second period)
      this.bassRumbleLfo = new Tone.LFO({
        frequency: 1 / 30, // ~30 second period
        min: 0.1,
        max: 0.25,
      }).connect(this.bassRumbleGain.gain)

      // ===== AMBIENT LAYER 2: Harmonic chord pad =====
      // Generative chord from visible planet frequencies
      this.chordPadReverb = new Tone.Reverb({
        decay: 4,
        wet: 0.6,
      })
      await this.chordPadReverb.generate()

      this.chordPadFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 400,
        Q: 0.5,
      }).connect(this.chordPadReverb)
      this.chordPadReverb.connect(this.outputGain)

      this.chordPadGain = new Tone.Gain(0).connect(this.chordPadFilter)
      this.chordPad = new Tone.PolySynth({
        voice: Tone.Synth,
        maxPolyphony: 8, // Limit to prevent note overflow
        options: {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 3,
            decay: 2,
            sustain: 0.7,
            release: 5,
          },
        },
      }).connect(this.chordPadGain)

      // ===== AMBIENT LAYER 3: Texture (stellar wind) =====
      // Filtered noise bursts, very quiet (10-15% volume)
      this.textureGain = new Tone.Gain(0).connect(this.outputGain)
      this.textureFilter = new Tone.Filter({
        type: 'bandpass',
        frequency: 800,
        Q: 2,
      }).connect(this.textureGain)
      this.textureNoise = new Tone.Noise({
        type: 'pink',
      }).connect(this.textureFilter)

      // ===== Legacy star drone (now minimal, bass rumble takes over) =====
      this.starDroneGain = new Tone.Gain(0).connect(this.outputGain)
      this.starFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 400,
        Q: 1,
      }).connect(this.starDroneGain)

      this.starDrone = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: MUSICAL_ENVELOPES.starDrone,
      }).connect(this.starFilter)

      // LFO for subtle vibrato on star drone
      this.starLfo = new Tone.LFO({
        frequency: 0.1,
        min: 0.95,
        max: 1.05,
      })

      // Planet voices - bell-like with natural decay
      this.planetReverb = new Tone.Reverb({ decay: 2, wet: 0.4 })
      await this.planetReverb.generate()

      this.planetGain = new Tone.Gain(0.5).connect(this.planetReverb)
      this.planetReverb.connect(this.outputGain)

      this.planetSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: MUSICAL_ENVELOPES.planetHover,
      }).connect(this.planetGain)

      // UI sounds - quick, percussive
      this.uiGain = new Tone.Gain(0.4).connect(this.outputGain)
      this.uiSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: MUSICAL_ENVELOPES.uiClick,
      }).connect(this.uiGain)

      // Special moment sounds - orbital chimes (needs higher polyphony for multiple planets)
      this.momentGain = new Tone.Gain(0.5).connect(this.outputGain)
      this.momentSynth = new Tone.PolySynth({
        voice: Tone.Synth,
        maxPolyphony: 16, // Higher limit for rapid orbital chimes
        options: {
          oscillator: { type: 'sine' },
          envelope: MUSICAL_ENVELOPES.orbitChime,
        },
      }).connect(this.momentGain)

      this.initialized = true
      console.log('[SimulationAudio] Initialized')
    } catch (error) {
      console.error('[SimulationAudio] Failed to initialize:', error)
    }
  }

  // ============ Three-Layer Ambient System (Phase 4) ============

  /**
   * Get bass rumble frequency from star temperature
   * Maps to 30-60Hz range - felt more than heard
   */
  private getBassRumbleFrequency(temperature: number): number {
    const minTemp = 2500
    const maxTemp = 10000
    const clamped = Math.max(minTemp, Math.min(maxTemp, temperature))
    const normalized = (clamped - minTemp) / (maxTemp - minTemp)
    // Map to 30-60Hz range
    return 30 + normalized * 30
  }

  /**
   * Get texture filter frequency from star temperature
   * Hot stars = brighter texture, cool stars = darker
   */
  private getTextureFilterFrequency(temperature: number): number {
    if (temperature > 7500) return 1200 // A-type, bright
    if (temperature > 6000) return 1000 // F-type
    if (temperature > 5000) return 800 // G-type (Sun-like)
    if (temperature > 3500) return 600 // K-type
    return 400 // M-type, warm/dark
  }

  /**
   * Extract chord notes from planets using their orbital periods
   * Takes 3-5 most prominent planets and extracts their pentatonic notes
   */
  private extractChordFromPlanets(planets: SimulatedPlanet[]): number[] {
    if (planets.length === 0) return [65.41, 98.0, 130.81] // Default C power chord

    // Sort by radius (most prominent first) and take top 3-5
    const sorted = [...planets].sort((a, b) => (b.radius || 1) - (a.radius || 1))
    const prominent = sorted.slice(0, Math.min(5, sorted.length))

    // Extract unique frequencies
    const frequencies = prominent.map((p) => this.planetToFrequency(p))

    // Ensure we have at least 3 notes for a chord
    const uniqueFreqs = [...new Set(frequencies)]
    if (uniqueFreqs.length < 3) {
      // Add consonant intervals to fill out the chord
      const base = uniqueFreqs[0] || 130.81
      return [base, getConsonantInterval(base, 'fifth'), getConsonantInterval(base, 'octave')]
    }

    return uniqueFreqs.slice(0, 5)
  }

  /**
   * Start the chord pad with current notes
   */
  private startChordPad(): void {
    if (!this.chordPad || !this.chordPadGain || this.currentChordNotes.length === 0) return

    // Trigger all chord notes
    this.currentChordNotes.forEach((freq) => {
      this.chordPad?.triggerAttack(freq, undefined, 0.15)
    })
    this.chordPadGain.gain.rampTo(0.2, 3) // Fade in over 3s
  }

  /**
   * Evolve the chord pad to new notes (smooth transition)
   * Uses releaseAll to prevent polyphony overflow
   */
  private evolveChordPad(): void {
    if (!this.chordPad || !this.chordPadGain || !this.currentSystem) return

    // Calculate new chord from planets
    const newNotes = this.extractChordFromPlanets(this.currentSystem.planets)

    // Check if notes actually changed
    const sortedCurrent = [...this.currentChordNotes].sort()
    const sortedNew = [...newNotes].sort()
    if (JSON.stringify(sortedCurrent) === JSON.stringify(sortedNew)) return

    // Fade out, release all, then fade in with new notes
    // This prevents polyphony buildup from overlapping attack/release
    this.chordPadGain.gain.rampTo(0, 1.5)

    setTimeout(() => {
      // Release all current notes
      this.chordPad?.releaseAll()
      this.currentChordNotes = []

      // Start new notes after brief pause
      setTimeout(() => {
        if (!this.chordPad || !this.chordPadGain || !this.currentSystem) return
        newNotes.forEach((freq) => {
          this.chordPad?.triggerAttack(freq, undefined, 0.15)
        })
        this.currentChordNotes = newNotes
        this.chordPadGain.gain.rampTo(0.2, 2)
      }, 200)
    }, 1500)
  }

  /**
   * Play a texture burst (stellar wind effect)
   */
  private playTextureBurst(): void {
    if (!this.textureNoise || !this.textureGain || !this.textureFilter) return

    // Random filter frequency variation
    const baseFreq = this.textureFilter.frequency.value as number
    const variation = baseFreq * (0.8 + Math.random() * 0.4)
    this.textureFilter.frequency.rampTo(variation, 0.2)

    // Quick burst: fade in, hold briefly, fade out
    this.textureGain.gain.rampTo(0.12, 0.3) // Fade in
    setTimeout(() => {
      this.textureGain?.gain.rampTo(0, 1.5) // Fade out
      // Reset filter
      setTimeout(() => {
        this.textureFilter?.frequency.rampTo(baseFreq, 0.5)
      }, 1500)
    }, 500 + Math.random() * 1000)
  }

  /**
   * Start system ambient - all three layers
   *
   * Phase 4 "Music of the Spheres" ambient system:
   * - Layer 1: Sub-bass rumble (30-60Hz) with slow volume undulation
   * - Layer 2: Generative chord pad from planet frequencies
   * - Layer 3: Texture bursts (stellar wind)
   */
  startSystemAmbient(system: SimulatedSystem): void {
    if (!this.initialized) return

    this.completedOrbits.clear()
    this.currentSystem = system

    // ===== LAYER 1: Sub-bass rumble =====
    if (this.bassRumble && this.bassRumbleGain && this.bassRumbleLfo) {
      const bassFreq = this.getBassRumbleFrequency(system.starTemperature)
      this.bassRumble.triggerAttack(bassFreq)
      this.bassRumbleLfo.start()
      // LFO controls the gain, so we just let it run
    }

    // ===== LAYER 2: Harmonic chord pad =====
    this.currentChordNotes = this.extractChordFromPlanets(system.planets)
    this.startChordPad()

    // Schedule slow chord evolution (every 15-25 seconds)
    this.chordEvolutionInterval = setInterval(() => {
      if (Math.random() > 0.4) { // 60% chance to evolve
        this.evolveChordPad()
      }
    }, 15000 + Math.random() * 10000)

    // ===== LAYER 3: Texture bursts =====
    if (this.textureNoise && this.textureFilter) {
      const textureFreq = this.getTextureFilterFrequency(system.starTemperature)
      this.textureFilter.frequency.value = textureFreq
      this.textureNoise.start()

      // Schedule random texture bursts (every 5-15 seconds)
      this.textureBurstInterval = setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance for burst
          this.playTextureBurst()
        }
      }, 5000 + Math.random() * 10000)

      // Initial burst after short delay
      setTimeout(() => this.playTextureBurst(), 2000 + Math.random() * 3000)
    }

    // ===== Legacy star drone (reduced role) =====
    if (this.starDrone && this.starDroneGain && this.starFilter) {
      const droneFreq = starTemperatureToNote(system.starTemperature)
      this.starFilter.frequency.rampTo(300, 0.5) // Lower filter for subtlety
      this.starDrone.triggerAttack(droneFreq)
      this.starDroneGain.gain.rampTo(0.1, 2) // Quieter than before
    }
  }

  /**
   * Stop system ambient - all layers
   */
  stopSystemAmbient(): void {
    // ===== LAYER 1: Sub-bass rumble =====
    if (this.bassRumble && this.bassRumbleGain && this.bassRumbleLfo) {
      this.bassRumbleLfo.stop()
      this.bassRumbleGain.gain.rampTo(0, 1)
      setTimeout(() => {
        this.bassRumble?.triggerRelease()
      }, 1000)
    }

    // ===== LAYER 2: Chord pad =====
    if (this.chordEvolutionInterval) {
      clearInterval(this.chordEvolutionInterval)
      this.chordEvolutionInterval = null
    }
    if (this.chordPad && this.chordPadGain) {
      this.chordPadGain.gain.rampTo(0, 2)
      setTimeout(() => {
        this.currentChordNotes.forEach((freq) => {
          this.chordPad?.triggerRelease(freq)
        })
        this.currentChordNotes = []
      }, 2000)
    }

    // ===== LAYER 3: Texture =====
    if (this.textureBurstInterval) {
      clearInterval(this.textureBurstInterval)
      this.textureBurstInterval = null
    }
    if (this.textureNoise && this.textureGain) {
      this.textureGain.gain.rampTo(0, 0.5)
      setTimeout(() => {
        this.textureNoise?.stop()
      }, 500)
    }

    // ===== Legacy star drone =====
    if (this.starDrone && this.starDroneGain) {
      this.starDroneGain.gain.rampTo(0, 1)
      setTimeout(() => {
        this.starDrone?.triggerRelease()
      }, 1000)
    }

    this.currentSystem = null
    this.completedOrbits.clear()
  }

  // ============ Planet Voices ============

  /**
   * Map planet period to frequency using pentatonic scale
   *
   * Redesigned for "Music of the Spheres" - pleasant, non-grating frequencies:
   * - All frequencies snap to C major pentatonic scale
   * - Maximum frequency capped at 440Hz for sustained tones
   */
  private planetToFrequency(planet: SimulatedPlanet): number {
    return periodToMusicalNote(planet.period, {
      allowHighOctave: false, // Sustained simulation tones stay below 440Hz
      minPeriod: 0.5,
      maxPeriod: 5000,
    })
  }

  /**
   * Map planet radius to volume
   */
  private planetToVolume(planet: SimulatedPlanet): number {
    const radius = planet.radius || 1
    const minRadius = 0.5
    const maxRadius = 15
    const minVol = 0.2
    const maxVol = 0.6

    const clamped = Math.max(minRadius, Math.min(maxRadius, radius))
    const normalized = (Math.log10(clamped) - Math.log10(minRadius)) /
      (Math.log10(maxRadius) - Math.log10(minRadius))
    return minVol + normalized * (maxVol - minVol)
  }

  /**
   * Start playing selected planet's sustained voice
   */
  startPlanetVoice(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.planetSynth) return

    // Stop any previous voice
    if (this.selectedPlanetFreq !== null) {
      this.planetSynth.triggerRelease(this.selectedPlanetFreq)
    }

    const frequency = this.planetToFrequency(planet)
    const volume = this.planetToVolume(planet)

    this.selectedPlanetFreq = frequency
    this.planetSynth.triggerAttack(frequency, undefined, volume)
  }

  /**
   * Stop selected planet's voice
   */
  stopPlanetVoice(): void {
    if (!this.planetSynth || this.selectedPlanetFreq === null) return

    this.planetSynth.triggerRelease(this.selectedPlanetFreq)
    this.selectedPlanetFreq = null
  }

  /**
   * Update planet voice based on velocity (subtle pitch modulation)
   */
  updatePlanetVoice(_velocity: number): void {
    // Could add pitch bend based on velocity for eccentric orbits
    // For now, this is a placeholder for future enhancement
  }

  /**
   * Play a brief planet ping on hover
   */
  playPlanetHover(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.planetSynth) return

    const frequency = this.planetToFrequency(planet)
    const volume = this.planetToVolume(planet) * 0.5

    this.planetSynth.triggerAttackRelease(frequency, '16n', undefined, volume)
  }

  /**
   * Play planet selection sound
   */
  playPlanetSelect(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.momentSynth) return

    const frequency = this.planetToFrequency(planet)
    const volume = this.planetToVolume(planet)
    const now = Tone.now()

    // Resonant ping with consonant intervals (capped at 800Hz)
    this.momentSynth.triggerAttackRelease(frequency, '8n', now, volume)
    this.momentSynth.triggerAttackRelease(getConsonantInterval(frequency, 'fifth'), '16n', now + 0.05, volume * 0.6)
    this.momentSynth.triggerAttackRelease(getConsonantInterval(frequency, 'octave'), '16n', now + 0.1, volume * 0.4)
  }

  // ============ UI Sounds ============

  /**
   * Play simulation speed change sound
   */
  playSpeedChange(newSpeed: number): void {
    if (!this.initialized || !this.uiSynth) return

    // Higher speed = higher pitch
    const baseFreq = 300
    const freq = baseFreq + Math.log2(newSpeed) * 100

    this.uiSynth.triggerAttackRelease(freq, '32n', undefined, 0.3)
  }

  /**
   * Play simulation pause sound (descending)
   */
  playPause(): void {
    if (!this.initialized || !this.uiSynth) return

    const now = Tone.now()
    this.uiSynth.triggerAttackRelease('C5', '32n', now, 0.25)
    this.uiSynth.triggerAttackRelease('G4', '32n', now + 0.05, 0.2)
  }

  /**
   * Play simulation resume sound (ascending)
   */
  playResume(): void {
    if (!this.initialized || !this.uiSynth) return

    const now = Tone.now()
    this.uiSynth.triggerAttackRelease('G4', '32n', now, 0.2)
    this.uiSynth.triggerAttackRelease('C5', '32n', now + 0.05, 0.25)
  }

  /**
   * Play toggle sound
   */
  playToggle(enabled: boolean): void {
    if (!this.initialized || !this.uiSynth) return

    const freq = enabled ? 'E5' : 'C5'
    this.uiSynth.triggerAttackRelease(freq, '32n', undefined, 0.2)
  }

  /**
   * Play modal open sound
   */
  playModalOpen(): void {
    if (!this.initialized || !this.momentSynth) return

    const now = Tone.now()
    // "Telescope focusing" - rising arpeggio
    this.momentSynth.triggerAttackRelease('C4', '16n', now, 0.2)
    this.momentSynth.triggerAttackRelease('E4', '16n', now + 0.1, 0.25)
    this.momentSynth.triggerAttackRelease('G4', '16n', now + 0.2, 0.3)
    this.momentSynth.triggerAttackRelease('C5', '8n', now + 0.3, 0.35)
  }

  /**
   * Play modal close sound
   */
  playModalClose(): void {
    if (!this.initialized || !this.momentSynth) return

    const now = Tone.now()
    // "Lens closing" - falling arpeggio
    this.momentSynth.triggerAttackRelease('G4', '16n', now, 0.25)
    this.momentSynth.triggerAttackRelease('E4', '16n', now + 0.08, 0.2)
    this.momentSynth.triggerAttackRelease('C4', '8n', now + 0.16, 0.15)
  }

  // ============ Orbital Rhythmic Chimes ============

  /**
   * Play orbital chime when planet crosses reference point
   *
   * This creates the "rhythmic pulse" soundscape from the Music of the Spheres design:
   * - Faster orbits = more frequent chimes (rhythm, not pitch)
   * - Each planet has a unique pitch from the pentatonic scale
   * - Short, bell-like decay prevents sustained high-frequency exposure
   */
  playOrbitalChime(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.momentSynth) return

    const frequency = this.planetToFrequency(planet)
    const volume = this.planetToVolume(planet) * 0.7 // Slightly quieter for rhythm

    // Short, pleasant chime with natural decay
    this.momentSynth.triggerAttackRelease(frequency, '16n', undefined, volume)
  }

  // ============ Special Moment Sounds ============

  /**
   * Play periapsis passage sound
   * Called when an eccentric planet passes closest to star
   */
  playPeriapsisPass(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.momentSynth) return
    if (planet.eccentricity < 0.1) return // Only for eccentric orbits

    const frequency = this.planetToFrequency(planet)
    // Whoosh effect - quick frequency sweep
    const now = Tone.now()

    this.momentSynth.triggerAttackRelease(frequency * 0.8, '32n', now, 0.2)
    this.momentSynth.triggerAttackRelease(frequency, '16n', now + 0.03, 0.3)
    this.momentSynth.triggerAttackRelease(frequency * 1.2, '32n', now + 0.08, 0.2)
  }

  /**
   * Play orbit complete chime
   * Called when a planet completes a full orbit (once per session)
   */
  playOrbitComplete(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.momentSynth) return

    // Check if we already played this
    if (this.completedOrbits.has(planet.id)) return
    this.completedOrbits.add(planet.id)

    const frequency = this.planetToFrequency(planet)
    const now = Tone.now()

    // Gentle completion chime with consonant octave (capped)
    this.momentSynth.triggerAttackRelease(frequency, '8n', now, 0.3)
    this.momentSynth.triggerAttackRelease(getConsonantInterval(frequency, 'octave'), '4n', now + 0.15, 0.2)
  }

  /**
   * Play conjunction sound when two planets align
   */
  playConjunction(planet1: SimulatedPlanet, planet2: SimulatedPlanet): void {
    if (!this.initialized || !this.momentSynth) return

    const freq1 = this.planetToFrequency(planet1)
    const freq2 = this.planetToFrequency(planet2)
    const now = Tone.now()

    // Harmonic chord
    this.momentSynth.triggerAttackRelease(freq1, '4n', now, 0.25)
    this.momentSynth.triggerAttackRelease(freq2, '4n', now + 0.05, 0.25)
    this.momentSynth.triggerAttackRelease((freq1 + freq2) / 2, '4n', now + 0.1, 0.15)
  }

  // ============ Utility ============

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    if (this.outputGain) {
      this.outputGain.gain.rampTo(volume * 0.6, 0.1)
    }
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.initialized
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopSystemAmbient()
    this.stopPlanetVoice()

    // Ambient Layer 1: Sub-bass rumble
    this.bassRumble?.dispose()
    this.bassRumbleGain?.dispose()
    this.bassRumbleLfo?.dispose()

    // Ambient Layer 2: Chord pad
    this.chordPad?.dispose()
    this.chordPadGain?.dispose()
    this.chordPadReverb?.dispose()
    this.chordPadFilter?.dispose()

    // Ambient Layer 3: Texture
    this.textureNoise?.dispose()
    this.textureFilter?.dispose()
    this.textureGain?.dispose()

    // Legacy star drone
    this.starDrone?.dispose()
    this.starDroneGain?.dispose()
    this.starLfo?.dispose()
    this.starFilter?.dispose()

    this.planetSynth?.dispose()
    this.planetGain?.dispose()
    this.planetReverb?.dispose()

    this.uiSynth?.dispose()
    this.uiGain?.dispose()

    this.momentSynth?.dispose()
    this.momentGain?.dispose()

    this.outputGain?.dispose()

    this.initialized = false
  }
}
