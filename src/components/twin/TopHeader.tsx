import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, ExternalLink, Radio, Snowflake, Trash2, X, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { useClock, type LogEntry, type LogLevel } from "@/lib/telemetry";
import { BHARATI_ROOMS, MAITRI_ROOMS, SECTION_ZONES, STATIONS } from "@/lib/twin-data";

const TICKER = [
  "Outside Temp: -28°C",
  "Wind: 42 knots SW",
  "Solar Radiation: Low",
  "Blizzard Watch: Active until 18:00 UTC",
  "Sea Ice Extent: 4.2 km",
  "Fuel Reserve: 78% (ATF-Arctic Grade)",
  "Desalination Output: 2.4 kL/day",
];

const LEVEL_STYLE: Record<LogLevel, { badge: string; icon: typeof AlertTriangle }> = {
  CRITICAL: { badge: "bg-gov-critical/15 text-gov-critical border-gov-critical/30", icon: AlertTriangle },
  WARN: { badge: "bg-gov-warning/15 text-gov-warning border-gov-warning/30", icon: AlertTriangle },
  INFO: { badge: "bg-gov-navy-primary/15 text-gov-navy-primary border-gov-navy-primary/30", icon: Info },
  SUCCESS: { badge: "bg-gov-normal/15 text-gov-normal border-gov-normal/30", icon: CheckCircle2 },
};

function findRoomId(source: string, message: string): string | null {
  const allRooms = [...BHARATI_ROOMS, ...MAITRI_ROOMS, ...SECTION_ZONES];
  const combined = `${source} ${message}`.toLowerCase();

  // 1. Exact ID match (e.g., "room-20", "conference")
  const exactId = allRooms.find((r) => r.id.toLowerCase() === source.toLowerCase().trim());
  if (exactId) return exactId.id;

  // 2. Room number match (e.g. "Room 20" -> matches "room-20" or "b-room-20")
  const roomNumMatch = combined.match(/\broom\s*(\d+)\b/i);
  if (roomNumMatch) {
    const num = roomNumMatch[1];
    const targetRoom = allRooms.find(
      (r) => r.id.toLowerCase() === `room-${num}` || r.id.toLowerCase() === `b-room-${num}` || r.name.toLowerCase().includes(`room ${num}`)
    );
    if (targetRoom) return targetRoom.id;
  }

  // 3. Name & stripped name match (e.g. "Meeting Room", "Kitchen", "Meteorology Lab")
  const match = allRooms.find((r) => {
    const rawName = r.name.toLowerCase();
    const cleanName = rawName.replace(/\s*\([^)]*\)/g, "").trim();
    return (
      combined.includes(rawName) ||
      combined.includes(cleanName) ||
      rawName.includes(source.toLowerCase()) ||
      cleanName.includes(source.toLowerCase())
    );
  });
  return match ? match.id : null;
}

export function TopHeader({
  station,
  onStation,
  alarms,
  log = [],
  onSelectZone,
}: {
  station: string;
  onStation: (id: string) => void;
  alarms: number;
  log?: LogEntry[];
  onSelectZone?: (id: string) => void;
}) {
  const now = useClock();
  const utcTime = now.toISOString().slice(11, 19);
  const ist = new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(11, 19);
  const active = STATIONS.find((s) => s.id === station)!;

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<LogLevel | "ALL">("ALL");
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const activeLogs = log.filter((l) => !dismissed.has(l.id));
  const filteredLogs = activeLogs.filter((l) => filter === "ALL" || l.level === filter);

  const handleDismiss = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed((prev) => new Set(prev).add(id));
  };

  const handleClearAll = () => {
    setDismissed(new Set(log.map((l) => l.id)));
  };

  return (
    <header className="z-30 bg-gov-navy-header text-white shadow-[0_2px_12px_rgba(0,42,84,0.35)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-gov-saffron/60 bg-white/10">
            <Snowflake className="h-5 w-5 text-gov-saffron" strokeWidth={1.6} />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-gov-saffron">
              MoES · NCPOR
            </p>
            <h1 className="truncate text-sm font-bold sm:text-base">Antarctic Digital Twin Command</h1>
          </div>
          <div className="relative ml-1 hidden shrink-0 sm:block">
            <select
              aria-label="Select research station"
              value={station}
              onChange={(e) => onStation(e.target.value)}
              className="appearance-none rounded-sm border border-white/25 bg-white/10 py-1.5 pl-3 pr-8 text-xs font-medium text-white outline-none focus:border-gov-saffron"
            >
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id} className="text-gov-text">
                  {s.name} ({s.region})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/70" />
          </div>
        </div>

        <div className="col-span-2 order-3 overflow-hidden rounded-sm border border-white/15 bg-white/5 lg:order-none lg:col-span-1">
          <div className="flex w-max gov-ticker">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {TICKER.map((t) => (
                  <span
                    key={t + k}
                    className="flex items-center gap-2 whitespace-nowrap px-5 py-1.5 font-mono text-[11px] text-white/85"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gov-saffron" />
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right leading-tight md:block">
            <p className="font-mono text-sm font-semibold tabular-nums">{utcTime} UTC</p>
            <p className="font-mono text-[10px] text-white/60">{ist} IST · {active.coords}</p>
          </div>
          <div className="hidden items-center gap-2 rounded-sm border border-gov-normal/50 bg-gov-normal/15 px-2.5 py-1.5 xl:flex">
            <Radio className="h-3.5 w-3.5 gov-pulse-slow text-[#4ade80]" />
            <span className="font-mono text-[10px] leading-tight text-white/85">
              VSAT-1 ONLINE
              <br />
              15.4 Mbps · 640 ms
            </span>
          </div>

          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={`relative grid h-9 w-9 place-items-center rounded-sm border transition-colors ${
                open ? "border-gov-saffron bg-white/20 text-gov-saffron" : "border-white/25 bg-white/10 hover:bg-white/20"
              }`}
              aria-label={`${alarms} active alerts`}
              title="Interactive Notification & Alert Center"
            >
              <Bell className="h-4 w-4" />
              {activeLogs.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border border-white bg-gov-critical px-1 text-[10px] font-bold gov-pulse-fast">
                  {activeLogs.length}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-md border border-gov-border bg-white text-gov-text shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between border-b border-gov-border bg-gov-navy-header px-3.5 py-2.5 text-white">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gov-saffron" />
                    <span className="text-xs font-bold uppercase tracking-wider">Alert Center</span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px]">
                      {activeLogs.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {activeLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="flex items-center gap-1 rounded-sm bg-white/10 px-2 py-1 text-[10px] font-medium text-white/90 hover:bg-white/20 hover:text-white"
                        title="Dismiss all notifications"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="grid h-6 w-6 place-items-center rounded-sm text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 border-b border-gov-border bg-gov-bg p-2">
                  {(["ALL", "CRITICAL", "WARN", "INFO"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`rounded-sm border px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                        filter === f
                          ? "border-gov-navy-primary bg-gov-navy-primary text-white"
                          : "border-gov-border bg-white text-gov-muted hover:text-gov-navy-primary"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gov-border">
                  {filteredLogs.length === 0 ? (
                    <div className="p-6 text-center text-gov-muted">
                      <p className="text-xs font-semibold">No active notifications</p>
                      <p className="mt-1 font-mono text-[10px]">All station systems operating normally.</p>
                    </div>
                  ) : (
                    filteredLogs.map((l) => {
                      const style = LEVEL_STYLE[l.level];
                      const Icon = style.icon;
                      const roomId = findRoomId(l.source, l.message);

                      return (
                        <div
                          key={l.id}
                          onClick={() => {
                            if (roomId && onSelectZone) {
                              onSelectZone(roomId);
                              setOpen(false);
                            }
                          }}
                          className={`group flex items-start gap-2.5 p-3 transition-colors hover:bg-gov-bg ${
                            roomId ? "cursor-pointer" : ""
                          }`}
                        >
                          <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${style.badge}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate text-xs font-bold text-gov-text">{l.source}</span>
                              <span className="shrink-0 font-mono text-[9px] text-gov-muted">{l.time}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-gov-text/80">{l.message}</p>
                            {roomId && (
                              <p className="mt-1 flex items-center gap-1 font-mono text-[10px] font-bold text-gov-navy-primary group-hover:underline">
                                Inspect Zone <ExternalLink className="h-3 w-3" />
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDismiss(l.id, e)}
                            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-sm text-gov-disabled hover:bg-gov-border hover:text-gov-text"
                            title="Dismiss notification"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

