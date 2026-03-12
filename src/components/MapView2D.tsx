"use client";

import { useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import type { SatellitePosition } from "@/lib/orbital";
import type { Map as LeafletMap } from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

// Satellite icon for Leaflet (lazy-loaded to avoid SSR crash)
function createSatIcon() {
  if (typeof window === "undefined") return undefined;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet") as typeof import("leaflet");
  return L.divIcon({
    className: "sat-marker-2d",
    html: `<div class="sat-marker-pulse"></div><div class="sat-marker-core"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface MapView2DProps {
  position: SatellitePosition | null;
  orbitTracks: { lat: number; lng: number; alt: number }[][];
  footprintRadius: number; // km
  satelliteName: string;
}

export default function MapView2D({
  position,
  orbitTracks,
  footprintRadius,
  satelliteName,
}: MapView2DProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const lastPanRef = useRef(0);

  const satIcon = useMemo(() => createSatIcon(), []);

  // Break tracks into segments at antimeridian crossings
  const trackLines = useMemo(() => {
    const allSegments: [number, number][][] = [];
    for (const track of orbitTracks) {
      let segment: [number, number][] = [];
      for (let i = 0; i < track.length; i++) {
        const p = track[i];
        if (i > 0 && Math.abs(track[i - 1].lng - p.lng) > 180) {
          if (segment.length > 1) allSegments.push(segment);
          segment = [];
        }
        segment.push([p.lat, p.lng]);
      }
      if (segment.length > 1) allSegments.push(segment);
    }
    return allSegments;
  }, [orbitTracks]);

  // Auto-pan to satellite every 5s
  useEffect(() => {
    if (!position || !mapRef.current) return;
    const now = Date.now();
    if (now - lastPanRef.current < 5000) return;
    lastPanRef.current = now;
    mapRef.current.panTo([position.lat, position.lng], { animate: true, duration: 1 });
  }, [position]);

  return (
    <div className="map2d-container">
      <MapContainer
        center={position ? [position.lat, position.lng] : [20, 0]}
        zoom={3}
        minZoom={2}
        maxZoom={12}
        zoomControl={false}
        attributionControl={false}
        className="map2d-leaflet"
        style={{ width: "100%", height: "100%", background: "#0a0a1a" }}
        ref={mapRef}
        worldCopyJump={true}
      >
        {/* Dark map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Orbit ground tracks */}
        {trackLines.map((segment, i) => (
          <Polyline
            key={`track-${i}`}
            positions={segment}
            pathOptions={{
              color: i === 0 ? "#00f0ff" : "#00f0ff",
              weight: i === 0 ? 2 : 1,
              opacity: i === 0 ? 0.6 : 0.2,
              dashArray: i === 0 ? undefined : "8 6",
            }}
          />
        ))}

        {/* Visibility footprint */}
        {position && footprintRadius > 0 && (
          <Circle
            center={[position.lat, position.lng]}
            radius={footprintRadius * 1000} // convert km to meters
            pathOptions={{
              color: "#00f0ff",
              weight: 1,
              opacity: 0.3,
              fillColor: "#00f0ff",
              fillOpacity: 0.05,
              dashArray: "4 4",
            }}
          />
        )}

        {/* Satellite marker */}
        {position && satIcon && (
          <Marker position={[position.lat, position.lng]} icon={satIcon}>
            <Popup className="sat-popup">
              <div className="sat-popup-content">
                <strong>{satelliteName}</strong>
                <br />
                ALT: {position.alt.toFixed(1)} km
                <br />
                VEL: {position.velocity.toFixed(2)} km/s
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map overlay info */}
      <div className="map2d-overlay-info">
        <span className="map2d-label">2D GROUND TRACK</span>
      </div>
    </div>
  );
}
