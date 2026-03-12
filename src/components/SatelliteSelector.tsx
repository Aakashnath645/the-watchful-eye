"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  SATELLITE_CATEGORIES,
  FEATURED_SATELLITES,
  fetchSatelliteCategory,
  searchSatellites,
  type SatelliteTarget,
  type SatelliteCategory,
} from "@/lib/satellites";

interface SelectorProps {
  current: SatelliteTarget;
  onChange: (target: SatelliteTarget) => void;
  loading: boolean;
}

export default function SatelliteSelector({ current, onChange, loading }: SelectorProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categorySats, setCategorySats] = useState<SatelliteTarget[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SatelliteTarget[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!search || search.length < 2) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchSatellites(search);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 600);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const handleCategoryClick = useCallback(async (cat: SatelliteCategory) => {
    if (activeCategory === cat.id) {
      setActiveCategory(null);
      setCategorySats([]);
      return;
    }

    setActiveCategory(cat.id);
    setCategoryLoading(true);
    try {
      const sats = await fetchSatelliteCategory(cat.id, 40);
      setCategorySats(sats);
    } catch {
      setCategorySats([]);
    } finally {
      setCategoryLoading(false);
    }
  }, [activeCategory]);

  // Determine which list to display
  const displayList = searchResults !== null ? searchResults : (activeCategory ? categorySats : FEATURED_SATELLITES);
  const showingSearch = searchResults !== null;

  return (
    <div className={`glass-panel selector-panel ${collapsed ? "selector-collapsed" : ""}`}>
      <button className="panel-header selector-toggle" onClick={() => setCollapsed(!collapsed)}>
        <span className="panel-icon">◎</span>
        <span className="panel-title">TARGET SELECT</span>
        <span className="selector-chevron">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <>
          {/* Search */}
          <div className="selector-search">
            <input
              type="text"
              className="selector-input"
              placeholder="Search any satellite by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Category browser */}
          {!showingSearch && (
            <div className="selector-categories">
              {SATELLITE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`selector-cat-btn ${activeCategory === cat.id ? "selector-cat-active" : ""}`}
                  onClick={() => handleCategoryClick(cat)}
                  title={cat.description}
                >
                  <span className="selector-cat-icon">{cat.icon}</span>
                  <span className="selector-cat-name">{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Section label */}
          <div className="selector-section-label">
            {showingSearch
              ? `SEARCH RESULTS (${searchResults.length})`
              : activeCategory
                ? `${SATELLITE_CATEGORIES.find((c) => c.id === activeCategory)?.name.toUpperCase()} (${categorySats.length})`
                : "FEATURED"}
          </div>

          {/* Satellite list */}
          <div className="selector-list">
            {displayList.map((sat) => (
              <button
                key={sat.noradId}
                className={`selector-item ${sat.noradId === current.noradId ? "selector-active" : ""}`}
                onClick={() => onChange(sat)}
                disabled={loading && sat.noradId !== current.noradId}
              >
                <span className="selector-dot">
                  {sat.noradId === current.noradId ? "▸" : "○"}
                </span>
                <div className="selector-info">
                  <span className="selector-name">{sat.name}</span>
                  <span className="selector-meta">#{sat.noradId} · {sat.group.toUpperCase()}</span>
                </div>
              </button>
            ))}
            {displayList.length === 0 && !categoryLoading && !searchLoading && (
              <div className="selector-empty">NO MATCH</div>
            )}
          </div>

          {/* Loading indicator */}
          {(loading || categoryLoading || searchLoading) && (
            <div className="selector-loading">
              <span className="loading-spinner" />
              {searchLoading ? "SEARCHING..." : categoryLoading ? "LOADING CATEGORY..." : "ACQUIRING SIGNAL..."}
            </div>
          )}
        </>
      )}
    </div>
  );
}
