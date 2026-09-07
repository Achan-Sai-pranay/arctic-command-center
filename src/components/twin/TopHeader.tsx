import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, ExternalLink, Radio, Snowflake, Trash2, X, AlertTriangle, Info, CheckCircle2, Gauge } from "lucide-react";
import { useClock, type LogEntry, type LogLevel } from "@/lib/telemetry";
import { resolveZoneInfo, STATIONS } from "@/lib/twin-data";
import { SatelliteStatusPill } from "./SatelliteStatusPill";
import { BandwidthStatsWidget } from "./BandwidthStatsWidget";

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
  onSelectZone?: (
    id: string,
    targetStation?: "maitri" | "bharati",
    targetView?: "plan" | "section" | "transverse",
    alert?: LogEntry | null
  ) => void;
}) {
  const now = useClock();
  const utcTime = now.toISOString().slice(11, 19);
  const ist = new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(11, 19);
  const active = STATIONS.find((s) => s.id === station)!;

  const [open, setOpen] = useState(false);
  const [showBandwidthWidget, setShowBandwidthWidget] = useState(false);
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
          <SatelliteStatusPill />

          <button
            onClick={() => setShowBandwidthWidget(!showBandwidthWidget)}
            title="Open Bandwidth Savings Inspector (85% Protobuf Reduction)"
            className="flex items-center gap-1 rounded-sm border border-gov-saffron/50 bg-gov-saffron/15 px-2 py-1 text-xs font-bold text-gov-saffron hover:bg-gov-saffron/30"
          >
            <Gauge className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">85% Bandwidth</span>
          </button>

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
                      const loc = resolveZoneInfo(l.source, l.message, l.zoneId) || (l.zoneId ? { id: l.zoneId, station: l.station || "maitri", view: l.view || "plan", name: l.source } : null);

                      return (
                        <div
                          key={l.id}
                          onClick={() => {
                            if (loc && onSelectZone) {
                              onSelectZone(loc.id, loc.station, loc.view, l);
                              setOpen(false);
                            }
                          }}
                          className={`group flex items-start gap-2.5 p-3 transition-colors hover:bg-gov-bg ${
                            loc ? "cursor-pointer" : ""
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
                            {loc && (
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="rounded-[2px] bg-gov-bg px-1.5 py-0.5 font-mono text-[9px] font-medium text-gov-muted border border-gov-border">
                                  {loc.station === "maitri" ? "Maitri · 2D Plan" : loc.view === "section" ? "Bharati · Cross-Section" : "Bharati · Floor Plan"}
                                </span>
                                <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-gov-navy-primary group-hover:underline">
                                  Inspect Zone <ExternalLink className="h-3 w-3" />
                                </span>
                              </div>
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

      {showBandwidthWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md">
            <BandwidthStatsWidget onClose={() => setShowBandwidthWidget(false)} />
          </div>
        </div>
      )}
    </header>
  );
}


