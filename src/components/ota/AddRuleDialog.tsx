import { useState } from "react";
import { Check, Split, Star, X } from "lucide-react";
import { Select } from "@/components/editor/Select";
import {
  FEEDBACK_PATHS,
  RULE_SOURCES,
  waitText,
  type RuleSource,
  type Wait,
} from "@/lib/otaBranching";

const UNITS = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

const TONE_DOT = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  neutral: "bg-slate-400",
} as const;

/**
 * "Add a rule" — hotel language only. The marketer picks what the campaign
 * should look at, and the three useful outcomes are created in one click.
 */
export function AddRuleDialog({
  defaultWait,
  onCancel,
  onCreate,
}: {
  defaultWait: Wait;
  onCancel: () => void;
  onCreate: (source: RuleSource, wait: Wait) => void;
}) {
  const [source, setSource] = useState<RuleSource>("feedback");
  const [wait, setWait] = useState<Wait>({ ...defaultWait });
  const meta = RULE_SOURCES.find((s) => s.value === source)!;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-label="Add a rule"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl duration-150 animate-in fade-in zoom-in-95"
      >
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">Add a rule</h3>
            <p className="mt-1 text-[12.5px] text-slate-500">
              Send different messages based on what the guest does.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close rule setup"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
          <div>
            <p className="text-[12.5px] font-semibold text-slate-800">Base this rule on</p>
            <div className="mt-2">
              <Select
                ariaLabel="Base this rule on"
                value={source}
                options={RULE_SOURCES.map((s) => ({
                  value: s.value,
                  label: s.available ? s.label : `${s.label} (coming soon)`,
                }))}
                onChange={(v) => {
                  const next = RULE_SOURCES.find((s) => s.value === v);
                  if (next?.available) setSource(v as RuleSource);
                }}
              />
            </div>
            <p className="mt-2 text-[12px] text-slate-500">{meta.hint}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-[12.5px] font-semibold text-slate-800">Feedback outcomes</p>
            <ul className="mt-2.5 space-y-2">
              {FEEDBACK_PATHS.map((p) => (
                <li
                  key={p.key}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className={`size-1.5 shrink-0 rounded-full ${TONE_DOT[p.tone]}`}
                    />
                    <span className="truncate text-[13px] font-semibold text-slate-900">
                      {p.label}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-slate-500">
                    {p.key !== "none" ? <Star size={11} className="text-amber-500" /> : null}
                    {p.range}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[12px] leading-relaxed text-slate-500">
              Each outcome becomes its own path, and every path can have its own follow-ups and
              timing.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <p className="min-w-0 text-[12.5px] font-semibold text-slate-800">
                Wait for a response
              </p>
              <span className="flex shrink-0 items-center gap-2">
                <input
                  type="number"
                  min={1}
                  aria-label="Wait for response amount"
                  value={wait.value}
                  onChange={(e) =>
                    setWait({ ...wait, value: Math.max(1, Number(e.target.value) || 1) })
                  }
                  className="h-9 w-14 shrink-0 rounded-lg border border-slate-200 px-2 text-center text-[12.5px] font-semibold text-slate-900 outline-none focus:border-blue-600 sm:w-16"
                />
                <span className="w-24 shrink-0 sm:w-28">
                  <Select
                    ariaLabel="Wait for response unit"
                    value={wait.unit}
                    options={UNITS}
                    onChange={(unit) => setWait({ ...wait, unit: unit as Wait["unit"] })}
                  />
                </span>
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
              If the guest hasn&rsquo;t responded within {waitText(wait)}, they continue down the
              <span className="font-semibold text-slate-700"> No response</span> path.
            </p>
          </div>
        </div>

        <footer className="shrink-0 space-y-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3.5 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:space-y-0 sm:px-5">
          <p className="flex items-start gap-1.5 text-[12px] leading-snug text-slate-500">
            <Split size={13} className="mt-0.5 shrink-0 text-blue-600" />
            <span className="min-w-0">Creates 3 paths · Positive · Negative · No response</span>
          </p>
          <span className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-center text-[12.5px] font-semibold text-slate-700 hover:border-slate-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onCreate(source, wait)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-blue-700"
            >
              <Check size={14} /> Create 3 paths
            </button>
          </span>
        </footer>
      </div>
    </div>
  );
}
