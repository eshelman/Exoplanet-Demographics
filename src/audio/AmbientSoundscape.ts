import * as Tone from 'tone'
import type { DetectionMethodId } from '../types'

/**
 * AmbientSoundscape - Creates an immersive ambient audio environment
 * that responds to the visualization state
 */
export class AmbientSoundscape {
  private initialized = false
  private playing = false

  // Master output for ambient sounds
  private ambientGain: Tone.Gain | null = null

  // Base layer: "The Void"
  private bassDrone: Tone.Synth | null = null
  private bassDroneGain: Tone.Gain | null = null
  private noiseSource: Tone.Noise | null = null
  private noiseFilter: Tone.Filter | null = null
  private noiseGain: Tone.Gain | null = null

  // Whale song tones
  private whaleSynth: Tone.Synth | null = null
  private whaleReverb: Tone.Reverb | null = null
  private whaleGain: Tone.Gain | null = null
  private whaleInterval: ReturnType<typeof setInterval> | null = null

  // Detection method layers
  private methodLayers: Map<DetectionMethodId, {
    synth: Tone.Synth | Tone.PolySynth | Tone.Noise
    gain: Tone.Gain
    effects: Tone.ToneAudioNode[]
    interval?: ReturnType<typeof setInterval>
  }> = new Map()

  // Zoom level (0-1, where 0 is zoomed out, 1 is zoomed in)
  private zoomLevel = 0

  constructor(outputNode: Tone.ToneAudioNode) {
    this.ambientGain = new Tone.Gain(0.5).connect(outputNode)
  }

  /**
   * Initialize all ambient sound layers
   */
  async init(): Promise<void> {
    if (this.initialized || !this.ambientGain) return

    try {
      // ============ Base Layer: The Void ============

      // Sub-bass drone (25-40 Hz)
      this.bassDroneGain = new Tone.Gain(0.3).connect(this.ambientGain)
      this.bassDrone = new Tone.Synth({
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 4,
          decay: 2,
          sustain: 1,
          release: 4,
        },
      }).connect(this.bassDroneGain)

      // Filtered brown noise texture
      this.noiseGain = new Tone.Gain(0.15).connect(this.ambientGain)
      this.noiseFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 150,
        Q: 0.5,
      }).connect(this.noiseGain)
      this.noiseSource = new Tone.Noise({
        type: 'brown',
      }).connect(this.noiseFilter)

      // Whale song synth with reverb
      this.whaleGain = new Tone.Gain(0.2).connect(this.ambientGain)
      this.whaleReverb = new Tone.Reverb({
        decay: 8,
        wet: 0.7,
      }).connect(this.whaleGain)
      await this.whaleReverb.generate()

      this.whaleSynth = new Tone.Synth({
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 3,
          decay: 2,
          sustain: 0.3,
          release: 5,
        },
      }).connect(this.whaleReverb)

      // ============ Detection Method Layers ============
      await this.initMethodLayers()

      this.initialized = true
      console.log('[AmbientSoundscape] Initialized')
    } catch (error) {
      console.error('[AmbientSoundscape] Failed to initialize:', error)
    }
  }

  /**
   * Initialize detection method audio layers
   */
  private async initMethodLayers(): Promise<void> {
    if (!this.ambientGain) return

    // Radial Velocity: Doppler-shifted pulse oscillation
    const rvGain = new Tone.Gain(0).connect(this.ambientGain)
    const rvTremolo = new Tone.Tremolo({
      frequency: 0.5,
      depth: 0.8,
      wet: 1,
    }).connect(rvGain).start()
    const rvSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 1 },
    }).connect(rvTremolo)

    this.methodLayers.set('radial-velocity', {
      synth: rvSynth,
      gain: rvGain,
      effects: [rvTremolo],
    })

    // Transit (Kepler): Crystalline chimes at irregular intervals
    const transitGain = new Tone.Gain(0).connect(this.ambientGain)
    const transitReverb = new Tone.Reverb({ decay: 4, wet: 0.6 }).connect(transitGain)
    await transitReverb.generate()
    const transitSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 2 },
    }).connect(transitReverb)

    this.methodLayers.set('transit-kepler', {
      synth: transitSynth,
      gain: transitGain,
      effects: [transitReverb],
    })

    // Transit (Other): Similar but slightly different character
    const transitOtherGain = new Tone.Gain(0).connect(this.ambientGain)
    const transitOtherReverb = new Tone.Reverb({ decay: 3, wet: 0.5 }).connect(transitOtherGain)
    await transitOtherReverb.generate()
    const transitOtherSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0, release: 1.5 },
    }).connect(transitOtherReverb)

    this.methodLayers.set('transit-other', {
      synth: transitOtherSynth,
      gain: transitOtherGain,
      effects: [transitOtherReverb],
    })

    // Microlensing: Deep crescendo-decrescendo swells
    const microGain = new Tone.Gain(0).connect(this.ambientGain)
    const microFilter = new Tone.Filter({ type: 'lowpass', frequency: 400 }).connect(microGain)
    const microSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 4, decay: 1, sustain: 0.5, release: 4 },
    }).connect(microFilter)

    this.methodLayers.set('microlensing', {
      synth: microSynth,
      gain: microGain,
      effects: [microFilter],
    })

    // Direct Imaging: Warm sustained pad tones
    const diGain = new Tone.Gain(0).connect(this.ambientGain)
    const diChorus = new Tone.Chorus({ frequency: 0.5, depth: 0.5, wet: 0.5 }).connect(diGain).start()
    const diSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 },
    }).connect(diChorus)

    this.methodLayers.set('direct-imaging', {
      synth: diSynth,
      gain: diGain,
      effects: [diChorus],
    })

    // Astrometry: Subtle wobbling tone
    const astroGain = new Tone.Gain(0).connect(this.ambientGain)
    const astroVibrato = new Tone.Vibrato({ frequency: 2, depth: 0.3 }).connect(astroGain)
    const astroSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 1, decay: 0.5, sustain: 0.7, release: 2 },
    }).connect(astroVibrato)

    this.methodLayers.set('astrometry', {
      synth: astroSynth,
      gain: astroGain,
      effects: [astroVibrato],
    })
  }

  /**
   * Start the ambient soundscape
   */
  start(): void {
    if (!this.initialized || this.playing) return

    this.playing = true

    // Start base layer
    this.noiseSource?.start()

    // Start bass drone - slowly modulating between 25-40 Hz
    this.playBassDrone()

    // Start whale songs at random intervals
    this.startWhaleSongs()

    // Start method-specific textures
    this.startMethodTextures()

    console.log('[AmbientSoundscape] Started')
  }

  /**
   * Stop the ambient soundscape
   */
  stop(): void {
    if (!this.playing) return

    this.playing = false

    // Stop noise
    this.noiseSource?.stop()

    // Stop whale song interval
    if (this.whaleInterval) {
      clearInterval(this.whaleInterval)
      this.whaleInterval = null
    }

    // Stop method intervals
    this.methodLayers.forEach((layer) => {
      if (layer.interval) {
        clearInterval(layer.interval)
        layer.interval = undefined
      }
    })

    console.log('[AmbientSoundscape] Stopped')
  }

  /**
   * Play the sub-bass drone with slow modulation
   */
  private playBassDrone(): void {
    if (!this.bassDrone || !this.playing) return

    // Random frequency between 25-40 Hz
    const freq = 25 + Math.random() * 15
    this.bassDrone.triggerAttack(freq)

    // Schedule next drone note
    setTimeout(() => {
      if (this.playing) {
        this.bassDrone?.triggerRelease()
        setTimeout(() => this.playBassDrone(), 2000)
      }
    }, 8000 + Math.random() * 4000)
  }

  /**
   * Start whale song tones at random intervals
   */
  private startWhaleSongs(): void {
    const playWhale = () => {
      if (!this.whaleSynth || !this.playing) return

      // Whale song notes - low frequencies with pitch bends
      const baseFreq = 40 + Math.random() * 60 // 40-100 Hz
      const duration = 2 + Math.random() * 3

      this.whaleSynth.triggerAttackRelease(baseFreq, duration)

      // Occasionally play a second note
      if (Math.random() > 0.6) {
        setTimeout(() => {
          if (this.playing && this.whaleSynth) {
            const secondFreq = baseFreq * (1 + Math.random() * 0.5)
            this.whaleSynth.triggerAttackRelease(secondFreq, duration * 0.7)
          }
        }, 500 + Math.random() * 1000)
      }
    }

    // Play first whale song
    setTimeout(playWhale, 3000 + Math.random() * 5000)

    // Schedule random whale songs
    this.whaleInterval = setInterval(() => {
      if (this.playing && Math.random() > 0.5) {
        playWhale()
      }
    }, 15000 + Math.random() * 20000)
  }

  /**
   * Start method-specific ambient textures
   */
  private startMethodTextures(): void {
    // Transit chimes - random crystalline notes
    const transitLayer = this.methodLayers.get('transit-kepler')
    if (transitLayer) {
      const chimeNotes = ['C5', 'E5', 'G5', 'B5', 'D6', 'F#6']
      transitLayer.interval = setInterval(() => {
        if (this.playing && transitLayer.gain.gain.value > 0) {
          const synth = transitLayer.synth as Tone.PolySynth
          const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)]
          synth.triggerAttackRelease(note, '8n', undefined, 0.1 + Math.random() * 0.2)
        }
      }, 2000 + Math.random() * 3000)
    }

    // Transit other - similar chimes
    const transitOtherLayer = this.methodLayers.get('transit-other')
    if (transitOtherLayer) {
      const chimeNotes = ['D5', 'F5', 'A5', 'C6', 'E6']
      transitOtherLayer.interval = setInterval(() => {
        if (this.playing && transitOtherLayer.gain.gain.value > 0) {
          const synth = transitOtherLayer.synth as Tone.PolySynth
          const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)]
          synth.triggerAttackRelease(note, '8n', undefined, 0.1 + Math.random() * 0.15)
        }
      }, 2500 + Math.random() * 4000)
    }

    // Radial velocity - sustained pulsing tone
    const rvLayer = this.methodLayers.get('radial-velocity')
    if (rvLayer) {
      const rvSynth = rvLayer.synth as Tone.Synth
      // Start a low sustained tone
      if (rvLayer.gain.gain.value > 0) {
        rvSynth.triggerAttack(55) // A1
      }
    }

    // Microlensing - occasional deep swells
    const microLayer = this.methodLayers.get('microlensing')
    if (microLayer) {
      microLayer.interval = setInterval(() => {
        if (this.playing && microLayer.gain.gain.value > 0) {
          const synth = microLayer.synth as Tone.Synth
          const freq = 30 + Math.random() * 20
          synth.triggerAttackRelease(freq, '4n')
        }
      }, 8000 + Math.random() * 12000)
    }

    // Direct imaging - warm pad chords
    const diLayer = this.methodLayers.get('direct-imaging')
    if (diLayer) {
      const chords = [
        ['C3', 'E3', 'G3'],
        ['D3', 'F3', 'A3'],
        ['E3', 'G3', 'B3'],
      ]
      let chordIndex = 0
      diLayer.interval = setInterval(() => {
        if (this.playing && diLayer.gain.gain.value > 0) {
          const synth = diLayer.synth as Tone.PolySynth
          synth.triggerAttackRelease(chords[chordIndex], '2n', undefined, 0.15)
          chordIndex = (chordIndex + 1) % chords.length
        }
      }, 10000 + Math.random() * 5000)
    }

    // Astrometry - subtle wobbling tone
    const astroLayer = this.methodLayers.get('astrometry')
    if (astroLayer && astroLayer.gain.gain.value > 0) {
      const synth = astroLayer.synth as Tone.Synth
      synth.triggerAttack(110) // A2
    }
  }

  /**
   * Update which detection methods are audible
   */
  setEnabledMethods(methods: Set<DetectionMethodId>): void {
    this.methodLayers.forEach((layer, methodId) => {
      const shouldBeEnabled = methods.has(methodId)
      const targetGain = shouldBeEnabled ? 0.3 : 0

      // Smooth transition
      layer.gain.gain.rampTo(targetGain, 1)

      // Handle sustained tones
      if (methodId === 'radial-velocity' || methodId === 'astrometry') {
        const synth = layer.synth as Tone.Synth
        if (shouldBeEnabled && this.playing) {
          synth.triggerAttack(methodId === 'radial-velocity' ? 55 : 110)
        } else {
          synth.triggerRelease()
        }
      }
    })
  }

  /**
   * Update the zoom level (affects ambient density)
   * @param level 0 = zoomed out (dense), 1 = zoomed in (sparse)
   */
  setZoomLevel(level: number): void {
    this.zoomLevel = Math.max(0, Math.min(1, level))

    if (!this.initialized) return

    // Adjust volumes based on zoom
    // Zoomed out = more ambient, zoomed in = less ambient
    const ambientVolume = 0.5 * (1 - this.zoomLevel * 0.7)

    if (this.ambientGain) {
      this.ambientGain.gain.rampTo(ambientVolume, 0.5)
    }

    // Adjust noise filter - more open when zoomed out
    if (this.noiseFilter) {
      const filterFreq = 150 - this.zoomLevel * 100
      this.noiseFilter.frequency.rampTo(Math.max(50, filterFreq), 0.5)
    }

    // Adjust method layer volumes
    this.methodLayers.forEach((layer) => {
      if (layer.gain.gain.value > 0) {
        const adjustedGain = 0.3 * (1 - this.zoomLevel * 0.6)
        layer.gain.gain.rampTo(adjustedGain, 0.5)
      }
    })
  }

  /**
   * Set master volume for ambient sounds
   */
  setVolume(volume: number): void {
    if (this.ambientGain) {
      this.ambientGain.gain.rampTo(volume * 0.5, 0.1)
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop()

    // Dispose base layer
    this.bassDrone?.dispose()
    this.bassDroneGain?.dispose()
    this.noiseSource?.dispose()
    this.noiseFilter?.dispose()
    this.noiseGain?.dispose()
    this.whaleSynth?.dispose()
    this.whaleReverb?.dispose()
    this.whaleGain?.dispose()

    // Dispose method layers
    this.methodLayers.forEach((layer) => {
      layer.synth.dispose()
      layer.gain.dispose()
      layer.effects.forEach((effect) => effect.dispose())
    })
    this.methodLayers.clear()

    this.ambientGain?.dispose()
    this.initialized = false
  }
}
