// ── Dynamic Satellite Catalog System ──
// Fetches live satellite data from CelesTrak's free GP API

export interface SatelliteTarget {
  name: string;
  noradId: number;
  group: string;
}

export interface SatelliteCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Available CelesTrak categories
export const SATELLITE_CATEGORIES: SatelliteCategory[] = [
  { id: "stations", name: "Space Stations", icon: "◈", description: "ISS, CSS, and crewed orbital stations" },
  { id: "visual", name: "Brightest", icon: "✦", description: "Most visible satellites from Earth" },
  { id: "science", name: "Science", icon: "◇", description: "Scientific research missions" },
  { id: "weather", name: "Weather", icon: "◆", description: "Meteorological satellites" },
  { id: "noaa", name: "NOAA", icon: "◎", description: "NOAA environmental satellites" },
  { id: "military", name: "Military", icon: "⬡", description: "Military & defense satellites" },
  { id: "starlink", name: "Starlink", icon: "▣", description: "SpaceX Starlink constellation" },
  { id: "geo", name: "Geostationary", icon: "◉", description: "Geostationary orbit satellites" },
  { id: "amateur", name: "Amateur Radio", icon: "◈", description: "Amateur radio satellites" },
  { id: "education", name: "Education", icon: "▲", description: "Educational CubeSats & missions" },
  { id: "engineering", name: "Engineering", icon: "⬢", description: "Engineering test satellites" },
  { id: "geodetic", name: "Geodetic", icon: "◐", description: "Geodetic survey satellites" },
  { id: "resource", name: "Earth Resources", icon: "◑", description: "Earth observation & resources" },
  { id: "goes", name: "GOES", icon: "◒", description: "Geostationary weather satellites" },
  { id: "gps-ops", name: "GPS", icon: "◓", description: "GPS navigation constellation" },
  { id: "galileo", name: "Galileo", icon: "◔", description: "European navigation constellation" },
  { id: "iridium-NEXT", name: "Iridium", icon: "◕", description: "Iridium NEXT constellation" },
];

// ── Category Cache ──
const categoryCache = new Map<string, { data: SatelliteTarget[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Parse 3-line TLE text into SatelliteTarget array
 */
function parseTLEText(text: string, groupId: string, maxResults: number): SatelliteTarget[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const satellites: SatelliteTarget[] = [];

  for (let i = 0; i + 2 < lines.length && satellites.length < maxResults; i += 3) {
    const name = lines[i].trim();
    const line1 = lines[i + 1].trim();
    const line2 = lines[i + 2].trim();

    if (line1.startsWith("1 ") && line2.startsWith("2 ")) {
      const noradMatch = line1.match(/^1\s+(\d+)/);
      if (noradMatch) {
        satellites.push({
          name,
          noradId: parseInt(noradMatch[1]),
          group: groupId,
        });
      }
    }
  }

  return satellites;
}

/**
 * Fetch all satellites in a CelesTrak category.
 * Results are cached for 30 minutes.
 */
export async function fetchSatelliteCategory(
  categoryId: string,
  maxResults: number = 50
): Promise<SatelliteTarget[]> {
  const cached = categoryCache.get(categoryId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${encodeURIComponent(categoryId)}&FORMAT=tle`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Failed to fetch ${categoryId}`);

  const text = (await res.text()).trim();
  const satellites = parseTLEText(text, categoryId, maxResults);

  categoryCache.set(categoryId, { data: satellites, timestamp: Date.now() });
  return satellites;
}

/**
 * Search satellites by name via CelesTrak.
 */
export async function searchSatellites(query: string): Promise<SatelliteTarget[]> {
  if (!query || query.length < 2) return [];

  const url = `https://celestrak.org/NORAD/elements/gp.php?NAME=${encodeURIComponent(query)}&FORMAT=tle`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];

  const text = (await res.text()).trim();
  if (!text || text.includes("No GP data found")) return [];

  return parseTLEText(text, "search", 30);
}

/**
 * Fetch a single satellite by NORAD ID.
 */
export async function fetchSatelliteById(noradId: number): Promise<SatelliteTarget | null> {
  const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=tle`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;

  const text = (await res.text()).trim();
  const results = parseTLEText(text, "lookup", 1);
  return results[0] ?? null;
}

// Featured satellites loaded on startup
export const FEATURED_SATELLITES: SatelliteTarget[] = [
  { name: "ISS (ZARYA)", noradId: 25544, group: "stations" },
  { name: "CSS (TIANHE)", noradId: 48274, group: "stations" },
  { name: "HUBBLE", noradId: 20580, group: "science" },
];

// Fallback TLEs for offline reliability
export const FALLBACK_TLES: Record<number, [string, string, string]> = {
  25544: [
    "ISS (ZARYA)",
    "1 25544U 98067A   24100.50000000  .00016717  00000-0  10270-3 0  9025",
    "2 25544  51.6400 208.9163 0002530 120.2560 239.8735 15.49710000999990",
  ],
  20580: [
    "HUBBLE",
    "1 20580U 90037B   24100.50000000  .00000764  00000-0  37870-4 0  9997",
    "2 20580  28.4700 160.5200 0002711  50.4600 309.6500 15.09420000590000",
  ],
  48274: [
    "CSS (TIANHE)",
    "1 48274U 21035A   24100.50000000  .00012000  00000-0  13000-3 0  9990",
    "2 48274  41.4700 300.0000 0002000  30.0000 330.0000 15.60000000 50000",
  ],
};
