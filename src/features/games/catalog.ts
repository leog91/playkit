export const games = [
  {
    id: 'age-of-empires-ii',
    hidden: false,
    name: 'Age of Empires II',
    edition: 'Definitive Edition',
    short: 'AOE',
    numeral: 'II',
    genre: 'Real-time strategy',
    color: 'gold',
    description: 'Find your civilization. Build your next strategy.',
    tools: 'Civilization picker',
    available: true,
    links: [
      { label: 'AoE2 Recs — rankings & matches', url: 'https://aoe2recs.com/' },
      {
        label: 'AoE2 Insights — player profiles & match history',
        url: 'https://www.aoe2insights.com/',
      },
      {
        label: 'Tech tree — units & technologies',
        url: 'https://aoe2techtree.net/',
      },
      { label: 'Build Order Guide', url: 'https://buildorderguide.com/' },
      {
        label: 'Liquipedia — tournaments & competitive play',
        url: 'https://liquipedia.net/ageofempires/Age_of_Empires_II',
      },
      {
        label: 'Official game & updates',
        url: 'https://www.ageofempires.com/games/aoeiide/',
      },
      {
        label: 'AoE II community wiki',
        url: 'https://ageofempires.fandom.com/wiki/Age_of_Empires_II:_Definitive_Edition',
      },
    ],
  },
  {
    id: 'battlefield-6',
    hidden: true,
    name: 'Battlefield 6',
    edition: 'Battlefield',
    short: 'BF',
    numeral: '6',
    genre: 'First-person shooter',
    color: 'orange',
    description: 'Your next deployment starts with the right setup.',
    tools: 'Loadouts planned',
    available: false,
    links: [
      {
        label: 'Official game & news',
        url: 'https://www.ea.com/games/battlefield/battlefield-6',
      },
      {
        label: 'Battlefield community',
        url: 'https://www.reddit.com/r/Battlefield/',
      },
    ],
  },
  {
    id: 'battlefield-2042',
    hidden: true,
    name: 'Battlefield 2042',
    edition: 'Battlefield',
    short: 'BF',
    numeral: '2042',
    genre: 'First-person shooter',
    color: 'teal',
    description: 'Keep your next loadout within reach.',
    tools: 'Loadouts planned',
    available: false,
    links: [
      {
        label: 'Official game & news',
        url: 'https://www.ea.com/games/battlefield/battlefield-2042',
      },
      {
        label: 'Battlefield 2042 community',
        url: 'https://www.reddit.com/r/battlefield2042/',
      },
    ],
  },
] as const

export type Game = (typeof games)[number]

export const visibleGames = games.filter((game) => !game.hidden)
