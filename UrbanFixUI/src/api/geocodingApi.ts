import { searchMockAddresses } from '../lib/mockGeocoder'
import type { LocationSearchResult } from '../types/location'

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number]
  }
  properties?: {
    osm_id?: number
    osm_type?: string
    name?: string
    city?: string
    street?: string
    housenumber?: string
    postcode?: string
    country?: string
  }
}

type PhotonResponse = {
  features?: PhotonFeature[]
}

const provider = import.meta.env.VITE_GEOCODER_PROVIDER ?? 'photon'
const photonUrl =
  import.meta.env.VITE_PHOTON_URL ?? 'https://photon.komoot.io/api/'

function toPhotonLabel(properties: NonNullable<PhotonFeature['properties']>) {
  const streetWithNumber = [properties.street, properties.housenumber]
    .filter(Boolean)
    .join(' ')
  const primary = streetWithNumber || properties.name
  const secondary = [
    properties.city !== primary ? properties.city : null,
    properties.postcode,
    properties.country !== primary ? properties.country : null,
  ]
    .filter(Boolean)
    .join(', ')

  return [primary, secondary].filter(Boolean).join(', ')
}

function mapPhotonFeature(feature: PhotonFeature, index: number) {
  const coordinates = feature.geometry?.coordinates
  const properties = feature.properties

  if (!coordinates || !properties) {
    return null
  }

  const [longitude, latitude] = coordinates
  const label = toPhotonLabel(properties)

  if (!label) {
    return null
  }

  const result: LocationSearchResult = {
    id: `photon-${properties.osm_type ?? 'item'}-${properties.osm_id ?? index}`,
    label,
    latitude,
    longitude,
    source: 'photon',
  }

  if (properties.city) {
    result.city = properties.city
  }

  if (properties.street) {
    result.street = properties.street
  }

  return result
}

async function searchPhoton(query: string) {
  const url = new URL(photonUrl)

  url.searchParams.set('q', query)
  url.searchParams.set('limit', '5')
  url.searchParams.set('lat', '51.1079')
  url.searchParams.set('lon', '17.0385')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Photon geocoder failed with status ${response.status}`)
  }

  const data = (await response.json()) as PhotonResponse

  return (
    data.features
      ?.map(mapPhotonFeature)
      .filter((result) => result !== null) ?? []
  )
}

export async function searchLocations(query: string) {
  const trimmed = query.trim()

  if (trimmed.length < 3) {
    return []
  }

  if (provider === 'mock') {
    return searchMockAddresses(trimmed).slice(0, 5)
  }

  try {
    return await searchPhoton(trimmed)
  } catch (err) {
    console.error(err)
    const errorResult: LocationSearchResult[] = [
      {
        id: 'geocoder-error',
        label: 'Brak połączenia z wyszukiwarką adresów',
        latitude: 0,
        longitude: 0,
        source: 'error',
      },
    ]
    return errorResult
  }
}
