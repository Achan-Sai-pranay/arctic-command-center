import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TopHeader } from "@/components/twin/TopHeader";
import { LeftSidebar, type ViewMode } from "@/components/twin/LeftSidebar";
import { BlueprintCanvas, type CanvasBg } from "@/components/twin/BlueprintCanvas";
import { InspectorPanel } from "@/components/twin/InspectorPanel";
import { MatrixView } from "@/components/twin/MatrixView";
import { EventLog } from "@/components/twin/EventLog";
import { useTelemetry } from "@/lib/telemetry";
import type { Subsystem } from "@/lib/twin-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Antarctic Digital Twin — MoES Station Command" },
      {
        name: "description",
        content:
          "Interactive 2D digital twin dashboard for remote management of India's Bharati and Maitri Antarctic research stations.",
      },
      { property: "og:title", content: "Antarctic Digital Twin — MoES Station Command" },
      {
        property: "og:description",
        content:
          "Live telemetry, blueprint room mapping and remote controls for Bharati & Maitri Antarctic research stations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { readings, log, pushLog, update, alarms } = useTelemetry();
  const [station, setStation] = useState("maitri");
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<ViewMode>("plan");
  const [bg, setBg] = useState<CanvasBg>("plan");
  const [level, setLevel] = useState(2);
  const [selected, setSelected] = useState<string | null>("meteorology-lab");
  const [filters, setFilters] = useState<Record<Subsystem, boolean>>({
    power: true,
    hvac: true,
    fire: true,
    crew: true,
    water: true,
  });

  const setViewMode = (v: ViewMode) => {
    setView(v);
    if (v === "plan") setBg("plan");
    if (v === "section") setBg("section");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gov-bg text-gov-text">
      <TopHeader
        station={station}
        onStation={(s) => {
          setStation(s);
          pushLog("INFO", "Station Switch", `Operator switched telemetry context to ${s.toUpperCase()} station.`);
        }}
        alarms={alarms}
      />

      <div className="flex min-h-0 flex-1">
        <div className="hidden md:flex">
          <LeftSidebar
            collapsed={collapsed}
            onCollapse={setCollapsed}
            view={view}
            onView={setViewMode}
            level={level}
            onLevel={setLevel}
            filters={filters}
            onFilter={(s) => setFilters((f) => ({ ...f, [s]: !f[s] }))}
          />
        </div>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
            {view === "matrix" ? (
              <MatrixView
                readings={readings}
                filters={filters}
                selected={selected}
                onSelect={setSelected}
              />
            ) : (
              <BlueprintCanvas
                bg={bg}
                onBg={(b) => {
                  setBg(b);
                  setView(b === "plan" ? "plan" : "section");
                }}
                readings={readings}
                selected={selected}
                onSelect={setSelected}
                filters={filters}
              />
            )}
            <InspectorPanel
              selected={selected}
              reading={selected ? readings[selected] : undefined}
              onUpdate={update}
              onLog={pushLog}
            />
          </div>
          <EventLog log={log} />
        </main>
      </div>
    </div>
  );
}
