import { useEffect, useState } from "react";
import { Radio, ShieldAlert, Zap, RefreshCw } from "lucide-react";
import { edgeStoreForward } from "@/lib/edge-store-forward";

export function SatelliteStatusPill() {
  const [stats, setStats] = useState(() => edgeStoreForward.getStats());

  useEffect(() => {
    return edgeStoreForward.subscribe(() => {
      setStats(edgeStoreForward.getStats());
    });
  }, []);

  const isOffline = stats.status === "SOLAR_STORM_OFFLINE";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => edgeStoreForward.toggleStatus()}
        title="Toggle Satellite Link (Simulate Polar Solar Storm Outage)"
        className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-semibold tracking-wide transition-all shadow-sm ${
          isOffline
            ? "border-gov-critical/60 bg-gov-critical/20 text-gov-critical animate-pulse"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
        }`}
      >
        {isOffline ? (
          <>
            <ShieldAlert className="h-3.5 w-3.5 text-gov-critical" />
            <span>SOLAR STORM (OFFLINE)</span>
          </>
        ) : (
          <>
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span>SAT-LINK: ONLINE</span>
          </>
        )}
      </button>

      {isOffline && (
        <div className="flex items-center gap-1 rounded-sm border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-300">
          <Zap className="h-3 w-3 text-amber-400" />
          <span>Edge Buffer: {stats.buffered} queued</span>
        </div>
      )}

      {stats.buffered > 0 && !isOffline && (
        <button
          onClick={() => edgeStoreForward.flushBuffer()}
          className="flex items-center gap-1 rounded-sm border border-gov-saffron/50 bg-gov-saffron/20 px-2 py-1 text-[11px] font-medium text-gov-saffron hover:bg-gov-saffron/30"
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Syncing {stats.buffered} pkts</span>
        </button>
      )}
    </div>
  );
}
