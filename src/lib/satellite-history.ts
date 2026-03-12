// ── Satellite History Data ──

export interface HistoryEntry {
  year: number;
  title: string;
  description: string;
  category: "milestone" | "science" | "communication" | "military" | "navigation" | "observation";
}

export interface SpySatProgram {
  name: string;
  codename: string;
  country: string;
  years: string;
  description: string;
  details: string[];
  classification: "declassified" | "partially-declassified" | "active";
}

export const SATELLITE_TIMELINE: HistoryEntry[] = [
  {
    year: 1957,
    title: "Sputnik 1 — The Space Age Begins",
    description:
      "The Soviet Union launched the first artificial satellite on October 4, 1957. Sputnik 1 was a 58 cm polished metal sphere that transmitted radio pulses for 21 days, orbiting Earth every 96 minutes. It triggered the Space Race and fundamentally changed geopolitics.",
    category: "milestone",
  },
  {
    year: 1958,
    title: "Explorer 1 — America's First Satellite",
    description:
      "Launched on January 31, 1958, Explorer 1 discovered the Van Allen radiation belts surrounding Earth. Built by the Jet Propulsion Laboratory under Dr. James Van Allen, it demonstrated that space held scientific discoveries beyond imagination.",
    category: "science",
  },
  {
    year: 1959,
    title: "CORONA — First Reconnaissance Satellite",
    description:
      "The CIA's CORONA program launched the world's first photographic reconnaissance satellite, Discoverer 14, which successfully returned film from orbit in August 1960. It revolutionized intelligence gathering during the Cold War.",
    category: "military",
  },
  {
    year: 1960,
    title: "TIROS-1 — First Weather Satellite",
    description:
      "Television Infrared Observation Satellite (TIROS-1) launched on April 1, 1960, becoming the first successful weather satellite. It proved that satellites could observe Earth's weather patterns from orbit, laying the foundation for modern meteorology.",
    category: "observation",
  },
  {
    year: 1962,
    title: "Telstar 1 — First Communications Satellite",
    description:
      "Built by Bell Labs and launched on July 10, 1962, Telstar 1 relayed the first live transatlantic television signal. It demonstrated that global telecommunications via satellite was possible, ushering in the modern communications era.",
    category: "communication",
  },
  {
    year: 1963,
    title: "Syncom 2 — First Geosynchronous Satellite",
    description:
      "NASA's Syncom 2 became the first satellite in geosynchronous orbit on July 26, 1963. This altitude (35,786 km) allows a satellite to appear stationary relative to Earth's surface, enabling continuous coverage of a region.",
    category: "communication",
  },
  {
    year: 1964,
    title: "Transit — First Navigation Satellite System",
    description:
      "The Transit system (also called NAVSAT) became the first operational satellite navigation system used by the US Navy. It was the precursor to modern GPS, using Doppler shift measurements to determine position.",
    category: "navigation",
  },
  {
    year: 1966,
    title: "GRAB/POPPY — Electronic Intelligence from Space",
    description:
      "The GRAB (Galactic Radiation and Background) satellite, later renamed POPPY, was one of the first electronic intelligence (ELINT) satellites. It intercepted radar signals from the Soviet Union to map their air defense networks.",
    category: "military",
  },
  {
    year: 1972,
    title: "Landsat 1 — Earth Observation Revolution",
    description:
      "Launched on July 23, 1972, Landsat 1 (originally ERTS-1) began the longest continuous acquisition of space-based Earth observation data. The Landsat program has provided invaluable data for agriculture, geology, forestry, and climate science.",
    category: "observation",
  },
  {
    year: 1976,
    title: "KH-11 KENNEN — Real-Time Spy Satellite",
    description:
      "The KH-11 series introduced electro-optical digital imaging to reconnaissance satellites, eliminating the need to physically return film capsules from orbit. These satellites transmitted images in near real-time via relay satellites.",
    category: "military",
  },
  {
    year: 1978,
    title: "GPS Block I — Navigation Constellation Begins",
    description:
      "The first GPS satellite (Navstar 1) launched on February 22, 1978. The Global Positioning System would eventually comprise 24+ satellites providing precise three-dimensional position, velocity, and time information worldwide.",
    category: "navigation",
  },
  {
    year: 1990,
    title: "Hubble Space Telescope — Eye in the Sky",
    description:
      "Launched on April 24, 1990, the Hubble Space Telescope orbits at ~547 km altitude and has made over 1.5 million observations. It has fundamentally changed our understanding of the universe, from the age of the cosmos to the existence of dark energy.",
    category: "science",
  },
  {
    year: 1998,
    title: "ISS — International Space Station",
    description:
      "Construction of the International Space Station began with the launch of the Zarya module on November 20, 1998. The ISS has been continuously inhabited since November 2000 and represents humanity's largest and most complex engineering project in space.",
    category: "milestone",
  },
  {
    year: 1999,
    title: "Iridium Constellation — Global Communication",
    description:
      "The Iridium satellite constellation became fully operational, providing voice and data coverage to satellite phones anywhere on Earth. The 66-satellite constellation in low Earth orbit demonstrated the viability of large satellite constellations.",
    category: "communication",
  },
  {
    year: 2006,
    title: "CloudSat & CALIPSO — Climate Sentinels",
    description:
      "These twin missions launched to study clouds and aerosols with unprecedented detail. They joined NASA's 'A-Train' constellation of Earth observation satellites, providing critical data for understanding climate change.",
    category: "science",
  },
  {
    year: 2009,
    title: "Kepler Space Telescope — Planet Hunter",
    description:
      "NASA's Kepler mission launched to discover Earth-sized planets orbiting other stars. Over its operational lifetime, Kepler discovered over 2,600 confirmed exoplanets, revolutionizing our understanding of planetary systems.",
    category: "science",
  },
  {
    year: 2012,
    title: "Satellite Internet Concepts Emerge",
    description:
      "Companies began planning mega-constellations of small satellites in low Earth orbit to provide global broadband internet. This represented a paradigm shift from a few large, expensive satellites to thousands of small, mass-produced ones.",
    category: "communication",
  },
  {
    year: 2019,
    title: "Starlink — Mega-Constellation Era",
    description:
      "SpaceX began launching its Starlink internet constellation in May 2019. By 2025, over 6,000 Starlink satellites orbit Earth, making it the largest satellite constellation in history and providing broadband internet to remote areas worldwide.",
    category: "communication",
  },
  {
    year: 2021,
    title: "James Webb Space Telescope",
    description:
      "Launched on December 25, 2021, JWST is the most powerful space telescope ever built. Orbiting the L2 Lagrange point 1.5 million km from Earth, it observes the universe in infrared, revealing the earliest galaxies and probing exoplanet atmospheres.",
    category: "science",
  },
  {
    year: 2022,
    title: "China's CSS — Tiangong Station Complete",
    description:
      "China completed its three-module Tiangong space station in 2022, becoming only the third country to independently build and operate a crewed space station. The CSS represents a major milestone in China's space program.",
    category: "milestone",
  },
];

export const SPY_SATELLITE_PROGRAMS: SpySatProgram[] = [
  {
    name: "CORONA",
    codename: "KH-1 through KH-4B",
    country: "United States",
    years: "1959–1972",
    description:
      "The first operational space reconnaissance program. CORONA satellites ejected film capsules from orbit that were caught mid-air by specially equipped aircraft.",
    details: [
      "145 missions launched, 102 returned usable imagery",
      "Photographed more of the Soviet Union in one mission than all U-2 flights combined",
      "Used specially designed Itek panoramic cameras",
      "Film capsules were caught mid-air by C-119 aircraft trailing a trapeze",
      "Resolution improved from 12m (KH-1) to 1.8m (KH-4B) over the program",
      "Declassified by executive order in 1995",
    ],
    classification: "declassified",
  },
  {
    name: "GRAB / POPPY",
    codename: "ELINT Ferrets",
    country: "United States",
    years: "1960–1977",
    description:
      "Electronic intelligence (ELINT) satellites designed to intercept and map Soviet radar networks. Disguised as solar research satellites.",
    details: [
      "GRAB (Galactic Radiation and Background) was the cover name",
      "Intercepted Soviet air defense radar emissions",
      "Critical for planning Strategic Air Command bomber routes",
      "POPPY series succeeded GRAB with improved capabilities",
      "Operated by the Naval Research Laboratory",
      "Partially declassified in 1998",
    ],
    classification: "declassified",
  },
  {
    name: "GAMBIT",
    codename: "KH-7 / KH-8",
    country: "United States",
    years: "1963–1984",
    description:
      "High-resolution close-look reconnaissance satellites that complemented CORONA's wide-area coverage. Provided extremely detailed images of specific targets.",
    details: [
      "KH-7: Resolution of ~0.6 meters, operational 1963–1967",
      "KH-8 (GAMBIT-3): Resolution as fine as 0.3 meters",
      "Used for detailed intelligence on specific military installations",
      "38 KH-7 missions and 54 KH-8 missions launched",
      "Imagery returned via film capsules like CORONA",
      "Declassified in 2011",
    ],
    classification: "declassified",
  },
  {
    name: "HEXAGON",
    codename: "KH-9 'Big Bird'",
    country: "United States",
    years: "1971–1986",
    description:
      "The largest and most capable film-return reconnaissance satellite ever built. At 18 meters long and 3 meters in diameter, it carried 4 film capsules per mission.",
    details: [
      "Could photograph 40% of Earth's surface in a single mission",
      "Camera system covered a ground swath of 370 miles",
      "Resolution of approximately 0.6 meters",
      "20 missions launched from Vandenberg AFB",
      "Each satellite weighed approximately 13,600 kg",
      "Last film-return reconnaissance satellite; succeeded by digital KH-11",
    ],
    classification: "declassified",
  },
  {
    name: "KENNEN / CRYSTAL",
    codename: "KH-11 / KH-12",
    country: "United States",
    years: "1976–Present",
    description:
      "The first real-time electro-optical reconnaissance satellite. Similar in design to the Hubble Space Telescope but pointed at Earth, it transmits imagery digitally via relay satellites.",
    details: [
      "Eliminated the need for physical film return from orbit",
      "Images transmitted in near real-time via TDRS relay satellites",
      "Believed to achieve sub-10 cm resolution",
      "Mirror diameter estimated at 2.4 meters (same as Hubble)",
      "Multiple satellites maintained in orbit at all times",
      "Current generation believed to include advanced infrared capabilities",
    ],
    classification: "active",
  },
  {
    name: "Lacrosse / Onyx",
    codename: "Radar Imaging Satellite",
    country: "United States",
    years: "1988–2005+",
    description:
      "Synthetic Aperture Radar (SAR) reconnaissance satellites capable of imaging through clouds and at night, complementing optical KH-11 satellites.",
    details: [
      "Used radar instead of cameras — works in all weather and darkness",
      "Could detect objects as small as 1 meter",
      "5 satellites launched between 1988 and 2005",
      "Operated by the National Reconnaissance Office (NRO)",
      "Successor program believed to be operational",
      "Radar imaging technology later adopted for civilian Earth observation",
    ],
    classification: "partially-declassified",
  },
  {
    name: "Misty / Prowler",
    codename: "Stealth Satellite",
    country: "United States",
    years: "1990–?",
    description:
      "Allegedly a stealth reconnaissance satellite designed to be invisible to ground-based tracking. Its existence is one of the most closely guarded secrets in space surveillance.",
    details: [
      "USA-53 (1990) believed to be first Misty satellite",
      "Reportedly deployed a shroud to reduce optical signature",
      "Amateur satellite trackers lost track after initial deployment",
      "Second satellite (USA-144) may have launched in 1999",
      "Program existence neither confirmed nor denied by US government",
      "Estimated cost: several billion dollars per satellite",
    ],
    classification: "active",
  },
  {
    name: "Cosmos Series",
    codename: "Zenit / Yantar / Persona",
    country: "Soviet Union / Russia",
    years: "1962–Present",
    description:
      "The Soviet/Russian reconnaissance satellite programs, operated under the generic 'Cosmos' designation to obscure their true purpose. Thousands of Cosmos missions have been launched.",
    details: [
      "Zenit series: Early film-return reconnaissance (1962–1994)",
      "Yantar series: Advanced film-return with longer orbital life",
      "Persona series: Modern digital imaging satellites (2008–present)",
      "Hundreds of reconnaissance missions flown under Cosmos cover",
      "Early versions returned entire satellite with film; later used capsules",
      "Current Persona satellites believed comparable to older KH-11 capabilities",
    ],
    classification: "partially-declassified",
  },
  {
    name: "Ofek",
    codename: "Israeli Reconnaissance",
    country: "Israel",
    years: "1988–Present",
    description:
      "Israel's indigenous reconnaissance satellite program. Notably launched westward (retrograde orbit) to avoid overflying hostile nations during launch.",
    details: [
      "Launched from Palmachim Airbase using Shavit rockets",
      "Launched retrograde (westward) — unique among satellite programs",
      "Ofek-5 (2002) achieved sub-meter resolution",
      "Current Ofek-16 launched in 2020 with advanced electro-optical sensors",
      "Supplements Israeli intelligence capabilities in the Middle East",
      "Technology shared with Indian RISAT program",
    ],
    classification: "partially-declassified",
  },
  {
    name: "Yaogan",
    codename: "Chinese Reconnaissance",
    country: "China",
    years: "2006–Present",
    description:
      "China's reconnaissance satellite series, officially described as 'remote sensing' satellites. Includes optical, radar, and electronic intelligence variants.",
    details: [
      "Over 40 Yaogan satellites launched since 2006",
      "Includes SAR, optical, and ELINT variants",
      "Often launched in triplets for ocean surveillance",
      "Officially designated for 'scientific experiments and resource surveys'",
      "Believed to provide targeting data for anti-ship ballistic missiles",
      "Represents China's rapidly growing space surveillance capability",
    ],
    classification: "active",
  },
];
