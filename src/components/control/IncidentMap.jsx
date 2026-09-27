import React from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fmtTime } from '@/lib/synclet/format';

const RADIUS_M = 400;

export default function IncidentMap({ incident }) {
  const hasLocation = incident.latitude != null && incident.longitude != null;
  const center = [incident.latitude, incident.longitude];
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border text-[11px] font-mono tracking-wider">
        <span className="text-muted-foreground">LOCATION</span>
        <span className={incident.location_simulated ? 'text-warn' : 'text-safe'}>
          {incident.location_simulated ? '⚑ FALLBACK LOCATION' : '● PHONE GPS'}
        </span>
      </div>
      {hasLocation ? (
        <MapContainer key={incident.id} center={center} zoom={15} scrollWheelZoom={false} className="h-64 w-full z-0">
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles-dark" attribution="&copy; OpenStreetMap contributors" />
          <Circle center={center} radius={RADIUS_M} pathOptions={{ color: '#ef4444', weight: 1, fillOpacity: 0.08 }} />
          <CircleMarker center={center} radius={8} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#ef4444', fillOpacity: 1 }} />
        </MapContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No location available — withheld or not captured.</div>
      )}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 px-3 py-2 text-xs border-t border-border">
        <div><dt className="text-muted-foreground">Coordinates</dt><dd className="font-mono">{hasLocation ? `${incident.latitude}, ${incident.longitude}` : '—'}</dd></div>
        <div><dt className="text-muted-foreground">Approx. address</dt><dd>{incident.location_label}</dd></div>
        <div><dt className="text-muted-foreground">Response radius</dt><dd>{RADIUS_M} m</dd></div>
        <div><dt className="text-muted-foreground">Last updated</dt><dd className="font-mono">{fmtTime(incident.updated_date)}</dd></div>
      </dl>
    </div>
  );
}
