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
    enabledPlanetTypes?: string[]
    showSolarSystem?: boolean
    showBiasOverlay?: boolean
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
      'In 1995, we knew of exactly zero planets beyond our Solar System. Today, we\'ve confirmed thousands—and counting. Each point of light you\'ll see here is a real world, orbiting a real star, somewhere in our galaxy.',
    learnMore:
      'The explosion of discoveries has reshaped our understanding of planetary systems. We now know planets are common: most stars host at least one, and many harbor entire families of worlds in configurations nothing like our own. This visualization explores what that census has taught us—and what it hasn\'t.',
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
      'Planets don\'t announce themselves — we have to catch them in the act. Some cross in front of their stars, casting tiny shadows (transits, shown as blue dots). Others tug their stars into a wobble we can measure (radial velocity, red dots). Each technique opens a different window onto the planetary population.',
    learnMore:
      'The Kepler space telescope stared at 150,000 stars for four years, catching the faint dips of thousands of transiting planets. Ground-based radial velocity surveys excel at finding massive planets that pull hard on their stars. Microlensing probes distant, cold worlds through chance alignments. Direct imaging captures young giants still glowing from their formation. No single method sees everything—together, they assemble the picture.',
    viewConfig: {
      enabledMethods: ['radial-velocity', 'transit-kepler', 'transit-other'],
      showBiasOverlay: false,
      showSolarSystem: false,
    },
  },
  {
    id: 'bias-problem',
    title: 'The Bias Problem',
    subtitle: 'What We See vs. What Exists',
    content:
      'Here\'s the catch: we\'re not seeing the universe in full fidelity. Large planets close to their stars practically shout at our instruments. Small planets at comfortable distances whisper—and most whispers go unheard. What you see here is a biased sample, skewed toward the easy finds.',
    learnMore:
      'A planet at Earth\'s distance from its star has only a 0.5% chance of transiting from our line of sight. Radial velocity signals scale with planet mass and fade with orbital period. These biases cut deep: the region of parameter space where Earth-like planets in habitable zones would live is precisely where our detection limits are weakest. The census is incomplete — especially for the worlds we most want to find.',
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
      'Here\'s something we didn\'t expect: the most common type of planet in our galaxy doesn\'t exist in our Solar System. These "super-Earths" and "sub-Neptunes" (two to four times Earth\'s size) orbit roughly one in three Sun-like stars. We have nothing like them.',
    learnMore:
      'Super-Earths blur the line between rocky and gaseous. Some may be scaled-up Earths with thin atmospheres. Others could be water worlds, or mini-Neptunes wrapped in thick hydrogen envelopes. Their sheer abundance raises an uncomfortable question: if they\'re the default outcome of planet formation, why are they missing from our system? Understanding their composition is a major goal of current atmospheric studies.',
    viewConfig: {
      enabledPlanetTypes: ['super-earth', 'sub-neptune'],
      showSolarSystem: true,
      showBiasOverlay: false,
    },
  },
  {
    id: 'hot-neptune-desert',
    title: 'The Hot Neptune Desert',
    subtitle: 'A Mysterious Absence',
    content:
      'Look for what\'s missing. Neptune-sized planets with orbital periods under three days are almost nonexistent — a stark gap called the "hot Neptune desert." Something prevents these intermediate worlds from surviving so close to their stars.',
    learnMore:
      'The likely culprit: photoevaporation. Intense radiation strips atmospheres from Neptune-mass planets at close distances, boiling them away until only a rocky core remains. Hot Jupiters survive because they\'re massive enough to hold on. Super-Earths survive because they\'re already stripped down. Neptunes fall into the danger zone: too small to resist, too large to have lost their atmospheres early. The desert is a scar left by stellar radiation sculpting the planet population.',
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
      'The question that drives everything: how many stars have an Earth-sized planet in the habitable zone, where liquid water could exist? Current estimates suggest somewhere between 5% and 50% of Sun-like stars. Even the conservative end means billions of candidates in our galaxy alone.',
    learnMore:
      'Measuring η⊕ (eta-Earth, the fraction of stars with Earth-like planets) requires correcting for all our detection biases and defining what "Earth-like" and "habitable" even mean. Different studies make different assumptions, leading to a wide range. What we know for certain: such worlds exist, and they\'re not vanishingly rare. Future missions like the Habitable Worlds Observatory aim to directly image these planets and search their atmospheres for signs of life.',
    viewConfig: {
      enabledPlanetTypes: ['rocky', 'super-earth'],
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
      'Where do we fit? Our planets (shown in gold) sit in a sparsely populated region of this chart. We have no close-in super-Earths, no hot Jupiters, no tightly-packed inner systems. The more we discover, the more our home looks like an outlier.',
    learnMore:
      'The absence of any planet interior to Mercury makes our inner Solar System unusually empty. Our giant planets orbit at moderate distances, near the edge of current detection limits for other systems. This makes it hard to know if systems like ours are truly rare or just hard to find. But the pattern is suggestive: the architecture that allowed Earth to form and remain stable for billions of years may not be the norm.',
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
      'We\'re still early in this story. New missions will find thousands more planets — including cold worlds via microlensing, rocky planets around bright nearby stars, and eventually, direct images of pale blue dots orbiting distant suns.',
    learnMore:
      'NASA\'s Roman Space Telescope will survey the galaxy for cold, distant planets invisible to other methods. ESA\'s PLATO will find rocky worlds around stars bright enough for detailed follow-up. And in the 2040s, the Habitable Worlds Observatory aims to do something unprecedented: directly photograph Earth-like planets around nearby stars and analyze their atmospheres for water, oxygen, methane—the chemical fingerprints of a living world. We may be the generation that finds out we\'re not alone.',
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
