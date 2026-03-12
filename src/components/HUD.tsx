"use client";

import type { SatellitePosition } from "@/lib/orbital";

interface HUDProps {
  position: SatellitePosition | null;
  satelliteName: string;
  missionTime: string;
  utc: string;
}

function Readout({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="hud-readout">
      <span className="hud-label">{label}</span>
      <span className={`hud-value ${accent ? "hud-value-accent" : ""}`}>
        {value}
        {unit && <span className="hud-unit">{unit}</span>}
      </span>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mini-bar">
      <div className="mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function HUD({ position, satelliteName, missionTime, utc }: HUDProps) {
  const lat = position ? Math.abs(position.lat).toFixed(4) : "----";
  const lng = position ? Math.abs(position.lng).toFixed(4) : "----";
  const alt = position ? position.alt.toFixed(2) : "----";
  const vel = position ? position.velocity.toFixed(3) : "----";

  const latDir = position ? (position.lat >= 0 ? "N" : "S") : "";
  const lngDir = position ? (position.lng >= 0 ? "E" : "W") : "";

  // Visibility indicator (rough: above horizon = visible)
  const signalStrength = position ? Math.min(position.alt / 500, 1) : 0;

  return (
    <div className="glass-panel hud-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="hud-status-dot" />
        <span className="panel-title">TELEMETRY</span>
        <span className="hud-target">{satelliteName}</span>
      </div>
      <div className="panel-divider" />

      {/* Primary Readouts */}
      <div className="hud-grid">
        <Readout label="LAT" value={`${lat}° ${latDir}`} />
        <Readout label="LNG" value={`${lng}° ${lngDir}`} />
        <Readout label="ALT" value={alt} unit=" km" accent />
        <Readout label="VEL" value={vel} unit=" km/s" accent />
      </div>

      <div className="panel-divider" />

      {/* Signal + Altitude Bar */}
      <div className="hud-bars">
        <div className="hud-bar-row">
          <span className="hud-label">SIGNAL</span>
          <MiniBar value={signalStrength} max={1} color="var(--green)" />
          <span className="hud-bar-val">{(signalStrength * 100).toFixed(0)}%</span>
        </div>
        <div className="hud-bar-row">
          <span className="hud-label">ALT</span>
          <MiniBar value={position?.alt ?? 0} max={1000} color="var(--cyan)" />
          <span className="hud-bar-val">{position ? `${(position.alt).toFixed(0)}` : "---"}</span>
        </div>
      </div>

      <div className="panel-divider" />

      {/* Footer: MET + UTC */}
      <div className="hud-footer">
        <div className="hud-footer-col">
          <span className="hud-label">MET</span>
          <span className="hud-clock">{missionTime}</span>
        </div>
        <div className="hud-footer-col hud-footer-right">
          <span className="hud-label">UTC</span>
          <span className="hud-clock-dim">{utc}</span>
        </div>
      </div>
    </div>
  );
}
