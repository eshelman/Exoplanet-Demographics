/**
 * Musical scale utilities for pleasant sonification
 *
 * Implements "Music of the Spheres" design philosophy:
 * - Constrain all pitches to pentatonic scale for guaranteed consonance
 * - Cap maximum frequency at 800Hz to avoid grating high-pitched tones
 * - Use mid-low range (65-800Hz) as the primary frequency space
 */

/**
 * C Major Pentatonic scale frequencies across comfortable range (C2 to G5)
 * Notes: C, D, E, G, A (no semitone clashes, always consonant)
 *
 * Range: ~65Hz to ~784Hz (just under 800Hz ceiling)
 */
export const PENTATONIC_FREQUENCIES = [
  // Octave 2 (deep, felt more than heard)
  65.41, // C2
  73.42, // D2
  82.41, // E2
  98.0, // G2
  110.0, // A2

  // Octave 3 (warm foundation)
  130.81, // C3
  146.83, // D3
  164.81, // E3
  196.0, // G3
  220.0, // A3

  // Octave 4 (clear, present)
  261.63, // C4 (middle C)
  293.66, // D4
  329.63, // E4
  392.0, // G4
  440.0, // A4 (concert pitch)

  // Octave 5 (bright accents only - limited use)
  523.25, // C5
  587.33, // D5
  659.26, // E5
  783.99, // G5 (near 800Hz ceiling)
] as const

/**
 * Maximum allowed frequency for sustained tones
 * Higher frequencies reserved for brief UI accents only
 */
export const MAX_SUSTAINED_FREQUENCY = 800

/**
 * Minimum frequency (sub-bass, felt more than heard)
 */
export const MIN_FREQUENCY = 65

/**
 * Default frequency range for comfortable listening
 */
export const COMFORTABLE_RANGE = {
  min: 80, // Low but audible
  max: 440, // A4 - pleasant upper bound for sustained tones
}

/**
 * Snap a frequency to the nearest note in the pentatonic scale
 */
export function snapToPentatonic(frequency: number): number {
  // Clamp to valid range
  const clamped = Math.max(MIN_FREQUENCY, Math.min(MAX_SUSTAINED_FREQUENCY, frequency))

  // Find closest scale note
  let closest: number = PENTATONIC_FREQUENCIES[0]
  let minDiff = Math.abs(clamped - closest)

  for (const note of PENTATONIC_FREQUENCIES) {
    const diff = Math.abs(clamped - note)
    if (diff < minDiff) {
      minDiff = diff
      closest = note
    }
  }

  return closest
}

/**
 * Map orbital period to a pentatonic scale note
 *
 * Uses logarithmic mapping:
 * - Short periods (0.5 days) → higher notes (up to ~440Hz for sustained, ~784Hz for brief)
 * - Long periods (10000 days) → lower notes (down to ~65Hz)
 *
 * @param periodDays Orbital period in Earth days
 * @param options Configuration options
 * @returns Frequency in Hz, snapped to pentatonic scale
 */
export function periodToMusicalNote(
  periodDays: number,
  options: {
    /** Use full range including higher octave (for brief sounds) */
    allowHighOctave?: boolean
    /** Minimum period to map (default: 0.5 days) */
    minPeriod?: number
    /** Maximum period to map (default: 10000 days) */
    maxPeriod?: number
  } = {}
): number {
  const { allowHighOctave = false, minPeriod = 0.5, maxPeriod = 10000 } = options

  // Determine which notes to use based on allowHighOctave
  const availableNotes = allowHighOctave
    ? PENTATONIC_FREQUENCIES
    : PENTATONIC_FREQUENCIES.slice(0, 15) // Up to A4 (440Hz) for sustained

  const clampedPeriod = Math.max(minPeriod, Math.min(maxPeriod, periodDays))

  // Logarithmic mapping
  const logPeriod = Math.log10(clampedPeriod)
  const logMin = Math.log10(minPeriod)
  const logMax = Math.log10(maxPeriod)

  // Normalize to 0-1 (inverted: short period = higher index)
  const normalized = 1 - (logPeriod - logMin) / (logMax - logMin)

  // Map to scale index
  const index = Math.round(normalized * (availableNotes.length - 1))
  const clampedIndex = Math.max(0, Math.min(availableNotes.length - 1, index))

  return availableNotes[clampedIndex]
}

/**
 * Get a consonant interval above a base frequency
 * Returns frequencies that form pleasant harmonies
 */
export function getConsonantInterval(
  baseFreq: number,
  interval: 'octave' | 'fifth' | 'fourth' | 'majorThird'
): number {
  const ratios = {
    octave: 2,
    fifth: 1.5, // 3:2 ratio
    fourth: 4 / 3,
    majorThird: 1.25, // 5:4 ratio
  }

  const result = baseFreq * ratios[interval]

  // Cap at max frequency
  return Math.min(result, MAX_SUSTAINED_FREQUENCY)
}

/**
 * Generate a simple chord from a base note
 * Returns array of frequencies forming a consonant chord
 */
export function generateChord(
  baseFreq: number,
  type: 'power' | 'major' | 'sus4' = 'power'
): number[] {
  const snappedBase = snapToPentatonic(baseFreq)

  switch (type) {
    case 'power':
      // Root + Fifth (always consonant)
      return [snappedBase, getConsonantInterval(snappedBase, 'fifth')]

    case 'major':
      // Root + Major Third + Fifth
      return [
        snappedBase,
        getConsonantInterval(snappedBase, 'majorThird'),
        getConsonantInterval(snappedBase, 'fifth'),
      ]

    case 'sus4':
      // Root + Fourth + Fifth (dreamy, open sound)
      return [
        snappedBase,
        getConsonantInterval(snappedBase, 'fourth'),
        getConsonantInterval(snappedBase, 'fifth'),
      ]

    default:
      return [snappedBase]
  }
}

/**
 * Map star temperature to a bass drone note
 * Cool stars = lower, hot stars = slightly higher
 * Always in sub-bass to low range (40-120Hz)
 */
export function starTemperatureToNote(temperatureK: number): number {
  const minTemp = 2500 // Cool M-dwarf
  const maxTemp = 10000 // Hot A-star

  const clampedTemp = Math.max(minTemp, Math.min(maxTemp, temperatureK))
  const normalized = (clampedTemp - minTemp) / (maxTemp - minTemp)

  // Map to low notes only (C2 to C3 range)
  // Index 0-5 in PENTATONIC_FREQUENCIES (65-130Hz)
  const index = Math.round(normalized * 5)

  return PENTATONIC_FREQUENCIES[index]
}
