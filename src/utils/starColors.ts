/**
 * Get star color based on effective temperature
 * Uses standard stellar classification colors
 *
 * @param temperature - Effective temperature in Kelvin
 * @returns Hex color string
 */
export function getStarColor(temperature: number): string {
  if (temperature < 3500) {
    // M-type: Deep red
    return '#FF4500'
  } else if (temperature < 5000) {
    // K-type: Orange
    return '#FFA500'
  } else if (temperature < 6000) {
    // G-type: Yellow-white (like our Sun)
    return '#FFFACD'
  } else if (temperature < 7500) {
    // F-type: White
    return '#FFFFFF'
  } else {
    // A, B, O-type: Blue-white
    return '#ADD8E6'
  }
}

/**
 * Get a gradient for star glow effect based on temperature
 *
 * @param temperature - Effective temperature in Kelvin
 * @returns Object with core and glow colors
 */
export function getStarGlowColors(temperature: number): { core: string; glow: string } {
  // Glow is a more saturated, slightly different hue based on temperature
  if (temperature < 3500) {
    return { core: '#FF6B35', glow: '#FF2200' }
  } else if (temperature < 5000) {
    return { core: '#FFB347', glow: '#FF8C00' }
  } else if (temperature < 6000) {
    return { core: '#FFFACD', glow: '#FFE066' }
  } else if (temperature < 7500) {
    return { core: '#FFFFFF', glow: '#FFFFEE' }
  } else {
    return { core: '#E6F3FF', glow: '#87CEEB' }
  }
}

/**
 * Get spectral type letter from temperature
 *
 * @param temperature - Effective temperature in Kelvin
 * @returns Spectral type letter (O, B, A, F, G, K, M, L, T)
 */
export function getSpectralTypeFromTemperature(temperature: number): string {
  if (temperature >= 30000) return 'O'
  if (temperature >= 10000) return 'B'
  if (temperature >= 7500) return 'A'
  if (temperature >= 6000) return 'F'
  if (temperature >= 5200) return 'G'
  if (temperature >= 3700) return 'K'
  if (temperature >= 2400) return 'M'
  if (temperature >= 1300) return 'L'
  return 'T'
}
