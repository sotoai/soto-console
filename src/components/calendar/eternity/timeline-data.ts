/**
 * Eternity timeline — era definitions from the Big Bang to the present.
 * Each era has a color palette, sub-events for drill-down, and width
 * computed via square-root scaling for proportional horizontal scrolling.
 */

export interface SubEvent {
  label: string
  yearsAgo: number
  description: string
}

export interface EraColor {
  /** Gradient start color (top of column) */
  from: string
  /** Gradient end color (bottom of column) */
  to: string
  /** Accent color for dots, highlights */
  accent: string
}

export interface Era {
  id: string
  label: string
  yearsAgo: number
  description: string   // short tagline (overview)
  detail: string        // expanded description
  icon: string
  color: EraColor
  subEvents: SubEvent[]
}

export const ERAS: Era[] = [
  {
    id: 'big-bang',
    label: 'Big Bang',
    yearsAgo: 13_800_000_000,
    description: 'Everything, all at once',
    detail: 'All matter, energy, space, and time erupted from an infinitely dense point smaller than an atom. Nobody was around to see it, obviously.',
    icon: '✦',
    color: { from: '#2d1b69', to: '#1a0a3e', accent: '#a78bfa' },
    subEvents: [
      { label: 'Inflation', yearsAgo: 13_800_000_000, description: 'The entire universe inflates from subatomic to cosmic in 0.0000000000000000000000000000000001 seconds' },
      { label: 'First Atoms', yearsAgo: 13_799_620_000, description: 'Hydrogen and helium form. That\'s it. That\'s the whole periodic table.' },
      { label: 'Cosmic Dark Ages', yearsAgo: 13_500_000_000, description: 'Nothing happens for 300 million years. Absolute darkness.' },
    ],
  },
  {
    id: 'first-stars',
    label: 'First Stars',
    yearsAgo: 13_200_000_000,
    description: 'Finally, some light',
    detail: 'Gravity pulled hydrogen together until it got so hot it started glowing. The universe had been sitting in the dark for 300 million years.',
    icon: '★',
    color: { from: '#3b2d8e', to: '#1e1654', accent: '#c4b5fd' },
    subEvents: [
      { label: 'Population III Stars', yearsAgo: 13_200_000_000, description: 'The first stars. Enormous. Short-lived. No one named them.' },
      { label: 'First Supernovae', yearsAgo: 13_100_000_000, description: 'Stars explode and scatter heavier elements everywhere. Very generous.' },
      { label: 'Reionization', yearsAgo: 13_000_000_000, description: 'Starlight makes the universe transparent. You can finally see.' },
    ],
  },
  {
    id: 'milky-way',
    label: 'Milky Way',
    yearsAgo: 10_000_000_000,
    description: 'Our neighborhood',
    detail: 'Billions of stars, gas clouds, and dark matter swirled together into a spiral. One of roughly two trillion galaxies. Ours.',
    icon: '◎',
    color: { from: '#1e3a6e', to: '#0f1f3d', accent: '#60a5fa' },
    subEvents: [
      { label: 'Proto-Galaxy Mergers', yearsAgo: 10_000_000_000, description: 'Smaller galaxies collide and stick together. Messy.' },
      { label: 'Spiral Arms Form', yearsAgo: 8_000_000_000, description: 'The galaxy settles into its iconic pinwheel shape' },
      { label: 'Galactic Halo', yearsAgo: 9_000_000_000, description: 'Ancient star clusters orbit above and below the disk' },
    ],
  },
  {
    id: 'solar-system',
    label: 'Solar System',
    yearsAgo: 4_600_000_000,
    description: 'A star and some rocks',
    detail: 'A cloud of gas collapsed, ignited a star, and left over debris formed eight planets. We got the third one.',
    icon: '☉',
    color: { from: '#6b4423', to: '#3d2614', accent: '#fbbf24' },
    subEvents: [
      { label: 'Solar Nebula Collapse', yearsAgo: 4_600_000_000, description: 'A gas cloud starts falling in on itself' },
      { label: 'Sun Ignites', yearsAgo: 4_590_000_000, description: 'Nuclear fusion begins. Will continue for another 5 billion years. Probably.' },
      { label: 'Rocky Planets Form', yearsAgo: 4_550_000_000, description: 'Dust grains stick together until they\'re planets. Somehow.' },
      { label: 'Gas Giants', yearsAgo: 4_500_000_000, description: 'Jupiter and Saturn hoard most of the gas. Classic.' },
    ],
  },
  {
    id: 'earth',
    label: 'Earth',
    yearsAgo: 4_500_000_000,
    description: 'Home (eventually)',
    detail: 'A molten ball of rock got hit by another planet, which gave us the Moon. Then it rained for millions of years. Then it cooled down. Barely.',
    icon: '⊕',
    color: { from: '#1a4d5e', to: '#0d2830', accent: '#22d3ee' },
    subEvents: [
      { label: 'The Big Splash', yearsAgo: 4_500_000_000, description: 'A Mars-sized planet slams into Earth. The debris becomes the Moon. Romantic, in a way.' },
      { label: 'Hadean Eon', yearsAgo: 4_400_000_000, description: 'Surface is molten lava. Constant bombardment. Zero stars on Yelp.' },
      { label: 'First Oceans', yearsAgo: 4_200_000_000, description: 'Water vapor condenses. Earth finally has a nice feature.' },
    ],
  },
  {
    id: 'first-life',
    label: 'First Life',
    yearsAgo: 3_800_000_000,
    description: 'Something moved',
    detail: 'Molecules started copying themselves. Nobody knows exactly how. It\'s been 3.8 billion years and we\'re still not sure.',
    icon: '◦',
    color: { from: '#1a5e3a', to: '#0d3020', accent: '#34d399' },
    subEvents: [
      { label: 'RNA World', yearsAgo: 3_800_000_000, description: 'Self-replicating molecules appear. Life, technically.' },
      { label: 'First Cells', yearsAgo: 3_500_000_000, description: 'Membranes form. Now the molecules have personal space.' },
      { label: 'Photosynthesis', yearsAgo: 3_000_000_000, description: 'Bacteria learn to eat sunlight. Game changer.' },
      { label: 'Great Oxidation', yearsAgo: 2_400_000_000, description: 'Oxygen fills the atmosphere. Kills almost everything. Oops.' },
    ],
  },
  {
    id: 'multicellular',
    label: 'Complex Life',
    yearsAgo: 600_000_000,
    description: 'Cooperation',
    detail: 'After 3 billion years of single cells, some of them decided to work together. Took them long enough.',
    icon: '❋',
    color: { from: '#2d6b1e', to: '#183d0f', accent: '#86efac' },
    subEvents: [
      { label: 'Ediacaran Biota', yearsAgo: 600_000_000, description: 'First complex organisms. Soft, weird, mostly flat.' },
      { label: 'Cambrian Explosion', yearsAgo: 540_000_000, description: 'Every body plan appears at once. Eyes, shells, legs. Absolute chaos.' },
      { label: 'First Land Plants', yearsAgo: 470_000_000, description: 'Green things crawl onto land. It was barren before this.' },
      { label: 'Fish Grow Legs', yearsAgo: 370_000_000, description: 'Some fish get tired of water and walk ashore. Bold move.' },
    ],
  },
  {
    id: 'dinosaurs',
    label: 'Dinosaurs',
    yearsAgo: 230_000_000,
    description: 'Very large roommates',
    detail: 'Reptilian giants ran the planet for 164 million years. For context, we\'ve been here for 0.3 million. They were much better at this.',
    icon: '▲',
    color: { from: '#4a6b1e', to: '#2a3d0f', accent: '#a3e635' },
    subEvents: [
      { label: 'Triassic Period', yearsAgo: 230_000_000, description: 'First dinosaurs. Small. Unassuming. Give them time.' },
      { label: 'Jurassic Period', yearsAgo: 200_000_000, description: 'Now they\'re enormous. Some have very long necks.' },
      { label: 'Cretaceous Period', yearsAgo: 145_000_000, description: 'T. rex. Flowers. The good times.' },
      { label: 'First Mammals', yearsAgo: 160_000_000, description: 'Tiny, nocturnal, hiding. Our ancestors. Humbling.' },
    ],
  },
  {
    id: 'asteroid',
    label: 'K-Pg Extinction',
    yearsAgo: 66_000_000,
    description: 'Bad day',
    detail: 'A rock the size of a city hit the Yucatan at 45,000 mph. 75% of all species gone. Our tiny mammal ancestors survived by being small and underground. Lucky us.',
    icon: '✕',
    color: { from: '#6b1e1e', to: '#3d0f0f', accent: '#f87171' },
    subEvents: [
      { label: 'Chicxulub Impact', yearsAgo: 66_000_000, description: '10 km asteroid. 72,000 km/h. Bad.' },
      { label: 'Impact Winter', yearsAgo: 65_999_000, description: 'Sun blocked for years. Global temperature drops. Very bad.' },
      { label: 'Mammals Inherit Earth', yearsAgo: 65_000_000, description: 'With the landlords gone, mammals move into every niche' },
      { label: 'Primate Origins', yearsAgo: 55_000_000, description: 'Small tree-dwellers with good grip and forward-facing eyes. That\'s us, eventually.' },
    ],
  },
  {
    id: 'early-humans',
    label: 'Homo Sapiens',
    yearsAgo: 300_000,
    description: 'Here comes trouble',
    detail: 'A species appeared in Africa with language, abstract thought, and the concerning ability to reshape its environment. Still figuring out what to do with all that.',
    icon: '△',
    color: { from: '#6b4a2d', to: '#3d2a18', accent: '#f59e0b' },
    subEvents: [
      { label: 'Anatomical Modernity', yearsAgo: 300_000, description: 'We show up. Look the same as now, more or less.' },
      { label: 'Behavioral Modernity', yearsAgo: 70_000, description: 'Art, language, abstract thought. Now we\'re really in trouble.' },
      { label: 'Out of Africa', yearsAgo: 60_000, description: 'We spread everywhere. Everywhere.' },
      { label: 'Neanderthal Farewell', yearsAgo: 40_000, description: 'Our cousins disappear. We may have had something to do with it.' },
    ],
  },
  {
    id: 'agriculture',
    label: 'Agriculture',
    yearsAgo: 12_000,
    description: 'We stopped moving',
    detail: 'Somebody planted a seed on purpose. Within a few thousand years: cities, taxes, bureaucracy, standing armies. Unclear if net positive.',
    icon: '⌂',
    color: { from: '#8a7322', to: '#4d4013', accent: '#fde047' },
    subEvents: [
      { label: 'First Crops', yearsAgo: 12_000, description: 'Wheat and barley. The Fertile Crescent. Seemed like a good idea.' },
      { label: 'First Cities', yearsAgo: 7_000, description: 'People pile on top of each other. Call it civilization.' },
      { label: 'Bronze Age', yearsAgo: 5_000, description: 'Metal tools, writing, empires. Things escalate.' },
      { label: 'Classical Antiquity', yearsAgo: 2_500, description: 'Philosophy, democracy, aqueducts. Also a lot of wars.' },
    ],
  },
  {
    id: 'industrial',
    label: 'Industrial Age',
    yearsAgo: 250,
    description: 'Everything faster',
    detail: 'We figured out how to burn things more efficiently. This solved many problems and created several new ones that we are still working on.',
    icon: '⚙',
    color: { from: '#4a4a5e', to: '#2a2a35', accent: '#a1a1aa' },
    subEvents: [
      { label: 'Steam Engine', yearsAgo: 250, description: 'Boil water, move things. Revolutionary, literally.' },
      { label: 'Electricity', yearsAgo: 140, description: 'Tamed lightning. Stayed up past sunset for the first time.' },
      { label: 'World Wars', yearsAgo: 110, description: 'Turns out industrial technology works for destruction too.' },
      { label: 'Nuclear Age', yearsAgo: 80, description: 'Split the atom. Immediately made a bomb. Then a power plant. In that order.' },
    ],
  },
  {
    id: 'space-age',
    label: 'Space Age',
    yearsAgo: 65,
    description: 'We looked up',
    detail: 'After 13.8 billion years of universe and 300,000 years of us, we finally left the planet. Briefly. We mostly came back and made phones.',
    icon: '◇',
    color: { from: '#1e5e6b', to: '#0f353d', accent: '#67e8f9' },
    subEvents: [
      { label: 'Moon Landing', yearsAgo: 57, description: 'We walked on the Moon. Then stopped going. Budget cuts.' },
      { label: 'Personal Computers', yearsAgo: 45, description: 'Put a thinking machine on every desk. Used it for spreadsheets.' },
      { label: 'The Internet', yearsAgo: 33, description: 'Connected every human. They used it to argue.' },
      { label: 'Smartphones', yearsAgo: 19, description: 'Supercomputer in every pocket. Used for photos of food.' },
      { label: 'AI', yearsAgo: 3, description: 'Taught sand to think. Still processing implications.' },
    ],
  },
]

/** Maximum yearsAgo value — used as the log base for positioning. */
export const MAX_YEARS = 13_800_000_000

/**
 * Format a large number for display (e.g., 13_800_000_000 → "13.8B").
 */
export function formatYearsAgo(years: number): string {
  if (years >= 1_000_000_000) return `${(years / 1_000_000_000).toFixed(1)}B`
  if (years >= 1_000_000) return `${(years / 1_000_000).toFixed(0)}M`
  if (years >= 1_000) return `${(years / 1_000).toFixed(0)}K`
  return `${years}`
}

// ---------- Horizontal scroll layout ----------

export interface EonLayout {
  era: Era
  width: number      // pixel width of this section
  startX: number     // cumulative pixel offset from left edge
}

/**
 * Square-root scaling for section widths.
 * Each section gets a minimum of MIN_WIDTH pixels, plus a proportional
 * bonus based on the square root of its duration. This creates a timeline
 * where early universe eons take much longer to scroll through, but even
 * the briefest modern eras are still meaningful stops.
 *
 * Total width ≈ 15,000px (about 15 iPad viewports).
 */
const MIN_SECTION_WIDTH = 500
const VARIABLE_WIDTH = 8500

export function computeEonWidths(): EonLayout[] {
  // Duration = span from this era's start to the next era's start (or to 0 for last)
  const durations = ERAS.map((era, i) => {
    const endYears = i < ERAS.length - 1 ? ERAS[i + 1].yearsAgo : 0
    return Math.max(era.yearsAgo - endYears, 1)
  })

  const sqrtDurations = durations.map(d => Math.sqrt(d))
  const totalSqrt = sqrtDurations.reduce((a, b) => a + b, 0)

  let cumulativeX = 0
  return ERAS.map((era, i) => {
    const width = Math.round(MIN_SECTION_WIDTH + (sqrtDurations[i] / totalSqrt) * VARIABLE_WIDTH)
    const layout: EonLayout = { era, width, startX: cumulativeX }
    cumulativeX += width
    return layout
  })
}

export function getTotalTimelineWidth(): number {
  const layouts = computeEonWidths()
  const last = layouts[layouts.length - 1]
  return last.startX + last.width
}
