import { useState } from "react";
import { ChevronDown, ChevronUp, Terminal, ExternalLink } from "lucide-react";
import type { LogEntry, LogLevel } from "@/lib/telemetry";
import { resolveZoneInfo } from "@/lib/twin-data";

const LEVEL_STYLE: Record<LogLevel, string> = {
  INFO: "text-gov-navy-primary border-gov-navy-primary/40 bg-gov-navy-primary/5",
  WARN: "text-gov-warning border-gov-warning/40 bg-gov-warning/10",
  CRITICAL: "text-gov-critical border-gov-critical/40 bg-gov-critical/10",
  SUCCESS: "text-gov-normal border-gov-normal/40 bg-gov-normal/10",
};

const FILTERS: (LogLevel | "ALL")[] = ["ALL", "INFO", "WARN", "CRITICAL", "SUCCESS"];

export function EventLog({
  log,
  onSelectZone,
}: {
  log: LogEntry[];
  onSelectZone?: (
    id: string,
    targetStation?: "maitri" | "bharati",
    targetView?: "plan" | "section" | "transverse",
    alert?: LogEntry | null
  ) => void;
}) {
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState<LogLevel | "ALL">("ALL");
  const [height, setHeight] = useState(176);

  const rows = log.filter((l) => filter === "ALL" || l.level === filter);

  return (
    <section className="shrink-0 border-t border-gov-border bg-gov-card">
      <div
        onPointerDown={(e) => {
          const startY = e.clientY;
          const startH = height;
          const move = (ev: PointerEvent) =>
            setHeight(Math.min(420, Math.max(96, startH - (ev.clientY - startY))));
          const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        }}
        className="h-1.5 w-full cursor-ns-resize bg-gov-bg transition-colors hover:bg-gov-navy-primary/30"
        role="separator"
        aria-label="Resize event log"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal className="h-3.5 w-3.5 shrink-0 text-gov-muted" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gov-text">
            Event Log & Alarm Console
          </span>
          <span className="rounded-sm bg-gov-bg px-1.5 py-0.5 font-mono text-[10px] text-gov-muted">
            {rows.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                filter === f
                  ? "border-gov-navy-primary bg-gov-navy-primary text-white"
                  : "border-gov-border text-gov-muted hover:text-gov-navy-primary"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse log" : "Expand log"}
            className="ml-1 grid h-6 w-6 place-items-center rounded-sm text-gov-muted hover:bg-gov-bg"
          >
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="overflow-y-auto border-t border-gov-border" style={{ height }}>
          <ul className="divide-y divide-gov-border">
            {rows.map((l) => {
              const loc = resolveZoneInfo(l.source, l.message, l.zoneId) || (l.zoneId ? { id: l.zoneId, station: l.station || "maitri", view: l.view || "plan", name: l.source } : null);
              return (
                <li
                  key={l.id}
                  onClick={() => {
                    if (loc && onSelectZone) {
                      onSelectZone(loc.id, loc.station, loc.view, l);
                    }
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-1.5 transition-colors hover:bg-gov-bg ${
                    loc ? "cursor-pointer group" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 font-mono text-[10px] text-gov-muted">[{l.time}]</span>
                    <span
                      className={`shrink-0 rounded-[2px] border px-1.5 font-mono text-[9px] font-bold ${LEVEL_STYLE[l.level]}`}
                    >
                      {l.level}
                    </span>
                    <span className="min-w-0 truncate font-mono text-[11px] text-gov-text">{l.message}</span>
                  </div>
                  {loc && (
                    <span className="hidden shrink-0 items-center gap-1 font-mono text-[9px] font-bold text-gov-navy-primary opacity-0 group-hover:opacity-100 sm:flex">
                      {loc.station === "maitri" ? "Maitri Plan" : loc.view === "section" ? "Bharati Section" : "Bharati Plan"} <ExternalLink className="h-2.5 w-2.5" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
