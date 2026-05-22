import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Complaint } from '@/types/complaint'
import { formatDate } from '@/utils/format'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

interface ComplaintMapProps {
  complaints: Complaint[]
  height?: string
  zoom?: number
}

export function ComplaintMap({
  complaints,
  height = '500px',
  zoom = 5,
}: ComplaintMapProps) {
  const withLocation = complaints.filter((c) => c.location?.latitude != null && c.location?.longitude != null)

  if (withLocation.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500"
      >
        No complaints with GPS location yet.
      </div>
    )
  }

  const mapCenter: [number, number] = [
    withLocation[0].location!.latitude,
    withLocation[0].location!.longitude,
  ]

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={mapCenter}
        zoom={withLocation.length === 1 ? 14 : zoom}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withLocation.map((c) => (
          <Marker key={c.id} position={[c.location!.latitude, c.location!.longitude]}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold">#{c.id}</p>
                <p className="text-xs capitalize">
                  {c.aiLabel || '—'} · {formatDate(c.timestamp)}
                </p>
                <Link to={`/complaints/${c.id}`} className="text-sm text-brand-600 hover:underline">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
