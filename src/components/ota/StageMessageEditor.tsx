import { useMemo, useState } from "react";
import { Eye, Gift, LayoutTemplate, Monitor, Plus, Smartphone, Star, Trash2 } from "lucide-react";
import { PhoneMockup } from "@/components/editor/PhoneMockup";
import { Select } from "@/components/editor/Select";

import { Field, TextArea, TextInput } from "@/components/editor/controls";
import {
  EmailScreen,
  LandingScreen,
  OfferCard,
  SmsScreen,
  SuccessScreen,
  fullTextBody,
  offerIcon,
  textSegments,
} from "@/components/ota/GuestScreens";
import { OfferPicker, TemplateGallery } from "@/components/ota/OfferPicker";
import { createStructuredCampaign, type Campaign } from "@/lib/campaign";
import { getTemplate } from "@/lib/emailTemplates";
import { DEFAULT_STAY, offerView } from "@/lib/offers";
import type { LandingField, Offer, SequenceMessage, Stage } from "@/lib/otaJourney";

export type Panel = "email" | "text" | "landing" | "success";
export type PreviewDevice = "desktop" | "mobile";

export const PANELS: [Panel, string][] = [
  ["email", "Email"],
  ["text", "Text"],
  ["landing", "Landing"],
  ["success", "Success"],
];

/** Only the screens this message actually has — stage and channel aware. */
export function panelsFor(msg: SequenceMessage): [Panel, string][] {
  return PANELS.filter(([id]) =>
    id === "email"
      ? msg.channel === "email" || msg.channel === "both"
      : id === "text"
        ? msg.channel === "text" || msg.channel === "both"
        : true,
  );
}

export function previewCampaign(stage: Stage, msg: SequenceMessage): Campaign {
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

export function landingLabel(msg: SequenceMessage) {
  return msg.offer.enabled
    ? `${msg.landing.submitLabel} & claim offer`
    : msg.landing.submitLabel;
}

/** Guest-facing rendering of the landing form fields, shared by every preview. */
export function LandingFieldsPreview({ fields }: { fields: LandingField[] }) {
  return (
    <div className="space-y-3 pt-1">
      {fields.map((f) => (
        <div key={f.id}>
          <p className="mb-1 text-[11.5px] font-medium text-slate-600">
            {f.label}
            {f.required ? <span className="text-rose-500"> *</span> : null}
          </p>
          {f.type === "rating" ? (
            <div className="flex gap-1.5 text-amber-500">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={24} strokeWidth={1.5} />
              ))}
            </div>
          ) : f.type === "review" ? (
            <div className="flex h-9 items-center justify-between rounded-lg border border-slate-300 px-3 text-[11.5px] font-medium text-slate-600">
              Post on Google <span aria-hidden>→</span>
            </div>
          ) : (
            <div
              className={`rounded-lg border border-slate-300 bg-slate-50 ${
                f.type === "textarea" ? "h-16" : "h-9"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** Explains which guests receive the message being edited. */
export function BranchBanner({ msg }: { msg: SequenceMessage }) {
  const b = msg.branch;
  if (!b) return null;
  const tone =
    b.tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : b.tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <div className={`rounded-xl border px-4 py-3 ${tone}`}>
      <p className="text-[13px] font-semibold">
        {b.label} <span className="font-medium opacity-70">· {b.range}</span>
      </p>
      <p className="mt-0.5 text-[12px] leading-snug opacity-80">{b.note}</p>
    </div>
  );
}

export function PanelTabs({
  panel,
  onChange,
  panels = PANELS,
}: {
  panel: Panel;
  onChange: (p: Panel) => void;
  panels?: [Panel, string][];
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {panels.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={panel === id}
          className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
            panel === id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {label}
        </button>
      ))}
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
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">{title}</h3>
        {hint ? <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{hint}</p> : null}
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

/** The guest-facing screens, rendered inside phone / desktop frames. */
export function StageScreens({
  stage,
  msg,
  panel,
  device,
}: {
  stage: Stage;
  msg: SequenceMessage;
  panel: Panel;
  device: PreviewDevice;
}) {
  const hasEmail = msg.channel === "email" || msg.channel === "both";
  const view = panel === "email" && !hasEmail ? "text" : panel;

  if (view === "text") return <SmsScreen msg={msg} />;

  if (view === "email") {
    return device === "mobile" ? (
      <PhoneScreen>
        <EmailScreen stage={stage} msg={msg} templateId={msg.templateId} width={373} />
      </PhoneScreen>
    ) : (
      <div className="w-full max-w-[460px] overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <EmailScreen stage={stage} msg={msg} templateId={msg.templateId} />
      </div>
    );
  }

  if (view === "landing") {
    return (
      <PhoneScreen>
        <LandingScreen msg={msg} />
      </PhoneScreen>
    );
  }

  return (
    <PhoneScreen>
      <SuccessScreen msg={msg} />
    </PhoneScreen>
  );
}

function PhoneScreen({ children }: { children: React.ReactNode }) {
  return (
    <PhoneMockup scale={0.78} contentClassName="bg-white">
      {children}
    </PhoneMockup>
  );
}


/** Preview column with its own device toggle. */
export function StagePreviewPane({
  stage,
  msg,
  panel,
  initialDevice = "desktop",
}: {
  stage: Stage;
  msg: SequenceMessage;
  panel: Panel;
  initialDevice?: PreviewDevice;
}) {
  const [device, setDevice] = useState<PreviewDevice>(initialDevice);
  const showEmail = msg.channel === "email" || msg.channel === "both";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          <Eye size={12} /> Live preview
        </p>
        {panel === "email" && showEmail ? (
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {(
              [
                ["desktop", Monitor, "Desktop"],
                ["mobile", Smartphone, "Mobile"],
              ] as [PreviewDevice, typeof Monitor, string][]
            ).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setDevice(id)}
                aria-pressed={device === id}
                aria-label={label}
                className={`grid size-7 place-items-center rounded-lg transition-colors ${
                  device === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-5">
        <StageScreens stage={stage} msg={msg} panel={panel} device={device} />
      </div>
    </div>
  );
}

/* --------------------------- shared editor bits -------------------------- */

/** Compact attached-offer row: add, swap or remove without leaving the editor. */
function OfferRow({
  offer,
  onOpen,
  onRemove,
}: {
  offer: Offer;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const v = offerView(offer);
  const Icon = offerIcon(offer.catalogId);

  if (!offer.enabled) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-slate-900">No offer attached yet</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">
            Add a benefit and it appears in the message and on the landing page.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={14} /> Add offer
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-900">{v.title}</p>
        <p className="truncate text-[11.5px] text-slate-500">
          {v.category} · {v.validity}
        </p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="h-9 shrink-0 rounded-lg border border-slate-200 px-3 text-[12.5px] font-medium text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-700"
      >
        Change
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove offer"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

const TOKENS = [
  "{{guest.first_name}}",
  "{{hotel.name}}",
  "{{arrival_date}}",
  "{{room_type}}",
  "{{booking_link}}",
];

function TokenBank({ onInsert }: { onInsert: (token: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Personalisation
      </p>
      <div className="flex flex-wrap gap-1.5">
        {TOKENS.map((tk) => (
          <button
            key={tk}
            type="button"
            onClick={() => onInsert(tk)}
            className="rounded-lg bg-slate-100 px-2 py-1 text-[11.5px] font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            {tk.replace(/[{}]/g, "")}
          </button>
        ))}
      </div>
    </div>
  );
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "select", label: "Choice" },
  { value: "textarea", label: "Long text" },
  { value: "rating", label: "Rating" },
  { value: "review", label: "Review link" },
] as const;

/**
 * Editor for one sequence message: the screens this message actually has,
 * with the matching live preview beside them.
 */
export function StageMessageEditor({
  stage,
  msg,
  patch,
  initialDevice,
}: {
  stage: Stage;
  msg: SequenceMessage;
  patch: (p: Partial<SequenceMessage>) => void;
  initialDevice?: PreviewDevice;
}) {
  const panels = useMemo(() => panelsFor(msg), [msg]);
  const [panel, setPanel] = useState<Panel>(panels[0]![0]);
  const [picker, setPicker] = useState<null | "offer" | "template">(null);
  const active = panels.some(([id]) => id === panel) ? panel : panels[0]![0];

  const patchOffer = (p: Partial<Offer>) => patch({ offer: { ...msg.offer, ...p } });
  const patchLanding = (p: Partial<SequenceMessage["landing"]>) =>
    patch({ landing: { ...msg.landing, ...p } });
  const patchSuccess = (p: Partial<SequenceMessage["success"]>) =>
    patch({ success: { ...msg.success, ...p } });

  const stay = msg.landing.stay ?? DEFAULT_STAY;
  const tpl = getTemplate(msg.templateId);
  const meta = textSegments(fullTextBody(msg));

  const offerBlock = (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Offer</p>
      <OfferRow
        offer={msg.offer}
        onOpen={() => setPicker("offer")}
        onRemove={() => patchOffer({ enabled: false })}
      />
      {msg.offer.enabled ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Offer title">
            <TextInput value={msg.offer.title} onChange={(v) => patchOffer({ title: v })} />
          </Field>
          <Field label="Offer button">
            <TextInput value={msg.offer.cta} onChange={(v) => patchOffer({ cta: v })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Guest promise">
              <TextArea
                rows={2}
                value={msg.offer.description}
                onChange={(v) => patchOffer({ description: v })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Small print">
              <TextInput value={msg.offer.validity} onChange={(v) => patchOffer({ validity: v })} />
            </Field>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <BranchBanner msg={msg} />
        <PanelTabs panel={active} onChange={setPanel} panels={panels} />

        {active === "email" ? (
          <PanelCard
            title="Email content"
            hint="Tokens like {{guest.first_name}} render live in the preview."
          >
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <LayoutTemplate size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-slate-900">{tpl.name}</p>
                <p className="truncate text-[11.5px] text-slate-500">{tpl.vibe}</p>
              </div>
              <button
                type="button"
                onClick={() => setPicker("template")}
                className="h-9 shrink-0 rounded-lg border border-slate-200 px-3 text-[12.5px] font-medium text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-700"
              >
                Change design
              </button>
            </div>

            <Field label="Timing">
              <TextInput value={msg.timing} onChange={(v) => patch({ timing: v })} />
            </Field>
            <Field label="Channel">
              <Select
                value={msg.channel}
                options={[
                  { value: "email", label: "Email" },
                  { value: "text", label: "Text" },
                  { value: "both", label: "Email + Text" },
                ]}
                onChange={(v) => patch({ channel: v })}
                ariaLabel="Message channel"
              />
            </Field>
            <Field label="Subject line">
              <TextInput
                value={msg.email.subject}
                onChange={(v) => patch({ email: { ...msg.email, subject: v } })}
              />
            </Field>
            <Field label="Preheader">
              <TextInput
                value={msg.email.preheader}
                onChange={(v) => patch({ email: { ...msg.email, preheader: v } })}
              />
            </Field>
            <Field label="Heading">
              <TextInput
                value={msg.email.heading}
                onChange={(v) => patch({ email: { ...msg.email, heading: v } })}
              />
            </Field>
            <Field label="Body" hint="One paragraph per blank line">
              <TextArea
                rows={6}
                value={msg.email.body.join("\n\n")}
                onChange={(v) =>
                  patch({ email: { ...msg.email, body: v.split(/\n{2,}/).filter(Boolean) } })
                }
              />
            </Field>
            <Field label="Button label">
              <TextInput
                value={msg.email.cta}
                onChange={(v) => patch({ email: { ...msg.email, cta: v } })}
              />
            </Field>
            <TokenBank
              onInsert={(tk) =>
                patch({
                  email: {
                    ...msg.email,
                    body: [...msg.email.body.slice(0, -1), `${msg.email.body.at(-1) ?? ""} ${tk}`],
                  },
                })
              }
            />
            {offerBlock}
          </PanelCard>
        ) : null}

        {active === "text" ? (
          <PanelCard title="Text message" hint="Kept short — the link opens the guest page.">
            <Field label="Timing">
              <TextInput value={msg.timing} onChange={(v) => patch({ timing: v })} />
            </Field>
            <Field
              label="Message"
              hint={`${meta.chars} characters · ${meta.segments} segment${
                meta.segments > 1 ? "s" : ""
              }`}
            >
              <TextArea rows={5} value={msg.text} onChange={(v) => patch({ text: v })} />
            </Field>
            <TokenBank onInsert={(tk) => patch({ text: `${msg.text} ${tk}`.trim() })} />
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-[12.5px] font-semibold text-slate-900">Landing link</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">
                Appended to every text as directful.co/stay
              </p>
              <div className="mt-3">
                <Field label="Link label">
                  <TextInput
                    value={msg.textLinkLabel ?? "Open your guest page"}
                    onChange={(v) => patch({ textLinkLabel: v })}
                  />
                </Field>
              </div>
            </div>
            {offerBlock}
          </PanelCard>
        ) : null}

        {active === "landing" ? (
          <>
            <PanelCard title="Page copy" hint="Where the guest lands after tapping the button.">
              <Field label="Headline">
                <TextInput
                  value={msg.landing.headline}
                  onChange={(v) => patchLanding({ headline: v })}
                />
              </Field>
              <Field label="Supporting copy">
                <TextArea
                  rows={2}
                  value={msg.landing.subtext}
                  onChange={(v) => patchLanding({ subtext: v })}
                />
              </Field>
              <Field
                label="Submit button"
                hint={
                  msg.offer.enabled ? `Offer attached — guests see “${landingLabel(msg)}”` : undefined
                }
              >
                <TextInput
                  value={msg.landing.submitLabel}
                  onChange={(v) => patchLanding({ submitLabel: v })}
                />
              </Field>
            </PanelCard>

            <PanelCard title="Stay details" hint="The reservation summary shown above the form.">
              <div className="grid gap-3 sm:grid-cols-2">
                {stay.map((s) => (
                  <Field key={s.id} label={s.label}>
                    <TextInput
                      value={s.value}
                      onChange={(v) =>
                        patchLanding({
                          stay: stay.map((x) => (x.id === s.id ? { ...x, value: v } : x)),
                        })
                      }
                    />
                  </Field>
                ))}
              </div>
            </PanelCard>

            <PanelCard
              title="Guest data captured here"
              hint="Toggle what you ask for — every field shows in the preview."
            >
              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-3">
                <span className="text-[12.5px] font-medium text-slate-800">
                  Show the capture form
                </span>
                <input
                  type="checkbox"
                  checked={msg.landing.capture !== false}
                  onChange={(e) => patchLanding({ capture: e.target.checked })}
                />
              </label>

              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {msg.landing.fields.map((f) => (
                  <li key={f.id} className="space-y-2 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        value={f.label}
                        aria-label="Field label"
                        onChange={(e) =>
                          patchLanding({
                            fields: msg.landing.fields.map((x) =>
                              x.id === f.id ? { ...x, label: e.target.value } : x,
                            ),
                          })
                        }
                        className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 text-[12.5px] text-slate-800 outline-none focus:border-blue-600"
                      />
                      <div className="w-32 shrink-0">
                        <Select
                          value={f.type}
                          options={FIELD_TYPES as unknown as { value: string; label: string }[]}
                          ariaLabel="Field type"
                          onChange={(v) =>
                            patchLanding({
                              fields: msg.landing.fields.map((x) =>
                                x.id === f.id ? { ...x, type: v as LandingField["type"] } : x,
                              ),
                            })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${f.label}`}
                        onClick={() =>
                          patchLanding({ fields: msg.landing.fields.filter((x) => x.id !== f.id) })
                        }
                        className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <label className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={f.required}
                        onChange={(e) =>
                          patchLanding({
                            fields: msg.landing.fields.map((x) =>
                              x.id === f.id ? { ...x, required: e.target.checked } : x,
                            ),
                          })
                        }
                      />
                      Required
                    </label>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() =>
                  patchLanding({
                    fields: [
                      ...msg.landing.fields,
                      {
                        id: `f${Date.now()}`,
                        label: "New field",
                        type: "text",
                        required: false,
                      },
                    ],
                  })
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 text-[12.5px] font-medium text-slate-600 transition-colors hover:border-blue-600 hover:text-blue-700"
              >
                <Plus size={14} /> Add field
              </button>

              {offerBlock}
            </PanelCard>
          </>
        ) : null}

        {active === "success" ? (
          <PanelCard title="Success screen" hint="Shown once the guest submits the form.">
            <Field label="Headline">
              <TextInput
                value={msg.success.headline}
                onChange={(v) => patchSuccess({ headline: v })}
              />
            </Field>
            <Field label="Message">
              <TextArea
                rows={3}
                value={msg.success.message}
                onChange={(v) => patchSuccess({ message: v })}
              />
            </Field>
            <Field label="Confirmed items" hint="One per line — shown as ticks">
              <TextArea
                rows={3}
                value={(
                  msg.success.checks ?? [
                    "Reservation confirmed",
                    "Guest details saved",
                    "Stay information ready",
                  ]
                ).join("\n")}
                onChange={(v) => patchSuccess({ checks: v.split("\n").filter(Boolean) })}
              />
            </Field>
            <Field label="Closing line">
              <TextInput
                value={msg.success.footnote ?? "We'll be in touch as your stay gets closer."}
                onChange={(v) => patchSuccess({ footnote: v })}
              />
            </Field>
            <Field label="Next step button">
              <TextInput value={msg.success.cta} onChange={(v) => patchSuccess({ cta: v })} />
            </Field>
          </PanelCard>
        ) : null}
      </div>

      <StagePreviewPane stage={stage} msg={msg} panel={active} initialDevice={initialDevice} />

      {picker === "offer" ? (
        <OfferPicker
          current={msg.offer.enabled ? msg.offer.catalogId : undefined}
          onPick={(offer) => {
            patch({ offer });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      ) : null}

      {picker === "template" ? (
        <TemplateGallery
          current={msg.templateId}
          onPick={(id) => {
            patch({ templateId: id });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </div>
  );
}

/** Small badge used by callers that show an offer summary inline. */
export function OfferBadge({ offer }: { offer: Offer }) {
  if (!offer.enabled) return null;
  const v = offerView(offer);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1 text-[11.5px] font-semibold text-blue-700">
      <Gift size={12} /> {v.title}
    </span>
  );
}

export { OfferCard };
