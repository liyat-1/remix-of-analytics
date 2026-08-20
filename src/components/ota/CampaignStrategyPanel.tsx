import { useMemo, useState } from "react";
import { Check, ChevronDown, Info, Mail, MessageSquare, Sparkles } from "lucide-react";
import { STAGES, type StageId } from "@/lib/otaJourney";
import {
  RECOMMENDATION_LABEL,
  STRATEGIES,
  STRATEGY_BY_ID,
  type StrategyId,
} from "@/lib/otaStrategy";

function StrategyIcons({ id, muted }: { id: StrategyId; muted?: boolean }) {
  const both = id === "both" || id === "text_fallback";
  return (
    <span className={`flex items-center gap-1 ${muted ? "text-slate-400" : "text-slate-500"}`}>
      {id !== "text" ? <Mail size={13} aria-hidden /> : null}
      {both || id === "text" ? <MessageSquare size={13} aria-hidden /> : null}
    </span>
  );
}

/** Column 1 — checklist of stages the strategy will be applied to. */
function StageChecklist({
  selected,
  onToggle,
  onAll,
  current,
}: {
  selected: StageId[];
  onToggle: (id: StageId) => void;
  onAll: (all: boolean) => void;
  current: Record<StageId, StrategyId>;
}) {
  const all = selected.length === STAGES.length;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <p className="min-w-0 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          1 · Apply to stages
        </p>
        <button
          type="button"
          onClick={() => onAll(!all)}
          className="shrink-0 text-[11.5px] font-semibold text-blue-700 hover:text-blue-800"
        >
          {all ? "Clear all" : "Select all"}
        </button>
      </div>

      <ul className="mt-3 space-y-1.5">
        {STAGES.map((s) => {
          const on = selected.includes(s.id);
          const strategy = STRATEGY_BY_ID[current[s.id]];
          return (
            <li key={s.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(s.id)}
                className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  on
                    ? "border-blue-300 bg-blue-50/70"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`grid size-4 shrink-0 place-items-center rounded border ${
                    on ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {on ? <Check size={11} strokeWidth={3} /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-slate-900">
                    {s.name}
                  </span>
                  <span className="block truncate text-[11.5px] text-slate-500">
                    Currently {strategy.label}
                  </span>
                </span>
                <StrategyIcons id={strategy.id} muted />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Column 2 — selectable strategy cards. */
function StrategyCard({
  id,
  active,
  onSelect,
}: {
  id: StrategyId;
  active: boolean;
  onSelect: () => void;
}) {
  const s = STRATEGY_BY_ID[id];
  const tag = RECOMMENDATION_LABEL[s.recommendation];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex h-full w-full flex-col rounded-xl border p-3.5 text-left transition-colors ${
        active
          ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-200"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13.5px] font-semibold text-slate-900">{s.label}</span>
            <StrategyIcons id={id} />
          </span>
          {tag ? (
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                s.recommendation === "recommended"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              {tag}
            </span>
          ) : null}
        </span>
        <span
          className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${
            active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"
          }`}
        >
          {active ? <Check size={10} strokeWidth={3} /> : null}
        </span>
      </span>

      <span className="mt-2 block text-[12.5px] leading-relaxed text-slate-600">{s.summary}</span>
      <span className="mt-1 block text-[11.5px] leading-relaxed text-slate-500">{s.detail}</span>

      {s.benchmark ? (
        <span className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-600">
          <Sparkles size={11} className="shrink-0 text-amber-500" aria-hidden />
          {s.benchmark}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Configure the messaging strategy once, apply it to any set of stages, and
 * override individual stages later from the journey itself.
 */
export function CampaignStrategyPanel({
  strategies,
  onApply,
}: {
  strategies: Record<StageId, StrategyId>;
  onApply: (stages: StageId[], strategy: StrategyId) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StageId[]>([]);
  const [choice, setChoice] = useState<StrategyId>("both");
  const [applied, setApplied] = useState<{ count: number; label: string } | null>(null);

  const mixed = useMemo(
    () => new Set(STAGES.map((s) => strategies[s.id])).size > 1,
    [strategies],
  );
  const currentLabel = mixed ? "Mixed across stages" : STRATEGY_BY_ID[strategies.just_booked].label;

  const toggle = (id: StageId) => {
    setApplied(null);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <section
      id="campaign-strategy"
      className="rounded-xl border border-slate-200 bg-white shadow-card"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="min-w-0">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              Campaign strategy
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-slate-700 ring-1 ring-slate-200">
              {mixed ? null : <StrategyIcons id={strategies.just_booked} muted />}
              {currentLabel}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-slate-500">
            How guests are messaged across the journey
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[12.5px] font-semibold text-blue-700">
          <span className="hidden sm:inline">{open ? "Close" : "Change"}</span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div className="border-t border-slate-100 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            <StageChecklist
              selected={selected}
              current={strategies}
              onToggle={toggle}
              onAll={(all: boolean) => {
                setApplied(null);
                setSelected(all ? STAGES.map((s) => s.id) : []);
              }}
            />

            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                2 · Choose a messaging strategy
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {STRATEGIES.map((s) => (
                  <StrategyCard
                    key={s.id}
                    id={s.id}
                    active={choice === s.id}
                    onSelect={() => {
                      setApplied(null);
                      setChoice(s.id);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => {
                onApply(selected, choice);
                setApplied({ count: selected.length, label: STRATEGY_BY_ID[choice].label });
                setSelected([]);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-card transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              {selected.length
                ? `Apply to ${selected.length} stage${selected.length > 1 ? "s" : ""}`
                : "Select stages to apply"}
            </button>
            {applied ? (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700">
                <Check size={14} /> {applied.label} applied to {applied.count} stage
                {applied.count > 1 ? "s" : ""}
              </span>
            ) : null}
            <span className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-slate-500">
              <Info size={12} className="mt-0.5 shrink-0 text-slate-400" />
              Landing and success pages stay shared between email and text.
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
