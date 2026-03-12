"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import type { GlobeMethods } from "react-globe.gl";
import type { SatellitePosition } from "@/lib/orbital";

// react-globe.gl must be loaded client-side only (uses window)
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface GlobeViewProps {
  position: SatellitePosition | null;
  orbitPath: { lat: number; lng: number; alt: number }[];
  satelliteName: string;
  footprintRadius?: number; // km
  onSatelliteClick?: () => void;
}

const GLOBE_IMAGE = "//unpkg.com/three-globe/example/img/earth-night.jpg";
const BUMP_IMAGE = "//unpkg.com/three-globe/example/img/earth-topology.png";
const BG_IMAGE = "//unpkg.com/three-globe/example/img/night-sky.png";

// Custom glowing satellite marker using Three.js
function createSatelliteObject() {
  const group = new THREE.Group();

  // Core sphere
  const coreGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Outer glow
  const glowGeo = new THREE.SphereGeometry(2.5, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.25,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  // Ring
  const ringGeo = new THREE.RingGeometry(3, 3.5, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  group.add(ring);

  return group;
}

export default function GlobeView({ position, orbitPath, satelliteName, footprintRadius, onSatelliteClick }: GlobeViewProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [globeReady, setGlobeReady] = useState(false);
  const [selectedSat, setSelectedSat] = useState(false);
  const [autoTrack, setAutoTrack] = useState(true);
  const userInteractingRef = useRef(false);
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track window size for responsive globe
  const [dims, setDims] = useState({ w: 1200, h: 800 });
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update(); // set initial
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Satellite point data for the globe
  const satData = useMemo(() => {
    if (!position) return [];
    return [
      {
        lat: position.lat,
        lng: position.lng,
        alt: position.alt / 6371, // Normalize to earth radii, then scale
        name: satelliteName,
        altKm: position.alt,
        velocity: position.velocity,
      },
    ];
  }, [position, satelliteName]);

  // Satellite HTML label data
  const labelData = useMemo(() => {
    if (!position) return [];
    return [
      {
        lat: position.lat,
        lng: position.lng,
        alt: position.alt / 6371,
        name: satelliteName,
        altKm: position.alt,
        velocity: position.velocity,
      },
    ];
  }, [position, satelliteName]);

  // Footprint ring on globe surface
  const footprintRingData = useMemo(() => {
    if (!position || !footprintRadius || footprintRadius <= 0) return [];
    return [{ lat: position.lat, lng: position.lng, radius: footprintRadius }];
  }, [position, footprintRadius]);

  // Generate a ring of points at footprint boundary
  const ringsData = useMemo(() => {
    if (!footprintRingData.length) return [];
    const { lat, lng, radius } = footprintRingData[0];
    const angularRadius = radius / 6371; // radians
    const points: { lat: number; lng: number }[] = [];
    for (let i = 0; i <= 64; i++) {
      const bearing = (i / 64) * 2 * Math.PI;
      const latR = Math.asin(
        Math.sin(lat * Math.PI / 180) * Math.cos(angularRadius) +
        Math.cos(lat * Math.PI / 180) * Math.sin(angularRadius) * Math.cos(bearing)
      );
      const lngR = (lng * Math.PI / 180) + Math.atan2(
        Math.sin(bearing) * Math.sin(angularRadius) * Math.cos(lat * Math.PI / 180),
        Math.cos(angularRadius) - Math.sin(lat * Math.PI / 180) * Math.sin(latR)
      );
      points.push({ lat: latR * 180 / Math.PI, lng: lngR * 180 / Math.PI });
    }
    return [{ coords: points.map(p => [p.lat, p.lng] as [number, number]), isFootprint: true }];
  }, [footprintRingData]);

  // Globe paths data (orbit ground track)
  const pathData = useMemo(() => {
    if (orbitPath.length < 2) return [];
    // Build continuous path segments, breaking at antimeridian
    const paths: { coords: [number, number][] }[] = [];
    let currentSegment: [number, number][] = [];
    for (let i = 0; i < orbitPath.length; i++) {
      const p = orbitPath[i];
      if (i > 0 && Math.abs(orbitPath[i - 1].lng - p.lng) > 180) {
        if (currentSegment.length > 1) paths.push({ coords: currentSegment });
        currentSegment = [];
      }
      currentSegment.push([p.lat, p.lng]);
    }
    if (currentSegment.length > 1) paths.push({ coords: currentSegment });
    return paths;
  }, [orbitPath]);

  // Combined path data with type tag
  const allPathData = useMemo(() => {
    const orbit = pathData.map(p => ({ ...p, isFootprint: false }));
    return [...orbit, ...ringsData];
  }, [pathData, ringsData]);

  // Initialize globe AFTER it's ready (not on first mount, which is too early for dynamic import)
  useEffect(() => {
    if (!globeReady) return;
    const globe = globeRef.current;
    if (!globe) return;

    // Point of view
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

    // Configure controls — allow deep zoom
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = true;
    controls.minDistance = 110; // very close zoom
    controls.maxDistance = 800; // far zoom
    controls.zoomSpeed = 1.2;
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;

    // Scene background
    const s = globe.scene();
    const loader = new THREE.TextureLoader();
    loader.load(BG_IMAGE, (texture: THREE.Texture) => {
      s.background = texture;
    });

    // Detect user interaction to pause auto-track
    const onInteractStart = () => {
      userInteractingRef.current = true;
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
    const onInteractEnd = () => {
      // Resume auto-track eligibility after 6s of no interaction
      interactionTimerRef.current = setTimeout(() => {
        userInteractingRef.current = false;
      }, 6000);
    };
    controls.addEventListener('start', onInteractStart);
    controls.addEventListener('end', onInteractEnd);

    // ── Subtle latitude/longitude grid ──
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.04 });
    // Latitude lines every 30 degrees
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180);
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * 2 * Math.PI;
        const r = 100.15;
        points.push(new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        ));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      s.add(new THREE.Line(geom, gridMaterial));
    }
    // Longitude lines every 30 degrees
    for (let lng = 0; lng < 360; lng += 30) {
      const theta = lng * (Math.PI / 180);
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const phi = (i / 64) * Math.PI;
        const r = 100.15;
        points.push(new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        ));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      s.add(new THREE.Line(geom, gridMaterial));
    }
  }, [globeReady]);

  // Auto-track: only when enabled AND user is not interacting
  const lastTrackRef = useRef(0);
  useEffect(() => {
    if (!position || !globeReady || !autoTrack || userInteractingRef.current) return;
    const now = Date.now();
    if (now - lastTrackRef.current < 4000) return;
    lastTrackRef.current = now;

    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = false;
    globe.pointOfView({ lat: position.lat, lng: position.lng }, 2500);
  }, [position, globeReady, autoTrack]);

  const objectThreeCallback = useCallback(() => createSatelliteObject(), []);

  const handleGlobeReady = useCallback(() => setGlobeReady(true), []);

  // Satellite click handler – toggle info popup
  const handleObjectClick = useCallback(() => {
    setSelectedSat(prev => !prev);
    onSatelliteClick?.();
  }, [onSatelliteClick]);

  // Close popup when clicking elsewhere on globe
  const handleGlobeClick = useCallback(() => {
    setSelectedSat(false);
  }, []);

  // HTML label element for satellite name + optional info tooltip
  const labelElement = useCallback((d: object) => {
    const sat = d as { name: string; altKm: number; velocity: number };
    const el = document.createElement("div");
    el.className = "globe-sat-label";
    el.innerHTML = `<span class="globe-sat-name">${sat.name}</span>`;
    return el;
  }, []);

  return (
    <div className="globe-container">
      {/* Auto-track toggle */}
      <button
        className={`globe-track-btn ${autoTrack ? 'globe-track-active' : ''}`}
        onClick={() => setAutoTrack(prev => !prev)}
        title={autoTrack ? 'Disable auto-track (free roam)' : 'Enable auto-track satellite'}
      >
        <span className="globe-track-icon">{autoTrack ? '◎' : '○'}</span>
        {autoTrack ? 'TRACKING' : 'FREE ROAM'}
      </button>

      {/* Satellite info tooltip */}
      {selectedSat && position && (
        <div className="globe-sat-tooltip">
          <div className="globe-sat-tooltip-header">
            <span className="globe-sat-tooltip-icon">◉</span>
            <strong>{satelliteName}</strong>
          </div>
          <div className="globe-sat-tooltip-divider" />
          <div className="globe-sat-tooltip-row">
            <span className="globe-sat-tooltip-label">LAT</span>
            <span className="globe-sat-tooltip-value">{position.lat.toFixed(4)}°</span>
          </div>
          <div className="globe-sat-tooltip-row">
            <span className="globe-sat-tooltip-label">LNG</span>
            <span className="globe-sat-tooltip-value">{position.lng.toFixed(4)}°</span>
          </div>
          <div className="globe-sat-tooltip-row">
            <span className="globe-sat-tooltip-label">ALT</span>
            <span className="globe-sat-tooltip-value">{position.alt.toFixed(1)} km</span>
          </div>
          <div className="globe-sat-tooltip-row">
            <span className="globe-sat-tooltip-label">VEL</span>
            <span className="globe-sat-tooltip-value">{position.velocity.toFixed(2)} km/s</span>
          </div>
        </div>
      )}
      <Globe
        ref={globeRef}
        onGlobeReady={handleGlobeReady}
        onGlobeClick={handleGlobeClick}
        globeImageUrl={GLOBE_IMAGE}
        bumpImageUrl={BUMP_IMAGE}
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#00f0ff"
        atmosphereAltitude={0.18}
        // Satellite marker using custom objects
        objectsData={satData}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={(d: object) => Math.min(((d as Record<string, unknown>).alt as number) * 0.5, 0.15)}
        objectThreeObject={objectThreeCallback}
        onObjectClick={handleObjectClick}
        // Satellite name HTML labels
        htmlElementsData={labelData}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={(d: object) => Math.min(((d as Record<string, unknown>).alt as number) * 0.5, 0.15) + 0.02}
        htmlElement={labelElement}
        // Orbit path on globe surface
        pathsData={allPathData}
        pathPoints="coords"
        pathPointLat={(p: number[]) => p[0]}
        pathPointLng={(p: number[]) => p[1]}
        pathColor={(d: object) =>
          (d as Record<string, unknown>).isFootprint
            ? "rgba(0, 240, 255, 0.12)"
            : "rgba(0, 240, 255, 0.25)"
        }
        pathStroke={(d: object) => ((d as Record<string, unknown>).isFootprint ? 0.8 : 1.5)}
        pathDashLength={0.01}
        pathDashGap={0.004}
        pathDashAnimateTime={100000}
        // Performance
        animateIn={true}
        width={dims.w}
        height={dims.h}
      />
    </div>
  );
}
