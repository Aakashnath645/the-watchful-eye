"use client";

import Link from "next/link";
import { SATELLITE_TIMELINE } from "@/lib/satellite-history";

const CATEGORY_COLORS: Record<string, string> = {
  milestone: "var(--cyan)",
  science: "var(--green)",
  communication: "var(--amber)",
  military: "#ff6b6b",
  navigation: "#c084fc",
  observation: "#60a5fa",
};

const CATEGORY_LABELS: Record<string, string> = {
  milestone: "MILESTONE",
  science: "SCIENCE",
  communication: "COMMS",
  military: "MILITARY",
  navigation: "NAV",
  observation: "EARTH OBS",
};

export default function HistoryPage() {
  return (
    <div className="history-page">
      {/* Header */}
      <header className="history-header">
        <Link href="/" className="history-back">◂ TRACKER</Link>
        <div className="history-header-center">
          <span className="history-icon">◈</span>
          <h1 className="history-title">SATELLITE HISTORY</h1>
          <p className="history-subtitle">A TIMELINE OF HUMANITY&apos;S EYES IN THE SKY</p>
        </div>
        <Link href="/history/spy" className="history-spy-link">
          SPY SATELLITES ▸
        </Link>
      </header>

      {/* Category legend */}
      <div className="history-legend">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} className="legend-item">
            <span className="legend-dot" style={{ background: CATEGORY_COLORS[key] }} />
            <span className="legend-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="timeline">
        <div className="timeline-line" />
        {SATELLITE_TIMELINE.map((entry, i) => (
          <div key={i} className={`timeline-entry ${i % 2 === 0 ? "timeline-left" : "timeline-right"}`}>
            <div className="timeline-node">
              <div
                className="timeline-dot"
                style={{ background: CATEGORY_COLORS[entry.category], boxShadow: `0 0 12px ${CATEGORY_COLORS[entry.category]}` }}
              />
            </div>
            <div className="glass-panel timeline-card">
              <div className="timeline-card-header">
                <span className="timeline-year">{entry.year}</span>
                <span
                  className="timeline-badge"
                  style={{ borderColor: CATEGORY_COLORS[entry.category], color: CATEGORY_COLORS[entry.category] }}
                >
                  {CATEGORY_LABELS[entry.category]}
                </span>
              </div>
              <h3 className="timeline-card-title">{entry.title}</h3>
              <p className="timeline-card-desc">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="history-footer">
        <p className="history-footer-text">
          Data sourced from public records and declassified documents. Satellite tracking powered by{" "}
          <span className="text-cyan">CelesTrak</span> and{" "}
          <span className="text-cyan">satellite.js</span>.
        </p>
      </div>

      {/* Scanline */}
      <div className="scanline" />
    </div>
  );
}
