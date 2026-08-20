import { Sparkles } from "lucide-react";
import { offerHeadlineValue, type Offer } from "@/lib/otaJourney";

/**
 * The offer package as it appears inside an email body — email-safe styling
 * (solid colors, no shadows) so the preview matches what gets sent.
 */
export function EmailOfferBlock({ offer, dark = false }: { offer: Offer; dark?: boolean }) {
  if (!offer.enabled) return null;
  return (
    <div className="px-8 pb-8">
      <div
        className="border p-5"
        style={{
          borderColor: dark ? "#2f3238" : "#d7e3f4",
          background: dark ? "#191b1f" : "#f3f7fd",
        }}
      >
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ background: dark ? "#123227" : "#e3f5ec", color: "#0f7355" }}
        >
          <Sparkles size={11} /> {offerHeadlineValue(offer)}
        </span>
        <p
          className="mt-3 text-[16px] font-semibold leading-snug"
          style={{ color: dark ? "#f4f4f5" : "#18181b" }}
        >
          {offer.title}
        </p>
        <p
          className="mt-1.5 text-[13px] leading-relaxed"
          style={{ color: dark ? "#c8cbd1" : "#52525b" }}
        >
          {offer.description}
        </p>
        <p className="mt-3 text-[11.5px]" style={{ color: dark ? "#9aa0a8" : "#71717a" }}>
          {offer.validity}
        </p>
      </div>
    </div>
  );
}

/** The offer shown beneath the landing content and form. */
export function LandingOffer({ offer }: { offer: Offer }) {
  if (!offer.enabled) return null;
  return (
    <section className="mt-8 border-t border-slate-200 pt-6">
      <p className="text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
        Here&rsquo;s to make your stay even better
      </p>
      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
          <Sparkles size={11} /> {offerHeadlineValue(offer)}
        </span>
        <p className="mt-2.5 text-[14px] font-semibold text-slate-900">{offer.title}</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">{offer.description}</p>
        <p className="mt-2.5 text-[11.5px] text-slate-500">{offer.validity}</p>
      </div>
    </section>
  );
}
