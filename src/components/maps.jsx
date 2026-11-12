import { useEffect } from 'react'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { CENTER, STATUS_COLOR, catOf } from '../lib/constants'
import { fmtDate } from '../lib/format'
import { StatusBadge } from './ui'

// OSM's own tile server blocks many shared hosts (e.g. Codespaces), so CARTO tiles (OSM data) are the default.
// Keyless tiles for demos. Note: Esri URLs use {z}/{y}/{x} (y before x).
const TILE_URL = import.meta.env.VITE_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
const Tiles = () => <TileLayer attribution="Tiles &copy; Esri, HERE, Garmin, OpenStreetMap contributors" url={TILE_URL} maxZoom={19} />

// Each marker is a main complaint; grouped duplicates are counted inside "affected".
export function ComplaintMap({ complaints, height = 440, zoom = 12, center = CENTER, detail = true }) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height }} className="z-0 rounded-xl border border-line">
      <Tiles />
      {complaints.filter((c) => !c.parentId).map((c) => (
        <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={7 + Math.min(13, Math.sqrt(c.affected || 1) * 2.4)}
          pathOptions={{ color: '#fff', weight: 2, fillColor: STATUS_COLOR[c.status], fillOpacity: 0.9 }}>
          <Popup>
            {detail ? (
              <div className="min-w-[210px] space-y-1.5 font-sans text-sm">
                <p className="font-bold">{c.id} · {catOf(c.category).short}</p>
                <p className="text-slate-700">{c.description.slice(0, 90)}{c.description.length > 90 && '…'}</p>
                <p className="text-xs text-slate-500">{c.address}</p>
                <p className="text-xs">{c.affected} citizens affected · {fmtDate(c.createdAt)}</p>
                <StatusBadge status={c.status} />
                <div><Link to={`/complaints/${c.id}`} className="text-xs font-semibold text-brand-700 underline">View complaint</Link></div>
              </div>
            ) : (
              <p className="text-sm">{catOf(c.category).short} · {c.status}</p>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

const pin = L.divIcon({
  className: '',
  html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#0F6E63;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.45)"></div>',
  iconSize: [28, 28], iconAnchor: [14, 34],
})
function Clicker({ onPick }) { useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) }); return null }
function Fly({ pos }) { const m = useMap(); useEffect(() => { m.flyTo([pos.lat, pos.lng], Math.max(m.getZoom(), 16), { duration: 0.6 }) }, [pos.lat, pos.lng]); return null } // eslint-disable-line

export function LocationPicker({ pos, onPick, nearby = [], fly }) {
  return (
    <MapContainer center={[pos.lat, pos.lng]} zoom={13} scrollWheelZoom style={{ height: 320 }} className="z-0 rounded-xl border border-line">
      <Tiles />
      <Clicker onPick={onPick} />
      {fly && <Fly pos={pos} />}
      {nearby.map((c) => <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: '#D97706', fillOpacity: 0.9 }}><Popup>{c.id} · already reported</Popup></CircleMarker>)}
      <Marker position={[pos.lat, pos.lng]} icon={pin} draggable eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onPick(p.lat, p.lng) } }} />
    </MapContainer>
  )
}
