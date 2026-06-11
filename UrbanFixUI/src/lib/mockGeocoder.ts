import type { LocationSearchResult } from '../types/location'

export const mockAddresses: LocationSearchResult[] = [
  {
    id: 'mock-wroclaw-rynek',
    label: 'Rynek, Wroclaw',
    latitude: 51.109,
    longitude: 17.0327,
    city: 'Wroclaw',
    source: 'mock',
  },
  {
    id: 'mock-wroclaw-plac-grunwaldzki',
    label: 'Plac Grunwaldzki, Wroclaw',
    latitude: 51.1118,
    longitude: 17.0601,
    city: 'Wroclaw',
    source: 'mock',
  },
  {
    id: 'mock-wroclaw-legnicka',
    label: 'ul. Legnicka 58, Wroclaw',
    latitude: 51.1192,
    longitude: 16.9896,
    city: 'Wroclaw',
    street: 'Legnicka',
    source: 'mock',
  },
  {
    id: 'mock-wroclaw-dworzec',
    label: 'Dworzec Glowny, Wroclaw',
    latitude: 51.0982,
    longitude: 17.0367,
    city: 'Wroclaw',
    source: 'mock',
  },
  {
    id: 'mock-wroclaw-park-szczytnicki',
    label: 'Park Szczytnicki, Wroclaw',
    latitude: 51.1172,
    longitude: 17.0795,
    city: 'Wroclaw',
    source: 'mock',
  },
]

export function searchMockAddresses(query: string) {
  const normalized = query.trim().toLocaleLowerCase('pl-PL')

  if (!normalized) {
    return mockAddresses
  }

  return mockAddresses.filter((address) =>
    address.label.toLocaleLowerCase('pl-PL').includes(normalized),
  )
}
