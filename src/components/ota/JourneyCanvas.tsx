import {
  Clock,
  Eye,
  LayoutTemplate,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Split,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { Select } from "@/components/editor/Select";
import {
  ROOT,
  containerId,
  countMessages,
  hasRule,
  waitText,
  type JourneyNode,
  type RuleNode,
  type Tone,
  type Wait,
} from "@/lib/otaBranching";
import { offerHeadlineValue, type SequenceMessage, type Stage } from "@/lib/otaJourney";
import { MessageGuestData } from "@/components/ota/GuestDataPanel";

const UNITS = [
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
];

const TONE_RING: Record<Tone, string> = {
  good: "border-emerald-200",
  warn: "border-amber-200",
  neutral: "border-slate-200",
};

const TONE_CHIP: Record<Tone, string> = {
  good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warn: "bg-amber-50 text-amber-700 ring-amber-200",
  neutral: "bg-slate-50 text-slate-600 ring-slate-200",
};

const TONE_DOT: Record<Tone, string> = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  neutral: "bg-slate-400",
};

/* ---------------------------- connection lines ---------------------------- */

function Line({ h = 24 }: { h?: number }) {
  return <span aria-hidden className="mx-auto block w-px bg-slate-200" style={{ height: h }} />;
}

function Endpoint({ label }: { label: string }) {
  return (
    <p className="text-center text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
  );
}

/** The subtle split from a rule into its paths. */
function Fork({ count }: { count: number }) {
  return (
    <div aria-hidden className="hidden md:block">
      <Line h={18} />
      <div className="grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="relative h-6">
            <span
              className="absolute top-0 h-px bg-slate-200"
              style={{
                left: i === 0 ? "50%" : 0,
                right: i === count - 1 ? "50%" : 0,
              }}
            />
            <span className="absolute left-1/2 top-0 h-6 w-px bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- pieces -------------------------------- */

export type CanvasHandlers = {
  onEdit: (msgId: string) => void;
  onPreview: (msgId: string) => void;
  onTemplate?: (msgId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onWait: (nodeId: string, wait: Wait) => void;
  onRuleWait: (ruleId: string, wait: Wait) => void;
  onAddFollowUp: (container: string) => void;
  onAddRule: (container: string) => void;
};

function WaitBlock({
  wait,
  onChange,
  compact,
}: {
  wait: Wait;
  onChange: (w: Wait) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-white ${
        compact ? "px-3 py-2" : "px-4 py-2.5"
      }`}
    >
      <span className="flex items-center gap-2 text-[12.5px] text-slate-600">
        <Clock size={13} className="text-slate-400" /> Wait
      </span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          aria-label="Wait amount"
          value={wait.value}
          onChange={(e) => onChange({ ...wait, value: Math.max(1, Number(e.target.value) || 1) })}
          className="h-9 w-14 rounded-lg border border-slate-200 px-2 text-center text-[12.5px] font-semibold text-slate-900 outline-none focus:border-blue-600"
        />
        <span className={compact ? "w-24" : "w-28"}>
          <Select
            ariaLabel="Wait unit"
            value={wait.unit}
            options={UNITS}
            onChange={(unit) => onChange({ ...wait, unit: unit as Wait["unit"] })}
          />
        </span>
      </span>
    </div>
  );
}

function MessageCard({
  msg,
  stageId,
  channel,
  first,
  compact,
  templateName,
  onEdit,
  onPreview,
  onTemplate,
  onDelete,
}: {
  msg: SequenceMessage;
  stageId: Stage["id"];
  channel: "email" | "text" | "both";
  first?: boolean;
  compact?: boolean;
  templateName?: string;
  onEdit: () => void;
  onPreview: () => void;
  onTemplate?: () => void;
  onDelete?: () => void;
}) {
  const Icon = channel === "text" ? MessageSquare : Mail;
  const tone = msg.branch?.tone as Tone | undefined;
  return (
    <div
      className={`rounded-xl border bg-white ${compact ? "p-3.5" : "p-4"} ${
        tone ? TONE_RING[tone] : "border-slate-200"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <Icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            {msg.branch ? (
              <span
                className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ${
                  TONE_CHIP[msg.branch.tone as Tone]
                }`}
              >
                <span
                  aria-hidden
                  className={`size-1.5 rounded-full ${TONE_DOT[msg.branch.tone as Tone]}`}
                />
                {msg.branch.label}
                {msg.branch.range ? (
                  <span className="font-medium">· {msg.branch.range}</span>
                ) : null}
              </span>
            ) : null}
            <p
              className={`font-semibold tracking-tight text-slate-900 ${
                compact ? "text-[13.5px]" : "text-[14px]"
              }`}
            >
              {msg.name}
            </p>
            <p className="mt-0.5 truncate text-[12.5px] text-slate-500">“{msg.email.subject}”</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-slate-500">
              <span>
                {channel === "text" ? "Text" : channel === "both" ? "Email + Text" : "Email"}
              </span>
              <span aria-hidden className="text-slate-300">
                ·
              </span>
              {msg.offer.enabled ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <Tag size={11} /> Offer attached · {offerHeadlineValue(msg.offer)}
                </span>
              ) : (
                <span>No offer</span>
              )}
              {templateName ? (
                <>
                  <span aria-hidden className="text-slate-300">
                    ·
                  </span>
                  <span>{templateName} template</span>
                </>
              ) : null}
            </p>
            <p className="mt-1 text-[11.5px] text-slate-400">
              {first ? "Sent when the campaign starts" : msg.timing}
            </p>
            <MessageGuestData stageId={stageId} msgId={msg.id} />
          </div>

        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onTemplate ? (
            <button
              type="button"
              onClick={onTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
            >
              <LayoutTemplate size={13} /> Template
            </button>
          ) : null}
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-400"
          >
            <Eye size={13} /> Preview
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Pencil size={13} /> Edit campaign
          </button>
          {onDelete ? (
            <button
              type="button"
              aria-label={`Remove ${msg.name}`}
              onClick={onDelete}
              className="grid size-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600"
            >
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AddActions({
  container,
  allowRule,
  compact,
  onAddFollowUp,
  onAddRule,
}: {
  container: string;
  allowRule: boolean;
  compact?: boolean;
  onAddFollowUp: (c: string) => void;
  onAddRule: (c: string) => void;
}) {
  const cls = `inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed bg-white font-semibold transition-colors ${
    compact ? "px-3 py-2.5 text-[12px]" : "px-4 py-3 text-[12.5px]"
  }`;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onAddFollowUp(container)}
        className={`${cls} border-slate-300 text-slate-600 hover:border-blue-600 hover:text-blue-700`}
      >
        <Plus size={14} /> Add follow-up
      </button>
      {allowRule ? (
        <button
          type="button"
          onClick={() => onAddRule(container)}
          className={`${cls} border-blue-200 text-blue-700 hover:border-blue-600 hover:bg-blue-50/60`}
        >
          <Split size={14} /> Add rule
        </button>
      ) : null}
    </div>
  );
}

function RuleCard({ rule, onWait }: { rule: RuleNode; onWait: (w: Wait) => void }) {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50 ring-1 ring-blue-100">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-200">
          <Split size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-blue-600">
            Rule
          </p>
          <p className="text-[14px] font-semibold tracking-tight text-slate-900">{rule.title}</p>
          <p className="mt-0.5 text-[12.5px] text-slate-600">{rule.hint}</p>
        </div>
      </div>
      <div className="border-t border-blue-100 bg-white/70 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[12.5px] font-medium text-slate-700">
            <Clock size={13} className="text-slate-400" /> Wait for response
          </span>
          <WaitBlock wait={rule.wait} onChange={onWait} compact />
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">
          If the guest hasn&rsquo;t responded within {waitText(rule.wait)}, they continue down the
          No response path.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- sequence ------------------------------- */

function Sequence({
  nodes,
  stageId,
  container,
  messages,
  channel,
  depth,
  templateName,
  h,
}: {
  nodes: JourneyNode[];
  stageId: Stage["id"];
  container: string;
  messages: SequenceMessage[];
  channel: "email" | "text" | "both";
  depth: number;
  templateName?: (msgId: string) => string | undefined;
  h: CanvasHandlers;
}) {
  const compact = depth > 0;
  return (
    <div>
      {nodes.map((node, i) => {
        if (node.kind === "message") {
          const msg = messages.find((m) => m.id === node.msgId);
          if (!msg) return null;
          const first = depth === 0 && i === 0;
          return (
            <div key={node.id}>
              {node.wait ? (
                <>
                  <Line h={compact ? 16 : 20} />
                  <WaitBlock
                    wait={node.wait}
                    compact={compact}
                    onChange={(w) => h.onWait(node.id, w)}
                  />
                  <Line h={compact ? 16 : 20} />
                </>
              ) : (
                <Line h={compact ? 16 : 20} />
              )}
              <MessageCard
                msg={msg}
                stageId={stageId}
                channel={channel}
                first={first}
                compact={compact}
                templateName={templateName?.(msg.id)}
                onEdit={() => h.onEdit(msg.id)}
                onPreview={() => h.onPreview(msg.id)}
                onTemplate={h.onTemplate ? () => h.onTemplate!(msg.id) : undefined}
                onDelete={
                  first || (depth > 0 && i === 0) ? undefined : () => h.onDeleteNode(node.id)
                }
              />
            </div>
          );
        }

        return (
          <div key={node.id}>
            <Line h={compact ? 16 : 22} />
            <RuleCard rule={node} onWait={(w) => h.onRuleWait(node.id, w)} />
            <Fork count={node.paths.length} />
            <div className="grid gap-4 md:grid-cols-3 md:gap-4">
              {node.paths.map((p) => {
                const cid = containerId(node.id, p.key);
                return (
                  <section key={p.key} aria-label={`${p.meta.label} path`} className="min-w-0">
                    <div
                      className={`rounded-xl border bg-white px-3.5 py-2.5 text-center ${TONE_RING[p.meta.tone]}`}
                    >
                      <p className="flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-slate-900">
                        <span
                          aria-hidden
                          className={`size-1.5 rounded-full ${TONE_DOT[p.meta.tone]}`}
                        />
                        {p.meta.label}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-slate-500">
                        {p.key !== "none" ? <Star size={10} className="text-amber-500" /> : null}
                        {p.key === "none"
                          ? `No feedback within ${waitText(node.wait)}`
                          : p.meta.range}
                      </p>
                    </div>
                    <Sequence
                      nodes={p.nodes}
                      stageId={stageId}
                      container={cid}
                      messages={messages}
                      channel={channel}
                      depth={depth + 1}
                      templateName={templateName}
                      h={h}
                    />
                    <Line h={16} />
                    <AddActions
                      container={cid}
                      compact
                      allowRule={!hasRule(p.nodes)}
                      onAddFollowUp={h.onAddFollowUp}
                      onAddRule={h.onAddRule}
                    />
                  </section>
                );
              })}
            </div>
          </div>
        );
      })}

      {depth === 0 ? (
        <>
          <Line h={22} />
          <AddActions
            container={container}
            allowRule={!hasRule(nodes)}
            onAddFollowUp={h.onAddFollowUp}
            onAddRule={h.onAddRule}
          />
          <Line h={22} />
          <Endpoint label="Campaign ends" />
        </>
      ) : null}
    </div>
  );
}

/**
 * The whole guest journey on one connected canvas: linear messages, a rule
 * that splits the journey, and a real mini-sequence inside every path.
 */
export function JourneyCanvas({
  stage,
  nodes,
  messages,
  channel,
  templateName,
  handlers,
}: {
  stage: Stage;
  nodes: JourneyNode[];
  messages: SequenceMessage[];
  channel: "email" | "text" | "both";
  templateName?: (msgId: string) => string | undefined;
  handlers: CanvasHandlers;
}) {
  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {stage.name}
        </p>
        <p className="mt-1 text-[14.5px] font-semibold tracking-tight text-slate-900">
          {stage.summary?.headline ?? stage.purpose}
        </p>
        <p className="mt-1 text-[12.5px] text-slate-500">
          {countMessages(nodes)} messages · Add follow-up continues this path, Add rule splits the
          journey.
        </p>
      </div>

      <Line h={20} />
      <Endpoint label="Campaign starts" />

      <Sequence
        nodes={nodes}
        stageId={stage.id}
        container={ROOT}
        messages={messages}
        channel={channel}
        depth={0}
        templateName={templateName}
        h={handlers}
      />
    </div>
  );
}
