export type LocationSearchResult = {
  id: string
  label: string
  latitude: number
  longitude: number
  city?: string
  street?: string
  source: 'mock' | 'photon' | 'error'
}
