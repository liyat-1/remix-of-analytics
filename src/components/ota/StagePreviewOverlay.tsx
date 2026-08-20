import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Home, Mail, MessageSquare, Phone, X } from "lucide-react";
import { CAPTURE_LABEL_LONG, messageCapture, type CaptureKind } from "@/lib/guestData";
import {
  PanelTabs,
  StageScreens,
  panelsFor,
  type Panel,
} from "@/components/ota/StageMessageEditor";
import type { Stage } from "@/lib/otaJourney";

const CAPTURE_ICON: Record<CaptureKind, typeof Mail> = {
  email: Mail,
  phone: Phone,
  address: Home,
};

/** Read-only guest-eye view of a stage, layered over the journey. */
export function StagePreviewOverlay({ stage, onClose }: { stage: Stage; onClose: () => void }) {
  const [activeId, setActiveId] = useState(stage.sequence[0]!.id);
  const msg = stage.sequence.find((m) => m.id === activeId) ?? stage.sequence[0]!;
  const index = Math.max(
    0,
    stage.sequence.findIndex((m) => m.id === msg.id),
  );
  const Icon = msg.channel === "text" ? MessageSquare : Mail;
  const panels = useMemo(() => panelsFor(msg), [msg]);
  const [panel, setPanel] = useState<Panel>("email");
  const capture = useMemo(() => messageCapture(stage.id, msg.id, "30d"), [stage.id, msg.id]);
  const active = panels.some(([id]) => id === panel) ? panel : panels[0]![0];


  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/45 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-label={`${stage.name} preview`}
        className="flex h-[92vh] w-full max-w-[860px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl duration-150 animate-in fade-in zoom-in-95"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
              Guest experience
            </p>
            <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
              {stage.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </header>

        {/* Sequence stepper — prev / next with a progress rail */}
        <div className="shrink-0 border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveId(stage.sequence[Math.max(0, index - 1)]!.id)}
              disabled={index === 0}
              aria-label="Previous message"
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[13.5px] font-semibold tracking-tight text-slate-900">
                <Icon size={13} className="shrink-0 text-slate-400" />
                <span className="truncate">{msg.name}</span>
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-slate-500">{msg.timing}</p>
              <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                {capture.map((r) => {
                  const CapIcon = CAPTURE_ICON[r.key];
                  return (
                    <span
                      key={r.key}
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500"
                    >
                      <CapIcon size={11} className="text-slate-400" />
                      {CAPTURE_LABEL_LONG[r.key]}
                      <span className="font-semibold tabular-nums text-slate-900">{r.value}</span>
                    </span>
                  );
                })}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveId(stage.sequence[Math.min(stage.sequence.length - 1, index + 1)]!.id)
              }
              disabled={index === stage.sequence.length - 1}
              aria-label="Next message"
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-3 flex gap-1.5">
            {stage.sequence.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveId(m.id)}
                aria-label={`Go to ${m.name}`}
                aria-current={i === index}
                className={`h-1.5 flex-1 rounded-lg transition-colors ${
                  i === index ? "bg-slate-900" : i < index ? "bg-slate-300" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>


        <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
          <div className="flex shrink-0 justify-center border-b border-slate-200 bg-white/70 px-4 py-2.5 backdrop-blur">
            <PanelTabs panel={active} onChange={setPanel} panels={panels} />
          </div>
          <div className="grid min-h-0 flex-1 place-items-center overflow-y-auto p-6">
            <StageScreens stage={stage} msg={msg} panel={active} device="mobile" />
          </div>
        </div>
      </div>
    </div>
  );
}
