import { AlertTriangle, Check, Circle, Layout, Link2, Mail, MessageSquare, PartyPopper } from "lucide-react";
import {
  CONTENT_HINT,
  STATE_META,
  contentSummary,
  isShared,
  type ContentItem,
  type ContentKey,
  type ContentState,
} from "@/lib/otaStatus";
import type { Channel, SequenceMessage } from "@/lib/otaJourney";

const ICONS: Record<ContentKey, typeof Mail> = {
  email: Mail,
  text: MessageSquare,
  landing: Layout,
  success: PartyPopper,
};

function StateIcon({ state }: { state: ContentState }) {
  const Icon = state === "ready" ? Check : state === "partial" ? AlertTriangle : Circle;
  return <Icon size={10} strokeWidth={state === "empty" ? 2 : 2.6} />;
}

/** Tiny inline chip: "Email · Saved". Used in dense card rows. */
export function ContentChip({ item, shared }: { item: ContentItem; shared?: boolean }) {
  const meta = STATE_META[item.state];
  return (
    <span
      title={`${item.label} — ${meta.label}. ${CONTENT_HINT[item.key]}`}
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-[1.5px] text-[10.5px] font-semibold ${meta.chip}`}
    >
      <StateIcon state={item.state} />
      {item.label}
      {shared && isShared(item.key) ? <Link2 size={9} className="opacity-70" /> : null}
      <span className="font-medium opacity-70">· {meta.short}</span>
    </span>
  );
}

/**
 * The content checklist for one message: what can be edited and where each part
 * stands. Landing and success are flagged as shared when both channels are on.
 */
export function ContentStatus({
  message,
  channel,
  compact,
  onOpen,
}: {
  message: SequenceMessage;
  channel: Channel;
  compact?: boolean;
  onOpen?: (key: ContentKey) => void;
}) {
  const { items, ready, total } = contentSummary(message, channel);
  const shared = channel === "both";

  if (compact) {
    return (
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {items.map((i) => (
          <ContentChip key={i.key} item={i} shared={shared} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Editable content
        </span>
        <span
          className={`text-[11px] font-semibold ${ready === total ? "text-emerald-700" : "text-slate-500"}`}
        >
          {ready}/{total} saved
        </span>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {items.map((item) => {
          const meta = STATE_META[item.state];
          const Icon = ICONS[item.key];
          const body = (
            <span className="flex w-full items-center gap-2.5">
              <span className={`grid size-7 shrink-0 place-items-center rounded-md border ${meta.chip}`}>
                <Icon size={13} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[12px] font-semibold text-slate-900">{item.label}</span>
                  {shared && isShared(item.key) ? (
                    <span
                      title="Shared by email and text"
                      className="inline-flex items-center gap-0.5 rounded-full bg-slate-200/70 px-1.5 py-[1px] text-[9.5px] font-semibold uppercase tracking-wide text-slate-600"
                    >
                      <Link2 size={9} /> Shared
                    </span>
                  ) : null}
                </span>
                <span className={`block truncate text-[11px] font-medium ${meta.text}`}>{meta.label}</span>
              </span>
            </span>
          );

          return onOpen ? (
            <button
              key={item.key}
              type="button"
              onClick={() => onOpen(item.key)}
              title={CONTENT_HINT[item.key]}
              className="flex items-center rounded-lg border border-transparent bg-white/70 px-2 py-1.5 transition-colors hover:border-slate-300 hover:bg-white"
            >
              {body}
            </button>
          ) : (
            <span
              key={item.key}
              title={CONTENT_HINT[item.key]}
              className="flex items-center rounded-lg px-2 py-1.5"
            >
              {body}
            </span>
          );
        })}
      </div>

      {shared ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Link2 size={11} className="shrink-0 text-slate-400" />
          Landing and success pages are the same for email and text — edit once, used by both.
        </p>
      ) : null}
    </div>
  );
}
