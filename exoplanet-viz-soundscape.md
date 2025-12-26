# Exoplanet Demographics Visualization
## Soundscape Design Document

---

## 1. Audio Philosophy

### 1.1 Core Concept: "The Music of the Spheres"

The soundscape should evoke the **profound loneliness and vastness of space** while simultaneously conveying the **wonder of discovery**—that each point of light represents an actual world. The audio exists at the intersection of:

- **Scientific precision** — sounds derived from real data
- **Emotional resonance** — evoking awe, curiosity, mystery
- **Functional clarity** — audio feedback that aids navigation

The overall aesthetic: **cosmic ambient minimalism**. Think Brian Eno's "Apollo" meets the hum of a spacecraft's life support systems meets the gentle ping of a discovery.

### 1.2 Guiding Principles

1. **Subtlety First**: Audio should enhance, never overwhelm. Default volume at 30%.
2. **Opt-In Experience**: Sound off by default; gentle prompt to enable.
3. **Data as Music**: Where possible, sonify actual planetary properties.
4. **Breathing Room**: Embrace silence and space between sounds.
5. **Accessibility**: All audio must have visual equivalents; no critical info audio-only.

---

## 2. Ambient Soundscape

### 2.1 Base Layer: "The Void"

A continuous, barely perceptible drone that establishes the cosmic context.

```
Composition:
├── Sub-bass drone (25-40 Hz) — felt more than heard
├── Filtered white noise — like cosmic microwave background radiation
├── Occasional deep "whale song" tones — stars breathing
└── Subtle granular texture — dust and time
```

**Technical Specs:**
- Duration: Seamless 8-minute loop with crossfade
- Dynamic range: -40dB to -25dB (very quiet)
- Stereo field: Wide, immersive, slight movement

**Emotional Quality:** Vastness, solitude, deep time, the silence between stars

### 2.2 Detection Method Textures

Each detection method adds its own subtle textural layer when enabled:

#### Radial Velocity (RV)
```
Sound: Gentle Doppler-shifted pulse
Character: A soft "wub-wub" oscillation, like a heartbeat heard through water
Metaphor: The star's wobble translated to sound
Pitch: Varies with stellar mass (lower = more massive stars)
```

#### Transit (Kepler/TESS)
```
Sound: Soft crystalline chimes, slightly detuned
Character: Brief, delicate "ting" sounds at irregular intervals
Metaphor: Light dipping as planets cross their stars
Rhythm: Sparse, like distant wind chimes
```

#### Microlensing
```
Sound: Deep, slow crescendo-decrescendo swells
Character: A "passing" sound, like something massive moving by
Metaphor: Gravitational bending of spacetime
Duration: Long, patient, infrequent
```

#### Direct Imaging
```
Sound: Warm, sustained pad tones
Character: Like sunlight translated to sound
Metaphor: Actually seeing the planet's light
Quality: Slightly granular, textured warmth
```

### 2.3 Zoom-Responsive Ambience

As users zoom in, the soundscape should shift:

| Zoom Level | Ambient Character |
|------------|-------------------|
| Full view (all planets) | Dense, busy, many overlapping tones |
| Mid zoom | Clearer, individual planets become distinguishable |
| Close zoom | Sparse, intimate, individual planet "voices" audible |
| Single planet | Near silence, just that world's signature |

---

## 3. Data Sonification

### 3.1 Planet Voice System

Each planet has a unique "voice" derived from its properties:

```
Planet Voice = f(mass, radius, period, temperature, detection_method)

Parameters:
├── Pitch (Hz) ← Orbital period (shorter period = higher pitch)
│   └── Range: 60 Hz (10-year orbit) to 2000 Hz (1-day orbit)
│
├── Timbre ← Planet type/composition
│   ├── Rocky: Pure sine wave, slight distortion
│   ├── Sub-Neptune: Sine + subtle harmonics
│   ├── Gas Giant: Rich, complex harmonics (sawtooth-ish)
│   └── Brown Dwarf: Very low, almost subharmonic growl
│
├── Volume ← Planet radius (larger = louder)
│   └── Range: -30dB (Earth-size) to -10dB (Jupiter-size)
│
├── Stereo Position ← Semi-major axis
│   └── Close-in planets: Center; Far out: Wide stereo
│
└── Envelope ← Orbital eccentricity
    └── Circular: Smooth, sustained
    └── Eccentric: Pulsing, dynamic
```

### 3.2 Hover Sonification

When hovering over a planet:

```
Trigger: Mouse enters planet hitbox
Sound: Planet's voice fades in (500ms attack)
Behavior: Sustained drone at that planet's pitch/timbre
Exit: 1-second fade out when mouse leaves
```

**Example Planet Sounds:**

| Planet Type | Period | Sound Description |
|-------------|--------|-------------------|
| Hot Jupiter | 3 days | High-pitched (~800 Hz), rich harmonics, loud, centered |
| Super-Earth | 30 days | Mid-pitch (~300 Hz), pure tone, medium volume |
| Cold Neptune | 5 years | Low (~80 Hz), breathy texture, wide stereo |
| Earth analog | 365 days | ~180 Hz, pure sine, quiet, gentle vibrato |

### 3.3 Solar System Reference Tones

Our Solar System planets have distinct, recognizable sounds:

```
Mercury: Quick, high ping (like a small bell)
Venus:   Thick, hazy drone (atmosphere)
Earth:   Warm, familiar hum (home frequency: 136.1 Hz - "Om")
Mars:    Dusty, thin whistle
Jupiter: Deep, powerful brass-like tone
Saturn:  Shimmering, ringed texture (chorus effect)
Uranus:  Cold, tilted, slightly unsettling
Neptune: Deep blue, distant, melancholic
```

These play as identification tones when hovering over Solar System markers.

---

## 4. Interaction Sounds

### 4.1 UI Sound Palette

All UI sounds share a cohesive aesthetic: **soft, rounded, slightly metallic**—like touching controls on a spacecraft.

#### Buttons & Toggles
```yaml
button_hover:
  sound: Soft breath/air release
  duration: 80ms
  character: "fwip"
  
button_click:
  sound: Gentle mechanical click
  duration: 120ms
  character: "tck" with subtle reverb tail
  
toggle_on:
  sound: Rising two-note chime (minor 3rd up)
  duration: 200ms
  character: Confirmation, activation
  
toggle_off:
  sound: Falling two-note chime (minor 3rd down)
  duration: 200ms
  character: Deactivation, closing
```

#### Navigation
```yaml
pan_start:
  sound: Subtle woosh onset
  duration: 150ms
  
pan_continuous:
  sound: Filtered noise tied to pan velocity
  character: Like moving through atmosphere
  
pan_end:
  sound: Gentle deceleration woosh
  duration: 300ms
  
zoom_in:
  sound: Rising pitch sweep + "focusing" click
  character: Convergence, approaching
  
zoom_out:
  sound: Falling pitch sweep + expansion
  character: Pulling back, widening view
```

#### Selection & Filtering
```yaml
planet_select:
  sound: Resonant "ping" + planet's voice briefly swells
  duration: 400ms
  character: Discovery, focus
  
filter_apply:
  sound: Soft "sorting" sound (like cards shuffling gently)
  duration: 300ms
  character: Organization, refinement
  
brush_select:
  sound: Drawing/scratching texture while dragging
  complete: Satisfying "capture" sound
```

### 4.2 Transition Sounds

```yaml
axis_switch:
  sound: Morphing pad (crossfade between two textures)
  duration: 800ms (matches animation)
  character: Transformation, different perspective
  
view_change:
  sound: Dimensional shift (like passing through membrane)
  duration: 500ms
  character: Moving between views
  
sidebar_open:
  sound: Gentle mechanical slide + airlock-like seal
  duration: 400ms
  
sidebar_close:
  sound: Reverse of open
  duration: 350ms
```

---

## 5. Narrative Mode Audio

### 5.1 Voice-Over Considerations

The guided tour can include optional narration:

**Voice Character:**
- Warm, curious, slightly awestruck
- Gender-neutral or offer choice
- Pace: Measured, with room to breathe
- Think: Documentary narrator meets podcast host

**Script Tone Example:**
> "Four thousand worlds. That's how many we've confirmed so far. And the strangest thing? The most common type of planet in the galaxy... doesn't exist in our Solar System."

### 5.2 Narrative Transition Sounds

```yaml
step_advance:
  sound: Page turn + soft chime
  duration: 400ms
  character: Progression, new chapter

step_back:
  sound: Reverse page turn
  duration: 350ms
  
story_begin:
  sound: Orchestral swell (strings, very subtle)
  duration: 2 seconds
  character: Embarkation, journey beginning
  
story_end:
  sound: Resolve to tonic, gentle fade with reverb
  duration: 3 seconds
  character: Completion, contemplation
```

### 5.3 Moment Sounds

Special narrative moments get unique audio treatment:

```yaml
reveal_bias_overlay:
  description: "The blind spots appear"
  sound: Unsettling, hollow resonance
  character: What we cannot see, the unknown
  
show_hot_neptune_desert:
  description: "The mysterious absence"
  sound: Absence of expected tone, conspicuous silence
  character: Something missing, a gap
  
eta_earth_reveal:
  description: "5-50% of stars might have an Earth"
  sound: Hopeful rising sequence, unresolved
  character: Possibility, uncertainty, hope
  
solar_system_context:
  description: "We appear in the cosmic census"
  sound: Home frequency (136.1 Hz) swells warmly
  character: Recognition, belonging, familiarity
```

---

## 6. Occurrence Rate Sonification

### 6.1 Heatmap Audio

The occurrence rate heatmap can be "played":

```
Mode: Hover-to-play
Behavior: As cursor moves across cells, pitch/volume represents rate

Mapping:
├── Occurrence Rate → Volume
│   └── 0.1% = barely audible; 50% = prominent
│
├── Mass axis → Pitch
│   └── Low mass (bottom) = high pitch; High mass (top) = low pitch
│
└── Period axis → Stereo position
    └── Short period (left) = left channel; Long period = right
```

### 6.2 "Play the Galaxy" Mode

An experimental feature: auto-play through parameter space

```
Sequence: Sweep from short-period/low-mass to long-period/high-mass
Duration: 30-60 seconds
Result: A musical phrase representing the planet distribution
Character: What does the galaxy's planetary census sound like?
```

---

## 7. Accessibility & Options

### 7.1 Audio Settings Panel

```
┌─────────────────────────────────────┐
│ 🔊 Audio Settings                   │
├─────────────────────────────────────┤
│ Master Volume      [━━━━━●━━━] 60%  │
│                                     │
│ ☑ Ambient Soundscape               │
│ ☑ UI Feedback Sounds               │
│ ☑ Data Sonification                │
│ ☐ Narration Voice-over             │
│                                     │
│ ─────────────────────────           │
│ Sonification Complexity:            │
│ ○ Simple (pitch only)              │
│ ● Standard (pitch + timbre)        │
│ ○ Rich (full voice system)         │
│                                     │
│ ─────────────────────────           │
│ ☑ Reduce motion-triggered sounds   │
│ ☐ Screen reader announcements      │
└─────────────────────────────────────┘
```

### 7.2 Accessibility Features

- **Screen Reader Mode**: Key state changes announced audibly
- **Reduced Sound Mode**: Only essential feedback, no ambient
- **Visual Alternatives**: All audio feedback has visual equivalent
- **Captions**: Narration fully captioned
- **Volume Memory**: Saves user's preferred levels

---

## 8. Technical Implementation

### 8.1 Audio Engine

```typescript
// Recommended: Tone.js for Web Audio synthesis
import * as Tone from 'tone';

// Audio Manager singleton
class AudioManager {
  private ambient: Tone.Player;
  private planetSynth: Tone.PolySynth;
  private uiSampler: Tone.Sampler;
  
  // Planet voice from properties
  getPlanetVoice(planet: Planet): ToneSettings {
    return {
      frequency: this.periodToFrequency(planet.period),
      volume: this.radiusToVolume(planet.radius),
      timbre: this.typeToTimbre(planet.type),
      pan: this.separationToPan(planet.separation)
    };
  }
  
  // Logarithmic mapping for period → frequency
  periodToFrequency(periodDays: number): number {
    // 1 day → 2000 Hz, 10 years → 60 Hz
    const minPeriod = 1, maxPeriod = 3650;
    const minFreq = 60, maxFreq = 2000;
    const normalized = Math.log(periodDays / minPeriod) / Math.log(maxPeriod / minPeriod);
    return maxFreq * Math.pow(minFreq / maxFreq, normalized);
  }
}
```

### 8.2 Asset Pipeline

```
/audio
├── ambient/
│   ├── base-void.mp3          # 8-minute seamless loop
│   ├── rv-texture.mp3         # Method-specific layers
│   ├── transit-chimes.mp3
│   ├── microlens-swell.mp3
│   └── imaging-warmth.mp3
│
├── ui/
│   ├── button-hover.mp3
│   ├── button-click.mp3
│   ├── toggle-on.mp3
│   ├── toggle-off.mp3
│   ├── select-ping.mp3
│   ├── zoom-in.mp3
│   ├── zoom-out.mp3
│   └── transition-morph.mp3
│
├── narrative/
│   ├── story-begin.mp3
│   ├── step-advance.mp3
│   ├── reveal-moment.mp3
│   └── story-end.mp3
│
├── solar-system/
│   ├── mercury.mp3
│   ├── venus.mp3
│   ├── earth.mp3
│   ├── mars.mp3
│   ├── jupiter.mp3
│   ├── saturn.mp3
│   ├── uranus.mp3
│   └── neptune.mp3
│
└── vo/ (optional voice-over)
    ├── intro.mp3
    ├── step-01.mp3
    └── ... 
```

### 8.3 Performance Considerations

1. **Lazy Loading**: Load ambient after initial render
2. **Audio Sprites**: Combine UI sounds into single file
3. **Web Audio Pools**: Reuse synth voices, limit polyphony to 8
4. **Suspend When Hidden**: Pause audio context when tab inactive
5. **Mobile Battery**: Reduce ambient complexity on mobile

---

## 9. Emotional Journey Map

The soundscape should guide users through an emotional arc:

```
Entry (Landing)
│ Silence... then the void fades in
│ Feeling: Arrival in vastness
│
├─► Exploration (Interactive)
│   │ Planet voices respond to curiosity
│   │ Feeling: Discovery, agency, wonder
│   │
│   ├─► Finding the Familiar
│   │   │ Solar System tones = recognition
│   │   │ Feeling: "We are here too"
│   │   │
│   ├─► Seeing the Biases
│   │   │ Hollow absence, what we can't detect
│   │   │ Feeling: Humility, incompleteness
│   │   │
│   └─► The Common Aliens
│       │ Super-Earths everywhere, unfamiliar
│       │ Feeling: Strangeness, reframing
│
└─► Reflection (Exit)
    │ Music resolves, ambience fades
    │ Feeling: Awe, contemplation, smallness-and-significance
```

---

## 10. Reference & Inspiration

### 10.1 Musical References

- **Brian Eno** — "Apollo: Atmospheres & Soundtracks" (cosmic ambience)
- **Stars of the Lid** — "And Their Refinement of the Decline" (deep drone)
- **Biosphere** — "Substrata" (cold, vast, environmental)
- **Ryuichi Sakamoto** — "async" (texture, space, electronics)
- **Hildur Guðnadóttir** — "Chernobyl" (dread and beauty in science)

### 10.2 Sound Design References

- **No Man's Sky** — Procedural planet sounds, scale
- **Outer Wilds** — Discovery sounds, intimacy in vastness
- **Stellaris** — UI sounds, sci-fi without cliché
- **EVE Online** — Ambient space, mechanical interfaces
- **Interstellar (film)** — Organ swells, time dilation, silence

### 10.3 Data Sonification References

- **NASA Sonifications** — Black hole sounds, solar wind
- **Mark Ballora** — Climate data as music
- **Carla Scaletti** — Seismic sonification

---

## Appendix: Sample Audio Direction Script

For working with a sound designer:

> **Brief for "The Void" Ambient Layer:**
> 
> Imagine floating in deep space, millions of miles from anything. It's not silent—there's a presence. The cosmic microwave background radiation, if you could hear it, would sound like this: a vast, almost-subliminal hum. Occasionally, something larger moves through the darkness—not threatening, just immense. The sound should feel like time measured in billions of years. 
>
> Technical: 8-minute seamless loop, primarily 25-80 Hz content, stereo field should feel enveloping, occasional swells no louder than -25dB, overall level around -35dB. Should feel present but never demand attention.

> **Brief for Planet Select "Ping":**
>
> The moment of discovery. You've found a world. The sound should feel like a small revelation—not a dramatic orchestral hit, but a quiet "there you are." Think: the gentlest possible sonar ping combined with a wine glass being softly struck. There should be a brief harmonic "tail" that suggests the planet's voice is about to speak.
>
> Technical: 400ms total duration, initial transient ~50ms, decay with ~2s reverb tail, pitch around 800-1200 Hz, hint of chorus/shimmer, volume -15dB peak.

---

*Document Version: 1.0*
*Companion to: Exoplanet Demographics Visualization Build Plan*
*Sound Design Phase: Pre-production*
