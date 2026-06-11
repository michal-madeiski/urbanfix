import { divIcon } from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'

const pinIcon = divIcon({
  className: 'marker marker-assigned',
  html: '<span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export function ReadOnlyMap({
  latitude,
  longitude,
  className = 'h-44',
}: {
  latitude: number
  longitude: number
  className?: string
}) {
  return (
    <div className={`overflow-hidden rounded-md border border-slate-200 ${className}`}>
      <MapContainer
        attributionControl={false}
        center={[latitude, longitude]}
        className="h-full w-full touch-none"
        doubleClickZoom
        dragging
        scrollWheelZoom={false}
        touchZoom
        zoom={14}
        zoomControl
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker icon={pinIcon} position={[latitude, longitude]} />
      </MapContainer>
    </div>
  )
}
