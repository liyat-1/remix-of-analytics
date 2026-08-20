import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  GitBranch,
  Mail,
  MessageSquare,
  Pause,
  Play,
  Tag,
} from "lucide-react";
import { Select } from "@/components/editor/Select";
import { ChannelBadge, SoftBadge, StageIcon } from "@/components/ota/JourneyPieces";
import { StageMessageEditor } from "@/components/ota/StageMessageEditor";
import { CampaignSummary } from "@/components/ota/FeedbackSequenceBoard";
import { createStructuredCampaign, type Campaign } from "@/lib/campaign";
import {
  branchMessages,
  getStage,
  offerHeadlineValue,
  STAGES,
  trunkMessages,
  waitLabel,
  type FeedbackCondition,
  type Offer,
  type SequenceMessage,
  type Stage,
} from "@/lib/otaJourney";

export const Route = createFileRoute("/ota/stage/$stageId")({
  validateSearch: (search: Record<string, unknown>): { preview?: boolean } =>
    search.preview === true || search.preview === "true" ? { preview: true } : {},
  loader: ({ params }) => {
    const stage = getStage(params.stageId);
    if (!stage) throw notFound();
    return { stageId: stage.id };
  },
  head: ({ params }) => {
    const stage = getStage(params.stageId);
    const name = stage?.name ?? "Stage";
    const title = `${name} campaign — OTA Buster · Directful`;
    const description = stage
      ? `${stage.purpose} Edit the ${name.toLowerCase()} message sequence, landing page, success screen and offer.`
      : "Edit an OTA Buster stage campaign: messages, landing page, success screen and offer.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StageWorkspace,
});

/* ----------------------------- preview model ---------------------------- */

function previewCampaign(stage: Stage, msg: SequenceMessage): Campaign {
  const c = createStructuredCampaign();
  c.meta.name = `${stage.name} · ${msg.name}`;
  c.meta.subject = msg.email.subject;
  c.meta.preheader = msg.email.preheader;
  c.header.logoText = "WYNDHAM GRAND";
  c.body.heading = msg.email.heading;
  c.body.paragraphs = msg.email.body.map((text, i) => ({ id: `p${i}`, text }));
  c.cta.label = msg.email.cta;
  c.details.visible = false;
  c.footer.company = "Wyndham Grand Istanbul Levent";
  c.footer.address = "Levent, Istanbul, Türkiye";
  return c;
}

/* -------------------------------- helpers ------------------------------- */

function ConditionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[12.5px] leading-snug">
      <span className="w-24 shrink-0 text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function PanelCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <header className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">{title}</h3>
        {hint ? <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{hint}</p> : null}
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

/* -------------------------------- screen -------------------------------- */

function StageWorkspace() {
  const { stageId } = Route.useParams();
  const { preview } = Route.useSearch();
  const stage = getStage(stageId)!;

  const [messages, setMessages] = useState<SequenceMessage[]>(() =>
    stage.sequence.map((m) => ({ ...m })),
  );
  const [activeId, setActiveId] = useState(stage.sequence[0]!.id);
  const [paused, setPaused] = useState(stage.status === "paused");
  const [pauseOpen, setPauseOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wait, setWait] = useState<FeedbackCondition["wait"]>(
    () => stage.condition?.wait ?? { value: 2, unit: "days" },
  );

  const trunk = trunkMessages(messages);
  const branches = branchMessages(stage, messages);

  const msg = messages.find((m) => m.id === activeId) ?? messages[0]!;
  const campaign = useMemo(() => previewCampaign(stage, msg), [stage, msg]);

  const patch = (p: Partial<SequenceMessage>) =>
    setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, ...p } : m)));

  const patchOffer = (p: Partial<Offer>) => patch({ offer: { ...msg.offer, ...p } });

  const landingSubmitLabel = msg.offer.enabled
    ? msg.offer.cta.trim() || "Complete and claim offer"
    : msg.landing.submitLabel;

  const showText = msg.channel === "text" || msg.channel === "both";
  const showEmail = msg.channel === "email" || msg.channel === "both";

  return (
    <div className="space-y-6">
      {/* Stage header */}
      <header className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <StageIcon stage={stage} />
            <div className="min-w-0">
              <Link
                to="/ota"
                className="-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[11.5px] font-semibold text-blue-700 transition-colors hover:bg-blue-50"
              >
                <ArrowLeft size={12} /> Guest journey
              </Link>
              <h1 className="mt-1 text-[21px] font-semibold tracking-tight text-slate-900">
                {stage.name} campaign
              </h1>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">
                {stage.purpose}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ChannelBadge channel={stage.channel} />
                <SoftBadge>{stage.campaignType}</SoftBadge>
                <SoftBadge tone={paused ? "warn" : "good"}>
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${paused ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                  {paused ? "Paused" : "Active"}
                </SoftBadge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => (paused ? setPaused(false) : setPauseOpen(true))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100"
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
              {paused ? "Resume stage" : "Pause stage"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSaved(true);
                window.setTimeout(() => setSaved(false), 2000);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white shadow-card transition-colors ${saved ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"}`}
            >
              {saved ? <CheckCircle2 size={13} /> : null}
              {saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>

        <dl className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-3">
          <div className="bg-slate-50/70 p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Guests enter when
            </dt>
            <dd className="mt-1 text-[12.5px] leading-snug text-slate-700">
              {stage.transition.startsWhen}
            </dd>
          </div>
          <div className="bg-slate-50/70 p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Who is eligible
            </dt>
            <dd className="mt-1 space-y-1 text-[12.5px] leading-snug text-slate-700">
              {stage.eligibility.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </dd>
          </div>
          <div className="bg-slate-50/70 p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              The stage is complete when
            </dt>
            <dd className="mt-1 space-y-1 text-[12.5px] leading-snug text-slate-700">
              {stage.completion.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </dd>
          </div>
        </dl>
      </header>

      {stage.condition ? <CampaignSummary stage={stage} /> : null}

      <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Sequence list */}
        <aside className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Message sequence
          </p>

          <div className="space-y-2">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <GitBranch size={12} /> Initial
            </p>
            <ol className="space-y-2">
              {trunk.map((m, i) => {
                const active = m.id === msg.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(m.id)}
                      aria-current={active}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-50/70 shadow-card"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="grid size-5 shrink-0 place-items-center rounded-md bg-slate-900 text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="truncate text-[13px] font-semibold text-slate-900">
                          {m.name}
                        </span>
                        {m.channel === "text" ? (
                          <MessageSquare size={12} className="ml-auto text-slate-400" />
                        ) : (
                          <Mail size={12} className="ml-auto text-slate-400" />
                        )}
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-snug text-slate-500">{m.timing}</p>
                      {m.offer.enabled ? (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <Tag size={11} /> {offerHeadlineValue(m.offer)}
                        </p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {branches.length > 0 ? (
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                <Clock size={12} /> Guest feedback
              </p>
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card">
                <p className="text-[11.5px] leading-snug text-slate-500">
                  Wait for feedback, then send the reminder.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    aria-label="Wait amount"
                    value={wait.value}
                    onChange={(e) =>
                      setWait((w) => ({ ...w, value: Math.max(1, Number(e.target.value) || 1) }))
                    }
                    className="h-8 w-14 rounded-lg border border-slate-200 px-2 text-center text-[12px] font-semibold tabular-nums text-slate-900 outline-none focus:border-blue-600"
                  />
                  <div className="min-w-0 flex-1">
                    <Select
                      value={wait.unit}
                      options={[
                        { value: "hours", label: "Hours" },
                        { value: "days", label: "Days" },
                        { value: "weeks", label: "Weeks" },
                      ]}
                      onChange={(v) =>
                        setWait((w) => ({ ...w, unit: v as FeedbackCondition["wait"]["unit"] }))
                      }
                      ariaLabel="Wait unit"
                      size="sm"
                    />
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-medium text-slate-600">
                  <Clock size={11} className="text-slate-400" />
                  Reminder after {waitLabel(wait)}
                </p>
              </div>

              <ol className="space-y-2">
                {branches.map((m) => {
                  const active = m.id === msg.id;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(m.id)}
                        aria-current={active}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? "border-blue-600 bg-blue-50/70 shadow-card"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-bold text-white ${
                              m.branch?.tone === "good"
                                ? "bg-emerald-600"
                                : m.branch?.tone === "warn"
                                  ? "bg-amber-600"
                                  : "bg-slate-600"
                            }`}
                          >
                            {m.branch?.key === "positive"
                              ? "+"
                              : m.branch?.key === "negative"
                                ? "−"
                                : "?"}
                          </span>
                          <span className="truncate text-[13px] font-semibold text-slate-900">
                            {m.name}
                          </span>
                          {m.channel === "text" ? (
                            <MessageSquare size={12} className="ml-auto text-slate-400" />
                          ) : (
                            <Mail size={12} className="ml-auto text-slate-400" />
                          )}
                        </div>
                        <p className="mt-1.5 text-[11.5px] leading-snug text-slate-500">
                          {m.timing}
                        </p>
                        {m.offer.enabled ? (
                          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <Tag size={11} /> {offerHeadlineValue(m.offer)}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          <div className="border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              In plain language
            </p>
            <div className="mt-2 space-y-1.5">
              <ConditionRow label="Send when" value={msg.sendWhen} />
              <ConditionRow label="Stop when" value={msg.stopWhen} />
              <ConditionRow label="Skip when" value={msg.skipWhen} />
            </div>
          </div>
        </aside>

        {/* Editor + preview */}
        <StageMessageEditor stage={stage} msg={msg} patch={patch} />
      </div>

      {/* Other stages */}
      <nav
        aria-label="Other stages"
        className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4"
      >
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Other stages
        </span>
        {STAGES.filter((s) => s.id !== stage.id).map((s) => (
          <Link
            key={s.id}
            to="/ota/stage/$stageId"
            params={{ stageId: s.id }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-card transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
          >
            {s.name}
          </Link>
        ))}
      </nav>

      {pauseOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-label="Pause stage"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <h2 className="text-[16px] font-semibold tracking-tight text-slate-900">
              Pause the {stage.name} stage?
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Guests already in this stage stop receiving its messages. New guests keep entering the
              journey and move on to the next eligible stage. Nothing is deleted — you can resume at
              any time.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPauseOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Keep it running
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaused(true);
                  setPauseOpen(false);
                }}
                className="rounded-lg bg-amber-600 px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-amber-700"
              >
                Pause stage
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
