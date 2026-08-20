import { Sparkles, Layout, PartyPopper, Link2, RotateCcw } from "lucide-react";
import { Field, TextArea, TextInput } from "../editor/controls";
import { StatePill } from "./ExperienceStatus";
import { PAGE_STARTERS, pageState, type PageConfig, type PageKey } from "@/lib/experience";

const COPY: Record<PageKey, { title: string; hint: string; Icon: typeof Layout }> = {
  landing: {
    title: "Landing page",
    hint: "Where the guest lands after tapping your message.",
    Icon: Layout,
  },
  success: {
    title: "Success page",
    hint: "What the guest sees once they have booked.",
    Icon: PartyPopper,
  },
};

function Block({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-3.5 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-500">
          {title}
        </p>
        {hint && <p className="mt-0.5 text-[11px] text-zinc-400">{hint}</p>}
      </div>
      <div className="space-y-3.5 p-3.5">{children}</div>
    </section>
  );
}

export function PageEditor({
  kind,
  page,
  shared,
  onChange,
}: {
  kind: PageKey;
  page: PageConfig;
  shared?: boolean;
  onChange: (patch: Partial<PageConfig>) => void;
}) {
  const copy = COPY[kind];
  const state = pageState(page);
  const set = (patch: Partial<PageConfig>) => onChange({ ...patch, configured: true });

  return (
    <div className="space-y-3.5 bg-zinc-50/60 p-4">
      {/* Context header — what this page is and where it stands */}
      <div className="rounded-xl border border-zinc-200 bg-white px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <copy.Icon size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[13px] font-semibold text-zinc-900">{copy.title}</p>
              <StatePill state={state} />
            </div>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-zinc-500">{copy.hint}</p>
          </div>
        </div>

        {shared && (
          <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-600">
            <Link2 size={11} className="mt-[2px] shrink-0 text-zinc-400" />
            Shared by email and text in this step — edit once, both channels use it.
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {!page.configured ? (
            <button
              onClick={() => onChange({ ...PAGE_STARTERS[kind] })}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[11.5px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Sparkles size={13} /> Start from suggested content
            </button>
          ) : (
            <button
              onClick={() => onChange({ ...PAGE_STARTERS[kind] })}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-[11.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
            >
              <RotateCcw size={12} /> Reset to suggested copy
            </button>
          )}
        </div>
      </div>

      <Block title="Content" hint="Headline and copy the guest reads first.">
        <Field label="Headline" hint={`${page.headline.length}/90`}>
          <TextInput value={page.headline} onChange={(v) => set({ headline: v })} />
        </Field>
        <Field label="Supporting copy" hint="Optional">
          <TextInput value={page.subheadline} onChange={(v) => set({ subheadline: v })} />
        </Field>
        <Field label="Body">
          <TextArea rows={6} value={page.body} onChange={(v) => set({ body: v })} />
        </Field>
      </Block>

      <Block title="Call to action" hint="What the guest taps next.">
        <Field label="Button label">
          <TextInput value={page.ctaLabel} onChange={(v) => set({ ctaLabel: v })} />
        </Field>
        <Field label="Button link">
          <TextInput value={page.ctaUrl} onChange={(v) => set({ ctaUrl: v })} />
        </Field>
        <Field label="Footnote" hint="Optional fine print">
          <TextInput value={page.footnote} onChange={(v) => set({ footnote: v })} />
        </Field>
      </Block>
    </div>
  );
}
