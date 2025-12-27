import * as Tone from 'tone'

/**
 * UISounds - Handles all UI audio feedback
 * Provides subtle, non-intrusive sounds for interactions
 */
export class UISounds {
  private initialized = false

  // Output node
  private outputGain: Tone.Gain | null = null

  // Button/Click synth
  private clickSynth: Tone.NoiseSynth | null = null
  private clickFilter: Tone.Filter | null = null

  // Hover synth (airy breath sound)
  private hoverSynth: Tone.Synth | null = null
  private hoverFilter: Tone.Filter | null = null

  // Toggle chime synth
  private chimeSynth: Tone.PolySynth | null = null
  private chimeReverb: Tone.Reverb | null = null

  // Navigation sounds
  private wooshNoise: Tone.Noise | null = null
  private wooshFilter: Tone.Filter | null = null
  private wooshGain: Tone.Gain | null = null
  private isPanning = false

  // Zoom synth
  private zoomSynth: Tone.Synth | null = null
  private zoomFilter: Tone.Filter | null = null

  // Transition synth
  private transitionSynth: Tone.PolySynth | null = null
  private transitionReverb: Tone.Reverb | null = null

  // Sidebar slide synth
  private slideSynth: Tone.NoiseSynth | null = null
  private slideFilter: Tone.Filter | null = null

  constructor(outputNode: Tone.ToneAudioNode) {
    this.outputGain = new Tone.Gain(0.6).connect(outputNode)
  }

  /**
   * Initialize UI sounds
   */
  async init(): Promise<void> {
    if (this.initialized || !this.outputGain) return

    try {
      // ============ Button Click Sound ============
      // Short filtered noise burst for mechanical click feel
      this.clickFilter = new Tone.Filter({
        type: 'bandpass',
        frequency: 3000,
        Q: 2,
      }).connect(this.outputGain)

      this.clickSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.005,
          decay: 0.08,
          sustain: 0,
          release: 0.04,
        },
      }).connect(this.clickFilter)

      // ============ Hover Sound ============
      // Soft airy breath
      this.hoverFilter = new Tone.Filter({
        type: 'highpass',
        frequency: 2000,
      }).connect(this.outputGain)

      this.hoverSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.02,
          decay: 0.06,
          sustain: 0,
          release: 0.02,
        },
      }).connect(this.hoverFilter)

      // ============ Toggle Chime ============
      this.chimeReverb = new Tone.Reverb({ decay: 1.5, wet: 0.4 }).connect(this.outputGain)
      await this.chimeReverb.generate()

      this.chimeSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.1,
          release: 0.5,
        },
      }).connect(this.chimeReverb)

      // ============ Navigation Woosh ============
      this.wooshGain = new Tone.Gain(0).connect(this.outputGain)
      this.wooshFilter = new Tone.Filter({
        type: 'bandpass',
        frequency: 1000,
        Q: 1,
      }).connect(this.wooshGain)

      this.wooshNoise = new Tone.Noise({ type: 'pink' }).connect(this.wooshFilter)

      // ============ Zoom Synth ============
      this.zoomFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 2000,
      }).connect(this.outputGain)

      this.zoomSynth = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.3,
          release: 0.3,
        },
      }).connect(this.zoomFilter)

      // ============ Transition Synth ============
      this.transitionReverb = new Tone.Reverb({ decay: 2, wet: 0.5 }).connect(this.outputGain)
      await this.transitionReverb.generate()

      this.transitionSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.3,
          decay: 0.3,
          sustain: 0.4,
          release: 0.8,
        },
      }).connect(this.transitionReverb)

      // ============ Sidebar Slide ============
      this.slideFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 500,
      }).connect(this.outputGain)

      this.slideSynth = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: {
          attack: 0.05,
          decay: 0.15,
          sustain: 0.1,
          release: 0.1,
        },
      }).connect(this.slideFilter)

      this.initialized = true
      console.log('[UISounds] Initialized')
    } catch (error) {
      console.error('[UISounds] Failed to initialize:', error)
    }
  }

  // ============ Button & Toggle Sounds ============

  /**
   * Play button hover sound - soft breath/air release
   */
  playHover(): void {
    if (!this.initialized || !this.hoverSynth) return
    this.hoverSynth.triggerAttackRelease('C6', '64n', undefined, 0.08)
  }

  /**
   * Play button click sound - gentle mechanical click
   */
  playClick(): void {
    if (!this.initialized || !this.clickSynth) return
    this.clickSynth.triggerAttackRelease('32n', undefined, 0.25)
  }

  /**
   * Play toggle on sound - rising two-note chime (minor 3rd up)
   */
  playToggleOn(): void {
    if (!this.initialized || !this.chimeSynth) return
    const now = Tone.now()
    this.chimeSynth.triggerAttackRelease('E5', '16n', now, 0.25)
    this.chimeSynth.triggerAttackRelease('G5', '16n', now + 0.06, 0.3) // Minor 3rd up
  }

  /**
   * Play toggle off sound - falling two-note chime (minor 3rd down)
   */
  playToggleOff(): void {
    if (!this.initialized || !this.chimeSynth) return
    const now = Tone.now()
    this.chimeSynth.triggerAttackRelease('G5', '16n', now, 0.25)
    this.chimeSynth.triggerAttackRelease('E5', '16n', now + 0.06, 0.2) // Minor 3rd down
  }

  // ============ Navigation Sounds ============

  /**
   * Start pan sound - subtle woosh onset
   */
  startPan(): void {
    if (!this.initialized || !this.wooshNoise || !this.wooshGain || this.isPanning) return

    this.isPanning = true
    // Ensure gain is 0 before starting to avoid clicks
    this.wooshGain.gain.value = 0
    this.wooshNoise.start()
    this.wooshGain.gain.rampTo(0.15, 0.1)
  }

  /**
   * Update pan sound based on velocity
   * @param velocity Normalized velocity (0-1)
   */
  updatePan(velocity: number): void {
    if (!this.initialized || !this.wooshFilter || !this.wooshGain || !this.isPanning) return

    // Higher velocity = higher filter frequency and volume
    const freq = 500 + velocity * 2000
    const vol = 0.05 + velocity * 0.2

    this.wooshFilter.frequency.rampTo(freq, 0.05)
    this.wooshGain.gain.rampTo(vol, 0.05)
  }

  /**
   * End pan sound - gentle deceleration woosh
   */
  endPan(): void {
    if (!this.initialized || !this.wooshNoise || !this.wooshGain || !this.isPanning) return

    this.isPanning = false

    // Fade out with filter sweep down
    this.wooshFilter?.frequency.rampTo(300, 0.3)
    this.wooshGain.gain.rampTo(0, 0.3)

    // Wait for fade to complete before stopping to avoid clicks
    setTimeout(() => {
      if (!this.isPanning) {
        this.wooshNoise?.stop()
      }
    }, 350)
  }

  /**
   * Play zoom in sound - rising pitch sweep + focus click
   */
  playZoomIn(): void {
    if (!this.initialized || !this.zoomSynth || !this.clickSynth) return

    const now = Tone.now()

    // Rising pitch sweep
    this.zoomSynth.triggerAttackRelease('C3', '8n', now, 0.15)
    this.zoomSynth.frequency.setValueAtTime(130, now)
    this.zoomSynth.frequency.exponentialRampToValueAtTime(260, now + 0.15)

    // Focus click at end
    this.clickSynth.triggerAttackRelease('64n', now + 0.12, 0.2)
  }

  /**
   * Play zoom out sound - falling pitch sweep + expansion
   */
  playZoomOut(): void {
    if (!this.initialized || !this.zoomSynth) return

    const now = Tone.now()

    // Falling pitch sweep
    this.zoomSynth.triggerAttackRelease('C4', '8n', now, 0.12)
    this.zoomSynth.frequency.setValueAtTime(260, now)
    this.zoomSynth.frequency.exponentialRampToValueAtTime(130, now + 0.2)
  }

  // ============ Transition Sounds ============

  /**
   * Play axis switch sound - morphing pad crossfade
   */
  playAxisSwitch(): void {
    if (!this.initialized || !this.transitionSynth) return

    const now = Tone.now()

    // Crossfading chord morph
    this.transitionSynth.triggerAttackRelease(['C4', 'E4', 'G4'], '4n', now, 0.15)
    this.transitionSynth.triggerAttackRelease(['D4', 'F4', 'A4'], '4n', now + 0.3, 0.12)
  }

  /**
   * Play view change sound - dimensional shift
   */
  playViewChange(): void {
    if (!this.initialized || !this.transitionSynth || !this.zoomSynth) return

    const now = Tone.now()

    // Whooshing dimensional shift
    this.zoomSynth.triggerAttackRelease('G2', '4n', now, 0.1)
    this.zoomSynth.frequency.setValueAtTime(98, now)
    this.zoomSynth.frequency.exponentialRampToValueAtTime(196, now + 0.2)
    this.zoomSynth.frequency.exponentialRampToValueAtTime(98, now + 0.4)

    // Subtle chord
    this.transitionSynth.triggerAttackRelease(['C3', 'G3'], '2n', now + 0.1, 0.08)
  }

  /**
   * Play filter apply sound - soft sorting/shuffling
   */
  playFilterApply(): void {
    if (!this.initialized || !this.clickSynth || !this.chimeSynth) return

    const now = Tone.now()

    // Quick shuffling clicks
    for (let i = 0; i < 3; i++) {
      this.clickSynth.triggerAttackRelease('64n', now + i * 0.04, 0.1)
    }

    // Confirmation chime
    this.chimeSynth.triggerAttackRelease('A5', '16n', now + 0.15, 0.15)
  }

  /**
   * Play sidebar open sound - mechanical slide + airlock seal
   */
  playSidebarOpen(): void {
    if (!this.initialized || !this.slideSynth || !this.chimeSynth) return

    const now = Tone.now()

    // Sliding sound
    this.slideSynth.triggerAttackRelease('8n', now, 0.2)
    this.slideFilter?.frequency.setValueAtTime(200, now)
    this.slideFilter?.frequency.exponentialRampToValueAtTime(800, now + 0.15)

    // Airlock seal (soft thump)
    this.chimeSynth.triggerAttackRelease('C3', '32n', now + 0.18, 0.2)
  }

  /**
   * Play sidebar close sound - reverse slide
   */
  playSidebarClose(): void {
    if (!this.initialized || !this.slideSynth || !this.chimeSynth) return

    const now = Tone.now()

    // Soft click start
    this.chimeSynth.triggerAttackRelease('C3', '32n', now, 0.15)

    // Sliding sound (reverse)
    this.slideSynth.triggerAttackRelease('8n', now + 0.05, 0.15)
    this.slideFilter?.frequency.setValueAtTime(800, now + 0.05)
    this.slideFilter?.frequency.exponentialRampToValueAtTime(200, now + 0.2)
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    if (this.outputGain) {
      this.outputGain.gain.rampTo(volume * 0.6, 0.1)
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.isPanning && this.wooshGain) {
      // Fade out before stopping to avoid clicks
      this.wooshGain.gain.rampTo(0, 0.1)
      setTimeout(() => this.wooshNoise?.stop(), 150)
    }

    this.clickSynth?.dispose()
    this.clickFilter?.dispose()
    this.hoverSynth?.dispose()
    this.hoverFilter?.dispose()
    this.chimeSynth?.dispose()
    this.chimeReverb?.dispose()
    this.wooshNoise?.dispose()
    this.wooshFilter?.dispose()
    this.wooshGain?.dispose()
    this.zoomSynth?.dispose()
    this.zoomFilter?.dispose()
    this.transitionSynth?.dispose()
    this.transitionReverb?.dispose()
    this.slideSynth?.dispose()
    this.slideFilter?.dispose()
    this.outputGain?.dispose()

    this.initialized = false
  }
}
