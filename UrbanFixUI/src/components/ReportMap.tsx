import { divIcon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { reportStatusLabels } from '../lib/reportLabels'
import type { Report } from '../types/report'

type ReportMapProps = {
  reports: Report[]
}

const markerClassByStatus: Record<Report['status'], string> = {
  New: 'marker marker-new',
  Verified: 'marker marker-verified',
  Rejected: 'marker marker-rejected',
  Assigned: 'marker marker-assigned',
  Completed: 'marker marker-completed',
}

function createMarker(status: Report['status']) {
  return divIcon({
    className: markerClassByStatus[status] ?? 'marker marker-rejected',
    html: '<span></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  })
}

export function ReportMap({ reports }: ReportMapProps) {
  return (
    <MapContainer
      center={[51.1079, 17.0385]}
      zoom={12}
      scrollWheelZoom
      className="h-full min-h-[420px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => (
        <Marker
          icon={createMarker(report.status)}
          key={report.id}
          position={[report.latitude, report.longitude]}
        >
          <Popup>
            <div className="min-w-52">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {report.id}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-950">
                {reportStatusLabels[report.status] ?? 'Nieznany'}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {report.description}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-800">
                {report.submitterEmail ?? 'Brak adresu e-mail'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
