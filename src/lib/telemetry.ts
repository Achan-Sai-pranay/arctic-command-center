import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CREW_NAMES, BHARATI_ROOMS, MAITRI_ROOMS, SECTION_ZONES, type Status } from "./twin-data";
import { edgeStoreForward } from "./edge-store-forward";
import { protobufMonitor } from "./protobuf-bandwidth";

export type Reading = {
  temp: number;
  humidity: number;
  airflow: number;
  ppm: number;
  power: number;
  occupancy: number;
  status: Status;
  target: number;
  fan: boolean;
  locked: boolean;
  alarmSilenced: boolean;
  crew: string[];
  history: { t: string; temp: number; power: number }[];
};

export type LogLevel = "INFO" | "WARN" | "CRITICAL" | "SUCCESS";
export type LogEntry = {
  id: number;
  time: string;
  level: LogLevel;
  source: string;
  message: string;
  zoneId?: string;
  station?: "maitri" | "bharati";
  view?: "plan" | "section" | "transverse";
};

const ALL = [...BHARATI_ROOMS, ...MAITRI_ROOMS, ...SECTION_ZONES];

const rnd = (n: number) => (Math.random() - 0.5) * n;
const round = (n: number, d = 1) => Number(n.toFixed(d));

const utc = (d = new Date()) => d.toISOString().slice(11, 19) + " UTC";

function seedHistory(baseTemp: number, basePower: number) {
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now - (23 - i) * 3600_000);
    const wave = Math.sin((i / 24) * Math.PI * 2);
    return {
      t: `${String(hour.getUTCHours()).padStart(2, "0")}:00`,
      temp: round(baseTemp + wave * 1.4 + rnd(0.6)),
      power: round(Math.max(0, basePower * (1 + wave * 0.18) + rnd(basePower * 0.1)), 2),
    };
  });
}

function seed(): Record<string, Reading> {
  const out: Record<string, Reading> = {};
  for (const r of ALL) {
    out[r.id] = {
      temp: round(r.baseTemp),
      humidity: round(32 + Math.random() * 18),
      airflow: round(220 + Math.random() * 320),
      ppm: round(r.status === "critical" ? 1180 + Math.random() * 400 : 420 + Math.random() * 260),
      power: round(r.basePower, 2),
      occupancy: r.baseOccupancy,
      status: r.status,
      target: Math.round(r.baseTemp),
      fan: r.subsystems.includes("hvac"),
      locked: false,
      alarmSilenced: false,
      crew: CREW_NAMES.slice(0, r.baseOccupancy).slice(0, 6),
      history: seedHistory(r.baseTemp, r.basePower),
    };
  }
  return out;
}

const LOG_TEMPLATES: { level: LogLevel; message: (name: string) => string }[] = [
  { level: "INFO", message: (n) => `${n}: HVAC damper position re-balanced to setpoint.` },
  { level: "INFO", message: (n) => `${n}: Occupancy sensor heartbeat acknowledged.` },
  { level: "SUCCESS", message: () => "VSAT telemetry packet synced to NCPOR Goa Server." },
  { level: "SUCCESS", message: (n) => `${n}: Fire loop self-test passed (Zone OK).` },
  { level: "WARN", message: (n) => `${n}: Temperature drift beyond ±2°C of setpoint.` },
  { level: "WARN", message: () => "Level 1 Power House: CHP Genset 2 temperature threshold > 85°C." },
  { level: "CRITICAL", message: (n) => `${n}: Smoke particulate level exceeded 1200 PPM.` },
];

export function useTelemetry() {
  const [readings, setReadings] = useState<Record<string, Reading>>(seed);
  const [log, setLog] = useState<LogEntry[]>(() => [
    {
      id: 3,
      time: utc(),
      level: "SUCCESS",
      source: "VSAT-1",
      message: "Telemetry link established with NCPOR Goa Server.",
    },
    {
      id: 2,
      time: utc(new Date(Date.now() - 120_000)),
      level: "WARN",
      source: "Primary Power Generator CHP-1/2",
      message: "CHP Genset 2 temperature threshold > 85°C.",
      zoneId: "s-power-l1",
      station: "bharati",
      view: "section",
    },
    {
      id: 1,
      time: utc(new Date(Date.now() - 240_000)),
      level: "INFO",
      source: "Main Kitchen",
      message: "Stove power cycle completed.",
      zoneId: "kitchen",
      station: "bharati",
      view: "plan",
    },
  ]);
  const idRef = useRef(4);

  const pushLog = useCallback(
    (
      level: LogLevel,
      source: string,
      message: string,
      meta?: { zoneId?: string; station?: "maitri" | "bharati"; view?: "plan" | "section" | "transverse" }
    ) => {
      setLog((prev) =>
        [
          {
            id: idRef.current++,
            time: utc(),
            level,
            source,
            message,
            zoneId: meta?.zoneId,
            station: meta?.station,
            view: meta?.view,
          },
          ...prev,
        ].slice(0, 120)
      );
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setReadings((prev) => {
        const next: Record<string, Reading> = { ...prev };
        for (const r of ALL) {
          const cur = prev[r.id];
          if (!cur) continue;
          const drift = (cur.target - cur.temp) * 0.18 + rnd(0.5);
          const temp = round(cur.temp + drift);
          const power = round(Math.max(0.05, cur.power + rnd(r.basePower * 0.14)), 2);
          const ppm = round(Math.max(380, cur.ppm + rnd(90)));
          const delta = Math.abs(temp - cur.target);
          const status: Status =
            ppm > 1100 || delta > 6 ? "critical" : ppm > 850 || delta > 3 ? "warning" : "normal";
          next[r.id] = {
            ...cur,
            temp,
            power,
            ppm,
            humidity: round(Math.min(72, Math.max(18, cur.humidity + rnd(2.4)))),
            airflow: round(Math.max(0, cur.fan ? cur.airflow + rnd(45) : cur.airflow * 0.7)),
            occupancy: Math.max(0, cur.occupancy + (Math.random() > 0.94 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
            status,
            history: [...cur.history.slice(1), { t: "now", temp, power }],
          };

          // Record telemetry in store-and-forward engine & protobuf monitor
          const isMaitri = MAITRI_ROOMS.some((st) => st.id === r.id);
          const stationName = isMaitri ? "maitri" : "bharati";
          edgeStoreForward.addTelemetry(stationName, r.id, { temp, power, ppm, status });
          protobufMonitor.recordTransmission({
            station: stationName,
            zoneId: r.id,
            temp,
            humidity: cur.humidity,
            power,
            ppm,
            status,
            timestamp: new Date().toISOString(),
          });
        }
        return next;
      });

      if (Math.random() > 0.35) {
        const room = ALL[Math.floor(Math.random() * ALL.length)]!;
        const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]!;
        const isMaitri = MAITRI_ROOMS.some((r) => r.id === room.id);
        const isSection = SECTION_ZONES.some((r) => r.id === room.id);
        const st: "maitri" | "bharati" = isMaitri ? "maitri" : "bharati";
        const vw: "plan" | "section" = isSection ? "section" : "plan";

        pushLog(tpl.level, room.name, tpl.message(room.name), {
          zoneId: room.id,
          station: st,
          view: vw,
        });
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [pushLog]);

  const update = useCallback((id: string, patch: Partial<Reading>) => {
    setReadings((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      return { ...prev, [id]: { ...cur, ...patch } };
    });
  }, []);

  const alarms = useMemo(
    () => Object.values(readings).filter((r) => r.status === "critical" && !r.alarmSilenced).length,
    [readings],
  );

  return { readings, log, pushLog, update, alarms };
}

export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
