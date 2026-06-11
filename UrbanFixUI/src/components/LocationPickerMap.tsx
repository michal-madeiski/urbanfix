import { divIcon } from 'leaflet'
import { useEffect } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'

type Coordinates = {
  latitude: number
  longitude: number
}

const selectedIcon = divIcon({
  className: 'marker marker-selected',
  html: '<span></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

function ClickHandler({
  onSelect,
}: {
  onSelect: (coordinates: Coordinates) => void
}) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      })
    },
  })

  return null
}

function Recenter({ coordinates }: { coordinates: Coordinates | null }) {
  const map = useMap()

  useEffect(() => {
    if (coordinates) {
      map.panTo([coordinates.latitude, coordinates.longitude])
    }
  }, [coordinates, map])

  return null
}

export function LocationPickerMap({
  selected,
  onSelect,
}: {
  selected: Coordinates | null
  onSelect: (coordinates: Coordinates) => void
}) {
  return (
    <MapContainer
      center={[51.1079, 17.0385]}
      className="h-full min-h-[240px] w-full sm:min-h-[360px] lg:min-h-[420px] touch-none"
      scrollWheelZoom
      zoom={12}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onSelect={onSelect} />
      <Recenter coordinates={selected} />
      {selected && (
        <Marker
          icon={selectedIcon}
          position={[selected.latitude, selected.longitude]}
        />
      )}
    </MapContainer>
  )
}
