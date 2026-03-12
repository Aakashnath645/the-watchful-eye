"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FEATURED_SATELLITES, type SatelliteTarget } from "@/lib/satellites";
import {
  fetchTLE,
  propagatePosition,
  computeOrbit,
  computeMultiOrbit,
  getOrbitalParams,
  getFootprintRadius,
  type SatRecord,
  type SatellitePosition,
  type OrbitalParams,
} from "@/lib/orbital";
import HUD from "@/components/HUD";
import SatelliteSelector from "@/components/SatelliteSelector";
import GlobeView from "@/components/GlobeView";
import MapView2D from "@/components/MapView2D";
import OrbitalInfo from "@/components/OrbitalInfo";
import ViewToggle, { type ViewMode } from "@/components/ViewToggle";
import Guide from "@/components/Guide";
import LoadingScreen from "@/components/LoadingScreen";
import Navigation from "@/components/Navigation";

function formatMET(elapsed: number): string {
  const hrs = Math.floor(elapsed / 3600000);
  const mins = Math.floor((elapsed % 3600000) / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  return `${String(hrs).padStart(3, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

const UPDATE_INTERVAL_MS = 100;

export default function Dashboard() {
  const [target, setTarget] = useState<SatelliteTarget>(FEATURED_SATELLITES[0]);
  const [satRecord, setSatRecord] = useState<SatRecord | null>(null);
  const [position, setPosition] = useState<SatellitePosition | null>(null);
  const [orbitPath, setOrbitPath] = useState<{ lat: number; lng: number; alt: number }[]>([]);
  const [multiOrbit, setMultiOrbit] = useState<{ lat: number; lng: number; alt: number }[][]>([]);
  const [orbitalParams, setOrbitalParams] = useState<OrbitalParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [utc, setUtc] = useState("");
  const [met, setMet] = useState("000:00:00");
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [showOrbital, setShowOrbital] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  // Decide on mount: show loading animation (new visit) or skip it (return visit)
  useEffect(() => {
    if (sessionStorage.getItem("watchful-eye-loaded") === "true") {
      setAppReady(true);
    } else {
      setShowLoading(true);
    }
  }, []);

  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const lastUpdateRef = useRef(0);

  // Compute footprint radius
  const footprintRadius = useMemo(
    () => (position ? getFootprintRadius(position.alt) : 0),
    [position?.alt]
  );

  // Fetch TLE when target changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTLE(target)
      .then((record) => {
        if (cancelled) return;
        setSatRecord(record);
        const now = new Date();
        setOrbitPath(computeOrbit(record.satrec, now));
        setMultiOrbit(computeMultiOrbit(record.satrec, now, 3));
        setOrbitalParams(getOrbitalParams(record.satrec));
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [target]);

  // Real-time propagation loop — throttled to ~10Hz
  useEffect(() => {
    if (!satRecord) return;

    const tick = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= UPDATE_INTERVAL_MS) {
        lastUpdateRef.current = now;
        const pos = propagatePosition(satRecord.satrec, new Date(now));
        if (pos) setPosition(pos);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [satRecord]);

  // Recompute orbit every 5 minutes
  useEffect(() => {
    if (!satRecord) return;
    const interval = setInterval(() => {
      const now = new Date();
      setOrbitPath(computeOrbit(satRecord.satrec, now));
      setMultiOrbit(computeMultiOrbit(satRecord.satrec, now, 3));
    }, 300_000);
    return () => clearInterval(interval);
  }, [satRecord]);

  const handleTargetChange = useCallback((newTarget: SatelliteTarget) => {
    setTarget(newTarget);
    startTimeRef.current = Date.now();
  }, []);

  // 1-second clock interval
  useEffect(() => {
    const interval = setInterval(() => {
      setMet(formatMET(Date.now() - startTimeRef.current));
      setUtc(new Date().toISOString().slice(11, 19));
    }, 1000);
    setUtc(new Date().toISOString().slice(11, 19));
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ===== LOADING SCREEN ===== */}
      {showLoading && !appReady && <LoadingScreen onComplete={() => {
        sessionStorage.setItem("watchful-eye-loaded", "true");
        setAppReady(true);
        setShowLoading(false);
      }} />}

      {/* ===== GUIDE OVERLAY ===== */}
      {showGuide && <Guide onClose={() => setShowGuide(false)} />}

      <div className="dashboard">
        {/* ===== MAP VIEWS ===== */}
        <div className={`view-layer ${viewMode === "3d" ? "view-visible" : "view-hidden"}`}>
          <GlobeView
            position={position}
            orbitPath={orbitPath}
            satelliteName={satRecord?.name ?? target.name}
            footprintRadius={footprintRadius}
          />
        </div>
        <div className={`view-layer ${viewMode === "2d" ? "view-visible" : "view-hidden"}`}>
          {viewMode === "2d" && (
            <MapView2D
              position={position}
              orbitTracks={multiOrbit}
              footprintRadius={footprintRadius}
              satelliteName={satRecord?.name ?? target.name}
            />
          )}
        </div>

        {/* ===== TOP BAR ===== */}
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="logo-icon">◉</span>
            <h1 className="logo-text">THE WATCHFUL EYE</h1>
          </div>
          <div className="top-bar-center">
            <Navigation />
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
          <div className="top-bar-right">
            <button className="guide-trigger" onClick={() => setShowGuide(true)} title="Open Guide">
              ?
            </button>
            <span className="status-badge">
              <span className="status-dot-live" />
              LIVE
            </span>
            <span className="utc-clock">{utc} UTC</span>
          </div>
        </header>

        {/* ===== LEFT PANELS ===== */}
        <div className="left-panels">
          <HUD
            position={position}
            satelliteName={satRecord?.name ?? target.name}
            missionTime={met}
            utc={utc}
          />
        </div>

        {/* ===== RIGHT PANELS ===== */}
        <div className="right-panels">
          <SatelliteSelector
            current={target}
            onChange={handleTargetChange}
            loading={loading}
          />

          <button
            className="orbital-toggle-btn"
            onClick={() => setShowOrbital(!showOrbital)}
          >
            {showOrbital ? "▾" : "▸"} ORBITAL DATA
          </button>

          {showOrbital && (
            <OrbitalInfo
              params={orbitalParams}
              satelliteName={satRecord?.name ?? target.name}
              noradId={target.noradId}
            />
          )}
        </div>

        {/* ===== ERROR TOAST ===== */}
        {error && (
          <div className="error-toast">
            <span className="error-icon">⚠</span> {error}
          </div>
        )}

        {/* ===== SCANLINE OVERLAY ===== */}
        <div className="scanline" />

        {/* ===== CORNER BRACKETS ===== */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
      </div>
    </>
  );
}
