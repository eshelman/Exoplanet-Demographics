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
      'You\'re about to visit real places: worlds orbiting distant suns, some close enough that light from there reaches us in a human lifetime. Each stop reveals something unexpected about what planets can be.',
    learnMore:
      'We\'ll visit systems packed with Earth-sized worlds, planets on wild eccentric orbits, the first exoplanet ever found around a Sun-like star, and more. Along the way, you may notice something surprising: our own Solar System is starting to look like the odd one out.',
  },
  {
    id: 'trappist-1',
    title: 'TRAPPIST-1',
    subtitle: 'Seven Worlds Around a Cool Red Star',
    content:
      'Imagine seven Earth-sized worlds, close enough to see each other looming large in their skies — all orbiting a star so dim and red you could stare straight at it. Three of them, e, f, and g, sit in the zone where liquid water could pool on their surfaces.',
    learnMore:
      'At just 40 light-years away, TRAPPIST-1 is practically next door. Its planets are locked in a resonant chain, with orbital periods forming near-perfect ratios — a kind of gravitational music. This delicate arrangement suggests they migrated inward together, maintaining their dance. JWST is currently studying their atmospheres, searching for signs of water, carbon dioxide, or something more unexpected.',
    systemConfig: {
      hostStar: 'TRAPPIST-1',
      highlightPlanet: 'e', // Most Earth-like
      initialSpeed: 1,
    },
  },
  {
    id: '51-peg',
    title: '51 Pegasi',
    subtitle: 'Where It All Began',
    content:
      'The planet that launched a revolution. In 1995, astronomers found 51 Pegasi b: a Jupiter-mass world whipping around its star in just four days, so close it would sit inside Mercury\'s orbit. A giant planet in the wrong place. It forced scientists to rethink everything.',
    learnMore:
      'Before 51 Peg b, we assumed planetary systems would look like ours: small rocky worlds close in, gas giants far out. This "hot Jupiter" defied those expectations so completely that some astronomers initially suspected the data was wrong. Michel Mayor and Didier Queloz won the 2019 Nobel Prize for the discovery. We now know hot Jupiters likely form farther out and migrate inward, sometimes consuming smaller planets in their path.',
    systemConfig: {
      hostStar: '51 Peg',
      highlightPlanet: 'b',
      initialSpeed: 5,
    },
  },
  {
    id: 'hd-209458',
    title: 'HD 209458',
    subtitle: 'The First Atmospheric Detection',
    content:
      'In 2001, starlight filtering through the edge of this planet revealed something remarkable: sodium. For the first time, we had tasted the air of another world. An entire field of science was born in that moment.',
    learnMore:
      'The technique is called transmission spectroscopy — when a planet crosses in front of its star, a sliver of starlight passes through its atmosphere, carrying chemical fingerprints. HD 209458 b also showed us something dramatic: its atmosphere is escaping into space, streaming away like a comet\'s tail. Since then, we\'ve detected water, carbon dioxide, methane, and dozens of other molecules in exoplanet atmospheres.',
    systemConfig: {
      hostStar: 'HD 209458',
      highlightPlanet: 'b',
      initialSpeed: 2,
    },
  },
  {
    id: 'kepler-16',
    title: 'Kepler-16',
    subtitle: 'A Real-Life Tatooine',
    content:
      'Two suns set over this world. Kepler-16 b orbits a pair of stars locked in their own dance, casting double shadows and creating complex seasons. Before 2011, many doubted such worlds could exist—the gravitational chaos would tear them apart, or so we thought.',
    learnMore:
      'The planet is about Saturn\'s size and orbits both stars every 229 days. The binary stars themselves circle each other every 41 days, creating an ever-shifting two-sun sky. This discovery forced us to reconsider planets around the many binary systems in our galaxy—roughly half of all Sun-like stars have a stellar companion.',
    systemConfig: {
      hostStar: 'Kepler-16',
      highlightPlanet: 'b',
      initialSpeed: 2,
    },
  },
  {
    id: 'kepler-11',
    title: 'Kepler-11',
    subtitle: 'A Remarkably Compact System',
    content:
      'Six planets, all packed closer to their star than Venus is to our Sun. These "peas in a pod" systems (similar-sized worlds crowded together in tight orbits) turn out to be common across the galaxy. Our widely-spaced Solar System may be the unusual one.',
    learnMore:
      'The Kepler-11 planets range from 2 to 4.5 times Earth\'s radius, likely mini-Neptunes wrapped in thick atmospheres. Their tight spacing and circular orbits suggest a calm formation history, very different from the violent scattering events thought to have shaped our outer Solar System. Finding compact systems like this everywhere raises a question we\'re still answering: what happened in ours?',
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
      'This planet doesn\'t orbit — it plunges. HD 80606 b swings from nearly Earth\'s distance from its star to closer than Mercury, then back out again. At closest approach, its atmosphere flash-heats by hundreds of degrees in just six hours. More comet than planet.',
    learnMore:
      'With an eccentricity of 0.93, this orbit is almost off the charts (Earth\'s is just 0.017). At closest approach, HD 80606 b receives 800 times more radiation than at its farthest point. Measured in AU (where 1 AU is the Earth-Sun distance), it swings from 0.88 AU down to just 0.03 AU. A nearby companion star, HD 80607, likely kicked the planet into this wild trajectory over millions of years of gravitational tugging.',
    systemConfig: {
      hostStar: 'HD 80606',
      highlightPlanet: 'b',
      initialSpeed: 10,
    },
  },
  {
    id: '55-cnc',
    title: '55 Cancri',
    subtitle: 'Five Planets, Diverse Worlds',
    content:
      'A system that contains multitudes: from a lava world so close it completes an orbit in 18 hours, to a cold giant at Jupiter-like distances. Five planets spanning almost the full range of what we thought possible, all around one star visible to the naked eye.',
    learnMore:
      '55 Cancri e, the innermost planet, orbits so close that its surface likely glows with molten rock. Meanwhile, 55 Cancri d orbits out at 5.4 AU—beyond where our asteroid belt sits. At just 41 light-years away, this is one of the nearest systems with such diversity, making it a favorite target for atmospheric studies.',
    systemConfig: {
      hostStar: '55 Cnc',
      highlightPlanet: 'e',
      initialSpeed: 10,
    },
  },
  {
    id: 'wasp-76',
    title: 'WASP-76',
    subtitle: 'Where Iron Rains From the Sky',
    content:
      'On the permanent dayside of WASP-76 b, temperatures soar past 2,400°C—hot enough to vaporize iron. Winds carry that iron vapor to the cooler nightside, where it appears to condense and fall as glowing metallic rain. A world of literal metal storms.',
    learnMore:
      'In 2020, high-resolution spectroscopy detected iron in this planet\'s atmosphere with a telling asymmetry: iron signatures appear on the evening terminator but vanish on the morning side. The best explanation is that iron is condensing out and raining down as the atmosphere cools. WASP-76 b is tidally locked—one face always toward its star—creating a permanent boundary between blazing day and cooler night where these exotic conditions likely occur.',
    systemConfig: {
      hostStar: 'WASP-76',
      highlightPlanet: 'b',
      initialSpeed: 1,
    },
  },
  {
    id: 'kepler-90',
    title: 'Kepler-90',
    subtitle: 'AI Joins the Planet Hunt',
    content:
      'In 2017, machine learning found what humans had missed: an eighth planet hidden in Kepler data. Kepler-90 became the first known system to match our Solar System\'s planet count — except all eight worlds are crammed inside what would be Earth\'s orbit.',
    learnMore:
      'Google trained a neural network on 15,000 vetted Kepler signals, teaching it to recognize the subtle dips of transiting planets. It found Kepler-90 i, a small world overlooked in previous searches. This compressed planetary system (eight planets where we have one) shows again how tightly packed worlds can be. The discovery marked a turning point for AI-assisted astronomy, a collaboration now accelerating discoveries across the field.',
    systemConfig: {
      hostStar: 'KOI-351',  // Listed as KOI-351 in the database
      highlightPlanet: 'i',
      initialSpeed: 1,
    },
  },
  {
    id: 'hr-8799',
    title: 'HR 8799',
    subtitle: 'Planets You Can Actually See',
    content:
      'Most exoplanets are invisible — detected only by their effects on starlight. But these four giant worlds have been directly photographed, glowing with the heat of their own formation. Real images of real planets, 130 light-years away.',
    learnMore:
      'Direct imaging works for young, self-luminous planets far from their stars. The HR 8799 planets are just 30 million years old (infants in cosmic terms) still radiating the heat of their formation. At 5–10 Jupiter masses and orbiting at 15–70 AU, their atmospheres have been spectroscopically analyzed, revealing clouds of iron and silicates, and chemistry unlike anything in our Solar System.',
    systemConfig: {
      hostStar: 'HR 8799',
      highlightPlanet: 'e',
      initialSpeed: 10,
    },
  },
  {
    id: 'finale',
    title: 'The Journey Continues',
    subtitle: 'Thousands More Worlds Await',
    content:
      'You\'ve visited eleven systems out of thousands discovered — and counting. Compact worlds, extreme orbits, iron rain, planets around binary stars. Each one expanded our sense of what\'s possible. The real question now: what haven\'t we thought to look for yet?',
    learnMore:
      'JWST is peering into exoplanet atmospheres with unprecedented precision. The Roman Space Telescope and PLATO will discover thousands more worlds in the coming decade. Somewhere out there — perhaps orbiting a star we\'ve already cataloged — could be a world with oceans, weather, and seasons. Maybe something looking back.',
  },
]

export function getPlanetTourStepContent(stepId: PlanetTourStepId): PlanetTourStepContent | undefined {
  return PLANET_TOUR_CONTENT.find((step) => step.id === stepId)
}

export function getPlanetTourStepIndex(stepId: PlanetTourStepId): number {
  return PLANET_TOUR_CONTENT.findIndex((step) => step.id === stepId)
}
