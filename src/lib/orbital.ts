import {
  twoline2satrec,
  propagate,
  eciToGeodetic,
  gstime,
  degreesLong,
  degreesLat,
  EciVec3,
} from "satellite.js";
import { FALLBACK_TLES, type SatelliteTarget } from "./satellites";

export interface SatellitePosition {
  lat: number;
  lng: number;
  alt: number; // km
  velocity: number; // km/s
}

export interface OrbitalParams {
  inclination: number; // degrees
  eccentricity: number;
  period: number; // minutes
  apogee: number; // km
  perigee: number; // km
  meanMotion: number; // rev/day
  epoch: string; // human readable
  orbitNumber: number;
  bstar: number; // drag term
}

export interface SatRecord {
  name: string;
  noradId: number;
  satrec: ReturnType<typeof twoline2satrec>;
}

const EARTH_RADIUS = 6371; // km

/**
 * Fetch TLEs from Celestrak GP API for a given NORAD ID.
 * Falls back to hardcoded TLEs if the fetch fails.
 */
export async function fetchTLE(target: SatelliteTarget): Promise<SatRecord> {
  try {
    const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${target.noradId}&FORMAT=TLE`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = (await res.text()).trim();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length >= 3) {
      const satrec = twoline2satrec(lines[1].trim(), lines[2].trim());
      return { name: lines[0].trim(), noradId: target.noradId, satrec };
    }
    if (lines.length >= 2) {
      const satrec = twoline2satrec(lines[0].trim(), lines[1].trim());
      return { name: target.name, noradId: target.noradId, satrec };
    }
    throw new Error("Invalid TLE response");
  } catch {
    const fb = FALLBACK_TLES[target.noradId];
    if (fb) {
      const satrec = twoline2satrec(fb[1], fb[2]);
      return { name: fb[0], noradId: target.noradId, satrec };
    }
    throw new Error(`No TLE data available for ${target.name}`);
  }
}

/**
 * Propagate the satellite to a given Date and return geodetic position + velocity.
 */
export function propagatePosition(
  satrec: ReturnType<typeof twoline2satrec>,
  date: Date
): SatellitePosition | null {
  const posVel = propagate(satrec, date);

  if (
    !posVel ||
    !posVel.position ||
    !posVel.velocity ||
    typeof posVel.position === "boolean" ||
    typeof posVel.velocity === "boolean"
  ) {
    return null;
  }

  const posEci = posVel.position as EciVec3<number>;
  const velEci = posVel.velocity as EciVec3<number>;

  const gmst = gstime(date);
  const geo = eciToGeodetic(posEci, gmst);

  const velocity = Math.sqrt(
    velEci.x * velEci.x + velEci.y * velEci.y + velEci.z * velEci.z
  );

  return {
    lat: degreesLat(geo.latitude),
    lng: degreesLong(geo.longitude),
    alt: geo.height,
    velocity,
  };
}

/**
 * Extract orbital parameters from the satrec.
 */
export function getOrbitalParams(
  satrec: ReturnType<typeof twoline2satrec>
): OrbitalParams {
  const meanMotionRadMin = satrec.no; // rad/min
  const periodMin = (2 * Math.PI) / meanMotionRadMin;
  const meanMotionRevDay = (24 * 60) / periodMin;
  const inclination = satrec.inclo * (180 / Math.PI);
  const eccentricity = satrec.ecco;

  // Semi-major axis from period: T = 2π√(a³/μ)
  const mu = 398600.4418; // km³/s²
  const periodSec = periodMin * 60;
  const semiMajor = Math.pow((mu * periodSec * periodSec) / (4 * Math.PI * Math.PI), 1 / 3);
  const apogee = semiMajor * (1 + eccentricity) - EARTH_RADIUS;
  const perigee = semiMajor * (1 - eccentricity) - EARTH_RADIUS;

  // Epoch
  const epochYear = satrec.epochyr < 57 ? 2000 + satrec.epochyr : 1900 + satrec.epochyr;
  const epochDays = satrec.epochdays;
  const epochDate = new Date(Date.UTC(epochYear, 0, 1));
  epochDate.setUTCDate(epochDate.getUTCDate() + epochDays - 1);
  const epoch = epochDate.toISOString().slice(0, 16).replace("T", " ") + " UTC";

  return {
    inclination,
    eccentricity,
    period: periodMin,
    apogee,
    perigee,
    meanMotion: meanMotionRevDay,
    epoch,
    orbitNumber: (satrec as unknown as Record<string, number>).revnum ?? 0,
    bstar: satrec.bstar,
  };
}

/**
 * Compute the satellite's visibility footprint radius in km.
 */
export function getFootprintRadius(altKm: number): number {
  return EARTH_RADIUS * Math.acos(EARTH_RADIUS / (EARTH_RADIUS + altKm));
}

/**
 * Generate orbital trajectory points for one full orbit centered on the given time.
 */
export function computeOrbit(
  satrec: ReturnType<typeof twoline2satrec>,
  date: Date,
  points: number = 200
): { lat: number; lng: number; alt: number }[] {
  const meanMotion = satrec.no;
  const periodMin = (2 * Math.PI) / meanMotion;
  const halfPeriod = periodMin / 2;

  const result: { lat: number; lng: number; alt: number }[] = [];
  const baseTime = date.getTime();

  for (let i = 0; i <= points; i++) {
    const fraction = i / points - 0.5;
    const offsetMs = fraction * halfPeriod * 2 * 60 * 1000;
    const t = new Date(baseTime + offsetMs);
    const pos = propagatePosition(satrec, t);
    if (pos) {
      result.push({ lat: pos.lat, lng: pos.lng, alt: pos.alt });
    }
  }
  return result;
}

/**
 * Compute future ground track (multiple orbits) for 2D map view.
 */
export function computeMultiOrbit(
  satrec: ReturnType<typeof twoline2satrec>,
  date: Date,
  orbits: number = 3,
  pointsPerOrbit: number = 150
): { lat: number; lng: number; alt: number }[][] {
  const meanMotion = satrec.no;
  const periodMs = ((2 * Math.PI) / meanMotion) * 60 * 1000;

  const tracks: { lat: number; lng: number; alt: number }[][] = [];
  const baseTime = date.getTime();

  for (let o = 0; o < orbits; o++) {
    const track: { lat: number; lng: number; alt: number }[] = [];
    const orbitStart = baseTime + o * periodMs;

    for (let i = 0; i <= pointsPerOrbit; i++) {
      const t = new Date(orbitStart + (i / pointsPerOrbit) * periodMs);
      const pos = propagatePosition(satrec, t);
      if (pos) track.push({ lat: pos.lat, lng: pos.lng, alt: pos.alt });
    }
    if (track.length > 1) tracks.push(track);
  }
  return tracks;
}
