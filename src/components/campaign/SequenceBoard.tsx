import {
  Mail,
  MessageSquare,
  AlertTriangle,
  Pencil,
  LayoutTemplate,
  Copy,
  Trash2,
  ArrowRight,
  Plus,
  Link2,
} from "lucide-react";
import { StepMenu } from "./StepMenu";
import { Connector, DelayControl, Endpoint } from "./StructureBuilder";
import { ExperienceStatus, StatePill } from "./ExperienceStatus";
import type { ChannelKey, SequenceStep } from "@/lib/sequence";
import {
  experienceSummary,
  messageState,
  type ElementKey,
  type ExperienceItem,
} from "@/lib/experience";

export type ExperienceTab = "message" | "landing" | "success";


function ChannelRow({
  channel,
  step,
  onTemplate,
  onEdit,
}: {
  channel: ChannelKey;
  step: SequenceStep;
  onTemplate: () => void;
  onEdit: () => void;
}) {
  const cfg = step[channel];
  const state = messageState(step, channel);
  const Icon = channel === "email" ? Mail : MessageSquare;
  const label = channel === "email" ? "Email" : "Text";

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-zinc-100 px-4 py-3">
      <span
        className={`grid size-8 place-items-center ${
          state === "ready" ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-400"
        }`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-zinc-900">{label}</span>
          <StatePill state={state} />
        </div>
        <p className="mt-0.5 truncate text-[11.5px] text-zinc-500">
          {cfg.configured
            ? cfg.templateName
              ? `${cfg.templateName} · Based on template · Personalised`
              : "Custom message · Personalised"
            : "No message configured"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {channel === "email" && (
          <button
            onClick={onTemplate}
            className="hidden h-8 items-center gap-1.5 border border-zinc-200 px-2.5 text-[11.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700 sm:flex"
          >
            <LayoutTemplate size={13} /> {cfg.templateId ? "Change template" : "Select template"}
          </button>
        )}
        <button
          onClick={onEdit}
          className="flex h-8 items-center gap-1.5 border border-zinc-200 px-2.5 text-[11.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
        >
          <Pencil size={13} /> Edit {label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}

export function SequenceBoard({
  steps,
  email,
  text,
  channelLabel,
  attention,
  onReview,
  onTemplate,
  onEdit,
  onDelay,
  onDuplicate,
  onDelete,
  onAdd,
  onChangeStrategy,
}: {
  steps: SequenceStep[];
  email: boolean;
  text: boolean;
  channelLabel: string;
  attention: { step: SequenceStep; item: ExperienceItem }[];
  onReview: () => void;
  onTemplate: (stepId: string, channel: ChannelKey) => void;
  onEdit: (stepId: string, channel: ChannelKey, tab?: ExperienceTab) => void;
  onDelay: (id: string, d: SequenceStep["delay"]) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onChangeStrategy?: () => void;
}) {
  const primaryChannel: ChannelKey = email ? "email" : "text";
  const shared = email && text;

  const openFor = (stepId: string, key: ElementKey) =>
    key === "landing" || key === "success"
      ? onEdit(stepId, primaryChannel, key)
      : onEdit(stepId, key, "message");

  const editable = [
    ...(email ? ["Email content"] : []),
    ...(text ? ["Text content"] : []),
    "Landing page",
    "Success page",
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <div className="mb-6">
        <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900">
          Configure your sequence
        </h2>
        <p className="mt-1 text-[12.5px] text-zinc-500">
          Each step is one complete guest experience — message, landing page and success page.
        </p>
      </div>

      {/* Strategy summary: what was chosen, and what that lets you edit. */}
      <div className="mb-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
              {email && !text ? (
                <Mail size={15} />
              ) : text && !email ? (
                <MessageSquare size={15} />
              ) : (
                <Link2 size={15} />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Channel strategy
              </p>
              <p className="truncate text-[13px] font-semibold text-zinc-900">{channelLabel}</p>
            </div>
          </div>
          {onChangeStrategy && (
            <button
              onClick={onChangeStrategy}
              className="h-8 rounded-lg border border-zinc-200 px-3 text-[11.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
            >
              Change
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-zinc-100 bg-zinc-50/70 px-4 py-2.5">
          <span className="text-[11px] font-medium text-zinc-500">You can edit:</span>
          {editable.map((label) => (
            <span
              key={label}
              className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700"
            >
              {label}
            </span>
          ))}
        </div>
        {shared && (
          <p className="flex items-start gap-1.5 border-t border-zinc-100 px-4 py-2.5 text-[11.5px] leading-relaxed text-zinc-500">
            <Link2 size={12} className="mt-[2px] shrink-0 text-zinc-400" />
            Email and text each have their own message, but they share one landing page and one
            success page per step.
          </p>
        )}
      </div>


      {attention.length > 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3">
          <span className="flex items-center gap-2 text-[12.5px] font-medium text-amber-900">
            <AlertTriangle size={14} className="text-amber-600" />
            {attention.length} element{attention.length > 1 ? "s need" : " needs"} your attention
          </span>
          <button
            onClick={onReview}
            className="h-8 rounded-lg border border-amber-300 bg-white px-3 text-[11.5px] font-semibold text-amber-800 transition-colors hover:bg-amber-100"
          >
            Review
          </button>
        </div>
      )}

      <Endpoint label="Campaign starts" start />

      {steps.map((s, i) => {
        const summary = experienceSummary(s, { email, text });
        const pages = summary.items.filter((i) => i.key === "landing" || i.key === "success");
        return (
          <div key={s.id} id={`step-${s.id}`}>
            {s.kind === "followup" ? (
              <Connector>
                <DelayControl delay={s.delay} onChange={(d) => onDelay(s.id, d)} />
              </Connector>
            ) : (
              <Connector />
            )}
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center text-[11px] font-semibold ${
                      summary.complete ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-zinc-900">
                      {s.name}
                      <span
                        className={`rounded-full border px-1.5 py-[1px] text-[10.5px] font-semibold ${
                          summary.complete
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-zinc-50 text-zinc-500"
                        }`}
                      >
                        {summary.ready}/{summary.total} saved
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-zinc-500">
                      {s.kind === "initial"
                        ? "Sent when the campaign starts"
                        : `Sent ${s.delay.value} ${s.delay.unit} after the previous message`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => onEdit(s.id, primaryChannel, "message")}
                    className="flex h-8 items-center gap-1.5 bg-blue-600 px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Edit experience <ArrowRight size={13} />
                  </button>
                  <StepMenu
                    label={`${s.name} actions`}
                    items={[
                      {
                        label: email ? "Change template" : "Configure",
                        icon: LayoutTemplate,
                        onSelect: () => onTemplate(s.id, primaryChannel),
                      },
                      {
                        label: "Edit experience",
                        icon: Pencil,
                        onSelect: () => onEdit(s.id, primaryChannel, "message"),
                      },
                      ...(s.kind === "followup"
                        ? [
                            {
                              label: "Duplicate step",
                              icon: Copy,
                              onSelect: () => onDuplicate(s.id),
                            },
                            {
                              label: "Delete step",
                              icon: Trash2,
                              destructive: true,
                              separated: true,
                              onSelect: () => onDelete(s.id),
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              </div>

              {email && (
                <ChannelRow
                  channel="email"
                  step={s}
                  onTemplate={() => onTemplate(s.id, "email")}
                  onEdit={() => onEdit(s.id, "email", "message")}
                />
              )}
              {text && (
                <ChannelRow
                  channel="text"
                  step={s}
                  onTemplate={() => onTemplate(s.id, "text")}
                  onEdit={() => onEdit(s.id, "text", "message")}
                />
              )}

              <ExperienceStatus
                title="Guest pages"
                shared={shared}
                items={pages}
                ready={pages.filter((p) => p.state === "ready").length}
                total={pages.length}
                onOpen={(key) => openFor(s.id, key)}
              />
            </div>
          </div>
        );
      })}

      <Connector />
      <button
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-zinc-300 bg-white py-3 text-[12.5px] font-semibold text-zinc-600 transition-colors hover:border-blue-600 hover:text-blue-700"
      >
        <Plus size={15} /> Add follow-up
      </button>
      <Connector />
      <Endpoint label="Campaign ends" />
    </div>
  );
}
