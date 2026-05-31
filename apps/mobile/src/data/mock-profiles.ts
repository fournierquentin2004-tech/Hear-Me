export type MockProfile = {
  id: string
  name: string
  age: number
  city: string
  distanceKm: number
  bio: string
  photos: string[]
  musicStyles: string[]
  topArtists: string[]
  compatibility: number
  connectionType: 'amour' | 'amitié' | 'les deux'
  gender: 'femme' | 'homme'
}

const U = (id: string) =>
  `https://images.unsplash.com/${id}?w=400&h=600&fit=crop&crop=faces&q=80`

export const MOCK_PROFILES: MockProfile[] = [
  {
    id: '1',
    name: 'Léa',
    age: 24,
    city: 'Paris',
    distanceKm: 3,
    gender: 'femme',
    bio: 'Concerts le week-end, playlists le reste du temps. Je juge les gens sur leur premier son Spotify.',
    photos: [
      U('photo-1546961329-78bef0414d7c'),
      U('photo-1552699611-e2c208d5d9cf'),
      U('photo-1506863530036-1efeddceb993'),
    ],
    musicStyles: ['R&B', 'Pop'],
    topArtists: ['Beyoncé', 'Aya Nakamura', 'Rihanna'],
    compatibility: 87,
    connectionType: 'amour',
  },
  {
    id: '2',
    name: 'Sofia',
    age: 22,
    city: 'Lyon',
    distanceKm: 12,
    gender: 'femme',
    bio: 'En mode écoute permanente. Si tu connais pas Hamza on peut pas sortir ensemble.',
    photos: [
      U('photo-1534528741775-53994a69daeb'),
      U('photo-1674932668403-33398b81c92f'),
    ],
    musicStyles: ['Hip-Hop', 'Rap'],
    topArtists: ['Gazo', 'Ninho', 'Hamza'],
    compatibility: 73,
    connectionType: 'les deux',
  },
  {
    id: '3',
    name: 'Camille',
    age: 26,
    city: 'Bordeaux',
    distanceKm: 7,
    gender: 'femme',
    bio: 'DJ le week-end, architecte la semaine. Mes sets durent plus longtemps que mes relations.',
    photos: [
      U('photo-1612203304476-2ed23c55b5b9'),
      U('photo-1633355130553-2d90ad3507d3'),
      U('photo-1581841064838-a470c740e8ee'),
      U('photo-1667053508464-eb11b394df83'),
    ],
    musicStyles: ['Électro', 'Pop'],
    topArtists: ['Dua Lipa', 'Aya Nakamura', 'Stromae'],
    compatibility: 91,
    connectionType: 'amitié',
  },
  {
    id: '4',
    name: 'Julie',
    age: 23,
    city: 'Marseille',
    distanceKm: 28,
    gender: 'femme',
    bio: 'Zaho de Sagazan a changé ma vie. Je cherche quelqu\'un à emmener au prochain festival.',
    photos: [
      U('photo-1514626585111-9aa86183ac98'),
    ],
    musicStyles: ['Variété française', 'R&B'],
    topArtists: ['Zaho de Sagazan', 'Clara Luciani'],
    compatibility: 68,
    connectionType: 'amour',
  },
  {
    id: '5',
    name: 'Emma',
    age: 25,
    city: 'Toulouse',
    distanceKm: 45,
    gender: 'femme',
    bio: 'Vinyles et casque sur les oreilles. Fan absolue de Daft Punk, je ne m\'en excuserai pas.',
    photos: [
      U('photo-1644718847160-52a922094f69'),
      U('photo-1579106355365-9300f02e1b65'),
      U('photo-1564564295391-7f24f26f568b'),
    ],
    musicStyles: ['Rock', 'Électro'],
    topArtists: ['Daft Punk', 'Justice'],
    compatibility: 55,
    connectionType: 'les deux',
  },
  {
    id: '6',
    name: 'Inès',
    age: 21,
    city: 'Nantes',
    distanceKm: 19,
    gender: 'femme',
    bio: 'Frank Ocean m\'a appris ce qu\'est l\'amour. SZA m\'a appris comment s\'en remettre.',
    photos: [
      U('photo-1544005313-94ddf0286df2'),
      U('photo-1613477757159-7fbb73011611'),
    ],
    musicStyles: ['R&B', 'Soul'],
    topArtists: ['Frank Ocean', 'SZA', 'H.E.R.'],
    compatibility: 82,
    connectionType: 'amour',
  },
  {
    id: '7',
    name: 'Chloé',
    age: 27,
    city: 'Strasbourg',
    distanceKm: 62,
    gender: 'femme',
    bio: 'Chanteuse amateur, grande fan de Pomme. Je cherche quelqu\'un avec qui partager des découvertes musicales.',
    photos: [
      U('photo-1552699611-e2c208d5d9cf'),
      U('photo-1579106355365-9300f02e1b65'),
      U('photo-1534528741775-53994a69daeb'),
    ],
    musicStyles: ['Pop', 'Variété française'],
    topArtists: ['Angèle', 'Pomme', 'Zaho de Sagazan'],
    compatibility: 64,
    connectionType: 'amitié',
  },
  {
    id: '8',
    name: 'Lucas',
    age: 25,
    city: 'Paris',
    distanceKm: 5,
    gender: 'homme',
    bio: 'Producteur le soir, développeur le jour. Je fais écouter mes tracks à tout le monde que je rencontre.',
    photos: [
      U('flagged/photo-1595514191830-3e96a518989b'),
      U('photo-1600080695930-6af670ad44fb'),
      U('photo-1590086782957-93c06ef21604'),
    ],
    musicStyles: ['Hip-Hop', 'Électro'],
    topArtists: ['Tyler, the Creator', 'Kaytranada', 'Syd'],
    compatibility: 79,
    connectionType: 'les deux',
  },
  {
    id: '9',
    name: 'Antoine',
    age: 28,
    city: 'Bordeaux',
    distanceKm: 9,
    gender: 'homme',
    bio: 'Guitariste le week-end, amateur de jazz et de rap. Les concerts c\'est sacré.',
    photos: [
      U('photo-1587397845856-e6cf49176c70'),
      U('photo-1600603406200-5b2a104684ac'),
    ],
    musicStyles: ['Rock', 'Jazz'],
    topArtists: ['Radiohead', 'Chet Baker', 'Arctic Monkeys'],
    compatibility: 61,
    connectionType: 'amour',
  },
  {
    id: '10',
    name: 'Maxime',
    age: 23,
    city: 'Lille',
    distanceKm: 34,
    gender: 'homme',
    bio: 'R&B et bonne bouffe. Je cherche quelqu\'un pour aller aux concerts et partager des playlists.',
    photos: [
      U('photo-1535713875002-d1d0cf377fde'),
      U('photo-1542909168-82c3e7fdca5c'),
      U('photo-1508341591423-4347099e1f19'),
    ],
    musicStyles: ['R&B', 'Soul'],
    topArtists: ['Daniel Caesar', 'Brent Faiyaz', 'Giveon'],
    compatibility: 84,
    connectionType: 'amour',
  },
]
