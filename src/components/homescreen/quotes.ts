// Font keys map to Google Fonts loaded in QuoteRotator.tsx
export type QuoteFont = 'serif' | 'mono' | 'marker' | 'caveat' | 'sans'

export interface Quote {
  text: string
  author?: string
  font: QuoteFont
}

export const QUOTES: Quote[] = [
  // ── Philosophical / poetic (serif) ──
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', font: 'serif' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle', font: 'serif' },
  { text: 'The universe is under no obligation to make sense to you.', author: 'Neil deGrasse Tyson', font: 'serif' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', font: 'serif' },
  { text: 'Not all those who wander are lost.', author: 'J.R.R. Tolkien', font: 'serif' },
  { text: 'The wound is the place where the light enters you.', author: 'Rumi', font: 'serif' },
  { text: 'Everything you can imagine is real.', author: 'Pablo Picasso', font: 'serif' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', font: 'serif' },

  // ── Absurd / ridiculous (marker — handwritten) ──
  { text: 'A squirrel is just a rat with better PR.', font: 'marker' },
  { text: 'You miss 100% of the naps you don\'t take.', font: 'marker' },
  { text: 'Be the chaos you wish to see in the world.', font: 'marker' },
  { text: 'Life is short. Eat the weird cheese.', font: 'marker' },
  { text: 'You\'re not lost. You\'re just on a really scenic detour.', font: 'marker' },
  { text: 'Somebody out there is warming up with your max. Go lift.', font: 'marker' },
  { text: 'If at first you don\'t succeed, redefine success.', font: 'marker' },
  { text: 'Today\'s forecast: 100% chance of crushing it.', font: 'marker' },
  { text: 'Dance like no one is watching. Because they\'re not. They\'re on their phones.', font: 'marker' },

  // ── Tech / hacker vibes (mono) ──
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds', font: 'mono' },
  { text: 'The best error message is the one that never shows up.', author: 'Thomas Fuchs', font: 'mono' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson', font: 'mono' },
  { text: 'It works on my machine.', author: 'Every developer ever', font: 'mono' },
  { text: 'There are only two hard things: cache invalidation, naming things, and off-by-one errors.', font: 'mono' },
  { text: 'Any sufficiently advanced technology is indistinguishable from magic.', author: 'Arthur C. Clarke', font: 'mono' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', font: 'mono' },
  { text: 'The computer was born to solve problems that did not exist before.', author: 'Bill Gates', font: 'mono' },

  // ── Warm / encouraging (caveat — casual handwriting) ──
  { text: 'You are doing better than you think.', font: 'caveat' },
  { text: 'Small steps still move you forward.', font: 'caveat' },
  { text: 'Rest if you must, but don\'t quit.', font: 'caveat' },
  { text: 'Your potential is not defined by your current chapter.', font: 'caveat' },
  { text: 'Hey, you\'re gonna be great today.', font: 'caveat' },
  { text: 'Breathe. You\'ve survived 100% of your worst days so far.', font: 'caveat' },
  { text: 'The world needs what you have to offer.', font: 'caveat' },
  { text: 'It\'s okay to be a work in progress and a masterpiece at the same time.', font: 'caveat' },
  { text: 'You didn\'t come this far to only come this far.', font: 'caveat' },

  // ── Bold / motivational (sans — clean, strong) ──
  { text: 'Ship it.', font: 'sans' },
  { text: 'Done is better than perfect.', font: 'sans' },
  { text: 'Make something people want.', author: 'Y Combinator', font: 'sans' },
  { text: 'Stay hungry. Stay foolish.', author: 'Stewart Brand', font: 'sans' },
  { text: 'Move fast and break things.', font: 'sans' },
  { text: 'Discipline equals freedom.', author: 'Jocko Willink', font: 'sans' },
  { text: 'Hard choices, easy life. Easy choices, hard life.', author: 'Jerzy Gregorek', font: 'sans' },
  { text: 'The obstacle is the way.', author: 'Marcus Aurelius', font: 'sans' },
  { text: 'What would you attempt to do if you knew you could not fail?', font: 'sans' },
]
