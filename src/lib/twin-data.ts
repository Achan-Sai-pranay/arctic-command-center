export type Subsystem = "power" | "hvac" | "fire" | "crew" | "water";
export type Status = "normal" | "warning" | "critical";

export type Room = {
  id: string;
  name: string;
  grid: string;
  /** percentage rect on the blueprint image */
  x: number;
  y: number;
  w: number;
  h: number;
  subsystems: Subsystem[];
  level: 1 | 2 | 3;
  baseTemp: number;
  baseOccupancy: number;
  basePower: number;
  status: Status;
};

const residential = (
  startIndex: number,
  count: number,
  x0: number,
  width: number,
  y: number,
  h: number,
  labelOffset: number,
): Room[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `room-${startIndex + i}`,
    name: `Room ${labelOffset + i}`,
    grid: `Grid ${startIndex + i}`,
    x: x0 + i * width,
    y,
    w: width - 0.25,
    h,
    subsystems: ["crew", "hvac", "fire"] as Subsystem[],
    level: 2 as const,
    baseTemp: 20 + (i % 4) * 0.6,
    baseOccupancy: i % 3 === 0 ? 2 : 1,
    basePower: 0.8 + (i % 5) * 0.15,
  })).map((r, i) => ({ ...r, status: (i === 7 ? "warning" : "normal") as Status }));

export const FLOOR_ROOMS: Room[] = [
  {
    id: "conference",
    name: "Conference Room",
    grid: "Grid 1–3",
    x: 11.5,
    y: 16,
    w: 8.2,
    h: 14.5,
    subsystems: ["hvac", "crew", "fire"],
    level: 2,
    baseTemp: 21.4,
    baseOccupancy: 6,
    basePower: 2.4,
    status: "normal",
  },
  {
    id: "meeting",
    name: "Meeting Room",
    grid: "Grid 3–5",
    x: 20,
    y: 16,
    w: 7.4,
    h: 14.5,
    subsystems: ["hvac", "crew"],
    level: 2,
    baseTemp: 21,
    baseOccupancy: 3,
    basePower: 1.6,
    status: "normal",
  },
  ...residential(6, 3, 27.8, 5.3, 16, 14.5, 1),
  ...residential(9, 13, 43.9, 3.95, 16, 14.5, 4),
  {
    id: "dining",
    name: "Dining Hall",
    grid: "Grid 1–4",
    x: 11.5,
    y: 37.5,
    w: 12.2,
    h: 30,
    subsystems: ["hvac", "crew", "fire", "power"],
    level: 2,
    baseTemp: 22.1,
    baseOccupancy: 14,
    basePower: 5.6,
    status: "normal",
  },
  {
    id: "kitchen",
    name: "Kitchen & Pantry",
    grid: "Grid 4–7",
    x: 24,
    y: 37.5,
    w: 10.6,
    h: 30,
    subsystems: ["power", "fire", "water", "hvac"],
    level: 2,
    baseTemp: 24.8,
    baseOccupancy: 3,
    basePower: 12.4,
    status: "warning",
  },
  {
    id: "staircase",
    name: "Staircase & Support Service",
    grid: "Grid 7–9",
    x: 34.9,
    y: 37.5,
    w: 8.4,
    h: 30,
    subsystems: ["fire", "crew"],
    level: 2,
    baseTemp: 18.2,
    baseOccupancy: 0,
    basePower: 0.4,
    status: "normal",
  },
  {
    id: "laundry",
    name: "Laundry & Utility",
    grid: "Grid 5–7",
    x: 24,
    y: 52,
    w: 10.6,
    h: 15.5,
    subsystems: ["water", "power"],
    level: 2,
    baseTemp: 26.2,
    baseOccupancy: 1,
    basePower: 6.8,
    status: "normal",
  },
  {
    id: "toilets",
    name: "Toilet Block & Washrooms",
    grid: "Grid 9–13",
    x: 43.6,
    y: 52,
    w: 13.4,
    h: 15.5,
    subsystems: ["water", "hvac"],
    level: 2,
    baseTemp: 20.4,
    baseOccupancy: 2,
    basePower: 2.2,
    status: "normal",
  },
  {
    id: "electrical",
    name: "Electrical / HVAC Room",
    grid: "Grid 12–13",
    x: 55.6,
    y: 33.5,
    w: 6.4,
    h: 6.5,
    subsystems: ["power", "hvac", "fire"],
    level: 2,
    baseTemp: 31.6,
    baseOccupancy: 0,
    basePower: 28.4,
    status: "critical",
  },
  {
    id: "linen",
    name: "Linen Storage",
    grid: "Grid 15–16",
    x: 66,
    y: 34,
    w: 6,
    h: 6,
    subsystems: ["fire"],
    level: 2,
    baseTemp: 17.8,
    baseOccupancy: 0,
    basePower: 0.2,
    status: "normal",
  },
  {
    id: "multipurpose",
    name: "Multipurpose Hall",
    grid: "Grid 13–17",
    x: 60.5,
    y: 39.5,
    w: 15.2,
    h: 28,
    subsystems: ["hvac", "crew", "fire", "power"],
    level: 2,
    baseTemp: 21.8,
    baseOccupancy: 9,
    basePower: 7.4,
    status: "normal",
  },
  {
    id: "recreation",
    name: "Recreation Room",
    grid: "Grid 17–19",
    x: 76.2,
    y: 37.5,
    w: 7.4,
    h: 30,
    subsystems: ["crew", "hvac"],
    level: 2,
    baseTemp: 22.6,
    baseOccupancy: 5,
    basePower: 3.1,
    status: "normal",
  },
  {
    id: "workspace",
    name: "Common Workspace",
    grid: "Grid 19–21",
    x: 84,
    y: 37.5,
    w: 11.5,
    h: 30,
    subsystems: ["crew", "hvac", "power"],
    level: 2,
    baseTemp: 21.2,
    baseOccupancy: 8,
    basePower: 4.9,
    status: "normal",
  },
  {
    id: "lounge",
    name: "Lounge",
    grid: "Grid 1–3",
    x: 11.5,
    y: 76,
    w: 8.2,
    h: 13.5,
    subsystems: ["crew", "hvac"],
    level: 2,
    baseTemp: 22.4,
    baseOccupancy: 4,
    basePower: 2.1,
    status: "normal",
  },
  ...residential(30, 4, 20, 5.6, 76, 13.5, 18).map((r) => ({ ...r, id: `${r.id}b` })),
  ...residential(40, 13, 43.9, 3.95, 76, 13.5, 24).map((r) => ({ ...r, id: `${r.id}b` })),
];

export type SectionZone = {
  id: string;
  name: string;
  grid: string;
  x: number;
  y: number;
  w: number;
  h: number;
  level: 1 | 2 | 3;
  subsystems: Subsystem[];
  baseTemp: number;
  baseOccupancy: number;
  basePower: number;
  status: Status;
};

export const SECTION_ZONES: SectionZone[] = [
  { id: "s-dining", name: "Dining Hall", grid: "Grid 1–4 · H2–H3", x: 9, y: 37, w: 12, h: 14, level: 2, subsystems: ["hvac", "crew"], baseTemp: 22, baseOccupancy: 12, basePower: 5.2, status: "normal" },
  { id: "s-cold", name: "Cold Storage", grid: "Grid 4–7 · H2–H3", x: 21.8, y: 37, w: 8.5, h: 14, level: 2, subsystems: ["power"], baseTemp: -18.4, baseOccupancy: 0, basePower: 9.1, status: "normal" },
  { id: "s-electric", name: "Electric Equipment", grid: "Grid 7–8 · H2–H3", x: 30.4, y: 37, w: 5.2, h: 14, level: 2, subsystems: ["power", "fire"], baseTemp: 29.7, baseOccupancy: 0, basePower: 22.6, status: "warning" },
  { id: "s-aircon", name: "Air Condition Plant", grid: "Grid 5–7 · H3–H4", x: 25.4, y: 23, w: 9, h: 12, level: 3, subsystems: ["hvac"], baseTemp: 26.3, baseOccupancy: 0, basePower: 14.2, status: "normal" },
  { id: "s-stair", name: "Staircase Core", grid: "Grid 8–9", x: 35.2, y: 23, w: 4.6, h: 40, level: 2, subsystems: ["fire"], baseTemp: 17.5, baseOccupancy: 1, basePower: 0.5, status: "normal" },
  { id: "s-workshop", name: "Workshop", grid: "Grid 5–8 · H1–H2", x: 26.5, y: 52, w: 8.4, h: 12, level: 1, subsystems: ["power", "fire"], baseTemp: 15.8, baseOccupancy: 2, basePower: 6.3, status: "normal" },
  { id: "s-garage", name: "Garage", grid: "Grid 1–5 · H1–H2", x: 9.2, y: 52, w: 16.5, h: 14, level: 1, subsystems: ["fire", "power"], baseTemp: 8.2, baseOccupancy: 1, basePower: 4.4, status: "normal" },
  { id: "s-boiler", name: "Boiler Room", grid: "Grid 2–3 · Sub-level", x: 12.2, y: 69, w: 8.4, h: 11, level: 1, subsystems: ["power", "hvac", "fire"], baseTemp: 42.6, baseOccupancy: 0, basePower: 31.8, status: "critical" },
  { id: "s-storage", name: "Storage", grid: "Grid 10–12 · H1–H2", x: 43, y: 52, w: 10, h: 12, level: 1, subsystems: ["fire"], baseTemp: 12.4, baseOccupancy: 0, basePower: 0.6, status: "normal" },
  { id: "s-lab", name: "Laboratory · Biology", grid: "Grid 13–15 · H1–H2", x: 58.5, y: 52, w: 8.6, h: 12, level: 1, subsystems: ["hvac", "crew", "power"], baseTemp: 21.1, baseOccupancy: 3, basePower: 5.8, status: "normal" },
  { id: "s-toilet", name: "Toilet Block", grid: "Grid 10–12 · H2–H3", x: 43, y: 37, w: 8.4, h: 14, level: 2, subsystems: ["water"], baseTemp: 20.2, baseOccupancy: 1, basePower: 1.4, status: "normal" },
  { id: "s-bath", name: "Bathroom", grid: "Grid 12–13 · H2–H3", x: 51.8, y: 37, w: 8, h: 14, level: 2, subsystems: ["water", "hvac"], baseTemp: 23.4, baseOccupancy: 2, basePower: 3.2, status: "normal" },
  { id: "s-entertainment", name: "Entertainment Zone", grid: "Grid 14–16 · H2–H3", x: 60, y: 37, w: 12.5, h: 14, level: 2, subsystems: ["crew", "hvac"], baseTemp: 22.8, baseOccupancy: 7, basePower: 4.1, status: "normal" },
  { id: "s-lounge", name: "Lounge & Bar", grid: "Grid 18–20 · H2–H3", x: 76.6, y: 37, w: 10.8, h: 14, level: 2, subsystems: ["crew", "hvac"], baseTemp: 22.2, baseOccupancy: 6, basePower: 3.6, status: "normal" },
  { id: "s-balcony", name: "Balcony", grid: "Grid 20–21 · H2–H3", x: 87.6, y: 37, w: 6.6, h: 14, level: 2, subsystems: ["crew"], baseTemp: -24.8, baseOccupancy: 0, basePower: 0.2, status: "normal" },
  { id: "s-terrace", name: "Terrace & Observatory", grid: "H3–H4", x: 44, y: 26, w: 12, h: 8, level: 3, subsystems: ["crew", "power"], baseTemp: -26.4, baseOccupancy: 0, basePower: 1.1, status: "normal" },
];

export const SUBSYSTEM_LABELS: Record<Subsystem, string> = {
  power: "Power & CHP Generators",
  hvac: "HVAC & Heating",
  fire: "Fire & Safety",
  crew: "Crew Occupancy",
  water: "Water & Desalination",
};

export const CREW_NAMES = [
  "Dr. A. Iyer",
  "S. Rathore",
  "Lt. M. Bose",
  "P. Nambiar",
  "K. Deshmukh",
  "Dr. R. Tiwari",
  "J. Lakra",
  "V. Chauhan",
  "N. Pillai",
  "T. Gogoi",
];

export const STATIONS = [
  {
    id: "bharati",
    name: "Bharati Station",
    region: "Larsemann Hills",
    coords: "69°24′S 76°11′E",
    crew: 24,
  },
  {
    id: "maitri",
    name: "Maitri Station",
    region: "Schirmacher Oasis",
    coords: "70°46′S 11°44′E",
    crew: 18,
  },
] as const;
