import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  MessageSquare,
  Mail,
  Check,
  Repeat,
  Split,
  Pencil,
  GitBranch,
  Trash2,
} from "lucide-react";
import { StructureBuilder } from "./StructureBuilder";
import { SequenceBoard } from "./SequenceBoard";
import { ReadinessPanel } from "./ReadinessPanel";
import { StepOverlay, type StepDraft, type ExperienceTab } from "./StepOverlay";
import {
  experienceAttention,
  defaultLanding,
  defaultSuccess,
  messageState,
  pageState,
} from "@/lib/experience";
import { RuleDialog } from "./RuleDialog";
import { TemplatePicker } from "./TemplatePicker";
import { type TagDef } from "./TagTextArea";
import {
  ChannelCard,
  CHANNEL_LABELS,
  MediaUploader,
  PromoPreviewCard,
  PromotionRail,
  hasEmail,
  hasText,
  type Channel,
} from "./CampaignParts";
import {
  INITIAL_STEP_ID,
  defaultSteps,
  duplicateStep,
  makeFollowUp,
  renumber,
  ruleSentence,
  type ChannelKey,
  type SequenceStep,
  type Rule,
} from "@/lib/sequence";
import { useCampaign } from "@/lib/useCampaign";
import { createCanvasCampaign, uid } from "@/lib/campaign";
import { getTemplate } from "@/lib/templateStore";
import { stripHtml } from "@/lib/richtext";

const STEPS = [
  { id: "preferences", label: "Preferences", hint: "Structure" },
  { id: "sequence", label: "Sequence", hint: "Content" },
  { id: "promotion", label: "Finalize & Promote", hint: "Launch" },
] as const;
type Step = (typeof STEPS)[number]["id"];

const MERGE_TAGS: (TagDef & { chip: string })[] = [
  {
    token: "{{first_name}}",
    label: "firstName",
    tone: "indigo",
    chip: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  },
  {
    token: "{{last_name}}",
    label: "lastName",
    tone: "sky",
    chip: "bg-sky-100 text-sky-700 hover:bg-sky-200",
  },
  {
    token: "{{checkout_date}}",
    label: "checkoutDate",
    tone: "amber",
    chip: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },
  {
    token: "{{hotel}}",
    label: "hotelName",
    tone: "emerald",
    chip: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  {
    token: "{{loyalty_tier}}",
    label: "loyaltyTier",
    tone: "violet",
    chip: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  },
];

function newDraftCampaign() {
  const c = createCanvasCampaign();
  c.meta.name = "Untitled campaign";
  return c;
}

export function CampaignWizard() {
  const { campaign, update } = useCampaign(newDraftCampaign);

  const [nameFocused, setNameFocused] = useState(false);
  const [step, setStep] = useState<Step>("preferences");
  const [channel, setChannel] = useState<Channel | null>(null);

  const [steps, setSteps] = useState<SequenceStep[]>(defaultSteps);
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleOpen, setRuleOpen] = useState(false);

  const [textMedia, setTextMedia] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  /** Which step the template picker is choosing a design for. */
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const [audience, setAudience] = useState("everyone");
  const [startDate, setStartDate] = useState("2026-08-04");
  const [cutOff, setCutOff] = useState(false);
  const [cutOffDate, setCutOffDate] = useState("2026-09-04");

  const [promoOn, setPromoOn] = useState(true);
  const [promoCode, setPromoCode] = useState("DIRECT15");
  const [discount, setDiscount] = useState("15");
  const [minNights, setMinNights] = useState("1");
  const [tagline, setTagline] = useState("The best rate, guaranteed");
  const [validRange, setValidRange] = useState(true);
  const [validFrom, setValidFrom] = useState("2026-08-04");
  const [validTo, setValidTo] = useState("2026-08-20");

  const [openRail, setOpenRail] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });
  const toggleRail = (i: number) => setOpenRail((s) => ({ ...s, [i]: !s[i] }));

  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  /* ---------------- Editing overlay ---------------- */
  const [editing, setEditing] = useState<{ stepId: string; channel: ChannelKey; tab: ExperienceTab } | null>(null);
  const [draft, setDraft] = useState<StepDraft | null>(null);

  const email = hasEmail(channel);
  const text = hasText(channel);

  const guests =
    audience === "everyone"
      ? 1840
      : audience === "past_90"
        ? 412
        : audience === "loyalty"
          ? 268
          : 733;
  const cost = text ? (guests * 0.06).toFixed(2) : "0.00";

  const attention = useMemo(
    () => experienceAttention(steps, { email, text }),
    [steps, email, text],
  );

  const patchStep = (id: string, fn: (s: SequenceStep) => SequenceStep) =>
    setSteps((list) => list.map((s) => (s.id === id ? fn(s) : s)));

  const addFollowUp = () =>
    setSteps((list) => renumber([...list, makeFollowUp(list.length - 1)]));
  const deleteStep = (id: string) =>
    setSteps((list) => renumber(list.filter((s) => s.id !== id || s.kind === "initial")));
  const dupStep = (id: string) =>
    setSteps((list) => {
      const i = list.findIndex((s) => s.id === id);
      if (i < 0) return list;
      const copy = duplicateStep(list[i], i);
      return renumber([...list.slice(0, i + 1), copy, ...list.slice(i + 1)]);
    });

  const openEditor = (stepId: string, ch: ChannelKey, tab: ExperienceTab = "message") => {
    const s = steps.find((x) => x.id === stepId);
    if (!s) return;
    const cfg = s[ch];
    const isInitial = s.kind === "initial";
    setDraft({
      message:
        cfg.message ||
        (isInitial
          ? "{{first_name}}! It's been a while since you stayed on {{checkout_date}} at {{hotel}}. Find the best hidden rates for your next trip."
          : ""),
      subject: cfg.subject || (isInitial ? stripHtml(campaign.meta.subject) : ""),
      preheader: campaign.meta.preheader,
      heading: cfg.heading || (isInitial ? stripHtml(campaign.body.heading) : ""),
      body:
        cfg.body ||
        (isInitial ? campaign.body.paragraphs.map((p) => stripHtml(p.text)).join("\n\n") : ""),
      ctaLabel: campaign.cta.label,
      ctaUrl: campaign.cta.url,
      landing: { ...(s.landing ?? defaultLanding()) },
      success: { ...(s.success ?? defaultSuccess()) },
      ...(s.kind === "followup" ? { delay: { ...s.delay } } : {}),
    });
    setEditing({ stepId, channel: ch, tab });
  };

  const saveStep = () => {
    if (!draft || !editing) return;
    const { stepId, channel: ch } = editing;
    patchStep(stepId, (s) => ({
      ...s,
      delay: draft.delay ?? s.delay,
      landing: draft.landing,
      success: draft.success,
      [ch]: {
        ...s[ch],
        configured: true,
        subject: draft.subject,
        heading: draft.heading,
        body: draft.body,
        message: draft.message,
      },
    }));
    if (stepId === INITIAL_STEP_ID && ch === "email") {
      update((d) => {
        d.meta.subject = draft.subject;
        d.meta.preheader = draft.preheader;
        d.body.heading = draft.heading;
        d.body.paragraphs = draft.body
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((t) => ({ id: uid(), text: t }));
        d.cta.label = draft.ctaLabel;
        d.cta.url = draft.ctaUrl;
      });
    }
    setEditing(null);
    setDraft(null);
    notify("Message saved");
  };

  /** Live preview campaign derived from the open draft. */
  const previewCampaign =
    draft !== null
      ? {
          ...campaign,
          meta: { ...campaign.meta, subject: draft.subject, preheader: draft.preheader },
          body: {
            ...campaign.body,
            heading: draft.heading,
            paragraphs: draft.body
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((t, i) => ({ id: `d${i}`, text: t })),
          },
          cta: { ...campaign.cta, label: draft.ctaLabel, url: draft.ctaUrl },
        }
      : campaign;

  const editingStep = steps.find((s) => s.id === editing?.stepId);
  const editingTemplateId = editing ? (editingStep?.[editing.channel].templateId ?? null) : null;

  const openPicker = (stepId: string, ch: ChannelKey) => {
    if (ch === "text") return openEditor(stepId, "text");
    setPickerFor(stepId);
    setPicker(true);
  };

  const reviewFirstMissing = () => {
    const first = attention[0];
    if (!first) return;
    setStep("sequence");
    setTimeout(
      () =>
        document
          .getElementById(`step-${first.step.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      60,
    );
  };

  const checks = [
    { label: "Audience selected", ok: Boolean(audience) },
    { label: "Channel strategy configured", ok: channel !== null },
    { label: "Sequence structure configured", ok: steps.length > 0 },
    ...(email
      ? [{ label: "Email content configured", ok: steps.every((s) => s.email.configured) }]
      : []),
    ...(text
      ? [{ label: "Text content configured", ok: steps.every((s) => s.text.configured) }]
      : []),
    { label: "Timing configured", ok: true },
  ];
  const launchReady = attention.length === 0 && channel !== null;

  /* ---------------- Minimised chip ---------------- */
  if (minimized) {
    return (
      <div className="grid min-h-dvh place-items-end bg-zinc-900/70 p-4 font-sans">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-2xl">
          <Pencil size={15} className="text-zinc-400" />
          <div className="flex flex-col">
            <input
              value={campaign.meta.name}
              aria-label="Campaign name"
              onChange={(e) => update((d) => void (d.meta.name = e.target.value))}
              className="w-56 px-1.5 py-0.5 text-[13px] font-semibold text-zinc-900 outline-none hover:bg-zinc-100 focus:bg-zinc-100"
            />
            <span className="px-1.5 text-[11.5px] text-zinc-500">
              {channel ? CHANNEL_LABELS[channel] : "Channel not set"} · minimised
            </span>
          </div>
          <button
            onClick={() => setMinimized(false)}
            aria-label="Resume editor"
            className="grid size-9 place-items-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  const chromeBtn =
    "grid size-8 place-items-center text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30";
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const canLeavePreferences = channel !== null;

  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden bg-zinc-900/70 font-sans text-zinc-900 ${
        expanded ? "p-0" : "p-0 md:p-5"
      }`}
    >
      <div
        role="dialog"
        aria-label="Create campaign"
        className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-50 shadow-2xl ${
          expanded ? "" : "md:rounded-2xl md:border md:border-zinc-300"
        } ${editing ? "blur-[2px]" : ""}`}
      >
        {/* Chrome */}
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-200 bg-white px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <label className="group flex min-w-0 items-center gap-1.5 border border-transparent px-1 transition-colors focus-within:border-blue-600 hover:border-zinc-200">
              <input
                value={campaign.meta.name}
                aria-label="Campaign name — click to rename"
                placeholder="Untitled campaign"
                onFocus={(e) => {
                  setNameFocused(true);
                  e.currentTarget.select();
                }}
                onBlur={(e) => {
                  setNameFocused(false);
                  if (!e.target.value.trim())
                    update((d) => void (d.meta.name = "Untitled campaign"));
                }}
                onChange={(e) => update((d) => void (d.meta.name = e.target.value))}
                className="min-w-0 max-w-[20rem] flex-1 truncate bg-transparent px-1 py-1.5 text-[14px] font-semibold outline-none"
              />
              <Pencil
                size={13}
                aria-hidden
                className={`shrink-0 transition-opacity ${
                  nameFocused ? "text-blue-600" : "text-zinc-400 opacity-60 group-hover:opacity-100"
                }`}
              />
            </label>
            {channel && (
              <span className="hidden shrink-0 items-center gap-1.5 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 sm:flex">
                {channel === "email" ? (
                  <Mail size={12} />
                ) : channel === "text" ? (
                  <MessageSquare size={12} />
                ) : channel === "both" ? (
                  <Repeat size={12} />
                ) : (
                  <Split size={12} />
                )}
                {CHANNEL_LABELS[channel]}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => notify("Draft saved")}
              className="mr-1 hidden h-8 items-center rounded-lg border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:flex"
            >
              Save changes
            </button>
            <button className={chromeBtn} onClick={() => setMinimized(true)} aria-label="Minimise">
              <Minus size={16} />
            </button>
            <button
              className={chromeBtn}
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Exit full view" : "Full view"}
            >
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <Link to="/" className={chromeBtn} aria-label="Close campaign setup">
              <X size={17} />
            </Link>
          </div>
        </header>

        {/* Step rail */}
        <nav
          aria-label="Campaign steps"
          className="shrink-0 border-b border-zinc-200 bg-white px-3 sm:px-4"
        >
          <ol className="mx-auto flex max-w-4xl items-stretch">
            {STEPS.map((s, i) => {
              const locked = s.id !== "preferences" && !canLeavePreferences;
              const done = i < stepIndex;
              const current = step === s.id;
              return (
                <li key={s.id} className="flex min-w-0 flex-1">
                  <button
                    disabled={locked}
                    onClick={() => setStep(s.id)}
                    aria-current={current ? "step" : undefined}
                    className={`group flex min-w-0 flex-1 items-center gap-2.5 border-b-2 px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      current
                        ? "border-blue-600"
                        : done
                          ? "border-blue-200"
                          : "border-transparent"
                    }`}
                  >
                    <span
                      className={`grid size-[20px] shrink-0 place-items-center text-[10.5px] font-semibold transition-colors ${
                        current
                          ? "bg-blue-600 text-white"
                          : done
                            ? "bg-blue-50 text-blue-700"
                            : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {done ? <Check size={11} /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-[12.5px] font-semibold ${
                          current ? "text-zinc-900" : "text-zinc-500"
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="hidden truncate text-[10.5px] text-zinc-400 sm:block">
                        {s.hint}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ---------------- Step bodies ---------------- */}
        {step === "preferences" && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-5 py-9">
              <h1 className="text-[18px] font-semibold tracking-tight">Select channel strategy</h1>
              <p className="mt-1 text-[12.5px] text-zinc-500">
                Choose how this campaign reaches your guests. You can change it at any time.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ChannelCard
                  active={channel === "email"}
                  Icon={Mail}
                  title="Email Only"
                  body="Rich, branded email to opted-in guests."
                  onClick={() => setChannel("email")}
                  onRemove={() => setChannel(null)}
                />
                <ChannelCard
                  active={channel === "text"}
                  Icon={MessageSquare}
                  title="Text Only"
                  body="Short text with a tracked link."
                  onClick={() => setChannel("text")}
                  onRemove={() => setChannel(null)}
                />
                <ChannelCard
                  active={channel === "both"}
                  Icon={Repeat}
                  title="Text + Email Together"
                  body="Both channels fire in the same step."
                  onClick={() => setChannel("both")}
                  onRemove={() => setChannel(null)}
                />
                <ChannelCard
                  active={channel === "text_fallback"}
                  Icon={Split}
                  title="Text with Email Fallback"
                  body="Try text first, email guests without a phone."
                  onClick={() => setChannel("text_fallback")}
                  onRemove={() => setChannel(null)}
                />
              </div>

              {!channel && (
                <div className="mt-10 rounded-xl border border-dashed border-zinc-200 bg-white/60 px-6 py-10 text-center">
                  <p className="text-[13px] font-medium text-zinc-700">
                    Pick a channel strategy to start building
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-zinc-500">
                    Your sequence builder appears here once you choose how this campaign reaches
                    guests. Nothing is sent until you launch.
                  </p>
                </div>
              )}

              {channel && (

                <section className="mt-10 border-t border-zinc-200 pt-8">
                  <h2 className="text-[16px] font-semibold tracking-tight">Build your sequence</h2>
                  <p className="mt-1 text-[12.5px] text-zinc-500">
                    Set up the structure of your campaign. You&rsquo;ll configure your message
                    content in the next step.
                  </p>
                  <div className="mt-6">
                    <StructureBuilder
                      steps={steps}
                      email={email}
                      text={text}
                      onAdd={addFollowUp}
                      onDuplicate={dupStep}
                      onDelete={deleteStep}
                      onDelay={(id, d) => patchStep(id, (s) => ({ ...s, delay: d }))}
                      onConfigure={() => setStep("sequence")}
                    />
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {step === "sequence" && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SequenceBoard
              steps={steps}
              email={email}
              text={text}
              channelLabel={channel ? CHANNEL_LABELS[channel] : "Not set"}
              onChangeStrategy={() => setStep("preferences")}
              attention={attention}
              onReview={reviewFirstMissing}
              onTemplate={openPicker}
              onEdit={openEditor}
              onDelay={(id, d) => patchStep(id, (s) => ({ ...s, delay: d }))}
              onDuplicate={dupStep}
              onDelete={deleteStep}
              onAdd={addFollowUp}
            />

            <div className="mx-auto w-full max-w-2xl px-5 pb-10">
              <div className="border-t border-zinc-200 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-900">Automation rules</p>
                    <p className="mt-0.5 text-[11.5px] text-zinc-500">
                      Optional logic, e.g. stop the campaign once a guest books.
                    </p>
                  </div>
                  <button
                    onClick={() => setRuleOpen(true)}
                    className="flex h-8 shrink-0 items-center gap-1.5 border border-zinc-200 bg-white px-3 text-[11.5px] font-medium text-zinc-700 transition-colors hover:border-blue-600 hover:text-blue-700"
                  >
                    <GitBranch size={13} /> Add rule
                  </button>
                </div>
                {rules.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {rules.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5"
                      >
                        <span className="text-[12.5px] font-medium text-zinc-700">
                          {ruleSentence(r)}
                        </span>
                        <button
                          onClick={() => setRules((s) => s.filter((x) => x.id !== r.id))}
                          aria-label="Remove rule"
                          className="grid size-7 place-items-center text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {step === "promotion" && (
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[26rem_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col overflow-hidden border-r border-zinc-200 bg-white">
              <div className="shrink-0 border-b border-zinc-100 px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Finalize &amp; promote
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <PromotionRail
                  promoOn={promoOn}
                  setPromoOn={setPromoOn}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  minNights={minNights}
                  setMinNights={setMinNights}
                  discount={discount}
                  setDiscount={setDiscount}
                  tagline={tagline}
                  setTagline={setTagline}
                  validRange={validRange}
                  setValidRange={setValidRange}
                  validFrom={validFrom}
                  setValidFrom={setValidFrom}
                  validTo={validTo}
                  setValidTo={setValidTo}
                  audience={audience}
                  setAudience={setAudience}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  cutOff={cutOff}
                  setCutOff={setCutOff}
                  cutOffDate={cutOffDate}
                  setCutOffDate={setCutOffDate}
                  guests={guests}
                  cost={cost}
                  channel={channel}
                  openRail={openRail}
                  toggle={toggleRail}
                />
              </div>
            </aside>
            <section className="hidden min-h-0 flex-col overflow-y-auto p-6 lg:flex">
              <div className="mx-auto w-full max-w-lg space-y-6">
                <ReadinessPanel checks={checks} missing={attention} onReview={reviewFirstMissing} />
                <PromoPreviewCard
                  accent={campaign.theme.accent}
                  hotel={campaign.footer.company || campaign.header.logoText}
                  firstName="Liyat"
                  tagline={tagline}
                  discount={discount}
                  enabled={promoOn}
                />
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3">
          <p className="truncate text-[12px] text-zinc-500">
            {step === "preferences"
              ? channel
                ? "Build the structure — content comes next."
                : "Select how the campaign communicates to continue."
              : step === "sequence"
                ? attention.length > 0
                  ? `${attention.length} experience element${attention.length > 1 ? "s" : ""} still need${attention.length > 1 ? "" : "s"} content.`
                  : "All messages are ready."
                : launchReady
                  ? "Everything checks out — you're ready to launch."
                  : "Resolve the outstanding messages before launching."}
          </p>
          <div className="flex items-center gap-2.5">
            {stepIndex > 0 && (
              <button
                onClick={() => setStep(STEPS[stepIndex - 1].id)}
                className="h-10 rounded-lg border border-zinc-200 px-5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Back
              </button>
            )}
            <button
              disabled={
                (step === "preferences" && !canLeavePreferences) ||
                (stepIndex === STEPS.length - 1 && !launchReady)
              }
              onClick={() => {
                if (stepIndex === STEPS.length - 1) return notify("Campaign scheduled");
                setStep(STEPS[stepIndex + 1].id);
              }}
              className="h-10 bg-blue-600 px-6 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stepIndex === STEPS.length - 1 ? "Launch campaign" : "Next"}
            </button>
          </div>
        </footer>
      </div>

      {editing && draft && (
        <StepOverlay
          title={`${editingStep?.name ?? ""} · ${editing.channel === "email" ? "Email" : "Text"}`}
          text={editing.channel === "text"}
          email={editing.channel === "email"}
          draft={draft}
          onChange={(patch) => setDraft((d) => (d ? { ...d, ...patch } : d))}
          onSave={saveStep}
          onCancel={() => {
            setEditing(null);
            setDraft(null);
          }}
          previewCampaign={previewCampaign}
          sender={campaign.footer.company || campaign.header.logoText}
          templateName={getTemplate(editingTemplateId)?.name ?? null}
          templateReady={editing.channel === "email" && editingTemplateId !== null}
          onChooseTemplate={() => {
            setPickerFor(editing.stepId);
            setPicker(true);
          }}
          mergeTags={MERGE_TAGS}
          media={textMedia}
          shared={email && text}
          strategyLabel={channel ? CHANNEL_LABELS[channel] : "Not set"}
          status={{
            email: editingStep ? messageState(editingStep, "email") : "empty",
            text: editingStep ? messageState(editingStep, "text") : "empty",
            landing: pageState(editingStep?.landing ?? defaultLanding()),
            success: pageState(editingStep?.success ?? defaultSuccess()),
          }}
          initialTab={editing.tab}
          brand={campaign.footer.company || campaign.header.logoText}
          mediaSlot={<MediaUploader value={textMedia} onChange={setTextMedia} />}
        />
      )}

      {ruleOpen && (
        <RuleDialog
          onCancel={() => setRuleOpen(false)}
          onAdd={(r) => {
            setRules((s) => [...s, r]);
            setRuleOpen(false);
            notify("Rule added");
          }}
        />
      )}

      <TemplatePicker
        open={picker}
        currentId={pickerFor ? (steps.find((s) => s.id === pickerFor)?.email.templateId ?? null) : null}
        onClose={() => setPicker(false)}
        onApply={(id, next) => {
          const name = campaign.meta.name;
          update((d) => {
            Object.assign(d, next);
            d.meta.name = name;
          });
          const target = pickerFor ?? INITIAL_STEP_ID;
          patchStep(target, (s) => ({
            ...s,
            email: {
              ...s.email,
              configured: true,
              templateId: id,
              templateName: getTemplate(id)?.name ?? "Template",
              subject: s.email.subject || stripHtml(next.meta.subject),
              heading: s.email.heading || stripHtml(next.body.heading),
              body:
                s.email.body || next.body.paragraphs.map((p) => stripHtml(p.text)).join("\n\n"),
            },
          }));
          setPicker(false);
          setPickerFor(null);
          notify("Template applied");
        }}
      />

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 bg-zinc-900 px-4 py-2 text-[12.5px] font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
