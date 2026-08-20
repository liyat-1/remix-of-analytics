import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { OfferCard, offerIcon } from "@/components/ota/GuestScreens";
import { EMAIL_TEMPLATES, getTemplate } from "@/lib/emailTemplates";
import { GUEST_SEGMENTS, OFFER_CATALOG, offerFromCatalog } from "@/lib/offers";
import type { Offer } from "@/lib/otaJourney";

/** Shared overlay chrome so the pickers sit on the editor consistently. */
function PickerShell({
  title,
  hint,
  onClose,
  toolbar,
  children,
}: {
  title: string;
  hint: string;
  onClose: () => void;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-slate-900/45 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-label={title}
        className="flex max-h-[88vh] w-full max-w-[980px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl duration-150 animate-in fade-in zoom-in-95"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{hint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={17} />
          </button>
        </header>
        {toolbar ? (
          <div className="shrink-0 border-b border-slate-200 px-5 py-3">{toolbar}</div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * Offer selection: the guest-facing card *is* the option, so what the marketer
 * picks is exactly what the guest will see.
 */
export function OfferPicker({
  current,
  onPick,
  onClose,
}: {
  current?: string;
  onPick: (offer: Offer) => void;
  onClose: () => void;
}) {
  const [segment, setSegment] = useState("all");
  const [query, setQuery] = useState("");

  const items = OFFER_CATALOG.filter((o) =>
    query ? `${o.title} ${o.category}`.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <PickerShell
      title="Add an offer"
      hint="Pick a benefit — you'll see it exactly as the guest does."
      onClose={onClose}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
            {GUEST_SEGMENTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSegment(s.id)}
                aria-pressed={segment === s.id}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  segment === s.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <label className="ml-auto flex h-9 min-w-[13rem] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
            <Search size={14} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search offers"
              aria-label="Search offers"
              className="w-full bg-transparent text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const active = item.id === current;
          const Icon = offerIcon(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(offerFromCatalog(item, segment))}
              aria-pressed={active}
              className={`group rounded-xl border-2 bg-white p-1 text-left transition-colors ${
                active ? "border-blue-600" : "border-transparent hover:border-slate-300"
              }`}
            >
              <OfferCard offer={offerFromCatalog(item, segment)} showCta={false} footnote={null} />
              <span className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-slate-500">
                  <Icon size={13} className="shrink-0 text-slate-400" />
                  <span className="truncate">{item.price}</span>
                </span>
                <span
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold ${
                    active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {active ? (
                    <span className="flex items-center gap-1">
                      <Check size={12} /> Attached
                    </span>
                  ) : (
                    "Add"
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </PickerShell>
  );
}

/** Email design gallery — every card is a live thumbnail of the real theme. */
export function TemplateGallery({
  current,
  onPick,
  onClose,
}: {
  current?: string | null;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <PickerShell
      title="Email design"
      hint="Each design changes the masthead, typography and colour of the email."
      onClose={onClose}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EMAIL_TEMPLATES.map((tpl) => {
          const active = tpl.id === getTemplate(current).id;
          const c = tpl.colors;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onPick(tpl.id)}
              aria-pressed={active}
              className={`overflow-hidden rounded-xl border-2 bg-white text-left transition-colors ${
                active ? "border-blue-600" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="p-3" style={{ background: c.page }}>
                <div
                  className="overflow-hidden"
                  style={{ background: c.card, borderRadius: tpl.radius }}
                >
                  {tpl.header === "image" && tpl.image ? (
                    <div className="relative h-16">
                      <img src={tpl.image} alt="" loading="lazy" className="size-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/45" />
                      <p
                        className="absolute inset-x-0 bottom-2 text-center text-[11px] text-white"
                        style={{ fontFamily: tpl.headingFont }}
                      >
                        Wyndham Grand
                      </p>
                    </div>
                  ) : (
                    <div className="h-16 px-3 py-4 text-center" style={{ background: c.band }}>
                      <p
                        className="text-[12px]"
                        style={{ fontFamily: tpl.headingFont, color: c.bandInk }}
                      >
                        Wyndham Grand
                      </p>
                      <p
                        className="mt-1 text-[7px] uppercase tracking-[0.2em]"
                        style={{ color: c.bandInk, opacity: 0.7 }}
                      >
                        Istanbul · Türkiye
                      </p>
                    </div>
                  )}
                  <div
                    className={`space-y-1.5 px-3 py-3 ${tpl.align === "center" ? "text-center" : ""}`}
                  >
                    <p
                      className="text-[13px] leading-tight"
                      style={{ fontFamily: tpl.headingFont, color: c.heading }}
                    >
                      Your stay is confirmed
                    </p>
                    <span className="block h-1 w-full rounded" style={{ background: c.panel }} />
                    <span className="block h-1 w-4/5 rounded" style={{ background: c.panel }} />
                    <span
                      className={`mt-2 inline-block px-3 py-1 text-[8px] font-semibold ${
                        tpl.align === "center" ? "mx-auto" : ""
                      }`}
                      style={{
                        background: c.button,
                        color: c.buttonInk,
                        borderRadius: Math.min(tpl.radius, 999),
                      }}
                    >
                      Confirm details
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between gap-2 border-t border-slate-100 px-3.5 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-slate-900">
                    {tpl.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-slate-400">
                    {tpl.vibe}
                  </span>
                  <span className="mt-1 block text-[11.5px] leading-snug text-slate-500">
                    {tpl.copy}
                  </span>
                </span>
                {active ? (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                    <Check size={12} />
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </PickerShell>
  );
}
