import {
  ArrowRight,
  BedDouble,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Flower2,
  Gift,
  Star,
} from "lucide-react";
import { PhoneMockup } from "@/components/editor/PhoneMockup";
import { renderTokens } from "@/lib/campaign";
import { getTemplate, type EmailTemplate } from "@/lib/emailTemplates";
import { DEFAULT_STAY, HOTEL, offerView } from "@/lib/offers";
import type { LandingField, Offer, SequenceMessage, Stage } from "@/lib/otaJourney";

const t = (s: string) => renderTokens(s);

const OFFER_ICON: Record<string, typeof BedDouble> = {
  room_upgrade: BedDouble,
  breakfast: Coffee,
  early_checkin: Clock,
  late_checkout: Clock,
  airport_transfer: Car,
  spa_credit: Flower2,
};

export const offerIcon = (id?: string) => OFFER_ICON[id ?? ""] ?? Gift;

/* ------------------------------ offer card ----------------------------- */

/**
 * The guest-facing offer package. One card, used in the landing page, the
 * offer picker grid and the editor thumbnail so they can never drift apart.
 */
export function OfferCard({
  offer,
  showCta = true,
  footnote = "Optional — your reservation is already confirmed.",
}: {
  offer: Offer;
  showCta?: boolean;
  footnote?: string | null;
}) {
  const v = offerView(offer);
  const Icon = offerIcon(offer.catalogId);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="relative h-28">
        <img src={v.image} alt="" loading="lazy" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/75">
            Enhance your upcoming stay
          </p>
          <p className="mt-0.5 text-[14px] font-medium leading-snug text-white">
            Make your upcoming stay even better.
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {v.category}
            </p>
            <p className="truncate text-[14px] font-semibold text-slate-900">{v.title}</p>
          </div>
        </div>

        <p className="text-[12px] leading-relaxed text-slate-500">{t(v.description)}</p>

        {v.upgrade ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-3 py-2.5">
            <span className="min-w-0">
              <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Your room
              </span>
              <span className="block truncate text-[12.5px] text-slate-700">{v.upgrade.from}</span>
            </span>
            <ArrowRight size={14} className="shrink-0 text-blue-600" />
            <span className="min-w-0 text-right">
              <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-blue-600">
                Your upgrade
              </span>
              <span className="block truncate text-[12.5px] font-semibold text-slate-900">
                {v.upgrade.to}
              </span>
            </span>
          </div>
        ) : null}

        {v.benefits.length ? (
          <ul className="space-y-1.5">
            {v.benefits.map((b) => (
              <li key={b} className="flex gap-2 text-[12px] leading-snug text-slate-700">
                <Check size={13} className="mt-0.5 shrink-0 text-blue-600" />
                {b}
              </li>
            ))}
          </ul>
        ) : null}

        {showCta ? (
          <div className="grid h-10 place-items-center rounded-xl bg-blue-700 text-[13px] font-semibold text-white">
            {v.cta}
          </div>
        ) : null}

        {footnote ? (
          <p className="text-center text-[10.5px] leading-snug text-slate-400">{footnote}</p>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------- email -------------------------------- */

function EmailOfferPanel({ offer, tpl }: { offer: Offer; tpl: EmailTemplate }) {
  const v = offerView(offer);
  const Icon = offerIcon(offer.catalogId);
  return (
    <div
      className="mt-5 overflow-hidden border"
      style={{
        borderColor: tpl.colors.panelBorder,
        borderRadius: tpl.radius,
        background: tpl.colors.card,
      }}
    >
      <p
        className="flex items-center gap-2 border-b px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
        style={{ borderColor: tpl.colors.panelBorder, color: tpl.colors.heading }}
      >
        <Gift size={13} style={{ color: tpl.colors.accent }} /> Waiting for you
      </p>
      <div className="flex gap-3 px-4 py-3.5">
        <span
          className="grid size-9 shrink-0 place-items-center"
          style={{
            background: tpl.colors.panel,
            color: tpl.colors.accent,
            borderRadius: Math.min(tpl.radius, 12),
          }}
        >
          <Icon size={16} />
        </span>
        <span>
          <span
            className="block text-[13.5px] font-semibold"
            style={{ color: tpl.colors.heading }}
          >
            {v.title}
          </span>
          <span className="mt-0.5 block text-[12px] leading-snug" style={{ color: tpl.colors.text }}>
            {t(v.teaser ?? v.description)}
          </span>
        </span>
      </div>
      <p
        className="border-t px-4 py-2.5 text-[11.5px] leading-snug"
        style={{ borderColor: tpl.colors.panelBorder, color: tpl.colors.muted }}
      >
        Claim it on your guest page — one tap, nothing to pay now.
      </p>
    </div>
  );
}

/** The email exactly as the guest receives it, themed by the chosen template. */
export function EmailScreen({
  stage,
  msg,
  templateId,
  width,
}: {
  stage: Stage;
  msg: SequenceMessage;
  templateId?: string | null;
  width?: number;
}) {
  const tpl = getTemplate(templateId);
  const c = tpl.colors;
  const centered = tpl.align === "center";

  return (
    <div style={{ background: c.page, width, fontFamily: tpl.bodyFont }}>
      <div
        className="overflow-hidden"
        style={{ background: c.card, borderRadius: tpl.radius, margin: width ? 12 : 0 }}
      >
        {/* Masthead */}
        {tpl.header === "image" && tpl.image ? (
          <div className="relative h-32">
            <img src={tpl.image} alt="" loading="lazy" className="size-full object-cover" />
            <div className="absolute inset-0" style={{ background: "rgba(6,15,26,0.5)" }} />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-4 text-center">
              <p
                className="text-[17px] leading-tight"
                style={{ fontFamily: tpl.headingFont, color: "#ffffff" }}
              >
                {HOTEL.name}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                {HOTEL.place}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 text-center" style={{ background: c.band }}>
            <p
              className="text-[18px] leading-tight"
              style={{ fontFamily: tpl.headingFont, color: c.bandInk }}
            >
              {HOTEL.name}
            </p>
            <p
              className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: c.bandInk, opacity: 0.75 }}
            >
              {HOTEL.place}
            </p>
          </div>
        )}

        {/* Body */}
        <div className={`px-6 py-6 ${centered ? "text-center" : ""}`}>
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: c.muted }}
          >
            {stage.name}
          </p>
          <h4
            className="mt-2 text-[24px] leading-[1.18]"
            style={{ fontFamily: tpl.headingFont, color: c.heading }}
          >
            {t(msg.email.heading)}
          </h4>
          <div className="mt-3.5 space-y-3">
            {msg.email.body.map((p, i) => (
              <p key={i} className="text-[13px] leading-[1.7]" style={{ color: c.text }}>
                {t(p)}
              </p>
            ))}
          </div>

          {msg.offer.enabled ? <EmailOfferPanel offer={msg.offer} tpl={tpl} /> : null}

          <div className={`mt-5 ${centered ? "flex justify-center" : ""}`}>
            <span
              className="inline-block px-5 py-3 text-[13px] font-semibold"
              style={{
                background: c.button,
                color: c.buttonInk,
                borderRadius: Math.min(tpl.radius, 999),
              }}
            >
              {msg.offer.enabled ? `${msg.email.cta} & claim` : msg.email.cta}
            </span>
          </div>

          <div className="my-5 h-px" style={{ background: c.panelBorder }} />
          <p className="text-[11px] leading-relaxed" style={{ color: c.muted }}>
            You&rsquo;re receiving this because you have a reservation at {HOTEL.name}. Manage your
            preferences or unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- landing ------------------------------- */

function LandingFields({ fields }: { fields: LandingField[] }) {
  return (
    <div className="space-y-2.5">
      {fields.map((f) => (
        <div key={f.id}>
          {f.type === "rating" ? (
            <div className="flex gap-1.5 py-1 text-amber-500">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={22} strokeWidth={1.5} />
              ))}
            </div>
          ) : f.type === "review" ? (
            <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 px-3.5 text-[12.5px] font-medium text-slate-600">
              Post on Google <ArrowRight size={14} />
            </div>
          ) : (
            <div
              className={`flex items-start rounded-xl border border-slate-200 bg-white px-3.5 text-[12.5px] text-slate-400 ${
                f.type === "textarea" ? "h-16 pt-2.5" : "h-11 items-center"
              }`}
            >
              {f.label}
              {f.required ? " *" : ""}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** The landing page the guest opens from the message. */
export function LandingScreen({ msg }: { msg: SequenceMessage }) {
  const stay = msg.landing.stay ?? DEFAULT_STAY;
  const capture = msg.landing.capture !== false;
  const v = offerView(msg.offer);
  const submit = msg.offer.enabled
    ? `${msg.landing.submitLabel} & claim offer`
    : msg.landing.submitLabel;

  return (
    <div className="bg-slate-50 pb-8">
      {/* Hero */}
      <div className="relative h-52">
        <img src={HOTEL.hero} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/25" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
            {HOTEL.name}
          </p>
          <h4 className="mt-1.5 font-serif text-[24px] leading-tight text-white">
            {t(msg.landing.headline)}
          </h4>
          <p className="mt-1.5 text-[13px] leading-snug text-white/85">{t(msg.landing.subtext)}</p>
        </div>
      </div>

      {/* Stay summary */}
      <div className="-mt-6 px-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 rounded-xl bg-white p-4 shadow-sm">
          {stay.map((s) => (
            <div key={s.id}>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {s.label}
              </p>
              <p className="mt-0.5 text-[14px] font-semibold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {msg.offer.enabled ? (
        <div className="mt-3.5 px-4">
          <p className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 py-2.5 text-[12.5px] font-semibold text-slate-800">
            <Gift size={14} className="text-blue-600" /> 1 benefit waiting
          </p>
        </div>
      ) : null}

      {capture ? (
        <div className="mt-5 px-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h5 className="text-[16px] font-semibold leading-snug tracking-tight text-slate-900">
              {msg.landing.sectionTitle ?? "Let's get a few details ready."}
            </h5>
            <span className="shrink-0 text-[11.5px] text-slate-400">Takes under a minute</span>
          </div>
          <LandingFields fields={msg.landing.fields} />
        </div>
      ) : null}

      {msg.offer.enabled ? (
        <div className="mt-6 px-4">
          <div className="border-t border-slate-200 pt-5">
            <p className="text-[15px] font-semibold tracking-tight text-slate-900">Your benefit</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
              Claim it here — added to your reservation instantly, nothing to pay now.
            </p>
            <div className="mt-3">
              <OfferCard offer={msg.offer} showCta={false} footnote={v.validity} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 px-4">
        <div className="grid h-12 place-items-center rounded-xl bg-blue-700 text-[13.5px] font-semibold text-white">
          {submit}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          {msg.offer.enabled
            ? "Unclaimed benefits stay available until your arrival."
            : "Your details are only used to prepare your stay."}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- success ------------------------------- */

export function SuccessScreen({ msg }: { msg: SequenceMessage }) {
  const checks = msg.success.checks?.length
    ? msg.success.checks
    : ["Reservation confirmed", "Guest details saved", "Stay information ready"];

  return (
    <div className="flex min-h-full flex-col justify-center bg-slate-50/60 px-5 py-10">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <Check size={30} strokeWidth={2.5} />
      </span>
      <h4 className="mt-6 text-center font-serif text-[24px] leading-tight text-slate-900">
        {t(msg.success.headline)}
      </h4>
      <p className="mt-2.5 text-center text-[13.5px] leading-relaxed text-slate-500">
        {t(msg.success.message)}
      </p>

      <ul className="mt-6 space-y-2.5">
        {checks.map((c) => (
          <li
            key={c}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5"
          >
            <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
            <span className="text-[13.5px] text-slate-800">{c}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-[12.5px] text-slate-500">
        {msg.success.footnote ?? "We'll be in touch as your stay gets closer."}
      </p>

      <div className="mt-5 grid h-12 place-items-center rounded-xl border border-slate-300 bg-white text-[13.5px] font-semibold text-slate-900">
        {msg.success.cta}
      </div>
    </div>
  );
}

/* --------------------------------- sms --------------------------------- */

export function textSegments(body: string) {
  const chars = body.length;
  return { chars, segments: Math.max(1, Math.ceil(chars / 160)) };
}

/** Everything the guest actually receives in the text, as one string. */
export function fullTextBody(msg: SequenceMessage) {
  const v = offerView(msg.offer);
  const parts = [t(msg.text)];
  if (msg.offer.enabled) parts.push(`${v.title} waiting for you — claim it here:`);
  parts.push(`${msg.textLinkLabel ?? "Open your guest page"}: directful.co/stay`);
  return parts.join("\n\n");
}

export function SmsScreen({ msg, scale = 0.78 }: { msg: SequenceMessage; scale?: number }) {
  const v = offerView(msg.offer);
  const Icon = offerIcon(msg.offer.catalogId);
  const meta = textSegments(fullTextBody(msg));

  return (
    <PhoneMockup
      scale={scale}
      contentClassName="bg-slate-50"
      chrome={
        <div className="relative z-20 shrink-0 border-b border-slate-200/70 bg-white/85 py-2 text-center backdrop-blur">
          <p className="text-[12px] font-medium text-slate-700">{HOTEL.short} · SMS</p>
        </div>
      }
    >
      <div className="space-y-2.5 px-3.5 py-4">
        <div className="max-w-[88%] space-y-2.5 rounded-[1.35rem] rounded-bl-md bg-white px-3.5 py-3 shadow-sm">
          <p className="whitespace-pre-wrap text-[13.5px] leading-[1.45] text-slate-900">
            {t(msg.text)}
          </p>

          {msg.offer.enabled ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600">
                <Icon size={15} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold text-slate-900">{v.title}</span>
                <span className="block truncate text-[11.5px] text-slate-500">
                  {t(v.teaser ?? v.description)}
                </span>
              </span>
            </div>
          ) : null}

          <p className="text-[13.5px] leading-[1.45] text-slate-900">
            {msg.textLinkLabel ?? "Open your guest page"}:{" "}
            <span className="text-blue-600 underline">directful.co/stay</span>
          </p>
        </div>

        <div className="ml-auto w-fit max-w-[70%] rounded-[1.35rem] rounded-br-md bg-blue-600 px-3.5 py-2.5">
          <p className="text-[13.5px] leading-[1.35] text-white">Thanks! Doing it now.</p>
        </div>

        <p className="pt-1 text-center text-[10.5px] leading-snug text-slate-400">
          {meta.chars} characters · {meta.segments} segment{meta.segments > 1 ? "s" : ""} · link
          opens the guest page
        </p>
      </div>
    </PhoneMockup>
  );
}
