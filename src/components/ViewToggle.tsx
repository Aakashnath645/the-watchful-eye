"use client";

export type ViewMode = "3d" | "2d";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn ${mode === "3d" ? "view-toggle-active" : ""}`}
        onClick={() => onChange("3d")}
        title="3D Globe View"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <ellipse cx="8" cy="8" rx="3" ry="6.5" stroke="currentColor" strokeWidth="0.8" />
          <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" strokeWidth="0.8" />
        </svg>
        <span>3D</span>
      </button>
      <button
        className={`view-toggle-btn ${mode === "2d" ? "view-toggle-active" : ""}`}
        onClick={() => onChange("2d")}
        title="2D Map View"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" strokeWidth="0.8" />
          <line x1="8" y1="2.5" x2="8" y2="13.5" stroke="currentColor" strokeWidth="0.8" />
        </svg>
        <span>2D</span>
      </button>
    </div>
  );
}
