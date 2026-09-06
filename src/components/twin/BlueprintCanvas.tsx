import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Maximize2, Minus, Plus } from "lucide-react";
import floorplanAsset from "@/assets/floorplan-level2.png.asset.json";
import sectionAsset from "@/assets/section-longitudinal.png.asset.json";
import transverseAsset from "@/assets/section-transverse.png.asset.json";
import type { Reading } from "@/lib/telemetry";
import { BHARATI_ROOMS, MAITRI_ROOMS, SECTION_ZONES, type Room, type Status, type Subsystem } from "@/lib/twin-data";

const STATUS_FILL: Record<Status, string> = {
  normal: "var(--gov-fill-normal)",
  warning: "var(--gov-fill-warning)",
  critical: "var(--gov-fill-critical)",
};
const STATUS_STROKE: Record<Status, string> = {
  normal: "var(--gov-status-normal)",
  warning: "var(--gov-status-warning)",
  critical: "var(--gov-status-critical)",
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 6;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export type CanvasBg = "plan" | "section" | "transverse";

export function BlueprintCanvas({
  station = "maitri",
  bg,
  onBg,
  readings,
  selected,
  onSelect,
  filters,
}: {
  station?: string;
  bg: CanvasBg;
  onBg: (b: CanvasBg) => void;
  readings: Record<string, Reading>;
  selected: string | null;
  onSelect: (id: string) => void;
  filters: Record<Subsystem, boolean>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const zones: Room[] =
    station === "maitri"
      ? MAITRI_ROOMS
      : bg === "plan"
      ? BHARATI_ROOMS
      : (SECTION_ZONES.map((z) => ({ ...z })) as unknown as Room[]);
  const visible = zones.filter((z) => z.subsystems.some((s) => filters[s]));
  const img =
    station === "maitri"
      ? "/assets/maitri-blueprint.png"
      : bg === "plan"
      ? floorplanAsset.url
      : bg === "section"
      ? sectionAsset.url
      : transverseAsset.url;
  const ratio =
    station === "maitri"
      ? 1024 / 571
      : bg === "plan"
      ? 1545 / 1018
      : bg === "section"
      ? 1600 / 617
      : 1600 / 813;

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    const { zoom: z, offset: o } = stateRef.current;
    const next = clamp(z * Math.exp(-dy * 0.0018), MIN_ZOOM, MAX_ZOOM);
    const k = next / z;
    setZoom(next);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = useCallback((factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = rect.width / 2;
    const py = rect.height / 2;
    const { zoom: z, offset: o } = stateRef.current;
    const next = clamp(z * factor, MIN_ZOOM, MAX_ZOOM);
    const k = next / z;
    setZoom(next);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    reset();
  }, [bg]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-gov-bg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border bg-gov-card px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-sm bg-gov-navy-header px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
            {station === "maitri"
              ? "Maitri Station · 2D Blueprint Model"
              : bg === "plan"
              ? "Bharati Station · Level 2 Plan"
              : bg === "section"
              ? "Bharati Station · Section D–D′"
              : "Bharati Station · Section A–A′"}
          </span>
          <span className="truncate text-[11px] text-gov-muted">
            {visible.length} zones instrumented · live 3s polling
          </span>
        </div>
        {station === "bharati" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                ["plan", "Floor Plan"],
                ["section", "Longitudinal"],
                ["transverse", "Transverse"],
              ] as [CanvasBg, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onBg(id)}
                className={`rounded-sm border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  bg === id
                    ? "border-gov-navy-primary bg-gov-navy-primary text-white"
                    : "border-gov-border bg-white text-gov-muted hover:border-gov-navy-primary hover:text-gov-navy-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(var(--gov-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--gov-grid-line) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          cursor: drag.current ? "grabbing" : "grab",
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setOffset({
            x: drag.current.ox + (e.clientX - drag.current.x),
            y: drag.current.oy + (e.clientY - drag.current.y),
          });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => {
          drag.current = null;
          setHover(null);
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: drag.current ? "none" : "transform 120ms ease-out",
          }}
        >
          <div
            className="relative overflow-hidden rounded-sm border border-gov-border bg-white shadow-[0_10px_40px_-24px_rgba(0,42,84,0.6)]"
            style={{ aspectRatio: String(ratio), height: "100%", width: "auto", maxWidth: "100%" }}
          >
            <img
              src={img}
              alt={bg === "plan" ? "Level 2 floor plan blueprint" : "Building cross-section blueprint"}
              className="absolute inset-0 h-full w-full object-fill"
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-[var(--gov-blueprint-mask)]" />

            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {visible.map((z) => {
                const r = readings[z.id];
                const status = r?.status ?? z.status;
                const isSel = selected === z.id;
                return (
                  <rect
                    key={z.id}
                    x={z.x}
                    y={z.y}
                    width={z.w}
                    height={z.h}
                    rx={0.4}
                    className={`cursor-pointer transition-[fill] duration-500 ${
                      status === "critical" ? "gov-pulse-fast" : status === "warning" ? "gov-pulse-slow" : ""
                    }`}
                    fill={isSel ? "var(--gov-fill-active)" : STATUS_FILL[status]}
                    stroke={isSel ? "var(--gov-status-active)" : STATUS_STROKE[status]}
                    strokeWidth={isSel ? 0.45 : 0.2}
                    vectorEffect="non-scaling-stroke"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(z.id);
                    }}
                    onPointerMove={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setHover({ id: z.id, x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                    onPointerLeave={() => setHover(null)}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {(() => {
          const hoverZone = hover ? zones.find((z) => z.id === hover.id) : null;
          const hoverReading = hover
            ? readings[hover.id] ||
              (hoverZone
                ? {
                    temp: hoverZone.baseTemp,
                    humidity: 45,
                    occupancy: hoverZone.baseOccupancy,
                    power: hoverZone.basePower,
                    status: hoverZone.status,
                  }
                : null)
            : null;
          if (!hover || !hoverZone || !hoverReading) return null;

          const containerW = containerRef.current?.clientWidth ?? 800;
          const containerH = containerRef.current?.clientHeight ?? 600;
          const tooltipW = 230;
          const tooltipH = 140;

          // Flip tooltip to the left if hovering near the right side of the canvas
          const showOnLeft = hover.x + tooltipW + 20 > containerW;
          const leftPos = showOnLeft
            ? Math.max(8, hover.x - tooltipW - 14)
            : Math.min(containerW - tooltipW - 8, hover.x + 14);

          const topPos = clamp(hover.y - 60, 8, containerH - tooltipH - 8);

          return (
            <div
              className="pointer-events-none absolute z-20 w-56 rounded-sm border border-gov-border bg-white/97 p-2.5 shadow-lg backdrop-blur transition-all duration-75"
              style={{
                left: leftPos,
                top: topPos,
              }}
            >
              <p className="truncate text-xs font-bold text-gov-text">{hoverZone.name}</p>
              <p className="mb-1.5 font-mono text-[10px] text-gov-muted">{hoverZone.grid}</p>
              <dl className="space-y-0.5 font-mono text-[10px] text-gov-muted">
                <Row label="TEMP" value={`${hoverReading.temp.toFixed(1)} °C`} />
                <Row label="HUMIDITY" value={`${hoverReading.humidity.toFixed(0)} %`} />
                <Row label="OCCUPANCY" value={`${hoverReading.occupancy} crew`} />
                <Row label="POWER" value={`${hoverReading.power.toFixed(1)} kW`} />
                <Row label="STATUS" value={hoverReading.status.toUpperCase()} />
              </dl>
            </div>
          );
        })()}

        <div className="absolute bottom-3 right-3 flex flex-col gap-1 rounded-sm border border-gov-border bg-white p-1 shadow-md">
          <CtrlBtn onClick={() => zoomBy(1.25)} label="Zoom in">
            <Plus className="h-4 w-4" />
          </CtrlBtn>
          <CtrlBtn onClick={() => zoomBy(0.8)} label="Zoom out">
            <Minus className="h-4 w-4" />
          </CtrlBtn>
          <CtrlBtn onClick={reset} label="Reset pan and zoom">
            <Maximize2 className="h-4 w-4" />
          </CtrlBtn>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-sm border border-gov-border bg-white/95 px-2.5 py-1.5 font-mono text-[10px] text-gov-muted shadow-sm">
          <span className="flex items-center gap-1.5">
            <Crosshair className="h-3 w-3" /> {(zoom * 100).toFixed(0)}%
          </span>
          {(["normal", "warning", "critical"] as Status[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: STATUS_STROKE[s] }} />
              {s.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="font-semibold text-gov-text">{value}</dd>
    </div>
  );
}

function CtrlBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-sm text-gov-muted transition-colors hover:bg-gov-bg hover:text-gov-navy-primary active:scale-95"
    >
      {children}
    </button>
  );
}
