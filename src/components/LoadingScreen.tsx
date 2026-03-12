"use client";

import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
  minimumDuration?: number;
}

export default function LoadingScreen({ onComplete, minimumDuration = 1400 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  const phases = [
    "INITIALIZING ORBITAL SYSTEMS",
    "ACQUIRING SATELLITE TELEMETRY",
    "ESTABLISHING GROUND LINKS",
    "CALIBRATING TRACKING ARRAY",
    "SYSTEMS ONLINE",
  ];

  useEffect(() => {
    const start = Date.now();
    let frame: number;

    const animate = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / minimumDuration) * 100, 100);
      setProgress(pct);
      setPhase(Math.min(Math.floor(pct / 22), phases.length - 1));

      if (pct < 100) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 500);
        }, 400);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [minimumDuration, onComplete, phases.length]);

  if (!visible) {
    return (
      <div className="loading-screen loading-fadeout">
        <div className="loading-content">
          <div className="loading-eye">◉</div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Orbit animation */}
        <div className="loading-orbit-ring">
          <div className="loading-orbit-dot" />
        </div>

        {/* Logo */}
        <div className="loading-eye">◉</div>
        <h1 className="loading-title">THE WATCHFUL EYE</h1>
        <p className="loading-subtitle">SATELLITE TRACKING SYSTEM</p>

        {/* Progress bar */}
        <div className="loading-bar-container">
          <div className="loading-bar-track">
            <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-bar-info">
            <span className="loading-phase">{phases[phase]}</span>
            <span className="loading-pct">{Math.floor(progress)}%</span>
          </div>
        </div>

        {/* System status lines */}
        <div className="loading-log">
          {progress > 10 && <div className="loading-log-line">▸ Orbital propagation engine ... OK</div>}
          {progress > 30 && <div className="loading-log-line">▸ CelesTrak data link ......... OK</div>}
          {progress > 50 && <div className="loading-log-line">▸ 3D Globe renderer ........... OK</div>}
          {progress > 70 && <div className="loading-log-line">▸ Telemetry HUD ............... OK</div>}
          {progress > 90 && <div className="loading-log-line loading-log-accent">▸ ALL SYSTEMS NOMINAL</div>}
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
