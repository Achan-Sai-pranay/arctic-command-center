import { useState, useEffect } from "react";
import { Gauge, Cpu, Zap, X } from "lucide-react";
import { protobufMonitor } from "@/lib/protobuf-bandwidth";

export function BandwidthStatsWidget({ onClose }: { onClose?: () => void }) {
  const [stats, setStats] = useState(() => protobufMonitor.getStats());

  useEffect(() => {
    return protobufMonitor.subscribe(() => {
      setStats(protobufMonitor.getStats());
    });
  }, []);

  return (
    <div className="relative rounded-md border border-gov-saffron/40 bg-gov-navy-header/95 p-4 text-white shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-gov-saffron" />
          <h3 className="text-sm font-bold tracking-wide">
            Satellite Bandwidth Optimization Inspector
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded border border-white/10 bg-white/5 p-3">
          <p className="text-[11px] font-medium text-white/60">Standard JSON Telemetry Payload</p>
          <p className="mt-1 text-lg font-bold text-red-400">{stats.jsonBytes} bytes</p>
          <p className="text-[10px] text-white/40">Text format (uncompressed tags)</p>
        </div>

        <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-3">
          <p className="text-[11px] font-medium text-emerald-300">Protobuf Binary Payload (MQTT)</p>
          <p className="mt-1 text-lg font-bold text-emerald-400">{stats.protobufBytes} bytes</p>
          <p className="text-[10px] text-emerald-200/60">Varint + Binary Packed Schema</p>
        </div>
      </div>

      <div className="mt-3 rounded border border-gov-saffron/30 bg-gov-saffron/10 p-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1 text-gov-saffron">
            <Zap className="h-3.5 w-3.5" />
            Bandwidth Reduction Efficiency
          </span>
          <span className="text-sm font-extrabold text-emerald-400">
            {stats.reductionPercentage}% SAVED
          </span>
        </div>
        
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-gov-saffron transition-all duration-500"
            style={{ width: `${stats.reductionPercentage}%` }}
          />
        </div>
        
        <p className="mt-1.5 text-[11px] text-white/70">
          Streams high-frequency telemetry across constrained <strong>128 kbps</strong> satellite link with zero performance lag.
        </p>
      </div>
    </div>
  );
}
