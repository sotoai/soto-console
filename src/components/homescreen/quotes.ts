export interface Quote {
  text: string
  author?: string
}

export const QUOTES: Quote[] = [
  // ── Stoic ──
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius' },
  { text: 'He who fears death will never do anything worthy of a living man.', author: 'Seneca' },
  { text: 'It is not that we have a short time to live, but that we waste a great deal of it.', author: 'Seneca' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  { text: 'The soul becomes dyed with the color of its thoughts.', author: 'Marcus Aurelius' },
  { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca' },

  // ── Biblical Proverbs & Wisdom ──
  { text: 'Trust in the Lord with all your heart and lean not on your own understanding.', author: 'Proverbs 3:5' },
  { text: 'As iron sharpens iron, so one person sharpens another.', author: 'Proverbs 27:17' },
  { text: 'Where there is no vision, the people perish.', author: 'Proverbs 29:18' },
  { text: 'The fear of the Lord is the beginning of wisdom.', author: 'Proverbs 9:10' },
  { text: 'A gentle answer turns away wrath, but a harsh word stirs up anger.', author: 'Proverbs 15:1' },
  { text: 'Commit to the Lord whatever you do, and He will establish your plans.', author: 'Proverbs 16:3' },
  { text: 'Above all else, guard your heart, for everything you do flows from it.', author: 'Proverbs 4:23' },
  { text: 'The name of the Lord is a fortified tower; the righteous run to it and are safe.', author: 'Proverbs 18:10' },
  { text: 'Plans fail for lack of counsel, but with many advisers they succeed.', author: 'Proverbs 15:22' },
  { text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest.', author: 'Galatians 6:9' },
  { text: 'I can do all things through Christ who strengthens me.', author: 'Philippians 4:13' },
  { text: 'For I know the plans I have for you, declares the Lord. Plans to prosper you and not to harm you.', author: 'Jeremiah 29:11' },

  // ── Historic & Philosophical ──
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'I think, therefore I am.', author: 'Descartes' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Nietzsche' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'The only thing we have to fear is fear itself.', author: 'Franklin D. Roosevelt' },
  { text: 'Those who cannot remember the past are condemned to repeat it.', author: 'George Santayana' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
  { text: 'The mind is everything. What you think, you become.', author: 'Buddha' },
  { text: 'To improve is to change; to be perfect is to change often.', author: 'Winston Churchill' },

  // ── Aspirational ──
  { text: 'Fortune favors the bold.', author: 'Virgil' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.' },
  { text: 'A ship in harbor is safe, but that is not what ships are built for.', author: 'John A. Shedd' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius' },
  { text: 'Do not pray for easy lives. Pray to be stronger men.', author: 'John F. Kennedy' },
  { text: 'It is not the critic who counts. The credit belongs to the man in the arena.', author: 'Theodore Roosevelt' },
  { text: 'What we do in life echoes in eternity.', author: 'Marcus Aurelius' },
  { text: 'The wound is the place where the light enters you.', author: 'Rumi' },
  { text: 'Hard times create strong men. Strong men create good times.' },
  { text: 'Be the change you wish to see in the world.', author: 'Gandhi' },

  // ── Imperatives ──
  { text: 'Memento mori.' },
  { text: 'Amor fati.' },
  { text: 'The obstacle is the way.', author: 'Marcus Aurelius' },
  { text: 'Discipline equals freedom.', author: 'Jocko Willink' },
  { text: 'Per aspera ad astra.' },
  { text: 'Know thyself.', author: 'Temple of Apollo at Delphi' },
  { text: 'Veni, vidi, vici.', author: 'Julius Caesar' },
  { text: 'This too shall pass.' },
  { text: 'Actions prove who someone is. Words prove who they want to be.' },
  { text: 'Stay hungry. Stay foolish.', author: 'Stewart Brand' },
]
