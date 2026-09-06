export const RAINBOW_COLORS = [
  'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet',
]

export const CHALLENGES = [
  {
    id: 1,
    title: 'Perfect Cut',
    phase: '1st Half',
    description: 'Cut a piece of paper into what you think is a perfect 4-inch square. Overlay them to see who is more accurate.',
    measure: { label: 'Side length', unit: 'in', target: 4, closest: true },
  },
  {
    id: 2,
    title: 'The Gram Master',
    phase: '1st Half',
    description: 'Best of 3 rounds. Each round, a random target weight is shown. Find an item as close to that weight as possible.',
    gramMaster: true,
    measure: { label: 'Weight', unit: 'g', closest: true },
  },
  {
    id: 3,
    title: 'Minute Estimator',
    phase: '1st Half',
    description: 'Start the timer and put your phone face down. Tap Stop when you think exactly 60 seconds have passed. Closest wins.',
    timer: { seconds: 60, mode: 'estimate' },
  },
  {
    id: 4,
    title: 'Water Pour',
    phase: '1st Half',
    description: 'Without using a scale first, pour what you think is exactly 200g of water. Closest wins.',
    measure: { label: 'Water poured', unit: 'g', target: 200, closest: true },
  },
  {
    id: 5,
    title: 'The Obscure Hunt',
    phase: '1st Half',
    description: 'You have 60 seconds to find the most random or useless item in the house. Scorekeeper picks the winner.',
    timer: { seconds: 60, mode: 'countdown' },
  },
  {
    id: 6,
    title: 'The $4.13 Challenge',
    phase: '2nd Half',
    description: 'Find a single item with a price tag as close to $4.13 as possible. Use the price BEFORE TAX on the tag.',
    measure: { label: 'Price', unit: '$', target: 4.13, closest: true },
  },
  {
    id: 7,
    title: 'Q-Hunt',
    phase: '2nd Half',
    description: 'Take a picture of a physical item (not a sign) that starts with the letter Q.',
    photo: { count: 1 },
    blindReveal: true,
  },
  {
    id: 8,
    title: 'Wordle in the Wild',
    phase: '2nd Half',
    description: 'Solve Wordles until you find a word you can find in the wild. Take a picture of it. First one back wins.',
    hasWordleLink: true,
    photo: { count: 1 },
    blindReveal: true,
  },
  {
    id: 9,
    title: 'The Name Tag',
    phase: '2nd Half',
    description: 'Find your own first name on a product or store sign.',
    photo: { count: 1 },
  },
  {
    id: 10,
    title: 'Rainbow Sprint',
    phase: '2nd Half',
    description: 'Take pictures of items for every color of the rainbow, in order.',
    photo: { count: 7, colors: RAINBOW_COLORS },
    blindReveal: true,
  },
]

export const CHALLENGE_COUNT = CHALLENGES.length

export function getChallenge(index) {
  return CHALLENGES[index] ?? null
}

export function getChallengeById(id) {
  return CHALLENGES.find((c) => c.id === id) ?? null
}
