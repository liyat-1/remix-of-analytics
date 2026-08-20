import { Check, AlertTriangle, Circle, Link2, Mail, MessageSquare, Layout, PartyPopper } from "lucide-react";
import {
  ELEMENT_HINTS,
  STATE_META,
  isShared,
  type ElementKey,
  type ExperienceItem,
} from "@/lib/experience";

const ICONS: Record<ElementKey, typeof Mail> = {
  email: Mail,
  text: MessageSquare,
  landing: Layout,
  success: PartyPopper,
};

function StateIcon({ state, className }: { state: ExperienceItem["state"]; className?: string }) {
  const Icon = state === "ready" ? Check : state === "needs" ? AlertTriangle : Circle;
  return <Icon size={11} strokeWidth={state === "empty" ? 2 : 2.6} className={className} />;
}

/** Inline label + state, used in tight spaces. */
export function ExperienceDot({ item }: { item: ExperienceItem }) {
  const meta = STATE_META[item.state];
  return (
    <span
      title={`${item.label} · ${meta.label}`}
      className={`inline-flex items-center gap-1 text-[11.5px] font-medium ${meta.text}`}
    >
      <StateIcon state={item.state} />
      {item.label}
    </span>
  );
}

/** Small pill used inside editor tabs. */
export function StatePill({ state }: { state: ExperienceItem["state"] }) {
  const meta = STATE_META[state];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-[1px] text-[10px] font-semibold ${meta.bg} ${meta.text}`}
    >
      <StateIcon state={state} />
      {meta.short}
    </span>
  );
}

/**
 * The content checklist for one step: what can be edited, and where each part
 * stands. Landing and Success are marked as shared across channels.
 */
export function ExperienceStatus({
  title = "Editable content",
  items,
  ready,
  total,
  shared,
  onOpen,
}: {
  title?: string;
  items: ExperienceItem[];
  ready: number;
  total: number;
  /** True when more than one channel is active, so pages are explicitly shared. */
  shared?: boolean;
  onOpen?: (key: ElementKey) => void;
}) {
  const complete = ready === total;

  return (
    <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {title}
        </span>
        <span
          className={`text-[11px] font-semibold ${complete ? "text-emerald-700" : "text-zinc-500"}`}
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
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-md border ${meta.bg} ${meta.text}`}
              >
                <Icon size={13} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[12px] font-semibold text-zinc-900">
                    {item.label}
                  </span>
                  {shared && isShared(item.key) && (
                    <span
                      title="Shared by every channel in this step"
                      className="inline-flex items-center gap-0.5 rounded-full bg-zinc-200/70 px-1.5 py-[1px] text-[9.5px] font-semibold uppercase tracking-wide text-zinc-600"
                    >
                      <Link2 size={9} /> Shared
                    </span>
                  )}
                </span>
                <span className={`block truncate text-[11px] font-medium ${meta.text}`}>
                  {meta.label}
                </span>
              </span>
            </span>
          );

          return onOpen ? (
            <button
              key={item.key}
              onClick={() => onOpen(item.key)}
              title={ELEMENT_HINTS[item.key]}
              className="flex items-center rounded-lg border border-transparent bg-white/70 px-2 py-1.5 transition-colors hover:border-zinc-200 hover:bg-white"
            >
              {body}
            </button>
          ) : (
            <span
              key={item.key}
              title={ELEMENT_HINTS[item.key]}
              className="flex items-center rounded-lg px-2 py-1.5"
            >
              {body}
            </span>
          );
        })}
      </div>

      {shared && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
          <Link2 size={11} className="shrink-0 text-zinc-400" />
          Landing and Success pages are the same for email and text — edit once, used by both.
        </p>
      )}
    </div>
  );
}
