"use client";

import type { OrbitalParams } from "@/lib/orbital";

interface OrbitalInfoProps {
  params: OrbitalParams | null;
  satelliteName: string;
  noradId: number;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="orbital-row">
      <span className="orbital-label">{label}</span>
      <span className="orbital-value">{value}</span>
    </div>
  );
}

export default function OrbitalInfo({ params, satelliteName, noradId }: OrbitalInfoProps) {
  if (!params) {
    return (
      <div className="glass-panel orbital-panel">
        <div className="panel-header">
          <span className="panel-icon">⊡</span>
          <span className="panel-title">ORBITAL DATA</span>
        </div>
        <div className="orbital-loading">AWAITING DATA...</div>
      </div>
    );
  }

  const orbitType =
    params.inclination > 80 && params.inclination < 100
      ? "SUN-SYNC"
      : params.inclination < 10
        ? "EQUATORIAL"
        : params.eccentricity > 0.1
          ? "ELLIPTICAL"
          : "CIRCULAR";

  return (
    <div className="glass-panel orbital-panel">
      <div className="panel-header">
        <span className="panel-icon">⊡</span>
        <span className="panel-title">ORBITAL DATA</span>
      </div>
      <div className="panel-divider" />

      <div className="orbital-name-row">
        <span className="orbital-sat-name">{satelliteName}</span>
        <span className="orbital-badge">{orbitType}</span>
      </div>

      <div className="orbital-grid">
        <InfoRow label="NORAD ID" value={`#${noradId}`} />
        <InfoRow label="INCLINATION" value={`${params.inclination.toFixed(2)}°`} />
        <InfoRow label="ECCENTRICITY" value={params.eccentricity.toFixed(6)} />
        <InfoRow label="PERIOD" value={`${params.period.toFixed(1)} min`} />
        <InfoRow label="APOGEE" value={`${params.apogee.toFixed(1)} km`} />
        <InfoRow label="PERIGEE" value={`${params.perigee.toFixed(1)} km`} />
        <InfoRow label="MEAN MOTION" value={`${params.meanMotion.toFixed(4)} rev/d`} />
        <InfoRow label="DRAG (B*)" value={params.bstar.toExponential(3)} />
        <InfoRow label="REV #" value={String(params.orbitNumber)} />
      </div>

      <div className="panel-divider" />
      <div className="orbital-epoch">
        <span className="orbital-label">EPOCH</span>
        <span className="orbital-value orbital-epoch-val">{params.epoch}</span>
      </div>
    </div>
  );
}
