"use client";

import { useState, useCallback } from "react";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS class or description
  position: "top" | "bottom" | "left" | "right" | "center";
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: "welcome",
    title: "Welcome to The Watchful Eye",
    description:
      "This is a real-time satellite tracking dashboard. It shows live positions of satellites orbiting Earth using data from CelesTrak. Let's walk through the interface.",
    target: "dashboard",
    position: "center",
  },
  {
    id: "globe",
    title: "3D Globe / 2D Map",
    description:
      "The main view shows satellite positions on a 3D globe or 2D map. The glowing cyan dot is the satellite being tracked. The blue line shows its orbital path — where it has been and where it's going.",
    target: "view-layer",
    position: "center",
  },
  {
    id: "view-toggle",
    title: "View Toggle",
    description:
      "Switch between 3D Globe view and 2D Map view. The 3D view uses a Three.js globe for an immersive perspective. The 2D view uses Leaflet maps with ground tracks and visibility footprints.",
    target: "view-toggle",
    position: "bottom",
  },
  {
    id: "telemetry",
    title: "Telemetry HUD",
    description:
      "The telemetry panel shows real-time data: LAT/LNG (position), ALT (altitude in km), and VEL (velocity in km/s). The signal bar estimates visibility, and MET shows mission elapsed time since you started tracking.",
    target: "hud-panel",
    position: "right",
  },
  {
    id: "selector",
    title: "Satellite Selector",
    description:
      "Browse satellites by category — Space Stations, Science, Weather, Military, and more. Each category dynamically loads satellites from CelesTrak's database. You can also search by name or NORAD ID.",
    target: "selector-panel",
    position: "left",
  },
  {
    id: "orbital",
    title: "Orbital Data",
    description:
      "This panel shows orbital mechanics data: inclination, eccentricity, orbital period, apogee/perigee altitudes, mean motion, and the drag coefficient (B*). The orbit type badge classifies the orbit.",
    target: "orbital-panel",
    position: "left",
  },
  {
    id: "navigation",
    title: "Navigation",
    description:
      "Use the top bar links to explore satellite history, learn about spy satellites, or revisit this guide anytime. The LIVE badge confirms real-time tracking is active.",
    target: "top-bar",
    position: "bottom",
  },
];

interface GuideProps {
  onClose: () => void;
}

export default function Guide({ onClose }: GuideProps) {
  const [step, setStep] = useState(0);
  const current = GUIDE_STEPS[step];

  const next = useCallback(() => {
    if (step < GUIDE_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  }, [step, onClose]);

  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const positionClass = `guide-pos-${current.position}`;

  return (
    <div className="guide-overlay" onClick={onClose}>
      <div className={`guide-card ${positionClass}`} onClick={(e) => e.stopPropagation()}>
        {/* Step indicator */}
        <div className="guide-step-indicator">
          {GUIDE_STEPS.map((_, i) => (
            <div
              key={i}
              className={`guide-step-dot ${i === step ? "guide-step-active" : ""} ${i < step ? "guide-step-done" : ""}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="guide-header">
          <span className="guide-step-num">
            {String(step + 1).padStart(2, "0")}/{String(GUIDE_STEPS.length).padStart(2, "0")}
          </span>
          <h3 className="guide-title">{current.title}</h3>
        </div>
        <p className="guide-description">{current.description}</p>

        {/* Navigation */}
        <div className="guide-nav">
          <button
            className="guide-btn guide-btn-secondary"
            onClick={prev}
            disabled={step === 0}
          >
            ◂ PREV
          </button>
          <button className="guide-btn guide-btn-skip" onClick={onClose}>
            SKIP
          </button>
          <button className="guide-btn guide-btn-primary" onClick={next}>
            {step === GUIDE_STEPS.length - 1 ? "FINISH ✓" : "NEXT ▸"}
          </button>
        </div>
      </div>
    </div>
  );
}
