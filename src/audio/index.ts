export { AudioManager, DEFAULT_AUDIO_SETTINGS } from './AudioManager'
export type { AudioSettings } from './AudioManager'
export { useAudio } from './useAudio'
export { useSimulationAudio } from './useSimulationAudio'
export { AmbientSoundscape } from './AmbientSoundscape'
export { PlanetSonification } from './PlanetSonification'
export { UISounds } from './UISounds'
export { SimulationAudio } from './SimulationAudio'

// Musical scale utilities for "Music of the Spheres" soundscape
export {
  PENTATONIC_FREQUENCIES,
  MAX_SUSTAINED_FREQUENCY,
  MIN_FREQUENCY,
  COMFORTABLE_RANGE,
  snapToPentatonic,
  periodToMusicalNote,
  getConsonantInterval,
  generateChord,
  starTemperatureToNote,
} from './musicalScales'

// Bell synth and envelope utilities
export { BellSynth, BELL_ENVELOPES, MUSICAL_ENVELOPES, createBellEnvelope } from './BellSynth'
export type { BellEnvelopeType, MusicalEnvelopeType } from './BellSynth'
