import * as Tone from 'tone'
import type { SimulatedSystem, SimulatedPlanet } from '../types/simulation'
import {
  periodToMusicalNote,
  starTemperatureToNote,
  getConsonantInterval,
} from './musicalScales'

/**
 * SimulationAudio - Handles audio for orbital simulation modal
 *
 * Features:
 * - Star-based ambient drone (temperature-dependent)
 * - Planet voice sonification
 * - Simulation control sounds
 * - Special moment sounds (periapsis, orbit complete)
 */
export class SimulationAudio {
  private initialized = false

  // Output node
  private outputGain: Tone.Gain | null = null

  // Star ambient drone
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
      // Star drone setup
      this.starDroneGain = new Tone.Gain(0).connect(this.outputGain)
      this.starFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 400,
        Q: 1,
      }).connect(this.starDroneGain)

      this.starDrone = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 3,
          decay: 1,
          sustain: 0.8,
          release: 4,
        },
      }).connect(this.starFilter)

      // LFO for subtle vibrato on star drone
      this.starLfo = new Tone.LFO({
        frequency: 0.1,
        min: 0.95,
        max: 1.05,
      })

      // Planet voices
      this.planetReverb = new Tone.Reverb({ decay: 2, wet: 0.4 })
      await this.planetReverb.generate()

      this.planetGain = new Tone.Gain(0.5).connect(this.planetReverb)
      this.planetReverb.connect(this.outputGain)

      this.planetSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.3,
          decay: 0.2,
          sustain: 0.5,
          release: 1.5,
        },
      }).connect(this.planetGain)

      // UI sounds
      this.uiGain = new Tone.Gain(0.4).connect(this.outputGain)
      this.uiSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0,
          release: 0.2,
        },
      }).connect(this.uiGain)

      // Special moment sounds
      this.momentGain = new Tone.Gain(0.5).connect(this.outputGain)
      this.momentSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.05,
          decay: 0.3,
          sustain: 0.3,
          release: 1,
        },
      }).connect(this.momentGain)

      this.initialized = true
      console.log('[SimulationAudio] Initialized')
    } catch (error) {
      console.error('[SimulationAudio] Failed to initialize:', error)
    }
  }

  // ============ Star Ambient ============

  /**
   * Get drone frequency from star temperature using pentatonic scale
   * Hot stars = slightly higher note, cool stars = lower note
   * Always in sub-bass to low range for comfortable ambient drone
   */
  private getStarDroneFrequency(temperature: number): number {
    return starTemperatureToNote(temperature)
  }

  /**
   * Get filter frequency from star temperature
   * Hot stars = brighter harmonics
   */
  private getStarFilterFrequency(temperature: number): number {
    if (temperature > 7500) return 800 // A-type, bright
    if (temperature > 6000) return 600 // F-type
    if (temperature > 5000) return 400 // G-type (Sun-like)
    if (temperature > 3500) return 300 // K-type
    return 200 // M-type, warm/dark
  }

  /**
   * Start system ambient based on star type
   */
  startSystemAmbient(system: SimulatedSystem): void {
    if (!this.initialized || !this.starDrone || !this.starDroneGain || !this.starFilter) return

    this.completedOrbits.clear()

    const frequency = this.getStarDroneFrequency(system.starTemperature)
    const filterFreq = this.getStarFilterFrequency(system.starTemperature)

    // Set filter based on temperature
    this.starFilter.frequency.rampTo(filterFreq, 0.5)

    // Start the drone
    this.starDrone.triggerAttack(frequency)
    this.starDroneGain.gain.rampTo(0.25, 2) // Fade in over 2s
  }

  /**
   * Stop system ambient
   */
  stopSystemAmbient(): void {
    if (!this.starDrone || !this.starDroneGain) return

    this.starDroneGain.gain.rampTo(0, 1)
    setTimeout(() => {
      this.starDrone?.triggerRelease()
    }, 1000)

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
