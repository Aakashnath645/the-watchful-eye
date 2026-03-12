"use client";

import { useState, useEffect, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

const DURATION = 900;
const FADE_MS = 400;
const SAFETY_TIMEOUT = 6000;

const PHASES = [
  "INITIALIZING ORBITAL SYSTEMS",
  "ACQUIRING SATELLITE TELEMETRY",
  "ESTABLISHING GROUND LINKS",
  "CALIBRATING TRACKING ARRAY",
  "SYSTEMS ONLINE",
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [fading, setFading] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setFading(true);
      setTimeout(onComplete, FADE_MS);
    };

    // Safety: force-complete if animation gets stuck
    const safety = setTimeout(finish, SAFETY_TIMEOUT);

    const start = Date.now();
    let frame: number;

    const animate = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      setPhase(Math.min(Math.floor(pct / 22), PHASES.length - 1));

      if (pct < 100) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(finish, 200);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(safety);
    };
  }, [onComplete]);

  return (
    <div className={`loading-screen${fading ? " loading-fadeout" : ""}`}>
      <div className="loading-content">
        {/* Orbit animation */}
        <div className="loading-orbit-ring">
          <div className="loading-orbit-dot" />
        </div>

        {/* Logo */}
        <div className="loading-eye">&#9673;</div>
        <h1 className="loading-title">THE WATCHFUL EYE</h1>
        <p className="loading-subtitle">SATELLITE TRACKING SYSTEM</p>

        {/* Progress bar */}
        <div className="loading-bar-container">
          <div className="loading-bar-track">
            <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-bar-info">
            <span className="loading-phase">{PHASES[phase]}</span>
            <span className="loading-pct">{Math.floor(progress)}%</span>
          </div>
        </div>

        {/* System status lines */}
        <div className="loading-log">
          {progress > 10 && <div className="loading-log-line">&#9656; Orbital propagation engine ... OK</div>}
          {progress > 30 && <div className="loading-log-line">&#9656; CelesTrak data link ......... OK</div>}
          {progress > 50 && <div className="loading-log-line">&#9656; 3D Globe renderer ........... OK</div>}
          {progress > 70 && <div className="loading-log-line">&#9656; Telemetry HUD ............... OK</div>}
          {progress > 90 && <div className="loading-log-line loading-log-accent">&#9656; ALL SYSTEMS NOMINAL</div>}
        </div>
      </div>

      {/* Corner brackets */}
      <div className="loading-corner loading-corner-tl" />
      <div className="loading-corner loading-corner-tr" />
      <div className="loading-corner loading-corner-bl" />
      <div className="loading-corner loading-corner-br" />
    </div>
  );
}
