"use client";

import Link from "next/link";
import { useState } from "react";
import { SPY_SATELLITE_PROGRAMS } from "@/lib/satellite-history";

const CLASS_COLORS: Record<string, string> = {
  declassified: "var(--green)",
  "partially-declassified": "var(--amber)",
  active: "#ff6b6b",
};

const CLASS_LABELS: Record<string, string> = {
  declassified: "DECLASSIFIED",
  "partially-declassified": "PARTIAL DECLASS",
  active: "ACTIVE / CLASSIFIED",
};

export default function SpySatellitesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="history-page">
      {/* Header */}
      <header className="history-header">
        <Link href="/history" className="history-back">◂ HISTORY</Link>
        <div className="history-header-center">
          <span className="history-icon" style={{ color: "#ff6b6b", textShadow: "0 0 15px rgba(255,60,60,0.5)" }}>⬡</span>
          <h1 className="history-title">SPY SATELLITES</h1>
          <p className="history-subtitle">RECONNAISSANCE &amp; INTELLIGENCE FROM ORBIT</p>
        </div>
        <Link href="/" className="history-spy-link">
          TRACKER ▸
        </Link>
      </header>

      {/* Intro */}
      <div className="spy-intro glass-panel">
        <p className="spy-intro-text">
          Since the dawn of the Space Age, nations have placed eyes in the sky to watch over
          adversaries and allies alike. From the film-return capsules of CORONA to the real-time
          digital imaging of modern KH-11 satellites, reconnaissance from orbit has shaped
          geopolitics, verified arms treaties, and prevented conflicts through transparency.
        </p>
        <div className="spy-intro-stats">
          <div className="spy-stat">
            <span className="spy-stat-value">{SPY_SATELLITE_PROGRAMS.length}</span>
            <span className="spy-stat-label">PROGRAMS</span>
          </div>
          <div className="spy-stat">
            <span className="spy-stat-value">5</span>
            <span className="spy-stat-label">NATIONS</span>
          </div>
          <div className="spy-stat">
            <span className="spy-stat-value">1959</span>
            <span className="spy-stat-label">FIRST MISSION</span>
          </div>
        </div>
      </div>

      {/* Classification legend */}
      <div className="history-legend">
        {Object.entries(CLASS_LABELS).map(([key, label]) => (
          <div key={key} className="legend-item">
            <span className="legend-dot" style={{ background: CLASS_COLORS[key] }} />
            <span className="legend-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Program cards */}
      <div className="spy-programs">
        {SPY_SATELLITE_PROGRAMS.map((program) => (
          <div
            key={program.name}
            className={`glass-panel spy-card ${expanded === program.name ? "spy-card-expanded" : ""}`}
          >
            <button
              className="spy-card-header"
              onClick={() => setExpanded(expanded === program.name ? null : program.name)}
            >
              <div className="spy-card-top">
                <div className="spy-card-title-row">
                  <h3 className="spy-card-name">{program.name}</h3>
                  <span
                    className="spy-card-class"
                    style={{
                      borderColor: CLASS_COLORS[program.classification],
                      color: CLASS_COLORS[program.classification],
                    }}
                  >
                    {CLASS_LABELS[program.classification]}
                  </span>
                </div>
                <div className="spy-card-meta">
                  <span className="spy-card-codename">{program.codename}</span>
                  <span className="spy-card-divider">·</span>
                  <span className="spy-card-country">{program.country}</span>
                  <span className="spy-card-divider">·</span>
                  <span className="spy-card-years">{program.years}</span>
                </div>
              </div>
              <span className="spy-card-chevron">
                {expanded === program.name ? "▾" : "▸"}
              </span>
            </button>

            <p className="spy-card-desc">{program.description}</p>

            {expanded === program.name && (
              <div className="spy-card-details">
                <div className="panel-divider" />
                <ul className="spy-detail-list">
                  {program.details.map((detail, i) => (
                    <li key={i} className="spy-detail-item">
                      <span className="spy-detail-bullet">▹</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="history-footer">
        <p className="history-footer-text">
          Information sourced from declassified government documents, the National Reconnaissance
          Office (NRO), and publicly available intelligence research.
          <br />
          <span style={{ color: "var(--text-dim)" }}>
            Active programs shown are based on publicly available information only.
          </span>
        </p>
      </div>

      {/* Scanline */}
      <div className="scanline" />
    </div>
  );
}
