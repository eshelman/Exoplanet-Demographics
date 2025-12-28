import * as Tone from 'tone'
import { AmbientSoundscape } from './AmbientSoundscape'
import { PlanetSonification } from './PlanetSonification'
import { UISounds } from './UISounds'
import { SimulationAudio } from './SimulationAudio'
import { periodToMusicalNote, getConsonantInterval } from './musicalScales'
import { MUSICAL_ENVELOPES } from './BellSynth'
import type { DetectionMethodId, Planet } from '../types'
import type { SimulatedSystem, SimulatedPlanet } from '../types/simulation'

export interface AudioSettings {
  enabled: boolean
  masterVolume: number // 0-1
  categories: {
    ambient: boolean
    ui: boolean
    sonification: boolean
    narration: boolean
  }
  sonificationComplexity: 'simple' | 'standard' | 'rich'
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  enabled: true, // On by default
  masterVolume: 0.7,
  categories: {
    ambient: true,
    ui: true,
    sonification: true,
    narration: true,
  },
  sonificationComplexity: 'standard',
}

/**
 * AudioManager - Singleton class for managing all audio in the visualization
 * Uses Tone.js for Web Audio API abstraction
 */
class AudioManagerClass {
  private static instance: AudioManagerClass
  private initialized = false
  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS

  // Master gain node
  private masterGain: Tone.Gain | null = null

  // Category gain nodes
  private ambientGain: Tone.Gain | null = null
  private uiGain: Tone.Gain | null = null
  private sonificationGain: Tone.Gain | null = null
  private narrationGain: Tone.Gain | null = null

  // Synths for different purposes
  private uiSynth: Tone.Synth | null = null
  private planetSynth: Tone.PolySynth | null = null
  private ambientSynth: Tone.Synth | null = null

  // Ambient noise (legacy - kept for simple ambient)
  private ambientNoise: Tone.Noise | null = null
  private ambientFilter: Tone.Filter | null = null

  // Ambient soundscape
  private ambientSoundscape: AmbientSoundscape | null = null

  // Planet sonification
  private planetSonification: PlanetSonification | null = null

  // UI sounds
  private uiSounds: UISounds | null = null

  // Simulation audio
  private simulationAudio: SimulationAudio | null = null

  private constructor() {
    // Load settings from localStorage
    this.loadSettings()

    // Handle tab visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    }
  }

  static getInstance(): AudioManagerClass {
    if (!AudioManagerClass.instance) {
      AudioManagerClass.instance = new AudioManagerClass()
    }
    return AudioManagerClass.instance
  }

  /**
   * Initialize the audio context - must be called after user interaction
   */
  async init(): Promise<void> {
    if (this.initialized) return

    try {
      // Start audio context (requires user gesture)
      await Tone.start()

      // Create master gain
      this.masterGain = new Tone.Gain(this.settings.masterVolume).toDestination()

      // Create category gains
      this.ambientGain = new Tone.Gain(this.settings.categories.ambient ? 1 : 0).connect(
        this.masterGain
      )
      this.uiGain = new Tone.Gain(this.settings.categories.ui ? 1 : 0).connect(this.masterGain)
      this.sonificationGain = new Tone.Gain(this.settings.categories.sonification ? 1 : 0).connect(
        this.masterGain
      )
      this.narrationGain = new Tone.Gain(this.settings.categories.narration ? 1 : 0).connect(
        this.masterGain
      )

      // Create UI synth for button clicks, hovers - quick, percussive
      this.uiSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: MUSICAL_ENVELOPES.uiClick,
      }).connect(this.uiGain)

      // Create planet synth for hover/selection sonification - bell-like decay
      this.planetSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: MUSICAL_ENVELOPES.planetHover,
      }).connect(this.sonificationGain)

      // Create ambient synth - slow, evolving pad
      this.ambientSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: MUSICAL_ENVELOPES.ambientPad,
      }).connect(this.ambientGain)

      // Create ambient noise with filter
      this.ambientFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 200,
        Q: 1,
      }).connect(this.ambientGain)

      this.ambientNoise = new Tone.Noise({
        type: 'brown',
        volume: -30,
      }).connect(this.ambientFilter)

      // Create ambient soundscape
      this.ambientSoundscape = new AmbientSoundscape(this.ambientGain)
      await this.ambientSoundscape.init()

      // Create planet sonification
      this.planetSonification = new PlanetSonification(this.sonificationGain)
      await this.planetSonification.init()
      this.planetSonification.setComplexity(this.settings.sonificationComplexity)

      // Create UI sounds
      this.uiSounds = new UISounds(this.uiGain)
      await this.uiSounds.init()

      // Create simulation audio
      this.simulationAudio = new SimulationAudio(this.sonificationGain)
      await this.simulationAudio.init()

      this.initialized = true
      console.log('[AudioManager] Initialized successfully')

      // Apply current settings (starts ambient if enabled)
      this.updateSettings({})
    } catch (error) {
      console.error('[AudioManager] Failed to initialize:', error)
    }
  }

  /**
   * Handle tab visibility changes - suspend/resume audio context
   */
  private handleVisibilityChange = (): void => {
    if (!this.initialized) return

    if (document.hidden) {
      // Suspend audio when tab is hidden - fade out to avoid clicks
      Tone.getTransport().pause()
      if (this.ambientNoise?.state === 'started' && this.ambientFilter) {
        // Fade out through filter before stopping
        const originalFreq = this.ambientFilter.frequency.value
        this.ambientFilter.frequency.rampTo(20, 0.2)
        setTimeout(() => {
          this.ambientNoise?.stop()
          if (this.ambientFilter) {
            this.ambientFilter.frequency.value = originalFreq
          }
        }, 250)
      }
    } else {
      // Resume audio when tab is visible
      if (this.settings.enabled) {
        Tone.getTransport().start()
        if (this.settings.categories.ambient && this.ambientNoise?.state === 'stopped') {
          // Fade in through filter to avoid clicks
          if (this.ambientFilter) {
            const targetFreq = this.ambientFilter.frequency.value
            this.ambientFilter.frequency.value = 20
            this.ambientNoise?.start()
            this.ambientFilter.frequency.rampTo(targetFreq, 0.3)
          } else {
            this.ambientNoise?.start()
          }
        }
      }
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const saved = localStorage.getItem('exoplanet-audio-settings')
      if (saved) {
        this.settings = { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('[AudioManager] Failed to load settings:', error)
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    if (typeof localStorage === 'undefined') return

    try {
      localStorage.setItem('exoplanet-audio-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('[AudioManager] Failed to save settings:', error)
    }
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  /**
   * Update settings
   */
  updateSettings(updates: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...updates }
    this.saveSettings()
    this.applySettings()
  }

  /**
   * Apply current settings to audio nodes
   */
  private applySettings(): void {
    if (!this.initialized) return

    // Update master volume
    if (this.masterGain) {
      this.masterGain.gain.rampTo(this.settings.enabled ? this.settings.masterVolume : 0, 0.1)
    }

    // Update category volumes
    if (this.ambientGain) {
      this.ambientGain.gain.rampTo(this.settings.categories.ambient ? 1 : 0, 0.1)
    }
    if (this.uiGain) {
      this.uiGain.gain.rampTo(this.settings.categories.ui ? 1 : 0, 0.1)
    }
    if (this.sonificationGain) {
      this.sonificationGain.gain.rampTo(this.settings.categories.sonification ? 1 : 0, 0.1)
    }
    if (this.narrationGain) {
      this.narrationGain.gain.rampTo(this.settings.categories.narration ? 1 : 0, 0.1)
    }

    // Start/stop ambient based on settings
    if (this.settings.enabled && this.settings.categories.ambient) {
      if (this.ambientNoise?.state === 'stopped') {
        // Fade in through filter to avoid clicks
        if (this.ambientFilter) {
          const targetFreq = 200 // Default filter frequency
          this.ambientFilter.frequency.value = 20
          this.ambientNoise?.start()
          this.ambientFilter.frequency.rampTo(targetFreq, 0.3)
        } else {
          this.ambientNoise?.start()
        }
      }
      // Start ambient soundscape
      this.ambientSoundscape?.start()
    } else {
      if (this.ambientNoise?.state === 'started' && this.ambientFilter) {
        // Fade out through filter before stopping to avoid clicks
        this.ambientFilter.frequency.rampTo(20, 0.2)
        setTimeout(() => this.ambientNoise?.stop(), 250)
      } else if (this.ambientNoise?.state === 'started') {
        this.ambientNoise?.stop()
      }
      // Stop ambient soundscape
      this.ambientSoundscape?.stop()
    }
  }

  /**
   * Enable/disable audio
   */
  setEnabled(enabled: boolean): void {
    this.updateSettings({ enabled })
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.updateSettings({ masterVolume: Math.max(0, Math.min(1, volume)) })
  }

  /**
   * Toggle a category on/off
   */
  setCategoryEnabled(category: keyof AudioSettings['categories'], enabled: boolean): void {
    this.updateSettings({
      categories: { ...this.settings.categories, [category]: enabled },
    })
  }

  /**
   * Set sonification complexity
   */
  setSonificationComplexity(complexity: AudioSettings['sonificationComplexity']): void {
    this.updateSettings({ sonificationComplexity: complexity })
    this.planetSonification?.setComplexity(complexity)
  }

  // ============ UI Sound Playback Methods ============

  /**
   * Play a UI click sound - gentle mechanical click
   */
  playClick(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playClick()
  }

  /**
   * Play a UI hover sound - soft breath/air release
   */
  playHover(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playHover()
  }

  /**
   * Play a toggle on sound - rising two-note chime
   */
  playToggleOn(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playToggleOn()
  }

  /**
   * Play a toggle off sound - falling two-note chime
   */
  playToggleOff(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playToggleOff()
  }

  // ============ Navigation Sounds ============

  /**
   * Start pan sound
   */
  startPan(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.startPan()
  }

  /**
   * Update pan sound based on velocity
   */
  updatePan(velocity: number): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.updatePan(velocity)
  }

  /**
   * End pan sound
   */
  endPan(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.endPan()
  }

  /**
   * Play zoom in sound
   */
  playZoomIn(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playZoomIn()
  }

  /**
   * Play zoom out sound
   */
  playZoomOut(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playZoomOut()
  }

  // ============ Transition Sounds ============

  /**
   * Play axis switch sound
   */
  playAxisSwitch(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playAxisSwitch()
  }

  /**
   * Play view change sound
   */
  playViewChange(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playViewChange()
  }

  /**
   * Play filter apply sound
   */
  playFilterApply(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playFilterApply()
  }

  /**
   * Play sidebar open sound
   */
  playSidebarOpen(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playSidebarOpen()
  }

  /**
   * Play sidebar close sound
   */
  playSidebarClose(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.uiSounds?.playSidebarClose()
  }

  /**
   * Play a planet hover sound based on planet properties
   * Uses pentatonic scale for pleasant, non-grating frequencies
   * @param period Orbital period in days (maps to frequency)
   * @param radius Planet radius in Earth radii (maps to volume)
   */
  playPlanetHover(period: number, radius: number): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification)
      return

    // Map period to pentatonic scale note (max 440Hz for sustained tones)
    const frequency = periodToMusicalNote(period, {
      allowHighOctave: false,
      minPeriod: 1,
      maxPeriod: 10000,
    })

    // Map radius to volume (larger = louder)
    const minRadius = 0.5
    const maxRadius = 20
    const normalizedRadius = (Math.min(maxRadius, Math.max(minRadius, radius)) - minRadius) / (maxRadius - minRadius)
    const volume = 0.1 + normalizedRadius * 0.4

    this.planetSynth?.triggerAttackRelease(frequency, '2n', undefined, volume)
  }

  /**
   * Play a planet selection sound
   * Uses pentatonic scale with consonant intervals for pleasant harmonies
   */
  playPlanetSelect(period: number, radius: number): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification)
      return

    // Map period to pentatonic scale note
    const baseFreq = periodToMusicalNote(period, {
      allowHighOctave: false,
      minPeriod: 1,
      maxPeriod: 10000,
    })

    // Map radius to volume (larger = louder selection)
    const minRadius = 0.5
    const maxRadius = 20
    const normalizedRadius = (Math.min(maxRadius, Math.max(minRadius, radius)) - minRadius) / (maxRadius - minRadius)
    const baseVolume = 0.2 + normalizedRadius * 0.3

    const now = Tone.now()
    // Use consonant intervals (fifth and octave) capped at 800Hz
    this.planetSynth?.triggerAttackRelease(baseFreq, '4n', now, baseVolume)
    this.planetSynth?.triggerAttackRelease(getConsonantInterval(baseFreq, 'fifth'), '4n', now + 0.1, baseVolume * 0.75)
    this.planetSynth?.triggerAttackRelease(getConsonantInterval(baseFreq, 'octave'), '4n', now + 0.2, baseVolume * 0.5)
  }

  // ============ Advanced Planet Sonification ============

  /**
   * Start hovering over a planet (sustained tone)
   */
  startPlanetHover(planet: Planet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.planetSonification?.startHover(planet)
  }

  /**
   * Stop hovering over a planet
   */
  stopPlanetHover(planet: Planet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.planetSonification?.stopHover(planet)
  }

  /**
   * Stop all planet hover sounds
   */
  stopAllPlanetHovers(): void {
    this.planetSonification?.stopAllHovers()
  }

  /**
   * Play planet selection sound with full sonification
   */
  selectPlanet(planet: Planet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.planetSonification?.playSelect(planet)
  }

  /**
   * Start brush selection sound
   */
  startBrushSelection(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.planetSonification?.startBrush()
  }

  /**
   * Update brush selection sound
   * @param size Normalized selection size (0-1)
   */
  updateBrushSelection(size: number): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.planetSonification?.updateBrush(size)
  }

  /**
   * End brush selection with capture sound
   * @param capturedCount Number of planets captured
   */
  endBrushSelection(capturedCount: number): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.planetSonification?.endBrush(capturedCount)
  }

  /**
   * Cancel brush selection without sound
   */
  cancelBrushSelection(): void {
    this.planetSonification?.cancelBrush()
  }

  /**
   * Play narrative step advance sound
   */
  playStepAdvance(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.narration) return
    const now = Tone.now()
    this.uiSynth?.triggerAttackRelease('G4', '16n', now, 0.15)
    this.uiSynth?.triggerAttackRelease('C5', '16n', now + 0.08, 0.2)
  }

  /**
   * Play narrative step back sound
   */
  playStepBack(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.narration) return
    const now = Tone.now()
    this.uiSynth?.triggerAttackRelease('C5', '16n', now, 0.15)
    this.uiSynth?.triggerAttackRelease('G4', '16n', now + 0.08, 0.2)
  }

  // ============ Ambient Soundscape Control ============

  /**
   * Update which detection methods are audible in the ambient soundscape
   */
  setEnabledMethods(methods: DetectionMethodId[]): void {
    if (!this.ambientSoundscape) return
    this.ambientSoundscape.setEnabledMethods(new Set(methods))
  }

  /**
   * Update zoom level for ambient soundscape
   * @param level 0 = zoomed out (dense ambient), 1 = zoomed in (sparse ambient)
   */
  setZoomLevel(level: number): void {
    if (!this.ambientSoundscape) return
    this.ambientSoundscape.setZoomLevel(level)
  }

  // ============ Simulation Audio Control ============

  /**
   * Start system ambient for simulation modal
   */
  startSimulationAmbient(system: SimulatedSystem): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.simulationAudio?.startSystemAmbient(system)
  }

  /**
   * Stop system ambient for simulation modal
   */
  stopSimulationAmbient(): void {
    this.simulationAudio?.stopSystemAmbient()
  }

  /**
   * Start selected planet voice in simulation
   */
  startSimulationPlanetVoice(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.simulationAudio?.startPlanetVoice(planet)
  }

  /**
   * Stop selected planet voice in simulation
   */
  stopSimulationPlanetVoice(): void {
    this.simulationAudio?.stopPlanetVoice()
  }

  /**
   * Play planet hover sound in simulation
   */
  playSimulationPlanetHover(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.simulationAudio?.playPlanetHover(planet)
  }

  /**
   * Play planet selection sound in simulation
   */
  playSimulationPlanetSelect(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.simulationAudio?.playPlanetSelect(planet)
  }

  /**
   * Play simulation speed change sound
   */
  playSimulationSpeedChange(speed: number): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.simulationAudio?.playSpeedChange(speed)
  }

  /**
   * Play simulation pause sound
   */
  playSimulationPause(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.simulationAudio?.playPause()
  }

  /**
   * Play simulation resume sound
   */
  playSimulationResume(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.simulationAudio?.playResume()
  }

  /**
   * Play simulation toggle sound
   */
  playSimulationToggle(enabled: boolean): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.simulationAudio?.playToggle(enabled)
  }

  /**
   * Play simulation modal open sound
   */
  playSimulationModalOpen(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.simulationAudio?.playModalOpen()
  }

  /**
   * Play simulation modal close sound
   */
  playSimulationModalClose(): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.ui) return
    this.simulationAudio?.playModalClose()
  }

  /**
   * Play orbital chime when planet crosses reference point
   * Creates rhythmic pulses synchronized to orbital motion
   */
  playOrbitalChime(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.simulationAudio?.playOrbitalChime(planet)
  }

  /**
   * Play periapsis passage sound
   */
  playPeriapsisPass(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.simulationAudio?.playPeriapsisPass(planet)
  }

  /**
   * Play orbit complete sound
   */
  playOrbitComplete(planet: SimulatedPlanet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.simulationAudio?.playOrbitComplete(planet)
  }

  /**
   * Play conjunction sound
   */
  playConjunction(planet1: SimulatedPlanet, planet2: SimulatedPlanet): void {
    if (!this.initialized || !this.settings.enabled || !this.settings.categories.sonification) return
    this.simulationAudio?.playConjunction(planet1, planet2)
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    }

    // Dispose ambient soundscape
    this.ambientSoundscape?.dispose()

    // Dispose planet sonification
    this.planetSonification?.dispose()

    // Dispose UI sounds
    this.uiSounds?.dispose()

    // Dispose simulation audio
    this.simulationAudio?.dispose()

    this.ambientNoise?.stop()
    this.ambientNoise?.dispose()
    this.ambientFilter?.dispose()
    this.uiSynth?.dispose()
    this.planetSynth?.dispose()
    this.ambientSynth?.dispose()
    this.ambientGain?.dispose()
    this.uiGain?.dispose()
    this.sonificationGain?.dispose()
    this.narrationGain?.dispose()
    this.masterGain?.dispose()

    this.initialized = false
  }
}

// Export singleton instance
export const AudioManager = AudioManagerClass.getInstance()
