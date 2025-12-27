# Soundscape Redesign: Music of the Spheres

## Problem Statement

The current audio implementation produces continuous high-pitched tones that become grating over time. Planets with short orbital periods map to high frequencies, and sustained exposure creates listener fatigue. The goal is to transform the soundscape into something that evokes the "music of the spheres" - ambient, harmonious, and pleasant for extended listening.

---

## Design Philosophy

### 1. Embrace Silence and Space
- Sound should breathe; not every planet needs to be heard constantly
- Use intermittent, evolving tones rather than continuous drones
- Silence is a valid musical element

### 2. Harmonic Constraint
- All pitches should snap to a musical scale (pentatonic or modal)
- Limit dissonance - avoid semitone clashes
- Use consonant intervals (octaves, fifths, fourths, thirds)

### 3. Frequency Ceiling
- Cap maximum frequency at ~800Hz (roughly G5)
- Reserve higher frequencies for brief, sparse accents only
- Anchor the soundscape in the mid-low range (100-400Hz)

### 4. Temporal Variation
- Nothing should be static - all sounds should evolve
- Use slow LFO modulation for subtle movement
- Vary attack/decay envelopes based on planet properties

---

## Revised Pitch Mapping

### Current (Problematic)
```
Orbital Period → Pitch (60Hz - 2000Hz)
Short period = High pitch (grating)
```

### Proposed: Octave-Constrained Scale Mapping

Instead of linear frequency mapping, use:

1. **Base Note Selection**: Map orbital period to a note within a 2-octave range (C2-C4, ~65Hz-262Hz)
2. **Scale Constraint**: Snap to pentatonic scale (C, D, E, G, A) for guaranteed consonance
3. **Harmonic Overtones**: Use timbre/harmonics to suggest "brightness" rather than raw high pitch

```typescript
// Example: Pentatonic scale notes within comfortable range
const SCALE_FREQUENCIES = [
  65.41,   // C2
  73.42,   // D2
  82.41,   // E2
  98.00,   // G2
  110.00,  // A2
  130.81,  // C3
  146.83,  // D3
  164.81,  // E3
  196.00,  // G3
  220.00,  // A3
  261.63,  // C4
]

function periodToNote(periodDays: number): number {
  // Log-scale mapping to scale index
  const logPeriod = Math.log10(Math.max(0.1, periodDays))
  const normalized = (logPeriod + 1) / 5 // -1 to 4 → 0 to 1
  const index = Math.floor(normalized * (SCALE_FREQUENCIES.length - 1))
  return SCALE_FREQUENCIES[Math.max(0, Math.min(index, SCALE_FREQUENCIES.length - 1))]
}
```

---

## Sound Design by Interaction Type

### Hover (Brief Encounter)
**Goal**: Acknowledge the planet without demanding attention

- **Envelope**: Quick fade in (50ms), sustain for hover duration, fade out (200ms)
- **Pitch**: Single note from constrained scale
- **Volume**: Quiet (20-30% of max)
- **Timbre**: Soft sine wave with slight detuning for warmth
- **Variation**: Add subtle vibrato (1-3Hz, ±5 cents)

### Select/Click (Focus)
**Goal**: Musical acknowledgment of selection

- **Envelope**: Gentle attack (100ms), sustained with slow decay
- **Pitch**: Root note + fifth (power chord interval) - always consonant
- **Volume**: Moderate (40-50%)
- **Timbre**: Richer - add 2nd and 3rd harmonics
- **Variation**: Slow filter sweep for evolving texture

### Simulation (Orbital Motion)
**Goal**: Ambient "cosmic music" that rewards extended listening

Rather than continuous tones, use **rhythmic pulses** synchronized to orbital motion:

```
Each planet "chimes" when crossing a reference point (e.g., 12 o'clock position)
- Creates natural rhythm from orbital mechanics
- Faster orbits = more frequent chimes (rhythm, not pitch)
- Avoids sustained high-frequency exposure
```

**Implementation**:
```typescript
interface OrbitalChime {
  planet: SimulatedPlanet
  lastChimeAngle: number

  update(currentAngle: number) {
    // Chime when crossing 0° (top of orbit)
    if (this.lastChimeAngle > 270 && currentAngle < 90) {
      this.playChime()
    }
    this.lastChimeAngle = currentAngle
  }

  playChime() {
    // Short, pleasant bell-like tone
    // Attack: 10ms, Decay: 500ms, no sustain
    // Pitch from constrained scale
    // Volume based on planet size
  }
}
```

---

## Ambient Layer Redesign

### Current Issues
- Static drone textures
- No harmonic relationship between layers
- Can become oppressive over time

### Proposed: Generative Ambient Pad

**Base Layer** (always present when audio enabled):
- Very low frequency (30-60Hz) rumble - felt more than heard
- Slow volume undulation (period: 20-40 seconds)
- Represents the "void of space"

**Harmonic Layer** (based on visible planets):
- Take the 3-5 most prominent planets currently visible
- Extract their scale notes
- Create a slowly evolving chord pad
- Use long attack/release (3-5 seconds) for seamless transitions
- Apply generous reverb for spaciousness

**Texture Layer** (subtle):
- Filtered noise bursts (like distant stellar wind)
- Randomized timing (every 5-15 seconds)
- Very quiet (10-15% volume)

---

## Volume Dynamics

### Master Volume Curve
```
User Volume Setting (0-100%) → Logarithmic curve → Actual gain
- 0% = silence
- 30% (default) = -20dB (subtle background)
- 50% = -12dB (moderate presence)
- 100% = 0dB (full volume, still comfortable)
```

### Per-Element Mixing

| Element | Base Level | Max Level | Notes |
|---------|-----------|-----------|-------|
| Ambient pad | -24dB | -18dB | Always subtle |
| Planet chimes | -18dB | -12dB | Brief, allowed to be present |
| Hover tones | -20dB | -14dB | Acknowledging, not demanding |
| UI sounds | -16dB | -10dB | Clear but not harsh |
| Selection | -14dB | -8dB | Focused attention |

### Ducking
When multiple sounds play simultaneously:
- Apply subtle ducking (3-6dB) to ambient layer
- Prevents muddy accumulation
- Creates natural breathing room

---

## Timbre Palette

### Bell/Chime (Primary)
- Sine wave fundamental
- Inharmonic partials (1.0, 2.4, 4.5, 6.8 ratio) - creates bell-like quality
- Fast decay on higher partials
- Pleasant for repeated exposure

### Pad (Ambient)
- Triangle wave foundation (softer than sawtooth)
- Low-pass filter at 400Hz
- Slow filter LFO for movement
- Generous reverb (2-4 second tail)

### Pulse (Hover/UI)
- Pure sine wave
- Slight detuning (±3 cents) for warmth
- Fast attack, medium release
- No sustain

---

## Implementation Phases

### Phase 1: Frequency Constraints [DONE]
- [x] Implement pentatonic scale mapping function
- [x] Cap maximum frequency at 800Hz
- [x] Update `periodToFrequency()` in audio utilities

### Phase 2: Envelope Overhaul [DONE]
- [x] Replace sustained oscillators with envelope-controlled voices
- [x] Implement bell-like decay for planet chimes
- [x] Add attack/release parameters to all sound sources

### Phase 3: Simulation Rhythmic Chimes
- [ ] Track orbital angle for each planet
- [ ] Trigger chime on orbit completion (crossing reference point)
- [ ] Remove continuous tone playback during simulation

### Phase 4: Ambient Layer Rebuild
- [ ] Create generative chord pad from visible planets
- [ ] Add sub-bass rumble layer
- [ ] Implement slow harmonic evolution

### Phase 5: Mixing and Dynamics
- [ ] Implement logarithmic volume curve
- [ ] Add ducking/sidechain between layers
- [ ] Balance all elements for cohesive soundscape

### Phase 6: Polish
- [ ] Add reverb/space to all elements
- [ ] Test for listener fatigue (10+ minute sessions)
- [ ] A/B test with original implementation

---

## Technical Considerations

### Web Audio API / Tone.js
- Use `Tone.PolySynth` for multiple simultaneous voices
- Implement custom `BellSynth` with inharmonic partials
- Use `Tone.AutoFilter` or `Tone.LFO` for movement
- Apply `Tone.Reverb` globally for cohesive space

### Performance
- Limit active voices to 8-12 maximum
- Use voice stealing for overflow
- Lazy-load audio context (current approach is good)

### Accessibility
- All audio features remain optional
- Visual indicators continue to be primary
- Consider reduced motion/reduced audio preference

---

## Reference: "Music of the Spheres" Aesthetics

The historical concept imagined planetary orbits as producing harmony. Key characteristics:

1. **Slow, stately movement** - not frantic or busy
2. **Mathematical relationships** - intervals derived from orbital ratios
3. **Ethereal quality** - otherworldly but not harsh
4. **Reverence and wonder** - the soundscape should inspire awe

Modern interpretations (Brian Eno ambient, Stars of the Lid, etc.):
- Long, evolving drones
- Consonant harmonies
- Generous reverb and space
- Patient, unhurried pacing
- Subtraction over addition - less is more

---

## Success Criteria

- [ ] No frequency exceeds 800Hz for sustained tones
- [ ] All pitches fall within pentatonic scale
- [ ] No single tone sustains longer than 2 seconds without variation
- [ ] Comfortable for 10+ minute listening sessions
- [ ] Enhances the visualization without demanding attention
- [ ] Clear distinction between interaction types (hover/select/simulation)
- [ ] Simulation mode feels rhythmic/musical, not droning
