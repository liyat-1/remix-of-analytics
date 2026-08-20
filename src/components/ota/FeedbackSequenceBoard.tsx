import {
  Clock,
  Eye,
  GitBranch,
  LayoutTemplate,
  Mail,
  MessageSquare,
  Pencil,
  Star,
  Tag,
} from "lucide-react";
import { Select } from "@/components/editor/Select";
import { MessageGuestData } from "@/components/ota/GuestDataPanel";
import {
  branchMessages,
  offerHeadlineValue,
  trunkMessages,
  waitLabel,
  type FeedbackCondition,
  type SequenceMessage,
  type Stage,
} from "@/lib/otaJourney";

const UNITS = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

function Rail() {
  return <span aria-hidden className="mx-auto block h-6 w-px bg-slate-200" />;
}

const TONES = {
  good: "border-emerald-200 bg-emerald-50/60",
  warn: "border-amber-200 bg-amber-50/60",
  neutral: "border-slate-200 bg-slate-50",
} as const;

const DOTS = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  neutral: "bg-slate-400",
} as const;

/** The "Ask → Respond" summary shown above the branching sequence. */
export function CampaignSummary({ stage }: { stage: Stage }) {
  if (!stage.summary) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {stage.name}
      </p>
      <p className="mt-1 text-[14.5px] font-semibold tracking-tight text-slate-900">
        {stage.summary.headline}
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
        {stage.summary.lines.map((l) => (
          <li key={l} className="text-[12.5px] text-slate-600">
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageCard({
  msg,
  stageId,
  channelIcon,
  onEdit,
  onPreview,
  onTemplate,
}: {
  msg: SequenceMessage;
  stageId: Stage["id"];
  channelIcon: "email" | "text";
  onEdit: () => void;
  onPreview: () => void;
  onTemplate?: () => void;
}) {
  const Icon = channelIcon === "text" ? MessageSquare : Mail;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold tracking-tight text-slate-900">{msg.name}</p>
            <p className="mt-0.5 text-[12.5px] text-slate-500">“{msg.email.subject}”</p>
            <p className="mt-1 text-[11.5px] text-slate-500">{msg.timing}</p>
            <MessageGuestData stageId={stageId} msgId={msg.id} />
          </div>

        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onTemplate ? (
            <button
              type="button"
              onClick={onTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
            >
              <LayoutTemplate size={13} /> Template
            </button>
          ) : null}
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
          >
            <Eye size={13} /> Preview
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Pencil size={13} /> Edit message
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Post-Checkout style sequence: ask for feedback, wait, then one follow-up per
 * outcome. The hotel configures the wait and the messages — never the logic.
 */
export function FeedbackSequenceBoard({
  stage,
  messages,
  wait,
  onWait,
  onEdit,
  onPreview,
  onTemplate,
}: {
  stage: Stage;
  messages: SequenceMessage[];
  wait: FeedbackCondition["wait"];
  onWait: (w: FeedbackCondition["wait"]) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onTemplate?: (id: string) => void;
}) {
  const trunk = trunkMessages(messages);
  const branches = branchMessages(stage, messages);

  return (
    <div className="space-y-4">
      <CampaignSummary stage={stage} />

      {trunk.map((m) => (
        <MessageCard
          key={m.id}
          msg={m}
          stageId={stage.id}

          channelIcon={m.channel === "text" ? "text" : "email"}
          onEdit={() => onEdit(m.id)}
          onPreview={() => onPreview(m.id)}
          onTemplate={onTemplate ? () => onTemplate(m.id) : undefined}
        />
      ))}

      <Rail />

      {/* Wait for feedback */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
            <Clock size={14} className="text-slate-400" /> Wait for feedback
          </span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              aria-label="Feedback wait amount"
              value={wait.value}
              onChange={(e) => onWait({ ...wait, value: Math.max(1, Number(e.target.value) || 1) })}
              className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-center text-[12.5px] font-semibold text-slate-900 outline-none focus:border-blue-600"
            />
            <span className="w-28">
              <Select
                ariaLabel="Feedback wait unit"
                value={wait.unit}
                options={UNITS}
                onChange={(unit) => onWait({ ...wait, unit: unit as FeedbackCondition["wait"]["unit"] })}
              />
            </span>
          </span>
        </div>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-slate-500">
          Wait up to {waitLabel(wait)} for feedback. If the guest responds sooner, the matching
          follow-up is sent straight away. If the guest doesn&rsquo;t respond, send the reminder
          below.
        </p>
      </div>

      <Rail />

      {/* The condition */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
            <GitBranch size={16} />
          </span>
          <div>
            <p className="text-[14px] font-semibold tracking-tight text-slate-900">
              {stage.condition?.title ?? "Guest feedback"}
            </p>
            <p className="mt-0.5 text-[12.5px] text-slate-500">{stage.condition?.hint}</p>
          </div>
        </header>

        <ul className="divide-y divide-slate-100">
          {branches.map((m) => {
            const b = m.branch!;
            const range = b.key === "none" ? `No response within ${waitLabel(wait)}` : b.range;
            return (
              <li key={m.id} className={`border-l-2 p-4 ${TONES[b.tone]}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                      <span aria-hidden className={`size-1.5 rounded-full ${DOTS[b.tone]}`} />
                      {b.label}
                      <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                        {b.key !== "none" ? <Star size={11} className="text-amber-500" /> : null}
                        {range}
                      </span>
                    </p>
                    <p className="mt-1 text-[12.5px] text-slate-700">
                      <span className="font-semibold">{b.follow}</span>
                      <span className="text-slate-500"> — “{m.email.subject}”</span>
                    </p>
                    {m.offer.enabled ? (
                      <p className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700">
                        <Tag size={11} /> Offer attached · {offerHeadlineValue(m.offer)}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11.5px] text-slate-500">No offer attached</p>
                    )}
                    <MessageGuestData stageId={stage.id} msgId={m.id} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreview(m.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(m.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <Pencil size={13} /> Edit message
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
