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
  isLoading?: boolean
}

function getMarkerColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'RESOLVED':
      return '#16a34a'
    case 'PENDING':
    case 'ASSIGNED':
      return '#dc2626'
    default:
      return '#7c3aed'
  }
}

function createComplaintIcon(status: string) {
  const color = getMarkerColor(status)
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:28px;height:36px;display:flex;align-items:flex-start;justify-content:center;">
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 6px 10px rgba(15,23,42,0.22))">
          <path d="M14 35C14 35 24 23.5 24 15.5C24 9.14873 19.5228 4 14 4C8.47715 4 4 9.14873 4 15.5C4 23.5 14 35 14 35Z" fill="${color}"/>
          <circle cx="14" cy="15.5" r="4.4" fill="white" opacity="0.95"/>
        </svg>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 35],
    popupAnchor: [0, -32],
  })
}

export function ComplaintMap({
  complaints,
  height = '500px',
  zoom = 5,
  isLoading = false,
}: ComplaintMapProps) {
  const safeComplaints = Array.isArray(complaints) ? complaints : []
  const withLocation = safeComplaints.filter((c) => c.lat != null && c.lng != null)
  const mapCenter: [number, number] =
    withLocation.length > 0
      ? [withLocation[0].lat!, withLocation[0].lng!]
      : [28.6139, 77.209]

  return (
    <div style={{ height }} className="relative overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={mapCenter} zoom={zoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withLocation.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat!, c.lng!]}
            icon={createComplaintIcon(c.status)}
          >
            <Popup>
              <div className="min-w-[220px] space-y-1">
                <p className="font-semibold text-brand-900">Complaint #{c.id}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 font-medium text-brand-900">
                    Severity: {c.severity}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
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
      {!isLoading && withLocation.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
            No complaints reported yet
          </div>
        </div>
      )}
    </div>
  )
}
