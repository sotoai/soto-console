// Font keys map to Google Fonts loaded in QuoteRotator.tsx
export type QuoteFont = 'serif' | 'mono' | 'marker' | 'caveat' | 'sans'

export interface Quote {
  text: string
  author?: string
  font: QuoteFont
}

export const QUOTES: Quote[] = [
  // ── Stoic (serif — contemplative, classical) ──
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius', font: 'serif' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca', font: 'serif' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus', font: 'serif' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius', font: 'serif' },
  { text: 'He who fears death will never do anything worthy of a living man.', author: 'Seneca', font: 'serif' },
  { text: 'It is not that we have a short time to live, but that we waste a great deal of it.', author: 'Seneca', font: 'serif' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius', font: 'serif' },
  { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus', font: 'serif' },
  { text: 'The soul becomes dyed with the color of its thoughts.', author: 'Marcus Aurelius', font: 'serif' },
  { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca', font: 'serif' },

  // ── Biblical Proverbs & Wisdom (caveat — handwritten, warm) ──
  { text: 'Trust in the Lord with all your heart and lean not on your own understanding.', author: 'Proverbs 3:5', font: 'caveat' },
  { text: 'As iron sharpens iron, so one person sharpens another.', author: 'Proverbs 27:17', font: 'caveat' },
  { text: 'Where there is no vision, the people perish.', author: 'Proverbs 29:18', font: 'caveat' },
  { text: 'The fear of the Lord is the beginning of wisdom.', author: 'Proverbs 9:10', font: 'caveat' },
  { text: 'A gentle answer turns away wrath, but a harsh word stirs up anger.', author: 'Proverbs 15:1', font: 'caveat' },
  { text: 'Commit to the Lord whatever you do, and He will establish your plans.', author: 'Proverbs 16:3', font: 'caveat' },
  { text: 'Above all else, guard your heart, for everything you do flows from it.', author: 'Proverbs 4:23', font: 'caveat' },
  { text: 'The name of the Lord is a fortified tower; the righteous run to it and are safe.', author: 'Proverbs 18:10', font: 'caveat' },
  { text: 'Plans fail for lack of counsel, but with many advisers they succeed.', author: 'Proverbs 15:22', font: 'caveat' },
  { text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest.', author: 'Galatians 6:9', font: 'caveat' },
  { text: 'I can do all things through Christ who strengthens me.', author: 'Philippians 4:13', font: 'caveat' },
  { text: 'For I know the plans I have for you, declares the Lord. Plans to prosper you and not to harm you.', author: 'Jeremiah 29:11', font: 'caveat' },

  // ── Historic & philosophical (mono — engraved, deliberate) ──
  { text: 'The unexamined life is not worth living.', author: 'Socrates', font: 'mono' },
  { text: 'I think, therefore I am.', author: 'Descartes', font: 'mono' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Nietzsche', font: 'mono' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', font: 'mono' },
  { text: 'The only thing we have to fear is fear itself.', author: 'Franklin D. Roosevelt', font: 'mono' },
  { text: 'Those who cannot remember the past are condemned to repeat it.', author: 'George Santayana', font: 'mono' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle', font: 'mono' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle', font: 'mono' },
  { text: 'The mind is everything. What you think, you become.', author: 'Buddha', font: 'mono' },
  { text: 'To improve is to change; to be perfect is to change often.', author: 'Winston Churchill', font: 'mono' },

  // ── Aspirational & legendary (marker — bold, raw) ──
  { text: 'Fortune favors the bold.', author: 'Virgil', font: 'marker' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', font: 'marker' },
  { text: 'A ship in harbor is safe, but that is not what ships are built for.', author: 'John A. Shedd', font: 'marker' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius', font: 'marker' },
  { text: 'Do not pray for easy lives. Pray to be stronger men.', author: 'John F. Kennedy', font: 'marker' },
  { text: 'It is not the critic who counts. The credit belongs to the man in the arena.', author: 'Theodore Roosevelt', font: 'marker' },
  { text: 'What we do in life echoes in eternity.', author: 'Marcus Aurelius', font: 'marker' },
  { text: 'The wound is the place where the light enters you.', author: 'Rumi', font: 'marker' },
  { text: 'Hard times create strong men. Strong men create good times.', font: 'marker' },
  { text: 'Be the change you wish to see in the world.', author: 'Gandhi', font: 'marker' },

  // ── Bold imperatives (sans — stark, commanding) ──
  { text: 'Memento mori.', font: 'sans' },
  { text: 'Amor fati.', font: 'sans' },
  { text: 'The obstacle is the way.', author: 'Marcus Aurelius', font: 'sans' },
  { text: 'Discipline equals freedom.', author: 'Jocko Willink', font: 'sans' },
  { text: 'Per aspera ad astra.', font: 'sans' },
  { text: 'Know thyself.', author: 'Temple of Apollo at Delphi', font: 'sans' },
  { text: 'Veni, vidi, vici.', author: 'Julius Caesar', font: 'sans' },
  { text: 'This too shall pass.', font: 'sans' },
  { text: 'Actions prove who someone is. Words prove who they want to be.', font: 'sans' },
  { text: 'Stay hungry. Stay foolish.', author: 'Stewart Brand', font: 'sans' },
]
