import type { PlanetTourStepId } from '../../store/vizStore'

export interface PlanetTourStepContent {
  id: PlanetTourStepId
  title: string
  subtitle?: string
  content: string
  learnMore?: string
  // System to open in simulation (null for intro/finale steps)
  systemConfig?: {
    hostStar: string           // Host star name to look up
    highlightPlanet?: string   // Planet letter to highlight (e.g., 'b', 'e')
    initialSpeed?: number      // Starting simulation speed
  }
}

export const PLANET_TOUR_CONTENT: PlanetTourStepContent[] = [
  {
    id: 'intro',
    title: 'Tour the Cosmos',
    subtitle: 'Visit the Most Remarkable Planetary Systems',
    content:
      'Welcome to a guided tour of some of the most fascinating planetary systems we\'ve discovered. Each stop showcases a unique world or system that has expanded our understanding of what planets can be.',
    learnMore:
      'We\'ll visit systems with multiple Earth-sized planets, extreme orbits, the first exoplanet discovered around a Sun-like star, and more. Use the controls to navigate, or let the tour guide you through each system.',
  },
  {
    id: 'trappist-1',
    title: 'TRAPPIST-1',
    subtitle: 'Seven Worlds Around a Cool Red Star',
    content:
      'Perhaps the most remarkable system known: seven Earth-sized planets orbiting a tiny red dwarf star just 40 light-years away. Three of these worlds—d, e, and f—orbit in the habitable zone where liquid water could exist.',
    learnMore:
      'The TRAPPIST-1 planets are locked in a resonant chain, with orbital periods forming near-perfect ratios. This tight configuration suggests they migrated inward together. JWST is currently studying their atmospheres.',
    systemConfig: {
      hostStar: 'TRAPPIST-1',
      highlightPlanet: 'e', // Most Earth-like
      initialSpeed: 5,
    },
  },
  {
    id: '51-peg',
    title: '51 Pegasi',
    subtitle: 'Where It All Began',
    content:
      'The planet that launched a revolution. In 1995, astronomers discovered 51 Pegasi b—a Jupiter-mass planet orbiting its star in just 4 days. This "hot Jupiter" shouldn\'t exist according to our Solar System-based models. It changed everything.',
    learnMore:
      'Michel Mayor and Didier Queloz won the 2019 Nobel Prize in Physics for this discovery. Hot Jupiters like 51 Peg b likely formed farther out and migrated inward, sometimes swallowing any inner planets in their path.',
    systemConfig: {
      hostStar: '51 Peg',
      highlightPlanet: 'b',
      initialSpeed: 10,
    },
  },
  {
    id: 'kepler-11',
    title: 'Kepler-11',
    subtitle: 'A Remarkably Compact System',
    content:
      'Six planets orbit closer than Venus does to our Sun. These "peas in a pod" systems—where similar-sized planets crowd together—are common in the galaxy but absent from our Solar System. What makes us different?',
    learnMore:
      'The Kepler-11 planets range from 2 to 4.5 Earth radii, likely mini-Neptunes with thick atmospheres. Their tight spacing and circular orbits suggest a calm formation history, very different from the violent scattering thought to have shaped our outer Solar System.',
    systemConfig: {
      hostStar: 'Kepler-11',
      highlightPlanet: 'b',
      initialSpeed: 5,
    },
  },
  {
    id: 'hd-80606',
    title: 'HD 80606',
    subtitle: 'The Most Extreme Orbit',
    content:
      'Watch this planet\'s wild ride: HD 80606 b has an orbital eccentricity of 0.93—more comet-like than planetary. It swings from 0.03 AU (closer than Mercury) to 0.88 AU (nearly at Earth\'s distance), experiencing extreme temperature swings.',
    learnMore:
      'At closest approach, HD 80606 b receives 800 times more radiation than at its farthest point. Astronomers have observed the planet\'s atmosphere flash-heating over just six hours. This orbit may result from gravitational interactions with the binary companion star HD 80607.',
    systemConfig: {
      hostStar: 'HD 80606',
      highlightPlanet: 'b',
      initialSpeed: 2,
    },
  },
  {
    id: '55-cnc',
    title: '55 Cancri',
    subtitle: 'Five Planets, Diverse Worlds',
    content:
      '55 Cancri hosts five known planets, from a scorching super-Earth that orbits in 18 hours to a giant planet at Jupiter-like distances. This diversity in a single system shows the range of what planetary systems can produce.',
    learnMore:
      '55 Cancri e, the innermost planet, is so hot its surface may be covered in lava oceans. Meanwhile, 55 Cancri d orbits in the outer reaches at 5.4 AU—demonstrating that planetary systems can fill a wide range of orbital distances.',
    systemConfig: {
      hostStar: '55 Cnc',
      highlightPlanet: 'e',
      initialSpeed: 10,
    },
  },
  {
    id: 'hr-8799',
    title: 'HR 8799',
    subtitle: 'Planets You Can See',
    content:
      'Four giant planets directly photographed orbiting their star. Unlike most exoplanets detected indirectly, we have actual images of these worlds—young, hot, and massive—orbiting far from their bright young star.',
    learnMore:
      'Direct imaging works for young, self-luminous planets at large distances from their stars. The HR 8799 planets are 5-10 times Jupiter\'s mass and orbit at 15-70 AU. Their atmospheres have been spectroscopically analyzed, revealing clouds and exotic chemistry.',
    systemConfig: {
      hostStar: 'HR 8799',
      highlightPlanet: 'e',
      initialSpeed: 1,
    },
  },
  {
    id: 'finale',
    title: 'The Journey Continues',
    subtitle: 'Thousands More Worlds Await',
    content:
      'You\'ve visited just a handful of the 5,500+ exoplanets discovered so far. Each system tells a story about how planets form, evolve, and sometimes end up in configurations we never imagined. The universe is far more creative than we are.',
    learnMore:
      'New missions like JWST, Roman Space Telescope, and PLATO will discover thousands more planets and characterize their atmospheres. The ultimate goal: finding signs of life on a world like Earth, orbiting a star like the Sun.',
  },
]

export function getPlanetTourStepContent(stepId: PlanetTourStepId): PlanetTourStepContent | undefined {
  return PLANET_TOUR_CONTENT.find((step) => step.id === stepId)
}

export function getPlanetTourStepIndex(stepId: PlanetTourStepId): number {
  return PLANET_TOUR_CONTENT.findIndex((step) => step.id === stepId)
}
