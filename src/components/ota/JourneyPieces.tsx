import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  CalendarCheck2,
  Clock3,
  Eye,
  Mail,
  MessageSquare,
  Pause,
  Play,
  Repeat2,
  GitBranch,
  Star,
} from "lucide-react";
import { Select } from "@/components/editor/Select";
import {
  CHANNEL_LABEL,
  stageMetrics,
  type Channel,
  type Period,
  type Stage,
} from "@/lib/otaJourney";
import {
  anchorOptions,
  timingLabel,
  unitOptions,
  type StageTiming,
} from "@/lib/stageTiming";
import { STRATEGY_BY_ID, type StrategyId } from "@/lib/otaStrategy";
import { StageGuestData } from "@/components/ota/GuestDataPanel";


export function ChannelBadge({ channel }: { channel: Channel }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-medium text-slate-600">
      {channel === "text" ? <MessageSquare size={12} /> : <Mail size={12} />}
      {CHANNEL_LABEL[channel]}
    </span>
  );
}

export function SoftBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "info" }) {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11.5px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StageIcon({ stage }: { stage: Stage }) {
  const Icon =
    stage.icon === "booked"
      ? CalendarCheck2
      : stage.icon === "prearrival"
        ? Clock3
        : stage.icon === "stay"
          ? BedDouble
          : stage.icon === "checkout"
            ? Star
            : Repeat2;
  return (
    <span className={`grid size-9 shrink-0 place-items-center rounded-xl ring-1 ${stage.accent}`}>
      <Icon size={17} />
    </span>
  );
}

export function Momentum({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11.5px] font-semibold tabular-nums ${
        up ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/**
 * Slim, centred timing card that sits between stages.
 * Stage timing = when this part of the journey begins (anchored to a guest
 * milestone). Message timing lives inside the stage sequence.
 */
export function StageTimingRail({
  stage,
  timing,
  onChange,
  first,
}: {
  stage: Stage;
  timing: StageTiming;
  onChange?: (t: StageTiming) => void;
  first?: boolean;
}) {
  const editable = Boolean(onChange);
  const units = unitOptions(stage.id, timing.value);
  const anchors = anchorOptions(stage.id);

  return (
    <div className="flex flex-col items-center">
      {!first ? <span aria-hidden className="h-5 w-px bg-slate-200" /> : null}
      <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-card transition-colors hover:border-slate-300">
        <div className="grid items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {stage.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
              <Clock3 size={13} className="shrink-0 text-slate-400" />
              {timingLabel(timing)}
            </p>
          </div>

          {editable ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                type="number"
                min={0}
                aria-label={`${stage.name} timing amount`}
                value={timing.value}
                onChange={(e) =>
                  onChange!({ ...timing, value: Math.max(0, Number(e.target.value) || 0) })
                }
                className="h-8 w-14 rounded-lg border border-slate-200 px-2 text-center text-[12px] font-semibold tabular-nums text-slate-900 outline-none focus:border-blue-600"
              />
              <div className="w-[96px]">
                <Select
                  size="sm"
                  ariaLabel={`${stage.name} timing unit`}
                  value={timing.unit}
                  options={units}
                  onChange={(v) => onChange!({ ...timing, unit: v })}
                />
              </div>
              <div className="w-[148px]">
                <Select
                  size="sm"
                  align="right"
                  ariaLabel={`${stage.name} timing anchor`}
                  value={timing.anchor}
                  options={anchors}
                  onChange={(v) => onChange!({ ...timing, anchor: v })}
                />
              </div>
            </div>
          ) : (
            <span className="justify-self-start rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11.5px] font-medium text-slate-500 sm:justify-self-end">
              Starts on booking
            </span>
          )}
        </div>
      </div>
      <span aria-hidden className="h-5 w-px bg-slate-200" />
    </div>
  );
}


export function StageCard({
  stage,
  period,
  strategy,
  paused,
  onTogglePause,
  onChangeStrategy,
  onPreview,
  onEdit,
}: {
  stage: Stage;
  period: Period;
  index?: number;
  total?: number;
  strategy?: StrategyId;
  paused?: boolean;
  onTogglePause?: () => void;
  onChangeStrategy?: () => void;
  onPreview?: () => void;
  onEdit?: () => void;
}) {
  const m = stageMetrics(stage.id, period);
  const isPaused = paused ?? stage.status === "paused";
  const strategyName = strategy ? STRATEGY_BY_ID[strategy].label : CHANNEL_LABEL[stage.channel];

  const previewClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100";
  const editClass =
    "inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-semibold text-white shadow-card transition-colors hover:bg-blue-700 active:bg-blue-800";

  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-[box-shadow,border-color] hover:border-slate-300 hover:shadow-pop">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <StageIcon stage={stage} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-[16px] font-semibold tracking-tight text-slate-900">
                  {stage.name}
                </h3>
                <span className="text-[12.5px] text-slate-500">{stage.subtitle}</span>
              </div>

              <p className="mt-1.5 max-w-prose text-[13px] leading-relaxed text-slate-600">
                {stage.guestLine}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-medium text-slate-600">
                  <Mail size={12} className="text-slate-400" />
                  {strategyName}
                  {onChangeStrategy ? (
                    <button
                      type="button"
                      onClick={onChangeStrategy}
                      className="ml-1 font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Change
                    </button>
                  ) : null}
                </span>
                <SoftBadge>{stage.campaignType}</SoftBadge>
                <SoftBadge>
                  {stage.sequence.some((s) => s.offer.enabled)
                    ? "Offer attached"
                    : "No offer attached"}
                </SoftBadge>
                <SoftBadge tone={isPaused ? "warn" : "good"}>
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${isPaused ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                  {isPaused ? "Paused" : "Active"}
                </SoftBadge>
              </div>
              {isPaused ? (
                <p className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[12px] font-medium text-amber-800">
                  This stage is paused. Messages will not be sent until resumed.
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {onPreview ? (
                  <button type="button" onClick={onPreview} className={previewClass}>
                    <Eye size={13} /> Preview
                  </button>
                ) : (
                  <Link
                    to="/ota/stage/$stageId"
                    params={{ stageId: stage.id }}
                    search={{ preview: true }}
                    className={previewClass}
                  >
                    <Eye size={13} /> Preview
                  </Link>
                )}
                {onEdit ? (
                  <button type="button" onClick={onEdit} className={editClass}>
                    Edit stage campaign
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                ) : (
                  <Link
                    to="/ota/stage/$stageId"
                    params={{ stageId: stage.id }}
                    className={editClass}
                  >
                    Edit stage campaign
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                )}
                {onTogglePause ? (
                  <button
                    type="button"
                    onClick={onTogglePause}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                  >
                    {isPaused ? <Play size={13} /> : <Pause size={13} />}
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                ) : null}
              </div>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 content-start border-t border-slate-100 bg-slate-50/70 lg:border-l lg:border-t-0">
          <div className="min-w-0 border-b border-r border-slate-100 p-4">
            <p className="text-[11px] font-medium text-slate-500">{m.primary.label}</p>
            <p className="mt-1 text-[19px] font-semibold tabular-nums tracking-tight text-slate-900">
              {m.primary.value}
            </p>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5">
              <Momentum value={m.primary.momentum} />
              <span className="text-[10.5px] uppercase tracking-[0.1em] text-slate-400">
                Momentum
              </span>
            </span>
          </div>
          {m.rest.map((r, i) => (
            <div
              key={r.label}
              className={`min-w-0 border-slate-100 p-4 ${i === 0 ? "border-b" : ""} ${
                i === 1 ? "border-r" : ""
              }`}
            >
              <p className="text-[11px] font-medium text-slate-500">{r.label}</p>
              <p className="mt-1 text-[19px] font-semibold tabular-nums tracking-tight text-slate-900">
                {r.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <StageGuestData stageId={stage.id} period={period} hideCaptured />



      {stage.branches ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-white px-5 py-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <GitBranch size={12} /> Branches
          </span>
          {stage.branches.map((b) => (
            <SoftBadge
              key={b.label}
              tone={b.tone === "good" ? "good" : b.tone === "warn" ? "warn" : "neutral"}
            >
              {b.label}
            </SoftBadge>
          ))}
        </div>
      ) : null}
    </article>
  );
}

