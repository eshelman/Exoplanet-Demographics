/**
 * Deep Linking Utilities
 *
 * URL Schema:
 *   /                                  - Main visualization
 *   /?system=TRAPPIST-1                - Open TRAPPIST-1 simulation
 *   /?system=55-Cnc&planet=e           - 55 Cancri system, planet e selected
 *   /?system=HD-80606&speed=5          - HD 80606 at 5x speed
 *   /?system=Kepler-11&hz=1            - Kepler-11 with HZ overlay
 */

export interface DeepLinkParams {
  system?: string // Host star name (URL-safe format)
  planet?: string // Planet letter or designation
  speed?: number // Simulation speed multiplier
  hz?: boolean // Show habitable zone overlay
}

/**
 * Known system name mappings (URL-safe -> actual name)
 */
const SYSTEM_NAME_MAP: Record<string, string> = {
  'trappist-1': 'TRAPPIST-1',
  '51-peg': '51 Peg',
  '51-pegasi': '51 Peg',
  'kepler-11': 'Kepler-11',
  'hd-80606': 'HD 80606',
  '55-cnc': '55 Cnc',
  '55-cancri': '55 Cnc',
  'hr-8799': 'HR 8799',
  'proxima-cen': 'Proxima Cen',
  'proxima-centauri': 'Proxima Cen',
  'tau-ceti': 'tau Cet',
  'gj-1214': 'GJ 1214',
  'gj-876': 'GJ 876',
  'wasp-12': 'WASP-12',
  'wasp-17': 'WASP-17',
  'hat-p-7': 'HAT-P-7',
  'corot-7': 'CoRoT-7',
}

/**
 * Convert a system name to URL-safe format
 */
export function systemNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/[^\w-]/g, '') // remove special chars except hyphens
}

/**
 * Convert a URL slug back to the actual system name
 */
export function slugToSystemName(slug: string): string {
  const normalized = slug.toLowerCase()

  // Check known mappings first
  if (SYSTEM_NAME_MAP[normalized]) {
    return SYSTEM_NAME_MAP[normalized]
  }

  // Otherwise, attempt to reconstruct (capitalize, restore spaces)
  // Handle common patterns like "kepler-123" -> "Kepler-123"
  return slug
    .split('-')
    .map((part, index) => {
      // If it's all digits, keep as-is
      if (/^\d+$/.test(part)) return part
      // If it starts with a letter, capitalize first letter
      if (index === 0 || !/^\d/.test(part)) {
        return part.charAt(0).toUpperCase() + part.slice(1)
      }
      return part
    })
    .join('-')
    .replace(/-(\d)/g, ' $1') // "HD-80606" -> "HD 80606" for certain patterns
}

/**
 * Parse URL search params into DeepLinkParams
 */
export function parseDeepLink(search: string): DeepLinkParams {
  const params = new URLSearchParams(search)
  const result: DeepLinkParams = {}

  const system = params.get('system')
  if (system) {
    result.system = slugToSystemName(system)
  }

  const planet = params.get('planet')
  if (planet) {
    result.planet = planet
  }

  const speed = params.get('speed')
  if (speed) {
    const speedNum = parseFloat(speed)
    if (!isNaN(speedNum) && speedNum > 0 && speedNum <= 100) {
      result.speed = speedNum
    }
  }

  const hz = params.get('hz')
  if (hz === '1' || hz === 'true') {
    result.hz = true
  }

  return result
}

/**
 * Build a URL search string from DeepLinkParams
 */
export function buildDeepLink(params: DeepLinkParams): string {
  const searchParams = new URLSearchParams()

  if (params.system) {
    searchParams.set('system', systemNameToSlug(params.system))
  }

  if (params.planet) {
    searchParams.set('planet', params.planet.toLowerCase())
  }

  if (params.speed && params.speed !== 1) {
    searchParams.set('speed', params.speed.toString())
  }

  if (params.hz) {
    searchParams.set('hz', '1')
  }

  const str = searchParams.toString()
  return str ? `?${str}` : ''
}

/**
 * Get the full shareable URL for a system
 */
export function getShareableUrl(params: DeepLinkParams): string {
  const base = window.location.origin + window.location.pathname
  return base + buildDeepLink(params)
}

/**
 * Update the browser URL without triggering navigation
 */
export function updateBrowserUrl(params: DeepLinkParams | null): void {
  const url = params ? buildDeepLink(params) : window.location.pathname
  window.history.replaceState({}, '', url || window.location.pathname)
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } finally {
      document.body.removeChild(textArea)
    }
  } catch {
    console.error('Failed to copy to clipboard')
    return false
  }
}

/**
 * Extract planet letter from a planet name
 * e.g., "TRAPPIST-1 d" -> "d", "55 Cnc e" -> "e"
 */
export function extractPlanetLetter(planetName: string): string | null {
  // Match single letter at the end, possibly preceded by space
  const match = planetName.match(/\s([a-z])$/i)
  return match ? match[1].toLowerCase() : null
}

/**
 * Build full planet name from system and letter
 * e.g., ("TRAPPIST-1", "d") -> "TRAPPIST-1 d"
 */
export function buildPlanetName(systemName: string, letter: string): string {
  return `${systemName} ${letter}`
}
