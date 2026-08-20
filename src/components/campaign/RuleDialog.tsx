import { useState } from "react";
import { X } from "lucide-react";
import { RULE_ACTIONS, RULE_TRIGGERS, makeRule, type Rule } from "@/lib/sequence";

/** Conversational rule builder — no automation jargon. */
export function RuleDialog({ onCancel, onAdd }: { onCancel: () => void; onAdd: (r: Rule) => void }) {
  const [rule, setRule] = useState<Rule>(() => makeRule());
  const [stage, setStage] = useState<"trigger" | "action">("trigger");

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-zinc-900/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-label="Add rule"
        className="w-full max-w-md rounded-2xl border border-zinc-300 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5">
          <p className="text-[15px] font-semibold tracking-tight">
            {stage === "trigger" ? "What should happen next?" : "What should Directful do?"}
          </p>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="grid size-8 place-items-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-5">
          {stage === "trigger"
            ? RULE_TRIGGERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setRule((r) => ({ ...r, trigger: t.value }));
                    setStage("action");
                  }}
                  className={`block w-full rounded-lg border px-3.5 py-3 text-left text-[13.5px] font-medium transition-colors ${
                    rule.trigger === t.value
                      ? "border-blue-600 bg-blue-50/60 text-blue-900"
                      : "border-zinc-200 text-zinc-800 hover:border-blue-400"
                  }`}
                >
                  {t.label}
                </button>
              ))
            : RULE_ACTIONS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => onAdd({ ...rule, action: a.value })}
                  className="block w-full border border-zinc-200 px-3.5 py-3 text-left transition-colors hover:border-blue-600 hover:bg-blue-50/50"
                >
                  <span className="block text-[13.5px] font-semibold text-zinc-900">{a.label}</span>
                  <span className="mt-0.5 block text-[12px] text-zinc-500">{a.hint}</span>
                </button>
              ))}

          {stage === "action" && rule.trigger === "no_booking_days" && (
            <label className="mt-2 flex items-center gap-2.5 rounded-lg border border-zinc-200 px-3.5 py-2.5">
              <span className="text-[12.5px] text-zinc-600">No booking after</span>
              <input
                type="number"
                min={1}
                aria-label="Days"
                value={rule.days}
                onChange={(e) =>
                  setRule((r) => ({ ...r, days: Math.max(1, Number(e.target.value) || 1) }))
                }
                className="h-9 w-16 border border-zinc-200 px-2 text-[13px] outline-none focus:border-blue-600"
              />
              <span className="text-[12.5px] text-zinc-600">days</span>
            </label>
          )}
        </div>

        {stage === "action" && (
          <div className="flex justify-between border-t border-zinc-200 px-5 py-3">
            <button
              onClick={() => setStage("trigger")}
              className="h-9 px-3 text-[12.5px] font-medium text-zinc-600 hover:text-zinc-900"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
