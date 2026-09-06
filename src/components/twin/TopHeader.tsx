import { Bell, ChevronDown, Radio, Snowflake } from "lucide-react";
import { useClock } from "@/lib/telemetry";
import { STATIONS } from "@/lib/twin-data";

const TICKER = [
  "Outside Temp: -28°C",
  "Wind: 42 knots SW",
  "Solar Radiation: Low",
  "Blizzard Watch: Active until 18:00 UTC",
  "Sea Ice Extent: 4.2 km",
  "Fuel Reserve: 78% (ATF-Arctic Grade)",
  "Desalination Output: 2.4 kL/day",
];

export function TopHeader({
  station,
  onStation,
  alarms,
}: {
  station: string;
  onStation: (id: string) => void;
  alarms: number;
}) {
  const now = useClock();
  const utcTime = now.toISOString().slice(11, 19);
  const ist = new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(11, 19);
  const active = STATIONS.find((s) => s.id === station)!;

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
          <button
            type="button"
            className="relative grid h-9 w-9 place-items-center rounded-sm border border-white/25 bg-white/10 transition-colors hover:bg-white/20"
            aria-label={`${alarms} active alerts`}
          >
            <Bell className="h-4 w-4" />
            {alarms > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border border-white bg-gov-critical px-1 text-[10px] font-bold gov-pulse-fast">
                {alarms}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
