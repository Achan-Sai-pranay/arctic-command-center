import { useState, useEffect } from "react";
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, Key, X } from "lucide-react";
import {
  cryptoTelecommand,
  OPERATOR_1,
  OPERATOR_2,
  type TelecommandRequest,
} from "@/lib/crypto-telecommand";

export function DualSignatureModal({
  onClose,
  onExecuteLog,
}: {
  onClose: () => void;
  onExecuteLog?: (msg: string) => void;
}) {
  const [req, setReq] = useState<TelecommandRequest | null>(() => cryptoTelecommand.getActiveRequest());
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    return cryptoTelecommand.subscribe(() => {
      setReq(cryptoTelecommand.getActiveRequest());
    });
  }, []);

  if (!req) return null;

  const handleSign = (opNum: 1 | 2) => {
    const res = cryptoTelecommand.signByOperator(opNum);
    setFeedback({
      type: res.success ? "success" : "info",
      text: res.message,
    });
  };

  const handleExecute = () => {
    const res = cryptoTelecommand.verifyAndExecute();
    if (res.success) {
      setFeedback({ type: "success", text: res.message });
      if (onExecuteLog) onExecuteLog(res.message);
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setFeedback({ type: "error", text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-md border border-gov-saffron/50 bg-gov-navy-header text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gov-saffron" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-gov-saffron">
              Cryptographic Telecommand Control
            </h2>
          </div>
          <button onClick={() => { cryptoTelecommand.cancelRequest(); onClose(); }} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="rounded border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              Emergency Hardware Override Requested
            </div>
            <p className="mt-1 font-mono text-sm text-white font-bold">{req.command}</p>
            <p className="mt-1 text-white/70">
              Target Station: <span className="uppercase text-gov-saffron font-semibold">{req.station}</span> | Zone: {req.zoneId}
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              2-of-2 Dual ECDSA Digital Signatures Required:
            </p>

            {/* Operator 1 */}
            <div className={`flex items-center justify-between rounded border p-3 ${
              req.signedByOperator1 ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10 bg-white/5"
            }`}>
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-white">{OPERATOR_1.name}</p>
                <p className="text-[11px] text-white/60">{OPERATOR_1.role}</p>
                <p className="font-mono text-[9px] text-white/40">{OPERATOR_1.publicKeyFingerprint}</p>
              </div>

              {req.signedByOperator1 ? (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  SIGNED
                </div>
              ) : (
                <button
                  onClick={() => handleSign(1)}
                  className="flex items-center gap-1 rounded bg-gov-saffron px-3 py-1.5 text-xs font-bold text-gov-navy-header hover:bg-amber-400"
                >
                  <Key className="h-3.5 w-3.5" />
                  Sign Key 1
                </button>
              )}
            </div>

            {/* Operator 2 */}
            <div className={`flex items-center justify-between rounded border p-3 ${
              req.signedByOperator2 ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10 bg-white/5"
            }`}>
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-white">{OPERATOR_2.name}</p>
                <p className="text-[11px] text-white/60">{OPERATOR_2.role}</p>
                <p className="font-mono text-[9px] text-white/40">{OPERATOR_2.publicKeyFingerprint}</p>
              </div>

              {req.signedByOperator2 ? (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  SIGNED
                </div>
              ) : (
                <button
                  onClick={() => handleSign(2)}
                  className="flex items-center gap-1 rounded bg-gov-saffron px-3 py-1.5 text-xs font-bold text-gov-navy-header hover:bg-amber-400"
                >
                  <Key className="h-3.5 w-3.5" />
                  Sign Key 2
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div className={`rounded p-2.5 text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : feedback.type === "error"
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
            }`}>
              {feedback.text}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 bg-white/5 px-4 py-3">
          <button
            onClick={() => { cryptoTelecommand.cancelRequest(); onClose(); }}
            className="rounded border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
          >
            Cancel Override
          </button>
          <button
            onClick={handleExecute}
            disabled={!req.signedByOperator1 || !req.signedByOperator2}
            className={`flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-bold transition-all ${
              req.signedByOperator1 && req.signedByOperator2
                ? "bg-emerald-500 text-gov-navy-header hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Verify Dual-Sig & Execute Command
          </button>
        </div>
      </div>
    </div>
  );
}
