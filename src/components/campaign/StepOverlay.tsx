import { useState } from "react";
import {
  X,
  Mail,
  MessageSquare,
  Monitor,
  Smartphone,
  Moon,
  LayoutTemplate,
  Link2,
  Layout,
  PartyPopper,
} from "lucide-react";
import { EmailPreview } from "../editor/EmailPreview";
import { PhoneMockup } from "../editor/PhoneMockup";
import { SmsPreview } from "../editor/SmsPreview";
import { Select } from "../editor/Select";
import { Field, TextArea, TextInput } from "../editor/controls";
import { TagTextArea, type TagDef } from "./TagTextArea";
import { ScaledEmail } from "./ScaledEmail";
import { PageEditor } from "./PageEditor";
import { PagePreview } from "./PagePreview";
import { DELAY_UNITS, type DelayUnit } from "@/lib/sequence";
import { StatePill } from "./ExperienceStatus";
import type { ExperienceState, PageConfig } from "@/lib/experience";
import type { Campaign } from "@/lib/campaign";

export type StepDraft = {
  /** SMS copy. */
  message: string;
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  delay?: { value: number; unit: DelayUnit };
  landing: PageConfig;
  success: PageConfig;
};

export type ExperienceTab = "message" | "landing" | "success";

type PreviewMode = "desktop" | "mobile" | "dark";

/**
 * The only place where editing happens. A large centred overlay: content
 * editor on the left, always-live preview on the right.
 */
export function StepOverlay({
  title,
  text,
  email,
  draft,
  onChange,
  onSave,
  onCancel,
  previewCampaign,
  sender,
  templateName,
  templateReady,
  onChooseTemplate,
  mergeTags,
  media,
  mediaSlot,
  initialTab = "message",
  brand,
  status,
  shared,
  strategyLabel,
}: {
  /** Saved status of each editable part, shown on the tabs. */
  status: Record<"email" | "text" | "landing" | "success", ExperienceState>;
  /** True when both channels are active, so the pages are shared. */
  shared: boolean;
  strategyLabel: string;
  title: string;
  initialTab?: ExperienceTab;
  brand: string;
  text: boolean;
  email: boolean;
  draft: StepDraft;
  onChange: (patch: Partial<StepDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
  previewCampaign: Campaign;
  sender: string;
  templateName: string | null;
  templateReady: boolean;
  onChooseTemplate: () => void;
  mergeTags: (TagDef & { chip: string })[];
  media?: string | null;
  mediaSlot?: React.ReactNode;
}) {
  const [tab, setTab] = useState<"text" | "email">(text ? "text" : "email");
  const [mode, setMode] = useState<PreviewMode>("desktop");
  const [top, setTop] = useState<ExperienceTab>(initialTab);
  const [flow, setFlow] = useState(false);
  const [flowStage, setFlowStage] = useState<ExperienceTab>("message");
  const stageShown: ExperienceTab = flow ? flowStage : top;
  const showTabs = text && email;
  const channelTab = text && email ? tab : text ? "text" : "email";

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-zinc-900/40 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-label={`Edit ${title}`}
        className="flex h-[92vh] w-full max-w-[1400px] flex-col rounded-2xl border border-zinc-300 bg-white shadow-2xl duration-150 animate-in fade-in zoom-in-95"
      >
        {/* Overlay chrome */}
        <header className="shrink-0 border-b border-zinc-200">
          <div className="flex items-start justify-between gap-3 px-4 pb-2.5 pt-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                Editing
              </p>
              <p className="truncate text-[15px] font-semibold tracking-tight text-zinc-900">
                {title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 sm:flex">
                <Link2 size={11} className="text-zinc-400" />
                {strategyLabel}
              </span>
              <button
                onClick={onCancel}
                aria-label="Close editor"
                className="grid size-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* What can be edited here, and where each part stands. */}
          <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {([
                { id: "message", label: "Message", Icon: Mail },
                { id: "landing", label: "Landing page", Icon: Layout },
                { id: "success", label: "Success page", Icon: PartyPopper },
              ] as const).map((t) => {
                const active = !flow && top === t.id;
                const state =
                  t.id === "message" ? status[channelTab] : status[t.id as "landing" | "success"];
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTop(t.id);
                      setFlow(false);
                    }}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                      active
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                    }`}
                  >
                    <t.Icon size={13} className={active ? "text-blue-600" : "text-zinc-400"} />
                    {t.label}
                    {state && <StatePill state={state} />}
                    {shared && (t.id === "landing" || t.id === "success") && (
                      <span className="rounded-full bg-zinc-200/70 px-1.5 py-[1px] text-[9.5px] font-semibold uppercase tracking-wide text-zinc-600">
                        Shared
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {showTabs && top === "message" && !flow && (
              <div className="ml-auto flex rounded-lg bg-zinc-100 p-0.5">
                {[
                  { id: "text" as const, Icon: MessageSquare, label: "Text" },
                  { id: "email" as const, Icon: Mail, label: "Email" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    aria-pressed={channelTab === t.id}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                      channelTab === t.id
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <t.Icon size={13} /> {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {shared && top !== "message" && (
            <p className="flex items-center gap-1.5 border-t border-zinc-100 bg-zinc-50/70 px-4 py-2 text-[11.5px] text-zinc-600">
              <Link2 size={12} className="shrink-0 text-zinc-400" />
              This {top === "landing" ? "landing" : "success"} page is shared — the same page is
              used for both the email and the text in this step.
            </p>
          )}
        </header>

        {/* Two columns */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="min-h-0 overflow-y-auto border-r border-zinc-200">
            {top === "message" && draft.delay && (
              <section className="border-b border-zinc-100 p-4">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Send timing
                </p>
                <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-2">
                  <Field label="Wait">
                    <input
                      type="number"
                      min={1}
                      aria-label="Delay amount"
                      value={draft.delay.value}
                      onChange={(e) =>
                        onChange({
                          delay: {
                            ...draft.delay!,
                            value: Math.max(1, Number(e.target.value) || 1),
                          },
                        })
                      }
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-[13px] leading-[38px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    />
                  </Field>
                  <Field label="Unit">
                    <Select
                      value={draft.delay.unit}
                      options={DELAY_UNITS}
                      ariaLabel="Delay unit"
                      onChange={(unit) => onChange({ delay: { ...draft.delay!, unit } })}
                    />
                  </Field>
                </div>
              </section>
            )}

            {top === "message" && channelTab === "text" && (
              <section className="space-y-4 p-4">
                <Field label="Text message" hint={`${draft.message.length} chars`}>
                  <TagTextArea
                    value={draft.message}
                    onChange={(v) => onChange({ message: v })}
                    tags={mergeTags}
                    minHeight={150}
                    placeholder="Write your text message…"
                  />
                </Field>
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Merge tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mergeTags.map((t) => (
                      <button
                        key={t.token}
                        onClick={() => onChange({ message: `${draft.message} ${t.token}`.trim() })}
                        className={`px-2 py-1 text-[11.5px] font-semibold transition-colors ${t.chip}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                {mediaSlot && (
                  <div className="border-t border-zinc-100 pt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Image
                    </p>
                    {mediaSlot}
                  </div>
                )}
              </section>
            )}

            {top === "message" && channelTab === "email" && (
              <section className="space-y-4 p-4">
                <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3">
                  {templateReady ? (
                    <ScaledEmail campaign={previewCampaign} width={72} height={54} />
                  ) : (
                    <span className="grid size-[54px] w-[72px] place-items-center bg-zinc-100 text-zinc-400">
                      <LayoutTemplate size={18} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-zinc-900">
                      {templateName ?? "No design selected"}
                    </p>
                    <p className="text-[11.5px] text-zinc-500">Email design</p>
                  </div>
                  <button
                    onClick={onChooseTemplate}
                    className="h-9 shrink-0 border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
                  >
                    {templateReady ? "Change" : "Choose"}
                  </button>
                </div>

                <Field label="Subject line">
                  <TextInput value={draft.subject} onChange={(v) => onChange({ subject: v })} />
                </Field>
                <Field label="Pre-header">
                  <TextInput value={draft.preheader} onChange={(v) => onChange({ preheader: v })} />
                </Field>
                <div className="h-px bg-zinc-100" />
                <Field label="Header">
                  <TextInput value={draft.heading} onChange={(v) => onChange({ heading: v })} />
                </Field>
                <Field label="Email body">
                  <TextArea rows={7} value={draft.body} onChange={(v) => onChange({ body: v })} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Button label">
                    <TextInput
                      value={draft.ctaLabel}
                      onChange={(v) => onChange({ ctaLabel: v })}
                    />
                  </Field>
                  <Field label="Button link">
                    <TextInput value={draft.ctaUrl} onChange={(v) => onChange({ ctaUrl: v })} />
                  </Field>
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Merge tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mergeTags.map((t) => (
                      <button
                        key={t.token}
                        onClick={() => onChange({ body: `${draft.body} ${t.token}`.trim() })}
                        className={`px-2 py-1 text-[11.5px] font-semibold transition-colors ${t.chip}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {top !== "message" && (
              <PageEditor
                kind={top}
                shared={shared}
                page={top === "landing" ? draft.landing : draft.success}
                onChange={(patch) =>
                  onChange(
                    top === "landing"
                      ? { landing: { ...draft.landing, ...patch } }
                      : { success: { ...draft.success, ...patch } },
                  )
                }
              />
            )}
          </div>

          {/* Live preview */}
          <div
            className="flex min-h-0 flex-col overflow-hidden"
            style={{ background: channelTab === "email" && mode === "dark" ? "#141518" : "#f4f4f5" }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/70 px-4 py-2 backdrop-blur">
              <p className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-wider text-zinc-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Preview · {title}
              </p>
              {(stageShown !== "message" || channelTab === "email") && (
                <div className="flex bg-zinc-100 p-0.5">
                  {[
                    { id: "desktop" as const, Icon: Monitor },
                    { id: "mobile" as const, Icon: Smartphone },
                    ...(stageShown === "message"
                      ? [{ id: "dark" as const, Icon: Moon }]
                      : []),
                  ].map(({ id, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setMode(id)}
                      aria-pressed={mode === id}
                      aria-label={id}
                      className={`px-2.5 py-1 transition-colors ${
                        mode === id
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {flow && (
              <div className="flex shrink-0 items-center justify-center gap-1.5 border-b border-zinc-200 bg-white px-4 py-2">
                {([
                  { id: "message", label: "1 · Message" },
                  { id: "landing", label: "2 · Landing" },
                  { id: "success", label: "3 · Success" },
                ] as const).map((st, i) => (
                  <div key={st.id} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-[11px] text-zinc-300">→</span>}
                    <button
                      onClick={() => setFlowStage(st.id)}
                      aria-pressed={flowStage === st.id}
                      className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                        flowStage === st.id
                          ? "bg-blue-600 text-white"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {st.label}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {stageShown !== "message" ? (
                <div className="flex justify-center">
                  <PagePreview
                    kind={stageShown}
                    page={stageShown === "landing" ? draft.landing : draft.success}
                    brand={brand}
                    width={mode === "mobile" ? 360 : 640}
                  />
                </div>
              ) : channelTab === "text" ? (
                <div className="flex justify-center">
                  <SmsPreview
                    message={draft.message}
                    imageUrl={media ?? null}
                    sender={sender}
                    scale={0.8}
                  />
                </div>
              ) : mode === "mobile" ? (
                <div className="flex justify-center">
                  <PhoneMockup scale={0.78}>
                    <EmailPreview campaign={previewCampaign} interactive={false} width={373} />
                  </PhoneMockup>
                </div>
              ) : (
                <div className="flex justify-center">
                  <EmailPreview
                    campaign={previewCampaign}
                    interactive={false}
                    width={600}
                    dark={mode === "dark"}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-zinc-200 px-4 py-3">
          <button
            onClick={() => {
              setFlow((f) => !f);
              setFlowStage("message");
              setMode(mode === "dark" ? "desktop" : mode);
            }}
            aria-pressed={flow}
            className={`mr-auto h-10 rounded-lg border px-4 text-[13px] font-medium transition-colors ${
              flow
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-zinc-300 text-zinc-800 hover:bg-zinc-50"
            }`}
          >
            {flow ? "Exit experience preview" : "Preview experience"}
          </button>
          <button
            onClick={onCancel}
            className="h-10 rounded-lg border border-zinc-300 px-5 text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}
