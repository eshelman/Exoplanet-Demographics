import type { NarrativeStepId } from '../../store/vizStore'
import type { DetectionMethodId } from '../../types'

export interface NarrativeStepContent {
  id: NarrativeStepId
  title: string
  subtitle?: string
  content: string
  learnMore?: string
  // View configuration for this step
  viewConfig?: {
    enabledMethods?: DetectionMethodId[]
    showSolarSystem?: boolean
    showBiasOverlay?: boolean
    highlightPlanetTypes?: string[]
    zoomRegion?: {
      xMin: number
      xMax: number
      yMin: number
      yMax: number
    }
  }
}

export const NARRATIVE_CONTENT: NarrativeStepContent[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Cosmos',
    subtitle: 'A Journey Through Exoplanet Demographics',
    content:
      'Since the first confirmed exoplanet discovery in 1995, we have found over 5,500 worlds orbiting other stars. This visualization explores what we have learned about the demographics of planets in our galaxy.',
    learnMore:
      'The field of exoplanet science has revolutionized our understanding of planetary systems. We now know that planets are common—most stars host at least one planet, and many host multiple worlds in complex orbital configurations.',
    viewConfig: {
      showSolarSystem: true,
      showBiasOverlay: false,
    },
  },
  {
    id: 'detection-methods',
    title: 'How We Find Planets',
    subtitle: 'Different Methods, Different Views',
    content:
      'We detect exoplanets using several techniques, each with unique strengths. Transit observations (blue) find planets crossing their stars. Radial velocity (red) measures stellar wobbles. Each method reveals different parts of the planetary population.',
    learnMore:
      'The Kepler space telescope revolutionized exoplanet science by continuously monitoring 150,000 stars, discovering thousands of planets via the transit method. Ground-based radial velocity surveys excel at finding massive planets. Microlensing probes distant, cold worlds, while direct imaging captures young, hot giants.',
    viewConfig: {
      showBiasOverlay: false,
      showSolarSystem: false,
    },
  },
  {
    id: 'bias-problem',
    title: 'The Bias Problem',
    subtitle: 'What We See vs. What Exists',
    content:
      'Our detection methods are not equally sensitive to all planets. We easily find large planets close to their stars, but small planets at large distances remain hidden. The observed population is a biased sample of what actually exists.',
    learnMore:
      'Transit probability decreases with orbital distance (a planet at Earth\'s distance has only a 0.5% chance of transiting). Radial velocity signals scale with planet mass and decrease with period. These biases mean our census is incomplete—especially for Earth-like worlds in habitable zones.',
    viewConfig: {
      showBiasOverlay: true,
      showSolarSystem: true,
    },
  },
  {
    id: 'super-earths',
    title: 'Super-Earths Everywhere',
    subtitle: 'The Galaxy\'s Most Common Planet',
    content:
      'The most surprising discovery: the most common type of planet in our galaxy—the "super-Earth" or "sub-Neptune"—doesn\'t exist in our Solar System. These worlds, 2-4 times Earth\'s size, orbit roughly 30% of all Sun-like stars.',
    learnMore:
      'Super-Earths and sub-Neptunes blur the line between rocky and gaseous worlds. Some may have thick hydrogen atmospheres, others could be water worlds or rocky planets with thin envelopes. Understanding their composition is a major goal of atmospheric characterization missions.',
    viewConfig: {
      highlightPlanetTypes: ['super-earth', 'sub-neptune'],
      showSolarSystem: true,
      showBiasOverlay: false,
    },
  },
  {
    id: 'hot-neptune-desert',
    title: 'The Hot Neptune Desert',
    subtitle: 'A Mysterious Absence',
    content:
      'Notice the empty region: Neptune-sized planets with orbital periods less than 3 days are extremely rare. This "hot Neptune desert" reveals that intermediate-mass planets cannot survive the intense radiation so close to their stars.',
    learnMore:
      'Photoevaporation strips the atmospheres from Neptune-mass planets at close distances, leaving behind smaller rocky cores. This process sculpts the planet population, creating a clear gap between hot Jupiters (too massive to lose their atmospheres) and super-Earths (remnant cores).',
    viewConfig: {
      showBiasOverlay: true,
      zoomRegion: {
        xMin: 0.5,
        xMax: 10,
        yMin: 5,
        yMax: 200,
      },
    },
  },
  {
    id: 'eta-earth',
    title: 'Where Are the Earths?',
    subtitle: 'The Search for Habitable Worlds',
    content:
      'How common are Earth-like planets in habitable zones? Estimates converge to 5-50% of Sun-like stars hosting such a world. Even conservatively, this implies billions of potentially habitable planets in our galaxy alone.',
    learnMore:
      'Measuring η⊕ (eta-Earth) requires correcting for detection biases and defining "Earth-like" and "habitable zone." Different studies use different assumptions, leading to a range of estimates. Future missions like the Habitable Worlds Observatory aim to directly image and characterize these worlds.',
    viewConfig: {
      highlightPlanetTypes: ['rocky', 'super-earth'],
      showSolarSystem: true,
      zoomRegion: {
        xMin: 100,
        xMax: 1000,
        yMin: 0.5,
        yMax: 10,
      },
    },
  },
  {
    id: 'solar-system-context',
    title: 'Our Solar System in Context',
    subtitle: 'How Typical Are We?',
    content:
      'Where does our Solar System fit? Our planets (shown in gold) occupy a relatively unexplored region of parameter space. We lack the close-in super-Earths common elsewhere, and our giant planets orbit at moderate distances.',
    learnMore:
      'The absence of planets interior to Mercury\'s orbit makes our system unusual. However, observational biases make it hard to find systems like ours around other stars. Jupiter-like planets at Jupiter-like distances are at the edge of current detection limits.',
    viewConfig: {
      showSolarSystem: true,
      showBiasOverlay: false,
      enabledMethods: [],
    },
  },
  {
    id: 'future',
    title: 'The Future of Discovery',
    subtitle: 'What Comes Next',
    content:
      'New missions will revolutionize our view. NASA\'s Roman Space Telescope will find thousands of cold planets via microlensing. ESA\'s PLATO will find rocky planets around bright stars. Ground-based telescopes will characterize atmospheres of nearby worlds.',
    learnMore:
      'The Habitable Worlds Observatory (2040s) aims to directly image Earth-like planets around nearby stars and search their atmospheres for biosignatures. We are on the threshold of answering one of humanity\'s oldest questions: Are we alone?',
    viewConfig: {
      showSolarSystem: true,
      showBiasOverlay: false,
    },
  },
]

export function getStepContent(stepId: NarrativeStepId): NarrativeStepContent | undefined {
  return NARRATIVE_CONTENT.find((step) => step.id === stepId)
}

export function getStepIndex(stepId: NarrativeStepId): number {
  return NARRATIVE_CONTENT.findIndex((step) => step.id === stepId)
}
